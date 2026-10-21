-- 小萌宝 AnalPal · 肛管癌工作台 · 初始数据模型 v0.1
-- 冻结于 2026-10-21。此后改结构只能新增 0002_*.sql，不得修改本文件。
-- 四条契约（docs/SCHEMA-SPEC.md）：
--   ① 看法恒不为结论：viewpoints 无 is_conclusion，只有 recorded_by；
--   ② 缺失恒为 NULL：缺一侧淋巴结短径不写入 0，也不生成差值（paired_measures 由视图判定）；
--   ③ 更正只新增版本：diagnoses / treatment_lines 以 version + supersedes_id 追加；
--   ④ 事实四层不合并：documents（原文）→ candidates（候选）→（record 层）→ metric_points（指标）。
PRAGMA foreign_keys = ON;

-- ========== 档案层 ==========
CREATE TABLE profiles (
  profile_key   TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  birth_year    INTEGER,
  sex           TEXT CHECK (sex IN ('female','male','other','unknown')),
  city          TEXT,
  primary_lang  TEXT DEFAULT 'zh-CN',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  archived_at   TEXT
);

CREATE TABLE preferences (
  profile_key TEXT NOT NULL REFERENCES profiles(profile_key),
  key         TEXT NOT NULL,
  value       TEXT,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (profile_key, key)
);

-- 诊断：一次诊断一条版本；更正新增行并指向被替代行
CREATE TABLE diagnoses (
  diagnosis_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  version       INTEGER NOT NULL DEFAULT 1,
  supersedes_id INTEGER REFERENCES diagnoses(diagnosis_id),
  histology     TEXT,                -- 鳞状细胞癌 / 腺癌 / 其他
  primary_site  TEXT,                -- 肛管 / 肛缘
  t_stage       TEXT,
  n_stage       TEXT,
  m_stage       TEXT,
  ajcc_edition  TEXT DEFAULT '8th',
  grade         TEXT,
  hpv_status    TEXT,                -- positive / negative / unknown
  hiv_status    TEXT,
  diagnosed_on  TEXT,
  source_document_id INTEGER,
  note          TEXT,
  recorded_at   TEXT NOT NULL
);
CREATE INDEX idx_diag_profile ON diagnoses(profile_key);

-- 双侧测量（腹股沟淋巴结短径等）。缺一侧 → 该侧 NULL，不补 0、不算差值。
CREATE TABLE paired_measures (
  measure_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key  TEXT NOT NULL REFERENCES profiles(profile_key),
  measure_key  TEXT NOT NULL,        -- inguinal_node_short_axis
  measured_on  TEXT NOT NULL,
  side         TEXT NOT NULL CHECK (side IN ('left','right')),
  value_num    REAL,
  unit         TEXT,
  source_document_id INTEGER,
  note         TEXT,
  created_at   TEXT NOT NULL,
  UNIQUE (profile_key, measure_key, measured_on, side)
);

