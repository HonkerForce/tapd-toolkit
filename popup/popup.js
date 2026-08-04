document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-toggle');
  const followSystem = document.getElementById('follow-system');
  const brightness = document.getElementById('brightness');
  const contrast = document.getElementById('contrast');
  const temperature = document.getElementById('temperature');
  const brightnessVal = document.getElementById('brightness-val');
  const contrastVal = document.getElementById('contrast-val');
  const temperatureVal = document.getElementById('temperature-val');
  const statusEl = document.getElementById('status-indicator');

  function updateLabel(el, val) {
    if (el) el.textContent = val > 0 ? `+${val}` : val;
  }

  function loadSettings() {
    chrome.storage.sync.get('tapd_settings', data => {
      const s = data.tapd_settings || {};
      toggle.checked = !!s.enabled;
      followSystem.checked = !!s.followSystem;
      brightness.value = s.brightness || 0;
      contrast.value = s.contrast || 0;
      temperature.value = s.temperature || 0;
      updateLabel(brightnessVal, brightness.value);
      updateLabel(contrastVal, contrast.value);
      updateLabel(temperatureVal, temperature.value);
      updateStatus();
    });
  }

  function saveSettings() {
    const settings = {
      enabled: toggle.checked,
      followSystem: followSystem.checked,
      brightness: parseInt(brightness.value, 10),
      contrast: parseInt(contrast.value, 10),
      temperature: parseInt(temperature.value, 10)
    };
    chrome.storage.sync.set({ tapd_settings: settings }, () => {
      updateStatus();
    });
  }

  function updateStatus() {
    if (toggle.checked) {
      statusEl.textContent = '暗色模式';
      statusEl.style.color = '#4a9eff';
    } else {
      statusEl.textContent = '亮色模式';
      statusEl.style.color = '#888';
    }
  }

  toggle.addEventListener('change', () => {
    if (toggle.checked && followSystem.checked) {
      followSystem.checked = false;
    }
    saveSettings();
  });

  followSystem.addEventListener('change', () => {
    if (followSystem.checked) {
      toggle.checked = true;
    }
    saveSettings();
  });

  [brightness, contrast, temperature].forEach(slider => {
    let timeout;
    slider.addEventListener('input', function() {
      const id = this.id;
      if (id === 'brightness') updateLabel(brightnessVal, this.value);
      if (id === 'contrast') updateLabel(contrastVal, this.value);
      if (id === 'temperature') updateLabel(temperatureVal, this.value);
      clearTimeout(timeout);
      timeout = setTimeout(saveSettings, 300);
    });
  });

  document.getElementById('open-options').addEventListener('click', e => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });

  loadSettings();
});
