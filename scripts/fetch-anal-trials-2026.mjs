#!/usr/bin/env node
/* 肛管癌临床试验采集（2026 口径）。
   通道：ClinicalTrials.gov API v2（对应 unified-trial-search-mcp 的 ctv 深度通道）。
   其他通道（WHO ICTRP / ChiCTR 在线 / CDE）本轮未配置，终态如实写入 trial_sources，
   不把"没查到"写成"不存在"。
   用法：node scripts/fetch-anal-trials-2026.mjs [--dry-run]
   输出：research/anal-cancer/{trials-2026.jsonl, anal_cancer_trials_2026.sqlite, manifest.json}
*/
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'research/anal-cancer')
const DRY = process.argv.includes('--dry-run')
const TODAY = '2026-10-21'
const FIELDS = ['NCTId','BriefTitle','OfficialTitle','OverallStatus','Phase','StudyType','LeadSponsorName',
  'EnrollmentCount','StartDate','PrimaryCompletionDate','CompletionDate','Condition','InterventionName',
  'InterventionType','BriefSummary','EligibilityCriteria','LocationCountry','LocationFacility',
  'LastUpdatePostDate','StudyFirstPostDate','OrgStudyId'].join(',')

const QUERIES = ['anal cancer','anal squamous cell carcinoma','anal canal carcinoma']
const INCLUDE = /anal (canal|squamous|margin|carcinoma|cancer)|carcinoma of the anal|anal\s+(scc|hsil)|perianal/i
const EXCLUDE = /analgesi|anal fissure|anal fistula|analgesic|fistula-in-ano|hemorrhoid/i

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function fetchQuery(cond) {
  let token = null, out = [], pages = 0
  do {
    const params = new URLSearchParams({
      'query.cond': cond, pageSize: '100', fields: FIELDS,
      'filter.advanced': 'AREA[StudyType]INTERVENTIONAL'
    })
    if (token) params.set('pageToken', token)
    const url = `https://clinicaltrials.gov/api/v2/studies?${params}`
    const res = await fetch(url, { headers: { 'user-agent': 'xyb-anal-workbench/0.1 (research; contact: community)' } })
    if (!res.ok) throw new Error(`${cond}: HTTP ${res.status}`)
    const body = await res.json()
    out.push(...(body.studies || []))
    token = body.nextPageToken || null
    pages++
    await sleep(350)
  } while (token && pages < 12)
  return { records: out, pages, complete: !token }
}

const pick = (s, path, fallback = null) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), s) ?? fallback

function normalize(study, query) {
  const p = study.protocolSection || {}
  const id = p.identificationModule || {}
  const st = p.statusModule || {}
  const des = p.designModule || {}
  const sp = p.sponsorCollaboratorsModule || {}
  const conds = (p.conditionsModule?.conditions) || []
  const ints = (p.armsInterventionsModule?.interventions) || []
  const locs = (p.contactsLocationsModule?.locations) || []
  const countries = [...new Set(locs.map(l => l.country).filter(Boolean))]
  const china = locs.filter(l => /China|China \(Mainland\)/i.test(l.country || ''))
  const phases = des.phases || []
  return {
    trial_key: `ctgov:${id.nctId}`,
    source: 'ctgov',
    source_id: id.nctId,
    nct_id: id.nctId,
    title: id.briefTitle || '',
    official_title: id.officialTitle || '',
    status: st.overallStatus || '',
    phase: phases.join('/') || 'NA',
    study_type: des.studyType || '',
    sponsor: sp.leadSponsor?.name || '',
    enrollment: des.enrollmentInfo?.count ?? null,
    start_date: st.startDateStruct?.date || null,
    primary_completion: st.primaryCompletionDateStruct?.date || null,
    completion: st.completionDateStruct?.date || null,
    conditions: conds.join(' | '),
    interventions: ints.map(i => `${i.type || ''}:${i.name || ''}`).join(' | '),
    summary: p.descriptionModule?.briefSummary || '',
    eligibility: p.eligibilityModule?.eligibilityCriteria || '',
    countries: countries.join(' | '),
    china_sites: china.map(l => [l.facility, l.city, l.state].filter(Boolean).join(', ')).join(' | '),
    url: `https://clinicaltrials.gov/study/${id.nctId}`,
    first_posted: st.studyFirstPostDateStruct?.date || null,
    last_update: st.lastUpdatePostDateStruct?.date || null,
    fetched_at: TODAY,
    query
  }
}

function relevant(r) {
  const b = `${r.title} ${r.official_title} ${r.conditions} ${r.summary}`
  return INCLUDE.test(b) && !EXCLUDE.test(b)
}

const now = new Date().toISOString()
const sourceRows = []
let all = []
for (const q of QUERIES) {
  try {
    const { records, pages, complete } = await fetchQuery(q)
    const norm = records.map(s => normalize(s, q))
    const kept = norm.filter(relevant)
    all.push(...kept)
    sourceRows.push({ source: 'ctgov', query: q, status: complete ? 'ok' : 'truncated', records_fetched: norm.length, records_kept: kept.length, pages, note: complete ? 'API v2 全量分页' : '达到 12 页上限，结果截断', fetched_at: now })
    console.log(`[ctgov] ${q}: fetched ${norm.length}, kept ${kept.length}, pages ${pages}`)
  } catch (e) {
    sourceRows.push({ source: 'ctgov', query: q, status: 'error', records_fetched: 0, records_kept: 0, pages: 0, note: String(e.message).slice(0, 200), fetched_at: now })
    console.error(`[ctgov] ${q}: ${e.message}`)
  }
}
const map = new Map()
for (const r of all) if (!map.has(r.trial_key)) map.set(r.trial_key, r)
const rows = [...map.values()].sort((a, b) => String(b.last_update || '').localeCompare(String(a.last_update || '')))
console.log(`deduped: ${rows.length} (from ${all.length})`)

