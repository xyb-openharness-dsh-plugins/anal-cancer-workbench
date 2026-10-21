# CHANGELOG

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
