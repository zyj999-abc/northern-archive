# 北国档案 / Northern Archive

> 2009 年 12 月 · 黑龙江黑河市。19 岁的你去市档案馆查爷爷的档案，发现 1959 年的记录**已被销毁**。

## 🎮 这是什么

- **中文互动叙事** 解谜游戏
- 题材：政治历史创伤 + 真相追寻 + **没有"坏人"**
- 时代：2009 雪地 / 1959-1989 回溯
- 时长：1.5-2.5 小时
- 结局：3 主 + 2 隐藏
- 风格：极简 · 真实 · 沉默

## ✨ 核心设计（来自 6 大平台热作学习）

- **零外链 / 零加速器 / 零耳机**：所有内容浏览器内闭合
- **30+ 细节堆**（学溪埕 36 篇学生作品）
- **钩子在前 3 句**（学陈雨彤）
- **localStorage 存进度**（学灵异论坛 4 个 LS key）

## 🛠️ 技术

- 15 个 HTML + 1 个 JS = 0 依赖
- 3 个 localStorage key：`na_progress` / `na_evidence` / `na_identity`
- 纯手写 CSS · 无 Tailwind · 无 React

## 🚀 本地运行

```bash
git clone https://github.com/zyj999-abc/northern-archive.git
cd northern-archive
python -m http.server 8000
# 打开 http://localhost:8000/
```

## 📂 页面

| 路径 | 内容 |
|---|---|
| `index.html` | 阅前声明（20 秒看完）|
| `archive.html` | 档案馆登录（姓名 + 18 位身份证）|
| `search.html` | 检索结果 + 6 频道导航 + 工作人员提示 |
| `c1_baoKan.html` | 📰 黑河日报 1989-2009（7 条新闻）|
| `c2_huJi.html` | 🆔 户籍档案（5 条记录）|
| `c3_danWei.html` | 🏭 第 135 厂（6 份职工档案）|
| `c4_yiWu.html` | 📦 奶奶家旧 Kindle（5 件遗物）|
| `c5_qqQun.html` | 💬 19 中 95 届群（5 段对话）|
| `c6_xiaoXun.html` | 📋 寻人/失踪公告（4 条）|
| `choose.html` | 4 道德选择 + 1 隐藏 |
| `end_A_luntan.html` | 写论文 |
| `end_B_shengCheng.html` | 烧掉 |
| `end_C_jiaBei.html` | 上传境外 |
| `end_D_chenMo.html` | 沉默 |
| `end_E_naiNai.html` | (隐藏) 回家告诉奶奶 |

## 🔐 5 个真实语义密码

| 入口 | 答案 |
|---|---|
| 档案馆登录 | `李泽宇` + `230826200112010019`（出生日期）|
| 报纸检索 | `1989`（暴风雪年）|
| 户籍迁移 | `1959` |
| 135 厂 | `135厂` |
| 奶奶家 | `北山` |

> ⚠️ **不剧透细节**。所有答案在剧情中能找到。

## 📜 License

本作品采用**个人非商用许可**。详见 [LICENSE](LICENSE) 文件。

> 个人使用 ✅ / 二次创作 ✅（保留署名） / 商用 ❌（需先在 GitHub Issues 申请）
