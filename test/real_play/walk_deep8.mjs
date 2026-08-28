// 第九轮: 用关键词触发林昭
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
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .chat-message, .message-content, .system-message"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 3 && t.length < 5000)
      .slice(0, mx);
  }, max);
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 400)));
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 1) 青苗: 用关键词触发林昭 =====
  console.log("\n############### 青苗: 触发林昭 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await page.evaluate(() => { const b = document.querySelector("#closeTerrorPopup"); if (b) b.click(); });
  await sleep(8000);

  // 用 keyword 触发
  const keywords = [
    "你还好吗？收到请回复",
    "林昭",
    "英材",
    "youlive",
    "yu hao ma",
    "你还好吗？收到请回复 ",  // 带尾空格
    "你还好吗？",  // 短版
    "收到请回复",
    "林又",
    "lvyh",
  ];
  for (const kw of keywords) {
    console.log("\n  关键词: '" + kw + "'");
    await page.evaluate((i) => { const inp = document.querySelector("#messageInput"); if (inp) { inp.value = ""; inp.focus(); } }, 0);
    await page.type("#messageInput", kw);
    await sleep(300);
    await page.evaluate(() => { const b = document.querySelector("#sendButton"); if (b) b.click(); });
    await sleep(4000);
    const t = await page.evaluate(() => document.body.innerText);
    const lines = t.split("\n").filter(l => l.trim().length > 0);
    console.log("  当前页面文本 (后 15 行):");
    lines.slice(-15).forEach(l => console.log("    | " + l.substring(0, 200)));
    await shot(page, "qingmiao_keyword_" + (kw.substring(0, 8).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_")));
  }

  // ===== 2) 看 "与林昭的对话" 完整版 =====
  console.log("\n\n############### 看与林昭对话完整 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await page.evaluate(() => { const b = document.querySelector("#closeTerrorPopup"); if (b) b.click(); });
  await sleep(8000);
  const fullChat = await page.evaluate(() => {
    // 找所有可能的 chat 容器
    const containers = document.querySelectorAll(".chat-messages, .messages, .message-list, .chat, #chat, .conversation");
    return Array.from(containers).map(c => c.textContent.trim()).filter(t => t.length > 10);
  });
  console.log("  Chat 容器内容:");
  fullChat.forEach((c, i) => console.log("    [" + i + "] " + c.substring(0, 1500)));

  // ===== 3) 抓 Start-Game- 落地页 =====
  console.log("\n\n############### Start-Game- 落地页 ###############");
  try {
    await page.goto("https://qingmiaomiddleschool.github.io/Start-Game-/", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await dump(page, "Start-Game- 落地页", 30);
    await shot(page, "qingmiao_startgame");
    // 找所有子页
    const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.t.length > 1));
    console.log("  Start-Game- 链接:");
    links.forEach(l => console.log("    - '" + l.t.substring(0, 40) + "' -> " + l.h));
  } catch (e) { console.log("  Start-Game- 失败: " + e.message.substring(0, 80)); }

  // 探索 index.html
  try {
    await page.goto("https://qingmiaomiddleschool.github.io/", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await dump(page, "qingmiao 根", 30);
    await shot(page, "qingmiao_root");
  } catch (e) {}

  // ===== 4) 看 chenyutong 求助帖的 4 页回复 =====
  console.log("\n\n############### 陈雨彤 求助帖 4 页回复 ###############");
  await page.goto("https://www.bingzhuyetan.com/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.evaluate(() => { document.querySelector("#username").value = "啾啾"; document.querySelector("#password").value = "920916"; });
  await page.click("button.login-btn");
  await sleep(2000);
  await page.goto("https://www.bingzhuyetan.com/post-%E6%B1%82%E5%8A%A9.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  // 找所有分页
  const pages = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.t === "2" || a.t === "3" || a.t === "4" || a.t === "5" || a.t === "6" || a.t === "7" || a.t === "8" || a.t === "9" || a.t === "下一页"));
  console.log("  分页链接:", JSON.stringify(pages));
  for (const p of pages.slice(0, 5)) {
    try {
      await page.goto(p.h);
      await sleep(2000);
      await dump(page, "陈雨彤帖 " + p.t + " 页", 30);
      await shot(page, "chenyutong_page_" + p.t);
    } catch (e) { console.log("  page " + p.t + " 失败: " + e.message.substring(0, 60)); }
  }

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
