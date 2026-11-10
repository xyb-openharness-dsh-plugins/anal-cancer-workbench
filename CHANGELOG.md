## 0.2.10（2026-11-11，AI 对话面板激活修复）

- 会话判定改用宿主归属 `ownedSession()`（`ownsSession(currentSession())`），不再用 `Boolean(conversation)`（customFrame 下没会话也会传隐藏容器 → 判断恒为真 → 点了没反应）。
- 创建路径改 `service.newSession(workspaceId)`，工作区取 `service.defaultWorkspace?.()?.workspaceId`；无可用工作区时由宿主提示选目录；不再用 `ensureSession({})`。
- 取消目录选择不留空会话并提示可重试；创建失败在工作台内显示原因；订阅会话变化触发重渲染；草稿仍只填不发。
- 版本与生成物同步 0.2.10；新增 `scripts/check-agent-pane-contract.mjs` 入 check 链。
- **界面加载与真机点击待人工**（需退出重开 DSH Desktop 后新建会话走查）。

## 0.2.8 — 2026-10-27

- 分隔线交互统一：AI 面板分隔线加宽抓取区，悬停显示本工作台同色系增亮色与拖动把手（⠿）；拖动改用指针捕获，越过业务 iframe 不再丢事件。

# CHANGELOG

## 0.2.7 — 2026-10-27（customFrame 实机复核：空白会话区 + 页签被裁）

用户在 0.2.5 上截图确认「可以打开了」——frame header 与右侧「收起 AI 对话」都出来了，
customFrame 生效。截图同时暴露两个真问题：

### ① 右侧一块空白白板（真 bug）

`hasConversation` 原来写成 `Boolean(conversation)`。宿主在**本工作台 active 时恒传非空的
`conversation` 节点**（一个 display:none 的容器），所以这个判据永远为真：右侧永远挂一块空白板，
顶栏永远写「收起 AI 对话」，明明一个会话都没有。

- 改为按**会话归属**判定：`currentSession()` + `ownsSession(id)`；
- `desktopWorkbenches.subscribe` 回调里 `setSessionTick(+1)`，新会话建立/切换后重算；
- `test/client.test.mjs` ④ 加回归用例：`conversation` 非空但无归属 → `aside` 必须 display:none。

### ② 一级页签被裁掉（真 bug）

`@media(max-width:900px)` 把 `#nav` 改成 `flex-direction:row; overflow-x:auto`。customFrame 下业务区
常是窗口的 65%（1080 → 700px），8 个页签单行放不下（实测 `scrollWidth 1468 / clientWidth 668`），
而 macOS 覆盖式滚动条不滚就不显示——右侧「肛周皮肤」等页签看着像被裁、也点不到。

- 改成 `flex-wrap: wrap`：936/820/700/620 四档实测 `scrollWidth == clientWidth`，`body.scrollWidth == innerWidth`，无横向溢出。

### ③ 页面顶栏那颗「AI 对话」pill 口径不对

嵌在面板里时它显示「未进入激活」，像没接上。改为「点此打开 / 已打开」，
状态由外壳 postMessage `anal:agent-state` 回告（只认 parent + 同源）。

### 验证

`npm run check` 全绿；`client.test.mjs` 4/4（含新回归）；936/820/700/620 四档无横向溢出。
**frame header 的真实渲染仍只能在 Desktop 里看**——本机无 react/react-dom，渲染不了。

## 0.2.6 — 2026-10-27（把「AI 对话」入口接到页面顶栏 + 品牌图标）

用户装 0.2.5 后反馈：**「topbar 没有 ai 对话按钮」**。

### 变更

- **页面顶栏那颗「AI 对话」按钮原来是死的**：`data-action="agent"` 只切换本页的演示 dock
  （`#agent-dock`，点「整理本页要点」只 toast「原型不调用模型」），在 DSH 面板里既开不出原生会话，
  也没有任何提示。现在：`window.self !== window.top` 时 postMessage `{type:'anal:open-agent'}` 给外壳，
  由 `lib/client.js` 调起/收起原生会话；独立浏览器打开仍走演示 dock，不假装接了模型。
