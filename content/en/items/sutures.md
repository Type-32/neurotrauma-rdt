---
title: 缝合线 Sutures
nameZh: 缝合线
nameEn: Sutures
category: item
source: base
order: 57
tags:
  - item
  - essential
pinyin: fenghexian
pinyinInitials: fhx
aliases: []
skill:
  medical: 30
onSuccess:
  - text: -20% [伤口](/afflictions/open-wounds)（除钝器伤害）
    refs:
      - afflictions/open-wounds
    amount: -20
  - text: -40% [出血](/afflictions/bleeding)
    refs:
      - afflictions/bleeding
    amount: -40
onFailure:
  - text: +6% [内脏损伤](/afflictions/internal-damage)
    refs:
      - afflictions/internal-damage
    amount: 6
trello:
  shortLink: 8qkE0cbo
  url: https://trello.com/c/8qkE0cbo/126-%E7%BC%9D%E5%90%88%E7%BA%BF-sutures
---

### 医疗水平需求：30

所有外科手术的最后一步。对治疗大多数[伤口](/afflictions/open-wounds)和[出血](/afflictions/bleeding)也非常有用。

### 应用成功时：

成功使用缝合线将消除任何与手术有关的效果（如[手术切口](/afflictions/surgery-incision)或[钻孔的骨头](/afflictions/drilled-bones)）
\-20% [伤口](/afflictions/open-wounds)（除钝器伤害）
\-40% [出血](/afflictions/bleeding)

移除所有手术效果

### 应用失败时：

\+6% [内脏损伤](/afflictions/internal-damage)
