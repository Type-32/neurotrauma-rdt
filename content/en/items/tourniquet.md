---
title: 止血带 Tourniquet
nameZh: 止血带
nameEn: Tourniquet
category: item
source: base
order: 59
tags:
  - item
  - first-aid
  - very-important
pinyin: zhixuedai
pinyinInitials: zxd
aliases: []
skill:
  medical: 30
onFailure:
  - text: +6% [钝器伤](/afflictions/internal-damage)
    refs:
      - afflictions/internal-damage
    amount: 6
trello:
  shortLink: YWvKWC0z
  url: https://trello.com/c/YWvKWC0z/175-%E6%AD%A2%E8%A1%80%E5%B8%A6-tourniquet
---

### 医疗水平需求：30

用来限制特定肢体的血流以减少出血的物品。如果没有[动脉出血](/afflictions/arterial-bleeding)，止血带就**不会**起作用。止血带效果在[开始&结束手术 Open & Close Surgery](/procedures/open-close-surgery) 后会自动消除。在头部使用止血带将给受害者带来15%的[神经创伤](/afflictions/neurotrauma)，200%的[缺氧](/afflictions/oxygen-low)。

### 应用成功时：

使用止血带可以暂时阻止动脉破裂，并慢慢治疗常规出血，但如果长期使用会导致[坏疽](/afflictions/gangrene)。

### 应用失败时：

\+6% [钝器伤](/afflictions/internal-damage)
