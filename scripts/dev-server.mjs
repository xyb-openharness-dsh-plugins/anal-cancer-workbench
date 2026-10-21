#!/usr/bin/env node
/* 本地开发服务器：与 Desktop 走同一份 public/ 与同一份 bootstrap。
 * 用法：node scripts/dev-server.mjs [port]
 * 打开 http://127.0.0.1:5173/ （接口在 /api/health、/api/bootstrap）
 */
import { createServer } from 'node:http'
import { createHandler } from '../dsh/server.js'
import { bootstrap } from '../dsh/readmodels.js'
import { version, build } from '../lib/version.js'

const port = Number(process.argv[2] || process.env.PORT || 5173)
const server = createServer(createHandler({ bootstrap, version }))
server.listen(port, '127.0.0.1', () => {
  console.log(`小萌宝开发版 v${version}（${build}）http://127.0.0.1:${port}/`)
})
