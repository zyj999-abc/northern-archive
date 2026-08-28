// 失联 v3 - 核心 JS
// 灵感: 谜页集 6 大热作
// 核心设计: 所有数据本地 JS, 密码是真实语义

(function() {
'use strict';

// ========== 状态 ==========
const STATE = {
  pin: '',
  pinCorrect: '0511',  // 姐姐最后消息日期: 5月11日
  attempts: 0,
  unlocked: false,
  currentPwTarget: null,  // 'truth' 或 'note'
  truthPw: 'jiangxue0915',  // 真相.txt 密码: jiangxue(拼音) + 0915(生日)
  notePw: '20240511',  // 加密笔记密码: 2024年5月11日 (姐姐最后现身日)
  appOpened: {},
  notes: {
    today: { date: '2024 年 5 月 11 日 (周六)', title: '⚡ 最后一条', content: '妈让回个电话, 我说忙. 其实我也没那么忙, 就是不想接. 晚上给晚晚发了条消息说找到工作了, 明天入职. 发了之后我又把它删了, 又重新发了一遍, 因为我觉得妹妹会担心我. 明天就走了, 不知道什么时候能回来. 把小雪文件夹的密码发到自己邮箱了, 万一我忘了能找回来.', tag: '关键' },
    recent: [
      { date: '2024 年 5 月 10 日 (周五)', title: '明天入职武阳一家公司, 做销售. 月薪 3500. 没什么好激动的, 主要是解决住的问题. 找了个押一付三的合租房, 在武阳老城区, 离公司近.' },
      { date: '2024 年 5 月 5 日', title: '跟晚晚视频了 20 分钟, 她说她下个月毕业答辩. 我没敢告诉她我还没找到工作. 妈妈打电话我没接.' },
      { date: '2024 年 5 月 1 日', title: '五一假期, 同学们都出去玩了, 我一个人在宿舍投简历. 投了 30 多家, 没几个回的.' },
      { date: '2024 年 4 月 28 日', title: '今天去了武阳面试, 在一个老写字楼里, 走廊很暗. 主管是个中年男人, 一直盯着我看, 问了很多私人问题: 家是哪里的, 父母做什么的, 有没有男朋友. 我感觉不太对.' },
      { date: '2024 年 4 月 20 日', title: '校招基本结束了, 我没找到工作. 室友都签了三方, 我假装签了. 妈每天打电话问, 我说还在面试.' },
    ],
    old: [
      { date: '2024 年 3 月 15 日', title: '今天去武阳找房子, 看了一个老小区, 三室一厅, 800 元/月. 房子很旧, 但便宜. 窗户能看到一棵很老的梧桐树.' },
      { date: '2024 年 2 月 28 日', title: '和晚晚吃了顿火锅庆祝她考上研. 她说"姐你也可以的", 我没说话.' },
      { date: '2024 年 2 月 14 日', title: '情人节. 一个人在学校图书馆. 复习高数. 吃了室友给的德芙.' },
      { date: '2024 年 1 月 15 日', title: '放假回家. 妈给我包了饺子. 我说学校忙, 初四就回了学校. 在火车上哭了.' },
      { date: '2023 年 12 月 31 日', title: '跨年. 跟晚晚视频. 她问"姐你为什么从来不跟家里说真话", 我说"因为你们承受不了".' },
      { date: '2023 年 11 月 20 日', title: '今天江晚给我打电话, 她说"姐你生日想要什么". 我说"想要你考上研". 她真考上了. 我比自己考上还开心.' },
    ],
    locked: [
      { date: '🔒', title: '关于明天... (4 月 28 日写)', content: '我不该去那个公司. 但我需要钱. 武阳老城区的房子便宜, 步行 5 分钟到公司. 主管说他会安排. 我不知道他要安排什么. 这几天, 总有个人跟着我. 我坐公交, 他也坐. 我去便利店, 他也去. 我告诉自己别多想. 但今晚回家, 门口放了一个外卖袋子, 不是我点的. 里面是一瓶水, 和一个纸条: "明天 9 点准时到".', tag: '加密' },
    ],
  },
  wechatContacts: [
    { id: 'mama', name: '妈妈', avatar: '妈', msg: '你怎么又不接电话', color: '#e91e63' },
    { id: 'wanwan', name: '妹妹·江晚', avatar: '晚', msg: '姐, 你今天怎么样?', color: '#9c27b0' },
    { id: 'fang', name: '武阳老同学·方', avatar: '方', msg: '听说你去武阳了? 小心点', color: '#ff9800' },
    { id: 'shen', name: '陌生号码·沈', avatar: '?', msg: '江雪小姐, 我们再聊聊?', color: '#607d8b' },
  ],
  wechatCurrent: null,
  wechatHistories: {
    mama: [
      { from: 'them', text: '你怎么又不接电话?' },
      { from: 'them', text: '你爸说梦到你了, 说你瘦了' },
      { from: 'them', text: '雪儿?' },
      { from: 'them', text: '看到回个消息, 妈担心你' },
    ],
    wanwan: [
      { from: 'them', text: '姐! 答辩通过了吗?' },
      { from: 'them', text: '姐?' },
      { from: 'me', text: '通过了!' },
      { from: 'them', text: '太好了!!! 晚上视频?' },
      { from: 'me', text: '好, 9 点' },
    ],
    fang: [
      { from: 'them', text: '听说你去武阳了? 武阳那边最近不太平' },
      { from: 'them', text: '我朋友说, 武阳老城区有个写字楼, 专骗刚毕业的女大学生' },
      { from: 'them', text: '你去面试的话, 千万别一个人去' },
    ],
    shen: [
      { from: 'them', text: '江雪小姐, 你的简历我们看了' },
      { from: 'them', text: '明天可以来面试吗? 武阳老城区建设路 88 号, 华清大厦 6 楼' },
      { from: 'them', text: '记得带身份证和一张近期照片' },
    ],
  },
  mailOpened: {},
  // 关键时间线 (玩家从这些数据中找到真相)
  timeline: {
    '2024-05-10': '收到武阳人事面试通知',
    '2024-05-11': '姐姐最后现身日: 发消息"明天入职", 下午 5 点后失联',
    '2024-05-12': '合租房房东发现租客未入住, 通知家人',
    '2024-05-15': '家人在老房子发现姐姐物品未带走, 报警',
    '2024-06-10': '警方结案: "暂未发现刑事案件证据"',
    '2024-08-15': '你 (江晚) 找到姐姐的旧 MacBook',
  },
  endingPath: 'A',  // 结局
};
window.__NA_STATE = STATE;

// ========== 工具 ==========
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const show = id => { const e = $(id); if (e) e.style.display = ''; };
const hide = id => { const e = $(id); if (e) e.style.display = 'none'; };
const toast = (msg, ms = 3000) => {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
};

// ========== 锁屏 PIN (学自找到他的情人 0625) ==========
function initLock() {
  // 时间
  const updateTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    if ($('macTime')) $('macTime').textContent = `${hh}:${mm}`;
    if ($('macClock')) $('macClock').textContent = `${hh}:${mm}`;
  };
  updateTime();
  setInterval(updateTime, 30000);

  // PIN
  $$('#macKeypad .mac-key').forEach(key => {
    key.addEventListener('click', () => {
      if (STATE.unlocked) return;
      const num = key.dataset.num;
      if (num !== undefined) {
        if (STATE.pin.length < 4) {
          STATE.pin += num;
          updatePinDots();
          if (STATE.pin.length === 4) setTimeout(checkPin, 200);
        }
      } else if (key.id === 'backspaceKey') {
        STATE.pin = STATE.pin.slice(0, -1);
        updatePinDots();
        $('macError').textContent = '';
      }
    });
  });
}

function updatePinDots() {
  $$('#pinDots .mac-pin-dot').forEach((d, i) => {
    d.classList.toggle('filled', i < STATE.pin.length);
    d.classList.remove('error');
  });
}

function checkPin() {
  STATE.attempts++;
  if ($('macAttempts')) $('macAttempts').textContent = `已尝试 ${STATE.attempts} 次`;
  if (STATE.pin === STATE.pinCorrect) {
    STATE.unlocked = true;
    $('macError').textContent = '';
    toast('✅ 解锁成功! 欢迎回来, 雪姐');
    setTimeout(() => {
      window.location.href = 'desktop.html';
    }, 1000);
  } else {
    $('macError').textContent = '密码错误';
    $$('#pinDots .mac-pin-dot').forEach(d => d.classList.add('error'));
    setTimeout(() => {
      STATE.pin = '';
      updatePinDots();
    }, 500);
    // 第 3 次错后给更强提示
    if (STATE.attempts === 3) {
      setTimeout(() => {
        $('macError').innerHTML = '密码错误. <span style="color:#ffc864;">提示: 她大学网名是 4 个字, 拼音首字母?</span>';
      }, 600);
    }
    if (STATE.attempts === 5) {
      setTimeout(() => {
        $('macError').innerHTML = '密码错误. <span style="color:#ffc864;">她的网名拼音首字母 + 她的生日(0915)? 比如 xs0915?</span>';
      }, 600);
    }
  }
}

// ========== 桌面: 应用开关 ==========
window.openApp = function(name) {
  const win = $('win' + name.charAt(0).toUpperCase() + name.slice(1));
  if (!win) {
    toast('🚧 应用暂未开放');
    return;
  }
  win.style.display = 'block';
  STATE.appOpened[name] = true;
  // 应用特定初始化
  if (name === 'notes' && !STATE.appOpened.notesInit) {
    renderNotes('today');
    STATE.appOpened.notesInit = true;
  }
  if (name === 'wechat' && !STATE.appOpened.wechatInit) {
    renderWechatContacts();
    STATE.appOpened.wechatInit = true;
  }
  if (name === 'browser' && !STATE.appOpened.browserInit) {
    switchTab('zhihu', $$('#browserTabs .app-browser-tab')[0]);
    STATE.appOpened.browserInit = true;
  }
  if (name === 'xhs' && !STATE.appOpened.xhsInit) {
    renderXhs();
    STATE.appOpened.xhsInit = true;
  }
};

window.closeApp = function(name) {
  const win = $('win' + name.charAt(0).toUpperCase() + name.slice(1));
  if (win) win.style.display = 'none';
};

// ========== 备忘录 (学自灵异新版 macOS 备忘录) ==========
window.switchNotes = function(cat, el) {
  $$('.app-notes-sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  renderNotes(cat);
};

function renderNotes(cat) {
  const main = $('notesMain');
  if (!main) return;
  if (cat === 'locked') {
    // 显示加密笔记 (需密码)
    const note = STATE.notes.locked[0];
    main.innerHTML = `
      <div class="app-notes-entry" onclick="openLockedNote()">
        <div class="app-notes-entry-date">🔒 ${note.date}</div>
        <div class="app-notes-entry-title">${note.title} <span class="app-notes-entry-tag">加密</span></div>
        <div style="color:#888;font-size:13px;margin-top:8px;">点击输入密码解锁</div>
      </div>
    `;
    return;
  }
  if (cat === 'today') {
    const note = STATE.notes.today;
    main.innerHTML = `
      <div class="app-notes-entry expanded">
        <div class="app-notes-entry-date">${note.date} ${note.tag ? `<span class="app-notes-entry-tag">${note.tag}</span>` : ''}</div>
        <div class="app-notes-entry-title">${note.title}</div>
        <div class="app-notes-entry-content">${note.content}</div>
      </div>
    `;
    return;
  }
  const list = STATE.notes[cat] || [];
  main.innerHTML = list.map(n => `
    <div class="app-notes-entry" onclick="this.classList.toggle('expanded')">
      <div class="app-notes-entry-date">${n.date}</div>
      <div class="app-notes-entry-title">${n.title}</div>
      <div class="app-notes-entry-content">${n.content || ''}</div>
    </div>
  `).join('');
}

window.openLockedNote = function() {
  STATE.currentPwTarget = 'note';
  $('pwTitle').textContent = '🔒 加密笔记';
  $('pwDesc').innerHTML = '这是姐姐写的关于 "明天" 的笔记. 密码是什么?<br><span style="color:#ffc864;font-size:12px;">提示: 在 "今天" 的笔记里, 姐姐提到 "明天就走了". 试试日期格式: yyyymmdd</span>';
  $('pwInput').value = '';
  $('pwModal').classList.add('show');
  setTimeout(() => $('pwInput').focus(), 200);
};

// ========== 邮件 (学自青苗中学 林昭邮件) ==========
const MAILS = {
  1: {
    from: '江雪 <jiangxue_jx@163.com>',
    time: '2024 年 5 月 11 日 21:17',
    subject: '找到我',
    body: `
      <p>晚晚:</p>
      <p>如果有一天你看到这封信, 说明我已经不在这台电脑前了.</p>
      <p>我不知道自己会去哪, 也不知道能去哪. 但我知道我必须走.</p>
      <p>我去了武阳, 找了一份工作, 在一个老城区的写字楼里. 那个地方不对劲, 我去面试的时候, 主管一直盯着我看, 问了很多奇怪的问题. 他说"会安排我".</p>
      <p>今天晚上回家, 门口放了一个外卖袋子, 不是我点的. 里面有一瓶水, 和一张纸条: "明天 9 点准时到".</p>
      <p>我很害怕. 晚晚, 我不应该去那个公司的.</p>
      <p>但我已经付了三个月房租, 押一付三. 2400 块, 全是我打工攒的. 如果我跑了, 这些钱就没了, 我连回家的火车票都买不起.</p>
      <p>妹妹, 我把真相写在一个加密文件里. 密码你一定能猜到, 是我们俩的小秘密.</p>
      <p>如果有一天, 你看到这封信, 替我去报警. 武阳老城区建设路 88 号华清大厦 6 楼. 查他们.</p>
      <p>姐姐爱你.</p>
      <p>2024 年 5 月 11 日 21:17</p>
    `,
  },
  2: {
    from: '武阳人事 <hr@wuyang-rc.com>',
    time: '2024 年 5 月 10 日 14:22',
    subject: '面试通知: 5 月 13 日',
    body: `
      <p>江雪小姐:</p>
      <p>您的简历已通过初筛, 邀请您于 2024 年 5 月 13 日 (周一) 上午 9:00 来我公司面试.</p>
      <p>地址: 武阳市老城区建设路 88 号, 华清大厦 6 楼.</p>
      <p>请携带身份证原件及近期 1 寸照片 2 张.</p>
      <p>联系人: 沈经理</p>
    `,
  },
  3: {
    from: '妈妈 <mama_jiang@qq.com>',
    time: '2024 年 5 月 9 日 19:45',
    subject: '这周回家吃饭吗',
    body: `
      <p>雪儿:</p>
      <p>这周回家吃饭吗? 你爸炖了你爱吃的排骨.</p>
      <p>你最近怎么老不接电话? 妈有点担心.</p>
      <p>回个消息.</p>
      <p>妈</p>
    `,
  },
};

window.openMail = function(id) {
  if (id === 'truth') {
    // 真相.txt (在文件夹里)
    STATE.currentPwTarget = 'truth';
    $('pwTitle').textContent = '🔒 真相.txt';
    $('pwDesc').innerHTML = '这是姐姐的最后线索. 密码是什么?<br><span style="color:#ffc864;font-size:12px;">提示: 试试 姐姐名字拼音 + 姐姐生日 (0915)</span>';
    $('pwInput').value = '';
    $('pwModal').classList.add('show');
    setTimeout(() => $('pwInput').focus(), 200);
    return;
  }
  if (id === 'weibo') {
    openApp('browser');
    switchTab('weibo', $$('#browserTabs .app-browser-tab')[1]);
    return;
  }
  if (id === 'xhs') {
    openApp('xhs');
    return;
  }
  const m = MAILS[id];
  if (!m) return;
  STATE.mailOpened[id] = true;
  $('mailContent').innerHTML = `
    <div style="border-bottom:1px solid #e0e0e0;padding-bottom:12px;margin-bottom:16px;">
      <h2 style="font-size:18px;color:#1a1a1a;margin-bottom:8px;">${m.subject}</h2>
      <div style="font-size:13px;color:#666;">发件人: ${m.from}</div>
      <div style="font-size:12px;color:#999;margin-top:4px;">${m.time}</div>
    </div>
    <div style="color:#333;font-size:14px;line-height:1.8;">${m.body}</div>
  `;
  // 如果是主邮件, 给玩家提示
  if (id === 1) {
    setTimeout(() => toast('📧 重要邮件! 姐姐的最后线索!'), 500);
  }
};

// ========== 微信聊天 (学自青苗中学聊天互动) ==========
function renderWechatContacts() {
  const c = $('wechatContacts');
  if (!c) return;
  c.innerHTML = STATE.wechatContacts.map(ct => `
    <div class="wechat-contact" onclick="openWechat('${ct.id}')">
      <div class="wechat-avatar" style="background:${ct.color};">${ct.avatar}</div>
      <div style="flex:1;min-width:0;">
        <div class="wechat-contact-name">${ct.name}</div>
        <div class="wechat-contact-msg">${ct.msg}</div>
      </div>
    </div>
  `).join('');
}

window.openWechat = function(id) {
  const contact = STATE.wechatContacts.find(c => c.id === id);
  if (!contact) return;
  STATE.wechatCurrent = id;
  $$('.wechat-contact').forEach(c => c.classList.remove('active'));
  const contacts = $$('.wechat-contact');
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].textContent.indexOf(contact.name) >= 0) {
      contacts[i].classList.add('active');
      break;
    }
  }
  $('wechatHeader').textContent = contact.name;
  $('wechatInput').style.display = 'flex';
  const msgs = STATE.wechatHistories[id] || [];
  $('wechatMessages').innerHTML = msgs.map(m => `
    <div class="wechat-msg ${m.from === 'me' ? 'from-me' : ''}">
      <div class="wechat-msg-avatar" style="background:${m.from === 'me' ? '#9c27b0' : contact.color};">${m.from === 'me' ? '我' : contact.avatar}</div>
      <div class="wechat-msg-bubble">${m.text}</div>
    </div>
  `).join('');
  $('wechatMessages').scrollTop = $('wechatMessages').scrollHeight;
};