- `src/client.js` 接收 `anal:open-agent`：先验 `event.source === iframe.contentWindow` 与同源，
  再按 `currentSession()`/`ownsSession()` 决定是"打开已有会话"还是 `ensureSession` 新开。
  用 ref 持有 handler，避免闭包停在首帧的 `hasConversation`/`canOpenSession`。
- 品牌图标：`🪷`（小莲宝的莲花）→ `🧡`，header 与 register 两处。
- 版本 0.2.5 → 0.2.6（同时用来让宿主按新版本重新读取客户端，排除旧构建缓存）。

### 仍未证实的

0.2.5 的 frame header（含右侧「AI 对话 / 收起 AI 对话」按钮）**是否真的画出来了，本地无法验证**——
宿主 renderer 内置 React，本机没有可复用的 react/react-dom，`test/client.test.mjs` 只能验入口契约与
组件树结构（4/4 过），验不了"在 Desktop 里长什么样"。用户在 0.2.5 上说没有按钮，两条可能：
① 应用没完全退出重开，加载的还是 0.2.4 的 client.js；② customFrame 生效但 header 被外层容器压掉。
本版把入口同时挂到页面顶栏，①和②都有一条可用路径。

## 0.2.5 — 2026-10-27（装机后两个实机缺陷：版本号 + 面板形态）

用户装 0.2.4 后截图反馈：**「这个 tar 包有 bug 吧，版本号也不对，是不是没装对，而且中间是工作台位置，
右边是拉起 ai 对话框」**。两条都是真缺陷，都不是"没装对"。

### ① 版本号显示 v0.1.1（真 bug）

`public/index.html` 把 `开发版 v0.1.1` 写死在顶栏 `.prototype-bar` 里，`public/app.js` 只重写了
`#ver-chip` 与页脚 `#app-version`，没管那一行——`scripts/check-version.mjs` 也从不读 index.html，
于是 0.2.1→0.2.4 一路绿着漏过去。

- `public/index.html`：标题 / 顶栏 / 版本 chip / 页脚四处**一律不写版本号**（占位 `v—`），
  顶栏加 `id="runtime-line"`。
- `public/app.js`：由 `APP_INFO.version` 渲染 `#runtime-line b`。
- `scripts/check-version.mjs`：新增断言——`public/index.html` 出现任何 `vX.Y.Z` 字面量即失败；
  且必须存在 `#runtime-line`。同类错误不能再靠肉眼发现。

### ② 面板形态不对（真 bug）：标准分栏 → customFrame

原来 `lib/layout.js` 的 `CUSTOM_FRAME = false`。标准分栏下宿主自己画会话区：业务区被拉满、
顶栏没有 AI 按钮、右侧会话区不可调，**中间那块本该是工作台的位置被原生会话占着**。
与乳腺癌（PinkyPal）、小莲宝（CerviPal）、小胆宝（BiliPal）三家不一致。

- `lib/layout.js` 改为 starter 形状：`PANEL`（left / 0.65 / **customFrame: true**）、`HOST_LIMITS`、
  `AGENT_PANE`（0.25–0.45，默认 0.35）、`clampAgentRatio`、`businessPanePx`、`assertPanelConfig`。
- 新增 `src/client.js` + `scripts/build-client.mjs`：客户端改为**生成物**，包名 / 仓库 / 接口前缀 /
  版本号 / 面板参数全部在构建期注入，`npm run check` 里跑 `--check` 防漂移。
- `lib/client.js` 由裸 iframe 换成自绘：语义 `<header>`（避让 `--dsh-frame-leading-clearance`、
  品牌 + 版本 + AI 对话按钮）→ 业务 iframe → 会话 `<aside>` → 可拖 splitter（`role="separator"`、
  键盘 ←/→、0.25–0.45、窄于 760px 转抽屉）。三条硬约束：会话区**始终挂载**只切 `display`；
  无会话时业务照常可用；会话归属只问 `currentSession()`/`ownsSession()`，不拿 `conversation` 判空。
- 新增 `test/client.test.mjs`（4 条）：非 ESM / 只依赖 react / register 参数 / Panel 结构。
- `test/ui-parity.test.mjs` 的面板参数断言改写为读 `PANEL` + 校验生成物。
- 配色换成本项目主色：#EE7B1E 主按钮、#FCF9F5 底、#8A4B12 品牌字（原来是青绿 #18AFA5）。

