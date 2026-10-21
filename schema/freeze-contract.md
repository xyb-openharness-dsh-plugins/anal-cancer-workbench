# 迁移冻结合同

本文件是 `schema/` 下迁移文件的**不可变记录**。`npm run check` 的 `check:schema` 会逐行比对哈希，
不符即失败。

## 规则

1. **已记录在案的迁移只增不改**。改一个字节都算破坏合同：两台机器上的库会不一样，历史数据不可复现。
2. 需要改结构 → 新增 `0002_*.sql`（`ALTER TABLE` / `CREATE TABLE` / `CREATE VIEW`），并在本文件追加一行。
3. 新增迁移要在文件头写明：为什么加、影响哪些表、是否需要回填、回填口径。
4. 文件名只能是 `NNNN_lower_snake.sql`，四位编号连续。
5. 冻结发生在**第一次写入演示库之后**。`demo/demo-data.sqlite` 重建后行数应与 schema 匹配，
   但**不要求逐字节相同**（SQLite 页布局不稳定）。

## 冻结清单

| 迁移 | sha256 | 冻结日期 | 说明 |
| --- | --- | --- | --- |
| `0001_initial.sql` | 12acb602761738d9b92c4dac45d955cb44a52240d6bb55a66695211f204871d2 | 2026-10-21 | 初始模型：19 张表 + `v_paired_delta` 视图 |

## 0001 的表清单（改动前的基线）

- 档案与偏好：`profiles`、`preferences`
- 诊断与测量：`diagnoses`（`version` + `supersedes_id`）、`paired_measures`（左右各一行，缺侧 NULL）、`v_paired_delta`（任一侧 NULL 则差值为 NULL）
- 事实四层：`documents` → `candidates` → `records` → `metric_points`（配 `metric_defs`、`metric_scales`）
- 病程：`events`、`treatment_lines`、`symptoms`、`bowel_logs`、`skin_assessments`、`ostomy_logs`、`followups`
- 患者侧：`questions`、`viewpoints`（**无 `is_conclusion` 字段**）、`trial_notes`

## 校验

```bash
node scripts/check-schema.mjs
shasum -a 256 schema/0001_initial.sql
```

两者输出必须一致；`check-schema` 还会拦截不符合 `NNNN_name.sql` 命名的文件与"磁盘有、合同无"的新迁移。
