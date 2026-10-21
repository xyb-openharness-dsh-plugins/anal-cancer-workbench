/* HTTP 层：JSON 接口 + public/ 静态文件。零依赖，只用 node:http / node:fs。
 *
 * 三条规则这里说了算：
 * 1. 静态文件只在 public/ 内解析，`..` 与解析后越界一律拦掉；
 * 2. 未知 /api/* 返回 JSON 404，不回 HTML（前端按 JSON 解析，收到 HTML 很难查）；
 * 3. 只读 GET/HEAD，不提供写接口。
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
}

function safeJoin(root, urlPath) {
  const clean = decodeURIComponent(String(urlPath).split('?')[0].split('#')[0])
  const full = resolve(root, clean.replace(/^\/+/, '') || 'index.html')
  if (full !== root && !full.startsWith(root + sep)) return null
  return full
}

function sendFile(res, file) {
  if (!existsSync(file)) return false
  const st = statSync(file)
  if (!st.isFile()) return false
  res.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
    'content-length': st.size,
    'cache-control': 'no-cache',
  })
  createReadStream(file).pipe(res)
  return true
}

/** 把 public/ 下的文件按 urlPath 回出去；未知路径回 index.html。 */
export function servePublic(req, res, urlPath) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' })
    res.end()
    return true
  }
  const file = safeJoin(PUBLIC_DIR, urlPath)
  if (file && sendFile(res, file)) return true
  return sendFile(res, join(PUBLIC_DIR, 'index.html'))
}

/** 本地 dev-server 用：/api/health、/api/bootstrap、其余交给 public/。 */
export function createHandler({ bootstrap, version }) {
  return function handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`)
    const json = (code, body) => {
      const buf = Buffer.from(JSON.stringify(body), 'utf8')
      res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': buf.length, 'cache-control': 'no-store' })
      res.end(buf)
    }
    if (url.pathname === '/api/health') return json(200, { ok: true, version })
    if (url.pathname === '/api/bootstrap') {
      try {
        return json(200, bootstrap())
      } catch (error) {
        return json(500, { error: 'bootstrap_failed', message: error.message })
      }
    }
    if (url.pathname.startsWith('/api/')) return json(404, { error: 'not_found', path: url.pathname })
    return void servePublic(req, res, url.pathname)
  }
}