### 验证

`npm run check` 全链绿（含 `build-client --check`）、单测 `client.test.mjs` 4/4、链接断言 28/28。

## 0.2.4 — 2026-10-27（NCCN 两条都要：患者版 PDF + 临床版入口）

用户原话：「**nccn 的两个都要，患者版pdf+指南页面（患者自己去注册）**」。
0.2.3 只留了患者版 PDF，把临床版从表里挤掉了——用户想知道临床版在哪，自己去注册。

### 变更

- evidence 表由 5 行改 6 行，NCCN 占两行：
  | 行 | 原件列 | 说明 |
  | --- | --- | --- |
  | NCCN 患者版 | `{ kind: 'pdf', url: …anal-patient.pdf }` → 「已取得：官方患者版 PDF」 | 43 页，直接下载 |
  | NCCN 临床版 | `{ kind: 'hub', entry 语义, url: …guidelines-detail?category=1&id=1414 }` → 「官方入口 · 需自行注册」 | 全文需在 NCCN 官网注册后取得，本台未取得 |
- 新增第三种来源状态 **`entry: true`**（官方入口页，读者须自行注册）：渲染「官方入口 ↗ 需自行注册」，
  必须带 `note`，不得写「已取得」。模式层 `primer.js` 与 starter `assets/patterns/disease-primer.js` 同步。
- `scripts/check-primer-links.mjs` 换为 starter 1.10.0-rc.3 版：新增 **L12**（`entry` 缺 note／缺 https；
  表格里 `kind: 'hub'` 却写「已取得」判入口页冒充原件），`--self-test` 由 8 条增至 10 条。
- `docs/CLINICAL-DATA-2026.md` 原件核对表新增「NCCN（临床版）」一行，标「未取得 · 需注册」。

### 验证

- 结构断言 **29 项 / 28 通过 / 0 失败**；`--self-test` **10/10**。
- `--http`：NCCN 患者版 `application/pdf` 200；NCCN 临床版入口 200；ESMO 全文页 403（WARN，需人工确认）。
- 探针 `--url prototypes/v0.2/index.html` 9/9。

## 0.2.3 — 2026-10-27（闸门补齐：链接必须是文件本身）

0.2.2 把原件找齐了，但闸门仍只验「有没有 https 链接」——**闸门本身没修，下一台还会犯同一个错**。
本版把闸门升级为 starter 1.10.0-rc.2 版并回填 `kind`。

### 变更

- `scripts/check-primer-links.mjs` 换为 starter 新版：L7 原件必须声明 `kind`（`pdf`/`fulltext`/`registry`/`dataset`，
  栏目页记 `hub` 且不得配 `original: true`）；L8 `kind: pdf` 必须像 PDF；L9 栏目页冒充原件直接判失败；
  `--http` 增 L10（**`kind: pdf` 实测拿到 `text/html` = 登录页/反爬页冒充 PDF，判失败**）与 L11（404/410 失败；
  403/429/5xx 报 WARN 且不计通过）。附 `--self-test` 8 条反向对照。
- `primer-data.js`（原型与 `public/` 同源）13 处来源与 5 行表格补 `kind`：
  NCCN `pdf`／CACA `fulltext`／ESMO `fulltext`／AJCC（二次来源）`pdf`／ClinicalTrials `registry`。
- **ESMO 的 url 从 `esmo.org` 栏目页换成期刊全文页**（`annalsofoncology.org/article/S0923-7534(21)02064-0/fulltext`）——
  原链接按新规则属 `hub`，不能算原件；该站对脚本 403，`--http` 报 WARN，浏览器可直接打开。
- `package.json` 新增 `check:primer-links:http`。

### 验证

- `node scripts/check-primer-links.mjs`：26 项结构断言全过。
- `node scripts/check-primer-links.mjs --http`：30 通过 / 0 失败 / **1 待人工确认**（ESMO 403 反爬）。
  NCCN 患者版实测 `application/pdf`。
- `node scripts/check-primer-links.mjs --self-test`：8/8（每条规则都能报 FAIL）。

## 0.2.2 — 2026-10-27（指南原件落实：不再用「未取得」交差）

