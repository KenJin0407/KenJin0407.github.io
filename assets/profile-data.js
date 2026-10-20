// Edit this file to update your portfolio. No build step is required.
export const profile = {
  name: 'Prince Angel Batiancila Regis',
  initials: 'PAR',
  title: 'Computer Engineering Student · Software & Embedded Systems',
  location: 'Binangonan, Rizal, Philippines',
  email: 'angelprince07042005@gmail.com',
  phone: '+639360496105',
  instagram: 'https://www.instagram.com/prnc_ngl/',
  github: 'https://github.com/KenJin0407',
  linkedin: '',
  // Light = Photo 1, dark = Photo 2, hover/tap = Photo 3, double tap = Photo 4.
  photo: '/assets/images/profile/light-mode-enhanced.png',
  darkPhoto: '/assets/images/profile/dark-mode-enhanced.png',
  wavePhoto: '/assets/images/profile/hover-tap.jpg',
  alternatePhoto: '/assets/images/profile/double-tap.jpg',
  resume: '/resume',
  introduction:
    'I’m a fourth-year Computer Engineering student at ICCT Colleges, specializing in software and embedded systems programming. I use Python for coding and Arduino for hardware projects.',
  about:
    'I enjoy speaking, collaborating with a team, and applying what I learn to solve engineering problems. My strengths include problem solving, adaptability, time management, communication, attention to detail, critical thinking, and a willingness to learn.',
  skills: [
    'Basic Programming',
    'Python',
    'HTML',
    'CSS',
    'Backend Developer',
    'Embedded Systems',
    'Basic Circuit Design',
    'Technical Documentation',
    'UI/UX Design',
    'Microsoft Word',
    'Microsoft PowerPoint',
    'Canva',
  ],
  strengths: [
    'Teamwork & Collaboration',
    'Problem Solving',
    'Adaptability',
    'Time Management',
    'Communication',
    'Attention to Detail',
    'Critical Thinking',
    'Willingness to Learn',
  ],
};

// Public Spotify playlists. Update these titles/covers if you change them in Spotify.
export const spotifyPlaylists = [
  {
    id: '5h09QIJdX3s5ithC234rFe',
    title: 'CALM/OLD MUSIC',
    cover:
      'https://mosaic.scdn.co/300/ab67616d00001e0244cb13558d57f5a066fac381ab67616d00001e024ae1c4c5c45aabe565499163ab67616d00001e02b815265c56ecfa5136a4015dab67616d00001e02b8a740229a85f3719d4a4c25',
  },
  {
    id: '2gyz7xeDscdb1PKkzibkdh',
    title: 'peaceful',
    cover:
      'https://mosaic.scdn.co/300/ab67616d00001e0224f8c3ad20b7c6cfecb5832eab67616d00001e02a1747c65e8a8dffde09ab201ab67616d00001e02c2ced39899b0d67cd5a724faab67616d00001e02f65d720a5d70dbb93e96d528',
  },
];

// Brand logos identify tools; outline icons represent general capabilities.
export const skillIcons = {
  'Basic Programming': 'basic-programming',
  Python: 'python',
  HTML: 'html',
  CSS: 'css',
  'Backend Developer': 'backend-development',
  'Embedded Systems': 'embedded-systems',
  'Basic Circuit Design': 'circuit-design',
  'Technical Documentation': 'technical-documentation',
  'UI/UX Design': 'ui-ux-design',
  'Microsoft Word': 'microsoft-word',
  'Microsoft PowerPoint': 'microsoft-powerpoint',
  Canva: 'canva',
};

export const gallery = [
  {
    image: '/assets/images/gallery/school-event.jpg',
    caption: 'School event',
    alt: 'A large school group gathered outdoors for an event',
  },
  {
    image: '/assets/images/gallery/led-control-circuit.jpg',
    caption: 'LED and control circuit',
    alt: 'A breadboard circuit with LEDs, switches, and a multimeter',
  },
  {
    image: '/assets/images/gallery/adjustable-voltage-regulator.jpg',
    caption: 'Adjustable voltage regulator',
    alt: 'A handmade adjustable voltage regulator with labeled output settings',
  },
  {
    image: '/assets/images/gallery/printed-circuit-board.jpg',
    caption: 'Printed circuit board',
    alt: 'A hand-drawn circuit board held above a workbench',
  },
  {
    image: '/assets/images/gallery/team-activity.jpg',
    caption: 'Team activity',
    alt: 'Students working together on a hands-on activity indoors',
  },
  {
    image: '/assets/images/gallery/electronics-assembly.jpg',
    caption: 'Electronics assembly',
    alt: 'A small electronics assembly with wires and components',
  },
  {
    image: '/assets/images/gallery/digital-electronics-project.jpg',
    caption: 'Digital electronics project',
    alt: 'A large breadboard digital electronics project with an illuminated display',
  },
  {
    image: '/assets/images/gallery/robotics-project.jpg',
    caption: 'Robotics project',
    alt: 'A four-wheel robotics prototype with an ultrasonic sensor',
  },
  {
    image: '/assets/images/gallery/embedded-systems-project.jpg',
    caption: 'Embedded systems project',
    alt: 'An embedded electronics prototype with a display and colored controls',
  },
];

