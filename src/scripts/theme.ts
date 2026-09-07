import { readCookie, writeCookie, THEME_COOKIE } from './cookies';

export type Theme = 'dark' | 'light' | 'cga';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gradient(theme: string, seed = 1): string {
  const r = rng(seed * 7919 + (theme === 'light' ? 13 : 0));
  const dark = ['#090909', '#0f0f11', '#141416', '#0b0c0d', '#171718', '#0d0d10', '#121213'];
  const light = ['#f7f6f3', '#fcfbf9', '#efeeeb', '#f3f2ef', '#faf9f6', '#ebeae7', '#f1f0ed'];
  const s = theme === 'light' ? light : dark;
  const pick = () => s[Math.floor(r() * s.length)];
  const layers: string[] = [];
  for (let i = 0; i < 3; i++) {
    const ang = Math.round(r() * 360);
    const p1 = Math.round(20 + r() * 30);
    const p2 = Math.round(55 + r() * 35);
    layers.push(`linear-gradient(${ang}deg, ${pick()} 0%, transparent ${p1}%, transparent ${p2}%, ${pick()} 100%)`);
  }
  layers.push(`linear-gradient(${Math.round(r() * 360)}deg, ${pick()}, ${pick()})`);
  return layers.join(', ');
}

declare global {
  interface Window {
    __dfThemeState?: {
      theme: Theme;
      holdTimer?: ReturnType<typeof setTimeout>;
      fired?: boolean;
      cgaLoaded?: boolean;
    };
  }
}

function persistableTheme(theme: Theme): 'dark' | 'light' | null {
  return theme === 'dark' || theme === 'light' ? theme : null;
}

