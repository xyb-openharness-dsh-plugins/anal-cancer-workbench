'use strict';
/* 小萌宝 AnalPal v0.1.0 — 肛管癌工作台交互原型。
   患者资料全部为模拟（demo-data.js）；临床试验为 ClinicalTrials.gov 登记摘录（trials-data.js，状态未核实）。
   不读写真实文件、不调用模型或宿主 API。
   视觉沿用小 X 宝家族原型骨架，品牌令牌换为橙 #EE7B1E / 暖黄 #FFC220。
   本癌种的结构差异（详见 docs/DIFF-MATRIX.md）：
   1. 一级页 12 个，其中「肛周皮肤」独立成页——放化疗期最影响生活的毒性，不并入通用"副作用"；
   2. 「肠道与排粪」用排便日记 + Wexner 控便评分，不用通用的"腹泻"页；
   3. 「造口与生活」把造口护理、亲密关系、工作社交放在一页，不拆成三个空入口；
   4. 一图秀默认体重 + 白蛋白两条数值线 + 肛周皮肤 RTOG 分级（分类序列只画节点不连线）。 */

const APP_INFO = { version: '0.1.0', build: '2026-10-21', channel: 'prototype' };
const D = window.DEMO_DATA;
const T = window.TRIALS_DATA;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const state = {
  view: 'dashboard', sub: null, profile: 0, large: false,
  agent: false, agentSize: 'std', flipped: new Set(), savedTrials: new Set(),
  metricPick: null, trialFilter: 'all'
};

/* ---------------- icons ---------------- */
const icons = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  badge: 'M12 3l7 4v10l-7 4-7-4V7ZM9 12l2 2 4-4',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  drip: 'M12 3v6m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM7 7h10',
  alert: 'M12 4 3 20h18L12 4Zm0 5v6m0 3v.5',
  bowel: 'M6 4v6a6 6 0 0 0 12 0V4M9 4v6a3 3 0 0 0 6 0V4M4 20h16',
  skin: 'M12 3c4.5 3 7 6.4 7 10a7 7 0 0 1-14 0c0-3.6 2.5-7 7-10Zm-2 8h4m-4 3h4',
  lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7 15h10',
  chart: 'M4 3v17h17M7 14l4-5 4 3 5-7',
  ostomy: 'M12 3a5 5 0 0 1 5 5v3H7V8a5 5 0 0 1 5-5ZM7 14h10v3a5 5 0 0 1-10 0v-3Zm3-1h4',
  calendar: 'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2',
  flask: 'M9 3h6v5l5 9a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l5-9Z',
  chat: 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-6 5V5ZM8 8h8M8 11h5'
};
const ICON_ALIAS = { dashboard: 'home', records: 'folder', profile: 'badge', treatment: 'drip', toxicity: 'alert', bowel: 'bowel', skin: 'skin', labs: 'lab', timeline: 'chart', life: 'ostomy', followup: 'calendar', trials: 'flask' };
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[k] || icons[ICON_ALIAS[k]] || icons.badge}"/></svg>`;

const PAGES = [
  ['dashboard', '看板', 0], ['records', '病情整理', 2], ['profile', '我的分型', 0],
  ['treatment', '治疗历程', 0], ['toxicity', '副作用与症状', 4], ['bowel', '肠道与排粪', 0],
  ['skin', '肛周皮肤', 0], ['labs', '检查与指标', 0], ['timeline', '病情一图秀', 0],
  ['life', '造口与生活', 3], ['followup', '复查与随访', 0], ['trials', '临床研究', 0]
];
const SUBPAGES = {
  records: ['资料库', '待核对候选', '病情档案', '指标与事件'],
  profile: ['病理与部位', '分期与淋巴结', 'HPV 与风险因素'],
  treatment: ['治疗路径', '放疗与化疗', '手术与造口', '疗效评估'],
  toxicity: ['症状清单', 'CTCAE 对照', '就医边界'],
  bowel: ['排便日记', '控便评分', '里急后重与便血'],
  skin: ['分级记录', '护理记录', '何时联系医生'],
  labs: ['血常规与生化', '肿瘤标志物', '影像与内镜'],
  timeline: ['数值曲线', '分类与事件', '数据口径'],
  life: ['造口日常', '亲密关系与生育', '工作与社交'],
  followup: ['复查节奏', '本次复查准备', '问题清单'],
  trials: ['2026 线索', '已收藏', '入组要问什么']
};
const SUBTITLES = {
  dashboard: '把皮肤、排便、体重和复查放在一起看；今天只需要记一条，也算数。',
  records: '原件永远保留；解析结果只是候选，你确认之后才进档案。',
  profile: '病理类型、部位、分期、HPV 是四个独立事实，分开保存，不互相替代。',
  treatment: '路径改过就新增一条，旧的那条留着——之后回看才知道当时为什么换。',
  toxicity: 'CTCAE 分级描述的是严重度，不是诊断；分级由你对照记录，判断交给医生。',
  bowel: '排便次数、急迫感、失禁次数分开记；一个"腹泻"盖不住这些差别。',
  skin: '肛周皮肤是这轮治疗最常见的困扰，按 RTOG 分级逐次记录，比"好一点"更能说明问题。',
  labs: '化验值只显示与你上次、与参考区间的对照，不生成结论。',
  timeline: '体重、白蛋白与皮肤分级放回同一段时间，看见变化发生在哪一步。',
  life: '造口、亲密关系、工作三件事都影响每天，分开说，不合并成"心理问题"。',
  followup: '复查节奏、本次要做的检查、要问的问题，一页带走。',
  trials: '按癌种与分期初筛登记信息；登记 ≠ 有效 ≠ 安全 ≠ 可入组。'
};
const VIEW_TITLES = Object.fromEntries(PAGES.map(([k, t]) => [k, t]));

/* ---------------- data helpers ---------------- */
const prof = () => D.profiles[state.profile];
const defs = () => new Map(D.metrics.map(m => [m.key, m]));
const seriesOf = (p, key) => (p.metrics.find(m => m.key === key) || { points: [] }).points;
const defOf = (key) => defs().get(key) || { key, label: key, kind: 'numeric', unit: '' };
const fmtNum = (v, digits = 1) => (v == null || Number.isNaN(v) ? '—' : (Math.round(v * 10 ** digits) / 10 ** digits).toFixed(digits).replace(/\.0$/, ''));
const dayMs = 86400000;
const parseDay = (s) => new Date(s + 'T00:00:00+08:00');
const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / dayMs);
const shortDate = (s) => s ? `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}` : '—';
const cnDate = (s) => s ? `${s.slice(0, 4)}-${s.slice(5, 7)}-${s.slice(8, 10)}` : '—';
const latest = (points) => points.length ? points[points.length - 1] : null;
const first = (points) => points.length ? points[0] : null;
const trendText = (points, unit = '') => {
  if (points.length < 2) return '只有 1 次记录';
  const a = points[0].value, b = points[points.length - 1].value;
  const d = b - a;
  const sign = d > 0 ? '+' : '';
  return `${sign}${fmtNum(d)} ${unit} / 近 ${Math.max(1, Math.round(daysBetween(points[0].date, points[points.length - 1].date) / 30))} 个月`;
};

function gradeTone(t) { return { ok: 'green', watch: 'yellow', warn: 'orange', danger: 'red' }[t] || 'grey'; }
function chartTone(t) { return { ok: 'var(--ok)', watch: 'var(--amber)', warn: 'var(--orange)', danger: 'var(--danger)' }[t] || 'var(--muted)'; }
function statusPill(v) {
  const map = { '已确认': 'green', '待核对': 'yellow', '已入库': 'green', '解析失败': 'red' };
  return `<span class="pill ${map[v] || 'grey'}">${esc(v)}</span>`;
}

/* ---------------- spine ---------------- */
function navMarkup() {
  const p = prof();
  return PAGES.map(([key, label]) => {
    const n = countFor(key, p);
    return `<button class="nav-button" data-view="${key}" aria-current="${state.view === key ? 'page' : 'false'}">${icon(key)}<span>${label}</span>${n ? `<span class="nav-count">${n}</span>` : ''}</button>`;
  }).join('');
}
function countFor(key, p) {
  if (key === 'records') return p.candidates.filter(c => c.status === 'pending').length;
  if (key === 'toxicity') return p.symptoms.length;
  if (key === 'followup') return p.followups.filter(f => !f.done).length;
  return 0;
}

function subnavMarkup() {
  const subs = SUBPAGES[state.view];
  if (!subs) return '';
  return `<div class="subnav" role="tablist" aria-label="${VIEW_TITLES[state.view]}二级页签">${subs.map((s, i) => `<button role="tab" data-sub="${i}" aria-selected="${(state.sub ?? 0) === i}">${esc(s)}</button>`).join('')}</div>`;
}

function render() {
  const p = prof();
  const sub = state.sub ?? 0;
  $('#nav').innerHTML = navMarkup();
  $('#profile-avatar').textContent = p.avatar;
  $('#profile-name').textContent = `${p.name}的资料`;
  $('#profile-meta').textContent = p.meta;
  $('#breadcrumb').textContent = VIEW_TITLES[state.view];
  $('#ver-chip').textContent = 'v' + APP_INFO.version;
  $('#app-version').textContent = 'v' + APP_INFO.version;
  $('#app-build').textContent = APP_INFO.build;
  $('#main').innerHTML = `<div class="page-enter">${pageHead()}<div class="page-body">${views[state.view](p, sub)}</div>${footerNote()}</div>`;
  document.body.classList.toggle('large', state.large);
  $('#font-toggle').setAttribute('aria-pressed', String(state.large));
  const dock = $('#agent-dock');
  dock.hidden = !state.agent;
  $('#work-grid').classList.toggle('agent-open', state.agent);
  $('#work-grid').classList.toggle('agent-wide', state.agentSize === 'wide');
  $('#agent-toggle').setAttribute('aria-expanded', String(state.agent));
  $('#agent-state').textContent = state.agent ? '已打开' : '未进入激活';
  $$('#agent-toggle i')[0]?.classList.toggle('grey', !state.agent);
  renderAgent();
  attachChartHover();
}

function pageHead() {
  const p = prof();
  const actions = {
    dashboard: `<button class="primary" data-action="quick-add">记录今天</button><button data-action="go" data-target="timeline">看一图秀</button>`,
    records: `<button data-action="upload-sim">模拟导入一份资料</button>`,
    toxicity: `<button class="primary" data-action="add-symptom">记录一个症状</button>`,
    bowel: `<button class="primary" data-action="add-bowel">记今天的排便</button>`,
    skin: `<button class="primary" data-action="add-skin">记今天的皮肤</button>`,
    followup: `<button class="primary" data-action="print-visit">生成复诊摘要</button>`,
    trials: `<button data-action="trial-source">数据来源与覆盖</button>`,
    life: `<button data-action="viewpoint">记一条我的担心</button>`
  }[state.view] || '';
  return `<div class="page-head"><div><span class="eyebrow">${esc(p.name)} · ${esc(p.stageLine)}</span><h1>${VIEW_TITLES[state.view]}</h1><p>${SUBTITLES[state.view]}</p></div><div class="actions">${actions}</div></div>${subnavMarkup()}`;
}
function footerNote() {
  return `<p class="page-foot-note">小萌宝只帮你整理信息与准备沟通，不做诊断，也不替医生决定治疗。所有分级与提示都需要与医生核对。</p>`;
}

