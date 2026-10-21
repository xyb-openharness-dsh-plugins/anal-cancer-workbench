/* 生成物：由 demo/build-demo-data.mjs 产出，不手改。演示档案为模拟资料，不对应任何真实患者；临床试验条目为登记摘录，状态未核实。 */
window.DEMO_DATA = {
 "generatedAt": "2026-10-21",
 "window": {
  "from": "2026-04-21",
  "to": "2026-10-20"
 },
 "disclaimer": "演示档案为模拟资料，不对应任何真实患者；临床试验条目为登记摘录，状态未核实。",
 "metrics": [
  {
   "key": "weight",
   "label": "体重",
   "kind": "numeric",
   "unit": "kg",
   "color": "#E07B1E",
   "group": "身体与营养",
   "order": 10
  },
  {
   "key": "albumin",
   "label": "白蛋白",
   "kind": "numeric",
   "unit": "g/L",
   "color": "#2F7F74",
   "group": "身体与营养",
   "order": 20
  },
  {
   "key": "hemoglobin",
   "label": "血红蛋白",
   "kind": "numeric",
   "unit": "g/L",
   "color": "#8C5AA8",
   "group": "血液学",
   "order": 30
  },
  {
   "key": "anal_skin_grade",
   "label": "肛周皮肤 RTOG 分级",
   "kind": "categorical",
   "unit": null,
   "scale": "rtog_skin",
   "color": "#C2410C",
   "group": "皮肤与黏膜",
   "order": 40
  },
  {
   "key": "bowel_frequency",
   "label": "排便次数",
   "kind": "numeric",
   "unit": "次/日",
   "color": "#3F6FA8",
   "group": "肠道功能",
   "order": 50
  },
  {
   "key": "pain_nrs",
   "label": "肛周疼痛 NRS",
   "kind": "numeric",
   "unit": "分",
   "color": "#A33B2B",
   "group": "症状",
   "order": 60
  },
  {
   "key": "stoma_output",
   "label": "造口排出性状",
   "kind": "categorical",
   "unit": null,
   "scale": "stoma_output",
   "color": "#3F6FA8",
   "group": "造口",
   "order": 70
  },
  {
   "key": "phq9",
   "label": "情绪自评 PHQ-9",
   "kind": "numeric",
   "unit": "分",
   "color": "#8A5A9E",
   "group": "情绪与心理",
   "order": 80
  },
  {
   "key": "gad7",
   "label": "焦虑自评 GAD-7",
   "kind": "numeric",
   "unit": "分",
   "color": "#B06A8A",
   "group": "情绪与心理",
   "order": 90
  }
 ],
 "scales": {
  "rtog_skin": [
   {
    "ordinal": 0,
    "label": "0 级 · 无变化",
    "short": "0",
    "tone": "ok"
   },
   {
    "ordinal": 1,
    "label": "1 级 · 淡红斑/干性脱皮",
    "short": "1",
    "tone": "watch"
   },
   {
    "ordinal": 2,
    "label": "2 级 · 片状湿性脱皮",
    "short": "2",
    "tone": "warn"
   },
   {
    "ordinal": 3,
    "label": "3 级 · 融合湿性脱皮/皱褶外",
    "short": "3",
    "tone": "danger"
   },
   {
    "ordinal": 4,
    "label": "4 级 · 坏死/溃疡/出血",
    "short": "4",
    "tone": "danger"
   }
  ],
  "stoma_output": [
   {
    "ordinal": 0,
    "label": "成形",
    "short": "成形",
    "tone": "ok"
   },
   {
    "ordinal": 1,
    "label": "半成形",
    "short": "半成形",
    "tone": "watch"
   },
   {
    "ordinal": 2,
    "label": "稀糊",
    "short": "稀糊",
    "tone": "warn"
   },
   {
    "ordinal": 3,
    "label": "水样",
    "short": "水样",
    "tone": "danger"
   }
  ]
 },
 "profiles": [
  {
   "key": "chen",
   "name": "陈女士",
   "avatar": "陈",
   "age": 54,
   "sex": "female",
   "meta": "54 岁 · 肛管鳞癌 ⅢB 期 · 根治性放化疗后 3 个月",
   "headline": "肛周皮肤正在收口，排便次数比治疗末段少了",
   "stageLine": "肛管鳞状细胞癌 · T3N1aM0 · ⅢB 期 · HPV16 阳性",
   "diagnosis": {
    "histology": "鳞状细胞癌（SCC）",
    "site": "肛管（齿状线以上）",
    "t": "T3（>5 cm）",
    "n": "N1a（直肠系膜/腹股沟）",
    "m": "M0",
    "stage": "ⅢB（AJCC 8th）",
    "grade": "中分化",
    "hpv": "HPV16 阳性",
    "hiv": "阴性",
    "date": "2026-04-08",
    "note": "病理原文保存在资料库；分期取自 2026-04-15 盆腔 MRI 与 PET-CT。"
   },
   "care": {
    "path": "根治性放化疗（Nigro 方案）",
    "intent": "definitive",
    "started": "2026-05-06",
    "ended": "2026-07-10",
    "regimen": "丝裂霉素 C（MMC）第 1、29 天 + 5-FU 持续输注第 1–4、29–32 天",
    "rt": "IMRT 54 Gy / 30 次，盆腔 + 双侧腹股沟预防照射",
    "surgery": null,
    "next": "2026-11-25 复查（肛门指检 + 腹股沟触诊 + 盆腔 MRI）"
   },
   "riskFlags": [
    {
     "tone": "warn",
     "title": "肛周湿性脱皮已结痂，但坐位仍疼",
     "detail": "7 月中旬最重（RTOG 3 级），目前 0–1 级；避免长时间坐硬椅。"
    },
    {
     "tone": "info",
     "title": "排便 3–4 次/日，伴里急后重",
     "detail": "治疗结束后 3 个月仍高于基线，属于需要写进复查问题的症状。"
    },
    {
     "tone": "info",
     "title": "血红蛋白 125 g/L，较最低点回升",
     "detail": "未输血；是否继续补铁按医生意见。"
    }
   ],
   "metrics": [
    {
     "key": "weight",
     "points": [
      {
       "date": "2026-04-24",
       "value": 62.4,
       "note": null
      },
      {
       "date": "2026-05-08",
       "value": 61.2,
       "note": null
      },
      {
       "date": "2026-05-22",
       "value": 60.4,
       "note": null
      },
      {
       "date": "2026-06-05",
       "value": 59.3,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 58.6,
       "note": null
      },
      {
       "date": "2026-07-03",
       "value": 57.8,
       "note": null
      },
      {
       "date": "2026-07-17",
       "value": 57.4,
       "note": "治疗结束"
      },
      {
       "date": "2026-07-31",
       "value": 57.9,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 58.3,
       "note": null
      },
      {
       "date": "2026-08-28",
       "value": 58.8,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 59.2,
       "note": null
      },
      {
       "date": "2026-09-25",
       "value": 59.6,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 60,
       "note": null
      },
      {
       "date": "2026-10-20",
       "value": 60.3,
       "note": null
      }
     ]
    },
    {
     "key": "albumin",
     "points": [
      {
       "date": "2026-04-24",
       "value": 41.2,
       "note": null
      },
      {
       "date": "2026-05-08",
       "value": 40.1,
       "note": null
      },
      {
       "date": "2026-05-22",
       "value": 38.4,
       "note": null
      },
      {
       "date": "2026-06-05",
       "value": 37.2,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 36.1,
       "note": null
      },
      {
       "date": "2026-07-03",
       "value": 35.4,
       "note": null
      },
      {
       "date": "2026-07-17",
       "value": 36.2,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 37.8,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 39,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 40.2,
       "note": null
      }
     ]
    },
    {
     "key": "hemoglobin",
     "points": [
      {
       "date": "2026-04-24",
       "value": 128,
       "note": null
      },
      {
       "date": "2026-05-08",
       "value": 121,
       "note": null
      },
      {
       "date": "2026-05-22",
       "value": 115,
       "note": null
      },
      {
       "date": "2026-06-05",
       "value": 109,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 105,
       "note": null
      },
      {
       "date": "2026-07-03",
       "value": 104,
       "note": null
      },
      {
       "date": "2026-07-17",
       "value": 108,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 115,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 121,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 125,
       "note": null
      }
     ]
    },
    {
     "key": "anal_skin_grade",
     "points": [
      {
       "date": "2026-05-08",
       "value": 0,
       "note": null
      },
      {
       "date": "2026-05-22",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-06-05",
       "value": 2,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 3,
       "note": null
      },
      {
       "date": "2026-07-03",
       "value": 2,
       "note": null
      },
      {
       "date": "2026-07-17",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 0,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 0,
       "note": null
      }
     ]
    },
    {
     "key": "bowel_frequency",
     "points": [
      {
       "date": "2026-04-24",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-05-22",
       "value": 3,
       "note": null
      },
      {
       "date": "2026-06-05",
       "value": 5,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 7,
       "note": null
      },
      {
       "date": "2026-07-03",
       "value": 6,
       "note": null
      },
      {
       "date": "2026-07-17",
       "value": 5,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 4,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 4,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 3,
       "note": null
      }
     ]
    },
    {
     "key": "pain_nrs",
     "points": [
      {
       "date": "2026-05-22",
       "value": 2,
       "note": null
      },
      {
       "date": "2026-06-05",
       "value": 4,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 6,
       "note": null
      },
      {
       "date": "2026-07-03",
       "value": 5,
       "note": null
      },
      {
       "date": "2026-07-17",
       "value": 3,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 2,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 1,
       "note": null
      }
     ]
    },
    {
     "key": "phq9",
     "points": [
      {
       "date": "2026-05-08",
       "value": 8,
       "note": "放疗第 1 周"
      },
      {
       "date": "2026-06-19",
       "value": 11,
       "note": "皮肤最重的一周"
      },
      {
       "date": "2026-07-17",
       "value": 9,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 6,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 5,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 4,
       "note": null
      }
     ]
    },
    {
     "key": "gad7",
     "points": [
      {
       "date": "2026-05-08",
       "value": 6,
       "note": null
      },
      {
       "date": "2026-06-19",
       "value": 9,
       "note": "等复查结果"
      },
      {
       "date": "2026-07-17",
       "value": 7,
       "note": null
      },
      {
       "date": "2026-08-14",
       "value": 5,
       "note": null
      },
      {
       "date": "2026-09-11",
       "value": 4,
       "note": null
      },
      {
       "date": "2026-10-09",
       "value": 3,
       "note": null
      }
     ]
    }
   ],
   "nodes": [
    {
     "date": "2026-04-15",
     "side": "left",
     "value": 9,
     "note": "盆腔 MRI · 短径"
    },
    {
     "date": "2026-04-15",
     "side": "right",
     "value": 7,
     "note": "盆腔 MRI · 短径"
    },
    {
     "date": "2026-09-02",
     "side": "left",
     "value": 6,
     "note": "复查 MRI · 短径"
    },
    {
     "date": "2026-09-02",
     "side": "right",
     "value": null,
     "note": "报告未单列右侧短径"
    }
   ],
   "events": [
    {
     "date": "2026-04-08",
     "type": "diagnosis",
     "title": "活检确诊肛管鳞癌",
     "detail": "肛门镜活检；病理 SCC，HPV16 阳性。"
    },
    {
     "date": "2026-04-15",
     "type": "imaging",
     "title": "盆腔 MRI + PET-CT 分期",
     "detail": "T3N1aM0；腹股沟淋巴结短径 9 mm。"
    },
    {
     "date": "2026-05-06",
     "type": "radiotherapy",
     "title": "根治性放化疗开始",
     "detail": "IMRT 54 Gy/30f；MMC + 5-FU。",
     "end": "2026-07-10"
    },
    {
     "date": "2026-05-20",
     "type": "chemo",
     "title": "第 2 周期化疗（MMC d29）",
     "detail": null
    },
    {
     "date": "2026-06-17",
     "type": "visit",
     "title": "放疗中期的皮肤评估",
     "detail": "RTOG 3 级湿性脱皮，暂停 3 天后继续。"
    },
    {
     "date": "2026-07-10",
     "type": "radiotherapy",
     "title": "放疗结束（54 Gy）",
     "detail": "未完成计划剂量 0 次；因皮肤反应中断 3 天。"
    },
    {
     "date": "2026-09-02",
     "type": "visit",
     "title": "治疗结束后第一次复查",
     "detail": "肛门指检未触及明显肿块；建议 3 个月后 MRI。"
    }
   ],
   "symptoms": [
    {
     "term": "肛周疼痛",
     "ctcae": "Proctitis",
     "grade": 2,
     "onset": "2026-05-18",
     "resolved": "2026-08-20",
     "note": "坐位与排便时明显。"
    },
    {
     "term": "腹泻 / 排便次数增多",
     "ctcae": "Diarrhea",
     "grade": 2,
     "onset": "2026-05-25",
     "resolved": null,
     "note": "每日 3–4 次，晨起集中。"
    },
    {
     "term": "里急后重",
     "ctcae": "Proctitis",
     "grade": 2,
     "onset": "2026-06-02",
     "resolved": null,
     "note": "便意频繁但排不出。"
    },
    {
     "term": "放射性皮炎（肛周）",
     "ctcae": "Radiation dermatitis",
     "grade": 3,
     "onset": "2026-06-10",
     "resolved": "2026-08-05",
     "note": "湿性脱皮，7 月中结痂。"
    },
    {
     "term": "疲乏",
     "ctcae": "Fatigue",
     "grade": 2,
     "onset": "2026-05-20",
     "resolved": "2026-09-01",
     "note": null
    },
    {
     "term": "轻度大便失禁（排气）",
     "ctcae": "Fecal incontinence",
     "grade": 1,
     "onset": "2026-07-01",
     "resolved": null,
     "note": "每周 1–2 次，多在腹泻日。"
    }
   ],
   "bowel": [
    {
     "date": "2026-05-22",
     "moves": 3,
     "bristol": 6,
     "urgency": 1,
     "incontinence": 0,
     "tenesmus": 1,
     "blood": 0,
     "note": null
    },
    {
     "date": "2026-06-05",
     "moves": 5,
     "bristol": 6,
     "urgency": 2,
     "incontinence": 0,
     "tenesmus": 2,
     "blood": 1,
     "note": "擦拭见少量血丝"
    },
    {
     "date": "2026-06-19",
     "moves": 7,
     "bristol": 7,
     "urgency": 3,
     "incontinence": 1,
     "tenesmus": 2,
     "blood": 1,
     "note": "最重的一周"
    },
    {
     "date": "2026-07-03",
     "moves": 6,
     "bristol": 6,
     "urgency": 2,
     "incontinence": 0,
     "tenesmus": 2,
     "blood": 1,
     "note": null
    },
    {
     "date": "2026-08-14",
     "moves": 4,
     "bristol": 5,
     "urgency": 2,
     "incontinence": 0,
     "tenesmus": 1,
     "blood": 0,
     "note": null
    },
    {
     "date": "2026-09-11",
     "moves": 4,
     "bristol": 4,
     "urgency": 1,
     "incontinence": 0,
     "tenesmus": 1,
     "blood": 0,
     "note": null
    },
    {
     "date": "2026-10-09",
     "moves": 3,
     "bristol": 4,
     "urgency": 1,
     "incontinence": 0,
     "tenesmus": 1,
     "blood": 0,
     "note": "较上次无变化"
    }
   ],
   "skin": [
    {
     "date": "2026-05-08",
     "rtog": 0,
     "ctcae": null,
     "moist": 0,
     "pain": 0,
     "note": "基线"
    },
    {
     "date": "2026-05-22",
     "rtog": 1,
     "ctcae": 1,
     "moist": 0,
     "pain": 2,
     "note": "淡红斑，干性脱皮"
    },
    {
     "date": "2026-06-05",
     "rtog": 2,
     "ctcae": 2,
     "moist": 1,
     "pain": 4,
     "note": "片状湿性脱皮，皱褶内"
    },
    {
     "date": "2026-06-19",
     "rtog": 3,
     "ctcae": 3,
     "moist": 1,
     "pain": 6,
     "note": "融合湿性脱皮，暂停放疗 3 天"
    },
    {
     "date": "2026-07-03",
     "rtog": 2,
     "ctcae": 2,
     "moist": 1,
     "pain": 5,
     "note": "渗液减少"
    },
    {
     "date": "2026-07-17",
     "rtog": 1,
     "ctcae": 1,
     "moist": 0,
     "pain": 3,
     "note": "结痂"
    },
    {
     "date": "2026-08-14",
     "rtog": 1,
     "ctcae": 1,
     "moist": 0,
     "pain": 2,
     "note": null
    },
    {
     "date": "2026-09-11",
     "rtog": 0,
     "ctcae": null,
     "moist": 0,
     "pain": 1,
     "note": "上皮完整"
    },
    {
     "date": "2026-10-09",
     "rtog": 0,
     "ctcae": null,
     "moist": 0,
     "pain": 1,
     "note": null
    }
   ],
   "ostomy": [],
   "followups": [
    {
     "planned": "2026-09-02",
     "done": "2026-09-02",
     "type": "治疗后首次评估",
     "dre": 1,
     "inguinal": 1,
     "anoscopy": 1,
     "imaging": "盆腔 MRI（2026-09-02）",
     "result": "未见明显残留肿块；腹股沟淋巴结 6 mm。",
     "next": "2026-11-25"
    },
    {
     "planned": "2026-11-25",
     "done": null,
     "type": "3 个月随访",
     "dre": null,
     "inguinal": null,
     "anoscopy": null,
     "imaging": "盆腔 MRI 待做",
     "result": null,
     "next": null
    },
    {
     "planned": "2027-02-25",
     "done": null,
     "type": "6 个月随访",
     "dre": null,
     "inguinal": null,
     "anoscopy": null,
     "imaging": "胸部 CT 待定",
     "result": null,
     "next": null
    }
   ],
   "questions": [
    {
     "text": "排便 3–4 次/日、总有便意，需要做肛门测压或生物反馈吗？",
     "cat": "肠道功能",
     "priority": 1,
     "status": "open"
    },
    {
     "text": "肛周皮肤已经结痂，还能不能恢复坐浴？",
     "cat": "皮肤护理",
     "priority": 1,
     "status": "open"
    },
    {
     "text": "这次 MRI 显示淋巴结 6 mm，需要加做 PET 吗？",
     "cat": "复查",
     "priority": 2,
     "status": "open"
    },
    {
     "text": "什么时候可以恢复性生活？需要注意什么？",
     "cat": "生活",
     "priority": 2,
     "status": "open"
    }
   ],
   "viewpoints": [
    {
     "text": "我担心现在每天跑厕所是因为治疗伤到了括约肌，而不是还没恢复。",
     "date": "2026-10-12",
     "about": "排便功能"
    },
    {
     "text": "皮肤结痂以后我就不敢坐浴了，怕泡坏了。",
     "date": "2026-09-28",
     "about": "皮肤护理"
    }
   ],
   "docs": [
    {
     "id": "d1",
     "title": "2026-04-08 肛门镜活检病理报告",
     "type": "病理",
     "date": "2026-04-08",
     "status": "已确认",
     "pages": 2
    },
    {
     "id": "d2",
     "title": "2026-04-15 盆腔 MRI 报告",
     "type": "影像",
     "date": "2026-04-15",
     "status": "已确认",
     "pages": 4
    },
    {
     "id": "d3",
     "title": "2026-05-05 放疗计划单（54 Gy/30f）",
     "type": "放疗",
     "date": "2026-05-05",
     "status": "已确认",
     "pages": 3
    },
    {
     "id": "d4",
     "title": "2026-07-10 出院小结",
     "type": "出院",
     "date": "2026-07-10",
     "status": "已确认",
     "pages": 5
    },
    {
     "id": "d5",
     "title": "2026-09-02 复查记录（手写）",
     "type": "门诊",
     "date": "2026-09-02",
     "status": "待核对",
     "pages": 1
    },
    {
     "id": "d6",
     "title": "2026-10-09 血常规 + 生化",
     "type": "化验",
     "date": "2026-10-09",
     "status": "已确认",
     "pages": 1
    }
   ],
   "candidates": [
    {
     "doc": "d5",
     "field": "肛门指检",
     "value": "未触及明显肿块",
     "confidence": 0.82,
     "status": "pending"
    },
    {
     "doc": "d5",
     "field": "下一步复查",
     "value": "3 个月后盆腔 MRI",
     "confidence": 0.74,
     "status": "pending"
    },
    {
     "doc": "d6",
     "field": "血红蛋白",
     "value": "125 g/L",
     "confidence": 0.96,
     "status": "pending"
    },
    {
     "doc": "d6",
     "field": "白蛋白",
     "value": "40.2 g/L",
     "confidence": 0.96,
     "status": "pending"
    }
   ],
   "trialKeys": [
    "NCT04166318",
    "NCT03233711",
    "NCT05282537"
   ]
  },
  {
   "key": "zhou",
   "name": "周先生",
   "avatar": "周",
   "age": 63,
   "sex": "male",
   "meta": "63 岁 · 肛管鳞癌 APR 术后 8 个月 · 永久性结肠造口",
   "headline": "造口排出稳定，正在学着把复查和日常排进同一张表",
   "stageLine": "肛管鳞状细胞癌 · T4N1aM0 · ⅢB 期 · 放化疗未控后 salvage APR",
   "diagnosis": {
    "histology": "鳞状细胞癌（SCC）",
    "site": "肛管（累及外括约肌）",
    "t": "T4（侵犯邻近器官）",
    "n": "N1a",
    "m": "M0",
    "stage": "ⅢB（AJCC 8th）",
    "grade": "低分化",
    "hpv": "HPV 阴性",
    "hiv": "阴性",
    "date": "2025-09-12",
    "note": "首诊在外院；放化疗后 8 周评估为未控，2026-02 行腹会阴联合切除。"
   },
   "care": {
    "path": "放化疗未控 → 腹会阴联合切除（APR）+ 永久性乙状结肠造口",
    "intent": "salvage",
    "started": "2025-10-08",
    "ended": "2026-02-18",
    "regimen": "一线：MMC + 5-FU 同步放疗 50.4 Gy（2025-10-08 至 2025-12-05）",
    "rt": "VMAT 50.4 Gy / 28 次",
    "surgery": "2026-02-18 APR，乙状结肠单腔造口；切缘阴性（R0）",
    "next": "2026-11-04 造口门诊 + 肿瘤复查"
   },
   "riskFlags": [
    {
     "tone": "warn",
     "title": "造口周围皮肤 1 级，底板边缘有渗漏",
     "detail": "近 2 周更换底盘时发现皮肤发红，长度约 2 cm；已改用凸面底盘。"
    },
    {
     "tone": "info",
     "title": "体重比术前低 3 kg，近 2 个月持平",
     "detail": "白蛋白 40 g/L，不需要额外营养补充的判断由医生做。"
    },
    {
     "tone": "info",
     "title": "会阴伤口已愈合，坐位仍有牵拉感",
     "detail": "每次不超过 40 分钟；使用中空坐垫。"
    }
   ],
   "metrics": [
    {
     "key": "weight",
     "points": [
      {
       "date": "2026-04-02",
       "value": 70.2,
       "note": null
      },
      {
       "date": "2026-04-30",
       "value": 69.8,
       "note": null
      },
      {
       "date": "2026-05-28",
       "value": 69.1,
       "note": null
      },
      {
       "date": "2026-06-25",
       "value": 69.4,
       "note": null
      },
      {
       "date": "2026-07-23",
       "value": 70,
       "note": null
      },
      {
       "date": "2026-08-20",
       "value": 70.4,
       "note": null
      },
      {
       "date": "2026-09-17",
       "value": 70.9,
       "note": null
      },
      {
       "date": "2026-10-15",
       "value": 71.6,
       "note": null
      }
     ]
    },
    {
     "key": "albumin",
     "points": [
      {
       "date": "2026-04-02",
       "value": 37.8,
       "note": null
      },
      {
       "date": "2026-05-28",
       "value": 38.2,
       "note": null
      },
      {
       "date": "2026-07-23",
       "value": 39,
       "note": null
      },
      {
       "date": "2026-09-17",
       "value": 39.6,
       "note": null
      },
      {
       "date": "2026-10-15",
       "value": 40.1,
       "note": null
      }
     ]
    },
    {
     "key": "hemoglobin",
     "points": [
      {
       "date": "2026-04-02",
       "value": 118,
       "note": null
      },
      {
       "date": "2026-05-28",
       "value": 116,
       "note": null
      },
      {
       "date": "2026-07-23",
       "value": 121,
       "note": null
      },
      {
       "date": "2026-09-17",
       "value": 125,
       "note": null
      },
      {
       "date": "2026-10-15",
       "value": 128,
       "note": null
      }
     ]
    },
    {
     "key": "stoma_output",
     "points": [
      {
       "date": "2026-04-02",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-05-28",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-06-25",
       "value": 2,
       "note": null
      },
      {
       "date": "2026-07-23",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-08-20",
       "value": 1,
       "note": null
      },
      {
       "date": "2026-09-17",
       "value": 0,
       "note": null
      },
      {
       "date": "2026-10-15",
       "value": 0,
       "note": null
      }
     ]
    },
    {
     "key": "phq9",
     "points": [
      {
       "date": "2026-04-02",
       "value": 6,
       "note": null
      },
      {
       "date": "2026-06-25",
       "value": 8,
       "note": "腹泻那几天"
      },
      {
       "date": "2026-08-20",
       "value": 9,
       "note": "不太敢出门"
      },
      {
       "date": "2026-10-15",
       "value": 7,
       "note": null
      }
     ]
    },
    {
     "key": "gad7",
     "points": [
      {
       "date": "2026-04-02",
       "value": 4,
       "note": null
      },
      {
       "date": "2026-06-25",
       "value": 6,
       "note": null
      },
      {
       "date": "2026-08-20",
       "value": 7,
       "note": null
      },
      {
       "date": "2026-10-15",
       "value": 5,
       "note": null
      }
     ]
    }
   ],
   "nodes": [
    {
     "date": "2026-05-14",
     "side": "left",
     "value": 5,
     "note": "术后 3 个月 MRI · 短径"
    },
    {
     "date": "2026-05-14",
     "side": "right",
     "value": 5,
     "note": "术后 3 个月 MRI · 短径"
    },
    {
     "date": "2026-08-06",
     "side": "left",
     "value": 6,
     "note": "复查记录 · 触诊未及肿大，MRI 短径 6 mm"
    },
    {
     "date": "2026-08-06",
     "side": "right",
     "value": 5,
     "note": "复查记录 · MRI 短径 5 mm"
    }
   ],
   "events": [
    {
     "date": "2026-02-18",
     "type": "surgery",
     "title": "腹会阴联合切除（APR）+ 乙状结肠造口",
     "detail": "手术时间 5 小时 20 分；R0 切除。"
    },
    {
     "date": "2026-03-02",
     "type": "visit",
     "title": "术后第一次造口门诊",
     "detail": "底盘型号改为 45 mm 凸面。"
    },
    {
     "date": "2026-05-14",
     "type": "imaging",
     "title": "术后 3 个月盆腔 MRI",
     "detail": "未见复发征象。"
    },
    {
     "date": "2026-08-06",
     "type": "visit",
     "title": "术后 6 个月复查",
     "detail": "CEA 2.1；造口周围皮肤 1 级。"
    }
   ],
   "symptoms": [
    {
     "term": "造口周围皮肤刺激",
     "ctcae": "Dermatitis",
     "grade": 1,
     "onset": "2026-08-20",
     "resolved": null,
     "note": "底板渗漏后出现。"
    },
    {
     "term": "会阴伤口牵拉感",
     "ctcae": "Pain",
     "grade": 1,
     "onset": "2026-04-01",
     "resolved": null,
     "note": "久坐后明显。"
    },
    {
     "term": "排气增多",
     "ctcae": "Flatulence",
     "grade": 1,
     "onset": "2026-03-10",
     "resolved": null,
     "note": "与饮食相关。"
    }
   ],
   "bowel": [],
   "skin": [],
   "ostomy": [
    {
     "date": "2026-04-02",
     "output": 3,
     "consistency": "半成形",
     "leaks": 0,
     "skin": 0,
     "note": "底盘 3 天更换一次"
    },
    {
     "date": "2026-05-28",
     "output": 3,
     "consistency": "半成形",
     "leaks": 1,
     "skin": 0,
     "note": "一次夜间渗漏"
    },
    {
     "date": "2026-06-25",
     "output": 4,
     "consistency": "稀糊",
     "leaks": 1,
     "skin": 1,
     "note": "吃了凉拌菜后"
    },
    {
     "date": "2026-07-23",
     "output": 3,
     "consistency": "半成形",
     "leaks": 0,
     "skin": 1,
     "note": null
    },
    {
     "date": "2026-08-20",
     "output": 2,
     "consistency": "成形",
     "leaks": 0,
     "skin": 1,
     "note": "改用凸面底盘"
    },
    {
     "date": "2026-09-17",
     "output": 2,
     "consistency": "成形",
     "leaks": 0,
     "skin": 0,
     "note": null
    },
    {
     "date": "2026-10-15",
     "output": 2,
     "consistency": "成形",
     "leaks": 0,
     "skin": 0,
     "note": "皮肤已恢复"
    }
   ],
   "followups": [
    {
     "planned": "2026-08-06",
     "done": "2026-08-06",
     "type": "术后 6 个月",
     "dre": 0,
     "inguinal": 1,
     "anoscopy": 0,
     "imaging": "盆腔 MRI（2026-05-14）",
     "result": "未见复发；造口皮肤 1 级。",
     "next": "2026-11-04"
    },
    {
     "planned": "2026-11-04",
     "done": null,
     "type": "造口门诊 + 肿瘤复查",
     "dre": null,
     "inguinal": null,
     "anoscopy": null,
     "imaging": "胸部/腹盆 CT 待定",
     "result": null,
     "next": null
    }
   ],
   "questions": [
    {
     "text": "造口底盘多久换一次更合适？现在 3 天一次，边缘会翘。",
     "cat": "造口护理",
     "priority": 1,
     "status": "open"
    },
    {
     "text": "会阴伤口坐久了会牵拉，需要做盆底康复吗？",
     "cat": "术后恢复",
     "priority": 2,
     "status": "open"
    },
    {
     "text": "HPV 阴性是不是家里人就不用做检查？",
     "cat": "风险与家人",
     "priority": 2,
     "status": "open"
    }
   ],
   "viewpoints": [
    {
     "text": "我不太敢出门太久，怕造口袋鼓起来被人看出来。",
     "date": "2026-09-20",
     "about": "造口与社交"
    }
   ],
   "docs": [
    {
     "id": "e1",
     "title": "2025-09-12 外院活检病理",
     "type": "病理",
     "date": "2025-09-12",
     "status": "已确认",
     "pages": 2
    },
    {
     "id": "e2",
     "title": "2026-02-18 手术记录（APR）",
     "type": "手术",
     "date": "2026-02-18",
     "status": "已确认",
     "pages": 6
    },
    {
     "id": "e3",
     "title": "2026-05-14 盆腔 MRI",
     "type": "影像",
     "date": "2026-05-14",
     "status": "已确认",
     "pages": 5
    },
    {
     "id": "e4",
     "title": "2026-08-06 复查记录",
     "type": "门诊",
     "date": "2026-08-06",
     "status": "已确认",
     "pages": 2
    }
   ],
   "candidates": [
    {
     "doc": "e4",
     "field": "CEA",
     "value": "2.1 ng/mL",
     "confidence": 0.93,
     "status": "pending"
    },
    {
     "doc": "e4",
     "field": "造口皮肤分级",
     "value": "1 级",
     "confidence": 0.7,
     "status": "pending"
    }
   ],
   "trialKeys": [
    "NCT03233711",
    "NCT05282537"
   ]
  }
 ]
};
