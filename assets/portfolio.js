import { enableThemeToggle } from './theme-toggle.js?v=recognition-33';
import { enableGlowCursor } from './glow-cursor.js?v=recognition-33';
import { enableAssistant } from './ai-assistant.js?v=recognition-33';
import {
  profile,
  projects,
  education,
  awards,
  skillIcons,
  gallery,
  resumePages,
  spotifyPlaylists,
} from './profile-data.js?v=recognition-33';
import { enablePageAnimations } from './page-animations.js?v=recognition-33';
import { enableProfilePhotos } from './profile-photos.js?v=recognition-33';
import { enablePageNavigation } from './page-navigation.js?v=recognition-33';
import { enableGalleryCarousel } from './gallery-carousel.js?v=recognition-33';
import { enableSpotifyPlayer } from './spotify-player.js?v=recognition-33';

// Shared HTML helpers used by the page and section builders below.
// Escape content before inserting it into the page.
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}
const text = escapeHtml;
const externalLink = (url, label, className = '') =>
  url
    ? `<a class="${className} ${label === 'GitHub' ? 'social-link' : ''}" href="${text(url)}" target="_blank" rel="noopener noreferrer">${label === 'GitHub' ? `<img class="social-logo" src="/assets/icons/${label.toLowerCase()}.svg" alt="" width="18" height="18">` : ''}${text(label)} <span aria-hidden="true">↗</span></a>`
    : '';
const skillBadge = (value) =>
  `<span class="skill-badge">${skillIcons[value] ? `<img class="skill-logo" src="/assets/icons/${text(skillIcons[value])}.svg" alt="" width="22" height="22">` : ''}${text(value)}</span>`;
const tags = (values) =>
  `<div class="tags">${values.map((value) => skillBadge(value)).join('')}</div>`;
const sectionHeader = (number, title, link = '') =>
  `<div class="section-heading"><h2><span class="section-number">${number}</span>${title}</h2>${link}</div>`;

