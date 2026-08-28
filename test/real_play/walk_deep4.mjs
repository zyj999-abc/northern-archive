// 第五轮: 秘密花园 2009-2023 全走 + 陈雨彤求助帖 + 青苗邮件
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

async function dump(page, name) {
  console.log("\n========== " + name + " ==========");
  console.log("  url:", page.url());
  console.log("  title:", await page.title());
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .forum-post, .reply-content, .meta, .post, .post-title, .username, .post-meta, .post-body, .post-header"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 5 && t.length < 2500)
      .slice(0, 100);
  });
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 350)));
  const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href})).filter(a => a.t).slice(0, 60));
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

  // ===== 1) 秘密花园: 2009-2023 完整遍历 =====
  console.log("\n\n############### 秘密花园 2009-2023 完整 walk ###############");
  const years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2023];
  for (const y of years) {
    try {
      const r = await page.goto("https://anninganya-glitch.github.io/" + y + "/", { waitUntil: "domcontentloaded" });
      if (r.status() === 200) {
        await sleep(2000);
        await dump(page, y + " 博客");
        await shot(page, "mimi_year_" + y);
        // 看是否有下一年
        const nextBtn = await page.$("a[href*='/" + (y+1) + "/']");
        if (!nextBtn) {
          // 找所有 next 链接
          const next = await page.$$eval("a[href]", as => as.map(a => a.href).filter(h => h.match(/\/20\d{2}\//)));
          console.log("    跳到: " + next.join(", "));
        }
      }
    } catch (e) { console.log("  " + y + " 失败: " + e.message.substring(0, 60)); }
  }

  // ===== 2) 陈雨彤: 求助帖 =====
  console.log("\n\n############### 陈雨彤 求助帖 ###############");
  await page.goto("https://www.bingzhuyetan.com/post-%E6%B1%82%E5%8A%A9.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await dump(page, "陈雨彤 求助帖");
  await shot(page, "chenyutong_02_post_help");

  // 找帖内所有链接
  const postLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.t.length > 2));
  console.log("  帖内链接:");
  postLinks.forEach(l => console.log("    - '" + l.t.substring(0, 50) + "' -> " + l.h));

  // 找站内其他 "陈雨彤" 帖子
  console.log("\n  搜其他陈雨彤相关帖:");
  for (const q of ["陈雨彤", "雨彤", "失踪", "寻找", "老猫", "不辞而别"]) {
    try {
      await page.goto("https://www.bingzhuyetan.com/", { waitUntil: "domcontentloaded" });
      await sleep(1500);
      await page.evaluate((qq) => { const i = document.querySelector("#searchInput"); if (i) i.value = ""; }, q);
      await page.type("#searchInput", q);
      await page.click("button.search-btn");
      await sleep(2000);
      const found = await page.$$eval(".post-title, .article-title, h2, h3, .thread-title, a", els => els.map(e => e.textContent.trim()).filter(t => t.length > 5 && t.length < 100).slice(0, 8));
      console.log("    '" + q + "': " + found.join(" | "));
    } catch (e) {}
  }

  // ===== 3) 青苗中学: 全部邮件 + 收件 =====
  console.log("\n\n############### 青苗中学: 5 封邮件 + 收件 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  // 关掉恐怖弹窗
  const hasPopup = await page.$("#closeTerrorPopup");
  if (hasPopup) await page.click("#closeTerrorPopup");
  await sleep(1000);
  await dump(page, "青苗收件箱");
  await shot(page, "qingmiao_03_inbox");

  // 点每封邮件
  const mailItems = await page.$$eval(".mail-item, .email-item, .message-item, [data-mail], li", els => els.map(e => ({t: e.textContent.trim().substring(0, 100), id: e.id, classes: e.className?.substring(0, 30), data: Object.fromEntries(Object.entries(e.dataset || {}))})).filter(e => e.t.length > 3));
  console.log("  邮件项 (" + mailItems.length + "):");
  mailItems.slice(0, 15).forEach((m, i) => console.log("    " + (i+1) + ". " + m.t.substring(0, 80) + " | id=" + m.id + " | data=" + JSON.stringify(m.data)));

  // 试所有 button
  for (const sel of ["button.send-button", "button.back-to-chat-btn"]) {
    const b = await page.$(sel);
    if (b) {
      const t = await page.evaluate(bb => bb.textContent.trim(), b);
      console.log("  找到 button: " + sel + " ('" + t + "')");
    }
  }

  // 看页面所有脚本
  const allScript = await page.$$eval("script[src]", ss => ss.map(s => s.src));
  console.log("  script 资源:", allScript);

  // 试向聊天界面发消息
  const msgInput = await page.$("#messageInput");
  if (msgInput) {
    await page.type("#messageInput", "你好林昭，我已经收到你的邮件，请告诉我具体发生了什么事？");
    await sleep(500);
    const sendBtn = await page.$("#sendButton");
    if (sendBtn) {
      await sendBtn.click();
      await sleep(3000);
      await dump(page, "青苗 发消息后");
      await shot(page, "qingmiao_04_after_send");
    }
  }

  // ===== 4) 看青苗源 =====
  console.log("\n\n############### 抓青苗源 ###############");
  const ymHtml = await page.content();
  fs.writeFileSync(path.join(ROOT, "qingmiao_ymail.html"), ymHtml);
  console.log("  源已保存: " + ymHtml.length + " 字节");

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
