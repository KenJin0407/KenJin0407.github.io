import { enableSpotifyPosition } from './spotify-position.js?v=organized-31';

// One persistent Spotify iframe. Minimizing changes presentation, never its DOM parent.
let spotifyApiPromise;
function loadSpotifyApi() {
  if (spotifyApiPromise) return spotifyApiPromise;
  spotifyApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    let timer;
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      window.onSpotifyIframeApiReady = undefined;
      reject(new Error('Spotify controls could not load'));
    };
    window.onSpotifyIframeApiReady = (api) => {
      clearTimeout(timer);
      resolve(api);
    };
    script.addEventListener('error', fail, { once: true });
    timer = setTimeout(fail, 12000);
    document.head.append(script);
  }).catch((error) => {
    spotifyApiPromise = undefined;
    throw error;
  });
  return spotifyApiPromise;
}

export function enableSpotifyPlayer(playlists) {
  const dialog = document.querySelector('#portfolio-spotify-dialog');
  if (!dialog) return;
  const choices = dialog.querySelector('.spotify-choices');
  const player = dialog.querySelector('.spotify-player');
  const mount = dialog.querySelector('.spotify-embed');
  const title = dialog.querySelector('#spotify-selected-title');
  const external = dialog.querySelector('.spotify-external');
  const mini = dialog.querySelector('.spotify-mini');
  const miniTitle = mini.querySelector('.spotify-mini-title');
  const miniCover = mini.querySelector('.spotify-mini-cover');
  const artwork = mini.querySelector('.spotify-mini-artwork');
  const status = mini.querySelector('.spotify-mini-status');
  const toggle = mini.querySelector('.spotify-mini-toggle');
  const progress = mini.querySelector('.spotify-mini-progress');
  const modalClose = dialog.querySelector('.spotify-close');
  const help = dialog.querySelector('.spotify-play-help');
  const position = enableSpotifyPosition(dialog);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let opener,
    selected,
    controller,
    closing = false,
    closeTimer,
    generation = 0;
  let picking = true,
    ready = false,
    paused = true,
    buffering = false,
    fallback = false;

  function reflectPlayback() {
    mini.classList.toggle('is-playing', ready && !paused && !buffering);
    mini.dataset.paused = String(paused);
    toggle.disabled = !ready && !fallback;
    toggle.setAttribute(
      'aria-label',
      fallback
        ? 'Open Spotify playback controls'
        : paused
          ? 'Play Spotify music'
          : 'Pause Spotify music',
    );
    toggle.dataset.paused = String(paused);
    status.textContent = fallback
      ? 'Open player to listen'
      : !ready
        ? 'Loading Spotify…'
        : buffering
          ? 'Buffering…'
          : paused
            ? 'Paused · Spotify'
            : 'Playing · Spotify';
  }
  function updateViews() {
    choices.hidden = !picking;
    // Keep the iframe rendered even when browsing the playlist picker.
    player.hidden = !selected;
    player.classList.toggle('is-spotify-parked', picking && !!selected);
    mount.inert = picking;
    modalClose.setAttribute(
      'aria-label',
      selected ? 'Minimize Spotify player' : 'Close Spotify playlists',
    );
  }
  function releasePage() {
    document.documentElement.classList.remove('spotify-open');
    document
      .querySelectorAll('[data-spotify-open]')
      .forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }
  function cancelClosing() {
    clearTimeout(closeTimer);
    closing = false;
    dialog.classList.remove('is-spotify-closing');
  }
  function bubbleView(compact) {
    dialog.classList.toggle('is-spotify-bubble', compact);
    artwork.setAttribute('aria-expanded', String(!compact));
    artwork.setAttribute(
      'aria-label',
      compact ? 'Restore music player from bubble' : 'Collapse music player to bubble',
    );
    artwork.title = compact
      ? 'Tap to restore player · Drag to move'
      : 'Tap for bubble · Drag to move';
  }
  artwork.addEventListener('click', () => {
    if (!dialog.classList.contains('is-spotify-mini')) return;
    position.resizeMode(() => bubbleView(!dialog.classList.contains('is-spotify-bubble')));
  });
  function minimize() {
    cancelClosing();
    // Native close/show removes modal focus trapping without removing/reloading audio.
    if (dialog.open) dialog.close();
    dialog.classList.add('is-spotify-mini');
    mount.inert = true;
    dialog.setAttribute('aria-labelledby', 'spotify-mini-title');
    dialog.show();
    dialog.scrollTop = 0;
    position.show();
    releasePage();
  }
  function finishClose() {
    cancelClosing();
    if (selected) {
      minimize();
      return;
    }
    if (dialog.open) dialog.close();
    releasePage();
  }
  function requestClose() {
    if (!dialog.open || closing || dialog.classList.contains('is-spotify-mini')) return;
    if (reducedMotion.matches) {
      finishClose();
      return;
    }
    closing = true;
    dialog.classList.add('is-spotify-closing');
    closeTimer = setTimeout(finishClose, 220);
  }
  function expand(showChoices = false) {
    position.hide();
    bubbleView(false);
    cancelClosing();
    if (dialog.open) dialog.close();
    dialog.classList.remove('is-spotify-mini');
    dialog.setAttribute('aria-labelledby', 'spotify-dialog-title');
    picking = showChoices || !selected;
    updateViews();
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.focus({ preventScroll: true });
    document.documentElement.classList.add('spotify-open');
    document
      .querySelectorAll('[data-spotify-open]')
      .forEach((button) => button.setAttribute('aria-expanded', 'true'));
  }
  function stopMusic() {
    position.hide();
    bubbleView(false);
    generation++;
    cancelClosing();
    try {
      controller?.pause();
      controller?.destroy();
    } catch {
      /* Removing the iframe below still stops audio. */
    }
    controller = undefined;
    selected = undefined;
    ready = false;
    paused = true;
    buffering = false;
    fallback = false;
    mount.replaceChildren();
    progress.style.width = '0%';
    picking = true;
    updateViews();
    if (dialog.open) dialog.close();
    dialog.classList.remove('is-spotify-mini');
    dialog.setAttribute('aria-labelledby', 'spotify-dialog-title');
    releasePage();
  }
  function prepareFrame(frame, playlist) {
    if (!frame) return;
    frame.title = `Spotify playlist: ${playlist.title}`;
    frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
  }
  async function selectPlaylist(index) {
    if (closing) return;
    const playlist = playlists[index];
    if (!playlist || !/^[A-Za-z0-9]{22}$/.test(playlist.id)) return;
    picking = false;
    if (selected?.id === playlist.id) {
      updateViews();
      return;
    }
    selected = playlist;
    title.textContent = playlist.title;
    external.href = `https://open.spotify.com/playlist/${playlist.id}`;
    miniTitle.textContent = playlist.title;
    miniCover.src = playlist.cover;
    miniCover.alt = `${playlist.title} artwork`;
    ready = false;
    paused = true;
    buffering = false;
    fallback = false;
    progress.style.width = '0%';
    help.textContent = 'Press Play in the Spotify player. Close this window to keep listening.';
    updateViews();
    reflectPlayback();
    dialog.querySelector('.spotify-back').focus();
    const stamp = ++generation;
    if (controller) {
      // loadEntity reuses the same iframe and stops the previous selection.
      controller.pause();
      controller.loadEntity(`spotify:playlist:${playlist.id}`);
      ready = true;
      reflectPlayback();
      prepareFrame(mount.querySelector('iframe'), playlist);
      return;
    }
    mount.replaceChildren();
    try {
      const api = await loadSpotifyApi();
      if (stamp !== generation || !selected) return;
      const placeholder = document.createElement('div');
      mount.append(placeholder);
      api.createController(
        placeholder,
        { width: '100%', height: 152, uri: `spotify:playlist:${playlist.id}` },
        (created) => {
          if (stamp !== generation || !selected) {
            created.destroy();
            return;
          }
          controller = created;
          prepareFrame(mount.querySelector('iframe'), selected);
          ready = true;
          reflectPlayback();
          created.addListener('ready', () => {
            if (controller !== created) return;
            ready = true;
            reflectPlayback();
          });
          created.addListener('playback_update', (event) => {
            if (controller !== created || !selected) return;
            const data = event.data || {};
            paused = data.isPaused !== false;
            buffering = !!data.isBuffering;
            const ratio =
              Number(data.duration) > 0 ? Number(data.position) / Number(data.duration) : 0;
            progress.style.width = `${Math.min(100, Math.max(0, Number.isFinite(ratio) ? ratio * 100 : 0))}%`;
            reflectPlayback();
          });
          created.addListener('playback_started', () => {
            if (controller !== created || !selected) return;
            paused = false;
            buffering = false;
            reflectPlayback();
          });
        },
      );
    } catch {
      if (stamp !== generation || !selected) return;
      // Blocked external API: keep a working official embed and expose its native controls.
      mount.replaceChildren();
      const frame = document.createElement('iframe');
      frame.src = `https://open.spotify.com/embed/playlist/${playlist.id}`;
      prepareFrame(frame, playlist);
      mount.append(frame);
      fallback = true;
      help.textContent =
        'Use the Spotify player controls to play or pause. Minimize to keep listening.';
      reflectPlayback();
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-spotify-open]');
    if (!button || (dialog.open && !dialog.classList.contains('is-spotify-mini'))) return;
    opener = button;
    expand();
  });
  dialog.querySelectorAll('[data-spotify-playlist]').forEach((button) => {
    button.addEventListener('click', () => selectPlaylist(Number(button.dataset.spotifyPlaylist)));
  });
  modalClose.addEventListener('click', requestClose);
  dialog.querySelector('.spotify-back').addEventListener('click', () => {
    if (closing) return;
    picking = true;
    updateViews();
    dialog.querySelector('[data-spotify-playlist]').focus();
  });
  mini.querySelector('.spotify-mini-expand').addEventListener('click', () => expand());
  mini.querySelector('.spotify-mini-stop').addEventListener('click', stopMusic);
  toggle.addEventListener('click', () => {
    if (fallback) {
      expand();
      return;
    }
    if (!ready || !controller) return;
    // State follows Spotify events; do not animate a fake playing state.
    if (paused) controller.resume();
    else controller.pause();
  });
  dialog.addEventListener('animationend', (event) => {
    if (closing && event.target === dialog && event.animationName === 'portfolio-spotify-out')
      finishClose();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.classList.contains('is-spotify-mini')) {
      // Non-modal Escape leaves background music alone; X explicitly stops it.
      event.preventDefault();
      document.querySelector('#main')?.focus({ preventScroll: true });
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return; // close/show queues a close event during modal <-> mini transitions.
    cancelClosing();
    if (selected) minimize();
    else releasePage();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog || dialog.classList.contains('is-spotify-mini')) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      requestClose();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && closing) finishClose();
  });
}
