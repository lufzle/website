import type { Locale } from '../i18n/ui';

export interface Project {
  title: string;
  summary: Record<Locale, string>;
  meta: Record<Locale, string>;
  url?: string;
}

export const builds: Project[] = [
  {
    title: 'Aleph',
    summary: {
      en: 'Knowledge graph system.',
      es: 'Sistema de grafos de conocimiento.',
    },
    meta: {
      en: 'In progress · 2026',
      es: 'En desarrollo · 2026',
    },
  },
  {
    title: 'Kobold',
    summary: {
      en: 'Decoupled multi-lane harness and streaming client for autonomous coding agents.',
      es: 'Arnés multicanal desacoplado y cliente de streaming para agentes de código autónomos.',
    },
    meta: {
      en: 'OSS · 2026',
      es: 'OSS · 2026',
    },
    url: 'https://github.com/p7a-os/kobold',
  },
  {
    title: 'Lemul',
    summary: {
      en: 'Remote, sandboxed Claude Code workspaces in your own AWS account.',
      es: 'Espacios de trabajo remotos y aislados para Claude Code en tu propia cuenta de AWS.',
    },
    meta: {
      en: 'OSS · 2026',
      es: 'OSS · 2026',
    },
    url: 'https://github.com/lufzle/lemul',
  },
];
