---
title: 血液分析仪 Hematology Analyzer
nameZh: 血液分析仪
nameEn: Hematology Analyzer
category: item
source: base
order: 26
tags:
  - item
  - essential
pinyin: xueyefenxiyi
pinyinInitials: xyfxy
aliases: []
skill:
  medical: 30
onSuccess:
  - text: +1% [失血](/afflictions/blood-loss)
    refs:
      - afflictions/blood-loss
    amount: 1
onFailure:
  - text: +3% [失血](/afflictions/blood-loss)
    refs:
      - afflictions/blood-loss
    amount: 3
trello:
  shortLink: bBiq29CB
  url: https://trello.com/c/bBiq29CB/55-%E8%A1%80%E6%B6%B2%E5%88%86%E6%9E%90%E4%BB%AA-hematology-analyzer
---

### 医疗水平需求：30

### 应用成功时：

\+1% [失血](/afflictions/blood-loss)

### 应用失败时：

\+3% [失血](/afflictions/blood-loss)

无论成功与否，都会给你提供病人所有与血液有关的疾病的数据，如[败血症](/afflictions/sepsis)、[酸中毒](/afflictions/acidosis)或[碱中毒](/afflictions/alkalosis)。血液分析仪还可以用来检查病人的血型，以避免[输血性休克](/afflictions/hemotransfusion-shock)。将捐献者卡放入分析仪，然后使用它，会将他们的血型打印在捐献者的卡上，并放在他们的ID卡插槽中，让你以后不用分析仪就能确定他们的血型。
