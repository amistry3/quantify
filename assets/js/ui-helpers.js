// Shared UI helpers for HeroZero calculators
(function(){
  // Format number in Indian locale (no currency symbol)
  function HZ_formatINR(num, fd = 0){
    const n = Number(num) || 0;
    return n.toLocaleString('en-IN', {maximumFractionDigits: fd});
  }

  // Animated count up. If isPercent true, show with %; otherwise prefix with ₹
  function HZ_countUp(el, to, duration = 700, isPercent = false){
    const from = Number((el.dataset.value||'0').replace(/[^0-9.-]/g,'')) || 0;
    const start = performance.now();
    function frame(t){
      const p = Math.min(Math.max((t - start) / duration, 0), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = from + (to - from) * ease;
      if(isPercent){
        el.textContent = `${val.toFixed(1)}%`;
      } else {
        el.textContent = '₹' + HZ_formatINR(val, 0);
      }
      if(p < 1) requestAnimationFrame(frame);
      else el.dataset.value = String(to);
    }
    requestAnimationFrame(frame);
  }

  // Style a range input with filled track (compatible with existing pages)
  function HZ_styleRange(r){
    if(!r || typeof r.min === 'undefined') return;
    const min = Number(r.min), max = Number(r.max), val = Number(r.value);
    const pct = ((val - min) / (max - min)) * 100;
    const dark = document.documentElement.classList.contains('dark');
    const filled = dark ? '#3b82f6' : '#0d6efd';
    const rest = dark ? '#334155' : '#e2e8f0';
    r.style.background = `linear-gradient(90deg, ${filled} 0%, ${filled} ${pct}%, ${rest} ${pct}%, ${rest} 100%)`;
  }

  // Expose on window for pages to call
  window.HZ_formatINR = HZ_formatINR;
  window.HZ_countUp = HZ_countUp;
  window.HZ_styleRange = HZ_styleRange;

  // Clamp a number between two values
  function HZ_clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }
  window.HZ_clamp = HZ_clamp;

  // Dark mode toggle
  (function () {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const stored = localStorage.getItem('hz-theme');
    if (stored === 'dark') {
      root.classList.add('dark');
      btn && btn.setAttribute('aria-pressed', 'true');
      btn && (btn.textContent = '☀️');
    }
    btn && btn.addEventListener('click', () => {
      const isDark = root.classList.toggle('dark');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('hz-theme', isDark ? 'dark' : 'light');
      // Dispatch a custom event to notify charts of theme change
      window.dispatchEvent(new CustomEvent('themeChanged'));
    });
  })();

  // Ripple effect
  document.addEventListener('click', e => {
    const t = e.target.closest('.btn-ripple');
    if (!t) return;
    const r = document.createElement('span');
    r.className = 'ripple-anim';
    const rect = t.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size / 2) + 'px';
    r.style.top = (e.clientY - rect.top - size / 2) + 'px';
    t.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });

  // Sync sliders and number inputs
  function HZ_syncSliderAndInput(rangeId, inputId, triggerCalc) {
    const rangeEl = document.getElementById(rangeId);
    const inputEl = document.getElementById(inputId);
    if (!rangeEl || !inputEl) return;
    const sync = (src, dst) => {
      dst.value = src.value;
      if (typeof triggerCalc === 'function') {
        triggerCalc();
      }
    };
    rangeEl.addEventListener('input', () => {
      sync(rangeEl, inputEl);
      HZ_styleRange(rangeEl);
    });
    inputEl.addEventListener('input', () => {
      if (inputEl.min !== '' && +inputEl.value < +inputEl.min) inputEl.value = inputEl.min;
      if (inputEl.max !== '' && +inputEl.value > +inputEl.max) inputEl.value = inputEl.max;
      sync(inputEl, rangeEl);
    });
  }
  window.HZ_syncSliderAndInput = HZ_syncSliderAndInput;
})();
