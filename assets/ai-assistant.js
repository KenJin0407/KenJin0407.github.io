export function enableAssistant() {
  const launcher = document.querySelector('#portfolio-chat-launcher');
  const panel = document.querySelector('#portfolio-chat-panel');
  const form = panel.querySelector('form');
  const input = panel.querySelector('input');
  const send = panel.querySelector('.chat-send');
  const log = panel.querySelector('.chat-log');
  const reset = panel.querySelector('.chat-reset');
  const status = panel.querySelector('.chat-status');
  const emojiToggle = panel.querySelector('.chat-emoji-toggle');
  const emojiPicker = panel.querySelector('.chat-emoji-picker');
  const greeting = log.querySelector('.chat-assistant').textContent;
  const history = [];
  panel.dataset.chatVersion = 'regis-ai-1';
  panel.dataset.chatPhase = 'ready';
  let pending = false;
  let selection = { start: 0, end: 0 };

  function updateControls() {
    send.disabled = pending || !input.value.trim();
    reset.disabled = pending;
    panel.querySelectorAll('[data-chat-question]').forEach((button) => {
      button.disabled = pending;
    });
    form.setAttribute('aria-busy', String(pending));
  }
  function setEmojiPicker(open) {
    emojiPicker.hidden = !open;
    emojiToggle.setAttribute('aria-expanded', String(open));
  }
  function rememberSelection() {
    selection = {
      start: input.selectionStart ?? input.value.length,
      end: input.selectionEnd ?? input.value.length,
    };
  }
  input.addEventListener('input', () => {
    rememberSelection();
    updateControls();
  });
  ['select', 'keyup', 'click', 'blur'].forEach((event) =>
    input.addEventListener(event, rememberSelection),
  );
  emojiToggle.addEventListener('click', () => setEmojiPicker(emojiPicker.hidden));
  emojiPicker.querySelectorAll('[data-emoji]').forEach((button) => {
    button.addEventListener('click', () => {
      const emoji = button.dataset.emoji;
      if (input.value.length - (selection.end - selection.start) + emoji.length > input.maxLength) {
        status.textContent = 'Your message can contain up to 800 characters.';
        return;
      }
      input.setRangeText(emoji, selection.start, selection.end, 'end');
      rememberSelection();
      setEmojiPicker(false);
      updateControls();
      input.focus();
    });
  });

  // Keep the composer inside the visible screen when a phone keyboard opens.
  function fitVisibleViewport() {
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    const keyboardOffset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop || 0));
    document.documentElement.style.setProperty('--chat-visible-height', `${height}px`);
    document.documentElement.style.setProperty('--chat-keyboard-offset', `${keyboardOffset}px`);
    panel.closest('.portfolio-chat').classList.toggle('chat-compact', height < 500);
  }
  fitVisibleViewport();
  window.addEventListener('resize', fitVisibleViewport);
  window.visualViewport?.addEventListener('resize', fitVisibleViewport);
  window.visualViewport?.addEventListener('scroll', fitVisibleViewport);

  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else {
      setEmojiPicker(false);
      launcher.focus();
    }
  }
  function message(role, content) {
    const paragraph = document.createElement('p');
    paragraph.className = `chat-message chat-${role}`;
    // Render simple bold emphasis without accepting provider/user HTML.
    if (role === 'assistant') {
      const emphasis = /\*\*([^*\n]+)\*\*/g;
      let offset = 0;
      for (const match of content.matchAll(emphasis)) {
        paragraph.append(content.slice(offset, match.index));
        const bold = document.createElement('strong');
        bold.textContent = match[1];
        paragraph.append(bold);
        offset = match.index + match[0].length;
      }
      paragraph.append(content.slice(offset));
    } else paragraph.textContent = content;
    log.appendChild(paragraph);
    log.scrollTop = log.scrollHeight;
  }
  launcher.addEventListener('click', () => toggle(panel.hidden));
  reset.addEventListener('click', () => {
    if (pending) return;
    history.length = 0;
    panel.dataset.chatPhase = 'ready';
    log.replaceChildren();
    message('assistant', greeting);
    input.value = '';
    selection = { start: 0, end: 0 };
    status.textContent = '';
    setEmojiPicker(false);
    updateControls();
    input.focus();
  });
  panel.querySelector('.chat-close').addEventListener('click', () => toggle(false));
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (!emojiPicker.hidden) {
      setEmojiPicker(false);
      emojiToggle.focus();
    } else toggle(false);
  });
  panel.querySelectorAll('[data-chat-question]').forEach((button) => {
    button.addEventListener('click', () => {
      if (pending) return;
      input.value = button.dataset.chatQuestion;
      form.requestSubmit();
    });
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content || pending) {
      updateControls();
      return;
    }
    message('user', content);
    input.value = '';
    selection = { start: 0, end: 0 };
    pending = true;
    setEmojiPicker(false);
    updateControls();
    let timeout;
    try {
      panel.dataset.chatPhase = 'answer-thinking';
      status.textContent = 'Thinking…';
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 25000);
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history.slice(-6), { role: 'user', content }] }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string')
        throw new Error(
          data.error ||
            'The assistant is unavailable right now. Please check the resume for contact information.',
        );
      history.push({ role: 'user', content }, { role: 'assistant', content: data.reply });
      message('assistant', data.reply);
    } catch (error) {
      message(
        'assistant',
        ['AbortError', 'TimeoutError'].includes(error.name)
          ? 'That took too long. Please try again in a moment.'
          : error.message,
      );
    } finally {
      clearTimeout(timeout);
      pending = false;
      panel.dataset.chatPhase = 'ready';
      updateControls();
      status.textContent = 'Ready for your next question.';
      // Do not reopen a phone keyboard if the visitor moved focus while waiting.
      if (!panel.hidden && document.activeElement === send) input.focus();
    }
  });
  updateControls();
}
