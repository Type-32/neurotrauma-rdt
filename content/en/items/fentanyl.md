---
title: 芬太尼 Fentanyl
nameZh: 芬太尼
nameEn: Fentanyl
category: item
source: base
order: 22
tags:
  - item
  - niche
pinyin: fentaini
pinyinInitials: ftn
aliases: []
skill:
  medical: 72
onSuccess:
  - text: +75% [镇痛](/afflictions/analgesia)
    refs:
      - afflictions/analgesia
    amount: 75
  - text: +15% 阿片类药物成瘾
    amount: 15
  - text: +22.5% [阿片类药物中毒](/afflictions/opiate-overdose)
    refs:
      - afflictions/opiate-overdose
    amount: 22.5
  - text: -100% 阿片类药物[戒断](/afflictions/withdrawal)
    refs:
      - afflictions/withdrawal
    amount: -100
onFailure:
  - text: +50% 镇痛
    amount: 50
  - text: +40% 阿片类药物成瘾
    amount: 40
  - text: +30% 阿片类药物中毒
    amount: 30
  - text: -100% 阿片类药物戒断
    amount: -100
trello:
  shortLink: MnZimGyX
  url: https://trello.com/c/MnZimGyX/66-%E8%8A%AC%E5%A4%AA%E5%B0%BC-fentanyl
---

### 医疗水平需求：72

用于镇痛的强效止痛药。

### 应用成功时：

\+75% [镇痛](/afflictions/analgesia)
\+15% 阿片类药物成瘾
\+22.5% [阿片类药物中毒](/afflictions/opiate-overdose)
\-100% 阿片类药物[戒断](/afflictions/withdrawal)

### 当醉酒时（>30%酒精中毒）改为：

\+150% 镇痛
\+37.5% 阿片类药物中毒

### 应用失败时：

\+50% 镇痛
\+40% 阿片类药物成瘾
\+30% 阿片类药物中毒
\-100% 阿片类药物戒断

### 当醉酒时（>30%酒精中毒）改为：

\+100% 镇痛
\+60% 阿片类药物中毒
