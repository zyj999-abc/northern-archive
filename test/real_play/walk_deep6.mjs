// 第七轮: 青苗邮件真玩 + 2023 截图 + 总结
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
  console.log("  title:", await page.title());
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
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 1) 2023 截图 =====
  try {
    const r = await page.goto("https://anninganya-glitch.github.io/2023/", { waitUntil: "domcontentloaded" });
    if (r.status() === 200) {
      await sleep(2000);
      await dump(page, "2023 博客", 60);
      await shot(page, "mimi_year_2023");
    }
  } catch (e) { console.log("2023 失败: " + e.message.substring(0, 60)); }

  // ===== 2) 青苗: 完整 5 封邮件 =====
  console.log("\n\n############### 青苗: 走完 5 封邮件 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  // 关弹窗
  await page.evaluate(() => { const b = document.querySelector("#closeTerrorPopup"); if (b) b.click(); });
  await sleep(2000);
  // 7秒后恐怖GIF自动跳
  await sleep(8000);
  await dump(page, "青苗 跳完 GIF 后");
  await shot(page, "qingmiao_05_post_gif");

  // 现在应该跳到主页面 - 列出所有邮件
  const mailItems = await page.$$(".mail-item");
  console.log("  邮件项数: " + mailItems.length);
  for (let i = 0; i < mailItems.length; i++) {
    try {
      const item = mailItems[i];
      const subject = await item.evaluate(e => e.querySelector(".mail-subject, .subject, .mail-title")?.textContent.trim() || e.textContent.trim().substring(0, 50));
      console.log("\n  === 邮件 " + (i+1) + ": " + subject + " ===");
      await item.click();
      await sleep(2000);
      await shot(page, "qingmiao_mail_" + (i+1) + "_" + subject.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ""));
      await dump(page, "邮件 " + (i+1), 30);
    } catch (e) { console.log("  mail " + i + " err: " + e.message.substring(0, 60)); }
  }

  // ===== 3) 发消息给林昭 =====
  console.log("\n\n############### 发消息给林昭 ###############");
  const msgInput = await page.$("#messageInput");
  if (msgInput) {
    await msgInput.click();
    await page.keyboard.type("林昭你好，404收到你的邮件了。请告诉我你哥林又具体发生了什么？还有青苗中学到底怎么了？");
    await sleep(500);
    const sendBtn = await page.$("#sendButton");
    if (sendBtn) {
      await sendBtn.click();
      await sleep(5000);
      await shot(page, "qingmiao_06_chat_replied");
      await dump(page, "青苗聊天回复后");
    }
  }

  // ===== 4) 找青苗所有子页 =====
  console.log("\n\n############### 青苗子页枚举 ###############");
  const qmRoot = "https://qingmiaomiddleschool.github.io";
  const allQm = await page.evaluate(async (root) => {
    const candidates = [
      "Start-Game-", "Start-Game-/chapter1", "Start-Game-/chapter2", "Start-Game-/chapter3",
      "Start-Game-/index", "Start-Game-/ending", "Start-Game-/end", "Start-Game-/true-end",
      "404-ymail.com", "404-ymail.com/chat", "404-ymail.com/mailbox", "404-ymail.com/send",
      "404-ymail.com/login", "404-ymail.com/report", "404-ymail.com/evidence", "404-ymail.com/forum",
      "404-ymail.com/admin", "404-ymail.com/hospital", "404-ymail.com/linyou",
      "404-ymail.com/about", "404-ymail.com/profile", "404-ymail.com/settings",
      "404-ymail.com/cases", "404-ymail.com/case1", "404-ymail.com/case2",
      "Start-Game-", "Start-Game-", "Start-Game-",
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
  console.log("  找到 " + allQm.length + " 个真实子页:");
  allQm.forEach(p => console.log("    " + p.status + "  " + p.u));

  // ===== 5) 抓青苗 HTML 深入分析 =====
  console.log("\n\n############### 青苗: 抓主页 HTML 完整源 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const html = await page.content();
  fs.writeFileSync(path.join(ROOT, "qingmiao_index.html"), html);
  console.log("  主页已存: " + html.length + " 字节");
  // 找所有 <a> 真实链接
  const qmLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]"))
      .map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href}))
      .filter(a => a.t.length > 1);
  });
  console.log("  主页链接:");
  qmLinks.forEach(l => console.log("    - '" + l.t + "' -> " + l.h));

  // 找邮箱文件
  const emailFiles = await page.evaluate(async () => {
    const r = await fetch("/404-ymail.com/emails.json");
    return {status: r.status, text: (await r.text()).substring(0, 1000)};
  });
  console.log("  emails.json: " + emailFiles.status);
  console.log("  头: " + emailFiles.text);

  // ===== 6) 抓 mailList 或数据源 =====
  for (const f of ["emails.json", "data.json", "mail.json", "messages.json", "config.json", "script.js", "app.js", "main.js"]) {
    try {
      const r = await page.evaluate(async (f) => {
        const res = await fetch("/404-ymail.com/" + f);
        return {status: res.status, type: res.headers.get("content-type"), size: (await res.text()).length};
      }, f);
      if (r.status === 200) console.log("  ✓ " + f + ": " + r.size + " 字节, " + r.type);
    } catch (e) {}
  }

  await browser.close();

  console.log("\n=== 截图列表 ===");
  const files = fs.readdirSync(SHOTS).filter(f => f.endsWith(".png"));
  files.sort();
  files.forEach(f => {
    const s = fs.statSync(path.join(SHOTS,f)).size;
    console.log("  " + f + "  " + (s/1024).toFixed(0) + "KB  " + new Date(fs.statSync(path.join(SHOTS,f)).mtime).toISOString().slice(11, 19));
  });
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
