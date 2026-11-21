---
title: 肝脏损伤 Liver Damage
nameZh: 肝脏损伤
nameEn: Liver Damage
category: torso
source: base
order: 4
tags:
  - scanner-visible
  - affliction
  - lethal
  - non-lethal
lethal: true
pinyin: ganzangsunshang
pinyinInitials: gzss
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
  - text: "[辐射病](/afflictions/radiation-sickness)（29%及以上，超过肝脏自愈速度）"
    refs:
      - afflictions/radiation-sickness
    threshold: 29
  - text: "[败血症](/afflictions/sepsis)（3%及以上，超过肝脏自愈速度）"
    refs:
      - afflictions/sepsis
    threshold: 3
  - text: "[低血氧](/afflictions/hypoxemia)（4%及以上，超过肝脏自愈速度）"
    refs:
      - afflictions/hypoxemia
    threshold: 4
  - text: 醉酒（大于40%）
causes:
  - text: "[腿部肿胀](/symptoms/leg-swelling) (达到40%及以上)"
    refs:
      - symptoms/leg-swelling
    threshold: 40
  - text: "[内出血](/afflictions/internal-bleeding) (达到100%时)"
    refs:
      - afflictions/internal-bleeding
    threshold: 100
  - text: "[吐血](/symptoms/vomiting-blood) (达到100%时)"
    refs:
      - symptoms/vomiting-blood
    threshold: 100
  - text: "[高血压](/afflictions/hypertension)"
    refs:
      - afflictions/hypertension
  - text: "[神经创伤](/afflictions/neurotrauma)（达到80%及以上，超过神经创伤自愈速度）"
    refs:
      - afflictions/neurotrauma
    threshold: 80
  - text: "[腹部不适](/symptoms/abdominal-discomfort) (达到65%及以上)"
    refs:
      - symptoms/abdominal-discomfort
    threshold: 65
  - text: "[黄疸](/symptoms/jaundice) (达到80%及以上)"
    refs:
      - symptoms/jaundice
    threshold: 80
  - text: "[腹胀](/symptoms/bloating) (达到50%及以上)"
    refs:
      - symptoms/bloating
    threshold: 50
  - text: 减弱自然止血的能力，在100%的损伤下，出血将不会自然止住。
treatment:
  - text: 时间
  - text: "[硫胺素](/items/thiamine)"
    refs:
      - items/thiamine
  - text: "[器官移植手术](/procedures/organ-transplant-surgery)"
    refs:
      - procedures/organ-transplant-surgery
trello:
  shortLink: sii6KrPW
  url: https://trello.com/c/sii6KrPW/78-%E8%82%9D%E8%84%8F%E6%8D%9F%E4%BC%A4-liver-damage
---

肝脏损伤如果发展到肝脏衰竭是致命的，并可能导致以[内出血](/afflictions/internal-bleeding)形式的大量失血。在配置文件不变、未受其他因素影响、肝脏损伤低于100%的情况下，肝脏将以每秒0.01%的速度恢复。
Liver damage, if progressed to liver failure, is fatal and can cause massive blood loss in the form of [内出血 Internal Bleeding](/afflictions/internal-bleeding). The liver will heal at a rate of 0.01% per second, assuming that the config is unchanged, nothing is damaging it and it's below 100% damage.

---

## 由以下原因造成：

- [广谱抗生素](/items/broad-spectrum-antibiotics)
- [液态氧矿](/items/liquid-oxygenite)
- [输血性休克](/afflictions/hemotransfusion-shock) (在0-70%之间)
- [辐射病](/afflictions/radiation-sickness)（29%及以上，超过肝脏自愈速度）
- [败血症](/afflictions/sepsis)（3%及以上，超过肝脏自愈速度）
- [低血氧](/afflictions/hypoxemia)（4%及以上，超过肝脏自愈速度）
- 醉酒（大于40%）

## 导致：

- [腿部肿胀](/symptoms/leg-swelling) (达到40%及以上)
- [内出血](/afflictions/internal-bleeding) (达到100%时)
- [吐血](/symptoms/vomiting-blood) (达到100%时)
- [高血压](/afflictions/hypertension)
- [神经创伤](/afflictions/neurotrauma)（达到80%及以上，超过神经创伤自愈速度）
- [腹部不适](/symptoms/abdominal-discomfort) (达到65%及以上)
- [黄疸](/symptoms/jaundice) (达到80%及以上)
- [腹胀](/symptoms/bloating) (达到50%及以上)
- 减弱自然止血的能力，在100%的损伤下，出血将不会自然止住。

## 治疗措施：

- 时间
- [硫胺素](/items/thiamine)
- [器官移植手术](/procedures/organ-transplant-surgery)
