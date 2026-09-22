(function () {
  var PRICES = {
    sprint: { usd: '597€', eur: '597€' },
    perVideo: { usd: '59,70€', eur: '59,70€' },
    perVideoRange: { usd: '59,70€ por vídeo', eur: '59,70€ por vídeo' },
    discounted: { usd: '507,45€', eur: '507,45€' },
    insteadOf: { usd: '507,45€ en vez de 597€', eur: '507,45€ en vez de 597€' },
    offBrief: { usd: '15% dto. (507,45€)', eur: '15% dto. (507,45€)' },
    strike: { usd: '1.100€', eur: '1.100€' },
    saveBadge: { usd: 'AHORRA 46% (503€)', eur: 'AHORRA 46% (503€)' },
    vsBatch: { usd: 'frente a 1.100€–2.300€ con creadores', eur: 'frente a 1.100€–2.300€ con creadores' },
    tradRange: { usd: '1.100€ – 2.300€+', eur: '1.100€ – 2.300€+' },
    tradCost: { usd: '230€ – 650€+ por vídeo', eur: '230€ – 650€+ por vídeo' },
    extraHook: { usd: '+45€ – 90€ por hook extra', eur: '+45€ – 90€ por hook extra' },
    creatorRate: { usd: '275€ × 4 creadores', eur: '275€ × 4 creadores' },
    oneCreator: { usd: '450€', eur: '450€' },
    sprintTotal: { usd: '(597€ en total)', eur: '(597€ en total)' },
    perTen: { usd: '/ 10 creatividades', eur: '/ 10 creatividades' }
  };

  function timezoneLooksSpanish() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return tz === 'Europe/Madrid' || tz === 'Atlantic/Canary' || tz === 'Africa/Ceuta';
    } catch (e) {
      return false;
    }
  }

  function languageLooksSpain() {
    var langs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    return langs.indexOf('es-es') !== -1;
  }

  function queryMarket() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get('market') || '').toLowerCase();
      if (q === 'es' || q === 'spain') return 'es';
      if (q === 'us' || q === 'en') return 'us';
    } catch (e) {}
    return '';
  }

  function detectSpainSync() {
    var forced = queryMarket();
    if (forced === 'es') return true;
    if (forced === 'us') return false;
    try {
      if (sessionStorage.getItem('sevenai_market') === 'es') return true;
      if (sessionStorage.getItem('sevenai_market') === 'us') return false;
    } catch (e) {}
    return timezoneLooksSpanish() || languageLooksSpain();
  }

  function applyPrices(isSpain) {
    var key = isSpain ? 'eur' : 'usd';
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var map = PRICES[el.getAttribute('data-price')];
      if (map && map[key]) el.textContent = map[key];
    });
    document.documentElement.setAttribute('data-market', isSpain ? 'es' : 'us');
  }

  function applySpainCopy(isSpain) {
    document.querySelectorAll('[data-es]').forEach(function (el) {
      var en = el.getAttribute('data-en');
      var es = el.getAttribute('data-es');
      if (!en) el.setAttribute('data-en', el.textContent);
      en = el.getAttribute('data-en');
      if (isSpain && es) el.textContent = es;
      else if (en) el.textContent = en;
    });
  }

  function applySpain(isSpain) {
    applyPrices(isSpain);
    applySpainCopy(isSpain);
    window.SEVENAI_MARKET = isSpain ? 'es' : 'us';
    try { sessionStorage.setItem('sevenai_market', isSpain ? 'es' : 'us'); } catch (e) {}

    if (isSpain && window.SYSTEM_PROMPT && window.SYSTEM_PROMPT.indexOf('Spain EUR pricing') === -1) {
      window.SYSTEM_PROMPT += '\n   - Pricing is in euros for every visitor: 597€ for 10 videos (59,70€/video). Complete-brief discount is 15% = 507,45€. Contact is a 30-minute call only; there is no message form.';
    }
  }

  function confirmWithIp(alreadySpain) {
    if (queryMarket()) return;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (controller) controller.abort();
    }, 1800);
    fetch('https://ipapi.co/json/', controller ? { signal: controller.signal } : undefined)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        clearTimeout(timer);
        if (!data || !data.country_code) return;
        var fromSpain = data.country_code === 'ES';
        if (fromSpain !== alreadySpain) applySpain(fromSpain);
      })
      .catch(function () {
        clearTimeout(timer);
      });
  }

  applySpain(true);

  function setContactTab(tab) {
    var brief = document.getElementById('contact-form');
    var call = document.getElementById('call-form');
    var tabs = document.querySelectorAll('[data-contact-tab]');
    tabs.forEach(function (btn) {
      var active = btn.getAttribute('data-contact-tab') === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (brief) brief.hidden = tab !== 'brief';
    if (call) call.hidden = tab !== 'call';
  }

  function focusCallForm() {
    var name = document.getElementById('call-nombre');
    var box = document.getElementById('formulario');
    var target = name || box;
    if (target) {
      var top = target.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    if (name) window.setTimeout(function () { name.focus({ preventScroll: true }); }, 500);
  }

  document.addEventListener('click', function (e) {
    var tabBtn = e.target.closest('[data-contact-tab]');
    if (tabBtn) {
      e.preventDefault();
      setContactTab(tabBtn.getAttribute('data-contact-tab'));
      focusCallForm();
      return;
    }
    var link = e.target.closest('a[href="#formulario"], a[href="#contacto"]');
    if (link && document.getElementById('formulario')) {
      e.preventDefault();
      if (location.hash !== '#formulario') history.pushState(null, '', '#formulario');
      focusCallForm();
    }
  });

  if (window.location.hash === '#formulario' || window.location.hash === '#contacto' || window.location.hash === '#llamada' || window.location.hash === '#call') {
    setContactTab('call');
    window.setTimeout(focusCallForm, 80);
  }
})();