/* ---------------- shared blocks ---------------- */
function notice(tone, title, body) {
  return `<div class="notice ${tone}"><b>${esc(title)}</b>${body ? `<br>${body}` : ''}</div>`;
}
function emptyState(title, body, action) {
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(body)}</p>${action || ''}</div>`;
}
function metricCard(p, key) {
  const d = defOf(key);
  const pts = seriesOf(p, key);
  if (!pts.length) return '';
  const last = latest(pts);
  const prev = pts.length > 1 ? pts[pts.length - 2] : null;
  const cat = d.kind === 'categorical';
  const scale = cat ? (D.scales[d.scale] || []) : [];
  const row = cat ? scale.find(s => s.ordinal === last.value) : null;
  const valueText = cat ? (row ? `${last.value} 级` : '—') : fmtNum(last.value);
  const unitText = cat ? '' : d.unit;
  const delta = cat
    ? (prev ? `上次：${(scale.find(s => s.ordinal === prev.value) || {}).short ?? '—'}` : '只有 1 次记录')
    : `${prev ? (last.value - prev.value >= 0 ? '+' : '') + fmtNum(last.value - prev.value) : '—'} ${d.unit} · 较上次`;
  const flipped = state.flipped.has(key);
  const canFlip = !cat;
  return `<button class="mcard" data-static="${canFlip ? 0 : 1}" data-flip="${key}" role="group" tabindex="0" data-flipped="${flipped}" aria-pressed="${flipped}" aria-label="${esc(d.label)} 最近 ${esc(valueText)} ${esc(unitText)}${canFlip ? '，按回车查看迷你折线' : ''}">
    <span class="mcard-inner">
      <span class="mface front">
        <span class="cat"><i style="background:${d.color}"></i>${esc(d.group || '')}</span>
        <span class="name">${esc(d.label)}</span>
        <span class="val">${esc(valueText)}<small>${esc(unitText)}</small></span>
        <span class="delta">${esc(delta)}</span>
        <span class="rec">${cnDate(last.date)}${last.note ? ' · ' + esc(last.note) : ''}</span>
        <span class="meta"><span class="hint">${canFlip ? '点击翻转看折线' : '分类记录不翻卡'}</span><span>${pts.length} 次</span></span>
      </span>
      <span class="mface back" aria-hidden="${!flipped}">
        <span class="name">${esc(d.label)} · 迷你折线</span>
        <span class="count">${pts.length} 次记录 · ${cnDate(pts[0].date)} 至 ${cnDate(last.date)}</span>
        ${sparkline(pts, d.color)}
        <span class="foot">纵轴按本指标自身范围缩放，不与其它指标比较</span>
      </span>
    </span>
  </button>`;
}
function sparkline(pts, color) {
  if (pts.length < 2) return `<div class="na">这一次记录不连线。<br>下次记录后才会出现折线。</div>`;
  const w = 190, h = 58, pad = 6;
  const vals = pts.map(p => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const coords = pts.map((p, i) => ({ x: pad + i * (w - pad * 2) / (pts.length - 1), y: h - pad - ((p.value - min) / span) * (h - pad * 2) }));
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><line class="base" x1="0" y1="${h - pad}" x2="${w}" y2="${h - pad}"/><path class="sp-line" d="${smoothPath(coords)}" stroke="${color}"/><circle class="sp-dot" cx="${coords.at(-1).x}" cy="${coords.at(-1).y}" r="3.5" fill="${color}"/></svg>`;
}

/* monotone cubic (Fritsch–Carlson)：不过冲，末点不会被插值甩出去 */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const dx = [], dy = [], m = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1].x - pts[i].x; dy[i] = pts[i + 1].y - pts[i].y; m[i] = dy[i] / (dx[i] || 1); }
  const t = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) t[i] = 0;
    else t[i] = (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  }
  t[n - 1] = m[n - 2];
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const x1 = pts[i].x + dx[i] / 3, y1 = pts[i].y + t[i] * dx[i] / 3;
    const x2 = pts[i + 1].x - dx[i] / 3, y2 = pts[i + 1].y - t[i + 1] * dx[i] / 3;
    d += ` C${x1.toFixed(2)},${y1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${pts[i + 1].x.toFixed(2)},${pts[i + 1].y.toFixed(2)}`;
  }
  return d;
}

/* ---------------- views ---------------- */
const views = {};

/* 1. 看板 */
views.dashboard = (p) => {
  const primaryCat = p.metrics.find(m => defOf(m.key).kind === 'categorical');
  const numeric = p.metrics.filter(m => defOf(m.key).kind === 'numeric').slice(0, 3);
  const cards = [...numeric, ...(primaryCat ? [primaryCat] : [])].map(m => metricCard(p, m.key)).join('');
  const next = p.followups.find(f => !f.done);
  const openQ = p.questions.filter(q => q.status === 'open');
  return `
  <section class="hero">
    <div>
      <span class="eyebrow">${cnDate(D.window.from)} — ${cnDate(D.window.to)}</span>
      <h1>${esc(p.headline)}</h1>
      <p>${esc(p.name)}，${esc(p.meta)}。下面是最近 6 个月里能被核对的部分；记录不全的地方就空着，不补。</p>
      <div class="actions"><button class="primary" data-action="quick-add">记一条今天的感受</button><button data-action="go" data-target="followup">准备下次复查</button></div>
    </div>
    <div class="hero-mascot"><img src="assets/brand/analpal-logo.jpg" alt="小萌宝" width="124" height="124"></div>
  </section>
  ${next ? `<div class="alert-strip"><div><b>下次复查：${cnDate(next.planned)}（${esc(next.type)}）</b><p>${next.imaging ? esc(next.imaging) + ' · ' : ''}还有 ${daysBetween(D.window.to, next.planned)} 天；已整理 ${openQ.length} 个问题。</p></div><div class="actions"><button data-action="go" data-target="followup">查看准备清单</button></div></div>` : ''}
  <div class="task-grid">
    ${[['toxicity', '记录今天的症状', '皮肤、疼痛、排便、疲乏，各记一条'], ['bowel', '记排便日记', '次数、急迫感、失禁分开记'], ['timeline', '看一图秀', '体重、白蛋白、皮肤分级放一起'], ['trials', '看临床研究线索', `${T.rows.length} 条摘录 · 数据截止 ${T.cutoff}`]].map(([k, t, s]) => `<button class="task-entry" data-action="go" data-target="${k}"><span class="entry-icon">${icon(k)}</span><b>${t}</b><span>${s}</span><span class="arrow">→</span></button>`).join('')}
  </div>
  <div class="dash-cols">
    <div>
      <div class="section-title"><div><h2>这几个数值得看一眼</h2><p>点击卡片翻转，背面是这段时间的迷你折线。</p></div></div>
      <div class="metric-grid">${cards}</div>
      <div class="section-title"><div><h2>最近发生了什么</h2><p>只列已确认的事件；草稿与候选不进来。</p></div></div>
      <div class="card">${p.events.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(e => `<div class="row"><div class="row-main"><span class="pill grey">${esc(typeLabel(e.type))}</span><div><b>${esc(e.title)}</b><p>${cnDate(e.date)}${e.detail ? ' · ' + esc(e.detail) : ''}</p></div></div></div>`).join('')}</div>
    </div>
    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>要带去的三个问题</h2><p>按你自己的优先级排，不是医嘱。</p></div></div>
        ${openQ.slice(0, 3).map(q => `<div class="row"><div class="row-main"><span class="pill ${q.priority === 1 ? 'orange' : 'grey'}">${q.priority === 1 ? '先问' : '再问'}</span><div><b>${esc(q.text)}</b><p>${esc(q.cat)}</p></div></div></div>`).join('') || emptyState('还没有问题', '想到什么就记下来，复查前再排序。')}
      </div>
      <div class="card accent">
        <div class="card-head"><div><h2>本轮最影响生活的事</h2><p>来自症状记录与排便日记，不是结论。</p></div></div>
        ${p.riskFlags.map(f => `<div class="flag-list"><div><span><b>${esc(f.title)}</b><br><span class="muted">${esc(f.detail)}</span></span></div></div>`).join('')}
      </div>
    </div>
  </div>`;
};
function typeLabel(t) {
  return { diagnosis: '确诊', imaging: '检查', radiotherapy: '放疗', chemo: '化疗', surgery: '手术', visit: '就诊', admission: '住院' }[t] || t;
}

/* 2. 病情整理 */
views.records = (p, sub) => {
  const docs = p.docs;
  if (sub === 1) {
    return `${notice('', '候选不是事实', '解析出来的字段先放在这里，你核对原文后逐条接受或拒绝；接受后才会写入指标或档案。')}
    ${p.candidates.length ? p.candidates.map((c, i) => `<div class="saved-item"><b>${esc(c.field)} · ${esc(c.value)}</b><p>来源：${esc((docs.find(d => d.id === c.doc) || {}).title || c.doc)} · 置信度 ${(c.confidence * 100).toFixed(0)}%（机器判断，不是准确性保证）</p><div class="actions" style="margin-top:8px"><button data-action="accept-cand" data-idx="${i}">核对无误，接受</button><button data-action="reject-cand" data-idx="${i}">拒绝这条</button><button class="text-button" data-action="open-doc" data-doc="${c.doc}">打开原件</button></div></div>`).join('') : emptyState('没有待核对的候选', '导入一份资料后，解析结果会出现在这里。')}`;
  }
  if (sub === 2) {
    const d = p.diagnosis;
    return `<div class="grid two">
      <div class="card"><div class="card-head"><div><h2>诊断</h2><p>一条版本；更正会新增，不覆盖。</p></div></div>
        <div class="row"><div class="row-main"><div><b>${esc(d.histology)}</b><p>${esc(d.site)} · ${esc(d.grade)}</p></div></div><span class="pill grey">v1</span></div>
        <div class="row"><div><b>确诊日期</b><p>${cnDate(d.date)}</p></div></div>
        <div class="row"><div><b>说明</b><p>${esc(d.note)}</p></div></div>
      </div>
      <div class="card"><div class="card-head"><div><h2>治疗线</h2><p>路径切换会新增一条，旧的保留。</p></div></div>
        <div class="row"><div><b>第 1 线 · ${esc(p.care.path)}</b><p>${cnDate(p.care.started)} — ${cnDate(p.care.ended)}</p></div><span class="pill ${p.care.intent === 'salvage' ? 'yellow' : 'green'}">${p.care.intent === 'salvage' ? '挽救' : '根治'}</span></div>
        <div class="row"><div><b>方案</b><p>${esc(p.care.regimen)}</p></div></div>
        ${p.care.surgery ? `<div class="row"><div><b>手术</b><p>${esc(p.care.surgery)}</p></div></div>` : ''}
      </div>
    </div>`;
  }
  if (sub === 3) {
    return `<div class="card"><div class="card-head"><div><h2>事件与指标</h2><p>事件来自已确认资料；指标见「检查与指标」。</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>日期</th><th>类型</th><th>事件</th><th>说明</th></tr></thead><tbody>
      ${p.events.map(e => `<tr><td class="num">${cnDate(e.date)}</td><td><span class="pill grey">${typeLabel(e.type)}</span></td><td><b>${esc(e.title)}</b></td><td>${esc(e.detail || '—')}</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }
  return `<div class="flow-steps"><span class="on">1 上传</span><span class="fs-arrow">→</span><span>2 解析</span><span class="fs-arrow">→</span><span>3 核对候选</span><span class="fs-arrow">→</span><span>4 入库</span></div>
  <div class="card"><div class="card-head"><div><h2>资料库 · ${docs.length} 份</h2><p>原件留在你选定的资料目录，工作台只记路径与摘要。</p></div><div class="actions"><button data-action="upload-sim">模拟导入</button></div></div>
    <div class="table-wrap"><table><thead><tr><th>资料</th><th>类型</th><th>日期</th><th>页数</th><th>状态</th><th></th></tr></thead><tbody>
    ${docs.map(d => `<tr><td><b>${esc(d.title)}</b></td><td>${esc(d.type)}</td><td class="num">${cnDate(d.date)}</td><td class="num">${d.pages}</td><td>${statusPill(d.status)}</td><td><button class="text-button" data-action="open-doc" data-doc="${d.id}">查看</button></td></tr>`).join('')}
    </tbody></table></div></div>
  <div class="grid two" style="margin-top:14px">
    <div class="card"><h2>目录约定</h2><p class="small-note">按「年份/月份_资料类型」存放，文件名保留医院原始标题；重命名只改前缀，不改原文件名主体。</p><div class="path-row"><code>~/资料/肛管癌/2026/09_复查/</code><button data-action="toast" data-msg="原型不读写磁盘">打开</button></div></div>
    <div class="card"><h2>原件与摘录的关系</h2><p class="small-note">同一份报告可以有多条候选，但只会有一条被接受；拒绝的理由不写进事实层。</p></div>
  </div>`;
};

