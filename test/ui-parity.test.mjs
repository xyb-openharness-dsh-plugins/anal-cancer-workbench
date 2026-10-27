/* public/ 与 prototypes/v0.2/ 的 UI parity 测试（零依赖，node --test）。
 *
 * 做法：同一份演示数据分别喂给原型 app.js 与开发版 app.js，
 * 两边都在最小 DOM shim 里跑起来，再按「13 个一级视图 × 2 个档案 × 每个二级页签」
 * 逐个调用 views[view](profile, sub) 比对 HTML 字符串。
 *
 * 两边共用的视图代码必须逐字符相同；任何差异都是改写时漏改或误改。
 * 数据加载方式不同（原型读 window.DEMO_DATA，开发版走 /api/bootstrap）不在比对范围，
 * 由 test/server.test.mjs 单独验返回体。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROTO = path.join(ROOT, 'prototypes', 'v0.2')
const PUBLIC = path.join(ROOT, 'public')
const read = (p) => readFileSync(p, 'utf8')

const DEMO = (() => {
  const w = {}
  new Function('window', read(path.join(PROTO, 'demo-data.js')))(w)
  return w.DEMO_DATA
})()
const TRIALS = (() => {
  const w = {}
  new Function('window', read(path.join(PROTO, 'trials-data.js')))(w)
  return w.TRIALS_DATA
})()
const PAYLOAD = { ...DEMO, trials: TRIALS }

function mkEl() {
  return {
    innerHTML: '', textContent: '', value: '', hidden: false, open: false, files: [],
    dataset: {}, style: {},
    classList: { add() {}, remove() {}, toggle() { return false; }, contains() { return false; } },
    setAttribute() {}, getAttribute() { return 'false'; }, removeAttribute() {},
    addEventListener() {}, removeEventListener() {},
    focus() {}, click() {}, showModal() {}, close() {},
    closest() { return null; }, matches() { return false; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    nextElementSibling: null,
  }
}

function installShim() {
  const els = new Map()
  const document = {
    querySelector(s) { if (!els.has(s)) els.set(s, mkEl()); return els.get(s) },
    querySelectorAll() { return [] },
    addEventListener() {}, removeEventListener() {},
    getElementById(id) { return this.querySelector('#' + id) },
    createElement: mkEl,
    body: { classList: { add() {}, remove() {}, toggle() { return false; }, contains() { return false; } } },
  }
  const window = {
    addEventListener() {}, scrollTo() {}, innerWidth: 1440, matchMedia: undefined,
    DEMO_DATA: DEMO, TRIALS_DATA: TRIALS,
  }
  globalThis.window = window
  globalThis.document = document
  globalThis.location = { pathname: '/', hash: '' }
  globalThis.fetch = undefined
  globalThis.requestAnimationFrame = undefined
  globalThis.performance = undefined
  return { els, window, document }
}

function run(srcPath) {
  installShim()
  globalThis.__WB_TEST__ = true
  new Function(read(srcPath))()
  const api = globalThis.__WB_TEST__
  assert.ok(api && api.views, `${srcPath}: 没有拿到 views 导出`)
  return api
}

test('原型与开发版：页面树一致', () => {
  const proto = run(path.join(PROTO, 'app.js'))
  const dev = run(path.join(PUBLIC, 'app.js'))
  assert.deepEqual(dev.PAGES, proto.PAGES, 'PAGES 不一致')
  assert.deepEqual(dev.SUBPAGES, proto.SUBPAGES, 'SUBPAGES 不一致')
  assert.equal(dev.PAGES.length, 13, '一级页应为 13 个')
  assert.equal(Object.keys(dev.SUBPAGES).length, 12, '二级页组应为 12 组')
})

test('原型与开发版：13 视图 × 2 档案 × 全部二级页签逐字符一致', () => {
  // 原型在加载时已从 shim 的 window.DEMO_DATA / TRIALS_DATA 拿到数据（const 绑定，不可再赋值）；
  // 开发版初始为空，用 setData 灌入同一份数据。
  const proto = run(path.join(PROTO, 'app.js'))
  const dev = run(path.join(PUBLIC, 'app.js'))
  dev.setData(PAYLOAD)
  let compared = 0
  for (const [key] of dev.PAGES) {
    const subs = dev.SUBPAGES[key] || [null]
    for (let pi = 0; pi < PAYLOAD.profiles.length; pi++) {
      proto.state.profile = pi
      dev.state.profile = pi
      for (let sub = 0; sub < subs.length; sub++) {
        const a = proto.views[key](PAYLOAD.profiles[pi], sub)
        const b = dev.views[key](PAYLOAD.profiles[pi], sub)
        compared += 1
        if (a !== b) {
          let i = 0
          while (i < a.length && i < b.length && a[i] === b[i]) i += 1
          assert.fail(`${key}#${sub}（档案 ${pi}）不一致，首个差异在第 ${i} 字符：\n原型: …${a.slice(Math.max(0, i - 40), i + 80)}\n开发: …${b.slice(Math.max(0, i - 40), i + 80)}`)
        }
      }
    }
  }
  // 2 个档案 × (13 个一级页 + 25 个额外二级页) = 76；再加 2 个分类页的默认态 → 见下
  assert.ok(compared >= 78, `比对组合偏少：${compared}`)
  console.log(`  parity 比对 ${compared} 个 (视图, 档案, 二级页) 组合，全部一致`)
})

test('面板参数唯一来源：lib/layout.js 的 PANEL 与生成的 client.js 一致', async () => {
  const layout = await import(path.join(ROOT, 'lib', 'layout.js'))
  assert.equal(layout.PANEL.businessSide, 'left')
  assert.equal(layout.PANEL.businessWidth, 0.65)
  assert.equal(layout.PANEL.customFrame, true, 'customFrame=false 时宿主自己画会话区（2026-10-27 实机反馈）')
  assert.deepEqual(layout.assertPanelConfig(), [], 'lib/layout.js 自身校验应无问题')

  // lib/client.js 是 src/client.js 的生成物，参数由 build-client 注入；这里只验产物没漂
  const client = read(path.join(ROOT, 'lib', 'client.js'))
  for (const [name, re] of [
    ['BUSINESS_SIDE', /const BUSINESS_SIDE = 'left'/],
    ['BUSINESS_WIDTH', /const BUSINESS_WIDTH = Number\('0\.65'\)/],
    ['CUSTOM_FRAME', /const CUSTOM_FRAME = 'true' === 'true'/],
    ['UI_ENTRY', /const UI_ENTRY = '\/api\/anal-cancer\/ui\/'/],
  ]) {
    assert.match(client, re, `lib/client.js 与 layout 不一致：${name}`)
  }
  assert.match(client, /__ModuleLoader__\.load/, 'lib/client.js 必须用 ModuleLoader 注册')
})