function getStoredTheme(): Theme {
  try {
    const saved = readCookie(THEME_COOKIE);
    if (saved === 'dark' || saved === 'light') return saved;
    const legacy = localStorage.getItem('df-theme');
    if (legacy === 'dark' || legacy === 'light') {
      writeCookie(THEME_COOKIE, legacy);
      return legacy;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: Theme) {
  if (!window.__dfThemeState) {
    window.__dfThemeState = { theme };
  } else {
    window.__dfThemeState.theme = theme;
  }

  document.documentElement.dataset.theme = theme;
  const isCga = theme === 'cga';

  // Update background
  const bgLayer = document.getElementById('bg-layer');
  if (bgLayer) {
    bgLayer.style.background = isCga ? '#000000' : gradient(theme, 1);
  }

  // Update CRT scanlines overlay
  const scanlines = document.getElementById('cga-scanlines');
  if (scanlines) {
    scanlines.style.display = isCga ? 'block' : 'none';
  }

  // Update portraits
  const portraitNormal = document.getElementById('portrait-normal');
  const portraitCga = document.getElementById('portrait-cga');
  if (portraitNormal) portraitNormal.style.display = isCga ? 'none' : 'block';
  if (portraitCga) portraitCga.style.display = isCga ? 'block' : 'none';

  // Update blinking CGA cursor
  const cursor = document.getElementById('cga-cursor');
  if (cursor) cursor.style.display = isCga ? 'inline' : 'none';

  // Update Theme Toggle Button SVG elements
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    const es = document.documentElement.lang === 'es';
    btn.setAttribute(
      'title',
      isCga ? (es ? 'Volver al presente' : 'Back to the present') : es ? 'Mantén pulsado para Hyperdimensional CGA' : 'Hold for Hyperdimensional CGA',
    );
    btn.setAttribute(
      'aria-label',
      isCga
        ? es
          ? 'Volver al presente'
          : 'Back to the present'
        : es
          ? 'Cambiar tema (mantén pulsado para una sorpresa)'
          : 'Toggle theme (hold for a surprise)',
    );

    const moon = document.getElementById('theme-icon-moon');
    if (moon) {
      moon.style.transform = `translateY(${theme === 'dark' ? 0 : -26}px)`;
    }

    const rays = document.getElementById('theme-icon-rays');
    if (rays) {
      rays.style.transform = `translateY(${isCga ? 0 : 26}px)`;
    }

    const sun = document.getElementById('theme-icon-sun');
    if (sun) {
      sun.style.transform = `translateY(${theme === 'light' ? 0 : 26}px)`;
    }

    const moonCutout = document.getElementById('theme-icon-moon-cutout');
    if (moonCutout) {
      moonCutout.setAttribute('fill', theme === 'light' ? '#f5f4f1' : '#111113');
    }
  }

  // Load CGA font if needed
  if (isCga && !window.__dfThemeState.cgaLoaded) {
    window.__dfThemeState.cgaLoaded = true;
    try {
      const cga = new FontFace('Web IBM CGA', 'url(/fonts/WebPlus_IBM_CGA.woff) format("woff")');
      cga.load().then(f => document.fonts.add(f)).catch(() => {});
    } catch {}
  }
}

let vtToken = 0;
let cgaTimer: ReturnType<typeof setTimeout> | null = null;

export async function setTheme(t: Theme) {
  const currentTheme = window.__dfThemeState?.theme || getStoredTheme();
  if (t === currentTheme) return;

  try {
    const stored = persistableTheme(t);
    if (stored) writeCookie(THEME_COOKIE, stored);
  } catch {}

  const wasCga = currentTheme === 'cga';
  const enteringCga = t === 'cga';
  const exitingCga = wasCga && t !== 'cga';
  const canvas = document.getElementById('fx-canvas') as HTMLCanvasElement | null;

  if (cgaTimer) {
    clearTimeout(cgaTimer);
    cgaTimer = null;
  }

  if ((enteringCga || exitingCga) && canvas) {
    vtToken++;
    delete document.documentElement.dataset.vt;

    try {
      const { runHorizon } = await import('./horizon');
      // dir = 1 when entering CGA, -1 when returning from CGA to the present
      runHorizon(canvas, 900, enteringCga ? 1 : -1).catch(() => {});
    } catch {}

    // Switch theme under the event-horizon warp halfway through
    cgaTimer = setTimeout(() => {
      applyTheme(t);
      cgaTimer = null;
    }, 450);
  } else {
    if (document.startViewTransition) {
      const currentToken = ++vtToken;
      document.documentElement.dataset.vt = t;

      try {
        const vt = document.startViewTransition(() => {
          applyTheme(t);
        });

        vt.finished
          .catch(() => {})
          .finally(() => {
            if (vtToken === currentToken) {
              delete document.documentElement.dataset.vt;
            }
          });
      } catch {
        if (vtToken === currentToken) {
          delete document.documentElement.dataset.vt;
        }
        applyTheme(t);
      }
    } else {
      applyTheme(t);
    }
  }
}

export function initTheme() {
  const t = window.__dfThemeState?.theme === 'cga' ? 'cga' : getStoredTheme();
  applyTheme(t);

  const btn = document.getElementById('theme-toggle-btn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = 'true';

    btn.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (!window.__dfThemeState) window.__dfThemeState = { theme: getStoredTheme() };
      window.__dfThemeState.fired = false;
      clearTimeout(window.__dfThemeState.holdTimer);
      window.__dfThemeState.holdTimer = setTimeout(() => {
        if (window.__dfThemeState) {
          window.__dfThemeState.fired = true;
          setTheme('cga');
        }
      }, 800);
    });

    btn.addEventListener('pointerup', () => {
      if (!window.__dfThemeState) return;
      clearTimeout(window.__dfThemeState.holdTimer);
      if (window.__dfThemeState.fired) {
        setTimeout(() => {
          if (window.__dfThemeState) window.__dfThemeState.fired = false;
        }, 100);
        return;
      }
      const cur = window.__dfThemeState.theme;
      setTheme(cur === 'cga' ? 'dark' : cur === 'dark' ? 'light' : 'dark');
    });

    const cancelHold = () => {
      if (window.__dfThemeState) {
        clearTimeout(window.__dfThemeState.holdTimer);
      }
    };

    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('pointercancel', cancelHold);

    btn.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });
  }
}
