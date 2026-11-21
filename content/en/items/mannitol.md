---
title: 甘露醇 Mannitol
nameZh: 甘露醇
nameEn: Mannitol
category: item
source: base
order: 30
tags:
  - item
  - important
pinyin: ganluchun
pinyinInitials: glc
aliases: []
skill:
  medical: 60
onSuccess:
  - text: +50% 甘露醇效果，随着时间的推移，它将治愈100%的神经创伤
    amount: 50
  - text: +5% [原版器官损伤](/afflictions/vanilla-organ-damage)
    refs:
      - afflictions/vanilla-organ-damage
    amount: 5
  - text: +10% [心脏损伤](/afflictions/heart-damage)
    refs:
      - afflictions/heart-damage
    amount: 10
  - text: +10% [肾脏损伤](/afflictions/kidney-damage)
    refs:
      - afflictions/kidney-damage
    amount: 10
onFailure:
  - text: +30% 甘露醇效果，随着时间的推移，它将治愈60%的神经创伤
    amount: 30
  - text: +10% 原版器官损伤
    amount: 10
  - text: +20% 心脏损伤
    amount: 20
  - text: +20% 肾脏损伤
    amount: 20
trello:
  shortLink: IVNXdlVz
  url: https://trello.com/c/IVNXdlVz/171-%E7%94%98%E9%9C%B2%E9%86%87-mannitol
---

### 医疗水平需求：60

甘露醇是一种用于治疗[神经创伤](/afflictions/neurotrauma)的药物，只要血压不低于70%，[低血氧](/afflictions/hypoxemia)不高于30%。作为对治疗[神经创伤](/afflictions/neurotrauma)的回报，它造成了原版的器官损伤，[心脏损伤](/afflictions/heart-damage)和[肾脏损伤](/afflictions/kidney-damage)。无论血液指标是否稳定，甘露醇都会使神经创伤的增速减半。

甘露醇效果和器官损伤都持续10秒。

### 应用成功时：

\+50% 甘露醇效果，随着时间的推移，它将治愈100%的神经创伤
\+5% [原版器官损伤](/afflictions/vanilla-organ-damage)
\+10% [心脏损伤](/afflictions/heart-damage)
\+10% [肾脏损伤](/afflictions/kidney-damage)

### 应用失败时：

\+30% 甘露醇效果，随着时间的推移，它将治愈60%的神经创伤
\+10% 原版器官损伤
\+20% 心脏损伤
\+20% 肾脏损伤
