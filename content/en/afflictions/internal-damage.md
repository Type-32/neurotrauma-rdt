---
title: 内伤 Internal Damage
nameZh: 内伤
nameEn: Internal Damage
category: any
source: base
order: 1
manual: true
tags:
  - scanner-visible
  - affliction
  - possibly-lethal
  - interface-visible
pinyin: neishang
pinyinInitials: ns
aliases: []
causedBy:
  - text: 摔倒时撞到墙上
  - text: 潜艇压到
  - text: 钝器伤武器，比如[Crowbar](https://barotraumagame.com/wiki/Crowbar)  (撬棍)
causes:
  - text: 生命值损失，与收到的伤害成正比
  - text: "[脱臼 Dislocations](/afflictions/dislocations) ， 在受到至少2点伤害后"
    refs:
      - afflictions/dislocations
  - text: 胳膊与腿[骨折 Fractures](/afflictions/fractures) , >2伤害
    refs:
      - afflictions/fractures
  - text: 头与脖子[骨折 Fractures](/afflictions/fractures) , >15伤害
    refs:
      - afflictions/fractures
  - text: 肋骨[骨折 Fractures](/afflictions/fractures)
    refs:
      - afflictions/fractures
  - text: 器官损伤或 [原版器官损伤](/afflictions/vanilla-organ-damage) ,强度为0和所受伤害之间的随机范围
    refs:
      - afflictions/vanilla-organ-damage
  - text: "[气胸 Pneumothorax](/afflictions/pneumothorax) ,在大于5伤害时"
    refs:
      - afflictions/pneumothorax
  - text: "[脑震荡 Concussion](/afflictions/concussion) , 在大于15伤害时"
    refs:
      - afflictions/concussion
  - text: "[创伤性截肢 Traumatic Amputation](/afflictions/traumatic-amputation) ,在大于15伤害且肢体上有骨折时发生"
    refs:
      - afflictions/traumatic-amputation
treatment:
  - text: "[绷带包扎 Bandaged](/afflictions/bandaged) ，除非已经受到超过100伤害"
    refs:
      - afflictions/bandaged
  - text: "[凝胶冰袋 Gel Ice Pack](/items/gel-ice-pack) ，除非已经受到超过100伤害"
    refs:
      - items/gel-ice-pack
  - text: "[开始&结束手术 Open & Close Surgery](/procedures/open-close-surgery) 时在使用[缝合线 Sutures](/items/sutures) 前使用[镊子 Tweezers](/items/tweezers)"
    refs:
      - procedures/open-close-surgery
      - items/sutures
      - items/tweezers
  - text: "[战斗兴奋剂 Combat Stimulant](/items/combat-stimulant)"
    refs:
      - items/combat-stimulant
  - text: "[Pomegrenade Extract](https://barotraumagame.com/wiki/Pomegrenade_Extract)  (爆弹石榴提取物)"
onFailure:
  - text: "[镊子 Tweezers](/items/tweezers)"
    refs:
      - items/tweezers
  - text: "[缝合线 Sutures](/items/sutures)"
    refs:
      - items/sutures
  - text: "[皮肤牵开 Retracted Skin](/afflictions/retracted-skin)"
    refs:
      - afflictions/retracted-skin
  - text: "[手术钻 Surgical Drill](/items/surgical-drill)"
    refs:
      - items/surgical-drill
  - text: "[手术锯 Surgical Saw](/items/surgical-saw)"
    refs:
      - items/surgical-saw
  - text: "[脊髓植入物 Spinal Cord Implants](/items/spinal-cord-implants)"
    refs:
      - items/spinal-cord-implants
  - text: "[骨合成植入物 Osteosynthesis Implants](/items/osteosynthesis-implants)"
    refs:
      - items/osteosynthesis-implants
trello:
  shortLink: 18zL5fAz
  url: https://trello.com/c/18zL5fAz/145-%E5%86%85%E4%BC%A4-internal-damage
---

一个人可能受到的[Damage (Affliction Type](https://barotraumagame.com/wiki/Damage_(Affliction_Type) "smartCard-inline")（伤害）根据情况不同分为两组 , [开放性伤口 Open Wounds](/afflictions/open-wounds) 或内伤。

内伤不会导致[伤口感染 Infected Wounds](/afflictions/infected-wounds)  。

## 钝器伤:

这种类型的伤口通常与出血无关，但如果伤口严重，仍可能危及生命。伤口超过100后不会自然再生。

### 病因:

- 摔倒时撞到墙上
- 潜艇压到
- 钝器伤武器，比如[Crowbar](https://barotraumagame.com/wiki/Crowbar)  (撬棍)

### 效果：

- 生命值损失，与收到的伤害成正比
- [脱臼 Dislocations](/afflictions/dislocations) ， 在受到至少2点伤害后
- 胳膊与腿[骨折 Fractures](/afflictions/fractures) , >2伤害
- 头与脖子[骨折 Fractures](/afflictions/fractures) , >15伤害
- 肋骨[骨折 Fractures](/afflictions/fractures)
- 器官损伤或 [原版器官损伤](/afflictions/vanilla-organ-damage) ,强度为0和所受伤害之间的随机范围
- [气胸 Pneumothorax](/afflictions/pneumothorax) ,在大于5伤害时
- [脑震荡 Concussion](/afflictions/concussion) , 在大于15伤害时
- [创伤性截肢 Traumatic Amputation](/afflictions/traumatic-amputation) ,在大于15伤害且肢体上有骨折时发生

上述痛苦是有概率出现的。受到的伤害越大，出现机会就越大。

### 治疗措施：

- [绷带包扎 Bandaged](/afflictions/bandaged) ，除非已经受到超过100伤害
- [凝胶冰袋 Gel Ice Pack](/items/gel-ice-pack) ，除非已经受到超过100伤害
- [开始&结束手术 Open & Close Surgery](/procedures/open-close-surgery) 时在使用[缝合线 Sutures](/items/sutures) 前使用[镊子 Tweezers](/items/tweezers)
- [战斗兴奋剂 Combat Stimulant](/items/combat-stimulant)
- [Pomegrenade Extract](https://barotraumagame.com/wiki/Pomegrenade_Extract)  (爆弹石榴提取物)

## 内脏损伤:

一种罕见的伤口，通常是由其他疾病和技能检查失败引起的。不像其他伤口[Damage (Affliction Type](https://barotraumagame.com/wiki/Damage_(Affliction_Type) "smartCard-inline")  ，内伤在健康UI里不显示。

### 病因:

- 没有[绷带包扎 Bandaged](/afflictions/bandaged)  的[脱臼 Dislocations](/afflictions/dislocations)
- 没有[石膏固定 Plaster Cast](/afflictions/plaster-cast) 的[骨折 Fractures](/afflictions/fractures)
- 使用下列物品时技能检验失败:
  - [镊子 Tweezers](/items/tweezers)
  - [缝合线 Sutures](/items/sutures)
  - [皮肤牵开 Retracted Skin](/afflictions/retracted-skin)
  - [手术钻 Surgical Drill](/items/surgical-drill)
  - [手术锯 Surgical Saw](/items/surgical-saw)
  - [脊髓植入物 Spinal Cord Implants](/items/spinal-cord-implants)
  - [骨合成植入物 Osteosynthesis Implants](/items/osteosynthesis-implants)

### 效果:

- 生命值损失，与收到的伤害成正比
- [脱臼 Dislocations](/afflictions/dislocations) ， 在受到至少2点伤害后
- 胳膊与腿[骨折 Fractures](/afflictions/fractures) , >2伤害
- 头与脖子[骨折 Fractures](/afflictions/fractures) , >15伤害
- 肋骨[骨折 Fractures](/afflictions/fractures)
- 器官损伤或 [原版器官损伤](/afflictions/vanilla-organ-damage) ,强度为0和所受伤害之间的随机范围
- [气胸 Pneumothorax](/afflictions/pneumothorax) ,在大于5伤害时
- [脑震荡 Concussion](/afflictions/concussion) , 在大于15伤害时
- [创伤性截肢 Traumatic Amputation](/afflictions/traumatic-amputation) ,在大于15伤害且肢体上有骨折时发生

上述痛苦是有概率出现的。受到的伤害越大，出现机会就越大。

### 治疗措施:

- [开始&结束手术 Open & Close Surgery](/procedures/open-close-surgery) 时在使用[缝合线 Sutures](/items/sutures) 前使用[镊子 Tweezers](/items/tweezers)
- [战斗兴奋剂 Combat Stimulant](/items/combat-stimulant)
- [Pomegrenade Extract](https://barotraumagame.com/wiki/Pomegrenade_Extract)  (爆弹石榴提取物)



---

The [Damage (Affliction Type](https://barotraumagame.com/wiki/Damage_(Affliction_Type) "smartCard-inline") that a person may receive is divided into two groups based on their properties, [开放性伤口 Open Wounds](/afflictions/open-wounds) and internal wounds.

Internal wounds do not cause [伤口感染 Infected Wounds](/afflictions/infected-wounds).

## Blunt force trauma:

This type of wound is typically not associated with bleeding, but may still cause life-threatening afflictions if it is a strong hit. Does not naturally regenerate past 100 strength.

### Causes:

- Falling, being knocked into a wall
- Crushed by a submarine
- Blunt weapons, such as a [Crowbar](https://barotraumagame.com/wiki/Crowbar)

### Effects:

- Vitality loss, proportional to damage taken
- [脱臼 Dislocations](/afflictions/dislocations), after taking at least 2 damage
- Arm and leg [骨折 Fractures](/afflictions/fractures), >2 damage
- Head and neck [骨折 Fractures](/afflictions/fractures), >15 damage
- Rib [骨折 Fractures](/afflictions/fractures)
- Organ damage or [原版器官损伤](/afflictions/vanilla-organ-damage), random range between 0 and damage taken
- [气胸 Pneumothorax](/afflictions/pneumothorax), >5 damage
- [脑震荡 Concussion](/afflictions/concussion), >15 damage
- [创伤性截肢 Traumatic Amputation](/afflictions/traumatic-amputation), >15 damage and there is a fracture on the limb

The aforementioned afflictions are gained based on chance. More damage taken will result in a higher chance.

### Treatments:

- [绷带包扎 Bandaged](/afflictions/bandaged), unless it is over 100 strength
- [凝胶冰袋 Gel Ice Pack](/items/gel-ice-pack), unless it is over 100 strength
- Using [镊子 Tweezers](/items/tweezers) before [缝合线 Sutures](/items/sutures) during [开始&结束手术 Open & Close Surgery](/procedures/open-close-surgery)
- [战斗兴奋剂 Combat Stimulant](/items/combat-stimulant)
- [Pomegrenade Extract](https://barotraumagame.com/wiki/Pomegrenade_Extract)

## Internal damage:

An uncommon wound which is typically caused by other afflictions and failed skill checks. Unlike other [Damage (Affliction Type](https://barotraumagame.com/wiki/Damage_(Affliction_Type) "smartCard-inline"), internal damage does not appear in the Health UI.

### Causes:

- [脱臼 Dislocations](/afflictions/dislocations), when they are not[绷带包扎 Bandaged](/afflictions/bandaged)
- [骨折 Fractures](/afflictions/fractures), when they do not have a [石膏固定 Plaster Cast](/afflictions/plaster-cast)
- Failing the skill check when using:
  - [镊子 Tweezers](/items/tweezers)
  - [缝合线 Sutures](/items/sutures)
  - [牵开器 Retractors](/items/retractors)
  - [手术钻 Surgical Drill](/items/surgical-drill)
  - [手术锯 Surgical Saw](/items/surgical-saw)
  - [脊髓植入物 Spinal Cord Implants](/items/spinal-cord-implants)
  - [骨合成植入物 Osteosynthesis Implants](/items/osteosynthesis-implants)

### Effects:

- Vitality loss, proportional to damage taken
- [脱臼 Dislocations](/afflictions/dislocations)
- Arm and leg [骨折 Fractures](/afflictions/fractures), after taking at least 5 damage
- Head and neck [骨折 Fractures](/afflictions/fractures), >15 damage
- Rib [骨折 Fractures](/afflictions/fractures), >5 damage
- Organ damage or [原版器官损伤](/afflictions/vanilla-organ-damage), random range between 0 and damage taken
- [气胸 Pneumothorax](/afflictions/pneumothorax), >5 damage
- [脑震荡 Concussion](/afflictions/concussion), >15 damage
- [创伤性截肢 Traumatic Amputation](/afflictions/traumatic-amputation), >10 damage and there is a fracture on the limb

### Treatments:

- Using [镊子 Tweezers](/items/tweezers) before [缝合线 Sutures](/items/sutures) during [开始&结束手术 Open & Close Surgery](/procedures/open-close-surgery)
- [战斗兴奋剂 Combat Stimulant](/items/combat-stimulant)
- [Pomegrenade Extract](https://barotraumagame.com/wiki/Pomegrenade_Extract)

The aforementioned afflictions are gained based on chance. More damage taken will result in a higher chance.
