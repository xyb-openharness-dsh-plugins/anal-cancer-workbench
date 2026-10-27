/**
 * 包入口（DSH 服务端侧）：name / inject / Config / apply 四样。
 * 只做三件事：挂 /api/anal-cancer 前缀下的 health、bootstrap、/ui/* 静态页；
 * 所有请求先过宿主的鉴权回执，不自建登录态。
 *
 * UI 走 iframe（customFrame=true，业务区在左、原生会话在右）：客户端入口 lib/client.js
 * 只画自绘顶栏 + 业务 iframe + 会话区，页面与接口同源，所以「本地 dev-server」与
 * 「装进 Desktop」共用 public/ 那一份前端。
 */
import Schema from '@deepseek-ai/schemastery'
import { bootstrap } from './readmodels.js'
import { servePublic } from './server.js'
import { version, build } from '../lib/version.js'

export const name = 'anal-cancer-workbench-main'
export const inject = ['webServer', 'connection']
export const Config = Schema.object({})

export const API_PREFIX = '/api/anal-cancer'
export const UI_PREFIX = `${API_PREFIX}/ui`

function sendJson(res, status, body) {
  const buf = Buffer.from(JSON.stringify(body), 'utf8')
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': buf.length, 'cache-control': 'no-store' })
  res.end(buf)
}

export function apply(ctx) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')

  const handler = (req, res) => {
    if (typeof ctx.connection?.requestRejection !== 'function') {
      return sendJson(res, 503, { error: 'connection authentication capability unavailable' })
    }
    const rejection = ctx.connection.requestRejection(req)
    if (rejection !== undefined) return sendJson(res, rejection, { error: 'Authentication required' })

    const url = new URL(req.url, 'http://127.0.0.1')
    const path = url.pathname

    if (path === `${API_PREFIX}/health`) {
      if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
      return sendJson(res, 200, { ok: true, version, build, ui: UI_PREFIX, apiVersion: 'v1', capabilities: ['health', 'bootstrap'] })
    }
    if (path === `${API_PREFIX}/bootstrap`) {
      if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
      try {
        return sendJson(res, 200, bootstrap())
      } catch (error) {
        return sendJson(res, 500, { error: 'bootstrap_failed', message: error.message })
      }
    }
    if (path === UI_PREFIX || path.startsWith(`${UI_PREFIX}/`)) {
      return void servePublic(req, res, path.slice(UI_PREFIX.length) || '/')
    }
    sendJson(res, 404, { error: 'not_found', path })
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: API_PREFIX, handler }), 'anal-cancer ui + api')
}
