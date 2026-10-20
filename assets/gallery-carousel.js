// Adapted from the user-supplied DiagonalCarousel React/Framer Motion component.
// Keep its centered rail, 30-degree rotation, 120px vertical step and 0.6 scale.
export function enableGalleryCarousel({ onOpen } = {}) {
  const carousel = document.querySelector('.diagonal-gallery');
  if (!carousel) return;
  const rail = carousel.querySelector('.diagonal-gallery-rail');
  const slides = [...rail.children];
  if (!slides.length) return;
  const section = carousel.closest('#gallery');
  const previous = carousel.querySelector('[data-gallery-direction="-1"]');
  const next = carousel.querySelector('[data-gallery-direction="1"]');
  const dots = [...carousel.querySelectorAll('[data-gallery-dot]')];
  const open = section.querySelector('[data-gallery-open]');
  const status = section.querySelector('.gallery-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lifecycle = new AbortController();
  let index = 0;
  let size = 260;
  let frame = 0;
  let last = 0;
  let pointer;
  let suppressClick = false;
  const spring = (value) => ({ value, target: value, velocity: 0 });
  const offset = spring(0);
  const poses = slides.map((slide, position) => ({
    rotation: spring(position * 30),
    y: spring(position * 120),
    scale: spring(position === 0 ? 1 : 0.6),
  }));
  const listen = (node, type, handler, options = {}) =>
    node.addEventListener(type, handler, { ...options, signal: lifecycle.signal });
  const springs = [offset, ...poses.flatMap((pose) => Object.values(pose))];

  function paint() {
    rail.style.transform = `translate3d(${offset.value}px,0,0)`;
    slides.forEach((slide, position) => {
      const pose = poses[position];
      slide.style.transform = `translate3d(0,${pose.y.value}px,0) rotate(${pose.rotation.value}deg) scale(${pose.scale.value})`;
    });
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  function settle() {
    stop();
    springs.forEach((entry) => {
      entry.value = entry.target;
      entry.velocity = 0;
    });
    paint();
  }

  function tick(now) {
    frame = 0;
    // Small integration steps keep the spring stable after an interrupted frame.
    const elapsed = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    const count = Math.max(1, Math.ceil(elapsed / 0.008));
    const dt = elapsed / count;
    let moving = false;
    springs.forEach((entry) => {
      for (let step = 0; step < count; step++) {
        entry.velocity += ((entry.target - entry.value) * 170 - entry.velocity * 19) * dt;
        entry.value += entry.velocity * dt;
      }
      if (Math.abs(entry.target - entry.value) > 0.001 || Math.abs(entry.velocity) > 0.001)
        moving = true;
      else {
        entry.value = entry.target;
        entry.velocity = 0;
      }
    });
    paint();
    if (moving && !document.hidden) frame = requestAnimationFrame(tick);
    else last = 0;
  }

  function update({ immediate = false } = {}) {
    offset.target = -(index * size + size / 2);
    poses.forEach((pose, position) => {
      const distance = position - index;
      pose.rotation.target = distance * 30;
      pose.y.target = distance * 120;
      pose.scale.target = position === index ? 1 : 0.6;
      const slide = slides[position];
      const button = slide.querySelector('.gallery-photo');
      slide.classList.toggle('is-active', position === index);
      slide.style.zIndex = String(slides.length - Math.abs(distance));
      button.tabIndex = position === index ? 0 : -1;
      if (position === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
      if (Math.abs(distance) > 1) slide.setAttribute('aria-hidden', 'true');
      else slide.removeAttribute('aria-hidden');
    });
    dots.forEach((dot, position) => {
      if (position === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    status.textContent = `${index + 1} / ${slides.length} · ${slides[index].querySelector('figcaption').textContent}`;
    open.setAttribute(
      'aria-label',
      `View full photo: ${slides[index].querySelector('figcaption').textContent}`,
    );
    if (immediate || reduced.matches || document.hidden) settle();
    else if (!frame) frame = requestAnimationFrame(tick);
  }

  function select(nextIndex) {
    const resolved = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (resolved === index) return;
    index = resolved;
    update();
  }

  function measure() {
    const width = carousel.getBoundingClientRect().width;
    if (!width) return;
    size = Math.max(120, Math.min(260, width * 0.68));
    carousel.style.setProperty('--gallery-slide-size', `${size}px`);
    update({ immediate: true });
  }

  listen(previous, 'click', () => select(index - 1));
  listen(next, 'click', () => select(index + 1));
  dots.forEach((dot) => listen(dot, 'click', () => select(Number(dot.dataset.galleryDot))));
  listen(open, 'click', () => onOpen?.(index));
  listen(rail, 'click', (event) => {
    if (suppressClick) {
      event.preventDefault();
      suppressClick = false;
      return;
    }
    const photo = event.target.closest('[data-photo-index]');
    if (photo) select(Number(photo.dataset.photoIndex));
  });
  listen(carousel, 'keydown', (event) => {
    const destination = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: slides.length - 1,
    }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    select(destination);
    // A focused photo follows the selection, keeping hidden slides out of focus.
    if (event.target.matches('.gallery-photo')) slides[index].querySelector('button').focus();
  });

  listen(rail, 'pointerdown', (event) => {
    if (event.button !== 0) return;
    suppressClick = false;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dragging: false };
  });
  listen(rail, 'pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!pointer.dragging) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        pointer = null;
        return; // Vertical swipes keep scrolling the page on phones.
      }
      if (Math.abs(dx) < 8) return;
      pointer.dragging = true;
      suppressClick = true;
      rail.setPointerCapture(event.pointerId);
      rail.classList.add('is-dragging');
    }
    pointer.dx = dx;
  });
  function release(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const drag = pointer;
    pointer = null;
    rail.classList.remove('is-dragging');
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    if (event.type === 'pointerup' && drag.dragging && Math.abs(drag.dx) >= 35)
      select(index + (drag.dx < 0 ? 1 : -1));
  }
  listen(document, 'pointerup', release);
  listen(document, 'pointercancel', release);
  listen(rail, 'lostpointercapture', release);
  listen(rail, 'dragstart', (event) => event.preventDefault());
  listen(reduced, 'change', () => update({ immediate: true }));
  listen(document, 'visibilitychange', () => {
    if (document.hidden) settle();
  });
  const resize = new ResizeObserver(measure);
  resize.observe(carousel);
  measure();
  return () => {
    lifecycle.abort();
    stop();
    if (pointer && rail.hasPointerCapture(pointer.id)) rail.releasePointerCapture(pointer.id);
    resize.disconnect();
  };
}