0.2.1 的 evidence 表 4 行全部写成「未取得原件，据二次来源」，链接指向的只是学会首页/指南详情页，
**不是任何一份文件本身**。闸门（`check-primer-links.mjs`）只验 https 可达，不验「是否真拿到原件」，
所以 15/15 全绿而内容不合格。本版逐条实测补齐。

### 变更

- `primer-data.js`（原型与 `public/` 同源）evidence 表由 4 行改为 5 行，新增 **CACA 肛管癌**：
  | 机构 | 版本 | 原件状态 |
  | --- | --- | --- |
  | NCCN | V2.2026（患者版据该版改编） | **已取得**：官方患者版 PDF，43 页，直链可下 |
  | CACA | V1.0_2022（2022-03-31） | **已取得**：官网在线全文，逐页可读（下载需登录） |
  | ESMO | 2021（Ann Oncol 32:1087-1100） | **已取得**：官方指南页；全文页对脚本 403、浏览器可开 |
  | CSCO | 结直肠癌指南 2025 | **无**：合订本目录无肛管癌独立指南，无官方免费全文 → `nolink` |
  | AJCC | 第 8 版 | **部分**：肛管章节在付费手册内；官方免费仅第 1 章分期总则 PDF |
- ESMO 版本由「2026 更新（未核验）」改为实测的 **2021 版**；NCCN 由「2026 版（未核验）」改为
  **V2.2026**（据患者版 PDF 首页标注）；CSCO 由「CSCO 肛管癌/结直肠癌指南」改为「肛管癌未单独成册」。
- `definition` / `landscape` / `trend` 三段的来源行同步换成实链；`trend` 段第 3 条由「均未核验」
  改为「已确认三份 + 仍未核验两项（CSCO 2026 状态、ESMO 是否已有更新版）」。
- `docs/CLINICAL-DATA-2026.md` §四由三行「未核验」改为原件核对表，逐行记状态与链接。

### 链接（2026-10-27 逐条 curl 实测）

- NCCN 患者版 PDF — `https://www.nccn.org/patients/guidelines/content/PDF/anal-patient.pdf` — 200 / application/pdf / 1,266,276 B / 43 页
- CACA 肛管癌 V1.0_2022 — `https://cacaguidelines.cacakp.com/pdflist/detail?id=37` — 200 / text/html
- ESMO 官方指南页 — `https://www.esmo.org/guidelines/esmo-clinical-practice-guideline-anal-cancer` — 200 / text/html
- AJCC 8th 分期总则 PDF — `https://www.facs.org/media/2zvlrdmi/ajcc_staging_rules_8th_ed.pdf` — 200 / application/pdf
- ClinicalTrials.gov 检索入口 — `https://clinicaltrials.gov/search?cond=anal%20cancer&aggFilters=studyType:int` — 200

### 已排除的假链接（记录以免重复踩）

- `https://www.nccn.org/professionals/physician_gls/pdf/anal.pdf` — 200 但为 79 KB HTML 登录页，非 PDF（临床版需订阅）
- `https://s3-eu-west-1.amazonaws.com/.../ESMOPG2023_LGI_...pdf` — 真 PDF，但为 2023 年 Lower GI 口袋指南汇编，非肛管癌 CPG 本体
- `https://doi.org/10.1007/978-3-319-40618-3_18`（AJCC 8th 肛管章节）— 页面标题为 "Deleted"
- `https://www.facs.org/media/*anal*ajcc*.pdf` — 各命名均 404

### 未做

- `check-primer-links.mjs` 仍只验「有没有 https 链接」，不验「链接是不是文件本身」；本版靠人工实测补位，
  闸门缺口未修（改闸门要动 starter 与全家族，另立任务）。
- 装机副本未刷新（V2 装机层未验）。

## 0.2.1 — 2026-10-27（36 号 v2 补齐：指南可点 + 状态卡）

按 starter `prompts/PRIMER-BACKFILL.md` 与 `docs/36-DISEASE-PRIMER.md` §2.1 / §2.5 / §2.6 补齐。

### 变更

- 模式三件套同步到 starter 2026-10-27 链接版：`prototypes/v0.2/primer.js` / `primer.css`；
  并在 `public/` 新增同版 `primer.js` / `primer.css` / `primer-data.js`（开发版顶栏「?」可打开）。
