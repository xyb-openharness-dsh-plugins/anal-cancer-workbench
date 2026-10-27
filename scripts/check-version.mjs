#!/usr/bin/env node
/**
 * 版本号一致性校验。单一来源：仓库根 `VERSION`。
 * 核对：package.json / lib/version.js / public/app.js / 原型 APP_INFO / README。
 * 原型是 G2 基准，固定核对到 FROZEN_PROTOTYPE，不随开发版前移。
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const FROZEN_PROTOTYPE = '0.1.1'
const problems = []

if (!existsSync(join(root, 'VERSION'))) {
  console.error('✗ 缺少 VERSION 文件')
  process.exit(1)
}
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()
if (!SEMVER.test(version)) problems.push(`VERSION 不是合法语义化版本：${version}`)

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (pkg.version !== version) problems.push(`package.json version=${pkg.version}，VERSION=${version}`)

const libVersion = readFileSync(join(root, 'lib/version.js'), 'utf8').match(/export const version = '([^']+)'/)
if (!libVersion) problems.push('lib/version.js 读不到 version（先生成）')
else if (libVersion[1] !== version) problems.push(`lib/version.js=${libVersion[1]}，VERSION=${version}`)

const appVersion = readFileSync(join(root, 'public/app.js'), 'utf8').match(/APP_INFO\s*=\s*\{[^}]*version:\s*'([^']+)'/)
if (!appVersion) problems.push('public/app.js 找不到 APP_INFO.version')
else if (appVersion[1] !== version) problems.push(`public/app.js=${appVersion[1]}，VERSION=${version}`)

const proto = readFileSync(join(root, 'prototypes/v0.2/app.js'), 'utf8').match(/APP_INFO\s*=\s*\{[^}]*version:\s*'([^']+)'/)
if (!proto) problems.push('prototypes/v0.2/app.js 找不到 APP_INFO.version')
else if (proto[1] !== FROZEN_PROTOTYPE) problems.push(`原型=${proto[1]}，应为冻结版本 ${FROZEN_PROTOTYPE}`)

/* 开发版首页不许写死版本号：0.2.4 装机后顶栏是静态 v0.1.1，用户第一眼看到错版本
 * （2026-10-27 反馈）。三处版本（顶栏/页脚/关于）与构建日期一律由 public/app.js 读 APP_INFO 渲染。 */
const webIndex = readFileSync(join(root, 'public/index.html'), 'utf8')
const hardcoded = [...webIndex.matchAll(/v(\d+\.\d+\.\d+)/g)].map((m) => m[1])
if (hardcoded.length) problems.push(`public/index.html 写死了版本号 ${[...new Set(hardcoded)].join(', ')}；应由 APP_INFO 渲染`)
if (!/id="runtime-line"/.test(webIndex)) problems.push('public/index.html 缺少 #runtime-line（顶栏版本行，运行时注入）')

const readme = readFileSync(join(root, 'README.md'), 'utf8')
if (!readme.includes(version)) problems.push(`README.md 未出现版本号 ${version}`)

if (problems.length) {
  console.error('✗ 版本不一致：')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`✓ 版本一致（VERSION=${version}，原型冻结=${FROZEN_PROTOTYPE}）`)
