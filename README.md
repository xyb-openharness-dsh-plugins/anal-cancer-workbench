# 小萌宝 · 肛管癌工作台（AnalPal）

本机优先的肛管癌（肛管鳞癌）放化疗副作用、肠道与排粪功能、造口生活与复查准备工作台。

**当前版本 `0.1.0`，处于 ZERO-TO-DEV 阶段 3.1（设计确认前）。**
原型与数据模型已完成，**尚未进入开发版，也未装机**。G1 需求 / G2 原型 / G3 数据模型三道闸口**均待签**。

## 这一轮交付了什么

| 交付物 | 位置 |
| --- | --- |
| 交互原型（12 个一级页 / 25 个二级页） | `prototypes/v0.2/index.html` |
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

## 检查链

需要 Node.js 22+（`node:sqlite`）。

```bash
NODE_OPTIONS= npm run check
```

依次执行：语法 → schema 冻结合同 → 文案红线 → 演示库列一致性 → 版本一致 → 包结构。
当前结果：**全绿**；`check:columns` 输出两条告警（`paired_measures`、`trial_notes` 有列无行，见「已知缺口」）。

单独重建演示库与资料包：

```bash
node demo/build-demo-data.mjs          # 重写 demo/demo-data.sqlite 与 demo-data.js
node scripts/fetch-anal-trials-2026.mjs --dry-run
node scripts/build-trials-excerpt.mjs  # 重写原型 trials-data.js 的 10 条选摘
```

## 已知缺口（写在这里，不藏在文档里）

- `paired_measures`（双侧腹股沟淋巴结短径）**建表但未播种**；四点位契约在原型上暂不可见，需 G3 评审确认口径后补。
- `trial_notes`（收藏的试验）为空，属合法空态。
- 临床资料包只有 ClinicalTrials.gov 一条通道；ICTRP / ChiCTR / ChinaDrugTrials 为 `not_configured`。
- 资料包是 **Cumulative 快照**（2003–2026），2026 年首次公示仅 14 条，口径见 `docs/CLINICAL-DATA-2026.md`。
- 开发版 `public/`、DSH 链路、装机、导出、MinerU 解析均未做。

## 文档入口

先读 [`docs/SPEC.md`](docs/SPEC.md) 了解服务谁、解决什么问题、明确不做什么；再看
[`docs/DIFF-MATRIX.md`](docs/DIFF-MATRIX.md) 了解与家族其他癌种刻意不同的 13 处；
数据层看 [`docs/SCHEMA.md`](docs/SCHEMA.md) 与 [`schema/freeze-contract.md`](schema/freeze-contract.md)；
执行约束看 [`docs/DEV-REQUIREMENTS-2026-10-21.md`](docs/DEV-REQUIREMENTS-2026-10-21.md)。

骨架约定仍适用：[AGENTS](AGENTS.md)、[CLI-GIT](docs/CLI-GIT.md)、[HTML 与数据契约](docs/14-HTML-AND-DATA-CONTRACT.md)。

## 待办（确认后进入阶段 3.2）

1. G1/G2 签认：用户逐页确认原型、DIFF-MATRIX 差异项、四条契约的肛管癌落点。
2. 开发版 `public/` + `dsh/*` readmodels，`test/ui-parity` 逐视图比对原型。
3. 补 `paired_measures` 播种与读模型，完成 G3。
4. 阶段 3.3：打包、装机、Desktop 重启人工确认。

Logo 来源与使用限制见 `assets/README.md`。许可证暂为 private/UNLICENSED，由维护者确认后调整。

感谢小x宝社区、DataElement 社区，以及 sam / hhx / 繁华的贡献。
