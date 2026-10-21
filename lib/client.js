/* 客户端入口（宿主侧，由 ModuleLoader 加载的单文件）。
 *
 * 为什么是普通脚本：宿主 renderer 用 `window.__ModuleLoader__.load({id, factory})`
 * 包一层拿 React 组件；直接 `export` 会被拒，并把整个包移出 profile。
 *
 * 面板形态：标准分栏（customFrame=false），业务区只放一个 iframe，
 * 指向本包自己的 UI 前缀 `/api/anal-cancer/ui/index.html`（见 dsh/index.js）。
 * 三个面板参数的唯一来源是 lib/layout.js；这里是宿主要求的字面量副本，
 * test/ui-parity.test.mjs 会比对两处。
 */
window.__ModuleLoader__.load({
  id: "@xyb-community/anal-cancer-workbench",
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const metadata = {
      title: "小萌宝 · 肛管癌工作台",
      description: "本机优先的肛管癌（肛管鳞癌）放化疗副作用、肠道与排粪功能、造口生活与复查准备工作台",
    }

    const UI_URL = "/api/anal-cancer/ui/index.html"

    function Panel() {
      return h('iframe', {
        src: UI_URL,
        title: metadata.title,
        style: { flex: 1, width: '100%', minWidth: 0, border: 0, background: '#fcf9f5', display: 'block' },
        referrerPolicy: 'same-origin',
      })
    }

    function apply(ctx) {
      ctx.effect(() => ctx.desktopWorkbenches.register({
        title: metadata.title,
        repository: "https://github.com/xyb-openharness-dsh-plugins/anal-cancer-workbench",
        description: metadata.description,
        businessSide: 'left',
        businessWidth: 0.65,
        customFrame: false,
      }, Panel))
    }

    return { apply, inject: ['desktopWorkbenches'] }
  }
})
