// 第八轮: 用 JS click 触发邮件 + 完整走完
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const __filename = new URL(import.meta.url).pathname.replace(/^\/(?=[A-Z]:\/)/, "");
const ROOT = path.dirname(__filename);
const SHOTS = path.join(ROOT, "real_play");
fs.mkdirSync(SHOTS, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true });
  console.log("  shot:", name);
}

async function dump(page, name, max=80) {
  console.log("\n========== " + name + " ==========");
  console.log("  url:", page.url());
  const texts = await page.evaluate((mx) => {
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .mail-subject, .mail-from, .mail-body, .post, .post-body, .mail-item-body, .email-content, .email-body, .mail-header"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 5 && t.length < 4000)
      .slice(0, mx);
  }, max);
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 400)));
  const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href})).filter(a => a.t).slice(0, 50));
  console.log("  链接:");
  links.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.t.substring(0, 50) + "' -> " + l.h.substring(0, 80)));
  const buttons = await page.$$eval("button", els => els.map(b => ({t: b.textContent.trim(), id: b.id, classes: b.className?.substring(0, 40)})).filter(b => b.t || b.id));
  console.log("  buttons:", JSON.stringify(buttons));
  const inputs = await page.$$eval("input, textarea", els => els.map(e => ({tag: e.tagName, type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, value: e.value?.substring(0, 30)})));
  console.log("  inputs:", JSON.stringify(inputs));
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 青苗: 走完 5 封邮件 =====
  console.log("\n############### 青苗: 走 5 封邮件 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  // 关弹窗
  await page.evaluate(() => { const b = document.querySelector("#closeTerrorPopup"); if (b) b.click(); });
  await sleep(8000); // 等恐怖 GIF 跳完

  // 用 JS click 每个 mail-item
  const mailCount = await page.$$eval(".mail-item", els => els.length);
  console.log("  邮件数: " + mailCount);
  for (let i = 0; i < mailCount; i++) {
    try {
      const before = await page.url();
      // 用 evaluate click + 滚动到可见
      const ok = await page.evaluate((idx) => {
        const items = document.querySelectorAll(".mail-item");
        if (items[idx]) { items[idx].scrollIntoView({behavior: "instant", block: "center"}); items[idx].click(); return true; }
        return false;
      }, i);
      await sleep(2500);
      const after = await page.url();
      const subject = await page.evaluate((idx) => {
        const items = document.querySelectorAll(".mail-item");
        return items[idx]?.querySelector(".mail-subject, .subject, .mail-title")?.textContent.trim() || items[idx]?.textContent.trim().substring(0, 50) || "未知";
      }, i);
      console.log("\n  === 邮件 " + (i+1) + " ('" + subject + "') url=" + after + " ===");
      await shot(page, "qingmiao_mail_" + (i+1) + "_" + subject.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ""));
      await dump(page, "邮件" + (i+1), 30);
    } catch (e) { console.log("  mail " + i + " err: " + e.message.substring(0, 80)); }
  }

  // ===== 发消息给林昭 =====
  console.log("\n\n############### 发消息给林昭 ###############");
  // 检查 messageInput 是否可见
  const inputVisible = await page.evaluate(() => {
    const i = document.querySelector("#messageInput");
    if (!i) return "not found";
    const s = window.getComputedStyle(i);
    const r = i.getBoundingClientRect();
    return {display: s.display, visibility: s.visibility, x: r.x, y: r.y, w: r.width, h: r.height};
  });
  console.log("  messageInput 状态:", JSON.stringify(inputVisible));

  // 滚动到 messageInput 然后发消息
  await page.evaluate(() => {
    const i = document.querySelector("#messageInput");
    if (i) { i.scrollIntoView({behavior: "instant", block: "center"}); i.focus(); }
  });
  await sleep(500);
  await page.keyboard.type("林昭，你好，我是404。告诉我你哥具体发生了什么。");
  await sleep(500);
  // 用 JS click sendButton
  await page.evaluate(() => { const b = document.querySelector("#sendButton"); if (b) b.click(); });
  await sleep(5000);
  await shot(page, "qingmiao_06_after_send");
  await dump(page, "青苗 发消息后");

  // 试返回聊天界面
  await page.evaluate(() => { const b = document.querySelector("#backToChatBtn"); if (b) b.click(); });
  await sleep(2000);
  await shot(page, "qingmiao_07_chat_back");
  await dump(page, "返回聊天界面后");

  // ===== 2023 截图 =====
  console.log("\n\n############### 秘密花园 2023 ###############");
  try {
    await page.goto("https://anninganya-glitch.github.io/2023/", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await dump(page, "2023 博客", 60);
    await shot(page, "mimi_year_2023");
  } catch (e) { console.log("  2023 失败: " + e.message.substring(0, 80)); }

  // ===== 青苗主页 HTML 抓 + 子页枚举 =====
  console.log("\n\n############### 青苗全子页枚举 ###############");
  const qmRoot = "https://qingmiaomiddleschool.github.io";
  const allQm = await page.evaluate(async (root) => {
    const candidates = [
      "Start-Game-", "Start-Game-/chapter1", "Start-Game-/chapter2", "Start-Game-/chapter3",
      "Start-Game-/index", "Start-Game-/ending", "Start-Game-/end", "Start-Game-/true-end",
      "Start-Game-/about", "Start-Game-/intro", "Start-Game-/prologue",
      "Start-Game-/scene1", "Start-Game-/scene2", "Start-Game-/scene3", "Start-Game-/scene4",
      "404-ymail.com", "404-ymail.com/chat", "404-ymail.com/mailbox", "404-ymail.com/send",
      "404-ymail.com/login", "404-ymail.com/report", "404-ymail.com/evidence", "404-ymail.com/forum",
      "404-ymail.com/admin", "404-ymail.com/hospital", "404-ymail.com/linyou",
      "404-ymail.com/about", "404-ymail.com/profile", "404-ymail.com/settings",
      "404-ymail.com/cases", "404-ymail.com/case1", "404-ymail.com/case2", "404-ymail.com/case3",
      "404-ymail.com/chat-1", "404-ymail.com/chat-2", "404-ymail.com/chat-3",
      "404-ymail.com/emails.json", "404-ymail.com/data.json", "404-ymail.com/messages.json",
    ];
    const results = [];
    for (const c of candidates) {
      const u = root + "/" + c;
      try {
        const r = await fetch(u, { method: "HEAD" });
        if (r.ok) results.push({u, status: r.status});
      } catch (e) {}
    }
    return results;
  }, qmRoot);
  console.log("  找到 " + allQm.length + " 个子页:");
  allQm.forEach(p => console.log("    " + p.status + "  " + p.u));

  // 看 emails.json
  for (const f of ["emails.json", "data.json", "mail.json", "messages.json", "config.json", "script.js", "app.js", "main.js", "index.html", "chat.html"]) {
    try {
      const r = await page.evaluate(async (f) => {
        const res = await fetch("/404-ymail.com/" + f);
        return {status: res.status, type: res.headers.get("content-type"), size: (await res.text()).length};
      }, f);
      if (r.status === 200) console.log("  ✓ " + f + ": " + r.size + " 字节, " + r.type);
    } catch (e) {}
  }

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
