/**
 * Meta Pixel for sevenaii.com.
 * Pegar el Pixel ID aquí, o usar VITE_META_PIXEL_ID en .env / Vercel.
 */
const HARDCODED_PIXEL_ID = '';
const HARDCODED_DOMAIN_VERIFY = '';

const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const PIXEL_ID = String(
  (typeof window !== 'undefined' && window.SEVENAI_META_PIXEL_ID) ||
    viteEnv.VITE_META_PIXEL_ID ||
    HARDCODED_PIXEL_ID ||
    ''
).trim();

const DOMAIN_VERIFY = String(
  (typeof window !== 'undefined' && window.SEVENAI_META_DOMAIN_VERIFY) ||
    viteEnv.VITE_META_DOMAIN_VERIFY ||
    HARDCODED_DOMAIN_VERIFY ||
    ''
).trim();

const CONSENT_KEY = 'sevenai_ads_consent';
const CONTACT_SESSION_KEY = 'sevenai_meta_contact_fired';

let pixelReady = false;
let listenersBound = false;

function looksSpain() {
  try {
    if (window.SEVENAI_MARKET === 'es') return true;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Europe/Madrid' || tz === 'Atlantic/Canary' || tz === 'Africa/Ceuta') return true;
    const langs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    return langs.includes('es-es');
  } catch {
    return false;
  }
}

function isLocalhost() {
  const host = location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
}

function sprintValue() {
  return {
    value: 597,
    currency: 'EUR',
    content_name: 'Creative Testing Sprint',
    content_category: 'AI UGC ads',
  };
}

function injectDomainVerify() {
  if (!DOMAIN_VERIFY) return;
  if (document.querySelector('meta[name="facebook-domain-verification"]')) return;
  const meta = document.createElement('meta');
  meta.name = 'facebook-domain-verification';
  meta.content = DOMAIN_VERIFY;
  document.head.appendChild(meta);
}

function installFbqStub() {
  if (window.fbq) return;
  const n = (window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
}

function loadFbevents() {
  if (document.querySelector('script[src*="fbevents.js"]')) return;
  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(t, s);
}

function track(event, params, userData) {
  if (!pixelReady || typeof window.fbq !== 'function') return;
  const payload = params ? { ...params } : undefined;
  if (userData && (userData.em || userData.fn || userData.ph)) {
    window.fbq('track', event, payload || {}, userData);
    return;
  }
  window.fbq('track', event, payload);
}

function bindConversionListeners() {
  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest('a[href="#formulario"], a[href="#contacto"], a[href="/#formulario"], a[href="/#contacto"], a[href*="/#formulario"], a[href*="/#contacto"]');
      if (!link) return;
      try {
        if (sessionStorage.getItem(CONTACT_SESSION_KEY)) return;
        sessionStorage.setItem(CONTACT_SESSION_KEY, '1');
      } catch {
        /* continue */
      }
      track('Contact', {
        content_name: (link.textContent || 'Submit brief').replace(/\s+/g, ' ').trim().slice(0, 80),
      });
    },
    true
  );
}

function fireLandingEvents() {
  track('PageView');
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/creative-testing-sprint' || path.endsWith('/creative-testing-sprint')) {
    track('ViewContent', sprintValue());
  }
}

function enablePixel() {
  if (!PIXEL_ID || pixelReady) return;
  installFbqStub();
  loadFbevents();
  window.fbq('consent', 'grant');
  window.fbq('init', PIXEL_ID);
  pixelReady = true;
  fireLandingEvents();
  bindConversionListeners();
}

function injectBannerStyles() {
  if (document.getElementById('sevenai-cookie-styles')) return;
  const style = document.createElement('style');
  style.id = 'sevenai-cookie-styles';
  style.textContent = `
    #sevenai-cookie-banner {
      position: fixed;
      z-index: 70;
      left: 16px;
      right: 16px;
      bottom: calc(16px + env(safe-area-inset-bottom));
      max-width: 640px;
      margin: 0 auto;
      padding: 18px 20px;
      border-radius: 18px;
      background: #111111;
      color: #fff;
      box-shadow: 0 18px 50px rgba(0,0,0,.28);
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    }
    #sevenai-cookie-banner p {
      margin: 0 0 14px;
      font-size: 13px;
      line-height: 1.55;
      color: #e5e5ea;
    }
    #sevenai-cookie-banner a { color: #d8b4fe; }
    #sevenai-cookie-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    #sevenai-cookie-actions button {
      border: 0;
      cursor: pointer;
      border-radius: 999px;
      padding: 9px 16px;
      font-size: 12px;
      font-weight: 700;
    }
    #sevenai-cookie-accept { background: #9333ea; color: #fff; }
    #sevenai-cookie-reject { background: #fff; color: #111; }
  `;
  document.head.appendChild(style);
}

function showConsentBanner() {
  if (document.getElementById('sevenai-cookie-banner')) return;
  injectBannerStyles();
  const banner = document.createElement('div');
  banner.id = 'sevenai-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookies de publicidad');
  banner.innerHTML = `<p>Usamos el píxel de Meta para medir campañas y saber qué anuncios generan briefs. Puedes aceptar o rechazar las cookies de publicidad. Más info en la <a href="/cookies">política de cookies</a>.</p>
       <div id="sevenai-cookie-actions">
         <button type="button" id="sevenai-cookie-accept">Aceptar</button>
         <button type="button" id="sevenai-cookie-reject">Rechazar</button>
       </div>`;
  document.body.appendChild(banner);
  document.getElementById('sevenai-cookie-accept').addEventListener('click', () => {
    setConsent('granted');
    banner.remove();
    enablePixel();
  });
  document.getElementById('sevenai-cookie-reject').addEventListener('click', () => {
    setConsent('denied');
    banner.remove();
  });
}

function boot() {
  injectDomainVerify();
  window.sevenaiTrack = function (event, params, userData) {
    if (!pixelReady) return;
    track(event, params, userData);
  };
  window.sevenaiTrackLead = function (userData) {
    window.sevenaiTrack('Lead', sprintValue(), userData || {});
  };
  window.sevenaiTrackSchedule = function (userData) {
    window.sevenaiTrack('Schedule', sprintValue(), userData || {});
  };

  if (!PIXEL_ID) {
    if (isLocalhost()) {
      console.warn('[sevenai] Meta Pixel ID missing. Set VITE_META_PIXEL_ID in .env');
    }
    return;
  }

  const consent = getConsent();
  if (consent === 'granted' || isLocalhost()) {
    if (isLocalhost() && consent !== 'denied') enablePixel();
    else if (consent === 'granted') enablePixel();
  }

  if (consent === 'denied') return;

  if (consent !== 'granted' && !isLocalhost()) {
    if (document.body) showConsentBanner();
    else document.addEventListener('DOMContentLoaded', showConsentBanner);
  }
}

boot();
