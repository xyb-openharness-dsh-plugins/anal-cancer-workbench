# 小萌宝 · 肛管癌工作台（AnalPal）

本机优先的肛管癌（肛管鳞癌）放化疗副作用、肠道与排粪功能、造口生活与复查准备工作台。

**当前版本 `0.2.0`，处于 ZERO-TO-DEV 阶段 3.2（开发版已跑通，未装机）。**
原型、数据模型与开发版前端均已完成；G1 需求 / G2 原型已于 2026-10-21 确认，G3 数据模型未开闸（仍只用模拟资料）。
装机（阶段 3.3）尚未开始。

## 这一轮交付了什么

| 交付物 | 位置 |
| --- | --- |
| 交互原型（13 个一级页 / 38 个二级页） | `prototypes/v0.2/index.html` |
| **开发版前端（同一份视图，走接口取数）** | `public/index.html`、`public/app.js` |
| 设计文档 | `docs/SPEC.md`、`docs/DIFF-MATRIX.md`、`docs/PATIENT-FLOW.md`、`docs/SCHEMA.md` |
| 临床资料包（224 条登记，快照 2026-10-21） | `research/anal-cancer/` |
| 数据模型（19 表 + 1 视图） | `schema/0001_initial.sql`、`schema/freeze-contract.md` |
| 演示档案（2 套 × 6 个月） | `demo/build-demo-data.mjs` → `demo/demo-data.sqlite` + `prototypes/v0.2/demo-data.js` |
| 页面截图 | `docs/shots/` |

## 怎么打开原型

```bash
# 方式一：直接打开（无需构建、无依赖）
open prototypes/v0.2/index.html

# 方式二：本地静态服务（避免部分浏览器对 file:// 的限制）
cd prototypes/v0.2 && python3 -m http.server 5173
# 浏览 http://127.0.0.1:5173
```

原型只读 `demo-data.js` 与 `trials-data.js` 两个静态夹具，不读写真实文件、不调用模型或宿主 API。
所有患者资料为**模拟数据**，临床试验为**登记摘录，状态未核实**。

## 怎么跑开发版

```bash
NODE_OPTIONS= npm start        # → http://127.0.0.1:5173/
```

页面在 `/`，接口在 `/api/health`、`/api/bootstrap`；数据来自 `dsh/demo-data.json` +
`dsh/trials-data.json`，返回体 `meta.source = "demo-fixture"`，不假装在读真实资料目录。
装进 Desktop 后页面在 `/api/anal-cancer/ui/index.html`，接口在 `/api/anal-cancer/*`——
`public/app.js` 按自身路径推导 `API_BASE`，两种挂载都能用（`test/server.test.mjs` 之外，
另有 `/api/anal-cancer/ui/` 前缀挂载的无头核对）。

原型与开发版视图**必须逐字符一致**，由 `test/ui-parity.test.mjs` 守住：
13 视图 × 2 档案 × 38 个二级页 = 78 组比对，任一字符偏移都会报出首个差异位置。

## 检查链

需要 Node.js 22+（`node:sqlite`）。

```bash
NODE_OPTIONS= npm run check
```

依次执行：版本一致 → 语法 → schema 冻结合同 → 文案红线 → 演示库列一致性 → 单测（`test/*.test.mjs`）→ 版本核对 → 包结构。
当前结果：**全绿**，5 个测试通过；`check:columns` 仍有一条告警（`trial_notes` 有列无行，属合法空态）。

单独重建演示库与资料包：

```bash
node demo/build-demo-data.mjs          # 重写 demo/demo-data.sqlite 与 demo-data.js
node scripts/fetch-anal-trials-2026.mjs --dry-run
node scripts/build-trials-excerpt.mjs  # 重写原型 trials-data.js 的 10 条选摘
```

## 已知缺口（写在这里，不藏在文档里）

- `paired_measures` 已播种 8 行（2 档案 × 2 次 × 左右）；陈女士 2026-09-02 右侧为 NULL，用于演示"缺侧不计算差值"。
- `trial_notes`（收藏的试验）为空，属合法空态。
- 临床资料包只有 ClinicalTrials.gov 一条通道；ICTRP / ChiCTR / ChinaDrugTrials 为 `not_configured`。
- 资料包是 **Cumulative 快照**（2003–2026），2026 年首次公示仅 14 条，口径见 `docs/CLINICAL-DATA-2026.md`。
- 开发版读的是 `dsh/*.json` 演示夹具，**没有接真实资料目录**（G3 未开闸）。
- DSH 客户端入口用 iframe 方案（标准分栏、`businessWidth 0.65`），未启用 customFrame 原生会话。
- 装机、导出、MinerU 解析均未做。

## 文档入口

先读 [`docs/SPEC.md`](docs/SPEC.md) 了解服务谁、解决什么问题、明确不做什么；再看
[`docs/DIFF-MATRIX.md`](docs/DIFF-MATRIX.md) 了解与家族其他癌种刻意不同的 13 处；
数据层看 [`docs/SCHEMA.md`](docs/SCHEMA.md) 与 [`schema/freeze-contract.md`](schema/freeze-contract.md)；
执行约束看 [`docs/DEV-REQUIREMENTS-2026-10-21.md`](docs/DEV-REQUIREMENTS-2026-10-21.md)。

骨架约定仍适用：[AGENTS](AGENTS.md)、[CLI-GIT](docs/CLI-GIT.md)、[HTML 与数据契约](docs/14-HTML-AND-DATA-CONTRACT.md)。

## 待办（阶段 3.2 收尾 → 3.3）

1. ~~G1/G2 签认~~：2026-10-21 已完成（13 页、心理页独立、淋巴结按指南修正）。
2. ~~开发版 `public/` + `dsh/*` readmodels + `test/ui-parity`~~：已完成，5 个测试全绿。
3. G3 数据模型开闸：确认后才写真实资料目录（现在只有模拟库）。
4. 阶段 3.3：`npm pack` → 装到 Desktop harness profile → 重启人工确认。

Logo 来源与使用限制见 `assets/README.md`。许可证暂为 private/UNLICENSED，由维护者确认后调整。

感谢小x宝社区、DataElement 社区，以及 sam / hhx / 繁华的贡献。
