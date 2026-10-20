// Position the persistent player without moving or recreating its audio iframe.
export function enableSpotifyPosition(dialog) {
  const mini = dialog.querySelector('.spotify-mini');
  const handle = mini.querySelector('.spotify-mini-copy');
  let visible = false,
    saved,
    drag,
    frame = 0,
    suppressDragClick = false;
  const clamp = (value, low, high) => Math.min(Math.max(value, low), Math.max(low, high));

  function bounds() {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft || 0;
    const top = viewport?.offsetTop || 0;
    const width = Math.min(
      document.documentElement.clientWidth,
      viewport?.width || window.innerWidth,
    );
    const height = viewport?.height || window.innerHeight;
    const margin = width <= 600 ? 10 : 16;
    const playerWidth = dialog.offsetWidth;
    const playerHeight = dialog.offsetHeight;
    let minY = top + margin;
    const header = document.querySelector('header')?.getBoundingClientRect();
    if (header && header.bottom > top && header.top < top + height)
      minY = Math.max(minY, header.bottom + 10);
    const back = document.querySelector('.back-home')?.getBoundingClientRect();
    if (back && back.bottom > minY && back.top < top + height)
      minY = Math.max(minY, back.bottom + 10);
    const maxY = Math.max(top + margin, top + height - playerHeight - margin);
    return {
      minX: left + margin,
      maxX: Math.max(left + margin, left + width - playerWidth - margin),
      minY: Math.min(minY, maxY),
      maxY,
      width,
      height,
      top,
      left,
      playerHeight,
    };
  }
  function write(x, y, area = bounds()) {
    x = clamp(x, area.minX, area.maxX);
    y = clamp(y, area.minY, area.maxY);
    dialog.style.setProperty('--spotify-mini-x', `${x}px`);
    dialog.style.setProperty('--spotify-mini-y', `${y}px`);
    return { x, y };
  }
  function remember(point, area) {
    saved = {
      x: area.maxX > area.minX ? (point.x - area.minX) / (area.maxX - area.minX) : 0.5,
      y: area.maxY > area.minY ? (point.y - area.minY) / (area.maxY - area.minY) : 1,
    };
  }
  function clearControls(x, y, area) {
    const main = document.querySelector('#main');
    const controls = [
      ...(main?.querySelectorAll?.('a[href], button, input, select, textarea, [role="button"]') ||
        []),
    ];
    const obstacles = controls
      .map((control) => ({ control, rect: control.getBoundingClientRect() }))
      .filter(
        ({ control, rect }) =>
          !control.disabled &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.right > x &&
          rect.left < x + dialog.offsetWidth &&
          rect.bottom > area.minY &&
          rect.top < area.top + area.height &&
          getComputedStyle(control).pointerEvents !== 'none',
      );
    let candidate = clamp(y, area.minY, area.maxY);
    for (let attempt = 0; attempt < 8; attempt++) {
      const hit = obstacles.find(
        ({ rect }) => rect.top < candidate + area.playerHeight + 6 && rect.bottom > candidate - 6,
      );
      if (!hit) return candidate;
      const above = hit.rect.top - area.playerHeight - 8;
      if (above < area.minY) break;
      candidate = above;
    }
    // Dense controls may leave no free row; keep the predictable dock and allow dragging.
    return clamp(y, area.minY, area.maxY);
  }
  function position() {
    frame = 0;
    if (!visible) return;
    // Reuse drag bounds: reading layout on every touch frame causes visible stutter.
    const area = drag?.area || bounds();
    if (drag?.moved) {
      const point = write(
        drag.x + drag.latestX - drag.startX,
        drag.y + drag.latestY - drag.startY,
        area,
      );
      drag.point = point;
    } else if (saved) {
      write(
        area.minX + (area.maxX - area.minX) * saved.x,
        area.minY + (area.maxY - area.minY) * saved.y,
        area,
      );
    } else {
      // Dock above the chat launcher so both controls can be used on narrow phones.
      const launcher = document.querySelector('#portfolio-chat-launcher')?.getBoundingClientRect();
      const footerGap = launcher ? area.top + area.height - launcher.top + 12 : 20;
      const x = (area.minX + area.maxX) / 2;
      const y = area.top + area.height - area.playerHeight - Math.max(20, footerGap);
      write(x, clearControls(x, y, area), area);
    }
  }
  function queue() {
    if (visible && !frame) frame = requestAnimationFrame(position);
  }
  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    position();
    if (drag.moved) {
      suppressDragClick = true;
      remember(drag.point, drag.area);
    }
    const pointerId = drag.id;
    const capture = drag.capture;
    drag = undefined;
    mini.classList.remove('is-dragging');
    if (capture.hasPointerCapture(pointerId)) capture.releasePointerCapture(pointerId);
  }
  mini.addEventListener('pointerdown', (event) => {
    if (!visible || drag || event.isPrimary === false || event.button !== 0) return;
    if (event.target.closest('button') && !event.target.closest('.spotify-mini-artwork')) return;
    suppressDragClick = false;
    // Capture immediately so a fast finger movement cannot leave the small bubble.
    // Keep artwork taps targeted at their button, which still toggles the bubble.
    const capture = event.target.closest('.spotify-mini-artwork, .spotify-mini-copy') || mini;
    capture.setPointerCapture(event.pointerId);
    const rect = dialog.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      latestX: event.clientX,
      latestY: event.clientY,
      x: rect.left,
      y: rect.top,
      moved: false,
      capture,
      area: bounds(),
    };
  });
  mini.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag.latestX = event.clientX;
    drag.latestY = event.clientY;
    if (drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >= 5) {
      if (!drag.moved) dialog.getAnimations?.().forEach((animation) => animation.cancel());
      drag.moved = true;
      mini.classList.add('is-dragging');
      queue();
    }
  });
  // Captured drag releases can generate clicks; never collapse/restore after a drag.
  mini.addEventListener(
    'click',
    (event) => {
      if (!suppressDragClick || event.detail === 0) return;
      suppressDragClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
  mini.addEventListener('pointerup', endDrag);
  mini.addEventListener('pointercancel', endDrag);
  mini.addEventListener('lostpointercapture', endDrag);
  mini.addEventListener('dragstart', (event) => event.preventDefault());
  function moveWithKeyboard(event) {
    if (!visible) return;
    if (event.key === 'Home') {
      event.preventDefault();
      saved = undefined;
      position();
      return;
    }
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = dialog.getBoundingClientRect(),
      area = bounds(),
      step = event.shiftKey ? 48 : 16;
    remember(write(rect.left + direction[0] * step, rect.top + direction[1] * step, area), area);
  }
  handle.addEventListener('keydown', moveWithKeyboard);
  const artwork = mini.querySelector('.spotify-mini-artwork');
  if (artwork && artwork !== handle) artwork.addEventListener('keydown', moveWithKeyboard);
  const resize = () => {
    endDrag();
    queue();
  };
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', queue, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('blur', () => endDrag());
  // A route can change at scrollY=0, so a scroll event alone is not enough.
  const main = document.querySelector('#main');
  if (main) new MutationObserver(queue).observe(main, { childList: true });

  return {
    resizeMode(change) {
      endDrag();
      dialog.getAnimations?.().forEach((animation) => animation.cancel());
      const rect = dialog.getBoundingClientRect();
      change();
      if (!visible) return;
      const area = bounds();
      remember(write(rect.left, rect.top, area), area);
    },
    show() {
      visible = true;
      document.documentElement.classList.add('spotify-mini-active');
      position();
    },
    hide() {
      endDrag();
      visible = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      document.documentElement.classList.remove('spotify-mini-active');
    },
  };
}
