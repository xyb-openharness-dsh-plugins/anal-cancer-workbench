# 2026 肛管癌临床研究资料包说明

资料包位置：`research/anal-cancer/`（`README.md` + `trials-2026.jsonl` + `anal_cancer_trials_2026.sqlite` + `manifest.json`）。

| 文件 | 内容 | sha256 |
| --- | --- | --- |
| `trials-2026.jsonl` | 224 条，一行一条 | `b41a8314c9fbe7a447345cf80acaff828c68241296534e052d2df365b78d2839` |
| `anal_cancer_trials_2026.sqlite` | 224 条，表 `trial_records` / `trial_sources` / `collection_meta` | `712f4bc4693deed25de8fb9d38433f65b52b7f1d09ce995e4998b1645bca8367` |

哈希写入 `manifest.json`，**重跑采集会变**。采集脚本：`scripts/fetch-anal-trials-2026.mjs`（`--dry-run` 只报命中数、打印被剔除样本，便于核对误杀误收）。

## 一、口径（先看这一节，别把它当"2026 年新试验"）

- **覆盖范围：累计登记快照，截至 2026-10-21。** 文件名的 `2026` 指资料包快照年份，**不是"仅 2026 年首次公示"**。
- 其中 **2026-01-01 之后首次公示的只有 14 条**；最早一条为 2003 年。逐年分布：2020 年 19、2024 年 17、2019 年 16、2017 年 15、2025 年 14、2026 年 14，2003–2016 合计 84 条。
- 只收**干预性研究**；观察性、回顾性登记未采集。
- 仅 **ClinicalTrials.gov API v2** 一条在线通道。ICTRP、ChiCTR、ChinaDrugTrials 本轮 `not_configured`（见 `trial_sources` 与 manifest 的 `source_channels`），**"未命中"不等于"不存在"**。
- 三条检索式并集：`anal cancer` / `anal squamous cell carcinoma` / `anal canal carcinoma`。抓取 340 / 135 / 73 条，去重前 393、去重后 **224**。
- 每条记录保存：注册库、NCT、标题、官方标题、登记状态、分期、研究类型、申办方、计划入组、开始/主要完成/完成日期、疾病、干预、摘要、入排标准、国家、中国站点、来源 URL、首次公示、最近更新、采集时间。**未保留 PI 电话/邮箱等直接联系字段。**

## 二、这批数据长什么样

### 登记状态（224 条）

| 状态 | 条数 |
| --- | --- |
| COMPLETED | 91 |
| RECRUITING | 42 |
| ACTIVE_NOT_RECRUITING | 26 |
| UNKNOWN | 23 |
| TERMINATED | 20 |
| NOT_YET_RECRUITING | 15 |
| WITHDRAWN | 6 |
| ENROLLING_BY_INVITATION | 1 |

> **只有 42 条在招募**，且 `UNKNOWN` 有 23 条（登记方长期未更新）。这意味着工作台「临床研究」页的默认排序必须是**最近更新**而不是"看起来在招"，并且每条都要显示状态与最近更新日期——否则患者会把 2013 年的 UNKNOWN 当成机会。

### 分期

PHASE2 76、NA（多为放疗/手术/行为干预）70、PHASE1 41、PHASE3 20、PHASE1/2 13、PHASE2/3 2、EARLY_PHASE1 1、PHASE4 1。

### 主题量级（关键词近似命中，同一研究可多命中，**不是人工分类**）

| 主题 | 条数 |
| --- | --- |
| HPV 相关（含疫苗、TCR-T） | 89 |
| 免疫治疗（PD-1/PD-L1/CTLA-4） | 85 |
| 放化疗 / 放疗（IMRT、SBRT、近距离） | 78 |
| 化疗（MMC、5-FU、卡培他滨、铂类、紫杉） | 76 |
| 筛查 / 预防 / 疫苗 | 65 |
| 影像 / 诊断 / 标志物 | 64 |
| 支持治疗 / 生活质量 / 毒性 | 48 |
| HIV / 免疫抑制人群 | 46 |
| 手术（含 APR、局部切除） | 40 |
| 靶向 / ADC / 抗体 | 34 |

> 关键词统计**不能**作为"某方向有多少研究"的精确结论引用。HPV 与疫苗类偏高，是因为纳入了男性 HPV 疫苗 III 期（研究人群不是肛管癌患者），这一点在选摘时已剔除。

### 申办方 top

NCI 20、AIDS Malignancy Consortium 10、M.D. Anderson 6、CHU Besançon 6、UCSF 4、UNICANCER 4、Incyte 4、UHN Toronto 3。

> NCI 与 AIDS Malignancy Consortium 占比高，反映肛管癌研究的真实结构：**HIV 阳性人群的肛管癌防治**是美国登记库里的主要来源之一。工作台不能把这类研究直接呈现为"适合所有肛管癌患者"。

### 含中国站点的 15 条（登记标注，非"国内可参加"）

