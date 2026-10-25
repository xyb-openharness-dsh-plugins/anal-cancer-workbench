# 疾病概要 · 肛管癌

> 本项目实例文件，由 `xyb-workbench-starter` 的 `templates/DISEASE-PRIMER.md` 复制而来。
> 规范：`docs/36-DISEASE-PRIMER.md`。四段固定、顺序不变，缺段不合格。

- 项目 / 品牌：小萌宝 AnalPal
- 病种：肛管癌（Anal Cancer；项目聚焦肛管鳞状细胞癌，ASCC）
- 最后更新：2026-10-25
- 数据文件：`prototypes/v0.2/primer-data.js`（`window.DISEASE_PRIMER`）
- README 对应段：`## 疾病概要`
- 实现：`prototypes/v0.2/primer.js` + `primer.css`（来自 starter `assets/patterns/`，逻辑未改）
- 探针：`node scripts/probe-disease-primer.mjs --port 8131 --url http://127.0.0.1:8131/prototypes/v0.2/index.html` → 9/9 PASS

## 0 原件状态（本项目的前提）

NCCN / CSCO / ESMO / AJCC 四份文件的**原件均未取得**。
其中三份 2026 版指南的更新状态，`docs/CLINICAL-DATA-2026.md`「2026 指南监测入口」原文记为「未核验」，本文件照抄，
不写成「已按最新指南设计」。AJCC 第 8 版的出版年份也未在项目文档里核实，只标「第 8 版（出版年份未核实）」。

## 1 定义（`definition`）

肛管癌是发生在肛管区域的恶性肿瘤；本项目聚焦其中最常见的组织学类型——肛管鳞状细胞癌（ASCC）。
肛缘与肛管在解剖与分期上分开处理；项目分型页同时保留「肛管腺癌」字段，本轮不展开其独立路径。

- 分期口径：项目界面与临床试验条件统一使用 AJCC 第 8 版（AJCC 8th / AJCC v8），分期组由医生判定。
- 档案字段：组织学分级、HPV 状态（HPV16 阳性 / 阴性）、HIV 状态；只作记录，不推导结论。
- 淋巴结口径：RECIST 1.1 短径测量法（短径 ≥15 mm 才作为病理性增大考虑），任一侧缺失时不计算差值；是否属于区域淋巴结受累由医生结合 AJCC 8th 判断。
- 覆盖段落（项目 SPEC）：根治性放化疗期间、治疗结束后 0–24 个月随访、放化疗未控后手术并留造口、复发或转移后系统治疗。

**来源**：AJCC · Cancer Staging Manual, 8th ed.（肛管章节）· 第 8 版（出版年份未核实）· 未取得原件，据二次来源 · 页码待核 ｜ 本项目 · docs/SPEC.md 与 docs/CLINICAL-DATA-2026.md · 2026-10-21 版 · 项目文档

## 2 医学资料规范和指南情况（`evidence`）

| 机构 | 文件 | 版本 / 年份 | 原件 | 本台的用途 |
|---|---|---|---|---|
| NCCN | NCCN Guidelines · Anal Carcinoma | 2026 版（更新状态未核验） | 未取得原件 | 分期检查、放化疗与随访路径的并列引用；条目级页码待核 |
| CSCO | CSCO 肛管癌 / 结直肠癌诊疗指南 | 2026 版（状态未核验） | 未取得原件 | 国内可及药物与本土实践差异；本版暂不作引用依据 |
| ESMO | ESMO Clinical Practice Guidelines · Anal Cancer | 2026 更新（状态未核验） | 未取得原件 | 欧洲口径的并列参照；本版暂不作引用依据 |
| AJCC | Cancer Staging Manual, 8th ed.（肛管章节） | 第 8 版（出版年份未核实） | 未取得原件 | TNM 分期与区域淋巴结口径；界面只显示医生给出的分期原文 |

- 一台一表，不合并；未取得原件的必须标出来。
- 三份 2026 版指南状态来自 `docs/CLINICAL-DATA-2026.md`，原文写「未核验」，核验前不引用具体条文。
- 临床研究条目来自 ClinicalTrials.gov 登记摘录，状态与最近更新日期逐条显示。

**来源**：见上表逐行。

## 3 目前治疗全景概要（`landscape`）

按病期与线序分组，只列指南列举过的手段，不排序、不比优劣、不含剂量与疗程。

### 3.1 局限期（以根治性放化疗为主路径）
- 根治性放化疗：项目 SPEC 记录的同步方案写法为 5-FU / 卡培他滨 + 丝裂霉素，放疗技术为 IMRT。
- 局部切除：仅见于极早期或特定病灶的情形，是否适用由外科与病理判断。

