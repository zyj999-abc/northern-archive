// Northern Archive v2 - 核心 JS
// 学自 6 大热作: 找到他的情人 (iOS) + 灵异新版 (macOS) + 寻找陈雨彤 (BBS) + 秘密花园 (博客) + 青苗中学 (邮箱) + 邺山彼处 (地图)

// ========== 状态 ==========
const STATE = {
  pin: '',
  pinCorrect: '0826', // 北一创建日
  unlocked: false,
  macOpened: [],
  notesCategory: 'diary',
  forumSearch: '',
  emailRead: [],
  chat: [],
  folderPwCorrect: 'wyynlzdq', // 学自灵异新版回收站的灵异论坛邀请码
  // 进度: 0=锁屏 1=警告 2=iOS桌面 3=macOS桌面 4=游戏主体
  stage: 0,
};

// ========== 工具 ==========
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const show = id => { const e = $(id); if (e) e.style.display = 'block'; };
const hide = id => { const e = $(id); if (e) e.style.display = 'none'; };
const toast = (msg, ms = 3000) => {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
};
const modal = (title, content) => {
  $('modalTitle').textContent = title;
  $('modalContent').innerHTML = content;
  $('genericModal').classList.add('active');
};
window.closeModal = () => $('genericModal').classList.remove('active');

// ========== 阶段 1: iOS 锁屏 ==========
function initIosLock() {
  // 实时时间
  const update = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    if ($('iosTime')) $('iosTime').textContent = `${hh}:${mm}`;
    if ($('iosDate')) $('iosDate').textContent = `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日 ${days[d.getDay()]}`;
    if ($('macTime')) $('macTime').textContent = `${hh}:${mm}`;
  };
  update();
  setInterval(update, 30000);

  // PIN 输入
  $$('#iosKeypad .ios-key').forEach(key => {
    key.addEventListener('click', () => {
      if (STATE.unlocked) return;
      const num = key.dataset.num;
      if (num) {
        if (STATE.pin.length < 4) {
          STATE.pin += num;
          updatePinDots();
          if (STATE.pin.length === 4) {
            setTimeout(checkPin, 200);
          }
        }
      } else if (key.id === 'backspaceKey') {
        STATE.pin = STATE.pin.slice(0, -1);
        updatePinDots();
        $('iosError').textContent = '';
      }
    });
  });
}

function updatePinDots() {
  const dots = $$('#pinDots .ios-pin-dot');
  dots.forEach((d, i) => {
    if (i < STATE.pin.length) d.classList.add('filled');
    else d.classList.remove('filled');
  });
}

function checkPin() {
  if (STATE.pin === STATE.pinCorrect) {
    STATE.unlocked = true;
    $('iosError').textContent = '';
    toast('✅ 解锁成功！');
    setTimeout(() => {
      hide('iosLock');
      show('warningPopup');
      STATE.stage = 1;
    }, 500);
  } else {
    $('iosError').textContent = '密码错误，再试一次';
    const dots = $$('#pinDots .ios-pin-dot');
    dots.forEach(d => d.classList.add('shake'));
    setTimeout(() => {
      STATE.pin = '';
      updatePinDots();
      dots.forEach(d => d.classList.remove('shake'));
    }, 500);
  }
}

// ========== 阶段 2: 警告 -> 桌面 ==========
window.startGame = function() {
  // 用 setProperty 强制
  $('warningPopup').style.setProperty('display', 'none', 'important');
  $('macosDesktop').style.setProperty('display', 'block', 'important');
  STATE.stage = 2;
  startTextRain();
  setTimeout(() => show('notifChat'), 3000);
  toast('💡 双击桌面图标开始探索');
};