window.sendWechat = function() {
  if (!STATE.wechatCurrent) return;
  const input = $('wechatText');
  const text = input.value.trim();
  if (!text) return;
  // 玩家消息
  const msgHtml = `
    <div class="wechat-msg from-me">
      <div class="wechat-msg-avatar" style="background:#9c27b0;">我</div>
      <div class="wechat-msg-bubble">${text}</div>
    </div>
  `;
  $('wechatMessages').insertAdjacentHTML('beforeend', msgHtml);
  input.value = '';
  $('wechatMessages').scrollTop = $('wechatMessages').scrollHeight;
  // 智能回复 (针对 shen/陌生号码)
  setTimeout(() => {
    let reply = '';
    if (STATE.wechatCurrent === 'shen') {
      reply = '江雪小姐, 我们很担心你, 方便打个电话吗? 138****5567';
    } else if (STATE.wechatCurrent === 'wanwan') {
      reply = '姐? 你在吗? 是不是太忙了?';
    } else if (STATE.wechatCurrent === 'mama') {
      reply = '雪儿, 你再不回我我让你爸去武阳找你';
    } else if (STATE.wechatCurrent === 'fang') {
      reply = '江雪, 你去武阳那个公司了吗? 我越想越不对劲';
    }
    if (reply) {
      const contact = STATE.wechatContacts.find(c => c.id === STATE.wechatCurrent);
      $('wechatMessages').insertAdjacentHTML('beforeend', `
        <div class="wechat-msg">
          <div class="wechat-msg-avatar" style="background:${contact.color};">${contact.avatar}</div>
          <div class="wechat-msg-bubble">${reply}</div>
        </div>
      `);
      $('wechatMessages').scrollTop = $('wechatMessages').scrollHeight;
    }
  }, 1500);
};

