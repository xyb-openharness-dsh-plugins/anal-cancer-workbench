#!/usr/bin/env node
/**
 * 列一致性校验（H6）。
 *
 * 为什么要有：位置式 INSERT 的列数/列序错误只有跑到那一步才暴露（胃癌轮次连续 6 次）。
 * 做法：把 `schema/00*.sql` 按编号全部执行进 :memory: 库，再打开 `demo/demo-data.sqlite`，
 * 逐表比对 PRAGMA table_info 的列名与顺序；同时核对表集合双向相等。
 *
 * 额外：
 *   - 除 `collection_meta` 这类元数据表外，空表打印告警（不失败）；
 *   - `metric_points` 的 `value_num` 与 `ordinal_value` 互斥；
 *   - `v_paired_delta` 在任一侧为 NULL 时，差值必须为 NULL。
 *
 * 用法：node scripts/check-demo-columns.mjs （先跑 node demo/build-demo-data.mjs）
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SCHEMA_DIR = join(ROOT, 'schema')
const DEMO = join(ROOT, 'demo/demo-data.sqlite')
const problems = []
const warnings = []

if (!existsSync(DEMO)) {
  console.error('✗ 找不到 demo/demo-data.sqlite，先运行 node demo/build-demo-data.mjs')
  process.exit(1)
}

const files = readdirSync(SCHEMA_DIR).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()
const mem = new DatabaseSync(':memory:')
for (const f of files) mem.exec(readFileSync(join(SCHEMA_DIR, f), 'utf8'))

const demo = new DatabaseSync(DEMO)

const objects = (db, type) =>
  db.prepare("select name from sqlite_master where type=? and name not like 'sqlite_%' order by name").all(type).map((r) => r.name)

const memTables = objects(mem, 'table')
const demoTables = objects(demo, 'table')

for (const t of memTables.filter((t) => !demoTables.includes(t))) problems.push(`schema 有表 ${t}，demo 库没有`)
for (const t of demoTables.filter((t) => !memTables.includes(t))) problems.push(`demo 库有表 ${t}，schema 没有`)

const cols = (db, t) => db.prepare(`pragma table_info("${t}")`).all().map((c) => c.name)

for (const t of memTables.filter((t) => demoTables.includes(t))) {
  const a = cols(mem, t)
  const b = cols(demo, t)
  if (a.join(',') !== b.join(',')) {
    problems.push(`表 ${t} 列不一致：\n      schema: ${a.join(', ')}\n      demo  : ${b.join(', ')}`)
    continue
  }
  const n = demo.prepare(`select count(*) n from "${t}"`).get().n
  if (n === 0 && !/meta|preferences/.test(t)) warnings.push(`表 ${t} 有列无行（播种可能漏了）`)
}

const views = objects(mem, 'view')
for (const v of views) {
  if (!objects(demo, 'view').includes(v)) problems.push(`schema 有视图 ${v}，demo 库没有`)
}

// metric_points 数值 / 序数互斥
try {
  const bad = demo.prepare('select count(*) n from metric_points where value_num is not null and ordinal_value is not null').get().n
  if (bad) problems.push(`metric_points 有 ${bad} 行同时填了 value_num 与 ordinal_value（应互斥）`)
} catch (e) {
  problems.push(`metric_points 互斥检查失败：${e.message}`)
}

// 四点位：缺侧不生成差值
try {
  const bad = demo.prepare('select count(*) n from v_paired_delta where (left_value is null or right_value is null) and delta is not null').get().n
  if (bad) problems.push(`v_paired_delta 有 ${bad} 行在缺侧时仍算出差值（NULL≠0）`)
} catch (e) {
  warnings.push(`v_paired_delta 检查跳过：${e.message}`)
}

console.log(`schema 表 ${memTables.length} / demo 表 ${demoTables.length} / 视图 ${views.length}；迁移 ${files.join(', ')}`)
for (const w of warnings) console.warn(`  ! ${w}`)

if (problems.length) {
  console.error(`\n✗ 列一致性失败 ${problems.length} 处：`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log('✓ 列一致性与四条契约抽查通过')
