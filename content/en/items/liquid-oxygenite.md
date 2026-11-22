---
title: 液态氧矿 Liquid Oxygenite
nameZh: 液态氧矿
nameEn: Liquid Oxygenite
category: item
source: base
order: 29
tags:
  - item
  - first-aid
  - important
pinyin: yetaiyangkuang
pinyinInitials: ytyk
aliases: []
skill:
  medical: 72
onSuccess:
  - text: -3000% [低血氧](/afflictions/hypoxemia)
    refs:
      - afflictions/hypoxemia
    amount: -3000
  - text: +6%[原版器官损伤](/afflictions/vanilla-organ-damage)
    refs:
      - afflictions/vanilla-organ-damage
    amount: 6
  - text: +6% [肺部损伤](/afflictions/lung-damage)
    refs:
      - afflictions/lung-damage
    amount: 6
  - text: +6% [肝脏损伤](/afflictions/liver-damage)
    refs:
      - afflictions/liver-damage
    amount: 6
  - text: +6% [心脏损伤](/afflictions/heart-damage)
    refs:
      - afflictions/heart-damage
    amount: 6
  - text: +6% [肾脏损伤](/afflictions/kidney-damage)
    refs:
      - afflictions/kidney-damage
    amount: 6
onFailure:
  - text: -200% 低血氧
    amount: -200
  - text: +10% 原版器官损伤
    amount: 10
  - text: +10% 肺部损伤
    amount: 10
  - text: +10% 肝脏损伤
    amount: 10
  - text: +10% 心脏损伤
    amount: 10
  - text: +10% 肾脏损伤
    amount: 10
trello:
  shortLink: NCgvSazY
  url: https://trello.com/c/NCgvSazY/76-%E6%B6%B2%E6%80%81%E6%B0%A7%E7%9F%BF-liquid-oxygenite
---

### 医疗水平需求：72

一种液化的外星物质，用来将氧气直接注入血液，治疗[低血氧](/afflictions/hypoxemia)。

### 应用成功时：

所有效果都发生在30秒内：

\-3000% [低血氧](/afflictions/hypoxemia)
\+6%[原版器官损伤](/afflictions/vanilla-organ-damage)
\+6% [肺部损伤](/afflictions/lung-damage)
\+6% [肝脏损伤](/afflictions/liver-damage)
\+6% [心脏损伤](/afflictions/heart-damage)
\+6% [肾脏损伤](/afflictions/kidney-damage)

实际上，液态氧矿能使患者在30秒内对低血氧免疫。

### 应用失败时：

所有效果都发生在20秒内：
\-200% 低血氧
\+10% 原版器官损伤
\+10% 肺部损伤
\+10% 肝脏损伤
\+10% 心脏损伤
\+10% 肾脏损伤
