---
title: 纳洛酮 Naloxone
nameZh: 纳洛酮
nameEn: Naloxone
category: item
source: base
order: 35
tags:
  - item
  - niche
pinyin: naluotong
pinyinInitials: nlt
aliases: []
skill:
  medical: 39
onSuccess:
  - text: -60% 阿片[戒断 Withdrawal](/afflictions/withdrawal)
    refs:
      - afflictions/withdrawal
    amount: -60
  - text: -60% [阿片类药物中毒 Opiate Overdose](/afflictions/opiate-overdose)
    refs:
      - afflictions/opiate-overdose
    amount: -60
  - text: -60% 阿片成瘾
    amount: -60
  - text: -60% [镇痛 Analgesia](/afflictions/analgesia)
    refs:
      - afflictions/analgesia
    amount: -60
onFailure:
  - text: -30% 阿片[戒断 Withdrawal](/afflictions/withdrawal)
    refs:
      - afflictions/withdrawal
    amount: -30
  - text: -30% [阿片类药物中毒 Opiate Overdose](/afflictions/opiate-overdose)
    refs:
      - afflictions/opiate-overdose
    amount: -30
  - text: -30% 阿片成瘾
    amount: -30
  - text: -60% [镇痛 Analgesia](/afflictions/analgesia)
    refs:
      - afflictions/analgesia
    amount: -60
  - text: +15%[昏迷 Coma](/afflictions/coma) （50%概率）
    refs:
      - afflictions/coma
    amount: 15
trello:
  shortLink: xbnZMAbf
  url: https://trello.com/c/xbnZMAbf/94-%E7%BA%B3%E6%B4%9B%E9%85%AE-naloxone
---

### 医疗水平需求：39

_旧称烯丙羟吗啡酮_
烯丙羟吗啡酮用于治疗[阿片类药物戒断](/afflictions/withdrawal)、[阿片类药物中毒](/afflictions/opiate-overdose)和[镇痛](/afflictions/analgesia)。药效持续30秒。

### 应用成功时：

\-60% 阿片[戒断 Withdrawal](/afflictions/withdrawal)
\-60% [阿片类药物中毒 Opiate Overdose](/afflictions/opiate-overdose)
\-60% 阿片成瘾
\-60% [镇痛 Analgesia](/afflictions/analgesia)

### 应用失败时

\-30% 阿片[戒断 Withdrawal](/afflictions/withdrawal)
\-30% [阿片类药物中毒 Opiate Overdose](/afflictions/opiate-overdose)
\-30% 阿片成瘾
\-60% [镇痛 Analgesia](/afflictions/analgesia)

\+15%[昏迷 Coma](/afflictions/coma) （50%概率）
