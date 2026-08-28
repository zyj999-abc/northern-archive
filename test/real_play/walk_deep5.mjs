// 第六轮: 2011/2012/2023 + 青苗全 5 封邮件 + 收件后
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

async function dump(page, name, maxTexts=80) {
  console.log("\n========== " + name + " ==========");
  console.log("  url:", page.url());
  console.log("  title:", await page.title());
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .mail-subject, .mail-from, .mail-body, .post, .post-body"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 5 && t.length < 3000)
      .slice(0, 80);
  });
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 300)));
  const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href})).filter(a => a.t).slice(0, 60));
  console.log("  链接:");
  links.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.t.substring(0, 50) + "' -> " + l.h.substring(0, 80)));
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 1) 秘密花园 2011 2012 2023 =====
  for (const y of [2011, 2012, 2023]) {
    try {
      const r = await page.goto("https://anninganya-glitch.github.io/" + y + "/", { waitUntil: "domcontentloaded" });
      if (r.status() === 200) {
        await sleep(2000);
        await dump(page, y + " 博客", 60);
        await shot(page, "mimi_year_" + y);
      }
    } catch (e) { console.log("  " + y + " 失败: " + e.message.substring(0, 60)); }
  }

  // ===== 2) 青苗中学: 不关弹窗 - 看完整体验 =====
  console.log("\n\n############### 青苗中学: 完整 5 封邮件 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  // 不关弹窗 - 先看弹窗
  const popupVisible = await page.evaluate(() => {
    const p = document.querySelector("#closeTerrorPopup");
    return p ? "有弹窗" : "无";
  });
  console.log("  弹窗状态:", popupVisible);
  await shot(page, "qingmiao_03_inbox_with_popup");
  // 关弹窗
  await page.evaluate(() => { const b = document.querySelector("#closeTerrorPopup"); if (b) b.click(); });
  await sleep(1000);
  await dump(page, "青苗收件箱 (弹窗关后)");
  await shot(page, "qingmiao_04_inbox_clean");

  // 找邮件列表
  const allMailItems = await page.evaluate(() => {
    const all = document.querySelectorAll("li, .email, .mail, [onclick], .mail-item, .inbox-item, .message");
    return Array.from(all).map(e => ({
      tag: e.tagName,
      classes: e.className?.substring(0, 50),
      text: e.textContent.trim().substring(0, 100),
      onclick: e.getAttribute("onclick"),
    })).filter(e => e.text.length > 3 && e.text.length < 100);
  });
  console.log("  邮件列表项:");
  allMailItems.slice(0, 15).forEach((m, i) => console.log("    " + (i+1) + ". " + m.tag + "." + m.classes + ": " + m.text.substring(0, 60) + " | onclick=" + m.onclick));

  // 看完整 HTML 找 onclick
  const html = await page.content();
  fs.writeFileSync(path.join(ROOT, "qingmiao_full.html"), html);
  console.log("  完整 HTML 已存: " + html.length + " 字节");

  // ===== 3) 抓所有 inline script =====
  const inlineScripts = await page.$$eval("script:not([src])", ss => ss.map(s => s.textContent));
  console.log("  inline script 数量:", inlineScripts.length);
  inlineScripts.forEach((s, i) => {
    console.log("    [" + i + "] " + s.substring(0, 1500));
  });

  // ===== 4) 看 dialog 系统: 点 button =====
  const buttons2 = await page.$$("button");
  for (const b of buttons2) {
    const t = await b.evaluate(bb => ({t: bb.textContent.trim(), id: bb.id, classes: bb.className}));
    if (t.t) console.log("  button: '" + t.t + "' id=" + t.id + " class=" + t.classes);
  }

  // 试着找 mvc / 数据
  const dataProps = await page.evaluate(() => {
    const ds = document.querySelectorAll("[data-mail-id], [data-id], [data-msg-id]");
    return Array.from(ds).map(e => ({id: e.id, data: Object.fromEntries(Object.entries(e.dataset))}));
  });
  console.log("  data 属性:", JSON.stringify(dataProps));

  // ===== 5) 测试发消息: messageInput =====
  const msgInput = await page.$("#messageInput");
  if (msgInput) {
    await msgInput.click();
    await page.keyboard.type("我已经看到了,告诉我更多细节。林昭");
    await sleep(500);
    const sendBtn = await page.$("#sendButton");
    if (sendBtn) {
      await sendBtn.click();
      await sleep(3000);
      await shot(page, "qingmiao_05_after_msg");
      await dump(page, "青苗发消息后");
    }
  }

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
