window.TAPDHelper = window.TAPDHelper || {};

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('');
}

function adjustBrightness(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 + factor;
  return rgbToHex(r * f, g * f, b * f);
}

function adjustContrast(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 + factor;
  const midpoint = 128;
  return rgbToHex(
    midpoint + (r - midpoint) * f,
    midpoint + (g - midpoint) * f,
    midpoint + (b - midpoint) * f
  );
}

function adjustTemperature(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const t = factor * 0.3;
  return rgbToHex(
    r + t * 30,
    g - t * 5,
    b - t * 40
  );
}

window.TAPDHelper.generateThemeCSS = function(settings = {}) {
  const {
    enabled = true,
    brightness = 0,
    contrast = 0,
    temperature = 0
  } = settings;

  if (!enabled) return '';

  const bFactor = brightness / 100;
  const cFactor = contrast / 100;
  const tFactor = temperature / 100;

  function color(hex) {
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
    let result = hex;
    if (cFactor !== 0) result = adjustContrast(result, cFactor);
    if (tFactor !== 0) result = adjustTemperature(result, tFactor);
    if (bFactor !== 0) result = adjustBrightness(result, bFactor);
    return result;
  }

  const C = {
    bgPrimary: color('#1a1a1a'),
    bgSecondary: color('#222222'),
    bgElevated: color('#2a2a2a'),
    bgHover: color('#333333'),
    bgInput: color('#3a3a3a'),
    bgOverlay: 'rgba(0,0,0,0.65)',
    textPrimary: color('#e0e0e0'),
    textSecondary: color('#aaaaaa'),
    textMuted: color('#777777'),
    border: color('#3a3a3a'),
    borderLight: color('#2e2e2e'),
    accent: color('#4a9eff'),
    accentHover: color('#6db4ff'),
    accentBg: 'rgba(74,158,255,0.12)',
    danger: color('#f14c4c'),
    success: color('#4caf50'),
    warning: color('#ff9800'),
    scrollbarThumb: color('#444444'),
    scrollbarBg: color('#1a1a1a'),
    tableStriped: color('#242424'),
    cardBg: color('#222222'),
    inputBorder: color('#3a3a3a'),
    disabledBg: color('#2e2e2e'),
    disabledText: color('#555555'),
    linkColor: color('#4a9eff'),
    tagBg: color('#353535'),
    tagText: color('#cccccc'),
    highlightBg: 'rgba(74,158,255,0.15)',
    selectedBg: 'rgba(74,158,255,0.2)',
    shadow: 'rgba(0,0,0,0.4)',
  };

  return `
/* ═══════════════════════════════════════════════════════════════
   TAPD Helper — Dark Theme (v2.0)
   Multi-layer strategy:
     Layer 1: CSS Variables
     Layer 2: Root / html / body
     Layer 3: Universal element background (so NOTHING is pure white)
     Layer 4: Pattern-based selectors [class*="..."] — catch families
     Layer 5: Specific class overrides (existing detailed rules)
     Layer 6: Inline style overrides
     Layer 7: Filters for images, SVGs, charts
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════ Layer 1: CSS Variables ═══════════ */
html[data-tapd-theme="dark"] {
  --tapd-bg-primary: ${C.bgPrimary};
  --tapd-bg-secondary: ${C.bgSecondary};
  --tapd-bg-elevated: ${C.bgElevated};
  --tapd-bg-hover: ${C.bgHover};
  --tapd-bg-input: ${C.bgInput};
  --tapd-bg-overlay: ${C.bgOverlay};
  --tapd-text-primary: ${C.textPrimary};
  --tapd-text-secondary: ${C.textSecondary};
  --tapd-text-muted: ${C.textMuted};
  --tapd-border: ${C.border};
  --tapd-border-light: ${C.borderLight};
  --tapd-accent: ${C.accent};
  --tapd-accent-hover: ${C.accentHover};
  --tapd-accent-bg: ${C.accentBg};
  --tapd-danger: ${C.danger};
  --tapd-success: ${C.success};
  --tapd-warning: ${C.warning};
  --tapd-scrollbar-thumb: ${C.scrollbarThumb};
  --tapd-scrollbar-bg: ${C.scrollbarBg};
  --tapd-table-striped: ${C.tableStriped};
  --tapd-card-bg: ${C.cardBg};
  --tapd-input-border: ${C.inputBorder};
  --tapd-disabled-bg: ${C.disabledBg};
  --tapd-disabled-text: ${C.disabledText};
  --tapd-link: ${C.linkColor};
  --tapd-tag-bg: ${C.tagBg};
  --tapd-tag-text: ${C.tagText};
  --tapd-highlight-bg: ${C.highlightBg};
  --tapd-selected-bg: ${C.selectedBg};
  --tapd-shadow: ${C.shadow};
  color-scheme: dark;
}

/* ═══════════ Theme Transition ═══════════ */
html[data-tapd-theme] {
  transition: background-color 0.35s ease, color 0.35s ease;
}

/* Slide-away overlay using CSS pseudo-element (bypasses JS inline style issues) */
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
}

/* ═══════════ Layer 2: Root Elements ═══════════ */
html[data-tapd-theme="dark"],
html[data-tapd-theme="dark"] body {
  background-color: var(--tapd-bg-primary) !important;
  color: var(--tapd-text-primary) !important;
  scrollbar-color: var(--tapd-scrollbar-thumb) var(--tapd-scrollbar-bg);
}

html[data-tapd-theme="dark"] *:not(iframe):not(svg):not(svg *) {
  border-color: var(--tapd-border) !important;
}

/* ═══════════ Layer 3: Universal Element Background ═══════════
   Every element gets a dark background by default.
   Transparent elements inherit from parents.
   This is the KEY fix for "only gaps are dark" — it ensures
   NO element retains a white/light background. */
html[data-tapd-theme="dark"] div,
html[data-tapd-theme="dark"] section,
html[data-tapd-theme="dark"] article,
html[data-tapd-theme="dark"] main,
html[data-tapd-theme="dark"] aside,
html[data-tapd-theme="dark"] nav,
html[data-tapd-theme="dark"] header,
html[data-tapd-theme="dark"] footer,
html[data-tapd-theme="dark"] form,
html[data-tapd-theme="dark"] fieldset,
html[data-tapd-theme="dark"] ul, html[data-tapd-theme="dark"] ol, html[data-tapd-theme="dark"] li,
html[data-tapd-theme="dark"] dl, html[data-tapd-theme="dark"] dt, html[data-tapd-theme="dark"] dd,
html[data-tapd-theme="dark"] p, html[data-tapd-theme="dark"] h1, html[data-tapd-theme="dark"] h2,
html[data-tapd-theme="dark"] h3, html[data-tapd-theme="dark"] h4, html[data-tapd-theme="dark"] h5,
html[data-tapd-theme="dark"] h6, html[data-tapd-theme="dark"] blockquote,
html[data-tapd-theme="dark"] pre, html[data-tapd-theme="dark"] code,
html[data-tapd-theme="dark"] figure, html[data-tapd-theme="dark"] figcaption,
html[data-tapd-theme="dark"] td, html[data-tapd-theme="dark"] th, html[data-tapd-theme="dark"] tr,
html[data-tapd-theme="dark"] thead, html[data-tapd-theme="dark"] tbody, html[data-tapd-theme="dark"] tfoot,
html[data-tapd-theme="dark"] table, html[data-tapd-theme="dark"] caption,
html[data-tapd-theme="dark"] colgroup, html[data-tapd-theme="dark"] col,
html[data-tapd-theme="dark"] label, html[data-tapd-theme="dark"] legend,
html[data-tapd-theme="dark"] strong, html[data-tapd-theme="dark"] em,
html[data-tapd-theme="dark"] i,
html[data-tapd-theme="dark"] small, html[data-tapd-theme="dark"] sub, html[data-tapd-theme="dark"] sup,
html[data-tapd-theme="dark"] details, html[data-tapd-theme="dark"] summary,
html[data-tapd-theme="dark"] menu, html[data-tapd-theme="dark"] dir,
html[data-tapd-theme="dark"] abbr, html[data-tapd-theme="dark"] address,
html[data-tapd-theme="dark"] cite, html[data-tapd-theme="dark"] dfn,
html[data-tapd-theme="dark"] ins, html[data-tapd-theme="dark"] del,
html[data-tapd-theme="dark"] kbd, html[data-tapd-theme="dark"] samp, html[data-tapd-theme="dark"] var,
html[data-tapd-theme="dark"] output, html[data-tapd-theme="dark"] progress,
html[data-tapd-theme="dark"] time, html[data-tapd-theme="dark"] mark,
html[data-tapd-theme="dark"] button, html[data-tapd-theme="dark"] select {
  background-color: transparent !important;
  color: inherit;
}

/* ═══════════ Layer 3a: Span elements ═══════════
   Span is the most common text container in TAPD.
   TAPD often sets span { color: #0052d9 } globally,
   so we need a dedicated rule with !important to override.
   Status/priority/tag/icon spans still work because their
   rules also use !important and come later in the cascade. */
html[data-tapd-theme="dark"] span {
  background-color: transparent !important;
  color: var(--tapd-text-primary) !important;
}
/* Spans inside <a> tags should use link color, not primary text */
html[data-tapd-theme="dark"] a span,
html[data-tapd-theme="dark"] a:link span,
html[data-tapd-theme="dark"] a:visited span,
html[data-tapd-theme="dark"] a:hover span {
  color: inherit !important;
}
/* Spans used as icons or inside icon containers keep their icon color */
html[data-tapd-theme="dark"] [class*="icon"] span,
html[data-tapd-theme="dark"] span[class*="icon"] {
  color: var(--tapd-text-secondary) !important;
}

/* ═══════════ Layer 3b: Special transparent exceptions ═══════════ */
html[data-tapd-theme="dark"] svg,
html[data-tapd-theme="dark"] canvas,
html[data-tapd-theme="dark"] img,
html[data-tapd-theme="dark"] video,
html[data-tapd-theme="dark"] iframe,
html[data-tapd-theme="dark"] embed,
html[data-tapd-theme="dark"] object,
html[data-tapd-theme="dark"] picture,
html[data-tapd-theme="dark"] source {
  background-color: transparent !important;
}

/* ═══════════ Layer 3c: Links & text elements ═══════════ */
html[data-tapd-theme="dark"] a,
html[data-tapd-theme="dark"] a:link,
html[data-tapd-theme="dark"] a:visited {
  color: var(--tapd-link) !important;
}
html[data-tapd-theme="dark"] a:hover { color: var(--tapd-accent-hover) !important; }
html[data-tapd-theme="dark"] ::selection { background: var(--tapd-highlight-bg) !important; }

/* ========== Aggressive link color overrides ==========
   TAPD often uses class-based link styles that override the plain <a> tag.
   These catch all common link-like classes. */
html[data-tapd-theme="dark"] [class*="link"]:not([class*="link-disabled"]):not([class*="link-btn"]),
html[data-tapd-theme="dark"] [class*="link-text"],
html[data-tapd-theme="dark"] [class*="link-title"],
html[data-tapd-theme="dark"] [class*="link-name"],
html[data-tapd-theme="dark"] [class*="link-item"],
html[data-tapd-theme="dark"] [class*="link-blue"],
html[data-tapd-theme="dark"] [class*="link-dark"],
html[data-tapd-theme="dark"] [class*="link-primary"],
html[data-tapd-theme="dark"] [class*="link-action"],
html[data-tapd-theme="dark"] [class*="link-normal"],
html[data-tapd-theme="dark"] [class*="link-default"],
html[data-tapd-theme="dark"] [class*="link-info"],
html[data-tapd-theme="dark"] [class*="subject-link"],
html[data-tapd-theme="dark"] [class*="story-link"],
html[data-tapd-theme="dark"] [class*="bug-link"],
html[data-tapd-theme="dark"] [class*="wiki-link"],
html[data-tapd-theme="dark"] [class*="tfl-link"],
html[data-tapd-theme="dark"] [class*="anchor"],
html[data-tapd-theme="dark"] [class*="hyperlink"],
html[data-tapd-theme="dark"] [class*="nav-link"],
html[data-tapd-theme="dark"] [class*="menu-link"],
html[data-tapd-theme="dark"] [class*="breadcrumb-link"],
html[data-tapd-theme="dark"] [class*="tab-link"],
html[data-tapd-theme="dark"] [class*="crumb-link"],
html[data-tapd-theme="dark"] [class*="subject-link"],
html[data-tapd-theme="dark"] [class*="issue-link"],
html[data-tapd-theme="dark"] [class*="req-link"] {
  color: var(--tapd-link) !important;
}
html[data-tapd-theme="dark"] [class*="link"]:hover:not([class*="link-disabled"]),
html[data-tapd-theme="dark"] [class*="link-text"]:hover,
html[data-tapd-theme="dark"] [class*="link-title"]:hover,
html[data-tapd-theme="dark"] [class*="tfl-link"]:hover {
  color: var(--tapd-accent-hover) !important;
}

/* ========== Heading color overrides ==========
   TAPD headings (h1-h6) often have dark colors set via CSS.
   These ensure they render as light text on dark backgrounds. */
html[data-tapd-theme="dark"] h1,
html[data-tapd-theme="dark"] h2,
html[data-tapd-theme="dark"] h3,
html[data-tapd-theme="dark"] h4,
html[data-tapd-theme="dark"] h5,
html[data-tapd-theme="dark"] h6,
html[data-tapd-theme="dark"] [class*="heading"],
html[data-tapd-theme="dark"] [class*="heading-text"],
html[data-tapd-theme="dark"] [class*="heading-title"],
html[data-tapd-theme="dark"] [class*="heading-name"],
html[data-tapd-theme="dark"] [class*="h1-title"],
html[data-tapd-theme="dark"] [class*="h2-title"],
html[data-tapd-theme="dark"] [class*="h3-title"],
html[data-tapd-theme="dark"] [class*="h-title"],
html[data-tapd-theme="dark"] [class*="title-text"],
html[data-tapd-theme="dark"] [class*="title-name"],
html[data-tapd-theme="dark"] [class*="page-title"],
html[data-tapd-theme="dark"] [class*="section-title"],
html[data-tapd-theme="dark"] [class*="block-title"],
html[data-tapd-theme="dark"] [class*="card-title"],
html[data-tapd-theme="dark"] [class*="panel-title"],
html[data-tapd-theme="dark"] [class*="widget-title"],
html[data-tapd-theme="dark"] [class*="dialog-title"],
html[data-tapd-theme="dark"] [class*="modal-title"],
html[data-tapd-theme="dark"] [class*="drawer-title"],
html[data-tapd-theme="dark"] [class*="tfl-title"],
html[data-tapd-theme="dark"] [class*="tfl-heading"],
html[data-tapd-theme="dark"] [class*="wiki-title"],
html[data-tapd-theme="dark"] [class*="story-title"],
html[data-tapd-theme="dark"] [class*="bug-title"],
html[data-tapd-theme="dark"] [class*="task-title"],
html[data-tapd-theme="dark"] [class*="iteration-title"],
html[data-tapd-theme="dark"] [class*="sprint-title"],
html[data-tapd-theme="dark"] [class*="form-title"],
html[data-tapd-theme="dark"] [class*="field-title"],
html[data-tapd-theme="dark"] [class*="label-title"],
html[data-tapd-theme="dark"] [class*="group-title"],
html[data-tapd-theme="dark"] [class*="step-title"],
html[data-tapd-theme="dark"] [class*="tab-title"],
html[data-tapd-theme="dark"] [class*="menu-title"],
html[data-tapd-theme="dark"] [class*="nav-title"],
html[data-tapd-theme="dark"] [class*="header-title"],
html[data-tapd-theme="dark"] [class*="table-title"],
html[data-tapd-theme="dark"] [class*="list-title"],
html[data-tapd-theme="dark"] [class*="chart-title"],
html[data-tapd-theme="dark"] [class*="report-title"] {
  color: var(--tapd-text-primary) !important;
}

/* ═══════════ Layer 4: Pattern-based Selectors ═══════════
   These catch ENTIRE FAMILIES of elements by common name patterns.
   This is the SECOND KEY fix — covers elements that class-based
   selectors miss. Every [class*=""] pattern matches any element
   whose class CONTAINS the given substring. */

/* --- Background primary (darkest layer) --- */
html[data-tapd-theme="dark"] [class*="bodywrap"],
html[data-tapd-theme="dark"] [class*="main-content"],
html[data-tapd-theme="dark"] [class*="content-wrap"],
html[data-tapd-theme="dark"] [class*="page-content"],
html[data-tapd-theme="dark"] [class*="workspace"],
html[data-tapd-theme="dark"] [class*="app-view"],
html[data-tapd-theme="dark"] [class*="page-wrap"],
html[data-tapd-theme="dark"] [class*="container-fluid"],
html[data-tapd-theme="dark"] [class*="container-main"],
html[data-tapd-theme="dark"] [class*="index-wrap"],
html[data-tapd-theme="dark"] [class*="list-view"],
html[data-tapd-theme="dark"] [class*="module-view"],
html[data-tapd-theme="dark"] [class*="page-body"],
html[data-tapd-theme="dark"] [class*="layout-body"],
html[data-tapd-theme="dark"] [class*="app-body"],
html[data-tapd-theme="dark"] [class*="main-body"],
html[data-tapd-theme="dark"] [class*="content-body"] {
  background-color: var(--tapd-bg-primary) !important;
}

/* --- Background secondary (medium layer) --- */
html[data-tapd-theme="dark"] [class*="sidebar"],
html[data-tapd-theme="dark"] [class*="left-menu"],
html[data-tapd-theme="dark"] [class*="layout-menu"],
html[data-tapd-theme="dark"] [class*="nav-side"],
html[data-tapd-theme="dark"] [class*="menu-wrap"],
html[data-tapd-theme="dark"] [class*="side-panel"],
html[data-tapd-theme="dark"] [class*="tree-view"],
html[data-tapd-theme="dark"] [class*="tree-wrap"],
html[data-tapd-theme="dark"] [class*="tree-panel"],
html[data-tapd-theme="dark"] [class*="nav-tree"],
html[data-tapd-theme="dark"] [class*="filter-area"],
html[data-tapd-theme="dark"] [class*="filter-section"],
html[data-tapd-theme="dark"] [class*="filter-bar"],
html[data-tapd-theme="dark"] [class*="search-section"],
html[data-tapd-theme="dark"] [class*="toolbar-wrap"],
html[data-tapd-theme="dark"] [class*="toolbar-header"],
html[data-tapd-theme="dark"] [class*="action-bar"],
html[data-tapd-theme="dark"] [class*="status-bar"],
html[data-tapd-theme="dark"] [class*="info-bar"],
html[data-tapd-theme="dark"] [class*="top-bar"],
html[data-tapd-theme="dark"] [class*="header-bar"],
html[data-tapd-theme="dark"] [class*="nav-bar"],
html[data-tapd-theme="dark"] [class*="page-header"],
html[data-tapd-theme="dark"] [class*="section-header"],
html[data-tapd-theme="dark"] [class*="block-header"],
html[data-tapd-theme="dark"] [class*="panel-header"],
html[data-tapd-theme="dark"] [class*="widget-header"],
html[data-tapd-theme="dark"] [class*="card-header"],
html[data-tapd-theme="dark"] [class*="dialog-header"],
html[data-tapd-theme="dark"] [class*="dialog__header"],
html[data-tapd-theme="dark"] [class*="modal-header"],
html[data-tapd-theme="dark"] [class*="modal__header"],
html[data-tapd-theme="dark"] [class*="drawer-header"],
html[data-tapd-theme="dark"] [class*="detail-header"],
html[data-tapd-theme="dark"] [class*="tfl-header"],
html[data-tapd-theme="dark"] [class*="tfl-dialog-header"],
html[data-tapd-theme="dark"] [class*="tfl-toolbar"],
html[data-tapd-theme="dark"] [class*="tfl-nav"],
html[data-tapd-theme="dark"] [class*="wiki-sidebar"],
html[data-tapd-theme="dark"] [class*="wiki-tree"],
html[data-tapd-theme="dark"] [class*="wiki-toolbar"],
html[data-tapd-theme="dark"] [class*="wiki-edit"] {
  background-color: var(--tapd-bg-secondary) !important;
}

/* --- TFL generic components (catch-all for TAPD Frontend Library) --- */
html[data-tapd-theme="dark"] [class*="tfl-table"],
html[data-tapd-theme="dark"] [class*="tfl-tree"],
html[data-tapd-theme="dark"] [class*="tfl-grid"],
html[data-tapd-theme="dark"] [class*="tfl-layout"],
html[data-tapd-theme="dark"] [class*="tfl-form"],
html[data-tapd-theme="dark"] [class*="tfl-section"],
html[data-tapd-theme="dark"] [class*="tfl-wrapper"],
html[data-tapd-theme="dark"] [class*="tfl-container"],
html[data-tapd-theme="dark"] [class*="tfl-box"],
html[data-tapd-theme="dark"] [class*="tfl-area"],
html[data-tapd-theme="dark"] [class*="tfl-sidebar"],
html[data-tapd-theme="dark"] [class*="tfl-main"],
html[data-tapd-theme="dark"] [class*="tfl-content"],
html[data-tapd-theme="dark"] [class*="tfl-header"],
html[data-tapd-theme="dark"] [class*="tfl-footer"],
html[data-tapd-theme="dark"] [class*="tfl-body"],
html[data-tapd-theme="dark"] [class*="tfl-article"],
html[data-tapd-theme="dark"] [class*="tfl-card"],
html[data-tapd-theme="dark"] [class*="tfl-panel"],
html[data-tapd-theme="dark"] [class*="tfl-list"],
html[data-tapd-theme="dark"] [class*="tfl-item"],
html[data-tapd-theme="dark"] [class*="tfl-row"],
html[data-tapd-theme="dark"] [class*="tfl-cell"],
html[data-tapd-theme="dark"] [class*="tfl-col"],
html[data-tapd-theme="dark"] [class*="tfl-tab"],
html[data-tapd-theme="dark"] [class*="tfl-menu"],
html[data-tapd-theme="dark"] [class*="tfl-nav"],
html[data-tapd-theme="dark"] [class*="tfl-pagination"],
html[data-tapd-theme="dark"] [class*="tfl-tag"],
html[data-tapd-theme="dark"] [class*="tfl-badge"],
html[data-tapd-theme="dark"] [class*="tfl-progress"],
html[data-tapd-theme="dark"] [class*="tfl-slider"],
html[data-tapd-theme="dark"] [class*="tfl-switch"],
html[data-tapd-theme="dark"] [class*="tfl-radio"],
html[data-tapd-theme="dark"] [class*="tfl-checkbox"],
html[data-tapd-theme="dark"] [class*="tfl-breadcrumb"],
html[data-tapd-theme="dark"] [class*="tfl-message"],
html[data-tapd-theme="dark"] [class*="tfl-notification"],
html[data-tapd-theme="dark"] [class*="tfl-loading"],
html[data-tapd-theme="dark"] [class*="tfl-spinner"],
html[data-tapd-theme="dark"] [class*="tfl-upload"],
html[data-tapd-theme="dark"] [class*="tfl-search"],
html[data-tapd-theme="dark"] [class*="tfl-empty"],
html[data-tapd-theme="dark"] [class*="tfl-placeholder"],
html[data-tapd-theme="dark"] [class*="tfl-stat"],
html[data-tapd-theme="dark"] [class*="tfl-meta"],
html[data-tapd-theme="dark"] [class*="tfl-info"],
html[data-tapd-theme="dark"] [class*="tfl-detail"],
html[data-tapd-theme="dark"] [class*="tfl-edit"],
html[data-tapd-theme="dark"] [class*="tfl-view"],
html[data-tapd-theme="dark"] [class*="tfl-page"],
html[data-tapd-theme="dark"] [class*="tfl-app"],
html[data-tapd-theme="dark"] [class*="tfl-module"],
html[data-tapd-theme="dark"] [class*="tfl-widget"],
html[data-tapd-theme="dark"] [class*="tfl-step"],
html[data-tapd-theme="dark"] [class*="tfl-workflow"],
html[data-tapd-theme="dark"] [class*="tfl-status"],
html[data-tapd-theme="dark"] [class*="tfl-priority"],
html[data-tapd-theme="dark"] [class*="tfl-severity"],
html[data-tapd-theme="dark"] [class*="tfl-comment"],
html[data-tapd-theme="dark"] [class*="tfl-attachment"],
html[data-tapd-theme="dark"] [class*="tfl-history"],
html[data-tapd-theme="dark"] [class*="tfl-activity"] {
  background-color: var(--tapd-bg-secondary) !important;
  color: var(--tapd-text-primary) !important;
  border-color: var(--tapd-border) !important;
}

/* --- TFL Buttons & input-like components (specific handling) --- */
html[data-tapd-theme="dark"] [class*="tfl-button"],
html[data-tapd-theme="dark"] [class*="tfl-btn"],
html[data-tapd-theme="dark"] [class*="tfl-input"],
html[data-tapd-theme="dark"] [class*="tfl-select"],
html[data-tapd-theme="dark"] [class*="tfl-textarea"],
html[data-tapd-theme="dark"] [class*="tfl-editor"],
html[data-tapd-theme="dark"] [class*="tfl-autocomplete"],
html[data-tapd-theme="dark"] [class*="tfl-datepicker"],
html[data-tapd-theme="dark"] [class*="tfl-timepicker"],
html[data-tapd-theme="dark"] [class*="tfl-colorpicker"],
html[data-tapd-theme="dark"] [class*="tfl-dropdown"]:not([class*="menu"]) {
  background-color: var(--tapd-bg-input) !important;
  color: var(--tapd-text-primary) !important;
  border-color: var(--tapd-input-border) !important;
}

/* ========== Catch-all for elements with common structural patterns ========== */
html[data-tapd-theme="dark"] [class*="wrap"],
html[data-tapd-theme="dark"] [class*="container"],
html[data-tapd-theme="dark"] [class*="wrapper"],
html[data-tapd-theme="dark"] [class*="inner"],
html[data-tapd-theme="dark"] [class*="block"],
html[data-tapd-theme="dark"] [class*="section"],
html[data-tapd-theme="dark"] [class*="area"],
html[data-tapd-theme="dark"] [class*="region"],
html[data-tapd-theme="dark"] [class*="view"],
html[data-tapd-theme="dark"] [class*="frame"],
html[data-tapd-theme="dark"] [class*="holder"],
html[data-tapd-theme="dark"] [class*="layer"]:not([class*="mask"]):not([class*="overlay"]),
html[data-tapd-theme="dark"] [class*="module"],
html[data-tapd-theme="dark"] [class*="component"],
html[data-tapd-theme="dark"] [class*="tapd-table__"],
html[data-tapd-theme="dark"] [class*="tapd-form__"],
html[data-tapd-theme="dark"] [class*="tapd-input__"],
html[data-tapd-theme="dark"] [class*="tapd-select__"],
html[data-tapd-theme="dark"] [class*="tapd-btn__"],
html[data-tapd-theme="dark"] [class*="tapd-modal__"],
html[data-tapd-theme="dark"] [class*="tapd-dialog__"],
html[data-tapd-theme="dark"] [class*="tapd-popup__"],
html[data-tapd-theme="dark"] [class*="tapd-dropdown__"],
html[data-tapd-theme="dark"] [class*="tapd-menu__"],
html[data-tapd-theme="dark"] [class*="tapd-tab__"],
html[data-tapd-theme="dark"] [class*="tapd-tree__"],
html[data-tapd-theme="dark"] [class*="tapd-list__"],
html[data-tapd-theme="dark"] [class*="tapd-header__"],
html[data-tapd-theme="dark"] [class*="tapd-footer__"],
html[data-tapd-theme="dark"] [class*="tapd-sidebar__"],
html[data-tapd-theme="dark"] [class*="tapd-nav__"],
html[data-tapd-theme="dark"] [class*="tapd-card__"],
html[data-tapd-theme="dark"] [class*="tapd-panel__"],
html[data-tapd-theme="dark"] [class*="tapd-widget__"],
html[data-tapd-theme="dark"] [class*="tapd-toolbar__"],
html[data-tapd-theme="dark"] [class*="tapd-search__"],
html[data-tapd-theme="dark"] [class*="tapd-pagination__"] {
  background: transparent !important;
  background-color: transparent !important;
  color: inherit;
}

/* ========== TAPD BEM elements with explicit background override ==========
   TAPD often uses background: #f5f5f5 (shorthand) on BEM child elements.
   We need the background shorthand to override the shorthand. */
html[data-tapd-theme="dark"] [class*="tapd-table__text"],
html[data-tapd-theme="dark"] [class*="tapd-table__label"],
html[data-tapd-theme="dark"] [class*="tapd-table__cell"],
html[data-tapd-theme="dark"] [class*="tapd-table__header"],
html[data-tapd-theme="dark"] [class*="tapd-table__row"],
html[data-tapd-theme="dark"] [class*="tapd-form__item"],
html[data-tapd-theme="dark"] [class*="tapd-form__label"],
html[data-tapd-theme="dark"] [class*="tapd-form__text"],
html[data-tapd-theme="dark"] [class*="tapd-form__content"],
html[data-tapd-theme="dark"] [class*="tapd-input__wrap"],
html[data-tapd-theme="dark"] [class*="tapd-input__inner"],
html[data-tapd-theme="dark"] [class*="tapd-select__wrap"],
html[data-tapd-theme="dark"] [class*="tapd-select__inner"],
html[data-tapd-theme="dark"] [class*="tapd-btn__text"],
html[data-tapd-theme="dark"] [class*="tapd-btn__icon"],
html[data-tapd-theme="dark"] [class*="tapd-popup__body"],
html[data-tapd-theme="dark"] [class*="tapd-popup__content"],
html[data-tapd-theme="dark"] [class*="tapd-dropdown__item"],
html[data-tapd-theme="dark"] [class*="tapd-dropdown__menu"],
html[data-tapd-theme="dark"] [class*="tapd-menu__item"],
html[data-tapd-theme="dark"] [class*="tapd-menu__text"],
html[data-tapd-theme="dark"] [class*="tapd-tab__item"],
html[data-tapd-theme="dark"] [class*="tapd-tab__text"],
html[data-tapd-theme="dark"] [class*="tapd-tree__item"],
html[data-tapd-theme="dark"] [class*="tapd-tree__text"],
html[data-tapd-theme="dark"] [class*="tapd-list__item"],
html[data-tapd-theme="dark"] [class*="tapd-list__text"],
html[data-tapd-theme="dark"] [class*="tapd-nav__item"],
html[data-tapd-theme="dark"] [class*="tapd-nav__text"],
html[data-tapd-theme="dark"] [class*="tapd-card__body"],
html[data-tapd-theme="dark"] [class*="tapd-card__content"],
html[data-tapd-theme="dark"] [class*="tapd-card__header"],
html[data-tapd-theme="dark"] [class*="tapd-card__footer"],
html[data-tapd-theme="dark"] [class*="tapd-panel__body"],
html[data-tapd-theme="dark"] [class*="tapd-panel__content"],
html[data-tapd-theme="dark"] [class*="tapd-toolbar__item"],
html[data-tapd-theme="dark"] [class*="tapd-search__input"],
html[data-tapd-theme="dark"] [class*="tapd-search__btn"],
html[data-tapd-theme="dark"] [class*="tapd-pagination__item"],
html[data-tapd-theme="dark"] [class*="tapd-pagination__btn"],
html[data-tapd-theme="dark"] [class*="tapd-"] [class*="__text"],
html[data-tapd-theme="dark"] [class*="tapd-"] [class*="__label"] {
  background: transparent !important;
  background-color: transparent !important;
}

/* ========== Sticky / fixed header elements ==========
   TAPD uses sticky headers (tab bars, toolbars, etc.) that need
   a visible background to cover content scrolling behind them.
   Our universal div { background: transparent } rule makes them
   see-through, so we must explicitly restore the background. */
html[data-tapd-theme="dark"] [class*="tab-container-wrapper"],
html[data-tapd-theme="dark"] [class*="tab-container"],
html[data-tapd-theme="dark"] [class*="tab-wrap"],
html[data-tapd-theme="dark"] [class*="tabs-wrap"],
html[data-tapd-theme="dark"] [class*="tabs-bar"],
html[data-tapd-theme="dark"] [class*="tab-bar"],
html[data-tapd-theme="dark"] [class*="tab-header"],
html[data-tapd-theme="dark"] [class*="tabs-header"],
html[data-tapd-theme="dark"] [class*="sticky"],
html[data-tapd-theme="dark"] [class*="Sticky"],
html[data-tapd-theme="dark"] [class*="is-sticky"],
html[data-tapd-theme="dark"] [class*="fixed-header"],
html[data-tapd-theme="dark"] [class*="fixed-tab"],
html[data-tapd-theme="dark"] [class*="sticky-header"],
html[data-tapd-theme="dark"] [class*="sticky-tab"],
html[data-tapd-theme="dark"] [class*="affix"],
html[data-tapd-theme="dark"] [class*="Affix"],
html[data-tapd-theme="dark"] [class*="header-fixed"],
html[data-tapd-theme="dark"] [class*="header-sticky"],
html[data-tapd-theme="dark"] [class*="nav-fixed"],
html[data-tapd-theme="dark"] [class*="nav-sticky"],
html[data-tapd-theme="dark"] [class*="toolbar-fixed"],
html[data-tapd-theme="dark"] [class*="el-sticky"],
html[data-tapd-theme="dark"] [class*="el-affix"],
html[data-tapd-theme="dark"] [class*="is-affixed"],
html[data-tapd-theme="dark"] [class*="detail-tab"],
html[data-tapd-theme="dark"] [class*="detail-header"],
html[data-tapd-theme="dark"] [class*="detail-top"],
html[data-tapd-theme="dark"] [class*="page-header"],
html[data-tapd-theme="dark"] [class*="page-tab"],
html[data-tapd-theme="dark"] [class*="section-tab"],
html[data-tapd-theme="dark"] [class*="content-tab"],
html[data-tapd-theme="dark"] [class*="item-title"],
html[data-tapd-theme="dark"] [class*="item-header"],
html[data-tapd-theme="dark"] [class*="list-header"],
html[data-tapd-theme="dark"] [class*="list-title"],
html[data-tapd-theme="dark"] [class*="group-title"],
html[data-tapd-theme="dark"] [class*="group-header"],
html[data-tapd-theme="dark"] [class*="section-header"],
html[data-tapd-theme="dark"] [class*="module-header"],
html[data-tapd-theme="dark"] [class*="widget-header"],
html[data-tapd-theme="dark"] [class*="panel-header"],
html[data-tapd-theme="dark"] [class*="card-header"],
html[data-tapd-theme="dark"] [class*="block-header"],
html[data-tapd-theme="dark"] [class*="tapd-table__head-wrap"],
html[data-tapd-theme="dark"] [class*="tapd-table__head"]:not([class*="adjustable"]),
html[data-tapd-theme="dark"] [class*="tapd-table__header"],
html[data-tapd-theme="dark"] [class*="tapd-table__fixed"],
html[data-tapd-theme="dark"] [class*="tapd-table__sticky"] {
  background-color: var(--tapd-bg-primary) !important;
  z-index: 100 !important;
}
/* These catch structural elements and make them transparent so they inherit
   from their parent container. This prevents structural wrappers from showing
   as white boxes. */

/* --- Background elevated (cards, panels, dialogs, dropdowns) --- */
html[data-tapd-theme="dark"] [class*="card"]:not([class*="header"]):not([class*="footer"]):not([class*="body"]),
html[data-tapd-theme="dark"] [class*="panel"]:not([class*="header"]):not([class*="footer"]):not([class*="body"]),
html[data-tapd-theme="dark"] [class*="widget"]:not([class*="header"]),
html[data-tapd-theme="dark"] [class*="dialog"]:not([class*="header"]):not([class*="body"]):not([class*="footer"]):not([class*="mask"]),
html[data-tapd-theme="dark"] [class*="modal"]:not([class*="header"]):not([class*="body"]):not([class*="footer"]):not([class*="mask"]),
html[data-tapd-theme="dark"] [class*="drawer"]:not([class*="header"]):not([class*="body"]):not([class*="footer"]),
html[data-tapd-theme="dark"] [class*="dropdown"],
html[data-tapd-theme="dark"] [class*="popup"],
html[data-tapd-theme="dark"] [class*="popover"],
html[data-tapd-theme="dark"] [class*="tooltip"],
html[data-tapd-theme="dark"] [class*="tips"],
html[data-tapd-theme="dark"] [class*="toast"],
html[data-tapd-theme="dark"] [class*="notification"],
html[data-tapd-theme="dark"] [class*="msgbox"],
html[data-tapd-theme="dark"] [class*="message-box"],
html[data-tapd-theme="dark"] [class*="alert"],
html[data-tapd-theme="dark"] [class*="datepicker"],
html[data-tapd-theme="dark"] [class*="select2-dropdown"],
html[data-tapd-theme="dark"] [class*="select2-selection"],
html[data-tapd-theme="dark"] [class*="cluetip"],
html[data-tapd-theme="dark"] [class*="burndown"],
html[data-tapd-theme="dark"] [class*="chart-container"],
html[data-tapd-theme="dark"] [class*="report-container"],
html[data-tapd-theme="dark"] [class*="chart-box"],
html[data-tapd-theme="dark"] [class*="report-panel"],
html[data-tapd-theme="dark"] [class*="tfl-dialog"],
html[data-tapd-theme="dark"] [class*="tfl-dropdown"],
html[data-tapd-theme="dark"] [class*="tfl-tips"],
html[data-tapd-theme="dark"] [class*="tfl-datepicker"],
html[data-tapd-theme="dark"] [class*="tfl-layer"],
html[data-tapd-theme="dark"] [class*="tfl-overlay"],
html[data-tapd-theme="dark"] [class*="tfl-mask"],
html[data-tapd-theme="dark"] [class*="tfl-tip"] {
  background-color: var(--tapd-bg-elevated) !important;
}

/* --- Status transfer dialog (TAPD workflow status transition) --- */
html[data-tapd-theme="dark"] [class*="status-transfer"],
html[data-tapd-theme="dark"] [class*="status-transfer-wrap"],
html[data-tapd-theme="dark"] [class*="status-transition-wrapper"],
html[data-tapd-theme="dark"] [class*="transfer-form"],
html[data-tapd-theme="dark"] [class*="transfer-form-content"],
html[data-tapd-theme="dark"] [class*="transfer-form-wrap"] {
  background-color: var(--tapd-bg-secondary) !important;
}

/* --- Card/dialog body/content (secondary background) --- */
html[data-tapd-theme="dark"] [class*="card-body"],
html[data-tapd-theme="dark"] [class*="panel-body"],
html[data-tapd-theme="dark"] [class*="dialog-body"],
html[data-tapd-theme="dark"] [class*="dialog__body"],
html[data-tapd-theme="dark"] [class*="modal-body"],
html[data-tapd-theme="dark"] [class*="modal__body"],
html[data-tapd-theme="dark"] [class*="drawer-body"],
html[data-tapd-theme="dark"] [class*="detail-body"],
html[data-tapd-theme="dark"] [class*="tfl-body"],
html[data-tapd-theme="dark"] [class*="tfl-content"],
html[data-tapd-theme="dark"] [class*="tfl-dialog-body"],
html[data-tapd-theme="dark"] [class*="tfl-dialog-content"] {
  background-color: var(--tapd-bg-secondary) !important;
}

/* --- Card/panel/dialog footer (elevated, with border-top) --- */
html[data-tapd-theme="dark"] [class*="card-footer"],
html[data-tapd-theme="dark"] [class*="panel-footer"],
html[data-tapd-theme="dark"] [class*="dialog-footer"],
html[data-tapd-theme="dark"] [class*="dialog__footer"],
html[data-tapd-theme="dark"] [class*="modal-footer"],
html[data-tapd-theme="dark"] [class*="modal__footer"],
html[data-tapd-theme="dark"] [class*="drawer-footer"],
html[data-tapd-theme="dark"] [class*="detail-footer"],
html[data-tapd-theme="dark"] [class*="tfl-dialog-footer"] {
  background-color: var(--tapd-bg-elevated) !important;
}

/* --- Inputs and form elements --- */
html[data-tapd-theme="dark"] [class*="input"],
html[data-tapd-theme="dark"] [class*="search-box"],
html[data-tapd-theme="dark"] [class*="search-input"],
html[data-tapd-theme="dark"] [class*="search-field"],
html[data-tapd-theme="dark"] [class*="filter-input"],
html[data-tapd-theme="dark"] [class*="editor-wrap"],
html[data-tapd-theme="dark"] [class*="editor-container"],
html[data-tapd-theme="dark"] [class*="editor-content"],
html[data-tapd-theme="dark"] [class*="editor-body"],
html[data-tapd-theme="dark"] [class*="rich-editor"],
html[data-tapd-theme="dark"] [class*="wysiwyg"],
html[data-tapd-theme="dark"] [class*="code-mirror"],
html[data-tapd-theme="dark"] [class*="code-block"],
html[data-tapd-theme="dark"] [class*="highlight"],
html[data-tapd-theme="dark"] [class*="inline-edit"],
html[data-tapd-theme="dark"] [class*="editable-cell"] input,
html[data-tapd-theme="dark"] [class*="editable-cell"] textarea {
  background-color: var(--tapd-bg-input) !important;
  color: var(--tapd-text-primary) !important;
}

/* --- Overlay / mask layers --- */
html[data-tapd-theme="dark"] [class*="overlay"],
html[data-tapd-theme="dark"] [class*="v-modal"],
html[data-tapd-theme="dark"] [class*="modal-mask"],
html[data-tapd-theme="dark"] [class*="dialog-mask"],
html[data-tapd-theme="dark"] [class*="mask-layer"],
html[data-tapd-theme="dark"] [class*="popup-mask"],
html[data-tapd-theme="dark"] [class*="tfl-mask"] {
  background-color: var(--tapd-bg-overlay) !important;
}

/* --- Element UI loading mask (covers table headers, interfering with text color) --- */
html[data-tapd-theme="dark"] .el-loading-mask,
html[data-tapd-theme="dark"] [class*="el-loading-mask"] {
  background-color: transparent !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* --- Row head cell hover background (covers the label text) --- */
html[data-tapd-theme="dark"] .row-head-cell__hover__bg,
html[data-tapd-theme="dark"] [class*="row-head-cell__hover__bg"] {
  display: none !important;
}

/* --- Table elements --- */
html[data-tapd-theme="dark"] [class*="table-wrap"],
html[data-tapd-theme="dark"] [class*="table-view"],
html[data-tapd-theme="dark"] [class*="list-table"],
html[data-tapd-theme="dark"] [class*="table-header"],
html[data-tapd-theme="dark"] [class*="table-head"],
html[data-tapd-theme="dark"] [class*="table-fixed"],
html[data-tapd-theme="dark"] [class*="table-container"],
html[data-tapd-theme="dark"] [class*="table-responsive"],
html[data-tapd-theme="dark"] [class*="grid-view"],
html[data-tapd-theme="dark"] [class*="grid-wrap"],
html[data-tapd-theme="dark"] [class*="allocation-table"],
html[data-tapd-theme="dark"] [class*="allocation-row"] {
  border-color: var(--tapd-border) !important;
}

/* --- Tab / navigation --- */
html[data-tapd-theme="dark"] [class*="tab-bar"] [class*="tab"],
html[data-tapd-theme="dark"] [class*="tabs-header"],
html[data-tapd-theme="dark"] [class*="tab-item"],
html[data-tapd-theme="dark"] [class*="pagination"],
html[data-tapd-theme="dark"] [class*="page-num"],
html[data-tapd-theme="dark"] [class*="breadcrumb"],
html[data-tapd-theme="dark"] [class*="crumb"],
html[data-tapd-theme="dark"] [class*="tree-node"],
html[data-tapd-theme="dark"] [class*="tree-item"],
html[data-tapd-theme="dark"] [class*="divider"],
html[data-tapd-theme="dark"] [class*="separator"] {
  color: var(--tapd-text-primary) !important;
  border-color: var(--tapd-border) !important;
}

/* --- Tags, badges, labels --- */
html[data-tapd-theme="dark"] [class*="tag"],
html[data-tapd-theme="dark"] [class*="badge"],
html[data-tapd-theme="dark"] [class*="label"],
html[data-tapd-theme="dark"] [class*="status-tag"],
html[data-tapd-theme="dark"] [class*="select2-selection__choice"] {
  background-color: var(--tapd-tag-bg) !important;
  color: var(--tapd-tag-text) !important;
}

/* --- Empty / no-data states --- */
html[data-tapd-theme="dark"] [class*="empty-state"],
html[data-tapd-theme="dark"] [class*="no-data"],
html[data-tapd-theme="dark"] [class*="empty-content"],
html[data-tapd-theme="dark"] [class*="placeholder"] {
  color: var(--tapd-text-muted) !important;
}

/* --- Comment / attachment items --- */
html[data-tapd-theme="dark"] [class*="comment-item"],
html[data-tapd-theme="dark"] [class*="comment-body"],
html[data-tapd-theme="dark"] [class*="attachment-item"],
html[data-tapd-theme="dark"] [class*="file-item"] {
  border-color: var(--tapd-border) !important;
}

/* ========== List items (bread and butter TAPD content) ========== */
html[data-tapd-theme="dark"] [class*="list-item"],
html[data-tapd-theme="dark"] [class*="list-row"],
html[data-tapd-theme="dark"] [class*="data-row"],
html[data-tapd-theme="dark"] [class*="table-row"],
html[data-tapd-theme="dark"] [class*="grid-row"],
html[data-tapd-theme="dark"] [class*="item-row"],
html[data-tapd-theme="dark"] [class*="story-row"],
html[data-tapd-theme="dark"] [class*="story-item"],
html[data-tapd-theme="dark"] [class*="bug-row"],
html[data-tapd-theme="dark"] [class*="bug-item"],
html[data-tapd-theme="dark"] [class*="task-row"],
html[data-tapd-theme="dark"] [class*="task-item"],
html[data-tapd-theme="dark"] [class*="todo-item"],
html[data-tapd-theme="dark"] [class*="mywork-item"],
html[data-tapd-theme="dark"] [class*="sprint-item"],
html[data-tapd-theme="dark"] [class*="iteration-item"],
html[data-tapd-theme="dark"] [class*="iteration-card"],
html[data-tapd-theme="dark"] [class*="child-item"],
html[data-tapd-theme="dark"] [class*="sub-story"],
html[data-tapd-theme="dark"] [class*="history-item"],
html[data-tapd-theme="dark"] [class*="version-item"],
html[data-tapd-theme="dark"] [class*="nav-item"],
html[data-tapd-theme="dark"] [class*="menu-item"] {
  border-color: var(--tapd-border) !important;
  color: var(--tapd-text-primary) !important;
}

/* ========== Hover states ========== */
html[data-tapd-theme="dark"] [class*="list-item"]:hover,
html[data-tapd-theme="dark"] [class*="list-row"]:hover,
html[data-tapd-theme="dark"] [class*="data-row"]:hover,
html[data-tapd-theme="dark"] [class*="table-row"]:hover,
html[data-tapd-theme="dark"] [class*="story-row"]:hover,
html[data-tapd-theme="dark"] [class*="story-item"]:hover,
html[data-tapd-theme="dark"] [class*="bug-row"]:hover,
html[data-tapd-theme="dark"] [class*="bug-item"]:hover,
html[data-tapd-theme="dark"] [class*="task-row"]:hover,
html[data-tapd-theme="dark"] [class*="task-item"]:hover,
html[data-tapd-theme="dark"] [class*="todo-item"]:hover,
html[data-tapd-theme="dark"] [class*="mywork-item"]:hover,
html[data-tapd-theme="dark"] [class*="sprint-item"]:hover,
html[data-tapd-theme="dark"] [class*="iteration-item"]:hover,
html[data-tapd-theme="dark"] [class*="child-item"]:hover,
html[data-tapd-theme="dark"] [class*="history-item"]:hover,
html[data-tapd-theme="dark"] [class*="nav-item"]:hover,
html[data-tapd-theme="dark"] [class*="menu-item"]:hover,
html[data-tapd-theme="dark"] [class*="tree-item"]:hover,
html[data-tapd-theme="dark"] [class*="tree-node"]:hover,
html[data-tapd-theme="dark"] [class*="dropdown"]:hover,
html[data-tapd-theme="dark"] [class*="dropdown-menu"] li:hover,
html[data-tapd-theme="dark"] [class*="tfl-dropdown"] li:hover {
  background-color: var(--tapd-bg-hover) !important;
}

/* ========== Active / selected states ========== */
html[data-tapd-theme="dark"] [class*="active"]:not([class*="btn"]):not([class*="button"]):not([class*="tab-bar"]):not([class*="tabs"]),
html[data-tapd-theme="dark"] [class*="selected"]:not([class*="select"]),
html[data-tapd-theme="dark"] [class*="current"] {
  background-color: var(--tapd-selected-bg) !important;
  color: var(--tapd-accent) !important;
}

/* ========== Row striping (even rows) ========== */
html[data-tapd-theme="dark"] [class*="row"]:nth-child(even),
html[data-tapd-theme="dark"] [class*="item"]:nth-child(even),
html[data-tapd-theme="dark"] tr:nth-child(even) {
  background-color: var(--tapd-table-striped) !important;
}

/* ========== Detail / form fields ========== */
html[data-tapd-theme="dark"] [class*="detail-form"],
html[data-tapd-theme="dark"] [class*="form-view"],
html[data-tapd-theme="dark"] [class*="info-panel"],
html[data-tapd-theme="dark"] [class*="detail-panel"],
html[data-tapd-theme="dark"] [class*="detail-wrap"],
html[data-tapd-theme="dark"] [class*="detail-view"],
html[data-tapd-theme="dark"] [class*="detail-container"],
html[data-tapd-theme="dark"] [class*="detail-content"],
html[data-tapd-theme="dark"] [class*="story-detail"],
html[data-tapd-theme="dark"] [class*="story-info"],
html[data-tapd-theme="dark"] [class*="bug-detail"],
html[data-tapd-theme="dark"] [class*="bug-info"],
html[data-tapd-theme="dark"] [class*="task-detail"],
html[data-tapd-theme="dark"] [class*="wiki-page"],
html[data-tapd-theme="dark"] [class*="wiki-content"],
html[data-tapd-theme="dark"] [class*="wiki-body"],
html[data-tapd-theme="dark"] [class*="requirement-detail"],
html[data-tapd-theme="dark"] [class*="requirement-desc"] {
  background-color: var(--tapd-bg-primary) !important;
}

/* ========== Kanban / Story wall columns ========== */
html[data-tapd-theme="dark"] [class*="story-wall"],
html[data-tapd-theme="dark"] [class*="kanban"],
html[data-tapd-theme="dark"] [class*="board-view"],
html[data-tapd-theme="dark"] [class*="board-column"],
html[data-tapd-theme="dark"] [class*="column-header"],
html[data-tapd-theme="dark"] [class*="story-card"],
html[data-tapd-theme="dark"] [class*="card-item"] {
  border-color: var(--tapd-border) !important;
}

/* ═══════════ Layer 5: Specific Class Overrides ═══════════
   (Moved from the original detailed rules — kept for backward compatibility) */

/* --- Scrollbar --- */
html[data-tapd-theme="dark"] ::-webkit-scrollbar { width: 8px; height: 8px; }
html[data-tapd-theme="dark"] ::-webkit-scrollbar-track { background: var(--tapd-scrollbar-bg); }
html[data-tapd-theme="dark"] ::-webkit-scrollbar-thumb {
  background: var(--tapd-scrollbar-thumb); border-radius: 4px;
}
html[data-tapd-theme="dark"] ::-webkit-scrollbar-corner { background: var(--tapd-scrollbar-bg); }

/* --- Inputs & Forms --- */
html[data-tapd-theme="dark"] input,
html[data-tapd-theme="dark"] select,
html[data-tapd-theme="dark"] textarea {
  background-color: var(--tapd-bg-input) !important;
  color: var(--tapd-text-primary) !important;
  border-color: var(--tapd-input-border) !important;
}
html[data-tapd-theme="dark"] input:disabled,
html[data-tapd-theme="dark"] select:disabled,
html[data-tapd-theme="dark"] textarea:disabled {
  background-color: var(--tapd-disabled-bg) !important;
  color: var(--tapd-disabled-text) !important;
}
html[data-tapd-theme="dark"] input::placeholder,
html[data-tapd-theme="dark"] textarea::placeholder { color: var(--tapd-text-muted) !important; }
html[data-tapd-theme="dark"] input[type="checkbox"],
html[data-tapd-theme="dark"] input[type="radio"] { accent-color: var(--tapd-accent); }

/* --- Buttons --- */
html[data-tapd-theme="dark"] button:not(.tapd-helper-btn) {
  background-color: var(--tapd-bg-elevated) !important;
  color: var(--tapd-text-primary) !important;
  border-color: var(--tapd-border) !important;
}
html[data-tapd-theme="dark"] button:hover:not(.tapd-helper-btn) {
  background-color: var(--tapd-bg-hover) !important;
}
html[data-tapd-theme="dark"] button:disabled,
html[data-tapd-theme="dark"] .btn-disabled {
  opacity: 0.5; cursor: not-allowed !important;
}

html[data-tapd-theme="dark"] .common-btn {
  background-color: var(--tapd-bg-elevated) !important;
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] .common-btn:hover {
  background-color: var(--tapd-bg-hover) !important;
}
html[data-tapd-theme="dark"] .btn-primary,
html[data-tapd-theme="dark"] .common-btn.btn-primary {
  background-color: var(--tapd-accent) !important;
  color: #fff !important;
}
html[data-tapd-theme="dark"] .btn-primary:hover {
  background-color: var(--tapd-accent-hover) !important;
}

/* --- Status colors --- */
html[data-tapd-theme="dark"] .status-open,
html[data-tapd-theme="dark"] .status-new,
html[data-tapd-theme="dark"] .status-active { color: ${C.success} !important; }
html[data-tapd-theme="dark"] .status-in-progress,
html[data-tapd-theme="dark"] .status-processing { color: ${C.accent} !important; }
html[data-tapd-theme="dark"] .status-resolved,
html[data-tapd-theme="dark"] .status-closed,
html[data-tapd-theme="dark"] .status-done,
html[data-tapd-theme="dark"] .status-rejected { color: ${C.textMuted} !important; }

html[data-tapd-theme="dark"] .priority-high,
html[data-tapd-theme="dark"] .priority-urgent,
html[data-tapd-theme="dark"] .priority-critical { color: ${C.danger} !important; }
html[data-tapd-theme="dark"] .priority-medium,
html[data-tapd-theme="dark"] .priority-normal { color: ${C.warning} !important; }
html[data-tapd-theme="dark"] .priority-low { color: ${C.textMuted} !important; }

html[data-tapd-theme="dark"] .severity-critical,
html[data-tapd-theme="dark"] .severity-blocker { background-color: rgba(241,76,76,0.2) !important; color: ${C.danger} !important; }
html[data-tapd-theme="dark"] .severity-major { background-color: rgba(255,152,0,0.2) !important; color: ${C.warning} !important; }
html[data-tapd-theme="dark"] .severity-normal { background-color: rgba(74,158,255,0.15) !important; color: ${C.accent} !important; }
html[data-tapd-theme="dark"] .severity-minor,
html[data-tapd-theme="dark"] .severity-trivial { color: ${C.textMuted} !important; }

/* --- Icons --- */
html[data-tapd-theme="dark"] .font,
html[data-tapd-theme="dark"] [class^="icon-"],
html[data-tapd-theme="dark"] [class*=" icon-"],
html[data-tapd-theme="dark"] [class*="tfl-icon"],
html[data-tapd-theme="dark"] [class*="iconfont"],
html[data-tapd-theme="dark"] [class*="icon-font"],
html[data-tapd-theme="dark"] [class*="tfl-font"],
html[data-tapd-theme="dark"] [class*="tapd-icon"],
html[data-tapd-theme="dark"] i[class*="icon"],
html[data-tapd-theme="dark"] i[class*="tfl"],
html[data-tapd-theme="dark"] i[class*="fa"],
html[data-tapd-theme="dark"] i[class*="material-icons"],
html[data-tapd-theme="dark"] i[class*="iconfont"] {
  color: var(--tapd-text-secondary) !important;
}
html[data-tapd-theme="dark"] .font:hover,
html[data-tapd-theme="dark"] [class^="icon-"]:hover,
html[data-tapd-theme="dark"] [class*=" icon-"]:hover,
html[data-tapd-theme="dark"] [class*="tfl-icon"]:hover,
html[data-tapd-theme="dark"] [class*="iconfont"]:hover,
html[data-tapd-theme="dark"] [class*="icon-font"]:hover,
html[data-tapd-theme="dark"] [class*="tfl-font"]:hover,
html[data-tapd-theme="dark"] [class*="tapd-icon"]:hover,
html[data-tapd-theme="dark"] i[class*="icon"]:hover,
html[data-tapd-theme="dark"] i[class*="tfl"]:hover,
html[data-tapd-theme="dark"] i[class*="fa"]:hover,
html[data-tapd-theme="dark"] i[class*="material-icons"]:hover,
html[data-tapd-theme="dark"] i[class*="iconfont"]:hover {
  color: var(--tapd-accent) !important;
}

/* ========== Aggressive catch-all for any remaining icon hover dark blues ========== */
html[data-tapd-theme="dark"] i[class*="icon"]:hover,
html[data-tapd-theme="dark"] i[class*="icon"]:focus,
html[data-tapd-theme="dark"] i[class*="icon"]:active,
html[data-tapd-theme="dark"] [class*="tapd-icon"]:hover,
html[data-tapd-theme="dark"] [class*="tapd-icon"]:focus,
html[data-tapd-theme="dark"] [class*="tapd-icon"]:active,
html[data-tapd-theme="dark"] [class*="icon"]:hover,
html[data-tapd-theme="dark"] [class*="icon"]:focus,
html[data-tapd-theme="dark"] [class*="icon"]:active {
  color: var(--tapd-accent) !important;
}

/* ========== Ultra-specific icon hover overrides ==========
   TAPD sometimes uses very specific selectors with !important
   on hover colors. Using multiple attribute and element selectors
   ensures our rules always win the specificity war. */
html[data-tapd-theme="dark"] body i[class*="tapd-icon"][class*="icon"]:hover,
html[data-tapd-theme="dark"] body i[class*="tapd-icon"][class*="icon"]:focus,
html[data-tapd-theme="dark"] body i[class*="tapd-icon"][class*="icon"]:active,
html[data-tapd-theme="dark"] body [class*="tapd-icon"][class*="icon"]:hover,
html[data-tapd-theme="dark"] body [class*="tapd-icon"][class*="icon"]:focus,
html[data-tapd-theme="dark"] body [class*="tapd-icon"][class*="icon"]:active {
  color: var(--tapd-accent) !important;
}

html[data-tapd-theme="dark"] .help-tip,
html[data-tapd-theme="dark"] .tip-icon { color: var(--tapd-text-muted) !important; }

/* --- Images & Avatars --- */
html[data-tapd-theme="dark"] .avatar img { filter: brightness(0.85); }

html[data-tapd-theme="dark"] img[src*=".jpg"],
html[data-tapd-theme="dark"] img[src*=".jpeg"],
html[data-tapd-theme="dark"] img[src*=".png"]:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"]):not([src*="qr"]):not([src*="barcode"]),
html[data-tapd-theme="dark"] img[src*=".gif"],
html[data-tapd-theme="dark"] img[src*=".webp"] {
  filter: brightness(0.88);
}

html[data-tapd-theme="dark"] img[width="16"],
html[data-tapd-theme="dark"] img[width="20"],
html[data-tapd-theme="dark"] img[width="24"],
html[data-tapd-theme="dark"] img[width="32"],
html[data-tapd-theme="dark"] img[height="16"],
html[data-tapd-theme="dark"] img[height="20"],
html[data-tapd-theme="dark"] img[height="24"],
html[data-tapd-theme="dark"] img[height="32"] {
  filter: none !important;
}

/* --- Iframes --- */
html[data-tapd-theme="dark"] iframe {
  background: var(--tapd-bg-primary) !important;
}
html[data-tapd-theme="dark"] .tox-edit-area__iframe,
html[data-tapd-theme="dark"] iframe[class*="tox-edit-area"],
html[data-tapd-theme="dark"] iframe[class*="editor"],
html[data-tapd-theme="dark"] iframe[id*="editor"],
html[data-tapd-theme="dark"] iframe[id*="richtext"] {
  background: var(--tapd-bg-secondary) !important;
}
html[data-tapd-theme="dark"] .iframe-wrap,
html[data-tapd-theme="dark"] .iframe-container,
html[data-tapd-theme="dark"] .embed-wrap {
  background: var(--tapd-bg-primary) !important;
  border-color: var(--tapd-border) !important;
}

/* --- Loading / Spinner --- */
html[data-tapd-theme="dark"] .loading,
html[data-tapd-theme="dark"] .spinner {
  border-color: var(--tapd-border) !important;
  border-top-color: var(--tapd-accent) !important;
}

/* --- Progress bars --- */
html[data-tapd-theme="dark"] .progress-bar,
html[data-tapd-theme="dark"] .progress { background-color: var(--tapd-bg-input) !important; }
html[data-tapd-theme="dark"] .progress-bar .fill,
html[data-tapd-theme="dark"] .progress .fill { background-color: var(--tapd-accent) !important; }

/* --- Checkbox & Radio Labels --- */
html[data-tapd-theme="dark"] .checkbox-label,
html[data-tapd-theme="dark"] .radio-label { color: var(--tapd-text-primary) !important; }

/* --- Login page --- */
html[data-tapd-theme="dark"] .login-body,
html[data-tapd-theme="dark"] .login-wrapper {
  background-color: var(--tapd-bg-primary) !important;
}
html[data-tapd-theme="dark"] .login-form {
  background-color: var(--tapd-bg-secondary) !important;
}
html[data-tapd-theme="dark"] .login-title,
html[data-tapd-theme="dark"] .login-tab .login-tab-one {
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] .login-protocol,
html[data-tapd-theme="dark"] .login-protocol a {
  color: var(--tapd-text-secondary) !important;
}
html[data-tapd-theme="dark"] .login-submit {
  background-color: var(--tapd-accent) !important;
  color: #fff !important;
}
html[data-tapd-theme="dark"] .login-submit:hover {
  background-color: var(--tapd-accent-hover) !important;
}

/* --- Page-level containers (TFL traditional pages) --- */
html[data-tapd-theme="dark"] .frame-main,
html[data-tapd-theme="dark"] .frame-side,
html[data-tapd-theme="dark"] .frame-top,
html[data-tapd-theme="dark"] #page-content,
html[data-tapd-theme="dark"] [class*="tui-skin"],
html[data-tapd-theme="dark"] .tui-body-wrap,
html[data-tapd-theme="dark"] .body-wrap,
html[data-tapd-theme="dark"] .content-wrap,
html[data-tapd-theme="dark"] .main-wrap,
html[data-tapd-theme="dark"] .page-wrap {
  background-color: var(--tapd-bg-primary) !important;
}

/* --- Message Center (消息中心) --- */
html[data-tapd-theme="dark"] .letter-list,
html[data-tapd-theme="dark"] .letter {
  background-color: var(--tapd-bg-primary) !important;
}
html[data-tapd-theme="dark"] .letter {
  border-bottom-color: var(--tapd-border) !important;
}
html[data-tapd-theme="dark"] .letter .tag {
  background-color: transparent !important;
}
html[data-tapd-theme="dark"] .letter .from-nick,
html[data-tapd-theme="dark"] .letter .item {
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] .letter .info .title {
  color: var(--tapd-text-secondary) !important;
}
html[data-tapd-theme="dark"] .letter .info a {
  color: var(--tapd-link) !important;
}
html[data-tapd-theme="dark"] .letter .date .item {
  color: var(--tapd-text-muted) !important;
}
html[data-tapd-theme="dark"] .letter-company-name {
  color: var(--tapd-text-muted) !important;
}
html[data-tapd-theme="dark"] .title h1 {
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] .title {
  background: transparent !important;
  background-color: transparent !important;
}
html[data-tapd-theme="dark"] .ico-bell-big-gray,
html[data-tapd-theme="dark"] .ico-tip-new,
html[data-tapd-theme="dark"] [class*="ico-"] {
  color: var(--tapd-text-secondary) !important;
  filter: brightness(1.5);
}
html[data-tapd-theme="dark"] .workitem-icon,
html[data-tapd-theme="dark"] [class*="workitem-icon"] {
  color: var(--tapd-text-secondary) !important;
}
html[data-tapd-theme="dark"] .avatar-text-default,
html[data-tapd-theme="dark"] .avatar-default-name {
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] .avatar-red-dot {
  background-color: var(--tapd-danger) !important;
}
html[data-tapd-theme="dark"] .bottom-action,
html[data-tapd-theme="dark"] .simple-pager {
  background-color: var(--tapd-bg-primary) !important;
  border-color: var(--tapd-border) !important;
}
html[data-tapd-theme="dark"] .simple-pager .page-btn {
  background-color: var(--tapd-bg-elevated) !important;
  color: var(--tapd-text-primary) !important;
  border-color: var(--tapd-border) !important;
}
html[data-tapd-theme="dark"] .simple-pager .page-btn:hover {
  background-color: var(--tapd-bg-hover) !important;
}
html[data-tapd-theme="dark"] .simple-pager .current-page {
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] .font-prev-fill,
html[data-tapd-theme="dark"] .font-next-fill,
html[data-tapd-theme="dark"] .font-arrow-down-s {
  color: var(--tapd-text-secondary) !important;
}
html[data-tapd-theme="dark"] .font-prev-fill:hover,
html[data-tapd-theme="dark"] .font-next-fill:hover,
html[data-tapd-theme="dark"] .font-arrow-down-s:hover {
  color: var(--tapd-accent) !important;
}

/* ═══════════ Layer 6: Inline Style Overrides ═══════════
   Elements with inline background: #fff, rgb(255,255,255), etc.
   Elements with inline dark text colors: #333, #666, #000, etc. */

/* --- Inline background overrides --- */
html[data-tapd-theme="dark"] [style*="background-color:#fff"],
html[data-tapd-theme="dark"] [style*="background-color: #fff"],
html[data-tapd-theme="dark"] [style*="background-color:white"],
html[data-tapd-theme="dark"] [style*="background-color: white"],
html[data-tapd-theme="dark"] [style*="background-color:#ffffff"],
html[data-tapd-theme="dark"] [style*="background-color: #ffffff"],
html[data-tapd-theme="dark"] [style*="background:#fff"],
html[data-tapd-theme="dark"] [style*="background: #fff"],
html[data-tapd-theme="dark"] [style*="background:white"],
html[data-tapd-theme="dark"] [style*="background: white"],
html[data-tapd-theme="dark"] [style*="background:rgb(255,255,255"],
html[data-tapd-theme="dark"] [style*="background: rgb(255,255,255"],
html[data-tapd-theme="dark"] [style*="background:#ffffff"],
html[data-tapd-theme="dark"] [style*="background: #ffffff"] {
  background-color: var(--tapd-bg-secondary) !important;
}

/* --- Inline color overrides: convert dark text to light --- */
html[data-tapd-theme="dark"] [style*="color:#333"],
html[data-tapd-theme="dark"] [style*="color: #333"],
html[data-tapd-theme="dark"] [style*="color:#333333"],
html[data-tapd-theme="dark"] [style*="color: #333333"],
html[data-tapd-theme="dark"] [style*="color:#666"],
html[data-tapd-theme="dark"] [style*="color: #666"],
html[data-tapd-theme="dark"] [style*="color:#666666"],
html[data-tapd-theme="dark"] [style*="color: #666666"],
html[data-tapd-theme="dark"] [style*="color:#444"],
html[data-tapd-theme="dark"] [style*="color: #444"],
html[data-tapd-theme="dark"] [style*="color:#444444"],
html[data-tapd-theme="dark"] [style*="color: #444444"],
html[data-tapd-theme="dark"] [style*="color:#555"],
html[data-tapd-theme="dark"] [style*="color: #555"],
html[data-tapd-theme="dark"] [style*="color:#555555"],
html[data-tapd-theme="dark"] [style*="color: #555555"],
html[data-tapd-theme="dark"] [style*="color:#222"],
html[data-tapd-theme="dark"] [style*="color: #222"],
html[data-tapd-theme="dark"] [style*="color:#222222"],
html[data-tapd-theme="dark"] [style*="color: #222222"],
html[data-tapd-theme="dark"] [style*="color:#111"],
html[data-tapd-theme="dark"] [style*="color: #111"],
html[data-tapd-theme="dark"] [style*="color:#111111"],
html[data-tapd-theme="dark"] [style*="color: #111111"],
html[data-tapd-theme="dark"] [style*="color:#000"],
html[data-tapd-theme="dark"] [style*="color: #000"],
html[data-tapd-theme="dark"] [style*="color:#000000"],
html[data-tapd-theme="dark"] [style*="color: #000000"],
html[data-tapd-theme="dark"] [style*="color:black"],
html[data-tapd-theme="dark"] [style*="color: black"],
html[data-tapd-theme="dark"] [style*="color:#999"],
html[data-tapd-theme="dark"] [style*="color: #999"],
html[data-tapd-theme="dark"] [style*="color:#999999"],
html[data-tapd-theme="dark"] [style*="color: #999999"],
html[data-tapd-theme="dark"] [style*="color:#777"],
html[data-tapd-theme="dark"] [style*="color: #777"],
html[data-tapd-theme="dark"] [style*="color:#777777"],
html[data-tapd-theme="dark"] [style*="color: #777777"],
html[data-tapd-theme="dark"] [style*="color:#888"],
html[data-tapd-theme="dark"] [style*="color: #888"],
html[data-tapd-theme="dark"] [style*="color:#888888"],
html[data-tapd-theme="dark"] [style*="color: #888888"],
html[data-tapd-theme="dark"] [style*="color:rgb(0,0,0"],
html[data-tapd-theme="dark"] [style*="color: rgb(0,0,0"],
html[data-tapd-theme="dark"] [style*="color:rgb(51,51,51"],
html[data-tapd-theme="dark"] [style*="color: rgb(51,51,51"],
html[data-tapd-theme="dark"] [style*="color:rgb(102,102,102"],
html[data-tapd-theme="dark"] [style*="color: rgb(102,102,102"] {
  color: var(--tapd-text-primary) !important;
}

/* --- Inline color overrides: dark blues (common for links) --- */
html[data-tapd-theme="dark"] [style*="color:#0052d9"],
html[data-tapd-theme="dark"] [style*="color: #0052d9"],
html[data-tapd-theme="dark"] [style*="color:#1677ff"],
html[data-tapd-theme="dark"] [style*="color: #1677ff"],
html[data-tapd-theme="dark"] [style*="color:#0066cc"],
html[data-tapd-theme="dark"] [style*="color: #0066cc"],
html[data-tapd-theme="dark"] [style*="color:#1a73e8"],
html[data-tapd-theme="dark"] [style*="color: #1a73e8"],
html[data-tapd-theme="dark"] [style*="color:#1565c0"],
html[data-tapd-theme="dark"] [style*="color: #1565c0"],
html[data-tapd-theme="dark"] [style*="color:#1976d2"],
html[data-tapd-theme="dark"] [style*="color: #1976d2"],
html[data-tapd-theme="dark"] [style*="color:#0d5bdd"],
html[data-tapd-theme="dark"] [style*="color: #0d5bdd"],
html[data-tapd-theme="dark"] [style*="color:#1d77ef"],
html[data-tapd-theme="dark"] [style*="color: #1d77ef"],
html[data-tapd-theme="dark"] [style*="color:#065fd4"],
html[data-tapd-theme="dark"] [style*="color: #065fd4"],
html[data-tapd-theme="dark"] [style*="color:#1769aa"],
html[data-tapd-theme="dark"] [style*="color: #1769aa"],
html[data-tapd-theme="dark"] [style*="color:#2d7fc1"],
html[data-tapd-theme="dark"] [style*="color: #2d7fc1"],
html[data-tapd-theme="dark"] [style*="color:#003366"],
html[data-tapd-theme="dark"] [style*="color: #003366"],
html[data-tapd-theme="dark"] [style*="color:#004080"],
html[data-tapd-theme="dark"] [style*="color: #004080"],
html[data-tapd-theme="dark"] [style*="color:#003399"],
html[data-tapd-theme="dark"] [style*="color: #003399"],
html[data-tapd-theme="dark"] [style*="color:#002266"],
html[data-tapd-theme="dark"] [style*="color: #002266"],
html[data-tapd-theme="dark"] [style*="color:#0a2463"],
html[data-tapd-theme="dark"] [style*="color: #0a2463"],
html[data-tapd-theme="dark"] [style*="color:#1e3a5f"],
html[data-tapd-theme="dark"] [style*="color: #1e3a5f"],
html[data-tapd-theme="dark"] [style*="color:#2c3e50"],
html[data-tapd-theme="dark"] [style*="color: #2c3e50"],
html[data-tapd-theme="dark"] [style*="color:#34495e"],
html[data-tapd-theme="dark"] [style*="color: #34495e"],
html[data-tapd-theme="dark"] [style*="color:#2b5797"],
html[data-tapd-theme="dark"] [style*="color: #2b5797"] {
  color: var(--tapd-link) !important;
}

/* ========== Text color class overrides ==========
   TAPD often uses short color classes like .c-333 or .fc-666 */
html[data-tapd-theme="dark"] [class*="c-333"],
html[data-tapd-theme="dark"] [class*="c-666"],
html[data-tapd-theme="dark"] [class*="c-999"],
html[data-tapd-theme="dark"] [class*="c-555"],
html[data-tapd-theme="dark"] [class*="c-444"],
html[data-tapd-theme="dark"] [class*="c-222"],
html[data-tapd-theme="dark"] [class*="c-111"],
html[data-tapd-theme="dark"] [class*="c-000"],
html[data-tapd-theme="dark"] [class*="fc-333"],
html[data-tapd-theme="dark"] [class*="fc-666"],
html[data-tapd-theme="dark"] [class*="fc-999"],
html[data-tapd-theme="dark"] [class*="fc-555"],
html[data-tapd-theme="dark"] [class*="fc-444"],
html[data-tapd-theme="dark"] [class*="fc-222"],
html[data-tapd-theme="dark"] [class*="fc-111"],
html[data-tapd-theme="dark"] [class*="fc-000"],
html[data-tapd-theme="dark"] [class*="color-333"],
html[data-tapd-theme="dark"] [class*="color-666"],
html[data-tapd-theme="dark"] [class*="text-dark"],
html[data-tapd-theme="dark"] [class*="text-gray"],
html[data-tapd-theme="dark"] [class*="text-black"],
html[data-tapd-theme="dark"] [class*="text-333"],
html[data-tapd-theme="dark"] [class*="text-666"],
html[data-tapd-theme="dark"] [class*="text-999"],
html[data-tapd-theme="dark"] [class*="gray-text"],
html[data-tapd-theme="dark"] [class*="grey-text"],
html[data-tapd-theme="dark"] [class*="dark-text"] {
  color: var(--tapd-text-primary) !important;
}

/* ========== Dark blue / link color class overrides ==========
   TAPD often uses classes like .c-0052d9, .blue, .blue-text, .link-color etc. */
html[data-tapd-theme="dark"] [class*="blue"],
html[data-tapd-theme="dark"] [class*="Blue"],
html[data-tapd-theme="dark"] [class*="primary"],
html[data-tapd-theme="dark"] [class*="Primary"],
html[data-tapd-theme="dark"] [class*="link-color"],
html[data-tapd-theme="dark"] [class*="link-colour"],
html[data-tapd-theme="dark"] [class*="blue-text"],
html[data-tapd-theme="dark"] [class*="blue-color"],
html[data-tapd-theme="dark"] [class*="text-blue"],
html[data-tapd-theme="dark"] [class*="text-primary"],
html[data-tapd-theme="dark"] [class*="font-blue"],
html[data-tapd-theme="dark"] [class*="c-blue"],
html[data-tapd-theme="dark"] [class*="fc-blue"],
html[data-tapd-theme="dark"] [class*="color-blue"],
html[data-tapd-theme="dark"] [class*="theme-color"] {
  color: var(--tapd-link) !important;
}

/* ========== BEM-style label/name class overrides ==========
   TAPD uses BEM naming like cell__name-label, form__label, etc.
   These often have dark blue text colors set via specific selectors. */
html[data-tapd-theme="dark"] [class*="__name-label"],
html[data-tapd-theme="dark"] [class*="__label-text"],
html[data-tapd-theme="dark"] [class*="__label-name"],
html[data-tapd-theme="dark"] [class*="__title-label"],
html[data-tapd-theme="dark"] [class*="__text-label"],
html[data-tapd-theme="dark"] [class*="__cell-label"],
html[data-tapd-theme="dark"] [class*="__field-label"],
html[data-tapd-theme="dark"] [class*="__col-label"],
html[data-tapd-theme="dark"] [class*="__row-label"],
html[data-tapd-theme="dark"] [class*="__header-label"],
html[data-tapd-theme="dark"] [class*="__item-label"],
html[data-tapd-theme="dark"] [class*="__name-text"],
html[data-tapd-theme="dark"] [class*="__name-title"],
html[data-tapd-theme="dark"] [class*="cell__name"],
html[data-tapd-theme="dark"] [class*="cell__title"],
html[data-tapd-theme="dark"] [class*="cell__text"],
html[data-tapd-theme="dark"] [class*="cell__label"],
html[data-tapd-theme="dark"] [class*="cell__value"],
html[data-tapd-theme="dark"] [class*="cell__content"],
html[data-tapd-theme="dark"] [class*="row__name"],
html[data-tapd-theme="dark"] [class*="row__label"],
html[data-tapd-theme="dark"] [class*="row__text"],
html[data-tapd-theme="dark"] [class*="row__title"],
html[data-tapd-theme="dark"] [class*="col__name"],
html[data-tapd-theme="dark"] [class*="col__label"],
html[data-tapd-theme="dark"] [class*="col__text"],
html[data-tapd-theme="dark"] [class*="col__title"],
html[data-tapd-theme="dark"] [class*="field__name"],
html[data-tapd-theme="dark"] [class*="field__label"],
html[data-tapd-theme="dark"] [class*="field__text"],
html[data-tapd-theme="dark"] [class*="field__title"],
html[data-tapd-theme="dark"] [class*="item__name"],
html[data-tapd-theme="dark"] [class*="item__label"],
html[data-tapd-theme="dark"] [class*="item__text"],
html[data-tapd-theme="dark"] [class*="item__title"],
html[data-tapd-theme="dark"] [class*="header__name"],
html[data-tapd-theme="dark"] [class*="header__label"],
html[data-tapd-theme="dark"] [class*="header__text"],
html[data-tapd-theme="dark"] [class*="header__title"],
html[data-tapd-theme="dark"] [class*="label__name"],
html[data-tapd-theme="dark"] [class*="label__text"],
html[data-tapd-theme="dark"] [class*="label__title"],
html[data-tapd-theme="dark"] [class*="name__label"],
html[data-tapd-theme="dark"] [class*="name__text"],
html[data-tapd-theme="dark"] [class*="name__title"] {
  color: var(--tapd-text-primary) !important;
}

/* ========== Row/cell header context (higher specificity for TAPD table headers) ========== */
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__name"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__name-label"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__label"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__text"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__title"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__value"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__content"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__name-icon"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="cell__suffix"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__name"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__content"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__hover"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__suffix"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__label"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__text"] {
  color: var(--tapd-text-primary) !important;
}
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__suffix"] i[class*="icon"],
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__suffix"] i[class*="tapd"] {
  color: var(--tapd-text-secondary) !important;
}
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__suffix"] i[class*="icon"]:hover,
html[data-tapd-theme="dark"] [class*="row-head-cell"] [class*="row-head-cell__suffix"] i[class*="tapd"]:hover,
html[data-tapd-theme="dark"] [class*="row-head-cell__hover"]:hover [class*="row-head-cell__suffix"] i[class*="icon"],
html[data-tapd-theme="dark"] [class*="row-head-cell__hover"]:hover [class*="row-head-cell__suffix"] i[class*="tapd"] {
  color: var(--tapd-accent) !important;
}

/* ========== CSS Animation approach for table header label text ==========
   TAPD's JavaScript sets inline styles (style.color = '#333') after rendering.
   CSS animations have higher cascade priority than inline styles, so they
   can override inline styles even without !important. */
@keyframes tapd-fix-label-color {
  from { color: var(--tapd-text-primary); }
  to   { color: var(--tapd-text-primary); }
}
html[data-tapd-theme="dark"] [class*="cell__name-label"],
html[data-tapd-theme="dark"] [class*="tapd-table__text-label"] {
  animation: tapd-fix-label-color 0.001s forwards !important;
}

/* ========== Subject / title spans in lists (common TAPD pattern) ========== */
html[data-tapd-theme="dark"] span[class*="subject"],
html[data-tapd-theme="dark"] span[class*="Subject"],
html[data-tapd-theme="dark"] span[class*="story-name"],
html[data-tapd-theme="dark"] span[class*="story-title"],
html[data-tapd-theme="dark"] span[class*="bug-title"],
html[data-tapd-theme="dark"] span[class*="task-title"],
html[data-tapd-theme="dark"] span[class*="wiki-title"],
html[data-tapd-theme="dark"] span[class*="item-title"],
html[data-tapd-theme="dark"] span[class*="item-name"],
html[data-tapd-theme="dark"] span[class*="item-text"],
html[data-tapd-theme="dark"] span[class*="list-title"],
html[data-tapd-theme="dark"] span[class*="list-name"],
html[data-tapd-theme="dark"] span[class*="field-name"],
html[data-tapd-theme="dark"] span[class*="field-label"],
html[data-tapd-theme="dark"] span[class*="field-value"],
html[data-tapd-theme="dark"] span[class*="prop-name"],
html[data-tapd-theme="dark"] span[class*="prop-value"],
html[data-tapd-theme="dark"] span[class*="cell-value"],
html[data-tapd-theme="dark"] span[class*="cell-text"],
html[data-tapd-theme="dark"] span[class*="text-content"],
html[data-tapd-theme="dark"] span[class*="content-text"],
html[data-tapd-theme="dark"] span[class*="desc-text"],
html[data-tapd-theme="dark"] span[class*="name-text"],
html[data-tapd-theme="dark"] span[class*="value-text"],
html[data-tapd-theme="dark"] span[class*="label-text"] {
  color: var(--tapd-text-primary) !important;
}

/* ========== Span icon/image containers (spans wrapping SVG or icons) ========== */
html[data-tapd-theme="dark"] span[class*="svg"],
html[data-tapd-theme="dark"] span[class*="icon-wrap"],
html[data-tapd-theme="dark"] span[class*="icon-container"],
html[data-tapd-theme="dark"] span[class*="icon-box"],
html[data-tapd-theme="dark"] span[class*="img-wrap"],
html[data-tapd-theme="dark"] span[class*="image-wrap"],
html[data-tapd-theme="dark"] span[class*="avatar-wrap"],
html[data-tapd-theme="dark"] span[class*="badge-wrap"],
html[data-tapd-theme="dark"] span[class*="tag-wrap"] {
  color: var(--tapd-text-secondary) !important;
}

/* ========== Div text content containers (ensure readable text) ========== */
html[data-tapd-theme="dark"] div[class*="text-content"],
html[data-tapd-theme="dark"] div[class*="content-text"],
html[data-tapd-theme="dark"] div[class*="desc-content"],
html[data-tapd-theme="dark"] div[class*="description"],
html[data-tapd-theme="dark"] div[class*="desc-wrap"],
html[data-tapd-theme="dark"] div[class*="summary"],
html[data-tapd-theme="dark"] div[class*="detail-content"],
html[data-tapd-theme="dark"] div[class*="detail-text"],
html[data-tapd-theme="dark"] div[class*="detail-desc"],
html[data-tapd-theme="dark"] div[class*="info-content"],
html[data-tapd-theme="dark"] div[class*="info-text"],
html[data-tapd-theme="dark"] div[class*="body-content"],
html[data-tapd-theme="dark"] div[class*="main-content"],
html[data-tapd-theme="dark"] div[class*="page-content"],
html[data-tapd-theme="dark"] div[class*="view-content"],
html[data-tapd-theme="dark"] div[class*="story-content"],
html[data-tapd-theme="dark"] div[class*="bug-content"],
html[data-tapd-theme="dark"] div[class*="wiki-content"],
html[data-tapd-theme="dark"] div[class*="comment-content"],
html[data-tapd-theme="dark"] div[class*="note-content"],
html[data-tapd-theme="dark"] div[class*="remark-content"],
html[data-tapd-theme="dark"] div[class*="field-content"],
html[data-tapd-theme="dark"] div[class*="cell-content"],
html[data-tapd-theme="dark"] div[class*="text-wrap"],
html[data-tapd-theme="dark"] div[class*="text-area"],
html[data-tapd-theme="dark"] div[class*="text-block"],
html[data-tapd-theme="dark"] div[class*="text-section"],
html[data-tapd-theme="dark"] div[class*="text-container"],
html[data-tapd-theme="dark"] div[class*="text-box"],
html[data-tapd-theme="dark"] div[class*="text-panel"] {
  color: var(--tapd-text-primary) !important;
}

/* ========== Specific dark text color overrides for known TAPD patterns ========== */
html[data-tapd-theme="dark"] .gray,
html[data-tapd-theme="dark"] .grey,
html[data-tapd-theme="dark"] .dark,
html[data-tapd-theme="dark"] .fc5,
html[data-tapd-theme="dark"] .fc3,
html[data-tapd-theme="dark"] .fc6,
html[data-tapd-theme="dark"] .fc9 {
  color: var(--tapd-text-primary) !important;
}

/* ========== Description / content text that might be dark gray ========== */
html[data-tapd-theme="dark"] [class*="description"],
html[data-tapd-theme="dark"] [class*="desc-text"],
html[data-tapd-theme="dark"] [class*="summary"],
html[data-tapd-theme="dark"] [class*="comment-text"],
html[data-tapd-theme="dark"] [class*="content-text"],
html[data-tapd-theme="dark"] [class*="body-text"],
html[data-tapd-theme="dark"] [class*="text-content"],
html[data-tapd-theme="dark"] [class*="note-text"],
html[data-tapd-theme="dark"] [class*="remark-text"],
html[data-tapd-theme="dark"] [class*="subject"],
html[data-tapd-theme="dark"] [class*="title-text"] {
  color: var(--tapd-text-primary) !important;
}

/* ═══════════ Layer 7: SVG, Icons, Charts ═══════════ */

/* --- SVG text elements --- */
html[data-tapd-theme="dark"] svg text,
html[data-tapd-theme="dark"] svg tspan,
html[data-tapd-theme="dark"] svg textPath,
html[data-tapd-theme="dark"] svg title,
html[data-tapd-theme="dark"] svg desc {
  fill: var(--tapd-text-primary) !important;
}

/* --- SVG lines (chart axes, gridlines) --- */
html[data-tapd-theme="dark"] svg line,
html[data-tapd-theme="dark"] svg polyline {
  stroke: var(--tapd-text-muted) !important;
}

/* --- SVG decorative shapes (chart backgrounds, bars) --- */
html[data-tapd-theme="dark"] svg rect:not([fill*="none"]):not([fill*="transparent"]),
html[data-tapd-theme="dark"] svg circle:not([fill*="none"]):not([fill*="transparent"]),
html[data-tapd-theme="dark"] svg ellipse:not([fill*="none"]):not([fill*="transparent"]),
html[data-tapd-theme="dark"] svg path:not([stroke*="none"]):not([fill*="none"]):not([fill*="transparent"]),
html[data-tapd-theme="dark"] svg polygon:not([fill*="none"]):not([fill*="transparent"]) {
  fill: var(--tapd-bg-elevated) !important;
}

/* --- SVG paths that are likely icons (no fill, with stroke) --- */
html[data-tapd-theme="dark"] svg path:not([fill]):not([fill*="none"]),
html[data-tapd-theme="dark"] svg path[fill*="currentColor"] {
  stroke: var(--tapd-text-secondary) !important;
}

/* --- Inline SVG icons (common in TAPD) --- */
html[data-tapd-theme="dark"] svg[style*="fill"]:not([style*="fill:none"]),
html[data-tapd-theme="dark"] svg [fill="#333"],
html[data-tapd-theme="dark"] svg [fill="#666"],
html[data-tapd-theme="dark"] svg [fill="#999"],
html[data-tapd-theme="dark"] svg [fill="#444"],
html[data-tapd-theme="dark"] svg [fill="#555"],
html[data-tapd-theme="dark"] svg [fill="#222"],
html[data-tapd-theme="dark"] svg [fill="#111"],
html[data-tapd-theme="dark"] svg [fill="#000"],
html[data-tapd-theme="dark"] svg [fill="#333333"],
html[data-tapd-theme="dark"] svg [fill="#666666"],
html[data-tapd-theme="dark"] svg [fill="#999999"],
html[data-tapd-theme="dark"] svg [fill="#444444"],
html[data-tapd-theme="dark"] svg [fill="#555555"],
html[data-tapd-theme="dark"] svg [fill="#222222"],
html[data-tapd-theme="dark"] svg [fill="#111111"],
html[data-tapd-theme="dark"] svg [fill="#000000"],
html[data-tapd-theme="dark"] svg [fill="black"],
html[data-tapd-theme="dark"] svg [fill*="rgb(0,0,0"],
html[data-tapd-theme="dark"] svg [fill*="rgb(51,51,51"],
html[data-tapd-theme="dark"] svg [fill*="rgb(102,102,102"],
html[data-tapd-theme="dark"] svg [stroke="#333"],
html[data-tapd-theme="dark"] svg [stroke="#666"],
html[data-tapd-theme="dark"] svg [stroke="#999"],
html[data-tapd-theme="dark"] svg [stroke="#444"],
html[data-tapd-theme="dark"] svg [stroke="#555"],
html[data-tapd-theme="dark"] svg [stroke="#222"],
html[data-tapd-theme="dark"] svg [stroke="#111"],
html[data-tapd-theme="dark"] svg [stroke="#000"],
html[data-tapd-theme="dark"] svg [stroke="#333333"],
html[data-tapd-theme="dark"] svg [stroke="#666666"],
html[data-tapd-theme="dark"] svg [stroke="#999999"],
html[data-tapd-theme="dark"] svg [stroke="#000000"],
html[data-tapd-theme="dark"] svg [stroke="black"] {
  fill: var(--tapd-text-secondary) !important;
  stroke: var(--tapd-text-secondary) !important;
}

/* --- SVG dark blue overrides (link icons, status icons) --- */
html[data-tapd-theme="dark"] svg [fill="#0052d9"],
html[data-tapd-theme="dark"] svg [fill="#1677ff"],
html[data-tapd-theme="dark"] svg [fill="#0066cc"],
html[data-tapd-theme="dark"] svg [fill="#1a73e8"],
html[data-tapd-theme="dark"] svg [fill="#1565c0"],
html[data-tapd-theme="dark"] svg [fill="#1976d2"],
html[data-tapd-theme="dark"] svg [fill="#0d5bdd"],
html[data-tapd-theme="dark"] svg [fill="#1d77ef"],
html[data-tapd-theme="dark"] svg [fill="#065fd4"],
html[data-tapd-theme="dark"] svg [fill="#1769aa"],
html[data-tapd-theme="dark"] svg [fill="#2d7fc1"],
html[data-tapd-theme="dark"] svg [fill="#003366"],
html[data-tapd-theme="dark"] svg [fill="#004080"],
html[data-tapd-theme="dark"] svg [fill="#003399"],
html[data-tapd-theme="dark"] svg [fill="#2c3e50"],
html[data-tapd-theme="dark"] svg [fill="#34495e"],
html[data-tapd-theme="dark"] svg [stroke="#0052d9"],
html[data-tapd-theme="dark"] svg [stroke="#1677ff"],
html[data-tapd-theme="dark"] svg [stroke="#0066cc"],
html[data-tapd-theme="dark"] svg [stroke="#1a73e8"],
html[data-tapd-theme="dark"] svg [stroke="#1565c0"],
html[data-tapd-theme="dark"] svg [stroke="#1976d2"],
html[data-tapd-theme="dark"] svg [stroke="#0d5bdd"],
html[data-tapd-theme="dark"] svg [stroke="#1d77ef"],
html[data-tapd-theme="dark"] svg [stroke="#065fd4"],
html[data-tapd-theme="dark"] svg [stroke="#1769aa"],
html[data-tapd-theme="dark"] svg [stroke="#2d7fc1"],
html[data-tapd-theme="dark"] svg [stroke="#003366"],
html[data-tapd-theme="dark"] svg [stroke="#004080"],
html[data-tapd-theme="dark"] svg [stroke="#003399"],
html[data-tapd-theme="dark"] svg [stroke="#2c3e50"],
html[data-tapd-theme="dark"] svg [stroke="#34495e"] {
  fill: var(--tapd-link) !important;
  stroke: var(--tapd-link) !important;
}

/* --- SVG hover/focus/active overrides for dark blue fills --- */
html[data-tapd-theme="dark"] svg [fill="#0052d9"]:hover,
html[data-tapd-theme="dark"] svg [fill="#0052d9"]:focus,
html[data-tapd-theme="dark"] svg [fill="#0052d9"]:active,
html[data-tapd-theme="dark"] svg [fill="#1677ff"]:hover,
html[data-tapd-theme="dark"] svg [fill="#1677ff"]:focus,
html[data-tapd-theme="dark"] svg [fill="#1677ff"]:active,
html[data-tapd-theme="dark"] svg [fill="#0066cc"]:hover,
html[data-tapd-theme="dark"] svg [fill="#0066cc"]:focus,
html[data-tapd-theme="dark"] svg [fill="#0066cc"]:active,
html[data-tapd-theme="dark"] svg [fill="#1a73e8"]:hover,
html[data-tapd-theme="dark"] svg [fill="#1a73e8"]:focus,
html[data-tapd-theme="dark"] svg [fill="#1a73e8"]:active,
html[data-tapd-theme="dark"] svg [fill="#1565c0"]:hover,
html[data-tapd-theme="dark"] svg [fill="#1565c0"]:focus,
html[data-tapd-theme="dark"] svg [fill="#1565c0"]:active,
html[data-tapd-theme="dark"] svg [fill="#1976d2"]:hover,
html[data-tapd-theme="dark"] svg [fill="#1976d2"]:focus,
html[data-tapd-theme="dark"] svg [fill="#1976d2"]:active,
html[data-tapd-theme="dark"] svg [fill="#2d7fc1"]:hover,
html[data-tapd-theme="dark"] svg [fill="#2d7fc1"]:focus,
html[data-tapd-theme="dark"] svg [fill="#2d7fc1"]:active,
html[data-tapd-theme="dark"] svg [fill="#003366"]:hover,
html[data-tapd-theme="dark"] svg [fill="#003366"]:focus,
html[data-tapd-theme="dark"] svg [fill="#003366"]:active,
html[data-tapd-theme="dark"] svg [fill="#003399"]:hover,
html[data-tapd-theme="dark"] svg [fill="#003399"]:focus,
html[data-tapd-theme="dark"] svg [fill="#003399"]:active,
html[data-tapd-theme="dark"] svg [fill="#2c3e50"]:hover,
html[data-tapd-theme="dark"] svg [fill="#2c3e50"]:focus,
html[data-tapd-theme="dark"] svg [fill="#2c3e50"]:active,
html[data-tapd-theme="dark"] svg [fill="#34495e"]:hover,
html[data-tapd-theme="dark"] svg [fill="#34495e"]:focus,
html[data-tapd-theme="dark"] svg [fill="#34495e"]:active,
html[data-tapd-theme="dark"] svg [stroke="#0052d9"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#0052d9"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#0052d9"]:active,
html[data-tapd-theme="dark"] svg [stroke="#1677ff"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#1677ff"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#1677ff"]:active,
html[data-tapd-theme="dark"] svg [stroke="#0066cc"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#0066cc"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#0066cc"]:active,
html[data-tapd-theme="dark"] svg [stroke="#1a73e8"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#1a73e8"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#1a73e8"]:active,
html[data-tapd-theme="dark"] svg [stroke="#1565c0"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#1565c0"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#1565c0"]:active,
html[data-tapd-theme="dark"] svg [stroke="#1976d2"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#1976d2"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#1976d2"]:active,
html[data-tapd-theme="dark"] svg [stroke="#2d7fc1"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#2d7fc1"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#2d7fc1"]:active,
html[data-tapd-theme="dark"] svg [stroke="#003366"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#003366"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#003366"]:active,
html[data-tapd-theme="dark"] svg [stroke="#003399"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#003399"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#003399"]:active,
html[data-tapd-theme="dark"] svg [stroke="#2c3e50"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#2c3e50"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#2c3e50"]:active,
html[data-tapd-theme="dark"] svg [stroke="#34495e"]:hover,
html[data-tapd-theme="dark"] svg [stroke="#34495e"]:focus,
html[data-tapd-theme="dark"] svg [stroke="#34495e"]:active {
  fill: var(--tapd-accent) !important;
  stroke: var(--tapd-accent) !important;
}
/* span[class*="tfl-icon"] is already covered by the main icon section above */

/* ═══════════ Print Mode ═══════════ */
@media print {
  html[data-tapd-theme] {
    transition: none !important;
  }
  html[data-tapd-theme="dark"],
  html[data-tapd-theme="dark"] body {
    background: #ffffff !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  html[data-tapd-theme="dark"] * {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #dddddd !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  html[data-tapd-theme="dark"] a { color: #1a0dab !important; }
  html[data-tapd-theme="dark"] img { filter: none !important; }
  html[data-tapd-theme="dark"] .avatar img { filter: none !important; }
  html[data-tapd-theme="dark"] .sidebar,
  html[data-tapd-theme="dark"] .left-menu,
  html[data-tapd-theme="dark"] .layout-menu { display: none !important; }
  html[data-tapd-theme="dark"] .top-bar,
  html[data-tapd-theme="dark"] .header { display: none !important; }
}
`;
};