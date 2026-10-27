# CHANGELOG

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
