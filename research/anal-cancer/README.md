# 肛管癌临床研究资料包（快照 2026-10-21）

本目录是**设计阶段的离线资料夹具**，服务于原型「临床研究」页与 `docs/CLINICAL-DATA-2026.md`，不参与运行时读写。

## 文件

| 文件 | 说明 |
| --- | --- |
| `trials-2026.jsonl` | 224 条干预性研究，一行一条 JSON |
| `anal_cancer_trials_2026.sqlite` | 同一批数据的关系库：`trial_records`（224 行）、`trial_sources`（6 行通道终态）、`collection_meta` |
| `manifest.json` | 口径、通道状态、记录数、两份 sha256 |

采集脚本：`../../scripts/fetch-anal-trials-2026.mjs`
选摘脚本：`../../scripts/build-trials-excerpt.mjs`（生成 `prototypes/v0.2/trials-data.js` 的 10 条）

## 三条必须记住的口径

1. **累计登记快照，不是"2026 年新试验"**。文件名里的 2026 是快照年份；2026 年首次公示只有 14 条，最早一条 2003 年。
2. **只有 ClinicalTrials.gov 一条通道**。ICTRP / ChiCTR / ChinaDrugTrials 均为 `not_configured`，`trial_sources` 里有原始状态，别把"没查到"说成"没有"。
3. **登记 ≠ 有效 ≠ 安全 ≠ 可入组**。含中国站点的 15 条只代表登记里写了中国站点，不代表国内可参加。

## 快速核对

```bash
node -e "
const {DatabaseSync}=require('node:sqlite');
const db=new DatabaseSync('research/anal-cancer/anal_cancer_trials_2026.sqlite');
console.log(db.prepare('select count(*) n from trial_records').get());
console.log(db.prepare('select status,count(*) n from trial_records group by 1 order by n desc').all());
"
wc -l research/anal-cancer/trials-2026.jsonl
shasum -a 256 research/anal-cancer/trials-2026.jsonl research/anal-cancer/anal_cancer_trials_2026.sqlite
```

期望：`224`；jsonl 行数 `224`；哈希与 `manifest.json` 一致。

## 重跑

```bash
node scripts/fetch-anal-trials-2026.mjs --dry-run   # 只看命中/剔除
node scripts/fetch-anal-trials-2026.mjs             # 真写文件，哈希会变
node scripts/build-trials-excerpt.mjs               # 重建原型选摘
```

重跑后必须同步更新 `manifest.json` 的哈希与 `docs/CLINICAL-DATA-2026.md` 的统计数字。
