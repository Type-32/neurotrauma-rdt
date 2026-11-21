---
title: 空血袋 Empty Blood Pack
nameZh: 空血袋
nameEn: Empty Blood Pack
category: item
source: base
order: 20
tags:
  - item
  - important
pinyin: kongxuedai
pinyinInitials: kxd
aliases: []
skill:
  medical: 30
onSuccess:
  - text: +30% [失血](/afflictions/blood-loss)
    refs:
      - afflictions/blood-loss
    amount: 30
onFailure:
  - text: +40% 失血
    amount: 40
trello:
  shortLink: tiuI3DxF
  url: https://trello.com/c/tiuI3DxF/141-%E7%A9%BA%E8%A1%80%E8%A2%8B-empty-blood-pack
---

### 医疗水平需求：30

空血包是用来获取[血袋](/items/blood-packs)的。空血包只能用在[失血](/afflictions/blood-loss)低于31%的人类身上，否则没有任何作用。

### 应用成功时：

\+30% [失血](/afflictions/blood-loss)

### 应用失败时：

\+40% 失血

如果供血者患有[酸中毒](/afflictions/acidosis)、[碱中毒](/afflictions/alkalosis)或[败血症](/afflictions/sepsis)，那么这些苦痛也将被赋予给输血者（获得的苦痛数值为献血者献血时血液的苦痛数值除以5）。
