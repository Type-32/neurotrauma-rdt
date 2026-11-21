---
title: 创伤性休克 Traumatic Shock
nameZh: 创伤性休克
nameEn: Traumatic Shock
category: surgery
source: base
order: 0
tags:
  - affliction
  - lethal
  - surgery
  - interface-visible
  - scanner-visible
lethal: true
pinyin: chuangshangxingxiuke
pinyinInitials: csxxk
aliases: []
causedBy:
  - text: 实施不安全的手术 (在没有手术台或没有施用镇静剂的情况下)
  - text: 在有枪伤或深层组织损伤的肢体时使用[镊子](/items/tweezers) （导致非常轻微的的创伤性休克，通常可以忽略）
    refs:
      - items/tweezers
causes:
  - text: "[低血压](/afflictions/hypotension) (而且会降低很多)"
    refs:
      - afflictions/hypotension
  - text: "[心搏骤停](/afflictions/cardiac-arrest) (达到40%及以上)"
    refs:
      - afflictions/cardiac-arrest
    threshold: 40
  - text: "[呼吸停止](/afflictions/respiratory-arrest)（达到30%及以上）"
    refs:
      - afflictions/respiratory-arrest
    threshold: 30
  - text: "[神经创伤](/afflictions/neurotrauma)（当前效果强度除以100/每秒增加，10%及以上即超过神经创伤自愈速度）"
    refs:
      - afflictions/neurotrauma
    threshold: 10
  - text: 精神病(每秒增加相当于创伤性休克强度除以100的值)
treatment:
  - text: 终止手术
  - text: 将病人带到[手术台](/items/surgery-table)附近或等待其恢复
    refs:
      - items/surgery-table
trello:
  shortLink: ZILqPqam
  url: https://trello.com/c/ZILqPqam/113-%E5%88%9B%E4%BC%A4%E6%80%A7%E4%BC%91%E5%85%8B-traumatic-shock
---

创伤性休克是非常致命的，如果您的患者在任何时候出现这种情况，应立即终止手术，将他们带回到[手术台](/items/surgery-table)附近，或再次服用镇痛剂。如果受害者在[麻醉](/afflictions/anesthesia)下或在手术台附近且有[镇痛](/afflictions/analgesia)效果，创伤性休克的强度将下降4倍。
Traumatic shock is very fatal, and should your patient acquire this at any point, immediately terminate the surgery, bring them back into the proximity of a Surgery Table or administer sedation again. Traumatic shock will decrease in strength 4x as fast provided the victim is under the effects of Anesthesia or has Analgesia while being near a Surgery Table.

---

## 由以下原因造成：

- 实施不安全的手术 (在没有手术台或没有施用镇静剂的情况下)
- 在有枪伤或深层组织损伤的肢体时使用[镊子](/items/tweezers) （导致非常轻微的的创伤性休克，通常可以忽略）

## 导致：

- [低血压](/afflictions/hypotension) (而且会降低很多)
- [心搏骤停](/afflictions/cardiac-arrest) (达到40%及以上)
- [呼吸停止](/afflictions/respiratory-arrest)（达到30%及以上）
- [神经创伤](/afflictions/neurotrauma)（当前效果强度除以100/每秒增加，10%及以上即超过神经创伤自愈速度）
- 精神病(每秒增加相当于创伤性休克强度除以100的值)

## 治疗措施：

- 终止手术
- 将病人带到[手术台](/items/surgery-table)附近或等待其恢复

## 预防措施：

- 在进行皮肤牵开后续的操作前确保手术安全进行
- 确保镇痛不会在手术中途结束
