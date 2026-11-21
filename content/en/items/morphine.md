---
title: 吗啡 Morphine
nameZh: 吗啡
nameEn: Morphine
category: item
source: base
order: 34
tags:
  - item
  - very-important
pinyin: mafei
pinyinInitials: mf
aliases: []
skill:
  medical: 30
onSuccess:
  - text: +50% [镇痛](/afflictions/analgesia)
    refs:
      - afflictions/analgesia
    amount: 50
  - text: +10% 阿片类药物成瘾
    amount: 10
  - text: +10% [阿片类药物中毒](/afflictions/opiate-overdose)
    refs:
      - afflictions/opiate-overdose
    amount: 10
  - text: -30% 阿片类药物[戒断](/afflictions/withdrawal)
    refs:
      - afflictions/withdrawal
    amount: -30
onFailure:
  - text: +30% 镇痛
    amount: 30
  - text: +25% 阿片类药物成瘾
    amount: 25
  - text: +20% 阿片类药物中毒
    amount: 20
  - text: -30% 阿片类药物戒断
    amount: -30
trello:
  shortLink: UQCFfz1P
  url: https://trello.com/c/UQCFfz1P/63-%E5%90%97%E5%95%A1-morphine
---

### 医疗水平需求：30

一种用于镇痛的中等强度的镇痛剂。

### 应用成功时：

\+50% [镇痛](/afflictions/analgesia)
\+10% 阿片类药物成瘾
\+10% [阿片类药物中毒](/afflictions/opiate-overdose)
\-30% 阿片类药物[戒断](/afflictions/withdrawal)

### 当醉酒时（>30%酒精中毒）改为：

\+100% 镇痛
\+20% 阿片类药物中毒

### 应用失败时：

\+30% 镇痛
\+25% 阿片类药物成瘾
\+20% 阿片类药物中毒
\-30% 阿片类药物戒断

### 当醉酒时（>30%酒精中毒）改为：

\+60% 镇痛
\+40% 阿片类药物中毒