export const resumePages = ['/assets/images/resume/page-1.png', '/assets/images/resume/page-2.png'];

export const projects = [
  {
    id: 'icctalk',
    name: 'ICCTalk',
    category: 'OOP project · Web application',
    role: 'Web Designer / UI/UX Designer',
    period: 'Aug 2025 – Dec 2026',
    description:
      'UI/UX design for an ICCT discussion forum, from user research and wireframes to responsive mockups, prototypes, and design reviews.',
    details: [
      'Gathered requirements and conducted user research for ICCT Talk.',
      'Designed wireframes, page layouts, UI mockups, and user flow prototypes.',
      'Followed ICCT brand guidelines and created consistent, accessible designs for different devices.',
      'Integrated feedback, provided design assets, and collaborated with developers to review implementation accuracy.',
    ],
    url: null,
    image: '/assets/images/projects/icct-talk.jpg',
    imageAlt: 'ICCTalk discussion forum website screenshot',
    previewType: 'photo',
    tools: ['UI/UX Design'],
  },
  {
    id: 'medicare',
    name: 'Medicare',
    category: 'Embedded system · Academic project',
    role: 'Programmer',
    period: 'Mar 2025 – Jul 2026',
    description:
      'Microcontroller programming for a medicine reminder system, including reminder timing, alarm notifications, and hardware integration.',
    details: [
      'Developed and maintained the microcontroller code for the Medicare system.',
      'Programmed medicine reminder timing, alarm notifications, user interactions, and system responses.',
      'Integrated sensors, buttons, a display, and an alarm module.',
      'Tested and debugged timing and functionality, worked with the hardware team, and documented the code flow.',
    ],
    url: null,
    image: '/assets/images/projects/medicare.jpg',
    imageAlt: 'Medicare embedded systems hardware prototype',
    previewType: 'photo',
    tools: ['Embedded Systems', 'Technical Documentation'],
  },
];

export const education = [
  {
    school: 'ICCT Colleges',
    qualification: 'Computer Engineering',
    period: '2023 – Present',
    location: 'V.V. Soliven Avenue II, San Isidro, Cainta, Rizal',
  },
  {
    school: 'Sumulong College of Arts and Sciences',
    qualification: 'Science, Technology, Engineering and Mathematics',
    period: '2021 – 2023',
    location: 'M.L. Quezon Extension, Dalig, Antipolo, Rizal',
  },
];

export const awards = [
  {
    title: 'High Honors — Grade 12',
    issuer: 'Sumulong College of Arts and Sciences High School Department',
    date: 'S.Y. 2022–2023 · July 21, 2023',
    description:
      'Certificate of Recognition for being an Academic Excellence Awardee with High Honors in Science, Technology, Engineering and Mathematics.',
    image: '/assets/images/recognition/grade-12-high-honors.jpg',
  },
  {
    title: 'ELNO — Top 15 Science Investigatory Project',
    category: 'Project participation',
    issuer: 'ICCT Colleges · EDay @11',
    date: 'March 13, 2024',
    description:
      'Certificate of Participation presented to ELNO for reaching the Top 15 in Bato-Balani Version 2.0: The Science Investigatory Project, during EDay @11 — Innovate and Elevate: Unleashing the Power of Excellence.',
    image: '/assets/images/recognition/elno-top-15-participation.jpg',
    imageAlt:
      'ELNO Certificate of Participation for reaching the Top 15 in Bato-Balani Version 2.0, dated March 13, 2024',
  },
];

// Keep chatbot facts linked to the same source data displayed on the website.
export const chatKnowledge = {
  projectTimelines: projects.map((project) => ({
    name: project.name,
    developmentPeriod: project.period,
  })),
  timelineNotes:
    'Project periods match the resume. Exact launch dates or completion days have not been provided.',
  resumeSkills: profile.skills,
  careerInterests: ['Software Engineer', 'Embedded Systems'],
};
