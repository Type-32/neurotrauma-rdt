---
title: 绷带 Bandages
nameZh: 绷带
nameEn: Bandages
category: item
source: base
order: 11
tags:
  - item
  - first-aid
  - important
pinyin: bengdai
pinyinInitials: bd
aliases: []
skill:
  medical: 10
onSuccess:
  - text: +50% [绷带包扎](/afflictions/bandaged)
    refs:
      - afflictions/bandaged
    amount: 50
  - text: -24% [出血](/afflictions/bleeding)
    refs:
      - afflictions/bleeding
    amount: -24
onFailure:
  - text: +36% [绷带包扎](/afflictions/bandaged)
    refs:
      - afflictions/bandaged
    amount: 36
  - text: -18% [出血](/afflictions/bleeding)
    refs:
      - afflictions/bleeding
    amount: -18
trello:
  shortLink: JLGQztvd
  url: https://trello.com/c/JLGQztvd/21-%E7%BB%B7%E5%B8%A6-bandages
---

### 医疗水平需求：10

绷带被用于包扎伤口，以防止[伤口感染](/afflictions/infected-wounds)。

### 应用成功时：

\+50% [绷带包扎](/afflictions/bandaged)
\-24% [出血](/afflictions/bleeding)

### 应用失败时：

\+36% [绷带包扎](/afflictions/bandaged)
\-18% [出血](/afflictions/bleeding)

使用绷带也会替换所在肢体上的脏绷带。每给玩家施加一个绷带，将得到一个减少10%的移动速度的debuff。绷带包扎的效果会加速[伤口](https://trello.com/c/H8XCHAS6/10-%E4%BC%A4%E5%8F%A3-wounds)的愈合速度，并保护伤口不受[感染](https://trello.com/b/L1OlKnqk/wipneurotrauma-guide-cn)，然而如果绷带变脏并包扎在伤口上，那么感染速度将急剧增加。绷带可以使用[创伤剪](/items/trauma-shears)或者[潜水刀](/items/diving-knife)移除。
