---
title: 如何安装 Lua for Barotrauma
nameZh: 如何安装
nameEn: Lua for Barotrauma
category: general
source: base
order: 10
tags:
  - info
pinyin: ruheanzhuang
pinyinInitials: rhaz
aliases: []
trello:
  shortLink: Tpfz1Bzq
  url: https://trello.com/c/Tpfz1Bzq/218-%E5%A6%82%E4%BD%95%E5%AE%89%E8%A3%85-lua-for-barotrauma
---

你可以看这个，或者直接往下翻。

[BV1bci3ebENf](https://www.bilibili.com/video/BV1bci3ebENf/?share_source=copy_web&vd_source=cb69979a15fc60651b2068e7c53b1fbd)



[Lua for Barotrauma](https://steamcommunity.com/sharedfiles/filedetails/?id=2559634234)是一个为潜渊症添加了Lua和Cs支持的模组，该模组并不直接替换XML的功能，而是用于实现XML所不能实现的功能。

#### 如何安装Lua：打开[**Lua for Barotrauma**](https://steamcommunity.com/sharedfiles/filedetails/?id=2559634234)**工坊简介选择你需要的安装方式。**

## 服务器安装Lua:

很多Lua模组都是服务器端的，只要服务器开启Lua这些mod就能使用，在服务器端启用Lua只需要在创建服务器时选择Lua可执行文件。

**如果你需要检查Lua是否成功启用，可以按F3打开debug控制台并输入“reloadlua”**

注：如果想在单人游戏中启用Lua请查看下方法。

## 客户端安装Lua:

客户端Lua是在单人模式中使用的Lua。

例如[Neurotrauma](https://steamcommunity.com/sharedfiles/filedetails/?id=3190189044)在安装了Lua的多人服务端上可以正常运行，但在单人客户端需要安装客户端Lua才行。而[NT Eyes](https://steamcommunity.com/sharedfiles/filedetails/?id=3294574390)和[NT Cybernetics Enhanced](https://steamcommunity.com/sharedfiles/filedetails/?id=3324062208)（神经创伤子模组）同时需要服务端Lua和客户端Lua才能在多人模式中正常运行，也就是说想玩这种模组需要每个人都安装客户端Lua才行。具体Lua需求请参考模组作者在工坊简介中给出的信息。

**如果你需要检查Lua是否成功启用，可以按F3打开debug控制台并输入“cl_reloadlua”**

更多有关Lua的问题可以加入[Luatrauma discord server](https://discord.gg/f9zvNNuxu9)进行讨论。

---

[Lua for Barotrauma](https://steamcommunity.com/sharedfiles/filedetails/?id=2559634234) is a Barotrauma modification that adds Lua and Cs modding, this is not a direct replacement for XML, but works great in doing things that weren't possible in XML.

### How to Install Lua: Check out the [Lua for Barotrauma](https://steamcommunity.com/sharedfiles/filedetails/?id=2559634234) workshop page for specific installation guide for your OS.

# Server Side Lua:

Many Lua mods are server-sided, meaning Lua is only required to work on the server for those mods to work, to enable the mod on the server-side simply select the Server Executable when in the hosting menu.
**If you want to checkout if the Lua is working properly on the server, open the debug console (F3) and run the command "reloadlua"**

Note: This obviously doesn't work if you play on singleplayer, for that you will need to install Client-side Lua.

# Client Side Lua:

Client-side Lua is when the mod is running in your game client, many mods make use of it to either do more extensive changes to the game or to add singleplayer support.

For example [Neurotrauma](https://steamcommunity.com/sharedfiles/filedetails/?id=3190189044) will work mostly fine if you are playing multiplayer and only the server has Lua installed, it straightforward won't work on singleplayer if you don't have Client-side Lua installed, while -as examples- [NT Eyes](https://steamcommunity.com/sharedfiles/filedetails/?id=3294574390) and [NT Cybernetics Enhanced](https://steamcommunity.com/sharedfiles/filedetails/?id=3324062208) (Neurotrauma expansions) require both Server-side Lua and Client-side Lua to work properly on **multiplayer**, that means for these mods, everyone will need Client-side Lua installed for it to work properly. It depends on each mod, so consult the description/author of the mod to make sure.

**If you want to checkout if the mod is working properly on the client, open the debug console (F3) and run the command "cl_reloadlua".**

For any further questions regarding Lua you can join the [Luatrauma discord server](https://discord.gg/f9zvNNuxu9).
