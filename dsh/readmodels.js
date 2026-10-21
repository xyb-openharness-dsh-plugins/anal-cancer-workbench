/**
 * 读模型：开发版当前读**演示夹具**（`dsh/demo-data.json` + `dsh/trials-data.json`），
 * 不读真实资料目录。原因与边界：
 *
 * - 阶段 3.2 的目标是把「原型 → 开发版 → DSH」链路打通并做 parity，
 *   真实资料目录的读写、迁移与用户选择目录属于阶段 3.3；现在假装读库会更糟。
 * - 夹具由 `demo/build-demo-data.mjs` 与 `scripts/build-trials-excerpt.mjs` 生成，
 *   与原型 `window.DEMO_DATA` 完全同源，所以 parity 差异只可能来自 UI 改写。
 * - 返回体里显式写 `meta.source = 'demo-fixture'`，前端和验收都能看到，不靠口头约定。
 *
 * 接入真实数据时，本文件应替换为「按 profile 从 SQL 组装读模型」，
 * 并保留同样的外层结构（profiles / metrics / scales / trials / window / meta）。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { version, build, commit } from '../lib/version.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const readJson = (name) => JSON.parse(readFileSync(join(HERE, name), 'utf8'))

export function bootstrap() {
  const demo = readJson('demo-data.json')
  const trials = readJson('trials-data.json')
  return {
    ...demo,
    trials,
    meta: {
      source: 'demo-fixture',
      sourceNote: '演示夹具，不是真实病历；不写用户资料目录',
      version,
      build,
      commit,
      generatedAt: demo.generatedAt,
      window: demo.window,
      trialsCutoff: trials.cutoff,
      trialsTotal: trials.total,
    },
  }
}
