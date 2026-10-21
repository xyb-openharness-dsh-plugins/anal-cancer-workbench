/* 开发版读模型与接口契约测试（node --test，零依赖）。
 * 只验三件事：
 * 1. bootstrap 返回的档案数、指标数、试验条数与夹具一致；
 * 2. 返回体显式标注 demo-fixture（不假装读了真实资料目录）；
 * 3. demo/demo-data.sqlite 的行数与 JSON 夹具不脱节（防止改了生成器忘了重建）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { bootstrap } from '../dsh/readmodels.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('bootstrap：结构完整，且明确标注演示夹具', () => {
  const data = bootstrap()
  assert.equal(data.meta.source, 'demo-fixture')
  assert.equal(data.profiles.length, 2)
  assert.equal(data.metrics.length, 9, '指标定义应为 9 个（含 phq9 / gad7）')
  assert.equal(data.trials.rows.length, 10)
  assert.ok(data.trials.total >= 200)
  for (const p of data.profiles) {
    assert.ok(p.diagnosis && p.care && p.metrics.length && p.docs.length, `${p.key} 档案字段不全`)
    assert.ok(Array.isArray(p.nodes) && p.nodes.length === 4, `${p.key} 应有 4 条淋巴结短径记录`)
    const node = p.nodes.find((n) => n.value == null)
    if (p.key === 'chen') assert.ok(node, '陈女士应有 1 条缺侧记录（用于演示不计算差值）')
  }
  const chen = data.profiles.find((p) => p.key === 'chen')
  const left = chen.nodes.find((n) => n.date === '2026-09-02' && n.side === 'left')
  const right = chen.nodes.find((n) => n.date === '2026-09-02' && n.side === 'right')
  assert.equal(left.value, 6)
  assert.equal(right.value, null, '缺侧必须是 null，不是 0')
})

test('演示库与夹具不脱节', () => {
  const data = bootstrap()
  const db = new DatabaseSync(path.join(ROOT, 'demo', 'demo-data.sqlite'), { readOnly: true })
  const count = (t) => db.prepare(`select count(*) n from ${t}`).get().n
  const metricPoints = data.profiles.reduce((sum, p) => sum + p.metrics.reduce((s, m) => s + m.points.length, 0), 0)
  const nodes = data.profiles.reduce((sum, p) => sum + p.nodes.length, 0)
  assert.equal(count('metric_points'), metricPoints, 'metric_points 行数与夹具不一致，重跑 demo/build-demo-data.mjs')
  assert.equal(count('paired_measures'), nodes, 'paired_measures 行数与夹具不一致')
  const deltas = db.prepare('select left_value, right_value, delta from v_paired_delta').all()
  for (const row of deltas) {
    if (row.left_value == null || row.right_value == null) assert.equal(row.delta, null, '缺侧差值必须为 NULL')
    else assert.equal(row.delta, Math.round((row.left_value - row.right_value) * 10) / 10)
  }
  db.close()
})
