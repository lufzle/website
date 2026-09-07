export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const en = {
  meta: {
    title: 'Dario Farzati — AI Strategist · Educator · Product Designer',
    description:
      'I help teams develop their agentic engineering practice: automation, workflows, and AI agents that contribute as teammates.',
  },
  nav: {
    writing: 'Writing',
    contact: 'Contact',
    langLabel: 'Language',
  },
  footer: {
    email: 'Email',
    contact: 'Contact',
    privacy: 'Privacy',
  },
  theme: {
    toggle: 'Toggle theme (hold for a surprise)',
    hold: 'Hold for Hyperdimensional CGA',
    back: 'Back to the present',
  },
  home: {
    subtitle: 'AI Strategist · Educator · Product Designer',
    lede: 'I help teams develop their agentic engineering practice: automation, workflows, and AI agents that contribute as teammates.',
    cta: 'Get in touch',
    about: 'About',
    aboutP1:
      "I've spent fifteen years building and scaling products in fintech, e-commerce, and enterprise software, including engineering leadership at Zalando, Klarna, and Trade Republic.",
    aboutP2a: 'Now I do three kinds of work, usually together.',
    strategy: 'Strategy:',
    strategyBody:
      'I help teams decide how automation and agents fit into their engineering work, and how to evaluate the results.',
    teaching: 'Teaching:',
    teachingBody:
      'I coach engineers, leads, and founders to work with agents, using their own codebase and backlog.',
    design: 'Design and build:',
    designBody:
      'I build automation, workflows, and AI agents that take on work alongside the team.',
    company: 'Company',
    founder: 'Founder',
    companyDesc:
      'Strategy, coaching, and automation for enterprise teams developing their agentic engineering practice.',
    write: 'Things I write',
    allPosts: 'All posts →',
    build: 'Things I build',
    allProjects: 'All projects on GitHub →',
  },
  write: {
    title: 'Writing — Dario Farzati',
    description:
      'Essays on agentic engineering, systems architecture, and working with AI in production.',
    heading: 'Things I write',
    back: '← All posts',
  },
  contact: {
    title: 'Contact — Dario Farzati',
    description:
      'Get in touch with Dario Farzati about installing agentic practice, advisory, coaching, or speaking.',
    tag: 'Contact',
    heading: 'Get in touch.',
    lede: 'Email is the best way to reach me. I read everything and reply to what I can.',
    about: 'What to reach out about',
    engagements: 'Engagements',
    engagementsBody:
      '— installing agentic practice, coaching, or building agents and workflows, for a team or through Sinumo.',
    advisory: 'Advisory',
    advisoryBody: '— a second opinion on an AI effort that has stalled at the demo stage.',
    speaking: 'Speaking and press',
    speakingBody: '— talks, workshops, podcasts and interviews on agentic engineering.',
    elsewhere: 'Elsewhere',
    linkedin: '— for a quick professional hello.',
    github: '— public code and repositories.',
    sinumo: '— the studio, and the writing.',
  },
  privacy: {
    title: 'Privacy Policy — Dario Farzati',
    description: 'Privacy policy and data protection details for lufzle.dev.',
    tag: 'Privacy',
    heading: 'Privacy policy.',
    updated: 'Last updated: September 2026',
    who: 'Who is responsible',
    whoBody: 'Dario Farzati. Questions about this policy or your data:',
    what: 'What this site collects',
    whatBody:
      'This site sets two preference cookies on your device: df-lang for language (English or Spanish) and df-theme for light or dark. Both are written in the browser, are not used to identify you, and are not required to use the site. The Hyperdimensional CGA theme is not stored. There is no analytics. The site is hosted in the United States. The hosting provider logs requests (IP address, time, page, browser) for security and operational purposes and retains them for a limited period.',
    theme: 'Theme and language preferences',
    themeBody:
      'Your language choice and your light or dark choice are stored in cookies on your device so the site can remember them on the next visit. The CGA theme is session-only and is never written to a cookie.',
    email: 'When you email me',
    emailBody:
      'Your address and message are stored to answer you and kept as long as the correspondence is relevant. They are not shared with third parties.',
    links: 'External links',
    linksBody: 'Links to LinkedIn, GitHub and sinumo.com lead to services with their own privacy policies.',
    rights: 'Your rights',
    rightsBody:
      'Depending on where you live, you may have the right to access, correct or delete your personal data, or to object to its processing. Write to the address above and I will respond.',
  },
};