-- ========== 事实四层：文档 / 候选 / 记录 / 指标 ==========
CREATE TABLE documents (
  document_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key  TEXT NOT NULL REFERENCES profiles(profile_key),
  title        TEXT NOT NULL,
  doc_type     TEXT,                 -- discharge / pathology / imaging / lab / radiotherapy / photo
  source_path  TEXT,                 -- 用户资料目录内的相对路径；原件不复制
  sha256       TEXT,
  captured_on  TEXT,
  parse_status TEXT NOT NULL DEFAULT 'not_parsed'
               CHECK (parse_status IN ('not_parsed','parsing','parsed','failed')),
  parse_note   TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX idx_doc_profile ON documents(profile_key, captured_on);

CREATE TABLE candidates (
  candidate_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id       INTEGER NOT NULL REFERENCES documents(document_id),
  field_key         TEXT NOT NULL,
  raw_label         TEXT,
  value_text        TEXT,
  value_num         REAL,
  unit              TEXT,
  confidence        REAL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','rejected')),
  accepted_record   TEXT,            -- 接受后落到哪张表 / 哪一行（metric_points:12）
  reviewed_at       TEXT,
  created_at        TEXT NOT NULL
);
CREATE INDEX idx_cand_doc ON candidates(document_id, status);

CREATE TABLE metric_points (
  point_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  metric_key    TEXT NOT NULL,
  measured_on   TEXT NOT NULL,
  value_num     REAL,
  value_text    TEXT,
  ordinal_value INTEGER,             -- 分类指标用序位，不写数值
  unit          TEXT,
  note          TEXT,
  source_document_id INTEGER REFERENCES documents(document_id),
  entered_by    TEXT NOT NULL DEFAULT 'user' CHECK (entered_by IN ('user','import','demo')),
  created_at    TEXT NOT NULL,
  UNIQUE (profile_key, metric_key, measured_on, entered_by)
);
CREATE INDEX idx_point_profile ON metric_points(profile_key, metric_key, measured_on);

CREATE TABLE metric_defs (
  metric_key   TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('numeric','categorical')),
  unit         TEXT,
  scale_key    TEXT,
  color        TEXT,
  group_key    TEXT,
  display_order INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE metric_scales (
  scale_key  TEXT NOT NULL,
  ordinal    INTEGER NOT NULL,
  label      TEXT NOT NULL,
  short      TEXT,
  tone       TEXT,
  PRIMARY KEY (scale_key, ordinal)
);

-- ========== 流程事实 ==========
CREATE TABLE events (
  event_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key  TEXT NOT NULL REFERENCES profiles(profile_key),
  event_type   TEXT NOT NULL,  -- diagnosis / radiotherapy / chemo / surgery / imaging / visit / admission
  title        TEXT NOT NULL,
  event_date   TEXT NOT NULL,
  end_date     TEXT,
  detail_json  TEXT,
  source_document_id INTEGER,
  created_at   TEXT NOT NULL
);
CREATE INDEX idx_event_profile ON events(profile_key, event_date);

-- 治疗线：路径切换新增行，不覆盖旧行
CREATE TABLE treatment_lines (
  line_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  seq           INTEGER NOT NULL,
  intent        TEXT,                -- definitive / salvage / palliative
  modality      TEXT,                -- CRT / RT / surgery / systemic
  regimen       TEXT,
  started_on    TEXT,
  ended_on      TEXT,
  outcome       TEXT,
  supersedes_id INTEGER REFERENCES treatment_lines(line_id),
  note          TEXT,
  created_at    TEXT NOT NULL,
  UNIQUE (profile_key, seq)
);

-- 症状：CTCAE 分级是对严重度的描述，不是诊断
CREATE TABLE symptoms (
  symptom_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  term          TEXT NOT NULL,
  ctcae_term    TEXT,
  grade         INTEGER CHECK (grade BETWEEN 1 AND 5),
  onset_on      TEXT,
  resolved_on   TEXT,
  note          TEXT,
  source_document_id INTEGER,
  created_at    TEXT NOT NULL
);
CREATE INDEX idx_symptom_profile ON symptoms(profile_key, onset_on);

CREATE TABLE bowel_logs (
  log_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  logged_on     TEXT NOT NULL,
  bowel_moves   INTEGER,
  bristol_type  INTEGER,
  urgency       INTEGER CHECK (urgency BETWEEN 0 AND 3),
  incontinence_episodes INTEGER,
  tenesmus      INTEGER CHECK (tenesmus BETWEEN 0 AND 3),  -- 0 无 / 1 轻 / 2 中 / 3 重
  blood         INTEGER CHECK (blood IN (0,1)),
  note          TEXT,
  created_at    TEXT NOT NULL,
  UNIQUE (profile_key, logged_on)
);

CREATE TABLE skin_assessments (
  assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  assessed_on   TEXT NOT NULL,
  site          TEXT NOT NULL DEFAULT 'perianal',
  rtog_grade    INTEGER CHECK (rtog_grade BETWEEN 0 AND 4),
  ctcae_grade   INTEGER CHECK (ctcae_grade BETWEEN 1 AND 4),
  moist_desquamation INTEGER CHECK (moist_desquamation IN (0,1)),
  pain_nrs      INTEGER CHECK (pain_nrs BETWEEN 0 AND 10),
  care_json     TEXT,
  note          TEXT,
  created_at    TEXT NOT NULL,
  UNIQUE (profile_key, assessed_on, site)
);

CREATE TABLE ostomy_logs (
  log_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  logged_on     TEXT NOT NULL,
  stoma_type    TEXT,                -- colostomy / ileostomy
  output_count  INTEGER,
  consistency   TEXT,                -- formed / semi / liquid
  leaks         INTEGER,
  skin_grade    INTEGER CHECK (skin_grade BETWEEN 0 AND 4),
  note          TEXT,
  created_at    TEXT NOT NULL,
  UNIQUE (profile_key, logged_on)
);

CREATE TABLE followups (
  followup_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key   TEXT NOT NULL REFERENCES profiles(profile_key),
  planned_on    TEXT,
  done_on       TEXT,
  visit_type    TEXT,                -- post_treatment / surveillance / symptom
  dre_done      INTEGER CHECK (dre_done IN (0,1)),
  inguinal_exam INTEGER CHECK (inguinal_exam IN (0,1)),
  anoscopy      INTEGER CHECK (anoscopy IN (0,1)),
  imaging       TEXT,
  result_summary TEXT,
  next_due_on   TEXT,
  source_document_id INTEGER,
  created_at    TEXT NOT NULL
);

CREATE TABLE questions (
  question_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key  TEXT NOT NULL REFERENCES profiles(profile_key),
  text         TEXT NOT NULL,
  category     TEXT,
  priority     INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','asked','answered','archived')),
  asked_on     TEXT,
  answer_text  TEXT,
  created_at   TEXT NOT NULL
);

-- 看法：永远是"一条信息"，不是结论。表里没有 is_conclusion 这个字段可用。
CREATE TABLE viewpoints (
  viewpoint_id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key  TEXT NOT NULL REFERENCES profiles(profile_key),
  text         TEXT NOT NULL,
  recorded_on  TEXT NOT NULL,
  recorded_by  TEXT NOT NULL DEFAULT 'user',
  about        TEXT,                -- 这条看法指向什么（症状 / 复查 / 造口）
  created_at   TEXT NOT NULL
);

CREATE TABLE trial_notes (
  note_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_key  TEXT NOT NULL REFERENCES profiles(profile_key),
  trial_key    TEXT NOT NULL,       -- 跨库引用 research/anal-cancer 的 trial_key
  saved        INTEGER NOT NULL DEFAULT 1 CHECK (saved IN (0,1)),
  note         TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  UNIQUE (profile_key, trial_key)
);

-- ========== 视图：把"缺一侧"显式暴露为 NULL ==========
CREATE VIEW v_paired_delta AS
SELECT a.profile_key, a.measure_key, a.measured_on, a.value_num AS left_value,
       b.value_num AS right_value,
       CASE WHEN a.value_num IS NULL OR b.value_num IS NULL THEN NULL
            ELSE ROUND(a.value_num - b.value_num, 1) END AS delta
FROM paired_measures a
JOIN paired_measures b
  ON b.profile_key = a.profile_key AND b.measure_key = a.measure_key
 AND b.measured_on = a.measured_on AND b.side = 'right'
WHERE a.side = 'left';