function startTextRain() {
  const canvas = $('rainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const chars = '北一档案失踪真相朋友亲人秘密ARG解谜现实代码数字';
  const fontSize = 16;
  const cols = Math.floor(canvas.width / fontSize);
  const drops = Array(cols).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  setInterval(draw, 50);
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ========== 阶段 3: macOS 应用 ==========
window.openMacApp = function(app) {
  if (STATE.macOpened.includes(app)) {
    show('win' + app.charAt(0).toUpperCase() + app.slice(1));
    return;
  }
  STATE.macOpened.push(app);
  const win = $('win' + app.charAt(0).toUpperCase() + app.slice(1));
  if (win) {
    win.style.setProperty('display', 'block', 'important');
    if (app === 'folder') show('folderPwModal');
  } else {
    // 默认处理
    if (app === 'browser') toast('🌐 浏览器暂未开放 - 试试论坛搜索');
    else if (app === 'about') modal('关于本机', '北一档案 v2.0<br>macOS Sonoma 风格<br>学自 6 大热作<br><br>💡 点击底部 🎬 5 个结局图标查看所有结局');
    else if (app === 'map') toast('🗺️ 地图暂未开放');
  }
};

window.closeMacApp = function(app) {
  const win = $('win' + app.charAt(0).toUpperCase() + app.slice(1));
  if (win) win.style.setProperty('display', 'none', 'important');
};

// 文件夹密码
let pendingFolderItem = null;

window.openFolderItem = function(item) {
  pendingFolderItem = item;
  show('folderPwModal');
};

window.closeFolderPw = function() {
  hide('folderPwModal');
  $('folderPwInput').value = '';
};

window.submitFolderPw = function() {
  const pw = $('folderPwInput').value;
  if (pw === STATE.folderPwCorrect) {
    toast('✅ 密码正确！');
    closeFolderPw();
    if (pendingFolderItem === 'pdf') {
      modal('📄 经文.pdf', `
        <h3 style="color:#c60;">《心经》</h3>
        <p>观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。</p>
        <p>舍利子，色不异空，空不异色，色即是空，空即是色。</p>
        <p>...</p>
        <p style="margin-top:12px; color:#888; font-size:12px;">妹妹小的时候经常念这段经文给我听。她说这样就不会害怕。</p>
      `);
    } else if (pendingFolderItem === 'html') {
      modal('🌐 旅游攻略', `
        <h3 style="color:#06c;">北一 2 日游攻略</h3>
        <p><b>Day 1</b>: 火车站 → 灵异博物馆 → 老城小吃街</p>
        <p><b>Day 2</b>: 北一山 → 密室逃脱 (灵异主题) → 返程</p>
        <p style="margin-top:12px; color:#888; font-size:12px;">⚠️ 小心：据说北一山在月圆之夜会有奇怪的声音</p>
      `);
    } else if (pendingFolderItem === 'jpg') {
      modal('🖼️ 生日礼物', `
        <p>一张温馨的照片：两个女孩抱着生日蛋糕，对着镜头笑。</p>
        <p>姐姐林又，妹妹林昭。</p>
        <p style="margin-top:12px; color:#c00;">这是 2024 年 5 月 10 日最后一次过生日。</p>
      `);
    } else if (pendingFolderItem === 'note') {
      modal('📝 密码提示.txt', `
        <p><b>来自林又的备忘：</b></p>
        <p>如果有一天我不在了，请记住：</p>
        <p>1. 不要找警察，他们不会管的</p>
        <p>2. 找灵异论坛 - 用 wyynlzdq 登录</p>
        <p>3. 真相比谎言更可怕</p>
        <p style="margin-top:12px; color:#888; font-size:12px;">PS: 这是 8 月 28 日写下的，给妹妹的生日礼物</p>
      `);
    } else if (pendingFolderItem === 'video') {
      modal('🎥 毕业典礼', `
        <p>视频文件已损坏...</p>
        <p>但你在视频最后一帧看到了一张纸条：</p>
        <p style="background:#000; color:#0f0; padding:8px; font-family:monospace; margin-top:8px;">
        "妹妹，<br>别来找我。<br>不要相信任何人。<br>但如果你一定要找我，<br>请去 灵异论坛。<br>密码是你名字的拼音首字母。"<br>-- 姐姐<br>
        </p>
      `);
    } else if (pendingFolderItem === 'audio') {
      modal('🎵 给我妹妹的歌', `
        <p>林又录制的一段语音:</p>
        <p style="background: rgba(0,0,0,0.1); padding: 8px; border-radius: 4px; margin: 8px 0;">
          "昭昭，今天是你的生日...姐姐录了一首歌给你..."
        </p>
        <p style="font-size: 12px; color: #888;">播放: 《小幸运》- 田馥甄 (节选 00:00-01:23)</p>
      `);
    }
  } else {
    $('folderPwInput').value = '';
    toast('❌ 密码错误，再想想');
  }
};

// ========== 备忘录 ==========
const NOTES = {
  diary: [
    { date: '半个月前', text: '今天又晕倒了，特别是在傍晚。一直做怪梦，每次醒来枕头都是湿的。去医院查不出任何问题，室友说让我去灵异论坛问问...' },
    { date: '三个月前', text: '今天在路上晕倒，被室友送去医院。没医保，检查开药花了好多钱……好想找妈妈哭，但还是忍住了。妈妈已经很辛苦，妹妹要高三了。' },
    { date: '半年前', text: '终于租到合适的房子了！室友是南方人，性格超好，居然也喜欢看恐怖故事。而且我们俩都是 03 年出生的，好巧。' },
    { date: '九个月前', text: '毕业了。工作好难找，文科生真的没出路吗？面试了几家，工资都只有三五千……好想快点赚钱，帮妈妈分担一点。' },
    { date: '一年前', text: '冬月二十晚上十点。过了学生时代最后一个生日，和朋友吃饭聊天，特别开心。' },
  ],
  todo: [
    { date: '今天', text: '去灵异论坛找答案' },
    { date: '明天', text: '去医院复查 - 重点查血液' },
  ],
  recycle: [
    { date: '一周前', text: '我没事我没事我没事我没事我没事我没事' },
    { date: '一个月前', text: '最近总觉得有人跟着我。不是明显的那种，就是背后发凉，一回头又什么都没有。家里东西也好像会自己动。钥匙明明放茶几，醒来却在书房。' },
    { date: '半年前', text: '在微博发了个求助，收到"灵异论坛"的邀请码：<b>wyynlzdq</b>。' },
  ],
};

function renderNotes(cat) {
  STATE.notesCategory = cat;
  const items = NOTES[cat] || [];
  const html = items.map(it => `
    <div class="macos-notes-entry">
      <div class="macos-notes-entry-date">${it.date}</div>
      <div class="macos-notes-entry-text">${it.text}</div>
    </div>
  `).join('');
  $('notesContent').innerHTML = html;
  // 更新 sidebar
  $$('.macos-notes-sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.cat === cat);
  });
}

$$('.macos-notes-sidebar-item').forEach(item => {
  item.addEventListener('click', () => renderNotes(item.dataset.cat));
});

// ========== 论坛搜索 ==========
const FORUM_POSTS = {
  weird: [
    { title: '半夜一直听到楼上有脚步声，但是这是顶楼', author: '深夜不眠者', time: '2025-12-30 02:14', views: 12453, replies: 87, preview: '求求大家帮帮我，我已经连续一个月听到楼上有脚步声了...' },
    { title: '【恐怖】我和外婆的红绳', author: '匿名用户_7X9F2', time: '2025-12-29 21:30', views: 8921, replies: 45, preview: '小时候外婆给我绑了一根红绳，说是保平安的...' },
  ],
  dream: [
    { title: '【真实】一直做同一个梦，梦里有人追杀我', author: '惊魂未定', time: '2025-12-28 14:22', views: 6512, replies: 38, preview: '从 2024 年 10 月开始，我每晚都做同一个梦...' },
  ],
  missing: [
    { title: '【求助】我妹妹林又失踪了，请大家帮帮我', author: '林昭', time: '2025-12-29 22:01', views: 8342, replies: 56, preview: '我妹妹林又去年突然失联，至今没有任何消息...' },
  ],
  horror: [
    { title: '【真实经历】那年我去过的废弃精神病院', author: '探险家老张', time: '2025-12-28 19:33', views: 5621, replies: 34, preview: '我是北一探险队的张哥...' },
  ],
};

function searchForum() {
  const q = $('forumSearch').value.trim();
  STATE.forumSearch = q;
  // 模拟搜索
  if (q === '') {
    renderForum(FORUM_POSTS.weird.slice(0, 3));
  } else {
    const all = [...FORUM_POSTS.weird, ...FORUM_POSTS.dream, ...FORUM_POSTS.missing, ...FORUM_POSTS.horror];
    const results = all.filter(p =>
      p.title.includes(q) || p.preview.includes(q) || p.author.includes(q)
    );
    renderForum(results);
  }
}

function renderForum(posts) {
  if (posts.length === 0) {
    $('forumMain').innerHTML = '<p style="opacity:0.6; text-align:center; padding: 20px;">没有找到相关帖子</p>';
    return;
  }
  $('forumMain').innerHTML = posts.map(p => `
    <div class="macos-forum-post" onclick="openPost('${p.title}')">
      <div class="macos-forum-post-title">${p.title}</div>
      <div class="macos-forum-post-meta">👤 ${p.author} · ${p.time} · 👁 ${p.views.toLocaleString()} · 💬 ${p.replies}</div>
      <div class="macos-forum-post-preview">${p.preview}</div>
    </div>
  `).join('');
}

$('forumSearch').addEventListener('input', searchForum);

window.openPost = function(title) {
  modal('📋 ' + title, `
    <div style="text-align:left; line-height:1.7;">
      <p style="color:#888; font-size:12px;">👤 ${title.includes('林又') ? '林昭' : '匿名'} · 2025-12-29 · 22:01</p>
      <hr>
      <p>${title}...</p>
      <p>求求大家帮帮我，我已经没办法了...</p>
      <p style="color:#c00; margin-top:12px;">⚠️ 这是关键线索！记下 "wyynlzdq"</p>
    </div>
  `);
};

// ========== 邮箱 ==========
const EMAILS = {
  1: {
    from: '林昭 <linzhao@404mail.com>',
    time: '2025年5月10日 22:47',
    subject: '急！我哥的事情，真的只能靠你了！！',
    body: `404 大神：<br><br>我是林昭！还记得吗？就是计算机社团那个总缠着你问代码 bug 的家伙！今天突然找你，是因为有一件特别重要的事情，可能真的只有你能帮我了。<br><br>我跟你说说情况：我哥林又，两年前超神发挥考进了北一中学，那时候我们全家都很为他骄傲！但高三之后，他整个人就不太对劲了。每周四给家里打电话，总说跟同学处不来，心情也越来越 down。学校管得巨严，完全是全封闭式。<br><br>可奇怪的是最后一次通话，他整个人突然"阳光开朗"了起来，语气积极到像换了个人，甚至还安利我："要不你也考北一吧！"<br><br>我当时就觉得有点不对劲，但又因为他状态好转而稍微松了口气。结果没过多久，学校就通知我们：他上吊自杀了。<br><br>我真的没办法接受啊！！！警方和校方都说是因为"学业压力大"，但我哥最后那通电话的状态，明明就完全不像要自杀的样子。<br><br>所以我决定亲自去一趟。现在我已经在这所学校里了...`
  },
  2: {
    from: '未知发件人',
    time: '2025年5月5日 14:23',
    subject: '高薪委托 - 数据恢复项目',
    body: `我们对你的能力很感兴趣。有个项目需要你的帮助，报酬 50,000 元起。详情请登录论坛。密码: wyynlzdq`
  },
  3: {
    from: '全国网络安全大赛组委会',
    time: '2025年4月28日 09:15',
    subject: '恭喜您获得 2025 全国网络安全大赛一等奖',
    body: `恭喜您！您的作品《跨平台 ARG 安全研究》获得本次大赛一等奖。奖金 100,000 元将于 5 月 15 日前到账。`
  },
  4: {
    from: '计算机社团',
    time: '2025年4月25日 16:42',
    subject: '本周社团活动 - 逆向工程实战',
    body: `本周六下午 2 点，3 号机房，活动主题：逆向工程实战。请带笔记本电脑。`
  },
  5: {
    from: '系统',
    time: '2025年4月20日 12:00',
    subject: '您的账号"404"已被创建',
    body: `欢迎加入北一档案！您的初始密码是 wyynlzdq。请尽快修改。`
  },
};

window.openEmail = function(id) {
  const e = EMAILS[id];
  if (!e) return;
  STATE.emailRead.push(id);
  const div = $('winMail').querySelector(`.email-item:nth-child(${id})`);
  if (div) div.classList.remove('unread');
  modal(`📧 ${e.subject}`, `
    <div class="email-body">
      <p class="meta">发件人: ${e.from} | 时间: ${e.time}</p>
      <p>${e.body}</p>
    </div>
  `);
};

// ========== iOS 桌面 app (备用) ==========
$$('.ios-app').forEach(app => {
  app.addEventListener('click', () => {
    const name = app.dataset.app;
    if (name === 'wechat') {
      modal('💬 微信', '请到 macOS 桌面的"聊天软件"查看');
    } else if (name === 'sms') {
      modal('💬 短信', '请到 macOS 桌面的"邮箱"查看');
    } else if (name === 'phone') {
      modal('📞 电话', '请到 macOS 桌面的"邮箱"查看林昭的联系');
    } else if (name === 'album') {
      modal('🖼️ 相册', '请到 macOS 桌面的"秘密文件夹"查看');
    } else if (name === 'instagram') {
      modal('📷 Instagram', '线索请在论坛搜索"林又 Instagram"');
    } else if (name === 'email') {
      // 直接跳 macOS 邮箱
      hide('iosDesktop');
      show('macosDesktop');
      setTimeout(() => openMacApp('mail'), 1000);
    } else if (name === 'note') {
      modal('📝 备忘录', '请到 macOS 桌面的"备忘录"查看');
    } else if (name === 'map') {
      modal('🗺️ 地图', '🗺️ 地图暂未开放');
    }
  });
});

// ========== 初始化 ==========
window.addEventListener('DOMContentLoaded', () => {
  initIosLock();
  renderNotes('diary');
});