const es: typeof en = {
  meta: {
    title: 'Dario Farzati — Estratega de IA · Educador · Diseñador de producto',
    description:
      'Ayudo a los equipos a desarrollar su práctica de ingeniería agéntica: automatización, flujos de trabajo y agentes de IA que contribuyen como compañeros de equipo.',
  },
  nav: {
    writing: 'Escritos',
    contact: 'Contacto',
    langLabel: 'Idioma',
  },
  footer: {
    email: 'Email',
    contact: 'Contacto',
    privacy: 'Privacidad',
  },
  theme: {
    toggle: 'Cambiar tema (mantén pulsado para una sorpresa)',
    hold: 'Mantén pulsado para Hyperdimensional CGA',
    back: 'Volver al presente',
  },
  home: {
    subtitle: 'Estratega de IA · Educador · Diseñador de producto',
    lede: 'Ayudo a los equipos a desarrollar su práctica de ingeniería agéntica: automatización, flujos de trabajo y agentes de IA que contribuyen como compañeros de equipo.',
    cta: 'Escríbeme',
    about: 'Sobre mí',
    aboutP1:
      'He pasado quince años construyendo y escalando productos en fintech, comercio electrónico y software empresarial, incluyendo liderazgo de ingeniería en Zalando, Klarna y Trade Republic.',
    aboutP2a: 'Ahora hago tres tipos de trabajo, casi siempre juntos.',
    strategy: 'Estrategia:',
    strategyBody:
      'Ayudo a los equipos a decidir cómo encajan la automatización y los agentes en su trabajo de ingeniería, y cómo evaluar los resultados.',
    teaching: 'Formación:',
    teachingBody:
      'Acompaño a ingenieros, líderes y fundadores para trabajar con agentes, utilizando su propia base de código y backlog.',
    design: 'Diseño y construcción:',
    designBody:
      'Construyo automatización, flujos de trabajo y agentes de IA que asumen trabajo junto al equipo.',
    company: 'Empresa',
    founder: 'Fundador',
    companyDesc:
      'Estrategia, acompañamiento y automatización para equipos empresariales que desarrollan su práctica de ingeniería agéntica.',
    write: 'Cosas que escribo',
    allPosts: 'Todos los textos →',
    build: 'Cosas que construyo',
    allProjects: 'Todos los proyectos en GitHub →',
  },
  write: {
    title: 'Escritos — Dario Farzati',
    description:
      'Ensayos sobre ingeniería agéntica, arquitectura de sistemas y trabajo con IA en producción.',
    heading: 'Cosas que escribo',
    back: '← Todos los textos',
  },
  contact: {
    title: 'Contacto — Dario Farzati',
    description:
      'Ponte en contacto con Dario Farzati para implantar práctica agéntica, asesoría, formación o conferencias.',
    tag: 'Contacto',
    heading: 'Escríbeme.',
    lede: 'El email es la mejor forma de encontrarme. Leo todo y respondo lo que puedo.',
    about: 'De qué escribirme',
    engagements: 'Encargos',
    engagementsBody:
      '— instalar práctica agéntica, acompañamiento, o construir agentes y flujos, para un equipo o a través de Sinumo.',
    advisory: 'Asesoría',
    advisoryBody: '— una segunda opinión sobre un esfuerzo de IA que se quedó en la etapa de demo.',
    speaking: 'Charlas y prensa',
    speakingBody: '— charlas, talleres, podcasts y entrevistas sobre ingeniería agéntica.',
    elsewhere: 'En otros lados',
    linkedin: '— para un saludo profesional breve.',
    github: '— código público y repositorios.',
    sinumo: '— el estudio, y los textos.',
  },
  privacy: {
    title: 'Política de privacidad — Dario Farzati',
    description: 'Política de privacidad y protección de datos de lufzle.dev.',
    tag: 'Privacidad',
    heading: 'Política de privacidad.',
    updated: 'Última actualización: septiembre de 2026',
    who: 'Quién es responsable',
    whoBody: 'Dario Farzati. Preguntas sobre esta política o sobre tus datos:',
    what: 'Qué recoge este sitio',
    whatBody:
      'Este sitio guarda dos cookies de preferencia en tu dispositivo: df-lang para el idioma (inglés o español) y df-theme para claro u oscuro. Las dos se escriben en el navegador, no se usan para identificarte y no son necesarias para usar el sitio. El tema Hyperdimensional CGA no se guarda. No hay analítica. El sitio está alojado en Estados Unidos. El proveedor de hosting registra las peticiones (dirección IP, hora, página, navegador) por seguridad y operación, y las conserva durante un periodo limitado.',
    theme: 'Preferencias de tema e idioma',
    themeBody:
      'Tu elección de idioma y tu elección de claro u oscuro se guardan en cookies en tu dispositivo para que el sitio las recuerde en la próxima visita. El tema CGA dura solo la sesión y nunca se escribe en una cookie.',
    email: 'Cuando me escribes',
    emailBody:
      'Tu dirección y tu mensaje se guardan para responderte y se conservan mientras la correspondencia sea relevante. No se comparten con terceros.',
    links: 'Enlaces externos',
    linksBody: 'Los enlaces a LinkedIn, GitHub y sinumo.com llevan a servicios con sus propias políticas de privacidad.',
    rights: 'Tus derechos',
    rightsBody:
      'Según dónde vivas, puedes tener derecho a acceder, corregir o borrar tus datos personales, o a oponerte a su tratamiento. Escribe a la dirección de arriba y responderé.',
  },
};

export const ui = { en, es };

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'es';
}

export function useUi(locale: string | undefined) {
  return locale === 'es' ? ui.es : ui.en;
}

export function asLocale(locale: string | undefined): Locale {
  return locale === 'es' ? 'es' : 'en';
}
