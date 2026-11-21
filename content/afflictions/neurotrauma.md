---
title: 神经创伤 Neurotrauma
nameZh: 神经创伤
nameEn: Neurotrauma
category: head
source: base
order: 0
tags:
  - scanner-visible
  - lethal
  - affliction
lethal: true
pinyin: shenjingchuangshang
pinyinInitials: sjcs
aliases: []
causedBy:
  - text: "[中风](/afflictions/stroke) (20%及以上)"
    refs:
      - afflictions/stroke
    threshold: 20
  - text: "[肝脏损伤](/afflictions/liver-damage)（80%及以上，超过神经创伤自愈的速度）"
    refs:
      - afflictions/liver-damage
    threshold: 80
  - text: "[肾脏损伤](/afflictions/kidney-damage)（损伤达到100%时神经创伤不会自愈）"
    refs:
      - afflictions/kidney-damage
    threshold: 100
  - text: "[败血症](/afflictions/sepsis)（25%及以上，超过神经创伤自愈的速度）"
    refs:
      - afflictions/sepsis
    threshold: 25
  - text: "[骨折](/afflictions/fractures)  (颅骨骨折，如果没有包扎且病人没有神经创伤)"
    refs:
      - afflictions/fractures
  - text: "[低血氧](/afflictions/hypoxemia)（10%及以上，超过神经创伤自愈的速度）"
    refs:
      - afflictions/hypoxemia
    threshold: 10
  - text: 在头部使用[止血带](/items/tourniquet)
    refs:
      - items/tourniquet
  - text: "[兴奋粉剂](/items/methamphetamine)"
    refs:
      - items/methamphetamine
  - text: "[加速粉剂](/items/hyperzine)"
    refs:
      - items/hyperzine
  - text: "[创伤性休克](/afflictions/traumatic-shock)（每秒增加的数值相当于创伤性休克数值/100。当10%时超过神经创伤自愈的数值）"
    refs:
      - afflictions/traumatic-shock
  - text: "[氰化物中毒](/afflictions/cyanide-poisoning)（70%及以上）"
    refs:
      - afflictions/cyanide-poisoning
    threshold: 70
causes:
  - text: 对生命力的直接伤害
  - text: 立即死亡（达到200%时）
    threshold: 200
  - text: "[呼吸停止](/afflictions/respiratory-arrest) (达到100%及以上)"
    refs:
      - afflictions/respiratory-arrest
    threshold: 100
  - text: "[失去意识](/afflictions/unconsciousness) (达到100%及以上)"
    refs:
      - afflictions/unconsciousness
    threshold: 100
treatment:
  - text: 治疗病因
  - text: "[甘露醇](/items/mannitol) （仅在血液稳定的情况下，即使血液不稳定，也会使神经创伤增速减半。）"
    refs:
      - items/mannitol
  - text: "[甘露醇加](/items/mannitol-plus)"
    refs:
      - items/mannitol-plus
trello:
  shortLink: mSCbdqbP
  url: https://trello.com/c/mSCbdqbP/87-%E7%A5%9E%E7%BB%8F%E5%88%9B%E4%BC%A4-neurotrauma
---

神经创伤是为数不多能对你的健康造成直接伤害的苦痛之一。
神经创伤是非常危险的，可以很快积累起来，一旦达到200%，就会立即杀死玩家。在配置文件不变，并且没有其他损伤影响的情况下，神经创伤将以每秒0.1%的速度恢复。
Neurotrauma is one of the only things that can deal direct damage to your health. Neurotrauma is extremely dangerous and can build up very quickly, and upon reaching 200%, will instantly kill the player.The brain will heal at a rate of 0.1% per second, assuming that the config is unchanged and nothing is damaging it.

---

## 由以下原因造成：

- [中风](/afflictions/stroke) (20%及以上)
- [肝脏损伤](/afflictions/liver-damage)（80%及以上，超过神经创伤自愈的速度）
- [肾脏损伤](/afflictions/kidney-damage)（损伤达到100%时神经创伤不会自愈）
- [败血症](/afflictions/sepsis)（25%及以上，超过神经创伤自愈的速度）
- [骨折](/afflictions/fractures)  (颅骨骨折，如果没有包扎且病人没有神经创伤)
- [低血氧](/afflictions/hypoxemia)（10%及以上，超过神经创伤自愈的速度）
- 在头部使用[止血带](/items/tourniquet)
- [兴奋粉剂](/items/methamphetamine)
- [加速粉剂](/items/hyperzine)
- [创伤性休克](/afflictions/traumatic-shock)（每秒增加的数值相当于创伤性休克数值/100。当10%时超过神经创伤自愈的数值）
- [氰化物中毒](/afflictions/cyanide-poisoning)（70%及以上）

## 导致：

- 对生命力的直接伤害
- 立即死亡（达到200%时）
- [呼吸停止](/afflictions/respiratory-arrest) (达到100%及以上)
- [失去意识](/afflictions/unconsciousness) (达到100%及以上)

## 治疗措施：

- 治疗病因
- [甘露醇](/items/mannitol) （仅在血液稳定的情况下，即使血液不稳定，也会使神经创伤增速减半。）
- [甘露醇加](/items/mannitol-plus)
