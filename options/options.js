(function() {
  const DEFAULTS = {
    enabled: true,
    followSystem: false,
    brightness: 0,
    contrast: 0,
    temperature: 0
  };

  const toggle = document.getElementById('dark-toggle');
  const followSystem = document.getElementById('follow-system');
  const brightness = document.getElementById('brightness');
  const contrast = document.getElementById('contrast');
  const temperature = document.getElementById('temperature');
  const brightnessVal = document.getElementById('brightness-val');
  const contrastVal = document.getElementById('contrast-val');
  const temperatureVal = document.getElementById('temperature-val');
  const resetBtn = document.getElementById('reset-defaults');
  const toast = document.getElementById('toast');

  let toastTimer = null;
  let currentSettings = { ...DEFAULTS };

  function showToast(msg) {
    toast.textContent = msg || '设置已保存';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function updateLabel(el, val) {
    el.textContent = val > 0 ? `+${val}` : val;
  }

  function applyPreviewTheme(settings) {
    const preview = document.getElementById('preview-container');
    const html = document.documentElement;

    const brightnessFactor = (settings.brightness || 0) / 100;
    const contrastFactor = (settings.contrast || 0) / 100;
    const temperatureFactor = (settings.temperature || 0) / 100;

    const isDark = !!(settings.followSystem
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : settings.enabled);

    html.setAttribute('data-theme', isDark ? 'dark' : 'light');

    if (isDark) {
      let bgBase = '#1e1e1e';
      let bgCard = '#252526';
      let bgHover = '#2d2d2d';
      let textBase = '#d4d4d4';
      let textSec = '#9d9d9d';
      let textMuted = '#6e6e6e';
      let border = '#3e3e3e';

      if (brightnessFactor > 0) {
        bgBase = lerpColor(bgBase, '#3a3a3a', brightnessFactor);
        bgCard = lerpColor(bgCard, '#404040', brightnessFactor);
        bgHover = lerpColor(bgHover, '#484848', brightnessFactor);
      } else if (brightnessFactor < 0) {
        bgBase = lerpColor(bgBase, '#0a0a0a', -brightnessFactor);
        bgCard = lerpColor(bgCard, '#121212', -brightnessFactor);
        bgHover = lerpColor(bgHover, '#1a1a1a', -brightnessFactor);
      }

      if (contrastFactor > 0) {
        textBase = lerpColor(textBase, '#ffffff', contrastFactor);
        textSec = lerpColor(textSec, '#cccccc', contrastFactor);
      } else if (contrastFactor < 0) {
        textBase = lerpColor(textBase, '#999999', -contrastFactor);
        textSec = lerpColor(textSec, '#777777', -contrastFactor);
      }

      if (temperatureFactor !== 0) {
        bgBase = shiftHue(bgBase, temperatureFactor * 15);
        bgCard = shiftHue(bgCard, temperatureFactor * 15);
        textBase = shiftHue(textBase, temperatureFactor * 10);
      }

      bgCard = lerpColor(bgBase, bgCard, 1);

      preview.style.setProperty('--preview-bg', bgBase, 'important');
      preview.style.setProperty('--preview-card', bgCard, 'important');
      preview.style.setProperty('--preview-hover', bgHover, 'important');
      preview.style.setProperty('--preview-text', textBase, 'important');
      preview.style.setProperty('--preview-text-sec', textSec, 'important');
      preview.style.setProperty('--preview-text-muted', textMuted, 'important');
      preview.style.setProperty('--preview-border', border, 'important');

      preview.style.cssText = `background:${bgBase};color:${textBase}`;
    } else {
      preview.style.removeProperty('--preview-bg');
      preview.style.removeProperty('--preview-card');
      preview.style.removeProperty('--preview-hover');
      preview.style.removeProperty('--preview-text');
      preview.style.removeProperty('--preview-text-sec');
      preview.style.removeProperty('--preview-text-muted');
      preview.style.removeProperty('--preview-border');
      preview.style.cssText = '';
    }
  }

  function lerpColor(hex1, hex2, t) {
    const r1 = parseInt(hex1.slice(1,3), 16);
    const g1 = parseInt(hex1.slice(3,5), 16);
    const b1 = parseInt(hex1.slice(5,7), 16);
    const r2 = parseInt(hex2.slice(1,3), 16);
    const g2 = parseInt(hex2.slice(3,5), 16);
    const b2 = parseInt(hex2.slice(5,7), 16);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return '#' + [r,g,b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2,'0')).join('');
  }

  function shiftHue(hex, degrees) {
    const r = parseInt(hex.slice(1,3), 16) / 255;
    const g = parseInt(hex.slice(3,5), 16) / 255;
    const b = parseInt(hex.slice(5,7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    h = ((h * 360 + degrees) % 360 + 360) % 360 / 360;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const R = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const G = Math.round(hue2rgb(p, q, h) * 255);
    const B = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    return '#' + [R,G,B].map(c => c.toString(16).padStart(2,'0')).join('');
  }

  function loadSettings() {
    chrome.storage.sync.get('tapd_settings', data => {
      const s = data.tapd_settings || DEFAULTS;
      currentSettings = { ...DEFAULTS, ...s };
      toggle.checked = !!currentSettings.enabled;
      followSystem.checked = !!currentSettings.followSystem;
      brightness.value = currentSettings.brightness || 0;
      contrast.value = currentSettings.contrast || 0;
      temperature.value = currentSettings.temperature || 0;
      updateLabel(brightnessVal, brightness.value);
      updateLabel(contrastVal, contrast.value);
      updateLabel(temperatureVal, temperature.value);
      applyPreviewTheme(currentSettings);
    });
  }

  function saveSettings(showToastMsg) {
    const settings = {
      enabled: toggle.checked,
      followSystem: followSystem.checked,
      brightness: parseInt(brightness.value, 10),
      contrast: parseInt(contrast.value, 10),
      temperature: parseInt(temperature.value, 10)
    };
    currentSettings = settings;
    chrome.storage.sync.set({ tapd_settings: settings }, () => {
      if (showToastMsg) showToast('设置已保存');
    });
    applyPreviewTheme(settings);
  }

  toggle.addEventListener('change', () => {
    if (toggle.checked && followSystem.checked) {
      followSystem.checked = false;
    }
    saveSettings(true);
  });

  followSystem.addEventListener('change', () => {
    if (followSystem.checked) {
      toggle.checked = true;
    }
    saveSettings(true);
  });

  [brightness, contrast, temperature].forEach(slider => {
    let timeout;
    slider.addEventListener('input', function() {
      if (this.id === 'brightness') updateLabel(brightnessVal, this.value);
      if (this.id === 'contrast') updateLabel(contrastVal, this.value);
      if (this.id === 'temperature') updateLabel(temperatureVal, this.value);
      clearTimeout(timeout);
      timeout = setTimeout(() => saveSettings(false), 200);
      applyPreviewTheme({
        enabled: toggle.checked,
        followSystem: followSystem.checked,
        brightness: parseInt(brightness.value, 10),
        contrast: parseInt(contrast.value, 10),
        temperature: parseInt(temperature.value, 10)
      });
    });
  });

  resetBtn.addEventListener('click', () => {
    toggle.checked = DEFAULTS.enabled;
    followSystem.checked = DEFAULTS.followSystem;
    brightness.value = DEFAULTS.brightness;
    contrast.value = DEFAULTS.contrast;
    temperature.value = DEFAULTS.temperature;
    updateLabel(brightnessVal, '0');
    updateLabel(contrastVal, '0');
    updateLabel(temperatureVal, '0');
    saveSettings(true);
  });

  loadSettings();
})();