// Keep the blue badge beside the last part of the name on narrow screens.
// This is a decorative profile badge, not verification by an external service.
function profileName() {
  const lastSpace = profile.name.lastIndexOf(' ');
  const prefix = lastSpace < 0 ? '' : profile.name.slice(0, lastSpace + 1);
  const ending = profile.name.slice(lastSpace + 1);
  return `${text(prefix)}<span class="name-ending">${text(ending)}<svg class="profile-badge" viewBox="0 0 24 24" role="img" aria-label="Blue profile badge"><title>Profile badge</title><path fill="#1d9bf0" d="m12 1 3 2 3.6.4 1 3.5L22 10l-.9 3.5.3 3.6-3.2 1.8-2 3-3.6-.6-3.5.6-2-3L3 17.1l.3-3.6L2 10l2.4-3.1 1-3.5L9 3Z"/><path d="m7.5 12 3 3 6-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
}

// Section builders: each returns markup without attaching event listeners.
function animatedSkillsSection() {
  // Repeat each row for a seamless loop while keeping one accessible skills list.
  const rowSize = Math.ceil(profile.skills.length / 3);
  const rows = Array.from({ length: 3 }, (_, index) =>
    profile.skills.slice(index * rowSize, (index + 1) * rowSize),
  ).filter((row) => row.length);
  return `<section id="skills">${sectionHeader('03', 'Skills & tools', '<div class="skills-heading-actions"><button class="skills-motion-toggle" type="button" aria-pressed="false">Pause motion</button><a class="text-link" href="/tech-stack">View all ↗</a></div>')}<div class="skills-lanes">${rows.map((row, index) => `<div class="skills-lane"><div class="skills-track ${index % 2 ? 'skills-track--right' : ''}">${[false, true].map((duplicate) => `<div class="tags skills-group" ${duplicate ? 'aria-hidden="true"' : ''}>${row.map((value) => skillBadge(value)).join('')}</div>`).join('')}</div></div>`).join('')}</div></section>`;
}

function profilePortrait() {
  const photos = [
    ['light', profile.photo],
    ['dark', profile.darkPhoto],
    ['wave', profile.wavePhoto],
    ['alternate', profile.alternatePhoto],
  ];
  return `<button class="profile-portrait" type="button" aria-label="${text(profile.name)} interactive profile photo" aria-describedby="profile-photo-help">${photos.map(([pose, source]) => `<img class="profile-photo profile-photo--${pose}" src="${text(source)}" alt="" aria-hidden="true" ${pose === 'light' ? 'fetchpriority="high"' : 'loading="eager"'}>`).join('')}</button><span id="profile-photo-help" class="visually-hidden">Light and dark mode show different photos. Hover or tap to show the third photo. Double-click or double-tap to show the fourth photo. Enter or Space cycles photos; Escape resets to the theme photo.</span>`;
}

function projectList(detailed = false) {
  return `<div class="project-list" role="region" aria-label="${text(profile.name)}’s projects">
    <div class="project-grid ${detailed ? 'detailed-grid' : ''}">${projects.map(projectCard).join('')}</div>
  </div>`;
}

function projectCard(project) {
  return `<article class="project-card" data-project="${text(project.id)}">
    ${project.image ? `<div class="project-preview ${project.previewType === 'photo' ? 'project-preview--photo' : ''}"><img class="project-image" src="${text(project.image)}" alt="${text(project.imageAlt || project.name + ' website preview')}" loading="lazy"></div>` : `<div class="project-preview project-placeholder"><img src="/assets/icons/embedded-systems.svg" alt="" width="44" height="44"><span>Embedded systems & documentation</span></div>`}
    <div class="project-copy"><h3>${text(project.name)}</h3><p class="project-role">${text(project.role)}</p><p class="project-summary">${text(project.description)}</p>
    <p class="project-period">${text(project.category)} · ${text(project.period)}</p>
    <div class="project-tools" aria-label="Project tools">${(project.tools || []).map((tool) => `<img src="/assets/icons/${text(skillIcons[tool])}.svg" alt="${text(tool)}" title="${text(tool)}" width="21" height="21">`).join('')}</div></div>
    <div class="project-card-footer">${project.url ? externalLink(project.url, 'Visit site', 'project-visit text-link') : '<span class="project-note">Academic project</span>'}</div>
  </article>`;
}

function educationSection() {
  return `<section>${sectionHeader('04', 'Education')}<div class="timeline">${education.map((item) => `<article class="timeline-item"><div><h3>${text(item.school)}</h3><p>${text(item.qualification)}</p><span class="muted">${text(item.location)}</span></div><span class="date">${text(item.period)}</span></article>`).join('')}</div></section>`;
}

function awardSection() {
  const cards = awards
    .map(
      (award) =>
        `<article class="award-card"><div><span class="eyebrow">${text(award.category || 'Academic achievement')}</span><h3>${text(award.title)}</h3><p>${text(award.description)}</p><p class="muted">${text(award.issuer)}<br>${text(award.date)}</p><a class="text-link" href="${text(award.image)}" target="_blank" rel="noopener noreferrer">View certificate ↗</a></div><a class="certificate-preview" href="${text(award.image)}" target="_blank" rel="noopener noreferrer" aria-label="${text(`Open certificate: ${award.title}`)}"><img src="${text(award.image)}" alt="${text(award.imageAlt || `${award.title} certificate for ${profile.name}`)}" loading="lazy"></a></article>`,
    )
    .join('');
  return `<section>${sectionHeader('05', 'Recognition')}<div class="recognition-list">${cards}</div></section>`;
}

function contactSection() {
  const icon = (content) =>
    `<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  const chevron = icon('<path d="m9 6 6 6-6 6"/>');
  const contactCard = (label, value, href, graphic, external = false) =>
    value
      ? `<a class="contact-card" href="${text(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}><span class="contact-card-icon">${icon(graphic)}</span><span class="contact-card-copy"><span class="contact-card-label">${text(label)}</span><span class="contact-card-value">${text(value)}</span></span><span class="contact-card-chevron">${chevron}</span></a>`
      : '';
  const emailLink = contactCard(
    'Email',
    profile.email,
    `mailto:${profile.email}`,
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  );
  const githubLink = contactCard(
    'GitHub',
    'KenJin0407',
    profile.github,
    '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22"/>',
    true,
  );
  return `<section id="contact" class="contact-section" aria-labelledby="contact-heading"><div class="contact-intro"><span class="eyebrow">Let’s connect</span><h2 id="contact-heading">Have a project in mind?</h2><p>My career interests are software engineering and embedded systems.</p><div class="contact-links">${externalLink(profile.instagram, 'Instagram')}${externalLink(profile.linkedin, 'LinkedIn')}<a href="${text(profile.resume)}">View resume ↗</a></div></div><div class="contact-cards">${emailLink}${githubLink}</div></section>`;
}

