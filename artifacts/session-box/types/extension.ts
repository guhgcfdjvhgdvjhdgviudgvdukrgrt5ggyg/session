export interface Extension {
  id: string;
  name: string;
  description: string;
  icon: string;
  script: string;
  enabled: boolean;
  builtIn: boolean;
  url?: string;
}

export const BUILT_IN_EXTENSIONS: Extension[] = [
  {
    id: "dark-reader",
    name: "Dark Reader",
    description: "Dark mode for every website. Protects your eyes at night.",
    icon: "moon",
    script: `(function() {
  if (document.documentElement.hasAttribute('data-dr-injected')) return;
  document.documentElement.setAttribute('data-dr-injected', 'true');
  var style = document.createElement('style');
  style.id = '__dark_reader_style';
  style.textContent = \`
    html, body { background-color: #1a1a2e !important; color: #e0e0e0 !important; }
    :root { --dark-bg: #1a1a2e; --dark-text: #e0e0e0; --dark-link: #7ec8e3; }
    *, *:before, *:after { color: var(--dark-text) !important; border-color: #333 !important; }
    a, a * { color: var(--dark-link) !important; }
    input, textarea, select, button { background-color: #2d2d44 !important; color: #e0e0e0 !important; border-color: #444 !important; }
    img, video, canvas { opacity: 0.85 !important; filter: brightness(0.9) !important; }
    [style*="background"] { background-color: var(--dark-bg) !important; }
  \`;
  document.head.appendChild(style);
})();`,
    enabled: false,
    builtIn: true,
  },
  {
    id: "no-ads",
    name: "Ad Blocker Lite",
    description: "Blocks common ad scripts and trackers.",
    icon: "eye-off",
    script: `(function() {
  if (document.documentElement.hasAttribute('data-ab-injected')) return;
  document.documentElement.setAttribute('data-ab-injected', 'true');
  var style = document.createElement('style');
  style.id = '__ad_block_style';
  style.textContent = \`
    [id*="ad"],[class*="ad"],[id*="sponsor"],[class*="sponsor"],
    [id*="promo"],[class*="promo"],[id*="banner"],[class*="banner"],
    [id*="popup"],[class*="popup"],[id*="overlay"],[class*="overlay"],
    ins.adsbygoogle, .advertisement, .ad-container, .ad-wrapper,
    [data-ad-*], [data-ad], [data-aaad], [data-adunit],
    iframe[src*="doubleclick"], iframe[src*="googlead"],
    iframe[src*="amazon-adsystem"] { display: none !important; }
  \`;
  document.head.appendChild(style);
  var observer = new MutationObserver(function(m) {
    m.forEach(function(r) {
      r.addedNodes.forEach(function(n) {
        if (n.nodeType === 1 && (n.id || '').match(/ad|sponsor|promo|banner|popup/i)) {
          n.style.display = 'none';
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();`,
    enabled: false,
    builtIn: true,
  },
  {
    id: "auto-scroll",
    name: "Auto Scroll",
    description: "Automatically scrolls long pages smoothly.",
    icon: "arrow-down",
    script: `(function() {
  if (document.documentElement.hasAttribute('data-as-injected')) return;
  document.documentElement.setAttribute('data-as-injected', 'true');
  var speed = prompt('Auto scroll speed (1-100):', '30');
  if (!speed || isNaN(speed)) return;
  speed = Math.max(1, Math.min(100, parseInt(speed)));
  var step = speed / 10;
  var interval = setInterval(function() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= max) { clearInterval(interval); return; }
    window.scrollBy(0, step);
  }, 50);
  window.__autoScrollInterval = interval;
})();`,
    enabled: false,
    builtIn: true,
  },
  {
    id: "font-boost",
    name: "Font Booster",
    description: "Increases font size for better readability.",
    icon: "type",
    script: `(function() {
  if (document.documentElement.hasAttribute('data-fb-injected')) return;
  document.documentElement.setAttribute('data-fb-injected', 'true');
  var style = document.createElement('style');
  style.textContent = 'body, p, div, span, li, a { font-size: 16px !important; line-height: 1.6 !important; } h1 { font-size: 24px !important; } h2 { font-size: 20px !important; } h3 { font-size: 18px !important; }';
  document.head.appendChild(style);
})();`,
    enabled: false,
    builtIn: true,
  },
  {
    id: "image-block",
    name: "Image Saver",
    description: "Blocks all images to save bandwidth.",
    icon: "image",
    script: `(function() {
  if (document.documentElement.hasAttribute('data-ib-injected')) return;
  document.documentElement.setAttribute('data-ib-injected', 'true');
  var style = document.createElement('style');
  style.textContent = 'img, picture, svg, canvas, video, iframe { display: none !important; }';
  document.head.appendChild(style);
  var observer = new MutationObserver(function(m) {
    m.forEach(function(r) {
      r.addedNodes.forEach(function(n) {
        if (n.nodeType === 1 && (n.tagName === 'IMG' || n.tagName === 'PICTURE' || n.tagName === 'VIDEO' || n.tagName === 'IFRAME')) {
          n.style.display = 'none';
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();`,
    enabled: false,
    builtIn: true,
  },
];