// 未配置通道：如实记录终态，不伪造 0 条结果
for (const s of [
  { source: 'ictrp', query: 'anal cancer', status: 'not_configured', note: 'WHO ICTRP 在线通道本轮未接入：需 unified-trial-mcp 会话与凭据', records_fetched: 0, records_kept: 0, pages: 0 },
  { source: 'chictr_online', query: '肛管癌', status: 'not_configured', note: 'ChiCTR 在线通道本轮未接入；离线语料仅覆盖胰腺癌，对本癌种无覆盖', records_fetched: 0, records_kept: 0, pages: 0 },
  { source: 'chinadrugtrials', query: '肛管癌', status: 'not_configured', note: 'CDE 通道本轮未接入（含研究者 PI 字段，需 dry-run 同步）', records_fetched: 0, records_kept: 0, pages: 0 }
]) sourceRows.push({ ...s, fetched_at: now })

if (DRY) {
  console.log(JSON.stringify({ dryRun: true, total: rows.length, kept: rows.length, sources: sourceRows }, null, 2))
  process.exit(0)
}

await mkdir(OUT, { recursive: true })
const jsonl = rows.map(r => JSON.stringify(r)).join('\n') + '\n'
await writeFile(join(OUT, 'trials-2026.jsonl'), jsonl)
const sha = createHash('sha256').update(jsonl).digest('hex')

const dbPath = join(OUT, 'anal_cancer_trials_2026.sqlite')
await rm(dbPath, { force: true })
const db = new DatabaseSync(dbPath)
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE trial_records(
  trial_key TEXT PRIMARY KEY, source TEXT NOT NULL, source_id TEXT NOT NULL,
  nct_id TEXT, title TEXT NOT NULL, official_title TEXT, status TEXT, phase TEXT,
  study_type TEXT, sponsor TEXT, enrollment INTEGER, start_date TEXT,
  primary_completion TEXT, completion TEXT, conditions TEXT, interventions TEXT,
  summary TEXT, eligibility TEXT, countries TEXT, china_sites TEXT, url TEXT,
  first_posted TEXT, last_update TEXT, fetched_at TEXT NOT NULL, query TEXT
);
CREATE TABLE trial_sources(
  id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT NOT NULL, query TEXT,
  status TEXT NOT NULL, records_fetched INTEGER NOT NULL, records_kept INTEGER NOT NULL,
  pages INTEGER NOT NULL, note TEXT, fetched_at TEXT NOT NULL
);
CREATE TABLE collection_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE INDEX idx_trial_status ON trial_records(status);
CREATE INDEX idx_trial_phase ON trial_records(phase);
`)
const cols = ['trial_key','source','source_id','nct_id','title','official_title','status','phase','study_type','sponsor','enrollment','start_date','primary_completion','completion','conditions','interventions','summary','eligibility','countries','china_sites','url','first_posted','last_update','fetched_at','query']
const ins = db.prepare(`INSERT INTO trial_records(${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
for (const r of rows) ins.run(...cols.map(c => r[c] ?? null))
const insSrc = db.prepare(`INSERT INTO trial_sources(source,query,status,records_fetched,records_kept,pages,note,fetched_at) VALUES (?,?,?,?,?,?,?,?)`)
for (const s of sourceRows) insSrc.run(s.source, s.query, s.status, s.records_fetched, s.records_kept, s.pages, s.note, s.fetched_at)
const meta = db.prepare('INSERT INTO collection_meta(key,value) VALUES (?,?)')
for (const [k, v] of Object.entries({ dataset: 'anal_cancer_trials_2026', cutoff: TODAY, records: String(rows.length), sha256: sha, channel_note: '仅 ctgov 在线通道；ICTRP/ChiCTR/CDE 未配置' })) meta.run(k, v)
const count = db.prepare('SELECT COUNT(*) c FROM trial_records').get().c
db.close()

await writeFile(join(OUT, 'manifest.json'), JSON.stringify({
  dataset: 'anal-cancer-trials-2026', cancer: '肛管癌（anal cancer / anal SCC）',
  cutoff: TODAY, generated_at: now, source_channels: sourceRows,
  records: rows.length, files: { jsonl: 'trials-2026.jsonl', sqlite: 'anal_cancer_trials_2026.sqlite' },
  sha256: { 'trials-2026.jsonl': sha }, assertions: { jsonl_lines: rows.length, sqlite_records: count }, notes: [
    '登记状态，未核实；登记 ≠ 有效 ≠ 安全 ≠ 可入组',
    '仅 ClinicalTrials.gov API v2 在线通道；其余三通道本轮未配置',
    '检索式：cond in [anal cancer, anal squamous cell carcinoma, anal canal carcinoma]，限介入性研究，关键词相关性与排除词过滤'
  ]
}, null, 2) + '\n')
console.log(JSON.stringify({ sqlite: dbPath, records: count, sha256: sha, sources: sourceRows.map(s => `${s.source}:${s.status}`) }))
