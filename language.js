(() => {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-set-lang]')];
  const images = document.querySelectorAll('[data-alt-zh]');
  const labelled = document.querySelectorAll('[data-label-zh]');
  const languageKey = 'mingyang-portfolio-language';
  const pageMeta = {
    en: ['Mingyang Chang · Product, AI & Commercialization', 'Mingyang Chang’s portfolio on product development, applied AI, and commercialization.'],
    'zh-CN': ['常明阳 · 产品、AI 与商业化', '常明阳的个人作品集，关于产品开发、AI 应用与商业化。']
  };

  function selectLanguage(language, remember) {
    const chosen = language === 'zh-CN' ? 'zh-CN' : 'en';
    const chinese = chosen === 'zh-CN';
    root.lang = chosen;
    document.title = pageMeta[chosen][0];
    document.querySelector('meta[name="description"]').content = pageMeta[chosen][1];
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setLang === chosen)));
    images.forEach(image => { image.alt = chinese ? image.dataset.altZh : image.dataset.altEn; });
    labelled.forEach(element => element.setAttribute('aria-label', chinese ? element.dataset.labelZh : element.dataset.labelEn));
    if (remember) {
      try { localStorage.setItem(languageKey, chosen); } catch { /* The toggle still works for local files. */ }
    }
  }

  // Scale the fixed-pixel perspective correction with the image frame.
  const screenFrame = document.querySelector('.tech-hill-figure .media-frame');
  if (screenFrame && typeof ResizeObserver !== 'undefined') {
    const updateScreenScale = () => {
      screenFrame.style.setProperty('--screen-scale', screenFrame.clientWidth / 1696);
      screenFrame.setAttribute('data-rectified', '');
    };
    updateScreenScale();
    new ResizeObserver(updateScreenScale).observe(screenFrame);
  }

  let saved;
  try { saved = localStorage.getItem(languageKey); } catch { /* Default to English. */ }
  selectLanguage(saved, false);
  buttons.forEach(button => button.addEventListener('click', () => selectLanguage(button.dataset.setLang, true)));
})();