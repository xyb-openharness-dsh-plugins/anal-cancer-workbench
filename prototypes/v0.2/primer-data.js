/* 小萌宝 AnalPal · 疾病概要数据（36 号）
 * 口径：docs/DISEASE-PRIMER.md；规范：starter docs/36-DISEASE-PRIMER.md。
 * 全部内容属第 ② 层（解释）：只写定义、文件、指南列举过的手段、已发生的变化。
 * 任何「你该怎么办」的判断都不在这里，固定出口是「这一句需要问你的医生」。
 *
 * 原件状态照实写：本项目未取得 NCCN / CSCO / ESMO / AJCC 的任何原件，
 * 指南版本状态在 docs/CLINICAL-DATA-2026.md 里记为「未核验」，此处照抄，页码一律待核。
 */
window.DISEASE_PRIMER = {
  brand: '小萌宝 AnalPal',
  name: '肛管癌',
  en: 'Anal Cancer（肛管鳞状细胞癌，ASCC）',
  updated: '2026-10-25',
  sections: [
    {
      id: 'definition',
      title: '定义',
      intro: '肛管癌是发生在肛管区域的恶性肿瘤；本项目聚焦其中最常见的组织学类型——肛管鳞状细胞癌'
        + '（anal squamous cell carcinoma，ASCC）。肛缘（anal margin）与肛管在解剖与分期上分开处理，'
        + '项目分型页同时保留「肛管腺癌」字段，但本轮不展开其独立路径。',
      points: [
        '分期口径：项目界面与临床试验条件里统一使用 AJCC 第 8 版（AJCC 8th / AJCC v8），分期组由医生判定，工作台不生成结论。',
        '病理与风险字段：项目档案记录组织学分级、HPV 状态（如 HPV16 阳性 / HPV 阴性）与 HIV 状态；这些是档案字段，不在此处推导任何结论。',
        '淋巴结口径：项目按 RECIST 1.1 的短径测量法记录（短径 ≥15 mm 才作为病理性增大考虑），任一侧缺失时不计算差值；是否属于区域淋巴结受累仍由医生结合 AJCC 8th 判断。',
        '本台覆盖的病程段落由项目 SPEC 定义：根治性放化疗期间、治疗结束后 0–24 个月随访期、放化疗未控后手术并留造口的人、复发或转移后接受系统治疗的人。'
      ],
      sources: [
        { org: 'AJCC', doc: 'Cancer Staging Manual, 8th ed.（肛管章节）', version: '第 8 版（出版年份未核实）', original: false, page: '页码待核' },
        { org: '本项目', doc: 'docs/SPEC.md 与 docs/CLINICAL-DATA-2026.md（分型、HPV/HIV 字段与淋巴结口径）', version: '2026-10-21 版', original: true, page: '不适用（项目文档）' }
      ]
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      intro: '这台工作台里出现的每一条「该查什么、该怎么随访」，都应能追到下面某一份文件。'
        + '本项目对这几份文件都没有取得原件；其中三份 2026 版指南的更新状态，项目文档里明确记为「未核验」，这里照实标出。',
      table: {
        head: ['机构', '文件', '版本 / 年份', '原件', '本台的用途'],
        rows: [
          ['NCCN', 'NCCN Guidelines · Anal Carcinoma', '2026 版（更新状态未核验）', '未取得原件', '分期检查、放化疗与随访路径的并列引用；条目级页码待核'],
          ['CSCO', 'CSCO 肛管癌 / 结直肠癌诊疗指南', '2026 版（状态未核验）', '未取得原件', '国内可及药物与本土实践差异；本版暂不作引用依据'],
          ['ESMO', 'ESMO Clinical Practice Guidelines · Anal Cancer', '2026 更新（状态未核验）', '未取得原件', '欧洲口径的并列参照；本版暂不作引用依据'],
          ['AJCC', 'Cancer Staging Manual, 8th ed.（肛管章节）', '第 8 版（出版年份未核实）', '未取得原件', 'TNM 分期与区域淋巴结口径；项目界面只显示医生给出的分期原文']
        ]
      },
      points: [
        '指南给的是「通常怎么做」，不是「你该怎么做」。版本号必须写清：同一份指南隔一年，条目会变。',
        '三份 2026 版指南的状态都来自 docs/CLINICAL-DATA-2026.md 的「2026 指南监测入口」，原文写「未核验」；在核验前不引用其具体条文。',
        '本台对未取得原件的文件只记「存在」与「大致讲什么」，页码一律写待核。',
        '临床研究条目来自 ClinicalTrials.gov 登记摘录，状态与最近更新日期逐条显示，不把「看起来在招」当成机会。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Anal Carcinoma', version: '2026 版（未核验）', original: false, page: '页码待核' },
        { org: 'CSCO', doc: 'CSCO 肛管癌 / 结直肠癌诊疗指南', version: '2026 版（未核验）', original: false, page: '页码待核' },
        { org: 'ESMO', doc: 'ESMO Clinical Practice Guidelines · Anal Cancer', version: '2026 更新（未核验）', original: false, page: '页码待核' },
        { org: 'AJCC', doc: 'Cancer Staging Manual, 8th ed.', version: '第 8 版', original: false, page: '页码待核' }
      ]
    },
    {
      id: 'landscape',
      title: '目前治疗全景概要',
      intro: '下面按病期与线序列出指南里出现过的手段类别。这是「世界上大致有哪些办法」的地图，'
        + '不是给你排的先后顺序，也不含任何剂量、疗程与适用条件——那些必须由医生按你的病理、分期与影像决定。',
      groups: [
        {
          label: '局限期（以根治性放化疗为主路径）',
          points: [
            '根治性放化疗：项目 SPEC 记录的同步方案写法为 5-FU / 卡培他滨 + 丝裂霉素，放疗技术为 IMRT；具体药物、剂量与照射范围由放疗科与肿瘤内科决定。',
            '治疗期间的记录重点：放化疗副作用、肛周皮肤、肠道与排粪功能；本台只做症状与分级的原文记录，不给处理建议。',
            '局部切除：仅见于极早期或特定病灶的情形，是否适用由外科与病理判断；本台不判断切缘是否足够。'
          ]
        },
        {
          label: '放化疗未控或复发后',
          points: [
            '腹会阴联合切除（APR）：项目 SPEC 记录为放化疗未控后的手术路径，术后留有永久性结肠造口；造口生活是本台单列的记录模块。',
            '复发或转移后的系统治疗：项目只做信息整理与临床试验线索，不判断疗效，也不比较方案。'
          ]
        },
        {
          label: '贯穿全程的两件事',
          points: [
            '症状与功能记录：肛周皮肤、排粪次数与性状、造口底盘与皮肤状态，按日期与原文记录。',
            '复查节奏：影像、内镜与肿瘤标志物的复查间隔按主诊医嘱；本台只把「约在哪天、做了没有」整理成时间线。',
            '心理支持：项目把心理页设为独立模块，记录情绪与困扰，不做量表判读、不与别人比较。'
          ]
        }
      ],
      points: [
        '以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Anal Carcinoma', version: '2026 版（未核验）', original: false, page: '页码待核' },
        { org: '本项目', doc: 'docs/SPEC.md（人群与治疗段落、放化疗方案写法）', version: '2026-10-21 版', original: true, page: '不适用（项目文档）' }
      ]
    },
    {
      id: 'trend',
      title: '发展趋势',
      intro: '这一段只写已经发生的事：登记平台上采集到多少条、哪几份指南的版本状态被记录为未核验、分期体系用的是第几版。'
        + '不写预测，不做评价，也不给任何倾向。',
      points: [
        '截至 2026-10-21：本项目自采 ClinicalTrials.gov 肛管癌干预性研究累积登记快照 224 条（三条检索式并集，去重后 224 条；2026-01-01 之后首次公示的 14 条）。分期分布：PHASE2 76、PHASE3 20、PHASE1 41、NA 70、PHASE1/2 13、PHASE2/3 2、EARLY_PHASE1 1、PHASE4 1。',
        '截至 2026-10-21：224 条中登记状态为 RECRUITING 的 42 条、UNKNOWN 的 23 条；仅采 ClinicalTrials.gov 一条在线通道，ICTRP、ChiCTR、ChinaDrugTrials 本轮未配置，未命中不等于不存在。',
        '截至 2026-10-25：NCCN Anal Carcinoma 2026 版、CSCO 肛管癌 / 结直肠癌指南 2026 版、ESMO Anal Cancer 2026 更新的状态均记为「未核验」（docs/CLINICAL-DATA-2026.md）。',
        '分期体系：项目界面与临床试验条件统一使用 AJCC 第 8 版（AJCC 8th / v8）；第 7 版何时被取代、第 9 版是否存在，本台未核实。'
      ],
      sources: [
        { org: '本项目', doc: 'docs/CLINICAL-DATA-2026.md（224 条快照、状态与分期分布、指南监测入口）', version: '快照 2026-10-21', original: true, page: '不适用（项目文档）' },
        { org: 'ClinicalTrials.gov', doc: 'API v2 检索（anal cancer / anal squamous cell carcinoma / anal canal carcinoma）', version: '采集日 2026-10-21', original: true, note: '一手登记数据，本项目自采' },
        { org: 'AJCC', doc: 'Cancer Staging Manual, 8th ed.', version: '第 8 版（出版年份未核实）', original: false, page: '页码待核' }
      ]
    }
  ]
}
