# 北一档案 v2 (Northern Archive v2)

> **ARG 网页解谜游戏** - 学自谜页集 (`miyeji.cn`) TOP 6 真实热作
> 2026-08-28 完整第二版

## 🎮 游戏简介

**剧情**: 你的同学林昭的姐姐林又失踪了，警方以"自杀"匆匆结案，但你相信另有隐情。通过 **iOS 锁屏 → 警告弹窗 → macOS 桌面**，你将探索 林又的电脑、邮箱、论坛、文件夹，找出真相。

**游戏时长**: 1-2 小时

**难度**: 入门 (有提示)

**类型**: ARG / 网页解谜 / 多结局

## 🛠️ 学到的工具/技法 (来源)

| 工具/技法 | 来源热作 | 在 v2 中应用 |
|----------|---------|-------------|
| iOS 锁屏 + 4 位 PIN | 找到他的情人 (`zdtdqr.pages.dev`) | 开场解锁 |
| macOS 桌面 + 多 app | 灵异新版 (`mminghuo.github.io/forum`) | 主游戏界面 |
| 文件夹密码 = 拼音首字母 | 灵异新版回收站 (wyynlzdq) | 关键 ARG 密码 |
| 5 篇日记 + 3 篇回收站 | 灵异新版温妍姐姐 | 林又 5 篇日记 |
| 微恐 + 不血腥 | 青苗中学 | 风格基调 |
| 登录密码 = 生日彩蛋 | 寻找陈雨彤 (啾啾/920916) | PIN 0826 (北一创建日) |
| 多结局 (5 个) | 灵异旧版 | 5 个真相结局 |
| 跨站 ARG | 秘密花园 | 4 站跳 (本游戏内嵌入) |
| 邮箱 + 5 封邮件 | 青苗中学 | 林昭 + 4 干扰邮件 |
| 文学论坛 + 求助帖 | 寻找陈雨彤 (秉烛夜谈) | 灵异论坛板块 |

## 🎯 5 个真相结局

1. **结局 A - 真相大白**: 姐姐被实验, 5 个 NGO 组织曝光, 全部获救
2. **结局 B - 重新开始**: 玩家和姐姐组队, 继续调查
3. **结局 C - 假贝真相**: 姐姐假死, 实际是卧底
4. **结局 D - 沉默**: 玩家放弃调查, 永远不知道真相
5. **结局 E - 奶奶的礼物**: 玩家发现真相藏在奶奶遗物中

## 📁 文件结构

```
v2/
├── index.html          # 入口 (iOS 锁屏 + 警告 + iOS桌面 + macOS桌面)
├── css/
│   └── base.css        # 完整 CSS (iOS/macOS/BBS/博客/邮箱)
├── js/
│   └── core.js         # 核心逻辑 (PIN 校验/桌面/邮件/论坛/日记)
├── doc/
│   ├── IMPROVE_V1.md   # v1 改进清单
│   ├── IMPROVE_V2.md   # v2 改进清单
│   └── V2_DESIGN.md    # v2 设计文档
└── README.md
```

## 🔑 关键 ARG 密码

| 密码 | 含义 | 提示位置 |
|------|------|---------|
| `0826` | iOS 锁屏 PIN (北一创建日) | 锁屏底部 |
| `wyynlzdq` | 文件夹密码 (灵异论坛邀请码) | 备忘录"半年前" + 邮箱 5 |

## 🚀 快速开始

### 本地预览

```bash
cd v2
python -m http.server 8000
# 访问 http://localhost:8000
```

### 部署到 GitHub Pages

```bash
# 在 v2 目录初始化
git init
git add .
git commit -m "v2.0 - 学自 6 大热作"
git branch -M main
git remote add origin https://github.com/zyj999-abc/northern-archive.git
git push -u origin main --force
```

### 推送到现有 northern-archive 仓库

将 v2 内容复制到 `northern-archive/` 根目录，然后 push。

## 📸 学到的 6 大热作

| # | 游戏 | 作者 | 入口 | 热度 |
|---|------|------|------|------|
| 1 | 邺山彼处 | kikoj | (待查) | 3,703 |
| 2 | 寻找陈雨彤 | 万同筋骨贴 | bingzhuyetan.com | 3,643 |
| 3 | 灵异论坛调查记录 | 明烛天青 | mminghuo.github.io/forum | 178,678 |
| 4 | 合成大狗叫 | 以太新星 | waoowaoo.com | 1,536 |
| 5 | 南湾一中: 找到我 | 围巾猫 | 小红书 | 1,416 |
| 6 | 找到他的情人 | 桐曜 | zdtdqr.pages.dev | 5.3万 |

**详见**: `D:\Desktop\kai\z\gz\northern-archive\test\real_play\REPORT.md`

## ⚖️ 许可

个人非商业使用，商业使用需 GitHub Issue 申请。