- `primer-data.js`（原型与 `public/` 同源）：
  - evidence 表 4 行「原件」列由纯文字改为 `{ text, url }` 可点对象；
  - 8 条 sources 按 §2.5 补 `url` / `secondaryUrl`（对外链接 5 个，去重后全部实测 OK）；
  - 项目内文档（SPEC / CLINICAL-DATA-2026）3 条显式 `nolink: true` + `note`，不伪造外链。
- 看板首卡新增 §2.6 病程状态卡四件：卡头 eyebrow（`D+N 状态卡 · 距…`）／锚点派生大字天数
  （按 `care.started` 起算，不手填；无锚点显示「待初始化」并指向三步初始化）／现状行
  （阶段原文 + 状态 + 下次日期与事项）／出口按钮排（主按钮进当前阶段核心页 + 副按钮打开疾病概要）。
  原型与开发版视图逐字符同步（ui-parity 78 组合全过）。
- `scripts/check-primer-links.mjs`：L1–L6 通用链接断言；`npm run check` 末尾追加该检查。

### 链接（未取得原件，均据二次来源）

- NCCN · Anal Carcinoma 指南页 — `https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1414` — OK
- CSCO · 指南页（2025 版）— `https://meeting.csco.org.cn/enterprise/onlineshowproductinfo?pid=263` — OK
- ESMO · Anal Cancer CPG 页 — `https://www.esmo.org/guidelines/guidelines-by-topic/esmo-clinical-practice-guidelines-gastrointestinal-cancers/anal-cancer` — OK
- AJCC / FACS — `https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/` — OK
- ClinicalTrials.gov 检索入口 — `https://clinicaltrials.gov/search?cond=anal%20cancer&aggFilters=studyType:int` — OK

未取得项：NCCN / CSCO / ESMO 2026 版与 AJCC 第 8 版原件均未取得（只链官方/学会页，页码待核）；
CSCO 所链为其官方 2025 版页，2026 版状态仍记为「未核验」。项目内文档 3 条无外网链接（nolink）。

## 0.2.0 — 2026-10-21（阶段 3.2：开发版）

G2 确认后进入开发版：一份前端、两种挂载、接口取数，视图代码与原型逐字符对齐。

### 新增

- `public/`：开发版前端（`index.html` / `app.js` / `style.css` / `shell.css` / `assets/brand/analpal-logo.jpg`）。
  `app.js` 由原型派生，只有数据入口改为 `fetch(API_BASE + '/bootstrap')`；`API_BASE` 按自身路径推导，
  `/`（dev-server）与 `/api/anal-cancer/ui/index.html`（Desktop）两种挂载都能用。
- `dsh/readmodels.js`：读 `dsh/demo-data.json` + `dsh/trials-data.json`，返回体带 `meta.source = "demo-fixture"`。
- `dsh/server.js`：零依赖 HTTP 层（`safeJoin` 防越界、未知 `/api/*` 回 JSON 404、只读 GET/HEAD）。
- `dsh/index.js` 改为前缀注册 `/api/anal-cancer`（health / bootstrap / `/ui/*` 静态页），先过宿主鉴权回执。
- `lib/layout.js`（面板参数唯一来源）、`lib/client.js`（iframe 标准分栏，`businessWidth 0.65`）、`lib/version.js`。
- `scripts/dev-server.mjs`（`npm start`，默认 5173）、`scripts/build-version.mjs`。
- `test/ui-parity.test.mjs`：13 视图 × 2 档案 × 38 个二级页 = 78 组逐字符比对；
  面板参数与客户端字面量副本一致性断言。
- `test/server.test.mjs`：bootstrap 结构（9 指标 / 10 试验 / 每档案 4 条淋巴结）与演示库不脱节、
  `v_paired_delta` 缺侧 delta 为 NULL。
- `package.json`：`start` / `build:version` / `test` / 各项 `check:*`，`files` 增 `public`、`schema`、`scripts`。

### 变更

