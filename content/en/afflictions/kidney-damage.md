---
title: 肾脏损伤 Kidney Damage
nameZh: 肾脏损伤
nameEn: Kidney Damage
category: torso
source: base
order: 3
tags:
  - scanner-visible
  - affliction
  - lethal
  - non-lethal
lethal: true
pinyin: shenzangsunshang
pinyinInitials: szss
aliases: []
causedBy:
  - text: "[广谱抗生素](/items/broad-spectrum-antibiotics)"
    refs:
      - items/broad-spectrum-antibiotics
  - text: "[液态氧矿](/items/liquid-oxygenite)"
    refs:
      - items/liquid-oxygenite
  - text: "[输血性休克](/afflictions/hemotransfusion-shock) (在0-70%之间)"
    refs:
      - afflictions/hemotransfusion-shock
  - text: "[甘露醇](/items/mannitol)"
    refs:
      - items/mannitol
  - text: "[辐射病](/afflictions/radiation-sickness) (33%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为29%)"
    refs:
      - afflictions/radiation-sickness
    threshold: 33
  - text: "[高血压](/afflictions/hypertension) (184%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为152%)"
    refs:
      - afflictions/hypertension
    threshold: 184
  - text: "[败血症](/afflictions/sepsis)（6%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为3%）"
    refs:
      - afflictions/sepsis
    threshold: 6
  - text: "[低血氧](/afflictions/hypoxemia)（8%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为4%）"
    refs:
      - afflictions/hypoxemia
    threshold: 8
causes:
  - text: "[腿部肿胀](/symptoms/leg-swelling) (达到60%及以上)"
    refs:
      - symptoms/leg-swelling
    threshold: 60
  - text: "[酸中毒](/afflictions/acidosis) (达到80%及以上)"
    refs:
      - afflictions/acidosis
    threshold: 80
  - text: "[高血压](/afflictions/hypertension)"
    refs:
      - afflictions/hypertension
  - text: "[骨损伤](/afflictions/bone-damage) (达到72%及以上，超过骨自愈速度)"
    refs:
      - afflictions/bone-damage
    threshold: 72
  - text: "[呕吐](/symptoms/vomiting) (达到60%及以上)"
    refs:
      - symptoms/vomiting
    threshold: 60
  - text: "[神经创伤](/afflictions/neurotrauma)（达到100%时会中和神经创伤的自愈速度）"
    refs:
      - afflictions/neurotrauma
    threshold: 100
  - text: "[恶心](/symptoms/nausea) (达到60%及以上)"
    refs:
      - symptoms/nausea
    threshold: 60
treatment:
  - text: 时间
  - text: "[硫胺素](/items/thiamine)"
    refs:
      - items/thiamine
  - text: "[器官移植手术](/procedures/organ-transplant-surgery)"
    refs:
      - procedures/organ-transplant-surgery
trello:
  shortLink: u2zs2qY7
  url: https://trello.com/c/u2zs2qY7/77-%E8%82%BE%E8%84%8F%E6%8D%9F%E4%BC%A4-kidney-damage
---

肾脏损伤通常是可以存活的，因为即使已经发展到肾衰竭，它仍然会极其缓慢地导致死亡。肾脏损伤如果超过50%的阈值，就不会愈合到50%以下，因为其中一个肾脏已经坏死。在配置文件不变，未受其他因素影响的情况下，如果一个肾脏活着，肾脏将以每秒0.01%的速度恢复，如果两个肾脏都活着，将以每秒0.02%的速度恢复。
Kidney damage is usually survivable, as even if it has progressed to kidney failure, it will still kill extremely slowly. Kidney damage will not heal below 50% damage if it passes the 50% threshold, as one of the kidneys has died. The kidneys will heal at a rate of 0.01% per second if one kidney is alive, and will heal at a rate of 0.02% per second if both kidneys are alive, assuming that the config is unchanged and nothing is damaging them.

---

## 由以下原因造成：

- [广谱抗生素](/items/broad-spectrum-antibiotics)
- [液态氧矿](/items/liquid-oxygenite)
- [输血性休克](/afflictions/hemotransfusion-shock) (在0-70%之间)
- [甘露醇](/items/mannitol)
- [辐射病](/afflictions/radiation-sickness) (33%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为29%)
- [高血压](/afflictions/hypertension) (184%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为152%)
- [败血症](/afflictions/sepsis)（6%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为3%）
- [低血氧](/afflictions/hypoxemia)（8%及以上，超过肾脏自愈的速度，如果其中一个肾坏死，则为4%）

## 导致：

- [腿部肿胀](/symptoms/leg-swelling) (达到60%及以上)
- [酸中毒](/afflictions/acidosis) (达到80%及以上)
- [高血压](/afflictions/hypertension)
- [骨损伤](/afflictions/bone-damage) (达到72%及以上，超过骨自愈速度)
- [呕吐](/symptoms/vomiting) (达到60%及以上)
- [神经创伤](/afflictions/neurotrauma)（达到100%时会中和神经创伤的自愈速度）
- [恶心](/symptoms/nausea) (达到60%及以上)

## 治疗措施：

- 时间
- [硫胺素](/items/thiamine)
- [器官移植手术](/procedures/organ-transplant-surgery)
