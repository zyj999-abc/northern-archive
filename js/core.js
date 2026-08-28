// 北国档案 / Northern Archive - 核心路由 + 密码 + 进度
window.NA = {
  PAGES: {
    index:    "index.html",
    archive:  "archive.html",
    search:   "search.html",
    channel1: "c1_baoKan.html",       // 老报纸数据库
    channel2: "c2_huJi.html",         // 户籍档案
    channel3: "c3_danWei.html",       // 爷爷工作单位
    channel4: "c4_yiWu.html",         // 奶奶家遗物
    channel5: "c5_qqQun.html",        // 同班同学 QQ 群
    channel6: "c6_xiaoXun.html",      // 寻人/失踪公告
    choose:   "choose.html",
    endA:     "end_A_luntan.html",     // 写论文
    endB:     "end_B_shengCheng.html", // 销毁
    endC:     "end_C_jiaBei.html",     // 上传境外
    endD:     "end_D_chenMo.html",     // 沉默
    endE:     "end_E_naiNai.html"      // 奶奶
  },
  // 玩家预设身份（从登录页输入）
  PLAYER: { name: "", id: "" },
  // 密码（5 个）
  PASSWORDS: {
    archive: { name: "李泽宇", id: "230826200112010019" },  // 玩家身份（身份证是真实语义）
    baoKan:  "1989",       // 报纸密码
    huJi:    "1959",       // 户籍迁移年
    danWei:  "135厂",      // 爷爷单位代号
    yiWu:    "北山",        // 奶奶家所在屯
    qqQun:   "灯塔"          // 同学群名
  },
  // localStorage 3 个 key
  LS_KEYS: { progress: "na_progress", evidence: "na_evidence", identity: "na_identity" },
  go(page) { if (this.PAGES[page]) window.location.href = this.PAGES[page]; else console.warn("NA: unknown page", page); },
  goRaw(url) { window.location.href = url; },
  // 进度
  getProgress() {
    try { return JSON.parse(localStorage.getItem(this.LS_KEYS.progress) || "{}"); }
    catch { return {}; }
  },
  saveProgress(key) {
    const p = this.getProgress();
    p[key] = Date.now();
    localStorage.setItem(this.LS_KEYS.progress, JSON.stringify(p));
  },
  addEvidence(name) {
    try {
      const e = JSON.parse(localStorage.getItem(this.LS_KEYS.evidence) || "[]");
      if (!e.includes(name)) e.push(name);
      localStorage.setItem(this.LS_KEYS.evidence, JSON.stringify(e));
    } catch {}
  },
  getEvidence() {
    try { return JSON.parse(localStorage.getItem(this.LS_KEYS.evidence) || "[]"); }
    catch { return []; }
  }
};
