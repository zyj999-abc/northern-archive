# v2 改进清单 (学自 6 大热作)

## v1 → v2 关键变化

### 1. 视觉风格 (从 BBS → 现代化)

| 维度 | v1 | v2 |
|------|-----|-----|
| 主界面 | 80 年代 BBS 文字 | **iOS + macOS** |
| 配色 | 灰色 + 蓝 | Apple Sonoma 蓝紫 |
| 字体 | 仿宋 | SF Pro / 苹方 |
| 动效 | 无 | 文字雨 + 弹窗 + 模糊 |
| 沉浸感 | ★★ | ★★★★★ |

### 2. 工具/技法 (从手写 HTML → 仿真 OS)

**v1 工具**:
- 简单 HTML 页面
- 5 个结局页
- 6 章节

**v2 工具** (学自 6 大热作):
- ✅ iOS 7/8 锁屏 + 4 位 PIN
- ✅ macOS Sonoma 桌面 + 多 app
- ✅ 文件夹密码保护 (学自灵异新版)
- ✅ 5 篇日记 + 3 篇回收站 (学自温妍)
- ✅ 邮箱系统 + 5 封邮件 (学自青苗)
- ✅ 论坛搜索 + 板块导航 (学自陈雨彤)
- ✅ 终端 (新增)
- ✅ 文字雨特效 (学自青苗)
- ✅ 警告弹窗 (学自秘密花园)
- ✅ 通知系统 (学自 macOS)

### 3. 剧情深度 (从 5 选 1 → 多线索交织)

**v1 剧情**:
- 6 章 → 5 结局
- 单线索
- 1 个核心谜题

**v2 剧情**:
- 林又失踪真相
- 5 条线索 (日记/回收站/邮箱/论坛/文件夹)
- 5 个不同结局
- ARG 密码 2 个 (0826, wyynlzdq)
- 跨页面 (iOS 桌面 → macOS 桌面 → 浏览器 → 真实论坛)

### 4. ARG 真实感 (从游戏 → 现实)

**v1**: 纯网页游戏

**v2**:
- iPhone 锁屏 (真实可解锁)
- macOS 桌面 (真实可点)
- 文件夹密码 (真实要解)
- 邮箱 (真实可读)
- 论坛 (真实可搜)
- 多端跳 (游戏内)

## 关键技术实现

### 1. iOS 锁屏

```html
<div class="ios-lock">
  <div class="ios-time">10:38</div>
  <div class="ios-pin-dots" id="pinDots">
    <div class="ios-pin-dot"></div>
    ...
  </div>
  <div class="ios-keypad" id="iosKeypad">
    <div class="ios-key" data-num="1">1</div>
    ...
  </div>
</div>
```

```js
// 4 位 PIN 校验
const PIN = '0826';
let pin = '';
$$('#iosKeypad .ios-key').forEach(key => {
  key.addEventListener('click', () => {
    if (key.dataset.num) {
      pin += key.dataset.num;
      if (pin.length === 4) checkPin();
    }
  });
});
```

### 2. macOS 桌面

```html
<div class="macos-desktop">
  <div class="macos-statusbar">
    <span>🍎</span>
    <span id="macTime">18:00</span>
  </div>
  <div class="macos-desktop-icon" onclick="openApp('chat')">
    <div class="macos-desktop-icon-emoji">💬</div>
    <div class="macos-desktop-icon-name">聊天软件</div>
  </div>
  ...
  <div class="macos-dock">
    <div class="macos-dock-item">💬</div>
    ...
  </div>
</div>
```

### 3. 文件夹密码

```js
const FOLDER_PW = 'wyynlzdq';
function submitFolderPw() {
  const pw = $('folderPwInput').value;
  if (pw === FOLDER_PW) {
    show('folderContent');
  }
}
```

## 5 个结局的触发条件

| 结局 | 触发条件 |
|------|---------|
| A 真相大白 | 看完所有日记 + 回收站 + 5 封邮件 + 解锁文件夹 |
| B 重新开始 | A 结局后选"组队" |
| C 假贝真相 | 看完所有日记，发现回收站"半年前" |
| D 沉默 | 任一环节点"放弃" |
| E 奶奶的礼物 | 在论坛搜"奶奶" |

## 学自 6 大热作的关键洞察

1. **iOS 锁屏是 4 位 PIN** (找到他的情人)
2. **macOS 文件夹要密码** (灵异新版)
3. **回收站里藏关键信息** (灵异新版)
4. **论坛搜索是核心交互** (陈雨彤)
5. **密码 = 拼音首字母** (灵异新版 wyynlzdq)
6. **5 封邮件 = 1 主线 + 4 干扰** (青苗)
7. **生日 = 登录密码** (陈雨彤 920916)
8. **微恐 = 不血腥 + 暗示** (青苗)
