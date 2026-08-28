// 第十二轮: iPhone PIN 输入 0625 + 灵异新版登录后
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
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .chat-message, .message-content, .system-message, .post-body, .comment, .reply, .text, .description, .intro, .story, .dialogue, .script, .narrative, .scene, .choice, .option, .button, label, span, div, a, td, .chat-content, .forum-post, .user-info, .name, .time, .text-content"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 3 && t.length < 5000)
      .slice(0, mx);
  }, max);
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 350)));
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

  // ===== 1) 找到他的情人: 输入 0625 =====
  console.log("\n\n############### 找到他的情人: 输入 0625 ###############");
  await page.goto("https://zdtdqr.pages.dev/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.evaluate(() => { const b = document.querySelector(".start-btn"); if (b) b.click(); });
  await sleep(3000);
  await shot(page, "qingren_03_phone_lock");

  // 找数字键 0 6 2 5
  const pin = "0625";
  for (let i = 0; i < pin.length; i++) {
    const d = pin[i];
    console.log("  按 '" + d + "'");
    await page.evaluate((digit) => {
      // 找所有可能的数字键
      const allButtons = Array.from(document.querySelectorAll("button, .key, .pin-key, [data-digit], .digit"));
      // 1. 看 textContent
      let btn = allButtons.find(b => b.textContent.trim() === digit);
      // 2. 看 data-digit
      if (!btn) btn = allButtons.find(b => b.dataset?.digit === digit || b.getAttribute("data-num") === digit);
      // 3. 看 id
      if (!btn) btn = document.getElementById("key" + digit) || document.getElementById("pin-" + digit);
      if (btn) btn.click();
    }, d);
    await sleep(800);
  }
  await sleep(2000);
  await shot(page, "qingren_04_unlocked");

  // 看是否解锁
  const unlocked = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    return {
      url: location.href,
      text: bodyText.substring(0, 1500),
      links: Array.from(document.querySelectorAll("a[href]")).map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.t.length > 1).slice(0, 30),
    };
  });
  console.log("  解锁后 url: " + unlocked.url);
  console.log("  解锁后 text: " + unlocked.text);
  console.log("  解锁后 links:");
  unlocked.links.forEach(l => console.log("    - '" + l.t.substring(0, 50) + "' -> " + l.h));

  // 走每个应用图标
  for (const l of unlocked.links) {
    try {
      await page.goto(l.h);
      await sleep(2000);
      await shot(page, "qingren_app_" + (l.t.substring(0, 20).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_")));
      await dump(page, "应用 " + l.t, 30);
    } catch (e) {}
  }

  // ===== 2) 灵异新版: 走登录后 =====
  console.log("\n\n############### 灵异新版: 登录后 ###############");
  await page.goto("https://mminghuo.github.io/forum/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  // 输入 1234567890
  await page.evaluate(() => { const i = document.querySelector("#passwordInput"); if (i) { i.value = ""; i.focus(); } });
  await page.type("#passwordInput", "1234567890");
  await sleep(500);
  // 点登录
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(e => console.log("  nav timeout: " + e.message.substring(0, 80))),
    page.evaluate(() => { const b = document.querySelector("#loginButton"); if (b) b.click(); })
  ]);
  await sleep(3000);
  await shot(page, "lingyi_new_03_logged_in");
  await dump(page, "灵异新版 登录后", 80);

  // 找桌面所有元素
  const desktop = await page.evaluate(() => {
    return {
      url: location.href,
      text: document.body.innerText.substring(0, 2000),
      allIcons: Array.from(document.querySelectorAll("img, .icon, [data-app], [onclick]")).map(e => ({t: e.textContent?.trim()?.substring(0, 30), alt: e.alt, src: e.src?.substring(0, 80), classes: e.className?.substring(0, 30), data: Object.fromEntries(Object.entries(e.dataset || {}))})).filter(e => e.alt || e.t || e.data.app).slice(0, 30)
    };
  });
  console.log("  桌面所有图标:");
  desktop.allIcons.forEach(i => console.log("    - " + JSON.stringify(i)));

  // 找所有 onclick
  const onclicks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[onclick]")).map(e => ({tag: e.tagName, classes: e.className?.substring(0, 30), text: e.textContent?.trim()?.substring(0, 50), onclick: e.getAttribute("onclick")?.substring(0, 200)})).slice(0, 30);
  });
  console.log("  所有 onclick:");
  onclicks.forEach(o => console.log("    - " + o.tag + "." + o.classes + " ('" + o.text + "') " + o.onclick));

  // 走完每个 app
  for (let i = 0; i < onclicks.length; i++) {
    try {
      const o = onclicks[i];
      console.log("\n  点 app " + i + ": " + o.text);
      await page.evaluate((idx) => {
        const els = document.querySelectorAll("[onclick]");
        if (els[idx]) els[idx].click();
      }, i);
      await sleep(2000);
      await shot(page, "lingyi_app_" + i + "_" + (o.text || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_"));
      await dump(page, "灵异 app " + i, 30);
      // 返回
      await page.goBack();
      await sleep(1500);
    } catch (e) { console.log("    err: " + e.message.substring(0, 60)); }
  }

  // 抓 HTML
  const liHtml = await page.content();
  fs.writeFileSync(path.join(ROOT, "lingyi_new_desktop.html"), liHtml);
  console.log("  桌面 HTML: " + liHtml.length + " 字节");

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
