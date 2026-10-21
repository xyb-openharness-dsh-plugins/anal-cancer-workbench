#!/usr/bin/env node
/**
 * 版本号一致性校验。
 * 单一来源：仓库根 `VERSION`。核对 package.json 与原型 APP_INFO.version。
 * 原型快照版本固定为 FROZEN_PROTOTYPE（G2 签认过的视觉基准，不随开发版前移）。
 *
 * 用法：node scripts/check-version.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const FROZEN_PROTOTYPE = '0.1.0'
const problems = []

if (!existsSync(join(root, 'VERSION'))) {
  console.error('✗ 缺少 VERSION 文件')
  process.exit(1)
}
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()
if (!SEMVER.test(version)) problems.push(`VERSION 不是合法语义化版本：${version}`)

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (pkg.version !== version) problems.push(`package.json version=${pkg.version}，VERSION=${version}`)

const appPath = join(root, 'prototypes/v0.2/app.js')
if (existsSync(appPath)) {
  const m = readFileSync(appPath, 'utf8').match(/APP_INFO\s*=\s*\{[^}]*version:\s*'([^']+)'/)
  if (!m) problems.push('prototypes/v0.2/app.js 找不到 APP_INFO.version')
  else if (m[1] !== FROZEN_PROTOTYPE) problems.push(`原型 APP_INFO.version=${m[1]}，应为冻结版本 ${FROZEN_PROTOTYPE}`)
}

const readme = readFileSync(join(root, 'README.md'), 'utf8')
if (!readme.includes(version) && !readme.includes(FROZEN_PROTOTYPE)) {
  problems.push(`README.md 未出现版本号 ${version}（或冻结版 ${FROZEN_PROTOTYPE}）`)
}

if (problems.length) {
  console.error('✗ 版本不一致：')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`✓ 版本一致（VERSION=${version}，原型冻结=${FROZEN_PROTOTYPE}）`)