/* 3. 我的分型 */
views.profile = (p, sub) => {
  const d = p.diagnosis;
  if (sub === 1) {
    return `<div class="subtype-hero"><div>
      <span class="code">AJCC 8th · 肛管</span><h2>${esc(d.stage)}</h2><span class="en">${esc(d.t)} · ${esc(d.n)} · ${esc(d.m)}</span>
      <div class="subtype-meta"><span class="pill orange">${esc(d.histology)}</span><span class="pill grey">${esc(d.site)}</span><span class="pill grey">${esc(d.grade)}</span></div>
      <p class="small-note">分期字段来自影像与病理原文；工作台不替你重新分期。</p>
    </div><div class="path-tree"><div class="on">T · 原发肿瘤 ${esc(d.t)}</div><div class="lv2 on">N · 区域淋巴结 ${esc(d.n)}</div><div class="lv3 on">M · 远处转移 ${esc(d.m)}</div><div class="lv2">腹股沟淋巴结：左右分开记，缺一侧不补 0</div></div></div>
    <div class="grid three">
      <div class="card"><h3>T 分期看什么</h3><p class="small-note">最大径 ≤2 cm / 2–5 cm / >5 cm，以及是否侵犯邻近器官。测量值来自影像报告，不由症状推断。</p></div>
      <div class="card"><h3>N 分期看什么</h3><p class="small-note">直肠系膜、髂内、髂外、腹股沟淋巴结分区不同，N1a/N1b/N1c 不能互相替代。</p></div>
      <div class="card"><h3>为什么要单独记 HPV</h3><p class="small-note">HPV 状态与病理类型相关，但不改变"这份报告写了什么"这一事实；阴性不等于排除。</p></div>
    </div>`;
  }
  if (sub === 2) {
    return `<div class="grid two">
      <div class="card"><div class="card-head"><div><h2>HPV 与免疫状态</h2><p>两个独立字段，不合并成"风险高低"。</p></div></div>
        <div class="row"><div><b>HPV 检测</b><p>${esc(d.hpv)}</p></div><span class="pill ${/阳性/.test(d.hpv) ? 'orange' : 'grey'}">病理/分子检测</span></div>
        <div class="row"><div><b>HIV 检测</b><p>${esc(d.hiv)}</p></div><span class="pill grey">按医生安排</span></div>
        <div class="row"><div><b>吸烟史</b><p>未记录</p></div><span class="pill grey">空着</span></div>
      </div>
      <div class="card"><div class="card-head"><div><h2>和家人有关的边界</h2><p>这里只放可核对的信息。</p></div></div>
        <p class="small-note">HPV 通过皮肤黏膜接触传播，肛管癌本身不具传染性。家人是否需要筛查、是否接种 HPV 疫苗，属于医生与疾控的建议范围，工作台不生成结论。</p>
        <div class="help-box">把你的担心写成一条「看法」，它会留在档案里，标注"不是医生结论"，不进趋势，也不进摘要事实区。</div>
      </div>
    </div>`;
  }
  return `<div class="grid two">
    <div class="card"><div class="card-head"><div><h2>病理与部位</h2><p>类型和部位分开保存。</p></div></div>
      <div class="row"><div><b>组织学类型</b><p>${esc(d.histology)}</p></div></div>
      <div class="row"><div><b>原发部位</b><p>${esc(d.site)}</p></div></div>
      <div class="row"><div><b>分化</b><p>${esc(d.grade)}</p></div></div>
      <div class="row"><div><b>确诊日期</b><p>${cnDate(d.date)}</p></div></div>
    </div>
    <div class="card"><div class="card-head"><div><h2>为什么肛管癌要单独做一个工作台</h2></div></div>
      <p class="small-note">治疗以放化疗为主，手术多为挽救；最常见的日常困扰是肛周皮肤、排便急迫与控便，而不是"吃什么补什么"。所以这里的首页不是营养入口，而是皮肤与排便。</p>
      <div class="divider"></div>
      <p class="small-note">肛缘（perianal skin）与肛管（anal canal）的分期与治疗不同；如果报告写的是"肛缘"，请在同一档案里注明，不要合并。</p>
    </div>
  </div>`;
};

/* 4. 治疗历程 */
views.treatment = (p, sub) => {
  const c = p.care;
  const totalFx = 30, doneFx = c.intent === 'salvage' ? 28 : 27;
  if (sub === 0) {
    return `<div class="plan-card"><div><span class="eyebrow">当前路径 · 第 1 线</span><div class="big">${esc(c.path)}<small>${c.intent === 'salvage' ? '挽救性' : '根治性'}</small></div>
      <p class="small-note">${cnDate(c.started)} — ${cnDate(c.ended)} · ${esc(c.rt)}</p>
      <div class="progress"><i style="width:${Math.round(doneFx / totalFx * 100)}%"></i></div>
      <p class="small-note">放疗 ${doneFx}/${totalFx} 次已完成${doneFx < totalFx ? '（因皮肤反应中断过）' : ''}；中断与减量都记在事件里。</p></div>
      <div class="actions"><button data-action="toast" data-msg="原型不修改治疗记录">编辑路径</button></div></div>
    <div class="grid two" style="margin-top:14px">
      <div class="card"><h2>方案原文</h2><p class="small-note">${esc(c.regimen)}</p><div class="help-box">方案名、药物、剂量都按出院小结原文抄录；工作台不比较方案优劣，也不生成"更适合"的判断。</div></div>
      <div class="card"><h2>下一次</h2><p class="small-note">${esc(c.next)}</p><button class="text-button" data-action="go" data-target="followup">查看复查准备 →</button></div>
    </div>`;
  }
  if (sub === 1) {
    return `<div class="card"><div class="card-head"><div><h2>放疗与化疗</h2><p>按周期记录，实际执行与计划分两列。</p></div></div>
      <div class="table-wrap"><table class="cycle-table"><thead><tr><th>阶段</th><th>日期</th><th>计划</th><th>实际</th><th>备注</th></tr></thead><tbody>
        <tr class="done"><td>放疗</td><td class="num">${cnDate(c.started)} — ${cnDate(c.ended)}</td><td>${esc(c.rt)}</td><td>${doneFx}/${totalFx} 次</td><td>${c.intent === 'salvage' ? '按计划完成' : '皮肤反应中断 3 天'}</td></tr>
        <tr class="done"><td>化疗 1</td><td class="num">${cnDate(c.started)}</td><td>MMC + 5-FU</td><td>完成</td><td>—</td></tr>
        <tr class="done"><td>化疗 2</td><td class="num">2026-06-04</td><td>MMC + 5-FU</td><td>完成</td><td>${c.intent === 'salvage' ? '—' : '白细胞最低 2.1'}</td></tr>
        ${p.care.surgery ? `<tr class="done"><td>手术</td><td class="num">2026-02-18</td><td>APR + 造口</td><td>完成</td><td>R0</td></tr>` : ''}
      </tbody></table></div></div>
      <div class="grid two" style="margin-top:14px">
        <div class="card"><h3>剂量与分次</h3><p class="small-note">${esc(c.rt)}。剂量单位 Gy、分次、技术名称按计划单原文保留。</p></div>
        <div class="card"><h3>中断与减量</h3><p class="small-note">中断原因、天数、是否补量，都记在事件里；这些信息在复查时会被问到。</p></div>
      </div>`;
  }
  if (sub === 2) {
    return p.care.surgery ? `<div class="card"><div class="card-head"><div><h2>手术与造口</h2><p>术式、切缘、造口类型分开记。</p></div></div>
      <div class="row"><div><b>术式</b><p>${esc(c.surgery)}</p></div><span class="pill grey">2026-02-18</span></div>
      <div class="row"><div><b>造口</b><p>乙状结肠单腔造口 · 永久</p></div></div>
      <div class="row"><div><b>切缘</b><p>R0（阴性）</p></div></div>
      <div class="help-box">造口不是"失败"的结果，也不是所有肛管癌都会经历。这里只记录事实与日常护理。</div></div>`
      : emptyState('本档案没有手术记录', '如果之后做了挽救性手术，会作为新的一条治疗线加进来，旧路径保留。');
  }
  if (sub === 3) return `<div class="card"><div class="card-head"><div><h2>疗效评估</h2><p>评估结论以报告原文为准，工作台只摘录。</p></div></div>
    ${p.followups.filter(f => f.done).map(f => `<div class="row"><div class="row-main"><span class="pill green">已评估</span><div><b>${esc(f.type)} · ${cnDate(f.done)}</b><p>${esc(f.result || '')}</p></div></div><span class="muted">${esc(f.imaging || '')}</span></div>`).join('') || emptyState('还没有评估记录', '治疗结束后的第一次评估通常会安排肛门指检与影像。')}
    <div class="help-box">"未见明显残留"与"完全缓解"不是同一句话；工作台保留报告原话，不替它升级成结论。</div></div>`;
  return '';
};

