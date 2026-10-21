# 数据模型（v0.1，映射 `schema/0001_initial.sql`）

> 冻结于 2026-10-21，sha256 见 `schema/freeze-contract.md`。此后改结构只能新增 `0002_*.sql`。
> 本文件是**写入语义**的说明；表结构以 SQL 为准。

## 1. 四条契约怎么落地

| 契约 | 落地方式 | 反例（不允许） |
| --- | --- | --- |
| ① 看法恒不为结论 | `viewpoints` 表**没有** `is_conclusion` 字段，只有 `recorded_by` / `about`；读模型不得把它并入指标或摘要事实区 | 把"我觉得括约肌坏了"写成 `diagnoses.note` |
| ② 缺失恒为 NULL | `paired_measures` 左右各一行；缺侧可写 `value_num=NULL` 或不写该行；`v_paired_delta` 用 `CASE WHEN ... IS NULL THEN NULL` 返回 NULL，**不返回 0** | 缺右侧时 `delta = left - 0` |
| ③ 更正只新增版本 | `diagnoses.version` + `supersedes_id`；`treatment_lines.seq` 唯一，路径切换新增下一行 | `UPDATE diagnoses SET t_stage=...` 覆盖旧值 |
| ④ 事实四层不合并 | `documents`（原件）→ `candidates`（候选）→ `metric_points`/`symptoms`/…（记录）→ 视图（指标） | 解析结果直接写 `metric_points`，不留候选 |

### 关于"四点位"的偏差（2026-10-21 已确认）

乳腺癌的"四点位 1–4、缺健侧不生成差值"在肛管癌**没有对应测量**。
本模型保留契约的**语义**（成对测量、缺一侧不生成差值），载体换成 `paired_measures`：

- 当前唯一用途：双侧腹股沟淋巴结短径（`measure_key='inguinal_node_short_axis'`）。
- **测量口径（用户 2026-10-21 确认，参考指南修正）**：按 RECIST 1.1 的淋巴结短径法测量，单位 mm；
  短径 **≥15 mm** 才作为病理性增大考虑，**<10 mm** 视为正常大小；介于两者之间由医生结合影像判断。
  这里只规定"怎么量、怎么存"，**不据此生成 N 分期结论**——分期仍按 AJCC 8th 由医生判断。
- 缺侧的行可以存在但 `value_num` 为 NULL（表示"这次没测/报告未单列"），视图返回的 `delta` 必须为 NULL。
- 读模型必须判断 `delta === null`，不能把 null 当 0。
- 原型已在「我的分型 → 分期与淋巴结」展示左右短径与差值；缺侧显示"不计算"。
- 若后续评审认为该字段不需要，可整表删除（不影响其它表），但**不得**改成单侧字段 + 隐式 0。

## 2. 表分组

### 档案层
- `profiles`：一人一行；`profile_key` 为稳定主键（不用姓名）。
- `preferences`：字号、默认页等偏好，与业务事实分开。

### 诊断与治疗
- `diagnoses`：一次诊断一条版本；`histology` / `primary_site` / `t_stage` / `n_stage` / `m_stage` / `hpv_status` 各自独立列，不拼成一个字符串。
- `treatment_lines`：`seq` + `intent`（definitive / salvage / palliative）+ `modality`；`supersedes_id` 指向被替代行。
- `events`：治疗、检查、就诊的时间点；`detail_json` 只放原文摘录，不放推断。

### 四层事实
- `documents`：`source_path` 是用户资料目录内的相对路径；`sha256` 用于去重；`parse_status` 四态。
- `candidates`：`status` 三态（pending/accepted/rejected）；`accepted_record` 记录落到哪张表哪一行（如 `metric_points:12`）。
- `metric_points`：`value_num`（数值）与 `ordinal_value`（分类序位）**互斥**；`entered_by` 区分 user/import/demo。
- `metric_defs` / `metric_scales`：指标定义与分类量表（RTOG 皮肤、造口排出性状）。

### 本癌种专属
- `symptoms`：`ctcae_term` + `grade` 1–5；一个症状可多次出现（不同 onset）。
- `bowel_logs`：每日一行；`bristol_type` 1–7、`urgency` 0–3、`tenesmus` 0–3、`incontinence_episodes` 次数。
- `skin_assessments`：`site` 默认 `perianal`；`rtog_grade` 0–4、`ctcae_grade` 1–4、`moist_desquamation` 0/1、`pain_nrs` 0–10。
- `ostomy_logs`：`output_count` + `consistency`（formed/semi/liquid）+ `leaks` + `skin_grade`。
- `followups`：`dre_done` / `inguinal_exam` / `anoscopy` 三个 0/1 字段分列，`imaging` 存检查名。
- `questions` / `viewpoints` / `trial_notes`：复诊准备与试验收藏。

## 3. 写入规则（开发版必须遵守）

1. **所有 INSERT 写显式列名 + 显式问号数**；列数由 `scripts/check-columns.mjs` 校验。
2. **复合主键/无主键表裸 SELECT 必须 `ORDER BY rowid`**（`metric_points`、`events`、`documents`、`candidates`）。
3. 手写"最新在前"数组只 `ORDER BY ord`，不叠加 `DESC`。
4. 可选字段显式写 `null`（`band: m.band ?? null`），读模型按 `=== null` 分支。
5. 分类指标：`value_num IS NULL` 且 `ordinal_value IS NOT NULL`；数值指标相反。
6. 更正只 INSERT 新版本；不 `UPDATE` 历史行，不 `DELETE`。
7. 时区统一 `Asia/Shanghai`，日期写 `YYYY-MM-DD` 文本，排序依赖字典序。

## 4. 读模型（开发版实现目标）

读模型必须还原成 `prototypes/v0.2/demo-data.js` 的同一形状（parity）：

```
profile
├─ diagnosis {histology, site, t, n, m, stage, grade, hpv, hiv, date, note}
├─ care {path, intent, started, ended, regimen, rt, surgery, next}
├─ metrics[{key, points:[{date, value, note}]}]
├─ symptoms[{term, ctcae, grade, onset, resolved, note}]
├─ bowel[{date, moves, bristol, urgency, incontinence, tenesmus, blood, note}]
├─ skin[{date, rtog, ctcae, moist, pain, note}]
├─ ostomy[{date, output, consistency, leaks, skin, note}]
├─ followups[{planned, done, type, dre, inguinal, anoscopy, imaging, result, next}]
├─ questions / viewpoints / docs / candidates
└─ trialKeys
```

`stage` 是**展示字段**，由 `t/n/m` 拼出，不单独入库；`care.next` 由下一条未完成的 `followups` 推导。

## 5. 迁移与冻结

- `0001_initial.sql` 已冻结（sha256 `12acb602…`）。
- 发布前发现漏列（例如分节 `*_title`）也只能走 `0002_*.sql` 的 `ALTER TABLE ... ADD COLUMN`。
- 每次新增迁移后必须更新 `schema/freeze-contract.md` 的哈希清单，并跑 `npm run check`。
