---
title: 广谱抗生素 Broad-spectrum Antibiotics
nameZh: 广谱抗生素
nameEn: Broad-spectrum Antibiotics
category: item
source: base
order: 15
tags:
  - item
  - first-aid
  - essential
pinyin: guangpukangshengsu
pinyinInitials: gpkss
aliases: []
skill:
  medical: 25
onSuccess:
  - text: 每秒0.2%[原版器官损伤](/afflictions/vanilla-organ-damage)，持续100秒
    refs:
      - afflictions/vanilla-organ-damage
  - text: 每秒0.175%[肾损伤](/afflictions/kidney-damage)，持续100秒
    refs:
      - afflictions/kidney-damage
  - text: 每秒0.175%[肝损伤](/afflictions/liver-damage)，持续100秒
    refs:
      - afflictions/liver-damage
  - text: 每秒0.1%[心脏损伤](/afflictions/heart-damage)，持续100秒
    refs:
      - afflictions/heart-damage
  - text: 每秒0.1%[肺损伤](/afflictions/lung-damage)，持续100秒
    refs:
      - afflictions/lung-damage
  - text: 总共造成20%原版器官损伤，17.5%的肾脏损伤与肝脏损伤，10%的心脏损伤与肺部损伤。
onFailure:
  - text: 每秒0.2%原版器官损伤，持续60秒
  - text: 每秒0.175%肾脏损伤，持续60秒
  - text: 每秒0.175%肝脏损伤，持续60秒
  - text: 每秒0.1%心脏损伤，持续60秒
  - text: 每秒0.1%肺损伤，持续60秒
  - text: 总共造成12%原版器官损伤，10.5%的肾脏损伤与肝脏损伤，6%的心脏损伤与肺部损伤。
trello:
  shortLink: 4lrth0jF
  url: https://trello.com/c/4lrth0jF/79-%E5%B9%BF%E8%B0%B1%E6%8A%97%E7%94%9F%E7%B4%A0-broad-spectrum-antibiotics
---

### 医疗水平需求：25

广谱抗生素是[败血症](/afflictions/sepsis)的主要治疗手段，并且仍然像原版一样提供画皮寄生抗性。

患者的血压必须高于70%，[低血氧](/afflictions/hypoxemia)必须低于30%，才能有效治疗败血症。

### 应用成功时：

成功应用广谱抗生素将提供50%的药效强度，每秒减少0.5%，共计100秒。50%的广谱抗生素药效每秒可治疗0.95%的败血症，持续100秒。
但同时会造成：

- 每秒0.2%[原版器官损伤](/afflictions/vanilla-organ-damage)，持续100秒
- 每秒0.175%[肾损伤](/afflictions/kidney-damage)，持续100秒
- 每秒0.175%[肝损伤](/afflictions/liver-damage)，持续100秒
- 每秒0.1%[心脏损伤](/afflictions/heart-damage)，持续100秒
- 每秒0.1%[肺损伤](/afflictions/lung-damage)，持续100秒
- 总共造成20%原版器官损伤，17.5%的肾脏损伤与肝脏损伤，10%的心脏损伤与肺部损伤。

### 应用失败时：

应用失败时将提供30%的药效强度，每秒减少0.5%，共计60秒。30%的广谱抗生素药效每秒可治疗0.95%的败血症，持续60秒。
但同时会造成：

- 每秒0.2%原版器官损伤，持续60秒
- 每秒0.175%肾脏损伤，持续60秒
- 每秒0.175%肝脏损伤，持续60秒
- 每秒0.1%心脏损伤，持续60秒
- 每秒0.1%肺损伤，持续60秒
- 总共造成12%原版器官损伤，10.5%的肾脏损伤与肝脏损伤，6%的心脏损伤与肺部损伤。