/* 5. 副作用与症状 */
views.toxicity = (p, sub) => {
  const rows = p.symptoms;
  if (sub === 0) {
    return `<div class="notice plain"><b>CTCAE 是严重度分级工具</b>，不是诊断，也不代表需要停药或减量。分级由你对照描述记录，处置由医生判断。</div>
    <div class="table-wrap"><table><thead><tr><th>症状</th><th>CTCAE 术语</th><th>分级</th><th>开始</th><th>缓解</th><th>说明</th></tr></thead><tbody>
    ${rows.map(s => `<tr><td><b>${esc(s.term)}</b></td><td class="muted">${esc(s.ctcae)}</td><td><span class="pill ${s.grade >= 3 ? 'red' : s.grade === 2 ? 'orange' : 'yellow'}">${s.grade} 级</span></td><td class="num">${cnDate(s.onset)}</td><td class="num">${s.resolved ? cnDate(s.resolved) : '未缓解'}</td><td>${esc(s.note || '—')}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  if (sub === 1) {
    const ladder = ['1 级 · 轻度；仅症状，不需干预', '2 级 · 中度；需要局部或非侵入性处理', '3 级 · 重度；影响自理，需医疗处理', '4 级 · 危及生命；需紧急处理', '5 级 · 死亡'];
    return `<div class="grid two"><div class="card"><h2>分级怎么读</h2><div class="flag-list">${ladder.map((l, i) => `<div><span><b>${i + 1} 级</b> · ${esc(l.split('· ')[1])}</span></div>`).join('')}</div>
      <div class="help-box">同一症状在不同时间可以是不同级别；这里记录的是"那天"的级别，不做平均。</div></div>
      <div class="card"><h2>本档案目前的分布</h2>${[1, 2, 3, 4].map(g => { const n = rows.filter(s => s.grade === g).length; return `<div class="row"><div><b>${g} 级</b><p>${n} 条记录</p></div><div class="progress" style="width:120px"><i style="width:${n / Math.max(1, rows.length) * 100}%"></i></div></div>`; }).join('')}</div>
    </div>`;
  }
  if (sub === 2) return `<div class="grid two">
    <div class="card"><h2>这些情况直接联系医疗团队</h2><div class="flag-list">
      <div><span>发热 ≥38.3℃ 或寒战</span></div><div><span>肛周皮肤出现大片渗液、异味、发黑或剧痛加重</span></div>
      <div><span>排便时大量出血，或持续滴血</span></div><div><span>完全排不出尿，或尿量明显减少</span></div>
      <div><span>持续呕吐、喝不进水</span></div><div><span>造口完全停止排气排便并伴腹胀疼痛</span></div>
    </div><p class="small-note">以上为常见警戒信号，不替代医院给你的具体指引。</p></div>
    <div class="card"><h2>记录时写什么</h2><p class="small-note">写"什么时候、做了什么、多久、有没有好转"，比"很难受"更容易在门诊说清楚。照片可以拍，但不要拍到能识别身份的背景。</p>
      <div class="help-box">小萌宝不判断严重程度是否需要就医；它只把描述和分级并排放好，让你在门诊更快说清楚。</div></div>
  </div>`;
  return '';
};

/* 6. 肠道与排粪 */
const WEXNER = [['排气', 'gas'], ['稀便', 'liquid'], ['成形便', 'solid'], ['需要护垫', 'pad'], ['生活方式改变', 'lifestyle']];
function wexner(p) {
  if (!p.bowel.length) return null;
  const last = p.bowel[p.bowel.length - 1];
  const freq = last.moves <= 2 ? 0 : last.moves <= 4 ? 1 : last.moves <= 7 ? 2 : 3;
  let score = freq;
  const parts = [{ label: '排便次数', v: freq }];
  if (last.incontinence > 0) { parts.push({ label: '失禁（按记录）', v: Math.min(3, last.incontinence + 1) }); score += Math.min(3, last.incontinence + 1); }
  if (last.urgency >= 2) { parts.push({ label: '急迫感', v: Math.min(3, last.urgency) }); score += Math.min(3, last.urgency); }
  return { score, parts, capped: true, date: last.date };
}
views.bowel = (p, sub) => {
  if (!p.bowel.length) {
    return emptyState('这个档案没有排便日记', '做了造口之后，排便记录由「造口与生活」承接；这里保留空态，不拿造口输出冒充排便次数。');
  }
  const last = p.bowel[p.bowel.length - 1];
  const avg = p.bowel.slice(-4).reduce((a, b) => a + b.moves, 0) / Math.min(4, p.bowel.length);
  if (sub === 1) {
    const w = wexner(p);
    return `<div class="grid three">
      <div class="card"><span class="eyebrow">Wexner 控便评分</span><div class="big" style="font-size:30px;font-weight:600">${w.score}<span class="muted" style="font-size:13px"> / 20</span></div><p class="small-note">根据 ${cnDate(w.date)} 的日记估算；分数越高表示控便问题越多。这是量表，不是诊断。</p></div>
      <div class="card"><span class="eyebrow">最近 4 次平均</span><div class="big" style="font-size:30px;font-weight:600">${fmtNum(avg)}<span class="muted" style="font-size:13px"> 次/日</span></div><p class="small-note">治疗前基线为 1 次/日。</p></div>
      <div class="card"><span class="eyebrow">最近一次</span><div class="big" style="font-size:24px;font-weight:600">${cnDate(last.date)}</div><p class="small-note">${last.moves} 次 · 急迫感 ${last.urgency}/3 · 失禁 ${last.incontinence} 次 · 里急后重 ${last.tenesmus}/3</p></div>
    </div>
    <div class="card" style="margin-top:14px"><div class="card-head"><div><h2>评分组成</h2><p>每个维度单独记，合计只是参考。</p></div></div>
      ${w.parts.map(x => `<div class="row"><div><b>${esc(x.label)}</b></div><div class="progress" style="width:140px"><i style="width:${x.v / 3 * 100}%"></i></div><span class="muted">${x.v}/3</span></div>`).join('')}
      <div class="help-box">Wexner 量表原本用于评估失禁严重度，这里的折算只用于让趋势可见；不要把分数当成"能不能做某件事"的依据。</div></div>`;
  }
  if (sub === 2) {
    return `<div class="grid two">
      <div class="card"><h2>里急后重</h2><p class="small-note">便意频繁、排不出或排不尽，是直肠/肛管放疗后常见的不适。记录"一天几次、持续多久"，比形容感受更有用。</p>
        <div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>日期</th><th>程度</th></tr></thead><tbody>${p.bowel.map(b => `<tr><td class="num">${cnDate(b.date)}</td><td>${['无', '轻', '中', '重'][b.tenesmus]}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="card"><h2>便血</h2><p class="small-note">少量擦拭带血与大量出血不是一回事。记录颜色、量、是否与排便相关；持续或量多时联系医疗团队。</p>
        <div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>日期</th><th>是否带血</th></tr></thead><tbody>${p.bowel.map(b => `<tr><td class="num">${cnDate(b.date)}</td><td>${b.blood ? '<span class="pill orange">有</span>' : '无'}</td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  }
  const max = Math.max(8, ...p.bowel.map(b => b.moves));
  return `<div class="card"><div class="card-head"><div><h2>最近 7 次记录</h2><p>柱高＝当日排便次数；橙色段＝急迫感 ≥2 的那几天。</p></div><span class="pill grey">基线 1 次/日</span></div>
    <div class="bowel-chart">${p.bowel.map(b => `<div class="bc-col"><span class="bc-val">${b.moves}</span><div class="bc-bar"><i style="height:${b.moves / max * 100}%" class="${b.urgency >= 2 ? 'hot' : ''}"></i></div><span class="bc-date">${shortDate(b.date)}</span></div>`).join('')}</div>
    <div class="legend"><span><i style="background:var(--violet)"></i>当日次数</span><span><i style="background:var(--danger)"></i>急迫感 ≥2</span></div></div>
  <div class="card" style="margin-top:14px"><div class="card-head"><div><h2>日记明细</h2><p>布里斯托分型 1（硬球）—7（水样）。</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>日期</th><th>次数</th><th>Bristol</th><th>急迫</th><th>失禁</th><th>里急后重</th><th>带血</th><th>备注</th></tr></thead><tbody>
    ${p.bowel.slice().reverse().map(b => `<tr><td class="num">${cnDate(b.date)}</td><td class="num">${b.moves}</td><td class="num">${b.bristol}</td><td>${b.urgency}/3</td><td>${b.incontinence}</td><td>${b.tenesmus}/3</td><td>${b.blood ? '有' : '无'}</td><td>${esc(b.note || '—')}</td></tr>`).join('')}
    </tbody></table></div></div>`;
};

/* 7. 肛周皮肤 */
views.skin = (p, sub) => {
  if (!p.skin.length) {
    return emptyState('这个档案没有肛周皮肤记录', '做了腹会阴联合切除后，原来的肛周皮肤已不存在；造口周围皮肤记录在「造口与生活」。');
  }
  const last = p.skin[p.skin.length - 1];
  const scale = D.scales.rtog_skin;
  const cur = scale.find(s => s.ordinal === last.rtog);
  if (sub === 0) {
    return `<div class="grid three"><div class="card"><span class="eyebrow">最近一次 · ${cnDate(last.date)}</span><div class="big" style="font-size:32px;font-weight:600;color:${chartTone(cur.tone)}">RTOG ${last.rtog} 级</div><p class="small-note">${esc(cur.label)}${last.moist ? ' · 有湿性脱皮' : ' · 无湿性脱皮'}</p></div>
      <div class="card"><span class="eyebrow">疼痛 NRS</span><div class="big" style="font-size:32px;font-weight:600">${last.pain}<span class="muted" style="font-size:13px"> / 10</span></div><p class="small-note">静息与排便时取较高值。</p></div>
      <div class="card"><span class="eyebrow">最重的时候</span><div class="big" style="font-size:24px;font-weight:600">6 月 19 日</div><p class="small-note">RTOG 3 级，放疗暂停 3 天。</p></div></div>
      <div class="card" style="margin-top:14px"><h2>分级阶梯</h2><div class="ladder">${scale.slice().reverse().map(s => `<div class="ladder-row ${s.ordinal === last.rtog ? 'on' : ''}" style="--tone:${chartTone(s.tone)}"><b>${s.ordinal}</b><span>${esc(s.label.replace(/^\d+\s*级\s*·\s*/, ''))}</span>${s.ordinal === last.rtog ? '<em>当前</em>' : ''}</div>`).join('')}</div></div>
      <div class="card" style="margin-top:14px"><h2>逐次记录</h2><div class="table-wrap"><table><thead><tr><th>日期</th><th>RTOG</th><th>CTCAE</th><th>湿性脱皮</th><th>疼痛</th><th>备注</th></tr></thead><tbody>${p.skin.slice().reverse().map(s => `<tr><td class="num">${cnDate(s.date)}</td><td><span class="pill ${s.rtog >= 3 ? 'red' : s.rtog === 2 ? 'orange' : s.rtog === 1 ? 'yellow' : 'green'}">${s.rtog} 级</span></td><td>${s.ctcae ? s.ctcae + ' 级' : '—'}</td><td>${s.moist ? '有' : '无'}</td><td class="num">${s.pain}</td><td>${esc(s.note || '—')}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  if (sub === 1) {
    return `<div class="grid two"><div class="card"><h2>护理记录</h2><p class="small-note">只记录你实际做了什么、什么时候做、皮肤怎么反应；不写"应该用什么"。</p>
      <div class="saved-item"><b>2026-06-20 · 温水坐浴 10 分钟，每日 2 次</b><p>坐浴后 30 分钟更换敷料；当晚疼痛 6→5。</p></div>
      <div class="saved-item"><b>2026-06-22 · 改用无酒精屏障霜</b><p>涂抹后刺痛约 1 分钟；次日渗液减少。</p></div>
      <div class="saved-item"><b>2026-07-18 · 停止坐浴，改为局部冲洗</b><p>结痂后避免长时间浸泡；具体做法来自门诊护士。</p></div>
      <button class="text-button" data-action="toast" data-msg="原型不保存新记录">＋ 记一条护理</button></div>
      <div class="card"><h2>拍照留档</h2><p class="small-note">同一角度、同一光线、同一距离，才能比较。照片只存本机资料目录，默认不进云端。</p><div class="photo-slot">照片占位 · 原型不读取相机</div>
      <div class="help-box">皮肤变化快，照片比文字更直观；但不要拍到能识别身份的背景或物品。</div></div></div>`;
  }
  if (sub === 2) return `<div class="grid two"><div class="card"><h2>建议联系医疗团队的情况</h2><div class="flag-list">
      <div><span>湿性脱皮范围扩大，或出现黄色脓性渗液、异味</span></div>
      <div><span>疼痛突然加重，NRS ≥7 且休息不缓解</span></div>
      <div><span>皮肤发黑、破溃加深或出血不止</span></div>
      <div><span>发热 ≥38.3℃</span></div>
      <div><span>无法排尿或排便困难明显加重</span></div>
    </div><p class="small-note">以上是常见警戒信号；具体联系谁、什么时候去急诊，以医院给你的指引为准。</p></div>
    <div class="card"><h2>放疗期间常被问到的三件事</h2>
      <div class="row"><div><b>能不能坐浴？</b><p>与皮肤是否破损、医生/护士的具体交代有关；记录你实际被交代的做法，不自行推广。</p></div></div>
      <div class="row"><div><b>能不能用湿巾？</b><p>含酒精或香精的产品可能刺激；用清水或医嘱指定方式清洁。</p></div></div>
      <div class="row"><div><b>要不要穿内裤？</b><p>透气、宽松、勤换，比"穿不穿"更重要。</p></div></div>
    </div></div>`;
  return '';
};

/* 8. 检查与指标 */
const REF = { albumin: [40, 55], hemoglobin: [115, 150], weight: null };
views.labs = (p, sub) => {
  if (sub === 2) {
    return `<div class="card"><div class="card-head"><div><h2>影像与内镜</h2><p>按报告原文逐次归档；不做"好转/恶化"的自动判断。</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>日期</th><th>检查</th><th>报告要点（原文摘录）</th></tr></thead><tbody>
      ${p.events.filter(e => e.type === 'imaging').map(e => `<tr><td class="num">${cnDate(e.date)}</td><td><b>${esc(e.title)}</b></td><td>${esc(e.detail || '—')}</td></tr>`).join('')}
      <tr><td class="num">2026-09-02</td><td><b>盆腔 MRI（复查）</b></td><td>未见明显残留肿块；腹股沟淋巴结短径 6 mm。</td></tr>
      </tbody></table></div>
      <div class="help-box">影像报告里的"未见明显""考虑""不除外"是不同强度的表述，工作台原样保留，不改写成结论。</div></div>`;
  }
  if (sub === 0) {
    const keys = ['albumin', 'hemoglobin'];
    return `<div class="card"><div class="card-head"><div><h2>血常规与生化</h2><p>只列已确认的数值；参考区间以化验单为准。</p></div></div>
      ${keys.map(k => { const d = defOf(k), pts = seriesOf(p, k); if (!pts.length) return ''; const l = latest(pts); const [lo, hi] = REF[k] || []; const flag = l.value < lo ? '<span class="pill yellow">低于参考下限</span>' : l.value > hi ? '<span class="pill yellow">高于参考上限</span>' : '<span class="pill green">在参考区间内</span>';
        return `<div class="row"><div><b>${d.label}</b><p>${pts.length} 次记录 · 最近 ${cnDate(l.date)}</p></div><div style="text-align:right"><b style="font-size:18px">${fmtNum(l.value)} ${d.unit}</b><br>${flag}</div></div>`; }).join('')}
      <div class="help-box">参考区间因实验室而异；跨医院比较前先确认单位与区间一致。</div></div>
    <div class="card" style="margin-top:14px"><h2>全部数值</h2><div class="table-wrap"><table><thead><tr><th>指标</th><th>日期</th><th>数值</th><th>备注</th></tr></thead><tbody>
      ${p.metrics.filter(m => defOf(m.key).kind === 'numeric' && ['albumin','hemoglobin','weight','bowel_frequency','pain_nrs'].includes(m.key)).flatMap(m => seriesOf(p, m.key).slice(-3).map(pt => `<tr><td>${esc(defOf(m.key).label)}</td><td class="num">${cnDate(pt.date)}</td><td class="num">${fmtNum(pt.value)} ${esc(defOf(m.key).unit)}</td><td>${esc(pt.note || '—')}</td></tr>`)).join('')}
    </tbody></table></div></div>`;
  }
  if (sub === 1) return `<div class="grid two"><div class="card"><h2>肿瘤标志物</h2>${p.metrics.some(m => m.key === 'scc') ? '' : emptyState('没有可核对的标志物记录', '肛管鳞癌没有公认的常规随访标志物；如果医院查了 SCC-Ag，可以逐次录入，但不据此判断病情。')}</div>
    <div class="card"><h2>影像节奏</h2><p class="small-note">治疗结束后通常按 3–6 个月安排盆腔 MRI 或 CT，之后拉长间隔；具体节奏由治疗医院决定。</p>
      <div class="row"><div><b>2026-04-15</b><p>盆腔 MRI + PET-CT（分期）</p></div><span class="pill grey">基线</span></div>
      <div class="row"><div><b>2026-09-02</b><p>盆腔 MRI（治疗后首次）</p></div><span class="pill green">已完成</span></div>
      <div class="row"><div><b>2026-11-25</b><p>盆腔 MRI（计划）</p></div><span class="pill yellow">待做</span></div>
    </div></div>`;
  return '';
};

/* 9. 一图秀 */
views.timeline = (p, sub) => {
  if (sub === 2) {
    return `<div class="grid two"><div class="card"><h2>这张图怎么画</h2><div class="flag-list">
      <div><span>每条数值线<b>独立归一化</b>：体重按 56–63 kg，白蛋白按 34–42 g/L；两条线的相对位置没有可比性。</span></div>
      <div><span>分类记录（皮肤 RTOG 分级）只画节点，不连线——0 级到 3 级之间不存在"斜率"。</span></div>
      <div><span>治疗事件是竖虚线，不是指标；它只帮你定位"那段时间在做什么"。</span></div>
      <div><span>单点不连线；末点标注按纵向 13px 避让，避免重叠。</span></div>
    </div></div>
    <div class="card"><h2>数据来源</h2><p class="small-note">全部来自 demo/demo-data.sqlite；原型只读 demo-data.js，不另存一份。</p>
      <div class="stat-band"><span><b>${p.metrics.reduce((a, m) => a + m.points.length, 0)}</b> 个数据点</span><span><b>${p.events.length}</b> 个事件</span><span><b>6</b> 个月窗口</span></div>
      <div class="help-box">缺失就是缺失：没有记录的日子不插值、不补 0。图上两点之间的连线只表示"这两次记录之间没有别的数据"。</div></div></div>`;
  }
  if (sub === 1) {
    return `<div class="card"><div class="card-head"><div><h2>分类记录与事件</h2><p>分类序列用节点表示，不连线。</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>日期</th><th>分类</th><th>级别</th><th>事件</th></tr></thead><tbody>
      ${p.metrics.filter(m => defOf(m.key).kind === 'categorical').flatMap(m => seriesOf(p, m.key).map(pt => `<tr><td class="num">${cnDate(pt.date)}</td><td>${esc(defOf(m.key).label)}</td><td>${pt.value} 级</td><td>${esc((p.events.find(e => e.date === pt.date) || {}).title || '—')}</td></tr>`)).join('')}
      </tbody></table></div></div>
      <div class="card" style="margin-top:14px"><h2>事件泳道</h2>${p.events.map(e => `<div class="row"><div class="row-main"><span class="pill grey">${typeLabel(e.type)}</span><div><b>${esc(e.title)}</b><p>${cnDate(e.date)}${e.detail ? ' · ' + esc(e.detail) : ''}</p></div></div></div>`).join('')}</div>`;
  }
  const available = p.metrics.filter(m => defOf(m.key).kind === 'numeric');
  const catMetric = p.metrics.find(m => defOf(m.key).kind === 'categorical');
  const picked = (state.metricPick || available.slice(0, 2).map(m => m.key)).filter(k => available.some(m => m.key === k));
  while (picked.length < 2 && available.length > picked.length) { const k = available.find(m => !picked.includes(m.key)).key; picked.push(k); }
  return `<div class="overview">
    <aside class="rail" aria-label="一图秀选择器">
      <section><h3>数值指标</h3><div class="metric-list">${available.map(m => `<label class="metric-pick"><input type="checkbox" data-pick="${m.key}" ${picked.includes(m.key) ? 'checked' : ''}><i style="background:${defOf(m.key).color}"></i><span>${esc(defOf(m.key).label)}</span><small>${seriesOf(p, m.key).length}点</small></label>`).join('')}</div></section>
      <section><h3>分类序列</h3><div class="metric-pick" style="cursor:default"><i style="background:${catMetric ? defOf(catMetric.key).color : 'var(--muted)'}"></i><span>${catMetric ? esc(defOf(catMetric.key).label) : '本档案无分类指标'}</span></div>
        <p class="small-note" style="margin-top:6px">分类只画节点，不连线。</p></section>
      <section><h3>治疗事件</h3><p class="small-note">${p.events.filter(e => ['radiotherapy','surgery','chemo'].includes(e.type)).map(e => `${shortDate(e.date)} ${esc(e.title)}`).join('<br>')}</p></section>
    </aside>
    <div class="timeline-main"><div class="chart-panel">
      <div class="chart-top"><div><h2>${picked.map(k => esc(defOf(k).label)).join(' / ')}${catMetric ? ' + ' + esc(defOf(catMetric.key).label) : ''}</h2><p class="small-note">${cnDate(D.window.from)} — ${cnDate(D.window.to)} · 每 2–4 周一次记录</p></div><span class="pill grey">独立归一 · 不可横向比较</span></div>
      <div class="legend">${picked.map(k => `<span><i style="background:${defOf(k).color}"></i><b>${esc(defOf(k).label)}</b><span class="range">${rangeText(seriesOf(p, k))}</span></span>`).join('')}${catMetric ? `<span><i style="background:${defOf(catMetric.key).color};border-radius:50%"></i><b>${esc(defOf(catMetric.key).label)}</b><span class="range">节点</span></span>` : ''}</div>
      <div class="chart-wrap">${oneChart(p, picked, catMetric)}<div class="chart-tip" id="chart-tip"></div></div>
      <div class="pin"><div><b>${pinTitle(p, picked)}</b><p>${pinBody(p, picked)}</p></div><button class="text-button" data-action="go" data-target="followup">带去复查 →</button></div>
    </div>
    <div class="section-title"><div><h2>指标卡</h2><p>点击翻转；分类记录不翻卡。</p></div><span class="muted">${p.metrics.length} 个指标</span></div>
    <div class="metric-grid">${p.metrics.map(m => metricCard(p, m.key)).join('')}</div>
    </div></div>`;
};
function rangeText(pts) { if (!pts.length) return ''; const v = pts.map(p => p.value); return `${fmtNum(Math.min(...v))}–${fmtNum(Math.max(...v))}`; }
function pinTitle(p, picked) {
  const w = seriesOf(p, picked[0] || 'weight');
  if (!w.length) return '没有足够的数据点';
  const d = w[w.length - 1].value - w[0].value;
  return `体重 ${d >= 0 ? '回升' : '下降'} ${fmtNum(Math.abs(d))} kg`;
}
function pinBody(p, picked) {
  const a = seriesOf(p, picked[1] || 'albumin');
  return `白蛋白从 ${fmtNum(a[0]?.value)} 到 ${fmtNum(a[a.length - 1]?.value)} g/L；最低点出现在放疗后段。皮肤分级同步记录，能看出哪一段最难熬。`;
}

function oneChart(p, picked, catMetric) {
  const W = 900, H = 372, L = 54, R = 120, T = 30, B = 132;
  const x0 = parseDay(D.window.from).getTime(), x1 = parseDay(D.window.to).getTime();
  const X = (d) => L + (parseDay(d).getTime() - x0) / (x1 - x0) * (W - L - R);
  const plotH = H - T - B;
  const series = picked.map(k => {
    const pts = seriesOf(p, k), vals = pts.map(q => q.value);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const pad = (hi - lo) * 0.18 || 1;
    const y = (v) => T + (1 - (v - (lo - pad)) / ((hi + pad) - (lo - pad))) * plotH;
    return { key: k, def: defOf(k), pts, lo: lo - pad, hi: hi + pad, y, coords: pts.map(q => ({ x: X(q.date), y: y(q.value), v: q.value, date: q.date, note: q.note })) };
  });
  const events = p.events.filter(e => e.date >= D.window.from && e.date <= D.window.to).filter(e => ['radiotherapy','surgery','chemo','imaging'].includes(e.type));
  const catPts = catMetric ? seriesOf(p, catMetric.key) : [];
  const catScale = catMetric ? D.scales[defOf(catMetric.key).scale] : [];
  const catTop = T + plotH + 60, catBottom = catTop + 52;
  const catY = (ord) => catBottom - (ord / Math.max(1, catScale.length - 1)) * (catBottom - catTop);
  const months = [];
  for (let m = 5; m <= 10; m++) { const dd = `2026-${String(m).padStart(2, '0')}-01`; if (dd >= D.window.from && dd <= D.window.to) months.push(dd); }
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="指标一图秀：${esc(picked.map(k => defOf(k).label).join('、'))}">`;
  for (let i = 0; i <= 3; i++) { const y = T + plotH * i / 3; svg += `<line class="grid" x1="${L}" y1="${y.toFixed(1)}" x2="${W - R}" y2="${y.toFixed(1)}"/>`; }
  // 左右两套纵轴：左＝第一条线，右＝第二条线（各自独立归一）
  series.slice(0, 2).forEach((s, idx) => {
    for (let i = 0; i <= 2; i++) {
      const v = s.hi - (s.hi - s.lo) * i / 2;
      const y = T + plotH * i / 2 + 3.5;
      svg += `<text class="tick" x="${idx === 0 ? L - 8 : W - R + 8}" y="${y.toFixed(1)}" text-anchor="${idx === 0 ? 'end' : 'start'}" fill="${s.def.color}" opacity=".85">${fmtNum(v)}</text>`;
    }
  });
  months.forEach(m => { svg += `<text class="tick" x="${X(m).toFixed(1)}" y="${T + plotH + 15}" text-anchor="middle">${Number(m.slice(5, 7))}月</text>`; });
  // 事件只画竖虚线 + 日期（标题在左侧「治疗事件」栏里，不挤进图内）
  events.forEach((e, i) => {
    const x = X(e.date);
    svg += `<line x1="${x.toFixed(1)}" y1="${T}" x2="${x.toFixed(1)}" y2="${catTop - 12}" stroke="${e.type === 'surgery' ? 'var(--danger)' : 'var(--line-strong)'}" stroke-width="1" stroke-dasharray="3 4"/>`;
    svg += `<text class="tick" x="${x.toFixed(1)}" y="${T + plotH + 33 + (i % 2) * 11}" text-anchor="middle" font-size="8.5">${esc(shortDate(e.date))}</text>`;
  });
  series.forEach(s => {
    if (s.coords.length > 1) svg += `<path class="line" d="${smoothPath(s.coords)}" stroke="${s.def.color}"/>`;
    s.coords.forEach(c => { svg += `<circle class="pt" data-key="${s.key}" data-date="${c.date}" data-v="${c.v}" data-note="${esc(c.note || '')}" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="${s.def.color}"/>`; });
  });
  // 末点标签：排 y、13px 避让，画在右侧留白里（不裁切）
  const labels = series.map(s => ({ s, y: s.coords.at(-1).y, v: s.coords.at(-1).v })).sort((a, b) => a.y - b.y);
  labels.forEach((l, i) => { if (i) l.y = Math.max(l.y, labels[i - 1].y + 13); });
  labels.forEach(l => { svg += `<text x="${W - R + 28}" y="${(l.y + 3.5).toFixed(1)}" font-size="10" font-weight="600" fill="${l.s.def.color}">${esc(l.s.def.label)} ${fmtNum(l.v)}</text>`; });
  if (catMetric) {
    svg += `<line class="axis" x1="${L}" y1="${catTop - 8}" x2="${W - R}" y2="${catTop - 8}"/>`;
    svg += `<text class="tick" x="${L}" y="${catTop - 16}" font-size="10">${esc(defOf(catMetric.key).label)}（分类，只画节点）</text>`;
    catScale.forEach(s => { if ([0, Math.floor((catScale.length - 1) / 2), catScale.length - 1].includes(s.ordinal)) svg += `<text class="tick" x="${L - 8}" y="${(catY(s.ordinal) + 3).toFixed(1)}" text-anchor="end" font-size="9">${s.short}</text>`; });
    catPts.forEach(pt => { const row = catScale.find(s => s.ordinal === pt.value); svg += `<circle cx="${X(pt.date).toFixed(1)}" cy="${catY(pt.value).toFixed(1)}" r="5" fill="${chartTone(row ? row.tone : 'ok')}" stroke="#fff" stroke-width="1.6"><title>${cnDate(pt.date)} · ${esc(row ? row.label : pt.value)}</title></circle>`; });
  }
  return svg + '</svg>';
}
function attachChartHover() {
  const tip = $('#chart-tip'); if (!tip) return;
  $$('.chart .pt').forEach(c => {
    c.addEventListener('mouseenter', () => {
      const def = defOf(c.dataset.key);
      tip.textContent = `${cnDate(c.dataset.date)} · ${def.label} ${c.dataset.v} ${def.unit || ''}${c.dataset.note ? ' · ' + c.dataset.note : ''}`;
      tip.style.left = c.getAttribute('cx') / 900 * 100 + '%';
      tip.style.top = c.getAttribute('cy') / 372 * 100 + '%';
      tip.classList.add('on');
    });
    c.addEventListener('mouseleave', () => tip.classList.remove('on'));
  });
}

/* 10. 造口与生活 */
views.life = (p, sub) => {
  if (sub === 1) {
    return `<div class="grid two"><div class="card"><h2>亲密关系</h2><p class="small-note">放疗后可能出现阴道干涩、狭窄或性交疼痛；造口术后也可能担心身体形象。这些都可以在门诊提出来，不必等到"必须问"的时候。</p>
      <div class="row"><div><b>可以问的问题</b><p>什么时候可以恢复性生活？需要用润滑剂吗？需要阴道扩张吗？</p></div></div>
      <div class="row"><div><b>生育</b><p>盆腔放疗可能影响生育能力；如果有生育计划，在治疗前就应与医生讨论保存方案。</p></div></div>
      <div class="help-box">工作台不提供性行为或生育的具体医学建议，只把问题留在这里，让你在门诊更容易开口。</div></div>
      <div class="card"><h2>身体形象</h2><p class="small-note">"我不想让伴侣看到造口"是很常见的感受，不是矫情。可以记录具体场景（换袋、洗澡、亲密接触），下次与造口护士讨论。</p>
      <div class="saved-item private"><b>我的担心（不是医生结论）</b><p>${esc((p.viewpoints[0] || {}).text || '还没有记录')}</p><small>${(p.viewpoints[0] || {}).date ? cnDate(p.viewpoints[0].date) : ''}</small></div></div></div>`;
  }
  if (sub === 2) {
    return `<div class="grid two"><div class="card"><h2>工作与社交</h2>
      <div class="row"><div><b>出门前</b><p>带一套备用底盘/袋子、湿巾、小垃圾袋；饭前少喝碳酸饮料。</p></div></div>
      <div class="row"><div><b>气味</b><p>底盘贴合、及时排空比香水更有效；如果持续有异味，先查是否渗漏。</p></div></div>
      <div class="row"><div><b>运动</b><p>避免短期内增加腹压的动作；造口旁疝的风险与动作、体重有关，具体限制问造口护士。</p></div></div>
      <div class="help-box">这一页只记录经验，不构成康复处方。</div></div>
      <div class="card"><h2>和单位怎么说</h2><p class="small-note">是否需要告知同事、如何申请弹性时间，取决于你的工作性质与当地政策。可以先写下"最怕发生的场景"，再想一个最小应对。</p>
      <button class="text-button" data-action="viewpoint">＋ 记一条我的担心</button></div></div>`;
  }
  if (!p.ostomy.length) {
    return emptyState('这个档案没有造口', '肛管癌并不都需要造口；只有挽救性手术（APR）等情况才会做永久造口。这里空着，不用别的模块来填。');
  }
  const last = p.ostomy[p.ostomy.length - 1];
  return `<div class="grid three">
    <div class="card"><span class="eyebrow">最近一次 · ${cnDate(last.date)}</span><div class="big" style="font-size:28px;font-weight:600">${last.output} 次</div><p class="small-note">排出 ${esc(last.consistency)} · 渗漏 ${last.leaks} 次</p></div>
    <div class="card"><span class="eyebrow">造口周围皮肤</span><div class="big" style="font-size:28px;font-weight:600">${last.skin} 级</div><p class="small-note">0 级为完整；1 级为局部发红。</p></div>
    <div class="card"><span class="eyebrow">更换节奏</span><div class="big" style="font-size:24px;font-weight:600">3 天</div><p class="small-note">底盘；袋子按需排空。</p></div>
  </div>
  <div class="card" style="margin-top:14px"><div class="card-head"><div><h2>造口日记</h2><p>输出性状、渗漏、皮肤分开记；一次渗漏不说明护理失败。</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>日期</th><th>次数</th><th>性状</th><th>渗漏</th><th>皮肤</th><th>备注</th></tr></thead><tbody>
    ${p.ostomy.slice().reverse().map(o => `<tr><td class="num">${cnDate(o.date)}</td><td class="num">${o.output}</td><td>${esc(o.consistency)}</td><td>${o.leaks}</td><td><span class="pill ${o.skin >= 2 ? 'orange' : o.skin === 1 ? 'yellow' : 'green'}">${o.skin} 级</span></td><td>${esc(o.note || '—')}</td></tr>`).join('')}
    </tbody></table></div></div>
  <div class="grid two" style="margin-top:14px"><div class="card"><h2>日常清单</h2><div class="flag-list"><div><span>底盘中心孔比造口大 1–2 mm，不露皮肤</span></div><div><span>更换前先排空袋子，避免中途溢出</span></div><div><span>皮肤发红先查渗漏，不要先换更多药膏</span></div><div><span>持续渗漏或皮肤破溃，联系造口护士</span></div></div></div>
    <div class="card"><h2>我的看法</h2>${p.viewpoints.map(v => `<div class="saved-item private"><b>${cnDate(v.date)} · ${esc(v.about || '')}</b><p>${esc(v.text)}</p><small>这是你的看法，不是医生结论；不进趋势，也不进摘要事实区。</small></div>`).join('')}</div></div>`;
};

/* 11. 复查与随访 */
views.followup = (p, sub) => {
  const next = p.followups.find(f => !f.done);
  if (sub === 1) {
    return `<div class="grid two"><div class="card"><h2>${next ? '下次复查：' + cnDate(next.planned) : '暂无计划'}</h2><p class="small-note">${next ? esc(next.type) : ''} · ${next && next.imaging ? esc(next.imaging) : ''}</p>
      <div class="checklist">${[['带上最近一次影像报告与光盘', '确认是否空腹/憋尿', '整理最近 2 周的排便与皮肤记录', '把要问的问题按优先级排好', '确认造口护理用品是否够用']].map(([t]) => `<label class="check-row"><input type="checkbox"><span>${t}</span></label>`).join('')}</div>
      <div class="actions" style="margin-top:12px"><button class="primary" data-action="print-visit">生成复诊摘要</button><button data-action="toast" data-msg="原型不写入日历">加入日历</button></div></div>
      <div class="card"><h2>复查会做什么</h2><div class="row"><div><b>肛门指检（DRE）</b><p>触摸原发部位与直肠；有造口时仍可能做。</p></div></div>
        <div class="row"><div><b>腹股沟淋巴结触诊</b><p>两侧都要查；单侧肿大需要进一步评估。</p></div></div>
        <div class="row"><div><b>肛门镜</b><p>看黏膜与可疑病灶。</p></div></div>
        <div class="row"><div><b>影像</b><p>盆腔 MRI/CT，按医院节奏。</p></div></div></div></div>`;
  }
  if (sub === 2) {
    const open = p.questions.filter(q => q.status === 'open');
    return `<div class="card"><div class="card-head"><div><h2>问题清单 · ${open.length} 条未问</h2><p>按优先级排；只写问题，不写你希望听到的答案。</p></div><button data-action="add-question">＋ 加一条</button></div>
      ${open.map((q, i) => `<div class="row"><div class="row-main"><span class="pill ${q.priority === 1 ? 'orange' : 'grey'}">${q.priority === 1 ? '先问' : '再问'}</span><div><b>${esc(q.text)}</b><p>${esc(q.cat)}</p></div></div><button class="text-button" data-action="mark-asked" data-q="${p.questions.indexOf(q)}">已问过</button></div>`).join('') || emptyState('还没有问题', '想到什么就先记下来。')}
    </div>
    <div class="card" style="margin-top:14px"><h2>问的时候可以这样开头</h2><div class="flag-list"><div><span>“我最近两周排便 3–4 次/日，总有便意，这和我治疗前不一样。”</span></div><div><span>“肛周皮肤 6 月最重到 3 级，现在结痂了，还需要继续坐浴吗？”</span></div><div><span>“下次 MRI 如果淋巴结还是 6 mm，需要加做别的检查吗？”</span></div></div></div>`;
  }
  return `<div class="card"><div class="card-head"><div><h2>复查节奏</h2><p>日期为计划值；实际以医院安排为准。</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>计划日期</th><th>类型</th><th>肛门指检</th><th>腹股沟</th><th>肛门镜</th><th>影像</th><th>结果</th></tr></thead><tbody>
    ${p.followups.map(f => `<tr><td class="num">${cnDate(f.planned)}</td><td>${esc(f.type)}</td><td>${f.dre == null ? '—' : f.dre ? '做' : '未做'}</td><td>${f.inguinal == null ? '—' : f.inguinal ? '做' : '未做'}</td><td>${f.anoscopy == null ? '—' : f.anoscopy ? '做' : '未做'}</td><td>${esc(f.imaging || '—')}</td><td>${f.result ? esc(f.result) : '<span class="pill yellow">待做</span>'}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="help-box">治疗结束后的前 2 年通常复查更密，之后拉长；具体间隔与检查项目由治疗医院根据分期与风险决定。</div></div>`;
};

/* 12. 临床研究 */
views.trials = (p, sub) => {
  if (sub === 1) {
    const saved = T.rows.filter(t => state.savedTrials.has(t.key));
    return saved.length ? saved.map(trialCard).join('') : emptyState('还没有收藏的试验', '在「2026 线索」里点收藏，会出现在这里。');
  }
  if (sub === 2) {
    return `<div class="grid two"><div class="card"><h2>入组前要问清楚</h2><div class="flag-list">
      <div><span>我符合入组条件吗？需要哪些检查来确认？</span></div><div><span>对照组用的是什么方案？我会不会分到安慰剂？</span></div>
      <div><span>研究期间能不能同时用别的药？</span></div><div><span>需要多来医院几次？路费与住宿谁承担？</span></div>
      <div><span>如果病情变化，能不能退出？退出后怎么办？</span></div><div><span>研究药物可能的副作用有哪些？</span></div>
    </div></div><div class="card"><h2>三个不要</h2><p class="small-note">不要把"登记在招"当成"我能进"；不要把"Ⅰ期"当成"效果已证"；不要因为一项研究就停掉现有治疗。任何改变都要与主管医生讨论。</p>
      <div class="help-box">本页所有条目来自 ClinicalTrials.gov 登记信息，状态未核实；入组条件以研究团队现场评估为准。</div></div></div>`;
  }
  const filters = [['all', '全部'], ['recruiting', '招募中'], ['china', '中国中心'], ['done', '已完成']];
  let rows = T.rows;
  if (state.trialFilter === 'recruiting') rows = rows.filter(t => /RECRUITING|NOT_YET/.test(t.status));
  if (state.trialFilter === 'china') rows = rows.filter(t => t.china);
  if (state.trialFilter === 'done') rows = rows.filter(t => t.status === 'COMPLETED');
  return `<div class="notice plain"><b>${T.total} 条登记中，本页展示 ${T.rows.length} 条与肛管癌治疗最相关的摘录</b>，数据截止 ${T.cutoff}。状态为登记状态，未核实；登记 ≠ 有效 ≠ 安全 ≠ 可入组。</div>
  <div class="chips" style="margin-bottom:14px">${filters.map(([k, l]) => `<button class="chip" data-action="trial-filter" data-filter="${k}" aria-pressed="${state.trialFilter === k}">${l}</button>`).join('')}</div>
  ${rows.map(trialCard).join('') || emptyState('这个筛选下没有条目', '换一个筛选条件看看。')}`;
};
function trialCard(t) {
  const saved = state.savedTrials.has(t.key);
  const china = t.china ? '<span class="pill orange">中国中心</span>' : '';
  return `<div class="card trial-card" style="margin-bottom:12px">
    <div class="card-head"><div><div class="chips" style="margin-bottom:7px"><span class="pill ${/RECRUITING/.test(t.status) ? 'green' : 'grey'}">${esc(t.status_zh)}</span><span class="pill grey">${esc(t.phase_zh)}</span>${china}</div>
      <h3 style="font-size:14.5px;line-height:1.5">${esc(t.title_zh)}</h3>
      <p class="small-note">${esc(t.title)}</p></div>
      <div class="actions"><button class="text-button" data-action="trial-save" data-key="${t.key}">${saved ? '★ 已收藏' : '☆ 收藏'}</button><button data-action="trial-open" data-key="${t.key}">看详情</button></div></div>
    <div class="stat-band"><span>${esc(t.nct)}</span><span>${esc(t.sponsor || '申办方未列')}</span><span>计划入组 <b>${t.enrollment ?? '—'}</b></span><span>更新 ${esc(t.updated || '—')}</span></div>
    <p class="small-note" style="margin-top:8px">${esc(t.note || '')}</p>
  </div>`;
}

/* ---------------- dialogs ---------------- */
function openDialog(title, body, foot, eyebrow = '小萌宝') {
  $('#dialog-eyebrow').textContent = eyebrow;
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = body;
  $('#dialog-foot').innerHTML = foot || '<button data-action="close">关闭</button>';
  $('#dialog').showModal();
}
function profileDialog() {
  openDialog('切换演示档案', D.profiles.map((p, i) => `<button class="profile-row ${i === state.profile ? 'on' : ''}" data-action="switch-profile" data-idx="${i}"><div><b>${esc(p.name)}</b><p>${esc(p.meta)}</p></div><span class="profile-caret">${i === state.profile ? '当前' : '切换'}</span></button>`).join(''), '', '演示数据');
}
function settingsDialog() {
  openDialog('设置', `
    <div class="cfg-tabs" role="tablist"><button aria-selected="true">资料目录</button><button>文档解析</button><button>临床数据库</button><button>关于</button></div>
    <div class="cfg-block" style="margin-top:12px"><b>工作区目录</b><p class="small-note">真实业务数据只写你明确选择的目录；原型不写入磁盘。</p><div class="path-row"><code>~/资料/肛管癌工作台/</code><button data-action="toast" data-msg="原型不读写磁盘">更改</button></div></div>
    <div class="cfg-block" style="margin-top:10px"><b>文档解析</b><p class="small-note">PDF 先在本机提取文字；需要云端 OCR 时会明确提示发送内容。Token 只存 .secrets/，不进仓库。</p><span class="pill grey">未配置</span></div>
    <div class="cfg-block" style="margin-top:10px"><b>临床数据库</b><p class="small-note">research/anal-cancer/anal_cancer_trials_2026.sqlite · ${T.total} 条 · 截止 ${T.cutoff}</p><span class="pill green">已就绪（只读）</span></div>`,
    '<button data-action="close">关闭</button>', '设置');
}
function aboutDialog() {
  openDialog('关于小萌宝', `<div class="about"><img class="about-logo" src="assets/brand/analpal-logo.jpg" alt="小萌宝标识"><div class="about-meta"><div class="about-ver"><b>v${APP_INFO.version}</b><span class="pill orange">交互原型</span></div>
    <dl><div><dt>构建</dt><dd>${APP_INFO.build}</dd></div><div><dt>通道</dt><dd>prototype · 未接入 DSH</dd></div><div><dt>数据</dt><dd>2 套模拟档案 × 6 个月；试验 ${T.total} 条登记摘录</dd></div><div><dt>边界</dt><dd>只整理信息、不做诊断；分级与提示需与医生核对</dd></div><div><dt>品牌</dt><dd>小萌宝 AnalPal · 小 X 宝家族</dd></div></dl></div></div>`, '', '关于');
}
function quickAddDialog() {
  openDialog('记录今天', `<div class="form-grid"><div><label class="form-label">今天最难受的一件事</label><select><option>肛周皮肤</option><option>排便次数/急迫</option><option>疼痛</option><option>疲乏</option><option>造口护理</option><option>其他</option></select></div>
    <div><label class="form-label">严重度（你自己的感觉，0–10）</label><input type="number" min="0" max="10" value="3"></div>
    <div class="wide"><label class="form-label">发生了什么（时间、做了什么、有没有缓解）</label><textarea placeholder="例：今天排便 4 次，第二次很急，差点没赶上；坐浴后好一点。"></textarea></div></div>
    <label class="check-row"><input type="checkbox"><span>这条同时写进复诊问题清单</span></label>`, '<button data-action="close">取消</button><button class="primary" data-action="save-sim">保存（模拟）</button>');
}
function trialDialog(t) {
  openDialog(t.title_zh, `<p class="small-note">${esc(t.title)}</p>
    <div class="stat-band"><span>${esc(t.nct)}</span><span>${esc(t.phase_zh)}</span><span>${esc(t.status_zh)}</span><span>更新 ${esc(t.updated || '—')}</span></div>
    <div class="divider"></div><h3>登记信息</h3><p class="small-note">申办方：${esc(t.sponsor || '未列')}<br>计划入组：${t.enrollment ?? '未列'}<br>国家/地区：${esc(t.countries || '未列')}<br>中国中心：${esc(t.china || '登记中未列')}</p>
    <h3 style="margin-top:12px">干预</h3><p class="small-note">${esc(t.interventions || '未列')}</p>
    <h3 style="margin-top:12px">编辑说明</h3><p class="small-note">${esc(t.note || '')}</p>
    <div class="help-box">以上为登记摘录，状态未核实；入组条件与研究细节以研究团队和原始登记页为准。</div>`,
    `<button data-action="close">关闭</button><button data-action="trial-open-url" data-url="${esc(t.url)}">打开原始登记页 ↗</button>`, '临床研究');
}
function visitSummaryDialog() {
  const p = prof();
  const w = seriesOf(p, 'weight'), a = seriesOf(p, 'albumin');
  const txt = `【复诊摘要 · ${p.name} · ${cnDate(D.window.to)}】\n诊断：${p.stageLine}\n治疗：${p.care.path}（${cnDate(p.care.started)}—${cnDate(p.care.ended)}）\n体重：${fmtNum(first(w)?.value)} → ${fmtNum(latest(w)?.value)} kg\n白蛋白：${fmtNum(first(a)?.value)} → ${fmtNum(latest(a)?.value)} g/L\n最近症状：${p.symptoms.filter(s => !s.resolved).map(s => `${s.term} ${s.grade} 级`).join('、') || '无未缓解记录'}\n要问的问题：\n${p.questions.filter(q => q.status === 'open').map((q, i) => `${i + 1}. ${q.text}`).join('\n')}\n（由小萌宝整理，不是医生结论）`;
  openDialog('复诊摘要', `<pre class="summary-pre">${esc(txt)}</pre><p class="small-note">摘要是给你自己带去门诊的，不是病历，也不替代医生记录。</p>`, '<button data-action="close">关闭</button><button class="primary" data-action="copy-summary">复制文本</button>', '复诊准备');
}

/* ---------------- agent dock ---------------- */
function renderAgent() {
  if (!state.agent) return;
  const p = prof();
  $('#agent-body').innerHTML = `<div class="agent-note">原型里的对话是静态演示。接入 DSH 后，这里挂载宿主原生会话，可拖动调宽、隐藏后重开。</div>
    <div class="agent-card"><h4>本页可以这样问</h4><pre>帮我把最近 3 个月的排便次数和皮肤分级整理成一段话，我要带去复查。</pre></div>
    <div class="agent-card"><h4>边界</h4><pre>不做诊断、不建议用药、不判断是否需要停药。涉及处置的问题，整理成给医生的问题。</pre></div>`;
}

/* ---------------- events ---------------- */
document.addEventListener('click', (e) => {
  const flip = e.target.closest('[data-flip]');
  if (flip) {
    const key = flip.dataset.flip;
    if (flip.dataset.static === '1') return;
    if (state.flipped.has(key)) state.flipped.delete(key); else state.flipped.add(key);
    flip.dataset.flipped = String(state.flipped.has(key));
    flip.setAttribute('aria-pressed', String(state.flipped.has(key)));
    const back = flip.querySelector('.mface.back');
    if (back) back.setAttribute('aria-hidden', String(!state.flipped.has(key)));
    return;
  }
  const el = e.target.closest('[data-action],[data-view],[data-sub]');
  if (!el) return;
  const act = el.dataset.action;

  if (el.dataset.view) { state.view = el.dataset.view; state.sub = 0; state.metricPick = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (el.dataset.sub != null && !act) { state.sub = Number(el.dataset.sub); render(); return; }

  if (act === 'go') { state.view = el.dataset.target; state.sub = 0; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (act === 'agent') {
    state.agent = !state.agent;
    if (state.agent) $('#agent-dot')?.classList.add('on');
    render(); return;
  }
  if (act === 'agent-size') { state.agentSize = el.dataset.size; $$('.agent-sizes button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === state.agentSize))); render(); return; }
  if (act === 'agent-build') { toast('原型不调用模型；这里会生成"本页要点"草稿'); return; }
  if (act === 'agent-copy') { copyText('（原型）请帮我整理最近 3 个月的排便与皮肤记录，带去复查。'); return; }
  if (act === 'settings') { settingsDialog(); return; }
  if (act === 'about') { aboutDialog(); return; }
  if (act === 'profiles') { profileDialog(); return; }
  if (act === 'switch-profile') { state.profile = Number(el.dataset.idx); state.sub = 0; state.metricPick = null; state.flipped.clear(); render(); $('#dialog').close(); return; }
  if (act === 'close') { $('#dialog').close(); return; }
  if (act === 'toast') { toast(el.dataset.msg || '原型不写入数据'); return; }
  if (act === 'quick-add') { quickAddDialog(); return; }
  if (act === 'save-sim') { $('#dialog').close(); toast('已记录（模拟；原型不保存）'); return; }
  if (act === 'upload-sim') { toast('原型不读取文件；接入后从你选择的资料目录导入'); return; }
  if (act === 'open-doc') { const p = prof(); const d = p.docs.find(x => x.id === el.dataset.doc); if (d) openDialog(d.title, `<p class="small-note">${esc(d.type)} · ${cnDate(d.date)} · ${d.pages} 页 · ${esc(d.status)}</p><div class="photo-slot" style="height:180px">原件预览占位 · 原型不读取 PDF</div><p class="small-note">接入后在这里显示原文与解析对照；原件始终保留在资料目录。</p>`, '', '资料库'); return; }
  if (act === 'accept-cand' || act === 'reject-cand') { const i = Number(el.dataset.idx); const p = prof(); if (p.candidates[i]) { p.candidates[i].status = act === 'accept-cand' ? 'accepted' : 'rejected'; toast(act === 'accept-cand' ? '已接受（模拟），将写入对应表' : '已拒绝（模拟）'); render(); } return; }
  if (act === 'add-symptom' || act === 'add-bowel' || act === 'add-skin') { quickAddDialog(); return; }
  if (act === 'add-question') { openDialog('加一个问题', `<label class="form-label">要问医生的问题</label><textarea placeholder="例：排便 3–4 次/日需要做肛门测压吗？"></textarea><label class="form-label" style="margin-top:10px">类别</label><select><option>肠道功能</option><option>皮肤护理</option><option>复查</option><option>造口护理</option><option>生活</option></select>`, '<button data-action="close">取消</button><button class="primary" data-action="save-sim">保存（模拟）</button>', '复诊准备'); return; }
  if (act === 'mark-asked') { const i = Number(el.dataset.q); prof().questions[i].status = 'asked'; toast('已标记为问过'); render(); return; }
  if (act === 'print-visit') { visitSummaryDialog(); return; }
  if (act === 'copy-summary') { copyText($('.summary-pre')?.textContent || ''); return; }
  if (act === 'viewpoint') { openDialog('记一条我的担心', `<p class="small-note">它会被标记为"你的看法，不是医生结论"，不进趋势，也不进摘要事实区。</p><textarea placeholder="例：我怕造口袋在开会时鼓起来。"></textarea>`, '<button data-action="close">取消</button><button class="primary" data-action="save-sim">保存（模拟）</button>', '看法'); return; }
  if (act === 'trial-filter') { state.trialFilter = el.dataset.filter; state.sub = 0; render(); return; }
  if (act === 'trial-save') { const k = el.dataset.key; if (state.savedTrials.has(k)) state.savedTrials.delete(k); else state.savedTrials.add(k); render(); toast(state.savedTrials.has(k) ? '已收藏' : '已取消收藏'); return; }
  if (act === 'trial-open') { const t = T.rows.find(x => x.key === el.dataset.key); if (t) trialDialog(t); return; }
  if (act === 'trial-open-url') { toast('原型不打开外链；原始登记页：' + el.dataset.url); return; }
  if (act === 'trial-source') { openDialog('临床数据来源与覆盖', `<div class="table-wrap"><table><thead><tr><th>通道</th><th>状态</th><th>说明</th></tr></thead><tbody>
    <tr><td>ClinicalTrials.gov（ctv）</td><td><span class="pill green">就绪</span></td><td>API v2 在线检索；3 条检索式，224 条去重后保留</td></tr>
    <tr><td>WHO ICTRP</td><td><span class="pill grey">未配置</span></td><td>本轮未接入，不算"已查过"</td></tr>
    <tr><td>ChiCTR 在线</td><td><span class="pill grey">未配置</span></td><td>离线语料仅覆盖胰腺癌，对本癌种无覆盖</td></tr>
    <tr><td>CDE（含 PI）</td><td><span class="pill grey">未配置</span></td><td>需 dry-run 同步</td></tr></tbody></table></div>
    <p class="small-note">数据截止 ${T.cutoff}；"0 条结果"不等于"不存在"。所有条目为登记状态，未核实。</p>`, '', '数据口径'); return; }
  if (act === 'help') { openDialog('原型操作说明', `<div class="flag-list"><div><span>左侧切一级页；页内页签切换二级内容。</span></div><div><span>「看板」与「一图秀」的指标卡可点击翻转，背面是迷你折线。</span></div><div><span>右上「AI 对话」打开右侧面板，可切窄/标准/宽，再点一次收起。</span></div><div><span>「大字 Aa」切换字号档；版本号在顶栏与页脚同源显示。</span></div><div><span>所有保存动作都是模拟，刷新即重置。</span></div></div>`, '', '帮助'); return; }
});

document.addEventListener('change', (e) => {
  const pick = e.target.closest('[data-pick]');
  if (pick) {
    const current = state.metricPick || prof().metrics.filter(m => defOf(m.key).kind === 'numeric').slice(0, 2).map(m => m.key);
    let next = current.includes(pick.dataset.pick) ? current.filter(k => k !== pick.dataset.pick) : [...current, pick.dataset.pick];
    if (next.length > 3) next = next.slice(-3);
    state.metricPick = next; render(); return;
  }
  if (e.target.id === 'font-toggle') return;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = e.target.closest?.('[data-flip]');
    if (card && card.dataset.static !== '1') { e.preventDefault(); card.click(); }
  }
  if (e.key === 'Escape' && $('#dialog').open) $('#dialog').close();
});

$('#font-toggle').addEventListener('click', () => { state.large = !state.large; render(); });
$('#dialog').addEventListener('click', (e) => { if (e.target.id === 'dialog') e.currentTarget.close(); });

/* ---------------- utils ---------------- */
let toastTimer;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}
function copyText(txt) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(() => toast('已复制'), () => toast('复制失败，请手动选择'));
  else toast('当前环境不支持自动复制');
}

/* boot：buildData 先于 init，bootFail 兜底不白屏 */
(function boot() {
  try {
    if (!D || !D.profiles?.length) throw new Error('demo data missing');
    render();
  } catch (err) {
    $('#main').innerHTML = `<div class="notice danger"><b>原型数据没有加载成功</b><br>${esc(err.message)}。请确认 demo-data.js 与 index.html 在同一目录。</div>`;
    console.error(err);
  }
})();
