/* =====================================================================
   Portfolio — Ben Mercuri
   Vanilla JS port of the React prototype.
   All interactivity preserved: theme switcher, hero playground,
   work tabs/expanders, marquee data, footer date.
   ===================================================================== */

(function () {
  'use strict';

  // ====================================================================
  // THEMES
  // ====================================================================
  const THEMES = {
    void: {
      label: 'VOID',
      '--bg': '#0b0c0d', '--bg-elev': '#121315', '--bg-card': '#16181b',
      '--line': '#23262b', '--line-soft': '#1a1c1f',
      '--fg': '#f0eee6', '--fg-dim': '#a5a39a', '--fg-muted': '#6b6a64',
      '--accent': '#d2ff4a', '--accent-ink': '#0b0c0d'
    },
    ink: {
      label: 'INK',
      '--bg': '#0a0a0a', '--bg-elev': '#121212', '--bg-card': '#171717',
      '--line': '#262626', '--line-soft': '#1c1c1c',
      '--fg': '#f5f5f5', '--fg-dim': '#a3a3a3', '--fg-muted': '#6b6b6b',
      '--accent': '#ffffff', '--accent-ink': '#000000'
    },
    cobalt: {
      label: 'COBALT',
      '--bg': '#06070d', '--bg-elev': '#0c0f1a', '--bg-card': '#121626',
      '--line': '#1d2238', '--line-soft': '#13172a',
      '--fg': '#eaecf5', '--fg-dim': '#9aa3c0', '--fg-muted': '#5d6584',
      '--accent': '#7cc4ff', '--accent-ink': '#06070d'
    },
    ember: {
      label: 'EMBER',
      '--bg': '#0e0a08', '--bg-elev': '#16100c', '--bg-card': '#1d150f',
      '--line': '#2e2218', '--line-soft': '#221912',
      '--fg': '#f3ece2', '--fg-dim': '#b0a293', '--fg-muted': '#75695b',
      '--accent': '#ff9e7c', '--accent-ink': '#0e0a08'
    }
  };

  let currentTheme = 'void';

  function applyTheme(name) {
    const t = THEMES[name] || THEMES.void;
    const root = document.documentElement;
    Object.entries(t).forEach(([k, v]) => {
      if (k.startsWith('--')) root.style.setProperty(k, v);
    });
    currentTheme = name;
    // Update playground swatch + demo button so accent changes flow through
    const accent = t['--accent'];
    if (playgroundState) {
      playgroundState.color = accent;
      renderPlaygroundPreview();
      renderPlaygroundCode();
    }
  }

  function initTweaks() {
    const panel = document.getElementById('tweaks-panel');
    const toggleBtn = document.getElementById('tweaks-toggle');
    const closeBtn = document.getElementById('twk-close');
    const grid = document.getElementById('theme-grid');

    // Build theme cards
    Object.entries(THEMES).forEach(([key, t]) => {
      const btn = document.createElement('button');
      btn.className = 'theme-btn' + (key === currentTheme ? ' on' : '');
      btn.dataset.theme = key;
      btn.innerHTML = `
        <div class="chips">
          <span class="chip" style="background:${t['--bg']}"></span>
          <span class="chip" style="background:${t['--bg-elev']}"></span>
          <span class="chip" style="background:${t['--fg']}"></span>
          <span class="chip" style="background:${t['--accent']}"></span>
        </div>
        <span class="label">${t.label}</span>
      `;
      btn.addEventListener('click', () => {
        applyTheme(key);
        grid.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
      });
      grid.appendChild(btn);
    });

    toggleBtn.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
    });
    closeBtn.addEventListener('click', () => { panel.hidden = true; });
  }

  // ====================================================================
  // HERO PLAYGROUND
  // ====================================================================
  const SWATCHES = ['#d2ff4a', '#ff9e7c', '#7cc4ff', '#c79dff', '#f5f5f5'];

  const playgroundState = {
    tab: 'preview',
    color: THEMES.void['--accent'],
    size: 14,
    glow: true,
    count: 0
  };

  function initPlayground() {
    // Tabs
    const tabsRoot = document.getElementById('pg-tabs');
    tabsRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-pg-tab]');
      if (!btn) return;
      const tab = btn.dataset.pgTab;
      playgroundState.tab = tab;
      tabsRoot.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      document.querySelectorAll('[data-pg-panel]').forEach(p => {
        p.style.display = p.dataset.pgPanel === tab ? '' : 'none';
      });
    });

    // Swatches
    const sw = document.getElementById('swatches');
    SWATCHES.forEach(hex => {
      const b = document.createElement('button');
      b.className = 'swatch' + (hex === playgroundState.color ? ' on' : '');
      b.style.background = hex;
      b.setAttribute('aria-label', 'color ' + hex);
      b.dataset.swatch = hex;
      b.addEventListener('click', () => {
        playgroundState.color = hex;
        sw.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s.dataset.swatch === hex));
        renderPlaygroundPreview();
        renderPlaygroundCode();
      });
      sw.appendChild(b);
    });

    // Size slider
    const sizeSlider = document.getElementById('size-slider');
    sizeSlider.addEventListener('input', (e) => {
      playgroundState.size = Number(e.target.value);
      document.getElementById('size-val').textContent = playgroundState.size + 'px';
      renderPlaygroundPreview();
      renderPlaygroundCode();
    });

    // Glow toggle
    const glowToggle = document.getElementById('glow-toggle');
    glowToggle.addEventListener('click', () => {
      playgroundState.glow = !playgroundState.glow;
      glowToggle.classList.toggle('on', playgroundState.glow);
      glowToggle.setAttribute('aria-checked', String(playgroundState.glow));
      document.getElementById('glow-val').textContent = playgroundState.glow ? 'true' : 'false';
      renderPlaygroundPreview();
      renderPlaygroundCode();
    });

    // Demo button — click counter
    const demoBtn = document.getElementById('demo-btn');
    demoBtn.addEventListener('click', () => {
      playgroundState.count += 1;
      document.getElementById('demo-count').textContent = playgroundState.count;
      updateCodeStrip();
    });

    renderPlaygroundPreview();
    renderPlaygroundCode();
    updateCodeStrip();
  }

  function renderPlaygroundPreview() {
    const btn = document.getElementById('demo-btn');
    if (!btn) return;
    btn.style.background = playgroundState.color;
    btn.style.borderColor = playgroundState.color;
    btn.style.fontSize = playgroundState.size + 'px';
    btn.style.boxShadow = playgroundState.glow
      ? `0 0 24px -4px ${playgroundState.color}`
      : 'none';
    // Sync swatch selection visual (when color comes from theme change)
    document.querySelectorAll('.swatch').forEach(s => {
      s.classList.toggle('on', s.dataset.swatch === playgroundState.color);
    });
  }

  function renderPlaygroundCode() {
    const pre = document.getElementById('pg-code-pre');
    if (!pre) return;
    pre.innerHTML =
      '&lt;Button\n' +
      '  <span class="at">color</span>=<span class="st">"' + playgroundState.color + '"</span>\n' +
      '  <span class="at">size</span>={' + playgroundState.size + '}\n' +
      '  <span class="at">glow</span>={' + playgroundState.glow + '}\n' +
      '  <span class="at">onClick</span>={() =&gt; ship()}\n' +
      '&gt;\n' +
      '  Ship it\n' +
      '&lt;/Button&gt;';
  }

  function updateCodeStrip() {
    const el = document.getElementById('pg-code-strip');
    if (!el) return;
    const c = playgroundState.count;
    const touch = Math.round(playgroundState.size * 1.2);
    el.textContent = `// rendered live · ${c} click${c !== 1 ? 's' : ''} · ${touch}px touch target`;
  }

  // ====================================================================
  // WORK DATA + RENDER
  // ====================================================================
  const WORK = {
    leadership: [
      {
        id: 'agora', idx: '01', title: 'Built the design org at Agora',
        role: 'Head of Design', meta: '2022 — 2024',
        narrative: {
          head: 'From one designer to a team of seven, shipping fintech at scale.',
          body: [
            'Inherited a single-designer team. Defined the hiring rubric, recruited 6 designers across product and brand, and stood up the rituals — weekly crits, monthly portfolio reviews, quarterly research debriefs — that kept us shipping quality work as we tripled in headcount.',
            'Partnered with the CPO and VP Engineering to rebuild the planning loop. Designers now sit in roadmap conversations from day one rather than receiving tickets.'
          ],
          kvs: [
            ['Team grown', '1 → 7'],
            ['Designers hired', '6'],
            ['Retention', '100% over 24mo'],
            ['DS adoption', '92% coverage']
          ]
        },
        screens: [
          { src: 'assets/AgoraImage.webp', label: 'agora Dealer app' },
        ],
        tags: ['Hiring', 'Process', 'Design Ops']
      },
      {
        id: 'craftsy', idx: '02', title: 'Cross-functional product trio at Craftsy',
        role: 'Lead UX', meta: '2019 — 2022',
        narrative: {
          head: 'Pairing PM, Eng and Design so tightly the seams disappeared.',
          body: [
            'Replaced linear handoff with a weekly trio sync — PM brings the problem, design brings the prototype, eng brings constraints. We cut spec-to-ship time by 40% and ended the era of "that\'s not what I asked for".',
            'Coached three junior designers into senior roles. Two now lead their own pods.'
          ],
          kvs: [
            ['Spec → ship', '−40%'],
            ['Direct reports', '5'],
            ['Promotions', '3 jr → sr'],
            ['NPS lift', '+18']
          ]
        },
        screens: [
          { src: 'assets/AgoraImage.webp', label: 'agora Dealer app' },
        ],
        tags: ['PM/Eng partnership', 'Mentorship', 'Process']
      }
    ],
    product: [
      {
        id: 'myhealth', idx: '03', title: 'MyHealth by Caris — patient portal',
        role: 'Design Director', meta: '2026 — Built with Claude',
        narrative: {
          head: 'A secure portal for genetic screening patients to track samples end-to-end.',
          body: [
            'Designed and prototyped the full sign-in, order-tracking and results experience. HIPAA-aware patterns, calm typography, and a status timeline that reads at a glance for patients managing high-stakes results.'
          ],
          kvs: [
            ['Screens', '14'],
            ['Prototype', 'Hi-fi · interactive'],
            ['Stack', 'React · Tailwind'],
            ['Tool', 'Claude (this project)']
          ]
        },
        screens: [
          { src: 'assets/myhealth-orders.png', label: 'ORDER STATUS · /orders' },
          { src: 'assets/myhealth-signin.png', label: 'SIGN IN · /auth/sign-in' }
        ],
        tags: ['Healthcare', 'Portal', 'Hi-fi prototype']
      },
      {
        id: 'burke', idx: '04', title: 'Burke PlayPortal — Rep Reporting',
        role: 'Design Engineer', meta: '2026 — Built with Figma',
        narrative: {
          head: 'Rep Reporting for Burke Firms',
          body: [
            'Redesign of an aniquated reporting sweet, to help Rep Firms understand how their buisness is doing throughout the year.'
          ],
          kvs: [
            ['Personas', 'Admin · Rep · Firm'],
            ['Views', 'Desktop · Mobile'],
            ['Reports', '17'],
            ['Tool', 'Figma (this project)']
          ]
        },
        screens: [
          { src: 'assets/repreporting.png', label: 'REO REPORTING · Overview' },
          { src: 'assets/repreporting2.png', label: 'REO REPORTING  · Market Share' }
        ],
        tags: ['Reporting', 'Rep', 'B2B']
      }
    ],
    marketing: [
      {
        id: 'lectric', idx: '05', title: 'Lectric eBikes — DTC funnel rework',
        role: 'Sr. Marketing Designer', meta: '2021',
        narrative: {
          head: 'Redesigned the configurator + checkout for a $500M DTC brand.',
          body: [
            'Owned the visual system for the configurator, accessory upsell, and email lifecycle. Worked side-by-side with growth and CRO to test 11 hero variants in a single quarter.'
          ],
          kvs: [
            ['Conversion', '+22%'],
            ['AOV', '+$78'],
            ['Hero tests', '11 / quarter'],
            ['Email CTR', '+34%']
          ]
        },
        tags: ['Ecommerce', 'CRO', 'Brand']
      },
      {
        id: 'crocs', idx: '06', title: 'Crocs — global campaign systems',
        role: 'Marketing Designer', meta: '2014 — 2018',
        narrative: {
          head: 'Built the toolkits that let regional teams ship on-brand at speed.',
          body: [
            'Designed campaign systems — type, color, photography rules, layout templates — for seasonal launches across NA, EMEA and APAC. Reduced creative-team turnaround from 3 weeks to 4 days.'
          ],
          kvs: [
            ['Regions served', '3 (NA/EMEA/APAC)'],
            ['Turnaround', '3w → 4d'],
            ['Templates shipped', '60+'],
            ['Brand audits passed', '100%']
          ]
        },
        tags: ['Brand systems', 'Campaigns', 'Global']
      }
    ],
    code: [
      {
        id: 'ds-tokens', idx: '07', title: 'Design tokens shipped to production',
        role: 'Design Engineer', meta: '2024 — Ongoing',
        narrative: {
          head: 'I write the components I design. Tokens, primitives, and the glue.',
          body: [
            'Built and maintained the token pipeline that bridges Figma → Tailwind → React. Wrote the primitive components — Button, Field, Stack, Sheet — that the rest of the team builds on.'
          ],
          kvs: [
            ['Languages', 'TS · JSX · CSS'],
            ['Tooling', 'Tailwind · Tokens Studio'],
            ['Components', '32 primitives'],
            ['PRs shipped', '240+']
          ]
        },
        code: {
          file: 'tokens/Button.tsx',
          lines: [
            { ln: '01', text: 'import { cva } from "class-variance-authority"' },
            { ln: '02', text: '' },
            { ln: '03', text: 'export const button = cva(' },
            { ln: '04', text: '  "inline-flex items-center gap-2 rounded-md font-medium",' },
            { ln: '05', text: '  {' },
            { ln: '06', text: '    variants: {' },
            { ln: '07', text: '      intent: {' },
            { ln: '08', text: '        primary: "bg-accent text-ink shadow-glow",' },
            { ln: '09', text: '        ghost:   "border border-line text-fg",' },
            { ln: '10', text: '      },' },
            { ln: '11', text: '      size: { sm: "h-8 px-3", md: "h-10 px-4" },' },
            { ln: '12', text: '    },' },
            { ln: '13', text: '  }' },
            { ln: '14', text: ')' }
          ]
        },
        tags: ['TypeScript', 'Tokens', 'DS']
      },
      {
        id: 'ai-loop', idx: '08', title: 'Prototyping loop with Claude',
        role: 'Design Engineer', meta: '2025',
        narrative: {
          head: 'Designs that ship as working prototypes the same day.',
          body: [
            'Replaced static Figma decks with hi-fi React prototypes built alongside Claude. Stakeholders click through the real thing — including the edge cases — before a single eng cycle is spent.'
          ],
          kvs: [
            ['Time to clickable', 'Same day'],
            ['Stack', 'React · CSS'],
            ['Format', 'Live HTML'],
            ['Output', 'PR-ready handoff']
          ]
        },
        code: {
          file: 'prototypes/portal.jsx',
          lines: [
            { ln: '01', text: '// AI-paired design engineering loop', cls: 'cm' },
            { ln: '02', text: 'function Portal() {' },
            { ln: '03', text: '  const [view, setView] = useState("orders")' },
            { ln: '04', text: '  return (' },
            { ln: '05', text: '    <Shell brand="MyHealth">' },
            { ln: '06', text: '      <Tabs value={view} onChange={setView}>' },
            { ln: '07', text: '        <Orders />' },
            { ln: '08', text: '        <Results />' },
            { ln: '09', text: '      </Tabs>' },
            { ln: '10', text: '    </Shell>' },
            { ln: '11', text: '  )' },
            { ln: '12', text: '}' }
          ]
        },
        tags: ['AI-paired', 'Prototypes', 'React']
      }
    ]
  };

  const TABS = [
    { key: 'leadership', label: 'Leadership' },
    { key: 'product',    label: 'Product' },
    { key: 'marketing',  label: 'Marketing' },
    { key: 'code',       label: 'Built with code' }
  ];

  const workState = { tab: 'leadership', open: null };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Lightweight syntax color, ported from work.jsx's colorize()
  function colorize(text) {
    if (!text) return '';
    const patterns = [
      { re: /^\/\/[^\n]*/,                                              cls: 'cm' },
      { re: /^"[^"]*"/,                                                 cls: 'st' },
      { re: /^(import|export|const|function|return|from|useState)\b/,   cls: 'kw' },
      { re: /^[A-Z][A-Za-z0-9]*/,                                       cls: 'fn' },
      { re: /^[a-z][A-Za-z0-9]*(?=\()/,                                 cls: 'fn' },
      { re: /^[a-z][A-Za-z0-9]*(?==)/,                                  cls: 'at' }
    ];
    let rest = text;
    let out = '';
    while (rest.length) {
      let matched = false;
      for (const p of patterns) {
        const m = rest.match(p.re);
        if (m) {
          out += `<span class="${p.cls}">${esc(m[0])}</span>`;
          rest = rest.slice(m[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        out += esc(rest[0]);
        rest = rest.slice(1);
      }
    }
    return out;
  }

  function renderDetail(item) {
    const screensHTML = (() => {
      if (item.screens) {
        return item.screens.map(s => `
          <div class="frame">
            <span class="label">${esc(s.label)}</span>
            <img src="${esc(s.src)}" alt="${esc(s.label)}" onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';" />
          </div>
        `).join('');
      }
      if (item.code) {
        const lines = item.code.lines.map(l => {
          if (l.cls === 'cm') {
            return `<div class="code-line"><span class="ln">${esc(l.ln)}</span><span class="cm">${esc(l.text)}</span></div>`;
          }
          return `<div class="code-line"><span class="ln">${esc(l.ln)}</span><span>${colorize(l.text)}</span></div>`;
        }).join('');
        return `
          <div class="code-panel">
            <div class="code-head">
              <span>${esc(item.code.file)}</span>
              <span>TypeScript</span>
            </div>
            ${lines}
          </div>
        `;
      }
      return `<div class="frame placeholder"><div class="tiny muted">${esc(item.title)} · screens coming soon</div></div>`;
    })();

    const kvsHTML = item.narrative.kvs.map(([k, v]) =>
      `<div><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`
    ).join('');

    const tagsHTML = item.tags.map(t =>
      `<span class="link">#${esc(t.toLowerCase().replace(/[ \/]/g, '-'))}</span>`
    ).join('');

    const bodyHTML = item.narrative.body.map(p => `<p>${esc(p)}</p>`).join('');

    return `
      <div class="work-detail">
        <div></div>
        <div class="work-detail-inner">
          <div class="work-screens">${screensHTML}</div>
          <div class="work-narrative">
            <h4>${esc(item.narrative.head)}</h4>
            ${bodyHTML}
            <div class="kvs">${kvsHTML}</div>
            <div class="links">${tagsHTML}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWork() {
    const mount = document.getElementById('work-mount');
    const items = WORK[workState.tab];

    const tabsHTML = `
      <div class="work-tabs" role="tablist">
        ${TABS.map(t => `
          <button class="${workState.tab === t.key ? 'on' : ''}" data-tab="${t.key}" role="tab" aria-selected="${workState.tab === t.key}">
            ${esc(t.label)}<span class="count">[${WORK[t.key].length}]</span>
          </button>
        `).join('')}
      </div>
    `;

    const listHTML = `
      <div class="work-list">
        ${items.map(item => {
          const isOpen = workState.open === item.id;
          return `
            <div class="work-item${isOpen ? ' open' : ''}" data-id="${item.id}">
              <div class="work-row" data-row="${item.id}" role="button" tabindex="0">
                <div class="idx">${esc(item.idx)}</div>
                <div class="title">${esc(item.title)}</div>
                <div class="role">${esc(item.role)}</div>
                <div class="meta">${esc(item.meta)}</div>
                <div class="toggle-pill">${isOpen ? 'Close ×' : 'Open →'}</div>
              </div>
              ${isOpen ? renderDetail(item) : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    mount.innerHTML = tabsHTML + listHTML;

    // Tab clicks
    mount.querySelectorAll('.work-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        workState.tab = btn.dataset.tab;
        workState.open = null;
        renderWork();
      });
    });

    // Row clicks
    mount.querySelectorAll('.work-row').forEach(row => {
      const id = row.dataset.row;
      const toggle = () => {
        workState.open = workState.open === id ? null : id;
        renderWork();
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  // ====================================================================
  // BRANDS MARQUEE
  // ====================================================================
  function initMarquee() {
    const list = ['Crocs', 'Under Armour', 'Agora', 'Craftsy', 'Lectric eBikes', 'Regis Corp', 'Caris', 'Burke', 'Tag Heuer'];
    const seq = [...list, ...list]; // double for seamless loop
    const mq = document.getElementById('marquee');
    mq.innerHTML = seq.map(b =>
      `<span class="brand">${esc(b)}</span><span class="sep">✦</span>`
    ).join('');
  }

  // ====================================================================
  // FOOTER DATE
  // ====================================================================
  function initFooterDate() {
    const el = document.getElementById('footer-date');
    if (el) {
      el.textContent = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }

  // ====================================================================
  // BOOT
  // ====================================================================
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme('void');
    initTweaks();
    initPlayground();
    renderWork();
    initMarquee();
    initFooterDate();
  });
})();
