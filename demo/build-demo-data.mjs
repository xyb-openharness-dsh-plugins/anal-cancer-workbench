#!/usr/bin/env node
/* 小萌宝 AnalPal · 演示数据唯一来源。
   同时产出：
     demo/demo-data.sqlite          （开发版 readmodels 的 parity 基准）
     prototypes/v0.2/demo-data.js   （原型直接 <script> 引入）
   被 import 时只导出 buildDemoProfiles() 的纯数据，不碰磁盘。
   两份演示档案 × 6 个月窗口；化验/体征 2–4 周一点并延续到 2026-10-20；
   影像/内镜按真实频率，不加密。全部为模拟资料，不是真实病例。 */
import { writeFile, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const NOW = '2026-10-21'
export const WINDOW = { from: '2026-04-21', to: '2026-10-20' }

const SCALES = {
  rtog_skin: [
    { ordinal: 0, label: '0 级 · 无变化', short: '0', tone: 'ok' },
    { ordinal: 1, label: '1 级 · 淡红斑/干性脱皮', short: '1', tone: 'watch' },
    { ordinal: 2, label: '2 级 · 片状湿性脱皮', short: '2', tone: 'warn' },
    { ordinal: 3, label: '3 级 · 融合湿性脱皮/皱褶外', short: '3', tone: 'danger' },
    { ordinal: 4, label: '4 级 · 坏死/溃疡/出血', short: '4', tone: 'danger' }
  ],
  stoma_output: [
    { ordinal: 0, label: '成形', short: '成形', tone: 'ok' },
    { ordinal: 1, label: '半成形', short: '半成形', tone: 'watch' },
    { ordinal: 2, label: '稀糊', short: '稀糊', tone: 'warn' },
    { ordinal: 3, label: '水样', short: '水样', tone: 'danger' }
  ]
}

const METRIC_DEFS = [
  { key: 'weight', label: '体重', kind: 'numeric', unit: 'kg', color: '#E07B1E', group: '身体与营养', order: 10 },
  { key: 'albumin', label: '白蛋白', kind: 'numeric', unit: 'g/L', color: '#2F7F74', group: '身体与营养', order: 20 },
  { key: 'hemoglobin', label: '血红蛋白', kind: 'numeric', unit: 'g/L', color: '#8C5AA8', group: '血液学', order: 30 },
  { key: 'anal_skin_grade', label: '肛周皮肤 RTOG 分级', kind: 'categorical', unit: null, scale: 'rtog_skin', color: '#C2410C', group: '皮肤与黏膜', order: 40 },
  { key: 'bowel_frequency', label: '排便次数', kind: 'numeric', unit: '次/日', color: '#3F6FA8', group: '肠道功能', order: 50 },
  { key: 'pain_nrs', label: '肛周疼痛 NRS', kind: 'numeric', unit: '分', color: '#A33B2B', group: '症状', order: 60 },
  { key: 'stoma_output', label: '造口排出性状', kind: 'categorical', unit: null, scale: 'stoma_output', color: '#3F6FA8', group: '造口', order: 70 }
]

const P = (date, value, note = null) => ({ date, value, note })

function profileA() {
  return {
    key: 'chen',
    name: '陈女士',
    avatar: '陈',
    age: 54,
    sex: 'female',
    meta: '54 岁 · 肛管鳞癌 ⅢB 期 · 根治性放化疗后 3 个月',
    headline: '肛周皮肤正在收口，排便次数比治疗末段少了',
    stageLine: '肛管鳞状细胞癌 · T3N1aM0 · ⅢB 期 · HPV16 阳性',
    diagnosis: {
      histology: '鳞状细胞癌（SCC）', site: '肛管（齿状线以上）', t: 'T3（>5 cm）', n: 'N1a（直肠系膜/腹股沟）',
      m: 'M0', stage: 'ⅢB（AJCC 8th）', grade: '中分化', hpv: 'HPV16 阳性', hiv: '阴性',
      date: '2026-04-08', note: '病理原文保存在资料库；分期取自 2026-04-15 盆腔 MRI 与 PET-CT。'
    },
    care: {
      path: '根治性放化疗（Nigro 方案）', intent: 'definitive',
      started: '2026-05-06', ended: '2026-07-10',
      regimen: '丝裂霉素 C（MMC）第 1、29 天 + 5-FU 持续输注第 1–4、29–32 天',
      rt: 'IMRT 54 Gy / 30 次，盆腔 + 双侧腹股沟预防照射',
      surgery: null,
      next: '2026-11-25 复查（肛门指检 + 腹股沟触诊 + 盆腔 MRI）'
    },
    riskFlags: [
      { tone: 'warn', title: '肛周湿性脱皮已结痂，但坐位仍疼', detail: '7 月中旬最重（RTOG 3 级），目前 0–1 级；避免长时间坐硬椅。' },
      { tone: 'info', title: '排便 3–4 次/日，伴里急后重', detail: '治疗结束后 3 个月仍高于基线，属于需要写进复查问题的症状。' },
      { tone: 'info', title: '血红蛋白 125 g/L，较最低点回升', detail: '未输血；是否继续补铁按医生意见。' }
    ],
    metrics: [
      { key: 'weight', points: [P('2026-04-24',62.4),P('2026-05-08',61.2),P('2026-05-22',60.4),P('2026-06-05',59.3),P('2026-06-19',58.6),P('2026-07-03',57.8),P('2026-07-17',57.4,'治疗结束'),P('2026-07-31',57.9),P('2026-08-14',58.3),P('2026-08-28',58.8),P('2026-09-11',59.2),P('2026-09-25',59.6),P('2026-10-09',60.0),P('2026-10-20',60.3)] },
      { key: 'albumin', points: [P('2026-04-24',41.2),P('2026-05-08',40.1),P('2026-05-22',38.4),P('2026-06-05',37.2),P('2026-06-19',36.1),P('2026-07-03',35.4),P('2026-07-17',36.2),P('2026-08-14',37.8),P('2026-09-11',39.0),P('2026-10-09',40.2)] },
      { key: 'hemoglobin', points: [P('2026-04-24',128),P('2026-05-08',121),P('2026-05-22',115),P('2026-06-05',109),P('2026-06-19',105),P('2026-07-03',104),P('2026-07-17',108),P('2026-08-14',115),P('2026-09-11',121),P('2026-10-09',125)] },
      { key: 'anal_skin_grade', points: [P('2026-05-08',0),P('2026-05-22',1),P('2026-06-05',2),P('2026-06-19',3),P('2026-07-03',2),P('2026-07-17',1),P('2026-08-14',1),P('2026-09-11',0),P('2026-10-09',0)] },
      { key: 'bowel_frequency', points: [P('2026-04-24',1),P('2026-05-22',3),P('2026-06-05',5),P('2026-06-19',7),P('2026-07-03',6),P('2026-07-17',5),P('2026-08-14',4),P('2026-09-11',4),P('2026-10-09',3)] },
      { key: 'pain_nrs', points: [P('2026-05-22',2),P('2026-06-05',4),P('2026-06-19',6),P('2026-07-03',5),P('2026-07-17',3),P('2026-08-14',2),P('2026-09-11',1),P('2026-10-09',1)] }
    ],
    events: [
      { date: '2026-04-08', type: 'diagnosis', title: '活检确诊肛管鳞癌', detail: '肛门镜活检；病理 SCC，HPV16 阳性。' },
      { date: '2026-04-15', type: 'imaging', title: '盆腔 MRI + PET-CT 分期', detail: 'T3N1aM0；腹股沟淋巴结短径 9 mm。' },
      { date: '2026-05-06', type: 'radiotherapy', title: '根治性放化疗开始', detail: 'IMRT 54 Gy/30f；MMC + 5-FU。', end: '2026-07-10' },
      { date: '2026-05-20', type: 'chemo', title: '第 2 周期化疗（MMC d29）', detail: null },
      { date: '2026-06-17', type: 'visit', title: '放疗中期的皮肤评估', detail: 'RTOG 3 级湿性脱皮，暂停 3 天后继续。' },
      { date: '2026-07-10', type: 'radiotherapy', title: '放疗结束（54 Gy）', detail: '未完成计划剂量 0 次；因皮肤反应中断 3 天。' },
      { date: '2026-09-02', type: 'visit', title: '治疗结束后第一次复查', detail: '肛门指检未触及明显肿块；建议 3 个月后 MRI。' }
    ],
    symptoms: [
      { term: '肛周疼痛', ctcae: 'Proctitis', grade: 2, onset: '2026-05-18', resolved: '2026-08-20', note: '坐位与排便时明显。' },
      { term: '腹泻 / 排便次数增多', ctcae: 'Diarrhea', grade: 2, onset: '2026-05-25', resolved: null, note: '每日 3–4 次，晨起集中。' },
      { term: '里急后重', ctcae: 'Proctitis', grade: 2, onset: '2026-06-02', resolved: null, note: '便意频繁但排不出。' },
      { term: '放射性皮炎（肛周）', ctcae: 'Radiation dermatitis', grade: 3, onset: '2026-06-10', resolved: '2026-08-05', note: '湿性脱皮，7 月中结痂。' },
      { term: '疲乏', ctcae: 'Fatigue', grade: 2, onset: '2026-05-20', resolved: '2026-09-01', note: null },
      { term: '轻度大便失禁（排气）', ctcae: 'Fecal incontinence', grade: 1, onset: '2026-07-01', resolved: null, note: '每周 1–2 次，多在腹泻日。' }
    ],
    bowel: [
      { date: '2026-05-22', moves: 3, bristol: 6, urgency: 1, incontinence: 0, tenesmus: 1, blood: 0, note: null },
      { date: '2026-06-05', moves: 5, bristol: 6, urgency: 2, incontinence: 0, tenesmus: 2, blood: 1, note: '擦拭见少量血丝' },
      { date: '2026-06-19', moves: 7, bristol: 7, urgency: 3, incontinence: 1, tenesmus: 2, blood: 1, note: '最重的一周' },
      { date: '2026-07-03', moves: 6, bristol: 6, urgency: 2, incontinence: 0, tenesmus: 2, blood: 1, note: null },
      { date: '2026-08-14', moves: 4, bristol: 5, urgency: 2, incontinence: 0, tenesmus: 1, blood: 0, note: null },
      { date: '2026-09-11', moves: 4, bristol: 4, urgency: 1, incontinence: 0, tenesmus: 1, blood: 0, note: null },
      { date: '2026-10-09', moves: 3, bristol: 4, urgency: 1, incontinence: 0, tenesmus: 1, blood: 0, note: '较上次无变化' }
    ],
    skin: [
      { date: '2026-05-08', rtog: 0, ctcae: null, moist: 0, pain: 0, note: '基线' },
      { date: '2026-05-22', rtog: 1, ctcae: 1, moist: 0, pain: 2, note: '淡红斑，干性脱皮' },
      { date: '2026-06-05', rtog: 2, ctcae: 2, moist: 1, pain: 4, note: '片状湿性脱皮，皱褶内' },
      { date: '2026-06-19', rtog: 3, ctcae: 3, moist: 1, pain: 6, note: '融合湿性脱皮，暂停放疗 3 天' },
      { date: '2026-07-03', rtog: 2, ctcae: 2, moist: 1, pain: 5, note: '渗液减少' },
      { date: '2026-07-17', rtog: 1, ctcae: 1, moist: 0, pain: 3, note: '结痂' },
      { date: '2026-08-14', rtog: 1, ctcae: 1, moist: 0, pain: 2, note: null },
      { date: '2026-09-11', rtog: 0, ctcae: null, moist: 0, pain: 1, note: '上皮完整' },
      { date: '2026-10-09', rtog: 0, ctcae: null, moist: 0, pain: 1, note: null }
    ],
    ostomy: [],
    followups: [
      { planned: '2026-09-02', done: '2026-09-02', type: '治疗后首次评估', dre: 1, inguinal: 1, anoscopy: 1, imaging: '盆腔 MRI（2026-09-02）', result: '未见明显残留肿块；腹股沟淋巴结 6 mm。', next: '2026-11-25' },
      { planned: '2026-11-25', done: null, type: '3 个月随访', dre: null, inguinal: null, anoscopy: null, imaging: '盆腔 MRI 待做', result: null, next: null },
      { planned: '2027-02-25', done: null, type: '6 个月随访', dre: null, inguinal: null, anoscopy: null, imaging: '胸部 CT 待定', result: null, next: null }
    ],
    questions: [
      { text: '排便 3–4 次/日、总有便意，需要做肛门测压或生物反馈吗？', cat: '肠道功能', priority: 1, status: 'open' },
      { text: '肛周皮肤已经结痂，还能不能恢复坐浴？', cat: '皮肤护理', priority: 1, status: 'open' },
      { text: '这次 MRI 显示淋巴结 6 mm，需要加做 PET 吗？', cat: '复查', priority: 2, status: 'open' },
      { text: '什么时候可以恢复性生活？需要注意什么？', cat: '生活', priority: 2, status: 'open' }
    ],
    viewpoints: [
      { text: '我担心现在每天跑厕所是因为治疗伤到了括约肌，而不是还没恢复。', date: '2026-10-12', about: '排便功能' },
      { text: '皮肤结痂以后我就不敢坐浴了，怕泡坏了。', date: '2026-09-28', about: '皮肤护理' }
    ],
    docs: [
      { id: 'd1', title: '2026-04-08 肛门镜活检病理报告', type: '病理', date: '2026-04-08', status: '已确认', pages: 2 },
      { id: 'd2', title: '2026-04-15 盆腔 MRI 报告', type: '影像', date: '2026-04-15', status: '已确认', pages: 4 },
      { id: 'd3', title: '2026-05-05 放疗计划单（54 Gy/30f）', type: '放疗', date: '2026-05-05', status: '已确认', pages: 3 },
      { id: 'd4', title: '2026-07-10 出院小结', type: '出院', date: '2026-07-10', status: '已确认', pages: 5 },
      { id: 'd5', title: '2026-09-02 复查记录（手写）', type: '门诊', date: '2026-09-02', status: '待核对', pages: 1 },
      { id: 'd6', title: '2026-10-09 血常规 + 生化', type: '化验', date: '2026-10-09', status: '已确认', pages: 1 }
    ],
    candidates: [
      { doc: 'd5', field: '肛门指检', value: '未触及明显肿块', confidence: 0.82, status: 'pending' },
      { doc: 'd5', field: '下一步复查', value: '3 个月后盆腔 MRI', confidence: 0.74, status: 'pending' },
      { doc: 'd6', field: '血红蛋白', value: '125 g/L', confidence: 0.96, status: 'pending' },
      { doc: 'd6', field: '白蛋白', value: '40.2 g/L', confidence: 0.96, status: 'pending' }
    ],
    trialKeys: ['NCT04166318', 'NCT03233711', 'NCT05282537']
  }
}

function profileB() {
  return {
    key: 'zhou',
    name: '周先生',
    avatar: '周',
    age: 63,
    sex: 'male',
    meta: '63 岁 · 肛管鳞癌 APR 术后 8 个月 · 永久性结肠造口',
    headline: '造口排出稳定，正在学着把复查和日常排进同一张表',
    stageLine: '肛管鳞状细胞癌 · T4N1aM0 · ⅢB 期 · 放化疗未控后 salvage APR',
    diagnosis: {
      histology: '鳞状细胞癌（SCC）', site: '肛管（累及外括约肌）', t: 'T4（侵犯邻近器官）', n: 'N1a',
      m: 'M0', stage: 'ⅢB（AJCC 8th）', grade: '低分化', hpv: 'HPV 阴性', hiv: '阴性',
      date: '2025-09-12', note: '首诊在外院；放化疗后 8 周评估为未控，2026-02 行腹会阴联合切除。'
    },
    care: {
      path: '放化疗未控 → 腹会阴联合切除（APR）+ 永久性乙状结肠造口', intent: 'salvage',
      started: '2025-10-08', ended: '2026-02-18',
      regimen: '一线：MMC + 5-FU 同步放疗 50.4 Gy（2025-10-08 至 2025-12-05）',
      rt: 'VMAT 50.4 Gy / 28 次',
      surgery: '2026-02-18 APR，乙状结肠单腔造口；切缘阴性（R0）',
      next: '2026-11-04 造口门诊 + 肿瘤复查'
    },
    riskFlags: [
      { tone: 'warn', title: '造口周围皮肤 1 级，底板边缘有渗漏', detail: '近 2 周更换底盘时发现皮肤发红，长度约 2 cm；已改用凸面底盘。' },
      { tone: 'info', title: '体重比术前低 3 kg，近 2 个月持平', detail: '白蛋白 40 g/L，不需要额外营养补充的判断由医生做。' },
      { tone: 'info', title: '会阴伤口已愈合，坐位仍有牵拉感', detail: '每次不超过 40 分钟；使用中空坐垫。' }
    ],
    metrics: [
      { key: 'weight', points: [P('2026-04-02',70.2),P('2026-04-30',69.8),P('2026-05-28',69.1),P('2026-06-25',69.4),P('2026-07-23',70.0),P('2026-08-20',70.4),P('2026-09-17',70.9),P('2026-10-15',71.6)] },
      { key: 'albumin', points: [P('2026-04-02',37.8),P('2026-05-28',38.2),P('2026-07-23',39.0),P('2026-09-17',39.6),P('2026-10-15',40.1)] },
      { key: 'hemoglobin', points: [P('2026-04-02',118),P('2026-05-28',116),P('2026-07-23',121),P('2026-09-17',125),P('2026-10-15',128)] },
      { key: 'stoma_output', points: [P('2026-04-02',1),P('2026-05-28',1),P('2026-06-25',2),P('2026-07-23',1),P('2026-08-20',1),P('2026-09-17',0),P('2026-10-15',0)] }
    ],
    events: [
      { date: '2026-02-18', type: 'surgery', title: '腹会阴联合切除（APR）+ 乙状结肠造口', detail: '手术时间 5 小时 20 分；R0 切除。' },
      { date: '2026-03-02', type: 'visit', title: '术后第一次造口门诊', detail: '底盘型号改为 45 mm 凸面。' },
      { date: '2026-05-14', type: 'imaging', title: '术后 3 个月盆腔 MRI', detail: '未见复发征象。' },
      { date: '2026-08-06', type: 'visit', title: '术后 6 个月复查', detail: 'CEA 2.1；造口周围皮肤 1 级。' }
    ],
    symptoms: [
      { term: '造口周围皮肤刺激', ctcae: 'Dermatitis', grade: 1, onset: '2026-08-20', resolved: null, note: '底板渗漏后出现。' },
      { term: '会阴伤口牵拉感', ctcae: 'Pain', grade: 1, onset: '2026-04-01', resolved: null, note: '久坐后明显。' },
      { term: '排气增多', ctcae: 'Flatulence', grade: 1, onset: '2026-03-10', resolved: null, note: '与饮食相关。' }
    ],
    bowel: [],
    skin: [],
    ostomy: [
      { date: '2026-04-02', output: 3, consistency: '半成形', leaks: 0, skin: 0, note: '底盘 3 天更换一次' },
      { date: '2026-05-28', output: 3, consistency: '半成形', leaks: 1, skin: 0, note: '一次夜间渗漏' },
      { date: '2026-06-25', output: 4, consistency: '稀糊', leaks: 1, skin: 1, note: '吃了凉拌菜后' },
      { date: '2026-07-23', output: 3, consistency: '半成形', leaks: 0, skin: 1, note: null },
      { date: '2026-08-20', output: 2, consistency: '成形', leaks: 0, skin: 1, note: '改用凸面底盘' },
      { date: '2026-09-17', output: 2, consistency: '成形', leaks: 0, skin: 0, note: null },
      { date: '2026-10-15', output: 2, consistency: '成形', leaks: 0, skin: 0, note: '皮肤已恢复' }
    ],
    followups: [
      { planned: '2026-08-06', done: '2026-08-06', type: '术后 6 个月', dre: 0, inguinal: 1, anoscopy: 0, imaging: '盆腔 MRI（2026-05-14）', result: '未见复发；造口皮肤 1 级。', next: '2026-11-04' },
      { planned: '2026-11-04', done: null, type: '造口门诊 + 肿瘤复查', dre: null, inguinal: null, anoscopy: null, imaging: '胸部/腹盆 CT 待定', result: null, next: null }
    ],
    questions: [
      { text: '造口底盘多久换一次更合适？现在 3 天一次，边缘会翘。', cat: '造口护理', priority: 1, status: 'open' },
      { text: '会阴伤口坐久了会牵拉，需要做盆底康复吗？', cat: '术后恢复', priority: 2, status: 'open' },
      { text: 'HPV 阴性是不是家里人就不用做检查？', cat: '风险与家人', priority: 2, status: 'open' }
    ],
    viewpoints: [
      { text: '我不太敢出门太久，怕造口袋鼓起来被人看出来。', date: '2026-09-20', about: '造口与社交' }
    ],
    docs: [
      { id: 'e1', title: '2025-09-12 外院活检病理', type: '病理', date: '2025-09-12', status: '已确认', pages: 2 },
      { id: 'e2', title: '2026-02-18 手术记录（APR）', type: '手术', date: '2026-02-18', status: '已确认', pages: 6 },
      { id: 'e3', title: '2026-05-14 盆腔 MRI', type: '影像', date: '2026-05-14', status: '已确认', pages: 5 },
      { id: 'e4', title: '2026-08-06 复查记录', type: '门诊', date: '2026-08-06', status: '已确认', pages: 2 }
    ],
    candidates: [
      { doc: 'e4', field: 'CEA', value: '2.1 ng/mL', confidence: 0.93, status: 'pending' },
      { doc: 'e4', field: '造口皮肤分级', value: '1 级', confidence: 0.70, status: 'pending' }
    ],
    trialKeys: ['NCT03233711', 'NCT05282537']
  }
}

export function buildDemoProfiles() {
  return {
    generatedAt: NOW,
    window: WINDOW,
    disclaimer: '演示档案为模拟资料，不对应任何真实患者；临床试验条目为登记摘录，状态未核实。',
    metrics: METRIC_DEFS,
    scales: SCALES,
    profiles: [profileA(), profileB()]
  }
}

/* ---------------- 落库（仅 CLI 执行时） ---------------- */
async function main() {
  const data = buildDemoProfiles()
  const dbPath = join(ROOT, 'demo/demo-data.sqlite')
  await rm(dbPath, { force: true })
  const db = new DatabaseSync(dbPath)
  const schema = await (await import('node:fs/promises')).readFile(join(ROOT, 'schema/0001_initial.sql'), 'utf8')
  db.exec(schema)
  db.exec('BEGIN')
  const now = NOW + 'T09:00:00Z'

  for (const m of data.metrics) {
    db.prepare('INSERT INTO metric_defs(metric_key,label,kind,unit,scale_key,color,group_key,display_order) VALUES (?,?,?,?,?,?,?,?)')
      .run(m.key, m.label, m.kind, m.unit ?? null, m.scale ?? null, m.color, m.group, m.order)
  }
  for (const [scale, rows] of Object.entries(data.scales)) {
    for (const r of rows) db.prepare('INSERT INTO metric_scales(scale_key,ordinal,label,short,tone) VALUES (?,?,?,?,?)').run(scale, r.ordinal, r.label, r.short, r.tone)
  }

  for (const p of data.profiles) {
    db.prepare('INSERT INTO profiles(profile_key,display_name,birth_year,sex,created_at,updated_at) VALUES (?,?,?,?,?,?)')
      .run(p.key, p.name, 2026 - p.age, p.sex, now, now)
    db.prepare(`INSERT INTO diagnoses(profile_key,version,histology,primary_site,t_stage,n_stage,m_stage,ajcc_edition,grade,hpv_status,hiv_status,diagnosed_on,note,recorded_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(p.key, 1, p.diagnosis.histology, p.diagnosis.site, p.diagnosis.t, p.diagnosis.n, p.diagnosis.m, '8th',
        p.diagnosis.grade, p.diagnosis.hpv, p.diagnosis.hiv, p.diagnosis.date, p.diagnosis.note, now)
    db.prepare(`INSERT INTO treatment_lines(profile_key,seq,intent,modality,regimen,started_on,ended_on,outcome,note,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(p.key, 1, p.care.intent, p.care.intent === 'salvage' ? 'CRT→surgery' : 'CRT',
      p.care.regimen, p.care.started, p.care.ended, p.care.path, p.care.note ?? null, now)
    for (const e of p.events) {
      db.prepare('INSERT INTO events(profile_key,event_type,title,event_date,end_date,detail_json,created_at) VALUES (?,?,?,?,?,?,?)')
        .run(p.key, e.type, e.title, e.date, e.end ?? null, JSON.stringify({ detail: e.detail }), now)
    }
    for (const m of p.metrics) {
      for (const pt of m.points) {
        const def = METRIC_DEFS.find(d => d.key === m.key)
        if (def.kind === 'numeric') {
          db.prepare('INSERT INTO metric_points(profile_key,metric_key,measured_on,value_num,value_text,ordinal_value,unit,note,entered_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
            .run(p.key, m.key, pt.date, pt.value, null, null, def.unit, pt.note ?? null, 'demo', now)
        } else {
          db.prepare('INSERT INTO metric_points(profile_key,metric_key,measured_on,value_num,value_text,ordinal_value,unit,note,entered_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
            .run(p.key, m.key, pt.date, null, null, pt.value, null, pt.note ?? null, 'demo', now)
        }
      }
    }
    for (const s of p.symptoms) {
      db.prepare('INSERT INTO symptoms(profile_key,term,ctcae_term,grade,onset_on,resolved_on,note,created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(p.key, s.term, s.ctcae, s.grade, s.onset, s.resolved, s.note, now)
    }
    for (const b of p.bowel) {
      db.prepare('INSERT INTO bowel_logs(profile_key,logged_on,bowel_moves,bristol_type,urgency,incontinence_episodes,tenesmus,blood,note,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .run(p.key, b.date, b.moves, b.bristol, b.urgency, b.incontinence, b.tenesmus, b.blood, b.note, now)
    }
    for (const s of p.skin) {
      db.prepare('INSERT INTO skin_assessments(profile_key,assessed_on,site,rtog_grade,ctcae_grade,moist_desquamation,pain_nrs,note,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(p.key, s.date, 'perianal', s.rtog, s.ctcae, s.moist, s.pain, s.note, now)
    }
    for (const o of p.ostomy) {
      db.prepare('INSERT INTO ostomy_logs(profile_key,logged_on,stoma_type,output_count,consistency,leaks,skin_grade,note,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(p.key, o.date, 'colostomy', o.output, o.consistency, o.leaks, o.skin, o.note, now)
    }
    for (const f of p.followups) {
      db.prepare('INSERT INTO followups(profile_key,planned_on,done_on,visit_type,dre_done,inguinal_exam,anoscopy,imaging,result_summary,next_due_on,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .run(p.key, f.planned, f.done, f.type, f.dre, f.inguinal, f.anoscopy, f.imaging, f.result, f.next, now)
    }
    for (const q of p.questions) {
      db.prepare('INSERT INTO questions(profile_key,text,category,priority,status,created_at) VALUES (?,?,?,?,?,?)')
        .run(p.key, q.text, q.cat, q.priority, q.status, now)
    }
    for (const v of p.viewpoints) {
      db.prepare('INSERT INTO viewpoints(profile_key,text,recorded_on,recorded_by,about,created_at) VALUES (?,?,?,?,?,?)')
        .run(p.key, v.text, v.date, 'user', v.about, now)
    }
    for (const d of p.docs) {
      db.prepare('INSERT INTO documents(profile_key,title,doc_type,captured_on,parse_status,created_at) VALUES (?,?,?,?,?,?)')
        .run(p.key, d.title, d.type, d.date, d.status === '待核对' ? 'parsed' : 'parsed', now)
    }
    for (const c of p.candidates) {
      db.prepare('INSERT INTO candidates(document_id,field_key,value_text,confidence,status,created_at) VALUES (?,?,?,?,?,?)')
        .run(Number(c.doc.replace(/\D/g, '')), c.field, c.value, c.confidence, c.status, now)
    }
  }
  db.exec('COMMIT')
  const counts = ['profiles','diagnoses','events','metric_points','symptoms','bowel_logs','skin_assessments','ostomy_logs','followups','questions','viewpoints'].map(t => `${t}=${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c}`)
  db.close()

  const js = `/* 生成物：由 demo/build-demo-data.mjs 产出，不手改。${data.disclaimer} */\nwindow.DEMO_DATA = ${JSON.stringify(data, null, 1)};\n`
  await writeFile(join(ROOT, 'prototypes/v0.2/demo-data.js'), js)
  console.log(JSON.stringify({ db: dbPath, counts }))
}

if (process.argv[1] && process.argv[1].endsWith('build-demo-data.mjs')) {
  await main()
}
