// The profile keeps the base, hover, and double-click states mounted for a smooth crossfade.
export function enableProfilePhotos() {
  const portrait = document.querySelector('.profile-portrait');
  if (!portrait) return;
  const lifecycle = new AbortController();

  const doubleTapWindow = 500;
  let hovered = false;
  let pose = null;
  let lastTap = null;
  let touch = null;
  let ignoreClickUntil = 0;
  let resetTimer;

  function render() {
    const visiblePose = pose || (hovered ? 'wave' : null);
    if (visiblePose) portrait.dataset.pose = visiblePose;
    else delete portrait.dataset.pose;
  }
  function reset() {
    clearTimeout(resetTimer);
    pose = null;
    lastTap = null;
    touch = null;
    render();
  }
  function show(nextPose) {
    clearTimeout(resetTimer);
    pose = nextPose;
    render();
  }
  function cancelTouch() {
    ignoreClickUntil = performance.now() + 700;
    hovered = false;
    reset();
  }

  portrait.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    render();
  });
  portrait.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    reset();
  });
  portrait.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.pointerType === 'mouse') return;
    const now = performance.now();
    const doubleTap =
      lastTap &&
      now - lastTap.time <= doubleTapWindow &&
      Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 30;
    touch = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      doubleTap: Boolean(doubleTap),
    };
    // Show the second pose immediately, without waiting for a synthetic click.
    show(doubleTap ? 'alternate' : 'wave');
  });
  portrait.addEventListener('pointermove', (event) => {
    if (!touch || event.pointerId !== touch.id) return;
    if (Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 12) cancelTouch();
  });
  portrait.addEventListener('pointercancel', cancelTouch);
  portrait.addEventListener('pointerup', (event) => {
    if (!touch || event.pointerId !== touch.id) return;
    const now = performance.now();
    const doubleTap = touch.doubleTap;
    lastTap = doubleTap ? null : { time: now, x: touch.x, y: touch.y };
    touch = null;
    ignoreClickUntil = now + 700;
    resetTimer = setTimeout(reset, doubleTap ? 3000 : 1800);
  });
  portrait.addEventListener('click', (event) => {
    if (performance.now() < ignoreClickUntil) return;
    if (event.detail === 0) {
      hovered = false;
      show(pose === 'wave' ? 'alternate' : pose === 'alternate' ? null : 'wave');
    } else {
      show(event.detail >= 2 ? 'alternate' : 'wave');
    }
  });
  portrait.addEventListener('dblclick', (event) => {
    if (performance.now() < ignoreClickUntil) return;
    event.preventDefault();
    show('alternate');
  });
  portrait.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    hovered = false;
    reset();
  });
  portrait.addEventListener('blur', () => {
    if (!hovered && !touch) reset();
  });
  document.addEventListener(
    'portfolio-theme-change',
    () => {
      hovered = false;
      reset();
    },
    { signal: lifecycle.signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        hovered = false;
        reset();
      }
    },
    { signal: lifecycle.signal },
  );
  return () => {
    clearTimeout(resetTimer);
    lifecycle.abort();
  };
}