function gallerySection() {
  const photos = gallery
    .map(
      (photo, index) =>
        `<figure class="diagonal-gallery-slide"><figcaption>${text(photo.caption)}</figcaption><button class="gallery-photo" type="button" data-photo-index="${index}" aria-label="Show photo: ${text(photo.caption)}"><img src="${text(photo.image)}" alt="${text(photo.alt)}" loading="lazy" decoding="async" draggable="false"></button></figure>`,
    )
    .join('');
  const dots = gallery
    .map(
      (photo, index) =>
        `<button class="gallery-dot" type="button" data-gallery-dot="${index}" aria-label="Show slide ${index + 1}: ${text(photo.caption)}"></button>`,
    )
    .join('');
  const chevron = (direction) =>
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${direction < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}"/></svg>`;
  return `<section id="gallery">${sectionHeader('06', 'Gallery', '<div class="gallery-heading-actions"><a class="text-link" href="/gallery">View gallery ↗</a></div>')}<p class="muted gallery-intro">A few moments from school, classmates, and hands-on projects.</p><div class="diagonal-gallery" role="region" aria-roledescription="carousel" aria-label="${text(profile.name)}’s diagonal photo gallery" tabindex="0"><div class="diagonal-gallery-viewport"><div class="diagonal-gallery-rail">${photos}</div></div><div class="diagonal-gallery-controls"><button class="gallery-arrow" type="button" data-gallery-direction="-1" aria-label="Previous gallery photo">${chevron(-1)}</button><div class="diagonal-gallery-dots">${dots}</div><button class="gallery-arrow" type="button" data-gallery-direction="1" aria-label="Next gallery photo">${chevron(1)}</button></div></div><div class="gallery-slider-footer"><div><p class="gallery-status muted" role="status" aria-live="polite" aria-atomic="true"></p><p class="muted">Swipe or use the arrows to explore</p></div><button class="text-link gallery-view-full" type="button" data-gallery-open>View full photo ↗</button></div></section>`;
}

function resumePage() {
  return `<div class="page-intro"><span class="eyebrow">My background at a glance</span><h1>Resume</h1><p>Education, projects, skills, recognition, and contact information.</p></div><div class="resume-viewer">${resumePages.map((page, index) => `<figure class="resume-page"><figcaption>Page ${index + 1} of ${resumePages.length}</figcaption><img src="${text(page)}" alt="${text(profile.name)}’s resume, page ${index + 1}" ${index ? 'loading="lazy"' : ''}></figure>`).join('')}</div>`;
}

function photoDialog() {
  return `<dialog id="photo-viewer" aria-labelledby="photo-caption"><div class="photo-toolbar"><span id="photo-counter"></span><button type="button" class="photo-close" aria-label="Close photo viewer">×</button></div><img id="photo-full" alt=""><div class="photo-controls"><button type="button" class="photo-previous" aria-label="Previous photo">←</button><p id="photo-caption"></p><button type="button" class="photo-next" aria-label="Next photo">→</button></div></dialog>`;
}

function spotifyButton() {
  return `<button class="social-link spotify-launcher" type="button" data-spotify-open aria-haspopup="dialog" aria-controls="portfolio-spotify-dialog" aria-expanded="false"><img class="social-logo spotify-logo" src="/assets/icons/spotify.svg" alt="" width="21" height="21">Spotify <span aria-hidden="true">⌄</span></button>`;
}