// ========== 浏览器 (知乎 / 微博 / 搜索) ==========
window.browserGo = function() { switchTab('search', document.querySelector('[data-tab=search]')); };
window.browserBack = function() { switchTab('zhihu', document.querySelector('[data-tab=zhihu]')); };
window.browserForward = function() { switchTab('zhihu', document.querySelector('[data-tab=zhihu]')); };

window.switchTab = function(tab, el) {
  $$('#browserTabs .app-browser-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  if (tab === 'zhihu') renderZhihu();
  else if (tab === 'weibo') renderWeibo();
  else if (tab === 'search') renderSearch();
};

function renderZhihu() {
  $('browserContent').innerHTML = `
    <div class="zhihu-page">
      <div class="zhihu-header">
        <div class="zhihu-logo">知乎</div>
      </div>
      <div class="zhihu-search">
        <input type="text" class="zhihu-search-input" placeholder="搜索知乎问题、话题或人" value="武阳 老城区 招聘骗局" onkeydown="if(event.key==='Enter'){window.__zhihuSearch(this.value)}">
        <button onclick="window.__zhihuSearch(this.previousElementSibling.value)" style="margin-left:8px;padding:8px 16px;background:#0084ff;color:#fff;border:none;border-radius:18px;cursor:pointer;">搜索</button>
      </div>
      <div class="zhihu-feed" id="zhihuFeed">
        <div class="zhihu-question" onclick="window.__zhihuOpen(1)">
          <div class="zhihu-question-title">武阳老城区的招聘是真的吗? 朋友被坑了</div>
          <div class="zhihu-question-meta">匿名用户 · 47 个回答 · 12,438 浏览</div>
        </div>
        <div class="zhihu-question" onclick="window.__zhihuOpen(2)">
          <div class="zhihu-question-title">如何识别传销组织? 这 5 个特征一定要警惕</div>
          <div class="zhihu-question-meta">法律观察 · 23 个回答 · 89,221 浏览</div>
        </div>
        <div class="zhihu-question" onclick="window.__zhihuOpen(3)">
          <div class="zhihu-question-title">女生独自去外地工作, 父母应该担心什么?</div>
          <div class="zhihu-question-meta">家庭关系 · 156 个回答 · 234,109 浏览</div>
        </div>
        <div class="zhihu-question" onclick="window.__zhihuOpen(4)">
          <div class="zhihu-question-title">武阳警方近期破获一起强迫劳动案, 涉案人员 14 人</div>
          <div class="zhihu-question-meta">武阳日报 · 89 个回答 · 156,782 浏览</div>
        </div>
      </div>
    </div>
  `;
  window.__zhihuSearch = function(q) {
    if (q.includes('武阳') || q.includes('招聘') || q.includes('老城区')) {
      $('zhihuFeed').innerHTML = `
        <div class="zhihu-answer" style="background:#fff8e0;padding:12px 16px;border-left:3px solid #ff6b9d;margin-bottom:12px;">
          <strong>💡 重要发现:</strong> 关于 "武阳 老城区 招聘" 有 4 个相关回答. 点开看
        </div>
        <div class="zhihu-question" onclick="window.__zhihuOpen(4)">
          <div class="zhihu-question-title">⭐ 武阳警方近期破获一起强迫劳动案, 涉案人员 14 人</div>
          <div class="zhihu-question-meta">武阳日报 · 2024 年 7 月 18 日 · 156,782 浏览</div>
        </div>
        <div class="zhihu-question" onclick="window.__zhihuOpen(1)">
          <div class="zhihu-question-title">武阳老城区的招聘是真的吗? 朋友被坑了</div>
          <div class="zhihu-question-meta">匿名用户 · 47 个回答 · 12,438 浏览</div>
        </div>
        <div class="zhihu-question" onclick="window.__zhihuOpen(2)">
          <div class="zhihu-question-title">如何识别传销组织? 这 5 个特征一定要警惕</div>
          <div class="zhihu-question-meta">23 个回答 · 89,221 浏览</div>
        </div>
      `;
    } else {
      toast('🔍 试试搜索: 武阳, 老城区, 招聘');
    }
  };
  window.__zhihuOpen = function(id) {
    const answers = {
      1: {
        title: '武阳老城区的招聘是真的吗? 朋友被坑了',
        author: '在武阳生活了 8 年',
        content: `楼主朋友去的应该是华清大厦那一片, 那边老写字楼多, 经常有皮包公司.<br><br>我朋友去年也被骗了, 套路一模一样: 招聘网站上挂 "销售助理 / 文员", 面试要求交 300 块"工服押金", 上班第一天就让你拉人头.<br><br>如果你朋友已经失联 24 小时, 请立刻报警. <strong>华清大厦 6 楼, 这是武阳警方去年点名的"问题写字楼"</strong>.`,
        meta: '87 人赞同 · 2024 年 3 月',
      },
      2: {
        title: '如何识别传销组织? 这 5 个特征一定要警惕',
        author: '法律观察',
        content: `1. <strong>门槛低 / 工资高</strong>: 销售岗位月薪 8000+ 但不要求经验<br>
2. <strong>面试地点偏僻</strong>: 老写字楼, 没有正规前台<br>
3. <strong>面试官问私人问题</strong>: 家是哪里的, 父母做什么的, 有没有男朋友<br>
4. <strong>要求交押金 / 培训费</strong>: 任何名义的收费<br>
5. <strong>工作时间模糊</strong>: 早 8 晚 10, 周末无休<br><br>
满足 3 条以上就要警惕. <strong>5 条都满足请立刻离开并报警</strong>.`,
        meta: '234 人赞同 · 2024 年 4 月',
      },
      3: {
        title: '女生独自去外地工作, 父母应该担心什么?',
        author: '家庭关系研究员',
        content: `作为父母, 最担心的不是工作累不累, 而是: 1) 她住的地方安不安全 2) 她身边有没有可信任的人 3) 她心情好不好 4) 她的经济状况.<br><br>
最重要的: <strong>如果她突然不接电话, 不要等, 立刻买票去她所在的城市</strong>.<br><br>
很多悲剧就是因为"等几天看看"造成的.`,
        meta: '1,209 人赞同 · 2024 年 4 月',
      },
      4: {
        title: '🔴 武阳警方近期破获一起强迫劳动案, 涉案人员 14 人',
        author: '武阳日报',
        content: `<strong>2024 年 7 月 18 日, 武阳市公安局召开新闻发布会</strong>, 通报近期破获的一起强迫劳动案.<br><br>
该团伙以 "销售公司" 名义在老城区华清大厦 6 楼运营, 通过 <strong>"招聘 + 收取押金 + 限制人身自由"</strong> 方式, 在 2023 年 5 月至 2024 年 5 月间, 强迫 11 名女性从事销售工作.<br><br>
警方已逮捕 14 名犯罪嫌疑人, 受害人最小 19 岁, 最大 24 岁.<br><br>
<strong>案发地: 武阳市老城区建设路 88 号华清大厦 6 楼</strong><br><br>
<strong>举报电话: 武阳市公安局 0571-8888-XXXX</strong>`,
        meta: '5,621 人赞同 · 2024 年 7 月 18 日',
      },
    };
    const a = answers[id];
    $('zhihuFeed').innerHTML = `
      <div class="zhihu-question" style="background:#f0f8ff;cursor:default;">
        <div class="zhihu-question-title">${a.title}</div>
        <div class="zhihu-question-meta">${a.author} · ${a.meta}</div>
      </div>
      <div class="zhihu-answer">
        <div class="zhihu-answer-author">${a.author} 的回答</div>
        <div class="zhihu-answer-content">${a.content}</div>
      </div>
      <div style="text-align:center;margin:20px 0;">
        <button onclick="window.switchTab('zhihu', document.querySelector('[data-tab=zhihu]'))" style="padding:8px 20px;background:#fff;border:1px solid #0084ff;color:#0084ff;border-radius:4px;cursor:pointer;">← 返回问题列表</button>
      </div>
    `;
  };
}

function renderWeibo() {
  $('browserContent').innerHTML = `
    <div style="background:#fff;min-height:100%;">
      <div style="background:#ff9933;color:#fff;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:bold;">微博</div>
        <input type="text" placeholder="搜索微博" style="width:240px;padding:6px 12px;border-radius:20px;border:none;font-size:13px;">
      </div>
      <div style="padding:16px 20px;">
        <div style="border-bottom:1px solid #f0f0f0;padding:14px 0;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:50%;background:#ffc107;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">武</div>
            <div style="flex:1;">
              <div style="font-size:14px;color:#333;"><strong>武阳同城</strong> · 7 月 20 日</div>
              <div style="font-size:14px;color:#1a1a1a;line-height:1.6;margin-top:8px;">
                【武阳警方破获强迫劳动案】7 月 18 日, 武阳市公安局通报破获一起强迫劳动案. 该团伙以 "销售公司" 名义在老城区华清大厦 6 楼运营, 通过 "招聘 + 收取押金 + 限制人身自由" 方式, 强迫 11 名女性从事销售工作. 警方已逮捕 14 名犯罪嫌疑人.
                <br><br>
                <strong>#武阳警方 #强迫劳动 #华清大厦</strong>
              </div>
              <div style="margin-top:8px;height:200px;background:linear-gradient(135deg,#333,#666);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">[ 新闻图片: 武阳警方新闻发布会 ]</div>
              <div style="margin-top:8px;color:#999;font-size:12px;">🔁 8,234  ·  ❤️ 23,109  ·  💬 1,872</div>
            </div>
          </div>
        </div>
        <div style="border-bottom:1px solid #f0f0f0;padding:14px 0;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:50%;background:#607d8b;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">寻</div>
            <div style="flex:1;">
              <div style="font-size:14px;color:#333;"><strong>寻人启事·武阳</strong> · 7 月 22 日</div>
              <div style="font-size:14px;color:#1a1a1a;line-height:1.6;margin-top:8px;">
                #寻人#江雪, 女, 22 岁, 2024 年 5 月 11 日在武阳老城区失联. 最后现身地点: 武阳建设路 88 号华清大厦附近. 身高 165cm, 失踪时穿白色短袖, 牛仔裤, 帆布鞋. <strong>如有线索请联系江晚: 138-XXXX-5567</strong>
                <br><br>
                <span style="color:#ff9933;">@武阳同城 @武阳警方 @寻人启事</span>
              </div>
              <div style="margin-top:8px;color:#999;font-size:12px;">🔁 4,521  ·  ❤️ 12,008  ·  💬 891</div>
            </div>
          </div>
        </div>
        <div style="border-bottom:1px solid #f0f0f0;padding:14px 0;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:50%;background:#e91e63;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">方</div>
            <div style="flex:1;">
              <div style="font-size:14px;color:#333;"><strong>武阳老方</strong> · 5 月 11 日 23:14</div>
              <div style="font-size:14px;color:#1a1a1a;line-height:1.6;margin-top:8px;">
                有个大学同学刚去武阳老城区华清大厦面试, 完事后跟我说面试官一直盯着她看, 还问特别私人的问题. 让她赶紧跑, 千万别去. 武阳那地方水深, 大家小心.
              </div>
              <div style="margin-top:8px;color:#999;font-size:12px;">🔁 1,203  ·  ❤️ 3,892  ·  💬 234</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSearch() {
  $('browserContent').innerHTML = `
    <div style="background:#fff;min-height:100%;padding:30px;">
      <div style="max-width:600px;margin:0 auto;text-align:center;">
        <div style="font-size:80px;margin-bottom:20px;">🔍</div>
        <input type="text" placeholder="搜索整个互联网..." style="width:100%;padding:14px 18px;border:1px solid #ddd;border-radius:24px;font-size:16px;" id="searchInput" onkeydown="if(event.key==='Enter')window.__search(this.value)">
        <div style="margin-top:20px;color:#999;font-size:13px;">试试: 武阳华清大厦 / 江雪 失联 / 强迫劳动</div>
        <div id="searchResults" style="margin-top:30px;text-align:left;"></div>
      </div>
    </div>
  `;
  window.__search = function(q) {
    if (q.includes('华清') || q.includes('武阳') || q.includes('江雪')) {
      $('searchResults').innerHTML = `
        <div style="background:#fff8e0;border-left:3px solid #ff6b9d;padding:12px 16px;margin-bottom:12px;">
          <div style="color:#333;font-weight:600;margin-bottom:6px;">🔴 武阳华清大厦强迫劳动案 (7月18日)</div>
          <div style="font-size:13px;color:#666;line-height:1.6;">
            武阳市公安局 7 月 18 日召开新闻发布会, 通报近期破获的一起强迫劳动案. 该团伙以 "销售公司" 名义在老城区华清大厦 6 楼运营...
          </div>
        </div>
        <div style="background:#f0f0f0;padding:12px 16px;margin-bottom:12px;">
          <div style="color:#333;font-weight:600;margin-bottom:6px;">寻人启事: 江雪</div>
          <div style="font-size:13px;color:#666;">2024 年 5 月 11 日在武阳老城区失联. 身高 165cm, 最后现身地点: 华清大厦...</div>
        </div>
        <div style="background:#e3f2fd;border-left:3px solid #1976d2;padding:12px 16px;">
          <div style="color:#333;font-weight:600;margin-bottom:6px;">💡 关键信息汇总</div>
          <div style="font-size:13px;color:#666;line-height:1.8;">
            <strong>失联地点:</strong> 武阳建设路 88 号华清大厦 6 楼<br>
            <strong>失联时间:</strong> 2024 年 5 月 11 日 21:17 后<br>
            <strong>警方案件:</strong> 2024 年 7 月 18 日破获强迫劳动案, 14 人被捕<br>
            <strong>受害人:</strong> 11 名女性, 19-24 岁
          </div>
        </div>
      `;
    } else {
      $('searchResults').innerHTML = '<p style="color:#999;text-align:center;padding:20px;">没有相关结果. 试试: 武阳华清大厦, 江雪 失联</p>';
    }
  };
}

// ========== 小红书 (学自真实现实社交媒体) ==========
function renderXhs(filter) {
  filter = filter || 'all';
  const allNotes = [
    { user: '小方在武阳', avatar: '方', color: '#ff9800', time: '5月11日 23:14', text: '刚看到一个大学同学在朋友圈说, 她今天去了武阳老城区一个公司面试. 那个公司好像在建设路 88 号, 华清大厦, 6 楼. 面试官问了她很多私人问题, 什么家是哪里的, 有没有男朋友. 我让她千万别去. 武阳那地方, 老城区的写字楼, 水深得很.', likes: 892, comments: 67 },
    { user: '匿名', avatar: '?', color: '#999', time: '5月15日', text: '我也是被华清大厦那家公司骗过去的. 当时说月薪 6000, 实际就 1500, 还扣押金. 跑了 5 个同事. 后来听说那公司 7 月被端了, 14 个被抓.', likes: 1203, comments: 234 },
    { user: '林若', avatar: '林', color: '#9c27b0', time: '6月3日', text: '我表姐去年也是在武阳失联的, 后来才知道是被拉进传销了, 救出来时人都瘦了 20 斤. 提醒所有找工作的姐妹, 凡是面试要交钱的公司, 100% 是骗子.', likes: 456, comments: 89 },
    { user: '寻人启事', avatar: '寻', color: '#e91e63', time: '7月22日', text: '【寻人】江雪, 22 岁, 2024 年 5 月 11 日在武阳老城区失联. 最后现身地点: 武阳建设路 88 号华清大厦附近. 身高 165cm. 如有线索请联系江晚 138-XXXX-5567. 转发可救人一命!', likes: 12008, comments: 891 },
    { user: '武阳姑娘', avatar: '武', color: '#e91e63', time: '7月19日', text: '今天武阳警方破获的强迫劳动案, 案发地就是华清大厦 6 楼! 11 个受害女生被救出来. <strong>请所有在武阳找工作的姐妹, 看到这条立刻告诉你的同学/闺蜜, 千万别去那栋楼!</strong>', likes: 4521, comments: 678 },
  ];
  let notes = allNotes;
  if (filter && filter !== 'all') {
    notes = allNotes.filter(n => n.text.toLowerCase().includes(filter.toLowerCase()) || n.user.toLowerCase().includes(filter.toLowerCase()));
  }
  $('xhsContent').innerHTML = notes.map(n => `
    <div class="xhs-card">
      <div class="xhs-avatar" style="background:${n.color};">${n.avatar}</div>
      <div class="xhs-content">
        <div class="xhs-name">${n.user}</div>
        <div class="xhs-time">${n.time}</div>
        <div class="xhs-text">${n.text}</div>
        <div class="xhs-image">📍 武阳 · 强迫劳动 · 寻人</div>
        <div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#999;">
          <span>❤️ ${n.likes.toLocaleString()}</span>
          <span>💬 ${n.comments}</span>
          <span>⭐ 收藏</span>
        </div>
      </div>
    </div>
  `).join('');
  if (notes.length === 0) {
    $('xhsContent').innerHTML = '<p style="text-align:center;color:#999;padding:30px;">没有相关内容. 试试: 华清大厦, 江雪, 失联</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const xhsInput = $('xhsSearch');
  if (xhsInput) {
    xhsInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') renderXhs(xhsInput.value);
    });
  }
});

// ========== 文件夹: 小雪 ==========
window.openFile = function(name) {
  if (name === 'truth') {
    STATE.currentPwTarget = 'truth';
    $('pwTitle').textContent = '🔒 真相.txt';
    $('pwDesc').innerHTML = '这是姐姐的最后线索, 关于她失联那晚到底发生了什么.<br><span style="color:#ffc864;font-size:12px;">提示: 试试 姐姐名字拼音 (jiangxue) + 姐姐生日 (0915)</span>';
    $('pwInput').value = '';
    $('pwModal').classList.add('show');
    setTimeout(() => $('pwInput').focus(), 200);
    return;
  }
  if (name === 'readme') {
    showContent('README.txt', `
      <p style="color:#666;font-size:13px;">这是江雪的 MacBook 里 "小雪" 文件夹的说明文件.</p>
      <hr style="border:0;border-top:1px solid #ddd;margin:16px 0;">
      <p>这是我的秘密空间.</p>
      <p>妹妹, 如果你看到这里, 说明我已经不在了. (别担心, "不在" 不一定是"死了", 也可能是"离开"了, 我在真相.txt 里说明.)</p>
      <p>这个文件夹里的内容是我留给你的. 包括:</p>
      <ul>
        <li>📄 <strong>README.txt</strong> (你正在看的)</li>
        <li>🖼️ <strong>我们.jpg</strong> (我们的合照)</li>
        <li>🖼️ <strong>小雪.jpg</strong> (我的网名, 也是这张照片的名字)</li>
        <li>🎵 <strong>写给你的歌.mp3</strong> (我大学时录的, 没发过)</li>
        <li>🔒 <strong>真相.txt</strong> (加密, 关于我这三个月)</li>
      </ul>
      <p style="color:#888;font-size:12px;margin-top:20px;">2024 年 5 月 11 日 22:30 写</p>
    `);
    return;
  }
  if (name === 'photo1') {
    showContent('我们.jpg', `
      <p style="text-align:center;color:#888;font-size:13px;margin-bottom:16px;">2023 年春节, 在家</p>
      <div style="width:100%;height:300px;background:linear-gradient(135deg,#ffe4e1,#ffb3ba);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:60px;">👭</div>
      <p style="margin-top:16px;color:#666;font-size:13px;line-height:1.7;">
        照片里是你和姐姐.<br>
        姐姐 22 岁, 165cm, 扎着马尾, 笑得很开心.<br>
        你 22 岁, 短发, 也在笑.<br>
        背景是家里的客厅, 妈妈在镜头外喊 "茄子".
      </p>
    `);
    return;
  }
  if (name === 'photo2') {
    showContent('小雪.jpg', `
      <p style="text-align:center;color:#888;font-size:13px;margin-bottom:16px;">2022 年 6 月, 大学宿舍</p>
      <div style="width:100%;height:300px;background:linear-gradient(135deg,#e3f2fd,#bbdefb);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:60px;">❄️</div>
      <p style="margin-top:16px;color:#666;font-size:13px;line-height:1.7;">
        姐姐大学时拍的, 当时是冬天, 她把窗户打开, 拍了这张背景是雪的照片.<br>
        <strong>"小雪" 是她大学时用的网名</strong>, 来源于她出生那天的第一场雪 (1999 年 12 月 17 日, 武阳市下了 1999 年第一场雪, 妈妈说 "就叫小雪吧").
      </p>
    `);
    return;
  }
  if (name === 'song') {
    showContent('写给你的歌.mp3', `
      <p style="color:#666;font-size:13px;">江雪 · 2023 年 11 月 20 日 (你考上研那天) 录</p>
      <hr style="border:0;border-top:1px solid #ddd;margin:16px 0;">
      <p style="background:#f5f5f5;padding:16px;border-radius:8px;font-style:italic;line-height:1.8;color:#555;">
        "这首歌我不会发给你, 但我录了, 给你听.<br><br>
        晚晚, 姐姐一直觉得自己不够好. 我成绩没你好, 找工作没你顺利, 家里也一直拿我跟你比.<br><br>
        但今天你考上了, 我比自己考上还开心.<br><br>
        你以后要更努力, 不要像姐姐这样.<br><br>
        但不管怎样, 我都爱你."
      </p>
      <p style="color:#999;font-size:12px;margin-top:16px;text-align:center;">[ 播放: 《你曾是少年》- S.H.E · 翻唱 ]</p>
    `);
    return;
  }
};

function showContent(title, html) {
  $('modalTitle').textContent = title;
  $('modalContent').innerHTML = html;
  $('contentModal').classList.add('show');
}
window.closeContent = function() {
  $('contentModal').classList.remove('show');
};

// ========== 密码弹窗 ==========
window.closePw = function() {
  $('pwModal').classList.remove('show');
  $('pwInput').value = '';
  STATE.currentPwTarget = null;
};

window.submitPw = function() {
  const pw = $('pwInput').value.trim();
  if (!pw) return;
  if (STATE.currentPwTarget === 'note' && pw === STATE.notePw) {
    closePw();
    const note = STATE.notes.locked[0];
    showContent('🔓 关于明天... (4月28日写)', `
      <p style="background:#fff8e0;padding:12px 16px;border-left:3px solid #ff6b9d;margin-bottom:16px;color:#666;font-size:13px;">
        💡 这是姐姐 4 月 28 日写的. 那时她刚去武阳面试回来.
      </p>
      <p style="line-height:2;color:#333;">
        ${note.content}
      </p>
      <p style="margin-top:20px;color:#888;font-size:13px;">
        这就是姐姐害怕的真正原因. 那个 "公司" 不是普通公司.<br>
        继续看 真相.txt (密码: jiangxue0915) 了解她失联那晚发生了什么.
      </p>
    `);
  } else if (STATE.currentPwTarget === 'truth' && pw === STATE.truthPw) {
    closePw();
    showContent('🔓 真相.txt', `
      <p style="background:#ffe4e1;padding:12px 16px;border-left:3px solid #c00;margin-bottom:16px;color:#c00;font-size:14px;">
        💡 这是姐姐 5 月 11 日晚上 9:17 写完后, 又写的一份详细真相.
      </p>
      <div style="line-height:2;color:#333;">
        <p><strong>事情经过:</strong></p>
        <p>5 月 11 日晚上 9 点, 我 (江雪) 发完最后一条消息给妹妹后, 收到一个陌生号码的短信: "江雪小姐, 我们可以帮你. 武阳老城区, 我们见一面."</p>
        <p>我想跑. 但那个人说: "你妹妹江晚, 武阳师范, 我们知道你住哪."</p>
        <p>我怕他们伤害晚晚, 一个人去了他们说的地方.</p>
        <p>然后, 我就被他们带到了一个地方, 关了起来.</p>
        <p>他们没打我没骂我, 每天让我 "学习", 不让我走. 没收了我的手机.</p>
        <p>他们说 "考察期 3 个月, 通过了就能走".</p>
        <p>今天是 5 月 11 日. 我不知道我还能撑多久.</p>
        <p>但如果有人看到这封信, 请告诉晚晚: 姐姐不是不想回来, 是回不来.</p>
        <p style="margin-top:20px;"><strong>地点:</strong> 武阳老城区建设路 88 号华清大厦 6 楼</p>
        <p style="margin-top:20px;color:#c00;font-weight:600;">⚠️ 我不知道他们会不会发现我写了这些, 但如果妹妹看到, 请立即报警.</p>
      </div>
      <div style="margin-top:24px;padding:16px;background:#fff8e0;border-radius:8px;">
        <p style="font-size:13px;color:#666;margin-bottom:8px;">📌 你的任务</p>
        <p style="font-size:14px;color:#333;">你现在拿到了所有线索. 要救姐姐, 你需要:</p>
        <ol style="font-size:14px;color:#333;line-height:1.8;">
          <li>去 <strong>知乎/微博/小红书</strong> 查 "武阳 华清大厦" 看警方是否已破案</li>
          <li>如果警方已破, 姐姐可能已获救; 如果没有, <strong>立刻去武阳报警</strong></li>
          <li>不管怎样, 告诉 <strong>妈妈</strong> 这一切</li>
        </ol>
      </div>
    `);
    // 解锁结局
    setTimeout(() => {
      $('contentModal').classList.remove('show');
      setTimeout(() => {
        window.location.href = 'ending_A_rescued.html';
      }, 500);
    }, 30000);  // 30 秒后跳结局 (让玩家看完)
  } else {
    $('pwError')?.remove();
    const err = document.createElement('div');
    err.id = 'pwError';
    err.style.cssText = 'color:#ff3b30;font-size:13px;margin-top:8px;text-align:center;';
    err.textContent = '密码错误, 再想想';
    $('pwDesc').after(err);
    setTimeout(() => err.remove(), 2000);
  }
};

// ========== 初始化 ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if ($('macKeypad')) initLock();
  });
} else {
  if ($('macKeypad')) initLock();
}

})();
