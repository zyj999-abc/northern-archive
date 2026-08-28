// 第十三轮: 找到他的情人各 app + 灵异新版各 app
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const __filename = new URL(import.meta.url).pathname.replace(/^\/(?=[A-Z]:\/)/, "");
const ROOT = path.dirname(__filename);
const SHOTS = path.join(ROOT, "real_play");
fs.mkdirSync(SHOTS, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shot(page, name) {
  try {
    await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true, timeout: 15000 });
    console.log("  shot:", name);
  } catch (e) { console.log("  shot err: " + e.message.substring(0, 60)); }
}

async function dump(page, name, max=80) {
  try {
    console.log("\n========== " + name + " ==========");
    console.log("  url:", page.url());
    const texts = await page.evaluate((mx) => {
      return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .chat-message, .message-content, .system-message, .post-body, .comment, .reply, .text, .description, .intro, .story, .dialogue, .script, .narrative, .scene, .choice, .option, .button, label, span, div, a, td, .chat-content, .forum-post, .user-info, .name, .time, .text-content, .diary-item, .todo-item, .recycle-item, .note-title, .note-content, .message-bubble, .wechat, .sms, .sms-item, .call-log, .phone-number, .contact-name"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 3 && t.length < 5000)
      .slice(0, mx);
    }, max);
    texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 350)));
    const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href})).filter(a => a.t).slice(0, 50));
    if (links.length) {
      console.log("  链接:");
      links.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.t.substring(0, 50) + "' -> " + l.h.substring(0, 80)));
    }
  } catch (e) { console.log("  dump err: " + e.message.substring(0, 80)); }
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 1) 找到他的情人: 解锁后逐个 app =====
  console.log("\n\n############### 找到他的情人: 各 app ###############");
  await page.goto("https://zdtdqr.pages.dev/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.evaluate(() => { const b = document.querySelector(".start-btn"); if (b) b.click(); });
  await sleep(3000);
  // 输入 0625
  for (const d of "0625") {
    await page.evaluate((digit) => {
      const allButtons = Array.from(document.querySelectorAll("button, .key, .pin-key"));
      const btn = allButtons.find(b => b.textContent.trim() === digit);
      if (btn) btn.click();
    }, d);
    await sleep(500);
  }
  await sleep(3000);
  await shot(page, "qingren_05_desktop_apps");

  // 找 app 名称 → 链接
  const apps = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".app-icon, [data-app], [onclick], a[href*='app'], .desktop-app, .phone-app")).map(e => ({tag: e.tagName, t: e.textContent?.trim()?.substring(0, 30), alt: e.alt, href: e.href, onclick: e.getAttribute("onclick")?.substring(0, 200)})).filter(e => e.t || e.alt || e.onclick);
  });
  console.log("  所有 app:");
  apps.forEach(a => console.log("    - " + JSON.stringify(a)));

  // 用 URL 模式猜: 微信 / 短信 / 相册 / Instagram / 电话
  const appNames = ["weixin", "wechat", "duanxin", "sms", "xiangce", "album", "instagram", "dianhua", "phone", "beiwanglu", "note", "tongxunlu", "contact"];
  for (const name of appNames) {
    try {
      const r = await page.goto("https://zdtdqr.pages.dev/" + name, { waitUntil: "domcontentloaded" });
      if (r.status() === 200) {
        await sleep(2000);
        await shot(page, "qingren_app_" + name);
        await dump(page, "app " + name, 30);
      }
    } catch (e) {}
  }

  // 抓所有 链接 (含 app)
  await page.goto("https://zdtdqr.pages.dev/shouji", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const allLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]")).map(a => ({t: a.textContent.trim().slice(0, 40), h: a.href, onclick: a.getAttribute("onclick")})).filter(a => a.t || a.h);
  });
  console.log("  桌面所有链接 (含子 app):");
  allLinks.forEach(l => console.log("    - '" + l.t + "' -> " + l.h + (l.onclick ? " onclick=" + l.onclick : "")));

  // 试每个链接
  for (const l of allLinks) {
    if (l.h.includes("zdtdqr.pages.dev") && l.h !== "https://zdtdqr.pages.dev/shouji") {
      try {
        const r = await page.goto(l.h, { waitUntil: "domcontentloaded" });
        if (r.status() === 200) {
          await sleep(2000);
          await shot(page, "qingren_link_" + (l.t || l.h.split("/").slice(-1)[0]).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_"));
        }
      } catch (e) {}
    }
  }

  // 抓主页所有
  const home = await page.evaluate(() => {
    return {
      body: document.body.innerText,
      links: Array.from(document.querySelectorAll("a[href]")).map(a => a.href),
      onclicks: Array.from(document.querySelectorAll("[onclick]")).map(e => ({text: e.textContent?.trim()?.substring(0, 50), onclick: e.getAttribute("onclick")?.substring(0, 200)})),
    };
  });
  console.log("  桌面 body (前 1500):", home.body.substring(0, 1500));

  // ===== 2) 灵异新版: 打开聊天软件/论坛/备忘录 =====
  console.log("\n\n############### 灵异新版: 各 app ###############");
  await page.goto("https://mminghuo.github.io/forum/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.evaluate(() => { const i = document.querySelector("#passwordInput"); if (i) { i.value = ""; i.focus(); } });
  await page.type("#passwordInput", "1234567890");
  await sleep(500);
  await page.evaluate(() => { const b = document.querySelector("#loginButton"); if (b) b.click(); });
  await sleep(5000);

  // 走每个 app onclick
  for (const fnName of ["openChatApplication", "openApplication('forum')", "toggleWindow('notesWindow')", "openFolder"]) {
    try {
      console.log("\n  >>> 调用: " + fnName);
      // 解析 fnName
      if (fnName === "openChatApplication") await page.evaluate(() => { if (typeof openChatApplication === "function") openChatApplication(); });
      else if (fnName.startsWith("openApplication")) {
        const app = fnName.match(/'([^']+)'/)?.[1];
        await page.evaluate((a) => { if (typeof openApplication === "function") openApplication(a); }, app);
      }
      else if (fnName.startsWith("toggleWindow")) {
        const w = fnName.match(/'([^']+)'/)?.[1];
        await page.evaluate((w) => { if (typeof toggleWindow === "function") toggleWindow(w); }, w);
      }
      else if (fnName === "openFolder") await page.evaluate(() => { if (typeof openFolder === "function") openFolder(); });
      await sleep(2500);
      await shot(page, "lingyi_fn_" + fnName.replace(/['()]/g, "").replace(/\s+/g, "_"));
      await dump(page, "灵异 fn " + fnName, 40);
    } catch (e) { console.log("    err: " + e.message.substring(0, 80)); }
  }

  // 备忘录 - 个人日记
  console.log("\n  >>> 备忘录 - 个人日记");
  await page.evaluate(() => { if (typeof switchCategory === "function") switchCategory("diary"); });
  await sleep(2000);
  await shot(page, "lingyi_notes_diary");
  await dump(page, "灵异 个人日记", 40);

  // 备忘录 - 回收站
  console.log("\n  >>> 备忘录 - 回收站");
  await page.evaluate(() => { if (typeof switchCategory === "function") switchCategory("recycle"); });
  await sleep(2000);
  await shot(page, "lingyi_notes_recycle");
  await dump(page, "灵异 回收站", 40);

  // 抓 HTML
  const liHtml = await page.content();
  fs.writeFileSync(path.join(ROOT, "lingyi_new_full.html"), liHtml);
  console.log("  灵异 HTML: " + liHtml.length + " 字节");

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
