/* 面板与布局参数的唯一来源。
 *
 * 客户端 `lib/client.js` 由 `scripts/build-client.mjs` 从 `src/client.js` 生成，
 * 面板参数、接口前缀、版本号都在那一步注入；**别处不许再写第二份 0.65 / 0.35**。
 *
 * ## 为什么是 customFrame（2026-10-27 实机反馈后改判）
 *
 * 0.2.4 及以前装的是标准分栏（customFrame=false）。装进 Desktop 后用户截图反馈：
 * 业务区被拉到整幅、顶栏没有 AI 对话按钮、右侧会话区宽度不可调——中间那块本该是
 * 工作台的位置被原生会话占着。原因不是漏接服务：标准分栏下宿主只把
 * `--workbench-business-width` 写成注册时的静态值，服务里也没有拖宽/关闭面板的接口。
 *
 * customFrame=true 时宿主把**原生会话节点**作为 `conversation` prop 交给我们排版，
 * 于是 AI 按钮、splitter 拖动/键盘调整、收起重开、宽度记忆都由工作台自己实现。
 * 与乳腺癌（PinkyPal）、小莲宝（CerviPal）、小胆宝（BiliPal）三家一致，
 * 基线见 starter `docs/20-AGENT-PANE-DESIGN.md`。
 *
 * 取值理由：
 * 1. businessSide=left：业务区在左、宿主原生会话在右，与 v0.2 原型的信息层级一致；
 * 2. businessWidth=0.65：原型的 30+ 视图是在 1440×65% ≈ 936px 下量出来的。0.7 会把会话区
 *    压到 30% 以下（家族判不合格），0.6 以下三栏卡片提前换行。
 */

/** 宿主面板参数（写进客户端 register 时逐字使用）。businessWidth 越界宿主直接抛错。 */
export const PANEL = Object.freeze({
  businessSide: 'left',
  businessWidth: 0.65,
  customFrame: true,
});

/** 宿主允许的 businessWidth 区间 */
export const HOST_LIMITS = Object.freeze({ min: 0.25, max: 0.7 });

/**
 * AI 会话面板宽度档位（拖动/键盘/预设共用这一份）。
 * 区间 25%–45% 取自 20-AGENT-PANE-DESIGN §2 的 customFrame 基线：
 * 更窄读不了消息，更宽会把业务区压到 55% 以下。
 */
export const AGENT_PANE = Object.freeze({
  def: 0.35,
  default: 0.35,                              // 与 def 同值；新代码统一读 default
  min: 0.25,
  max: 0.45,
  step: 24,                                   // 键盘 ←/→ 的像素档位说明
  ratioStep: 0.02,                            // 键盘/鼠标实际共用的比例步进
  narrowBelowPx: 760,                         // 容器窄于此改覆盖式抽屉
  drawerMaxPx: 420,
  presets: Object.freeze({ narrow: 0.25, std: 0.35, wide: 0.45 }),
});

/** 把比例夹到 AGENT_PANE 区间；非数字一律回默认值。 */
export function clampAgentRatio(ratio) {
  const r = Number(ratio);
  if (!Number.isFinite(r)) return AGENT_PANE.def;
  return Math.min(AGENT_PANE.max, Math.max(AGENT_PANE.min, r));
}

/** 业务区像素宽度：宿主给的比例 × 窗口宽度。1440 → 936，1280 → 832。 */
export function businessPanePx(windowWidth, width = PANEL.businessWidth) {
  if (!Number.isFinite(windowWidth) || windowWidth <= 0) throw new TypeError('windowWidth 必须是正数');
  const ratio = width === undefined ? PANEL.businessWidth : width;
  if (!Number.isFinite(ratio) || ratio <= 0) throw new TypeError('width 必须是正数');
  return Math.round(windowWidth * ratio);
}

/**
 * 自检：返回问题清单，空数组表示合法。参数可注入，便于单测覆盖越界情形。
 * 只查宿主真正会校验的那几项，外加 AGENT_PANE 自己的区间——多查一条就多一处漂移。
 */
export function assertPanelConfig(config = PANEL, agent = AGENT_PANE) {
  const problems = [];
  if (!config || typeof config !== 'object') return ['面板配置必须是对象'];

  if (!['left', 'right'].includes(config.businessSide)) {
    problems.push(`businessSide 只能是 left/right，当前 ${config.businessSide}`);
  }
  if (typeof config.customFrame !== 'boolean') {
    problems.push(`customFrame 必须是布尔值，当前 ${config.customFrame}`);
  }

  const w = config.businessWidth;
  if (!(typeof w === 'number' && Number.isFinite(w) && w >= HOST_LIMITS.min && w <= HOST_LIMITS.max)) {
    problems.push(`businessWidth 必须在 ${HOST_LIMITS.min}–${HOST_LIMITS.max} 之间，当前 ${w}`);
  } else if (w === HOST_LIMITS.max) {
    problems.push('businessWidth 不得取上限 0.7：贴到上限会把会话区压到 0.3 以下，本项目不这么做');
  }

  if (agent && typeof agent === 'object') {
    const { def, min, max, ratioStep } = agent;
    for (const [name, value] of Object.entries({ def, min, max, ratioStep })) {
      if (!(typeof value === 'number' && Number.isFinite(value) && value > 0)) {
        problems.push(`AGENT_PANE.${name} 必须是正数，当前 ${value}`);
      }
    }
    if (typeof min === 'number' && typeof max === 'number' && min >= max) {
      problems.push(`AGENT_PANE.min(${min}) 必须小于 max(${max})`);
    }
    if (typeof def === 'number' && typeof min === 'number' && typeof max === 'number' && (def < min || def > max)) {
      problems.push(`AGENT_PANE.def(${def}) 必须落在 ${min}–${max} 区间内`);
    }
    if (typeof max === 'number' && max > HOST_LIMITS.max) {
      problems.push(`AGENT_PANE.max(${max}) 不得大于宿主上限 ${HOST_LIMITS.max}`);
    }
  }
  return problems;
}