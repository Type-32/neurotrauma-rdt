---
title: 可塑人造皮肤 Plastiseal
nameZh: 可塑人造皮肤
nameEn: Plastiseal
category: item
source: base
order: 40
tags:
  - item
  - first-aid
  - very-important
pinyin: kesurenzaopifu
pinyinInitials: ksrzpf
aliases: []
skill:
  medical: 22
onSuccess:
  - text: +100% [绷带包扎](/afflictions/bandaged)
    refs:
      - afflictions/bandaged
    amount: 100
  - text: -48% [出血](/afflictions/bleeding)
    refs:
      - afflictions/bleeding
    amount: -48
  - text: -24% [烧伤](/afflictions/burns)
    refs:
      - afflictions/burns
    amount: -24
onFailure:
  - text: +50% 绷带包扎
    amount: 50
  - text: -24% 出血
    amount: -24
  - text: -12% [烧伤](/afflictions/burns)
    refs:
      - afflictions/burns
    amount: -12
trello:
  shortLink: 1rFHGGL2
  url: https://trello.com/c/1rFHGGL2/22-%E5%8F%AF%E5%A1%91%E4%BA%BA%E9%80%A0%E7%9A%AE%E8%82%A4-plastiseal
---

### 医疗水平需求：22

绷带的改进版，可以更有效地治疗伤口。

### 应用成功时：

\+100% [绷带包扎](/afflictions/bandaged)
\-48% [出血](/afflictions/bleeding)
\-24% [烧伤](/afflictions/burns)

### 应用失败时：

\+50% 绷带包扎
\-24% 出血
\-12% [烧伤](/afflictions/burns)

使用可塑人造皮肤也会替换包扎在肢体上的任何脏绷带。每给玩家施加一次可塑人造皮肤都会获得减少10%的移动速度的debuff。绷带包扎的效果会加速[伤口](https://trello.com/c/H8XCHAS6/10-%E4%BC%A4%E5%8F%A3-wounds)的愈合速度，并保护伤口不受[感染](/afflictions/infected-wounds)，然而如果绷带变脏并包扎在伤口上，那么感染速度将急剧增加。可塑人造皮肤也可以在[皮肤牵开](/afflictions/retracted-skin)后使用，以治疗三级[烧伤](/afflictions/burns)。