### 3.2 放化疗未控或复发后
- 腹会阴联合切除（APR）：术后留有永久性结肠造口；造口生活是单列记录模块。
- 复发或转移后的系统治疗：只做信息整理与临床试验线索，不判断疗效、不比较方案。

### 3.3 贯穿全程
- 症状与功能：肛周皮肤、排粪次数与性状、造口底盘与皮肤状态，按日期与原文记录。
- 复查节奏：影像、内镜与肿瘤标志物间隔按主诊医嘱，只整理成时间线。
- 心理支持：独立模块，不做量表判读、不与人比较。

**固定出口（原话照抄）**：

> 以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。

**来源**：NCCN · NCCN Guidelines · Anal Carcinoma（2026 版，未核验）· 未取得原件，据二次来源 · 页码待核 ｜ 本项目 · docs/SPEC.md · 2026-10-21 版 · 项目文档

## 4 发展趋势（`trend`）

只写已发生的事实，每条带日期或版本号。

1. 截至 2026-10-21：本项目自采 ClinicalTrials.gov 肛管癌干预性研究累积登记快照 224 条（三条检索式并集，去重后 224 条；2026-01-01 之后首次公示的 14 条）。分期分布：PHASE2 76、PHASE3 20、PHASE1 41、NA 70、PHASE1/2 13、PHASE2/3 2、EARLY_PHASE1 1、PHASE4 1。
2. 截至 2026-10-21：224 条中 RECRUITING 42 条、UNKNOWN 23 条；仅采 ClinicalTrials.gov 一条在线通道，ICTRP、ChiCTR、ChinaDrugTrials 本轮未配置，未命中不等于不存在。
3. 截至 2026-10-25：NCCN Anal Carcinoma 2026 版、CSCO 肛管癌 / 结直肠癌指南 2026 版、ESMO Anal Cancer 2026 更新的状态均记为「未核验」。
4. 分期体系：项目界面与临床试验条件统一使用 AJCC 第 8 版（AJCC 8th / v8）；第 7 版何时被取代、第 9 版是否存在，本台未核实。

**来源**：本项目 · docs/CLINICAL-DATA-2026.md（快照 2026-10-21）· 项目文档 ｜ ClinicalTrials.gov · API v2 检索 · 采集日 2026-10-21 · 一手登记数据 ｜ AJCC · 8th ed. · 未取得原件，据二次来源 · 页码待核

## 5 落地清单

- [x] `prototypes/v0.2/primer.css`（starter 原样复制）
- [x] `prototypes/v0.2/primer.js`（starter 原样复制，逻辑未改）
- [x] `prototypes/v0.2/primer-data.js`（四段数据）
- [x] `index.html` 三处引用（style.css 后 / trials-data.js 与 app.js 之间）
- [x] 顶栏「?」由模块自动插入 `.top-actions`（未手写按钮）
- [x] README 的 `## 疾病概要` 四段正文，小标题与数据文件一致
- [x] `node scripts/probe-disease-primer.mjs --port 8131 --url …/prototypes/v0.2/index.html` → 9/9 PASS
- [x] `node scripts/check-conformance.mjs .` 的 `primer/*` 四条 0 fail 0 warn

## 6 验收（P1–P8）

| 编号 | 判据 | 结果 |
|---|---|---|
| P1 | 顶栏有可点「?」，aria-label 说明四段 | ✅ 自动插入 `.top-actions` |
| P2 | 整页面板，四段顺序 定义 → 指南 → 治疗全景 → 趋势 | ✅ |
| P3 | 面板宽高 ≥ 视口 90% | ✅ |
| P4 | 打开压一条 history，`history.back()` 收起 | ✅ |
| P5 | 「返回」「关闭」两个独立入口 | ✅ |
| P6 | 关闭后焦点回触发按钮、滚动位置不变 | ✅ |
| P7 | Esc 只退一层 | ✅ |
| P8 | 四段齐全、每段有来源、趋势段无禁止词 | ✅ |

## 7 本项目教训

- **本项目最容易编的是指南版本**：肛管癌是少见癌种，人一顺手会写「NCCN V2.2026」。但项目文档里三份指南都只写「2026 版，未核验」，
  没有版本号、没有生效日。趋势段因此只写「状态未核验」，不写版本更替——**没核到就不能造一个更替出来**。
- **「根治性放化疗」是路径名，不是推荐**：写进治疗全景时要紧跟一句「药物、剂量与照射范围由医生决定」，
  否则读者会把路径名当成给自己排的方案。固定出口句放在整段末尾，不放在组内。
- **登记数字必须带口径与日期**：224 条是「干预性 + 三条检索式并集 + 仅 ClinicalTrials.gov + 截至 2026-10-21」，
  且 UNKNOWN 有 23 条。只报 224 会被读成「有 224 个机会」，所以状态分布与缺失通道一并写。