| NCT | 状态 | 方向 | 站点（登记原文节选） |
| --- | --- | --- | --- |
| NCT07800000 | NOT_YET_RECRUITING | Becotatug Vedotin + 免疫 + 卡培他滨 → 同步放化疗 | 华西医院 |
| NCT07692152 | RECRUITING | 信迪利单抗 vs 丝裂霉素 + 卡培他滨 + IMRT（局限期） | 中国医学科学院肿瘤医院 / 深圳医院 |
| NCT07555678 | RECRUITING | 放化疗 + 抗 PD-1（Chase） | 复旦大学附属肿瘤医院 |
| NCT05374252 | UNKNOWN | 放化疗 ± PD-1 阻断 | 中山大学附属第六医院 |
| NCT05060471 | COMPLETED | PD-1 + 化疗 → 同步免疫放疗（局部晚期） | 中山大学肿瘤防治中心 |
| NCT03381352 | UNKNOWN | IMRT 同步化疗 | 中国医学科学院 |
| NCT06544720 | RECRUITING | SCG142 TCR-T（HPV 相关癌） | 青岛大学附属医院 |
| NCT05952947 / NCT05787535 | RECRUITING / UNKNOWN | HRYZ-T101（HPV18 阳性实体瘤） | 复旦大学附属肿瘤医院 |
| NCT05122221 | UNKNOWN | CRTE7A2-01 TCR-T（HPV16 阳性宫颈/肛管/头颈） | 郑州大学第一附属医院 |
| NCT05544929 | ACTIVE_NOT_RECRUITING | KFA115 ± 帕博利珠单抗 | Novartis 站点（含中国） |
| NCT06866574 / NCT06465914 / NCT05668572 / NCT05518201 | 多为 ACTIVE_NOT_RECRUITING / UNKNOWN / COMPLETED | 九价 HPV 疫苗（男性人群） | 福建/四川/云南/浙江/广西/湖南/山西/广东/江苏 CDC |

> 后 4 条是**疫苗研究，受试者是健康男性，不是肛管癌患者**。它们出现在资料包里是检索词命中的结果，**已从原型「临床研究」页的 10 条选摘中全部剔除**。

## 三、重要限制

1. 年份口径是**累计快照**，不是"2026 年新增"。跨癌种横向比较时必须先统一口径。
2. 仅干预性研究。
3. **中国登记库未采集**：ChiCTR 与 CDE 上 2026 年的肛管癌记录数未知。15 条"含中国站点"只反映 ClinicalTrials.gov 上标明的站点，**不能表述为"国内有 15 项可参加"**。
4. 试验登记不证明方案有效、安全、获批或开放入组；涉及具体患者由专业团队判断，并回源核实登记状态与纳排标准。
5. 主题命中数为关键词近似统计，不是人工分类。
6. **药物层面的机制、阶段与已发布疗效不在本资料包范围内**——本包只做登记信息留档。若后续报告要列关键药物，按用户长期规则另附药物卡片（属性 / 原理 / 阶段 / 历史数据），机制未披露必须写"未披露"。
7. 该库**未接入**原型「临床研究」页的业务数据层，也未接入 `unified_search_trials` 在线 MCP 注册表。原型里的 10 条是 `scripts/build-trials-excerpt.mjs` 生成的**离线摘录**，真实接入需另做许可、同步、去重与临床审核。
8. 与结直肠资料包在「盆腔放疗」「造口」主题上**刻意重叠**，合并统计必须按 NCT 去重。

## 四、2026 指南监测入口

**原件核对（2026-10-27 逐条实测，结论以此为准）**

| 机构 | 文件与版本 | 原件状态 | 链接 |
| --- | --- | --- | --- |
| NCCN | Anal Carcinoma **V2.2026**（患者版据该版改编） | **已取得**：官方患者版 PDF，43 页，可直接下载 | `https://www.nccn.org/patients/guidelines/content/PDF/anal-patient.pdf` |
| CACA | 中国肿瘤整合诊治指南·肛管癌 **V1.0_2022**（2022-03-31，大肠癌专业委员会） | **已取得**：官网在线全文，逐页可读；下载需登录 | `https://cacaguidelines.cacakp.com/pdflist/detail?id=37` |
| ESMO | Anal cancer CPG **2021**（Ann Oncol 2021;32:1087-1100） | **已取得**：官方指南页可开；全文页 annalsofoncology.org 对脚本返回 403，浏览器可开 | `https://www.esmo.org/guidelines/esmo-clinical-practice-guideline-anal-cancer` |
| CSCO | 结直肠癌诊疗指南 2025（**肛管癌未单独成册**） | **无原件**：2025 版合订本目录无肛管癌独立指南，亦无官方免费在线全文 | — |
| AJCC | Cancer Staging Manual 8th ed.（肛管章节） | **部分**：肛管章节在付费手册内；官方免费仅第 1 章分期总则 PDF | `https://www.facs.org/media/2zvlrdmi/ajcc_staging_rules_8th_ed.pdf` |

**仍未核验**：CSCO 2026 版状态；ESMO 是否已发布 2021 之后的更新版；AJCC 第 9 版是否覆盖肛管。

在取得并核对上述原件之前，工作台不得生成任何"按最新指南"的治疗解释内容。未取得原件的条目（CSCO）在「疾病概要」页显式标 `nolink`，不得用占位链接充数。

## 五、对工作台页面的直接约束

- 「临床研究」页每条线索必须带**来源 URL、首次公示日期、最近更新日期、登记状态**，并常驻免责（登记 ≠ 可入组 ≠ 有效）。
- **不排序、不打分、不预测**：HPV 状态、PD-L1、HIV 状态只作检索与筛选条件，不作"适合你"的判断。
- 默认按**最近更新**倒序；`UNKNOWN` 状态必须有视觉区分，不能与 `RECRUITING` 同色。
- 疫苗类（健康人群）与 HIV 人群专项研究，在列表里必须有**人群标签**，避免误读为治疗机会。
- 中国站点信息只写"登记标注站点"，**不得加"可咨询""可入组"**。
