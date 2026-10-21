#!/usr/bin/env node
/**
 * 生成 lib/version.js。唯一来源是仓库根 VERSION；build 取最后一次提交的日期（没有 git 写 local）。
 * 用法：node scripts/build-version.mjs [--check]
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'lib', 'version.js')
const checkOnly = process.argv.includes('--check')
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()

function git(args, fallback) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim() || fallback
  } catch {
    return fallback
  }
}

const build = git(['log', '-1', '--format=%cs'], 'local')
const commit = git(['rev-parse', '--short', 'HEAD'], 'local')
const content = `/* 生成物：node scripts/build-version.mjs，不手改。 */
export const version = '${version}'
export const build = '${build}'
export const commit = '${commit}'
export const channel = 'dev'
`

if (checkOnly) {
  const current = existsSync(target) ? readFileSync(target, 'utf8') : ''
  if (current !== content) {
    console.error('✗ lib/version.js 与 VERSION / git 不一致，先运行 node scripts/build-version.mjs')
    process.exit(1)
  }
  console.log(`✓ lib/version.js 与 VERSION 一致（${version} / ${build}）`)
} else {
  if (!existsSync(target) || readFileSync(target, 'utf8') !== content) writeFileSync(target, content)
  console.log(`✓ 写入 lib/version.js（${version} / ${build} / ${commit}）`)
}
