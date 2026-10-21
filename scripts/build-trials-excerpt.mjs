#!/usr/bin/env node
/* 从 research/anal-cancer/*.sqlite 生成原型用的试验摘录（不手写第二份数据）。
   只截取字段，不改写登记事实；title_zh 是编辑译名，note 是编辑说明，均标注"未核实"。 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DB = join(ROOT, 'research/anal-cancer/anal_cancer_trials_2026.sqlite')
const OUT = join(ROOT, 'prototypes/v0.2/trials-data.js')

const ZH = {
  NCT07692152: '信迪利单抗对比丝裂霉素联合卡培他滨与 IMRT 治疗局限期肛管鳞癌（Ⅲ期）',
  NCT07555678: '放化疗联合 PD-1 抗体治疗肛管鳞癌（CHASE 研究）',
  NCT07425054: '按 HPV ctDNA 应答调整放化疗 ± 瑞弗利单抗治疗局部晚期肛管癌',
  NCT06493019: '帕博利珠单抗联合卡铂/紫杉醇与放疗治疗早期肛管癌',
  NCT06050707: 'MRI 自适应放疗：按风险分层的剂量提升策略',
  NCT05838391: 'AI 引导的每日自适应放疗（肛管癌）',
  NCT07112690: '奇神经节毁损术缓解肛管/肛周放疗相关疼痛',
  NCT04094454: '盆腔放疗期间经阴道扩张（减少阴道狭窄）',
  NCT00423293: 'IMRT 联合 5-FU 与丝裂霉素治疗浸润性肛管癌（RTOG 0529）',
  NCT04166318: '早期肛管癌降低剂量放化疗（DECREASE 研究）'
}
const NOTE = {
  NCT07692152: '中国中心；Ⅲ期；对照为 MMC + 卡培他滨 + IMRT。登记信息，未核实。',
  NCT07555678: '中国中心；Ⅱ期；PD-1 抗体联合放化疗。登记信息，未核实。',
  NCT07425054: '以 HPV ctDNA 应答调整放疗范围，联合瑞弗利单抗。登记信息，未核实。',
  NCT06493019: '早期（T1–T2）探索去放疗/降阶梯联合免疫。登记信息，未核实。',
  NCT06050707: '影像自适应 + 风险分层剂量。登记信息，未核实。',
  NCT05838391: 'AI 引导每日自适应放疗，属技术类研究。登记信息，未核实。',
  NCT07112690: '针对放疗后肛周疼痛的介入镇痛研究。登记信息，未核实。',
  NCT04094454: '器械类研究，关注盆腔放疗后阴道狭窄。登记信息，未核实。',
  NCT00423293: '已完成的 IMRT 剂量与毒性研究，常被引作 IMRT 方案依据。登记信息，未核实。',
  NCT04166318: '降低放疗剂量的Ⅱ期研究，已完成入组。登记信息，未核实。'
}
const ORDER = Object.keys(ZH)

const db = new DatabaseSync(DB, { readOnly: true })
const rows = ORDER.map(nct => db.prepare('SELECT * FROM trial_records WHERE nct_id = ?').get(nct)).filter(Boolean)
const statusZh = { RECRUITING: '招募中', ACTIVE_NOT_RECRUITING: '进行中·未招募', NOT_YET_RECRUITING: '尚未开始招募', COMPLETED: '已完成', TERMINATED: '已终止', UNKNOWN: '状态未知', WITHDRAWN: '已撤回', ENROLLING_BY_INVITATION: '邀请入组' }
const phaseZh = { PHASE1: 'Ⅰ期', PHASE2: 'Ⅱ期', PHASE3: 'Ⅲ期', 'PHASE1/PHASE2': 'Ⅰ/Ⅱ期', 'PHASE2/PHASE3': 'Ⅱ/Ⅲ期', EARLY_PHASE1: '早期Ⅰ期', PHASE4: 'Ⅳ期', NA: '不适用' }
const out = rows.map(r => ({
  key: r.trial_key, nct: r.nct_id, title: r.title, title_zh: ZH[r.nct_id], note: NOTE[r.nct_id],
  status: r.status, status_zh: statusZh[r.status] || r.status, phase: r.phase, phase_zh: phaseZh[r.phase] || r.phase,
  sponsor: r.sponsor, enrollment: r.enrollment, start: r.start_date, updated: r.last_update,
  conditions: r.conditions, interventions: r.interventions, countries: r.countries,
  china: r.china_sites || '', url: r.url
}))
db.close()
const meta = JSON.parse(await readFile(join(ROOT, 'research/anal-cancer/manifest.json'), 'utf8'))
await writeFile(OUT, `/* 生成物：scripts/build-trials-excerpt.mjs 从 research/anal-cancer 摘录，不手改。数据截止 ${meta.cutoff}；登记状态未核实。 */\nwindow.TRIALS_DATA = ${JSON.stringify({ cutoff: meta.cutoff, total: meta.records, rows: out }, null, 1)};\n`)
console.log(JSON.stringify({ out: OUT, rows: out.length, total: meta.records }))