- `npm run check` 链变为：版本一致 → 语法 → 冻结合同 → 文案红线 → 列一致性 → 单测 → 版本核对 → 包结构。
- 版本 `0.1.1` → `0.2.0`；原型冻结在 `0.1.1`（G2 基准不随开发版前移）。

### 测试

- `npm run check` 全绿，5 个测试通过。
- 无头核对：13 个一级页全可达、`bodyOverflow 0`、0 console error、0 请求失败；切档案可到"周先生"。
- 前缀挂载核对：`/api/anal-cancer/ui/index.html` 下 `API_BASE` 正确回到 `/api/anal-cancer`，
  `style.css` / `shell.css` / logo 均 200。

## 0.1.1 — 2026-10-21（首轮意见回改）

按用户 2026-10-21 的四条确认修改。

### 新增

- **独立「心理支持」一级页**（3 个二级页）：情绪记录（PHQ-9 / GAD-7 自评）、病友与家属、求助路径。
  自评量表常驻"不是诊断"；自伤念头只给求助路径，不做评估结论。一级页 12 → 13。
- 新增指标 `phq9` / `gad7`（数值型，仅心理页显示），演示档案各 4–6 个点。
- 「我的分型 → 分期与淋巴结」新增**双侧腹股沟淋巴结短径**表：左右分列、缺侧显示"不计算"。
- `paired_measures` 播种 8 行，含 1 行右侧 NULL，用于证明 `v_paired_delta` 缺侧返回 NULL。

### 变更

- 四点位口径按指南修正：RECIST 1.1 短径测量法（≥15 mm 才作为病理性增大考虑），
  只规定测量与存储，不生成 N 分期结论；用户已确认（DIFF-MATRIX D10、SCHEMA §1）。
- DIFF-MATRIX D7 由"不设心理页"改为"保留独立心理页"，并保留造口与生活的三个具体场景。

### 测试

- 无头浏览器：13 个一级页可达，心理 3 个二级页穷举，0 console error、0 请求失败、无横向溢出。
- 新增截图 `16-psych`、`17-psych-family`、`18-psych-help`、`19-profile-nodes`、`20-dashboard-13nav`、`21-psych-b`。

## 0.1.0 — 2026-10-21（阶段 3.1：设计确认前）

首个可评审版本。原型 + 数据模型 + 临床资料包，未进入开发版、未装机。

### 新增

- 交互原型 `prototypes/v0.2/`：12 个一级页、25 个二级页、AI 面板三档、3D 指标卡、一图秀（900×372，单调三次插值，末点 13px 避让，分类序列只画节点）。
- 数据模型 `schema/0001_initial.sql`：19 张表 + `v_paired_delta` 视图；四条契约落地（看法无 `is_conclusion`、缺侧差值为 NULL、诊断更正只新增版本、事实四层不合并）。
- 演示数据 `demo/build-demo-data.mjs`：2 套档案 × 6 个月窗口，85 个指标点、11 个事件。
- 临床资料包 `research/anal-cancer/`：224 条干预性研究（ClinicalTrials.gov API v2，快照 2026-10-21），含 manifest、jsonl、sqlite、README。
- 设计文档：`SPEC`、`DIFF-MATRIX`（13 处刻意差异）、`PATIENT-FLOW`（3 条真实时刻）、`SCHEMA`、`CLINICAL-DATA-2026`、`DEV-REQUIREMENTS-2026-10-21`。
- 检查链：`check:syntax` / `check:schema` / `check:wording` / `check:columns` / `check:version` / `check:package`，`npm run check` 全绿。

### 修复（本轮实测暴露）

- 4 个视图的二级页签默认分支缺少 `sub` 条件，导致内容与标题错位。
- `labs` 前两段 sub 判断写反（血常规与肿瘤标志物互换）。
- 一图秀末点标签被裁切、事件标题压字、分类层与月份刻度重叠。
- 分类指标卡出现「0 级 分级 0/4」单位重复。
- 看板「最近事件」依赖数组顺序而非日期排序。
- 「造口与生活」导航计数误用造口日记条数。

### 已知缺口

- `paired_measures` 建表未播种；四点位契约在原型上不可见，待 G3 评审。
- 仅 ClinicalTrials.gov 通道；其余三通道 `not_configured`。
- 开发版、DSH 链路、装机、导出、MinerU 均未做。
