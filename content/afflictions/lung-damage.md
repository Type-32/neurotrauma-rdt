---
title: 肺部损伤 Lung Damage
nameZh: 肺部损伤
nameEn: Lung Damage
category: lungs
source: base
order: 1
tags:
  - non-lethal
  - affliction
  - scanner-visible
  - lethal
lethal: true
pinyin: feibusunshang
pinyinInitials: fbss
aliases: []
causedBy:
  - text: "[广谱抗生素](/items/broad-spectrum-antibiotics)"
    refs:
      - items/broad-spectrum-antibiotics
  - text: "[液态氧矿](/items/liquid-oxygenite)"
    refs:
      - items/liquid-oxygenite
  - text: 使用含有焊接燃料罐、燃素燃料罐或涂料的[急救呼吸气囊](/items/ambubag)
    refs:
      - items/ambubag
  - text: 吸烟
  - text: "[输血性休克](/afflictions/hemotransfusion-shock)（在0-70%之间）"
    refs:
      - afflictions/hemotransfusion-shock
  - text: "[辐射病](/afflictions/radiation-sickness)（28%及以上，超过肺部自愈的速度）"
    refs:
      - afflictions/radiation-sickness
    threshold: 28
  - text: "[败血症](/afflictions/sepsis)（3%及以上，超过肺部自愈的速度）"
    refs:
      - afflictions/sepsis
    threshold: 3
  - text: "[低血氧](/afflictions/hypoxemia)（4%及以上，超过肺部自愈的速度）"
    refs:
      - afflictions/hypoxemia
    threshold: 4
causes:
  - text: "[咳嗽](/symptoms/cough)（达到50%及以上）"
    refs:
      - symptoms/cough
    threshold: 50
  - text: "[呼吸困难](/symptoms/shortness-of-breath) （达到45%及以上）"
    refs:
      - symptoms/shortness-of-breath
    threshold: 45
  - text: "[呼吸停止](/afflictions/respiratory-arrest) （达到100%）"
    refs:
      - afflictions/respiratory-arrest
    threshold: 100
treatment:
  - text: 时间
  - text: "[硫胺素](/items/thiamine)"
    refs:
      - items/thiamine
  - text: "[器官移植手术](/procedures/organ-transplant-surgery)"
    refs:
      - procedures/organ-transplant-surgery
trello:
  shortLink: sJHaU6Wl
  url: https://trello.com/c/sJHaU6Wl/4-%E8%82%BA%E9%83%A8%E6%8D%9F%E4%BC%A4-lung-damage
---

只要低于100%，肺部损伤就不会致命。在配置文件不变、未受其他因素影响、肺部损伤低于100%的情况下，肺部将以每秒0.01%的速度恢复。
Lung damage is not lethal, as long as it is below 100%. The lungs will heal at a rate of 0.01% per second, assuming that the config is unchanged, nothing is damaging them and they're below 100% damage.

---

## 由以下原因造成：

- [广谱抗生素](/items/broad-spectrum-antibiotics)
- [液态氧矿](/items/liquid-oxygenite)
- 使用含有焊接燃料罐、燃素燃料罐或涂料的[急救呼吸气囊](/items/ambubag)
- 吸烟
- [输血性休克](/afflictions/hemotransfusion-shock)（在0-70%之间）
- [辐射病](/afflictions/radiation-sickness)（28%及以上，超过肺部自愈的速度）
- [败血症](/afflictions/sepsis)（3%及以上，超过肺部自愈的速度）
- [低血氧](/afflictions/hypoxemia)（4%及以上，超过肺部自愈的速度）

## 导致：

- [咳嗽](/symptoms/cough)（达到50%及以上）
- [呼吸困难](/symptoms/shortness-of-breath) （达到45%及以上）
- [呼吸停止](/afflictions/respiratory-arrest) （达到100%）

## 治疗措施：

- 时间
- [硫胺素](/items/thiamine)
- [器官移植手术](/procedures/organ-transplant-surgery)
