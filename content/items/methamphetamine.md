---
title: 兴奋粉剂 Methamphetamine
nameZh: 兴奋粉剂
nameEn: Methamphetamine
category: item
source: base
order: 33
tags:
  - item
  - niche
pinyin: xingfenfenji
pinyinInitials: xffj
aliases: []
skill:
  medical: 35
onSuccess:
  - text: +70% 极速
    amount: 70
  - text: +15% [原版器官损伤](/afflictions/vanilla-organ-damage)
    refs:
      - afflictions/vanilla-organ-damage
    amount: 15
  - text: +15% [神经创伤 Neurotrauma](/afflictions/neurotrauma)
    refs:
      - afflictions/neurotrauma
    amount: 15
  - text: +15% 化学成瘾
    amount: 15
  - text: +30% 精神病
    amount: 30
  - text: -22.5% 眩晕
    amount: -22.5
  - text: -90% 化学[戒断 Withdrawal](/afflictions/withdrawal)
    refs:
      - afflictions/withdrawal
    amount: -90
onFailure:
  - text: +50% 极速
    amount: 50
  - text: +30% [原版器官损伤](/afflictions/vanilla-organ-damage)
    refs:
      - afflictions/vanilla-organ-damage
    amount: 30
  - text: +30% [神经创伤 Neurotrauma](/afflictions/neurotrauma)
    refs:
      - afflictions/neurotrauma
    amount: 30
  - text: +30% 化学成瘾
    amount: 30
  - text: +45% 精神病
    amount: 45
  - text: -22.5% 眩晕
    amount: -22.5
  - text: -90% 化学[戒断 Withdrawal](/afflictions/withdrawal)
    refs:
      - afflictions/withdrawal
    amount: -90
trello:
  shortLink: BsBG6GVq
  url: https://trello.com/c/BsBG6GVq/83-%E5%85%B4%E5%A5%8B%E7%B2%89%E5%89%82-methamphetamine
---

### 医疗水平需求：35

_甲基苯丙胺，俗称冰毒_

一种兴奋剂。

### 应用成功时：

\+70% 极速
\+15% [原版器官损伤](/afflictions/vanilla-organ-damage)
\+15% [神经创伤 Neurotrauma](/afflictions/neurotrauma)
\+15% 化学成瘾
\+30% 精神病
\-22.5% 眩晕
\-90% 化学[戒断 Withdrawal](/afflictions/withdrawal)

### 应用失败时：

\+50% 极速
\+30% [原版器官损伤](/afflictions/vanilla-organ-damage)
\+30% [神经创伤 Neurotrauma](/afflictions/neurotrauma)
\+30% 化学成瘾
\+45% 精神病
\-22.5% 眩晕
\-90% 化学[戒断 Withdrawal](/afflictions/withdrawal)

极速效果立刻应用，其他效果在30s内应用
