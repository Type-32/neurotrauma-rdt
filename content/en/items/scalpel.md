---
title: 手术刀 Scalpel
nameZh: 手术刀
nameEn: Scalpel
category: item
source: base
order: 47
manual: true
tags:
  - item
  - surgery
  - essential
pinyin: shoushudao
pinyinInitials: ssd
aliases: []
skill:
  medical: 30
onFailure:
  - text: +15% [出血](/afflictions/bleeding)
    refs:
      - afflictions/bleeding
    amount: 15
  - text: +10% [撕裂伤](/afflictions/open-wounds)
    refs:
      - afflictions/open-wounds
    amount: 10
trello:
  shortLink: u3LAdUsS
  url: https://trello.com/c/u3LAdUsS/103-%E6%89%8B%E6%9C%AF%E5%88%80-scalpel
---

### 医疗水平需求：30

**所有**外科手术的第二步。如果没有[镇痛](/afflictions/analgesia)或[麻醉 Anesthesia](/afflictions/anesthesia) ，手术刀就**不会**起作用。

### 应用成功时：

使病人在使用该工具的肢体上获得[手术切口](/afflictions/surgery-incision)，并将去除任何[石膏](/afflictions/plaster-cast)或[绷带](/afflictions/bandaged)。

### 应用失败时：

\+15% [出血](/afflictions/bleeding)
\+10% [撕裂伤](/afflictions/open-wounds)