function spotifyDialog() {
  return `<dialog id="portfolio-spotify-dialog" aria-labelledby="spotify-dialog-title" tabindex="-1"><div class="spotify-mini" aria-label="Spotify music controls"><button type="button" class="spotify-mini-artwork" aria-label="Collapse music player to bubble" aria-expanded="true" title="Tap for bubble · Drag to move"><img class="spotify-mini-cover" alt="" width="52" height="52"></button><div class="spotify-mini-copy" role="button" tabindex="0" aria-label="Move music player: drag or use arrow keys. Home centers it." title="Drag to move · Arrow keys to move · Home to center"><strong class="spotify-mini-title" id="spotify-mini-title"></strong><span class="spotify-mini-status" aria-live="polite">Loading Spotify…</span><span class="spotify-mini-grip" aria-hidden="true">⠿</span><div class="spotify-mini-eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div></div><div class="spotify-mini-controls"><button type="button" class="spotify-mini-toggle" aria-label="Play Spotify music" data-paused="true" disabled><svg class="spotify-mini-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="spotify-mini-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg></button><button type="button" class="spotify-mini-expand" aria-label="Expand Spotify player"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><button type="button" class="spotify-mini-stop" aria-label="Stop music and close player"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div><div class="spotify-mini-progress-track" aria-hidden="true"><div class="spotify-mini-progress"></div></div></div><div class="spotify-heading"><div><span class="eyebrow">A little music while you explore</span><h2 id="spotify-dialog-title"><img class="spotify-logo" src="/assets/icons/spotify.svg" alt="" width="24" height="24">My Spotify playlists</h2></div><button type="button" class="spotify-close" aria-label="Close Spotify playlists"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div><div class="spotify-choices"><p class="muted">Pick a playlist for your visit.</p><div class="spotify-playlist-grid">${spotifyPlaylists.map((playlist, index) => `<button type="button" class="spotify-choice" data-spotify-playlist="${index}" aria-label="Choose ${text(playlist.title)}"><img class="spotify-cover" src="${text(playlist.cover)}" alt="" loading="lazy" width="180" height="180"><strong>${text(playlist.title)}</strong><span>View playlist <span aria-hidden="true">→</span></span></button>`).join('')}</div></div><div class="spotify-player" hidden><button type="button" class="spotify-back text-link">← Choose another playlist</button><h3 id="spotify-selected-title"></h3><p class="muted spotify-play-help">Press Play in the Spotify player to listen.</p><div class="spotify-embed"></div><a class="spotify-external text-link" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a></div></dialog>`;
}

function chatWidget() {
  const emojis = [
    ['👋', 'Wave'],
    ['🙂', 'Smile'],
    ['😊', 'Happy'],
    ['😂', 'Laugh'],
    ['😎', 'Cool'],
    ['🤔', 'Thinking'],
    ['👍', 'Thumbs up'],
    ['❤️', 'Heart'],
    ['💻', 'Laptop'],
    ['🚀', 'Rocket'],
    ['✨', 'Sparkles'],
    ['🙌', 'Celebrate'],
  ];
  return `<aside class="portfolio-chat">
    <section id="portfolio-chat-panel" class="chat-panel" aria-label="${text(profile.name)}’s portfolio assistant" hidden>
      <div class="chat-heading">
        <div><strong>Prince’s AI assistant</strong><p>Projects, resume & contact information</p></div>
        <div class="chat-heading-actions">
          <button class="chat-reset" type="button" aria-label="Start new chat">New chat</button>
          <button class="chat-close" type="button" aria-label="Close assistant">×</button>
        </div>
      </div>
      <div class="chat-log" role="log" aria-live="polite" aria-label="Conversation">
        <p class="chat-message chat-assistant">Hi! Ask me about Prince’s projects, hard skills, education, or how to get in touch. Puwede rin sa Tagalog.</p>
      </div>
      <div class="chat-suggestions">
        <button type="button" data-chat-question="Tell me about ICCTalk">ICCTalk</button>
        <button type="button" data-chat-question="What are ${text(profile.name)}’s skills?">Skills</button>
      </div>
      <p class="chat-status" role="status"></p>
      <div class="chat-composer">
      <div id="portfolio-chat-emojis" class="chat-emoji-picker" role="group" aria-label="Choose an emoji" hidden>
        ${emojis.map(([emoji, label]) => `<button type="button" data-emoji="${emoji}" aria-label="${label} emoji">${emoji}</button>`).join('')}
      </div>
      <form novalidate>
        <label class="visually-hidden" for="portfolio-chat-input">Your message</label>
        <div class="chat-input-box">
          <input id="portfolio-chat-input" type="text" maxlength="800" placeholder="Ask a question…" autocomplete="off" enterkeyhint="send">
          <button class="chat-emoji-toggle" type="button" aria-label="Choose emoji" aria-expanded="false" aria-controls="portfolio-chat-emojis">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3"/><circle cx="8.5" cy="9" r=".8" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9" r=".8" fill="currentColor" stroke="none"/></svg>
          </button>
        </div>
        <div class="chat-composer-actions">
          <button class="chat-send" type="submit" aria-label="Send message" disabled>
            <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 2.8a.8.8 0 0 0-1.1 1L5.7 11H14a1 1 0 1 1 0 2H5.7l-3.4 7.2a.8.8 0 0 0 1.1 1l18-8.5a.8.8 0 0 0 0-1.4Z"/></svg>
          </button>
        </div>
      </form>
      </div>
    </section>
    <button id="portfolio-chat-launcher" class="button primary" type="button" aria-expanded="false" aria-controls="portfolio-chat-panel">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M7 11h10M7 15h6"/></svg>
      Ask Prince’s AI assistant
    </button>
  </aside>`;
}

