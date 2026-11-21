---
title: 心脏损伤 Heart Damage
nameZh: 心脏损伤
nameEn: Heart Damage
category: heart
source: base
order: 3
tags:
  - non-lethal
  - affliction
  - scanner-visible
  - lethal
lethal: true
pinyin: xinzangsunshang
pinyinInitials: xzss
aliases: []
causedBy:
  - text: "[心脏病发作](/afflictions/heart-attack)"
    refs:
      - afflictions/heart-attack
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
  - text: "[辐射病](/afflictions/radiation-sickness) (29%及以上，超过心脏自愈速度)"
    refs:
      - afflictions/radiation-sickness
    threshold: 29
  - text: "[败血症](/afflictions/sepsis)（3%及以上，超过心脏自愈速度）"
    refs:
      - afflictions/sepsis
    threshold: 3
  - text: '[低血氧](%22%E2%80%8C%22 "")（4%及以上，超过心脏自愈速度）'
    threshold: 4
causes:
  - text: "[咳嗽](/symptoms/cough) (达到80%及以上)"
    refs:
      - symptoms/cough
    threshold: 80
  - text: "[呼吸急促](/symptoms/shortness-of-breath) (达到80%及以上)"
    refs:
      - symptoms/shortness-of-breath
    threshold: 80
  - text: "[心搏骤停](/afflictions/cardiac-arrest) (达到100%)"
    refs:
      - afflictions/cardiac-arrest
    threshold: 100
  - text: "[腿部肿胀](/symptoms/leg-swelling) (达到80%及以上)"
    refs:
      - symptoms/leg-swelling
    threshold: 80
treatment:
  - text: 时间
  - text: "[硫胺素](/items/thiamine)"
    refs:
      - items/thiamine
  - text: "[器官移植手术](/procedures/organ-transplant-surgery)"
    refs:
      - procedures/organ-transplant-surgery
trello:
  shortLink: SLTSubH0
  url: https://trello.com/c/SLTSubH0/59-%E5%BF%83%E8%84%8F%E6%8D%9F%E4%BC%A4-heart-damage
---

只要低于100%，心脏损伤就不会致命。在配置文件不变、未受其他因素影响、心脏损伤低于100%的情况下，心脏将以每秒0.01%的速度恢复。
Heart damage is not lethal, as long as it is below 100%. The heart will heal at a rate of 0.01% per second, assuming that the config is unchanged, nothing is damaging it and it's below 100% damage.

---

## 由以下原因造成：

- [心脏病发作](/afflictions/heart-attack)
- [广谱抗生素](/items/broad-spectrum-antibiotics)
- [液态氧矿](/items/liquid-oxygenite)
- [输血性休克](/afflictions/hemotransfusion-shock) (在0-70%之间)
- [甘露醇](/items/mannitol)
- [辐射病](/afflictions/radiation-sickness) (29%及以上，超过心脏自愈速度)
- [败血症](/afflictions/sepsis)（3%及以上，超过心脏自愈速度）
- [低血氧](%22%E2%80%8C%22 "")（4%及以上，超过心脏自愈速度）

## 导致：

- [咳嗽](/symptoms/cough) (达到80%及以上)
- [呼吸急促](/symptoms/shortness-of-breath) (达到80%及以上)
- [心搏骤停](/afflictions/cardiac-arrest) (达到100%)
- [腿部肿胀](/symptoms/leg-swelling) (达到80%及以上)

## 治疗措施：

- 时间
- [硫胺素](/items/thiamine)
- [器官移植手术](/procedures/organ-transplant-surgery)
