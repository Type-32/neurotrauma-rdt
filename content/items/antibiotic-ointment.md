---
title: 抗生素软膏 Antibiotic Ointment
nameZh: 抗生素软膏
nameEn: Antibiotic Ointment
category: item
source: base
order: 5
tags:
  - item
  - first-aid
  - important
pinyin: kangshengsuruangao
pinyinInitials: kssrg
aliases: []
skill:
  medical: 10
onSuccess:
  - text: -60% [伤口感染](/afflictions/infected-wounds)
    refs:
      - afflictions/infected-wounds
    amount: -60
  - text: +100% [药膏涂敷](/afflictions/ointmented)
    refs:
      - afflictions/ointmented
    amount: 100
onFailure:
  - text: -30% [伤口感染](/afflictions/infected-wounds)
    refs:
      - afflictions/infected-wounds
    amount: -30
  - text: +80% [药膏涂敷](/afflictions/ointmented)
    refs:
      - afflictions/ointmented
    amount: 80
trello:
  shortLink: Tq0coCHh
  url: https://trello.com/c/Tq0coCHh/17-%E6%8A%97%E7%94%9F%E7%B4%A0%E8%BD%AF%E8%86%8F-antibiotic-ointment
---

### 医疗水平需求：10

抗生素软膏是一种用于治疗[伤口感染](/afflictions/infected-wounds)的物品。

应用成功时：
\-60% [伤口感染](/afflictions/infected-wounds)
\+100% [药膏涂敷](/afflictions/ointmented)

应用失败时：
\-30% [伤口感染](/afflictions/infected-wounds)
\+80% [药膏涂敷](/afflictions/ointmented)