// Page composition and route rendering.
function homePage() {
  return `<section class="hero"><div class="hero-top">${profilePortrait()}<div class="hero-details"><span class="eyebrow location"><span class="status-dot"></span>${text(profile.location)}</span><h1>${profileName()}</h1><p class="job-title">${text(profile.title)}</p></div></div><p class="introduction">${text(profile.introduction)}</p><div class="hero-actions"><a class="button primary" href="/projects">Explore projects <span aria-hidden="true">↗</span></a><a class="button" href="${text(profile.resume)}">View resume ↗</a><div class="social-links">${externalLink(profile.github, 'GitHub')}${externalLink(profile.linkedin, 'LinkedIn')}${spotifyButton()}</div></div></section>
    <section>${sectionHeader('01', 'About me')}<p>${text(profile.about)}</p></section>
    <section>${sectionHeader('02', 'Selected projects', '<a class="text-link" href="/projects">View all ↗</a>')}${projectList()}</section>
    ${animatedSkillsSection()}
    ${educationSection()}${awardSection()}${gallerySection()}${contactSection()}`;
}

function themeSwitch() {
  return `<button id="theme-toggle" type="button" role="switch" aria-label="Dark mode" aria-checked="false">
    <span class="theme-track" aria-hidden="true">
      <svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
      <svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 15.6A9 9 0 0 1 8.4 4 9 9 0 1 0 20 15.6Z"/></svg>
      <span class="theme-thumb"></span>
    </span>
  </button>`;
}

