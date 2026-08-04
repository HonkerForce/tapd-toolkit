(function() {
  'use strict';

  const FLOATING_BTN_ID = 'tapd-helper-toggle';
  let styleElement = null;
  let currentSettings = { enabled: true, brightness: 0, contrast: 0, temperature: 0, followSystem: true };
  let periodicTimer = null;
  let mutationObserver = null;
  let styleObserver = null;

  function getSystemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function injectThemeCSS(settings) {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'tapd-helper-style';
      document.documentElement.appendChild(styleElement);
    }
    const css = window.TAPDHelper.generateThemeCSS(settings);
    // Always include the transition animation CSS (even when disabled, to support animation)
    const transitionCSS = `
@keyframes tapd-slide-away {
  from { transform: translateX(0); }
  to   { transform: translateX(100vw); }
}
html[data-tapd-theme-transitioning]::before {
  content: '';
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2147483646 !important;
  background-color: var(--tapd-transition-bg, #ffffff) !important;
  pointer-events: none !important;
  animation: tapd-slide-away 0.45s cubic-bezier(0.4,0,0.2,1) forwards !important;
}`;
    styleElement.textContent = css + transitionCSS;
    const effectiveEnabled = settings.followSystem ? getSystemPrefersDark() : settings.enabled;
    document.documentElement.dataset.tapdTheme = effectiveEnabled ? 'dark' : 'light';
    // console.log('[TAPD Helper] 主题 CSS 已注入, enabled:', effectiveEnabled, 'settings:', JSON.stringify(settings));
  }

  /**
   * Re-apply dark mode CSS to catch any dynamically added elements.
   * This is the key fix for SPA-rendered content that gets added after
   * the initial theme injection.
   */
  function reapplyTheme() {
    if (!styleElement) return;
    const css = window.TAPDHelper.generateThemeCSS(currentSettings);
    styleElement.textContent = css;
    const effectiveEnabled = currentSettings.followSystem ? getSystemPrefersDark() : currentSettings.enabled;
    document.documentElement.dataset.tapdTheme = effectiveEnabled ? 'dark' : 'light';
  }

  /**
   * Handle inline style mutations on individual elements.
   * When an element gets an inline background-color or color added dynamically,
   * we override it with !important via the style attribute.
   */
  const DARK_COLORS = [
    '#333', '#333333', '#666', '#666666', '#444', '#444444',
    '#555', '#555555', '#222', '#222222', '#111', '#111111',
    '#000', '#000000', '#777', '#777777', '#888', '#888888',
    '#999', '#999999',
    'black', 'rgb(0,0,0)', 'rgb(51,51,51)', 'rgb(102,102,102)',
    'rgb(0, 0, 0)', 'rgb(51, 51, 51)', 'rgb(102, 102, 102)'
  ];

  function isDarkColor(colorStr) {
    if (!colorStr) return false;
    const normalized = colorStr.replace(/\s/g, '').toLowerCase();
    for (const dark of DARK_COLORS) {
      const normalizedDark = dark.replace(/\s/g, '').toLowerCase();
      if (normalized === normalizedDark || normalized.startsWith(normalizedDark)) return true;
    }
    return false;
  }

  function handleStyleMutation(mutations) {
    const effectiveEnabled = currentSettings.followSystem ? getSystemPrefersDark() : currentSettings.enabled;
    if (!effectiveEnabled) return;

    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const el = mutation.target;
        if (el && el.style) {
          const bg = el.style.backgroundColor || el.style.background;
          if (bg && (bg === '#fff' || bg === 'white' || bg === 'rgb(255, 255, 255)' || bg === '#ffffff' || bg === 'rgb(255,255,255)')) {
            el.style.setProperty('background-color', 'var(--tapd-bg-secondary)', 'important');
          }
          const color = el.style.color;
          if (isDarkColor(color)) {
            el.style.setProperty('color', 'var(--tapd-text-primary)', 'important');
          }
          // Also handle fill for SVG elements
          if (el.style.fill && isDarkColor(el.style.fill)) {
            el.style.setProperty('fill', 'var(--tapd-text-secondary)', 'important');
          }
        }
      }
    }
  }

  /**
   * Debounced version of reapplyTheme to avoid excessive reflows
   * during rapid DOM mutations (e.g. batch rendering).
   */
  let debounceTimer = null;
  function debouncedReapply() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      reapplyTheme();
      debounceTimer = null;
    }, 150);
  }

  function startMutationObserver() {
    // 1) Watch for new DOM nodes being added (SPA re-renders, new dialogs, etc.)
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = new MutationObserver(mutations => {
      let needsReapply = false;
      for (const mut of mutations) {
        // If new nodes were added, re-apply theme
        if (mut.addedNodes.length > 0) {
          needsReapply = true;
          // Check for dialog/modal/popup elements being added
          for (const node of mut.addedNodes) {
            if (node.nodeType === 1 && node.classList) {
              const cls = node.className;
              if (typeof cls === 'string' && (cls.includes('el-dialog') || cls.includes('el-overlay') || cls.includes('dialog') || cls.includes('modal') || cls.includes('popup'))) {
                // console.log('[TAPD Helper] 检测到弹窗元素:', node.tagName, cls);
              }
            }
          }
          break;
        }
        // If attributes changed (especially style/data-*), re-apply
        if (mut.type === 'attributes' &&
            (mut.attributeName === 'style' || mut.attributeName === 'class' ||
             mut.attributeName === 'data-*' || mut.attributeName === 'bgcolor')) {
          needsReapply = true;
          break;
        }
      }
      if (needsReapply) {
        debouncedReapply();
      }
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'bgcolor', 'data-*']
    });

    // 2) Also watch for style attribute changes directly (faster than the full subtree observer)
    if (styleObserver) styleObserver.disconnect();
    styleObserver = new MutationObserver(handleStyleMutation);
    styleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: true
    });
  }

  /**
   * Start periodic re-apply for SPA that re-renders content.
   * Every 2 seconds, refresh the CSS to catch any elements that
   * were missed by the MutationObserver (e.g. elements that were
   * replaced entirely, not added).
   */
  function startPeriodicRefresh() {
    if (periodicTimer) clearInterval(periodicTimer);
    // Refresh every 2 seconds for the first 30 seconds, then every 5 seconds
    let count = 0;
    periodicTimer = setInterval(() => {
      count++;
      reapplyTheme();
      // After 30 seconds (15 * 2s), slow down to every 5s
      if (count === 15) {
        clearInterval(periodicTimer);
        periodicTimer = setInterval(reapplyTheme, 5000);
      }
      // After 2 minutes total, stop periodic refresh (observer handles it)
      if (count >= 24) {
        clearInterval(periodicTimer);
        periodicTimer = null;
      }
    }, 2000);
  }

  /**
   * Periodic scan for dialog/modal elements in the DOM.
   * Helps diagnose dialog structure issues that MutationObserver might miss.
   */
  let dialogScanCount = 0;
  function startDialogScan() {
    const scanInterval = setInterval(() => {
      dialogScanCount++;
      // Look for common dialog wrapper elements
      const dialogElements = document.querySelectorAll(
        '[class*="el-dialog__wrapper"], [class*="el-overlay"], [class*="v-modal"], ' +
        '[class*="dialog-wrapper"], [class*="el-dialog"], [class*="el-dialog__body"], ' +
        '[class*="el-dialog__header"], [class*="el-dialog__footer"], ' +
        '[class*="status-transition"], [class*="transfer-form"], ' +
        '[class*="tapd-dialog"], [class*="tapd-modal"], [class*="tapd-popup"], ' +
        '[class*="el-drawer"], [class*="el-popup"], [class*="el-popper"]'
      );
      if (dialogElements.length > 0) {
        for (const el of dialogElements) {
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          const bg = getComputedStyle(el).backgroundColor;
          const zIndex = getComputedStyle(el).zIndex;
          const pos = getComputedStyle(el).position;
          // Log all elements, visible or not, to understand the full structure
          // console.log('[TAPD Helper] 弹窗元素:', el.tagName, el.className.slice(0,120),
          //   'pos:', pos, 'z:', zIndex, 'bg:', bg, 'visible:', isVisible,
          //   'rect:', Math.round(rect.width)+'x'+Math.round(rect.height));
          // Also log the parent chain for the first transfer-form found
          if (el.classList.contains('transfer-form') && el.parentElement) {
            let parent = el.parentElement;
            let depth = 0;
            const chain = [];
            while (parent && parent !== document.body && depth < 5) {
              chain.push(parent.tagName + (parent.className ? '.' + parent.className.slice(0,80) : ''));
              parent = parent.parentElement;
              depth++;
            }
            if (chain.length > 0) {
              // console.log('[TAPD Helper] transfer-form 父级链:', chain.join(' > '));
            }
          }
        }
      }
      // Stop after 60 seconds
      if (dialogScanCount >= 30) {
        clearInterval(scanInterval);
        // console.log('[TAPD Helper] 弹窗扫描已停止');
      }
    }, 2000);
  }

  function updateFloatingButton(enabled) {
    const btn = document.getElementById(FLOATING_BTN_ID);
    if (!btn) return;
    btn.dataset.active = enabled ? 'true' : 'false';
    if (enabled) {
      btn.style.background = '';
      btn.style.color = '';
    } else {
      btn.style.background = '#f0f0f0';
      btn.style.color = '#333333';
    }
    btn.innerHTML = enabled
      ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
    btn.title = enabled ? '关闭暗色模式' : '开启暗色模式';
  }

  function createFloatingButton() {
    if (document.getElementById(FLOATING_BTN_ID)) return;
    if (!document.body) return;

    const btn = document.createElement('button');
    btn.id = FLOATING_BTN_ID;

    const effectiveEnabled = currentSettings.followSystem ? getSystemPrefersDark() : currentSettings.enabled;
    const btnBg = effectiveEnabled ? '#2d2d2d' : '#f0f0f0';
    const btnColor = effectiveEnabled ? '#d4d4d4' : '#333333';
    const btnShadow = effectiveEnabled ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)';

    const style = document.createElement('style');
    style.textContent = [
      `#tapd-helper-toggle{position:fixed;bottom:20px;right:20px;z-index:2147483647;`,
      `width:44px;height:44px;border-radius:50%;border:none;`,
      `cursor:pointer;display:flex;align-items:center;justify-content:center;`,
      `background:${btnBg};color:${btnColor};box-shadow:0 2px 12px ${btnShadow};`,
      `transition:all .2s ease;opacity:.7}`,
      `#tapd-helper-toggle:hover{opacity:1;transform:scale(1.1)}`,
      `#tapd-helper-toggle[data-active=true]{background:#4a9eff;color:#fff}`
    ].join('');
    document.head.appendChild(style);

    btn.addEventListener('click', toggleTheme);
    document.body.appendChild(btn);

    updateFloatingButton(effectiveEnabled);
  }

  function tryCreateFloatingButton() {
    if (document.body) {
      createFloatingButton();
    } else {
      requestAnimationFrame(tryCreateFloatingButton);
    }
  }

  function toggleTheme() {
    // const currentTheme = document.documentElement.dataset.tapdTheme;
    // console.log('[TAPD Helper] 切换主题, 当前主题:', currentTheme);
    chrome.storage.sync.get('tapd_settings', data => {
      const settings = data.tapd_settings || { ...currentSettings };
      if (settings.followSystem) {
        settings.followSystem = false;
      }
      settings.enabled = !settings.enabled;
      // console.log('[TAPD Helper] 切换后 enabled:', settings.enabled);
      chrome.storage.sync.set({ tapd_settings: settings });
    });
  }

  function applySettings(settings) {
    // Use the actual DOM attribute to determine current theme state
    const oldEnabled = document.documentElement.dataset.tapdTheme === 'dark';
    const newEnabled = settings.followSystem ? getSystemPrefersDark() : settings.enabled;

    currentSettings = { ...currentSettings, ...settings };

    // console.log('[TAPD Helper] 应用设置, 旧状态:', oldEnabled, '新状态:', newEnabled, '设置:', JSON.stringify(settings));

    if (oldEnabled !== newEnabled) {
      const overlayBg = newEnabled ? '#ffffff' : '#1a1a1a';
      // Use CSS pseudo-element overlay (avoids JS inline style override issues)
      document.documentElement.style.setProperty('--tapd-transition-bg', overlayBg);
      document.documentElement.setAttribute('data-tapd-theme-transitioning', '');

      setTimeout(function() {
        injectThemeCSS(currentSettings);
        updateFloatingButton(newEnabled);

        setTimeout(function() {
          // Remove transitioning attribute after animation completes
          setTimeout(function() {
            document.documentElement.removeAttribute('data-tapd-theme-transitioning');
          }, 500);
        }, 50);
      }, 50);
    } else {
      injectThemeCSS(currentSettings);
      updateFloatingButton(newEnabled);
    }
  }

  function loadAndApplySettings() {
    chrome.storage.sync.get('tapd_settings', data => {
      // console.log('[TAPD Helper] 从 storage 加载设置:', JSON.stringify(data.tapd_settings));
      if (data.tapd_settings) {
        applySettings(data.tapd_settings);
      } else {
        const initialSettings = {
          enabled: getSystemPrefersDark(),
          brightness: 0,
          contrast: 0,
          temperature: 0,
          followSystem: true
        };
        // console.log('[TAPD Helper] 无已保存设置，使用初始设置:', JSON.stringify(initialSettings));
        chrome.storage.sync.set({ tapd_settings: initialSettings });
        applySettings(initialSettings);
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.tapd_settings) {
      // console.log('[TAPD Helper] storage 设置已变更:', JSON.stringify(changes.tapd_settings.newValue));
      applySettings(changes.tapd_settings.newValue);
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentSettings.followSystem) {
      const effectiveEnabled = getSystemPrefersDark();
      document.documentElement.dataset.tapdTheme = effectiveEnabled ? 'dark' : 'light';
      currentSettings.enabled = effectiveEnabled;
      injectThemeCSS(currentSettings);
      updateFloatingButton(effectiveEnabled);
    }
  });

  // Initial theme injection (before DOM is ready, for earliest possible dark mode)
  // const initialPrefersDark = getSystemPrefersDark();
  // console.log('[TAPD Helper] 扩展初始化, 系统深色模式偏好:', initialPrefersDark);
  injectThemeCSS({ enabled: getSystemPrefersDark(), brightness: 0, contrast: 0, temperature: 0, followSystem: true });

  // Load saved settings and apply
  loadAndApplySettings();

  // Create floating toggle button
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryCreateFloatingButton);
  } else {
    tryCreateFloatingButton();
  }

  // Start MutationObserver and periodic refresh after page is fully loaded
  if (document.readyState === 'complete') {
    // console.log('[TAPD Helper] 页面已完全加载，启动 MutationObserver 和定时刷新');
    startMutationObserver();
    startPeriodicRefresh();
    // startDialogScan();
  } else {
    window.addEventListener('load', () => {
      // console.log('[TAPD Helper] 页面加载完成事件，启动 MutationObserver 和定时刷新');
      startMutationObserver();
      startPeriodicRefresh();
      // startDialogScan();
    });
  }

  // Also re-apply when the DOM content is loaded (catches early SPA renders)
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', () => {
      // Re-apply once DOM is ready
      reapplyTheme();
    });
  }

  // Handle print
  window.addEventListener('beforeprint', () => {
    const el = document.getElementById('tapd-helper-style');
    if (el) el.disabled = true;
  });

  window.addEventListener('afterprint', () => {
    const el = document.getElementById('tapd-helper-style');
    if (el) el.disabled = false;
  });

  // Handle SPA route changes via History API
  const origPushState = history.pushState;
  history.pushState = function() {
    origPushState.apply(this, arguments);
    setTimeout(reapplyTheme, 100);
  };
  const origReplaceState = history.replaceState;
  history.replaceState = function() {
    origReplaceState.apply(this, arguments);
    setTimeout(reapplyTheme, 100);
  };
  window.addEventListener('popstate', () => {
    setTimeout(reapplyTheme, 100);
  });

  // Handle hashchange (some TAPD pages use hash routing)
  window.addEventListener('hashchange', () => {
    setTimeout(reapplyTheme, 200);
  });

  // Handle icon hover colors via JavaScript (only in dark mode)
  function setupIconHoverHandler() {
    const ACCENT_COLOR = '#4a9eff';
    const ICON_SELECTOR = 'i[class*="icon"], i[class*="tapd"], [class*="tapd-icon"], [class*=" icon-"]';

    document.addEventListener('mouseenter', e => {
      if (document.documentElement.dataset.tapdTheme !== 'dark') return;
      const target = e.target;
      if (!target || !target.matches) return;
      if (target.matches(ICON_SELECTOR)) {
        target.style.setProperty('color', ACCENT_COLOR, 'important');
      }
    }, true);

    document.addEventListener('mouseleave', e => {
      if (document.documentElement.dataset.tapdTheme !== 'dark') return;
      const target = e.target;
      if (!target || !target.matches) return;
      if (target.matches(ICON_SELECTOR)) {
        target.style.removeProperty('color');
        target.style.removeProperty('-webkit-text-fill-color');
      }
    }, true);
  }

  // Set up icon hover handler after DOM is ready
  if (document.readyState === 'complete') {
    setupIconHoverHandler();
  } else {
    window.addEventListener('load', setupIconHoverHandler);
  }

  // Continuously force-set text color on table header label elements only.
  // Only applies in dark mode; in light mode, removes forced styles.
  function forceTableCellLabelColors() {
    const isDark = document.documentElement.dataset.tapdTheme === 'dark';
    const all = document.querySelectorAll('[class*="cell__name-label"], .tapd-table__text-label');
    for (const el of all) {
      if (isDark) {
        el.setAttribute('style', 'color: #e0e0e0 !important; -webkit-text-fill-color: #e0e0e0 !important;');
      } else {
        el.style.removeProperty('color');
        el.style.removeProperty('-webkit-text-fill-color');
        if (el.getAttribute('style') === '' || el.getAttribute('style') === null) {
          el.removeAttribute('style');
        }
      }
    }
  }
  forceTableCellLabelColors();
  let rc = 0;
  const rt = setInterval(() => { forceTableCellLabelColors(); rc++; if (rc >= 250) { clearInterval(rt); setInterval(forceTableCellLabelColors, 200); } }, 20);

  // Inject dark/light mode styles into same-origin iframes (TinyMCE editor, etc.)
  function setupIframeDarkMode() {
    const isDark = document.documentElement.dataset.tapdTheme === 'dark';
    const iframes = document.querySelectorAll('iframe[class*="tox-"], iframe[id*="editor"], iframe[id*="richtext"]');
    for (const iframe of iframes) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc && doc.body) {
          const existingStyle = doc.getElementById('tapd-helper-iframe-style');
          if (existingStyle) existingStyle.remove();
          if (isDark) {
            const style = doc.createElement('style');
            style.id = 'tapd-helper-iframe-style';
            style.textContent = 'body,html{background-color:#222222!important;color:#e0e0e0!important}*{background-color:transparent!important;color:inherit}a{color:#4a9eff!important}';
            doc.head.appendChild(style);
          }
        }
      } catch(e) {
        // Cross-origin iframe, skip
      }
    }
  }

  if (document.readyState === 'complete') {
    setupIframeDarkMode();
  } else {
    window.addEventListener('load', setupIframeDarkMode);
  }
  setInterval(setupIframeDarkMode, 3000);

})();