function renderPage({ partial = false } = {}) {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const pages = {
    '/': homePage,
    '/projects': () =>
      `<div class="page-intro"><span class="eyebrow">From ideas to working systems</span><h1>Projects</h1><p>Two academic projects in web development and embedded systems.</p></div>${projectList(true)}${contactSection()}`,
    '/highlights': () =>
      `<div class="page-intro"><span class="eyebrow">Milestones along the way</span><h1>Highlights</h1><p>Academic recognition and hands-on project work.</p></div>${awardSection()}<section>${sectionHeader('02', 'Selected project')}${projectCard(projects[0])}</section>${contactSection()}`,
    '/certifications': () => `${awardSection()}${contactSection()}`,
    '/tech-stack': () =>
      `<div class="page-intro"><h1>Skills & tools</h1><p>The technologies and practical skills I use across my projects.</p></div>${tags(profile.skills)}${contactSection()}`,
    '/contact': contactSection,
    '/gallery': () =>
      `<div class="page-intro"><span class="eyebrow">Life beyond the code</span><h1>My gallery</h1><p>Classroom memories, electronics projects, and everyday moments.</p></div>${gallerySection()}`,
    '/resume': resumePage,
  };
  const content = `${path !== '/' ? '<a class="back-home" href="/">← Back home</a>' : ''}${(pages[path] || (() => `<div class="page-intro"><h1>Page not found</h1><a class="text-link" href="/">Return home ↗</a></div>`))()}`;
  if (partial) {
    document.querySelector('#main').innerHTML = content;
    document.querySelectorAll('.nav-links a').forEach((link) => {
      if (link.getAttribute('href') === path) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  } else
    document.querySelector('#root').innerHTML = `
    <header><nav class="container"><a class="brand" href="/" aria-label="${text(profile.name)} home">${text(profile.initials)}<span class="brand-dot">.</span></a><div class="nav-links">${[
      ['/projects', 'Projects'],
      ['/highlights', 'Highlights'],
      ['/gallery', 'Gallery'],
      ['/contact', 'Contact'],
    ]
      .map(
        ([href, label]) =>
          `<a href="${href}" ${path === href ? 'aria-current="page"' : ''}>${label}</a>`,
      )
      .join('')}${themeSwitch()}</div></nav></header>
    <main class="container" id="main" tabindex="-1">${content}</main>
    <footer class="container"><div><strong>${text(profile.name)}</strong><p>Building, learning, and improving.</p></div><span>${text(profile.location)}</span></footer>${photoDialog()}${spotifyDialog()}${chatWidget()}`;
  document.title = `${path === '/' ? profile.name : path.slice(1).replace(/^./, (first) => first.toUpperCase()) + ' | ' + profile.name} — Portfolio`;
}

// Keep old bookmarks working after renaming the section to Projects.
if (window.location.pathname.replace(/\/$/, '') === '/experience') {
  window.history.replaceState(null, '', '/projects');
}
renderPage();

// Native dialog provides focus trapping, Escape-to-close, and focus restoration.
const viewer = document.querySelector('#photo-viewer');
let selectedPhoto = 0;
function showPhoto(index) {
  selectedPhoto = (index + gallery.length) % gallery.length;
  const photo = gallery[selectedPhoto];
  const image = document.querySelector('#photo-full');
  image.src = photo.image;
  image.alt = photo.alt;
  document.querySelector('#photo-caption').textContent = photo.caption;
  document.querySelector('#photo-counter').textContent = `${selectedPhoto + 1} / ${gallery.length}`;
}
viewer.querySelector('.photo-close').addEventListener('click', () => viewer.close());
viewer
  .querySelector('.photo-previous')
  .addEventListener('click', () => showPhoto(selectedPhoto - 1));
viewer.querySelector('.photo-next').addEventListener('click', () => showPhoto(selectedPhoto + 1));
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(selectedPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
viewer.addEventListener('click', (event) => {
  if (event.target !== viewer) return;
  const bounds = viewer.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    viewer.close();
});

enableThemeToggle();

// Page interactions must be cleaned up and reattached after internal navigation.
let stopMotion;
let stopProfile;
let stopGallery;
function initializeMain({ pageEntry = false } = {}) {
  stopMotion?.();
  stopProfile?.();
  stopGallery?.();
  document.querySelectorAll('.skills-motion-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const paused = button.closest('#skills').classList.toggle('skills-paused');
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Resume motion' : 'Pause motion';
    });
  });

  stopGallery = enableGalleryCarousel({
    onOpen: (index) => {
      showPhoto(index);
      viewer.showModal();
    },
  });
  stopProfile = enableProfilePhotos();
  stopMotion = enablePageAnimations({ pageEntry });
}

enableAssistant();
enableSpotifyPlayer(spotifyPlaylists);
enableGlowCursor();
initializeMain();
enablePageNavigation({
  render: () => renderPage({ partial: true }),
  initialize: initializeMain,
  routes: new Set([
    '/',
    '/projects',
    '/experience',
    '/highlights',
    '/certifications',
    '/tech-stack',
    '/contact',
    '/gallery',
    '/resume',
  ]),
});
