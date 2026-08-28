// 第十一轮: 真玩找到他的情人 + 灵异新版
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
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .chat-message, .message-content, .system-message, .post-body, .comment, .reply, .text, .description, .intro, .story, .dialogue, .script, .narrative, .scene, .choice, .option, .button, label, span, div, a, td"))
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

  // ===== 1) 找到他的情人: 完整真玩 =====
  console.log("\n\n############### 找到他的情人: 完整真玩 ###############");
  await page.goto("https://zdtdqr.pages.dev/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  // 开始游戏
  await page.evaluate(() => { const b = document.querySelector(".start-btn"); if (b) b.click(); });
  await sleep(3000);
  await dump(page, "找到他的情人 开始后", 50);
  await shot(page, "qingren_02_started");

  // 找密码输入
  for (let i = 0; i < 10; i++) {
    // 截图看当前在哪
    await shot(page, "qingren_step_" + i);
    const state = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, textarea")).map(e => ({tag: e.tagName, type: e.type, id: e.id, placeholder: e.placeholder, value: e.value}));
      const buttons = Array.from(document.querySelectorAll("button")).map(b => ({t: b.textContent.trim(), id: b.id, classes: b.className?.substring(0, 30)}));
      const bodyText = document.body.innerText;
      return {inputs, buttons, bodyText: bodyText.substring(0, 800)};
    });
    console.log("\n  步 " + i + " 状态:");
    console.log("    inputs:", JSON.stringify(state.inputs));
    console.log("    buttons:", JSON.stringify(state.buttons));
    console.log("    body:", state.bodyText.substring(0, 500));

    // 试输入密码 0625
    const hasPin = state.inputs.some(i => i.type === "password" || (i.placeholder && i.placeholder.includes("密码")) || (i.placeholder && i.placeholder.includes("PIN")));
    if (hasPin) {
      console.log("  >>> 找到密码输入框");
      for (const inp of state.inputs) {
        if (inp.type === "password" || inp.placeholder?.includes("密码") || inp.placeholder?.includes("PIN")) {
          await page.evaluate((id) => { const i = document.getElementById(id); if (i) { i.value = ""; i.focus(); } }, inp.id);
          await page.type("#" + inp.id, "0625");
          await sleep(500);
          // 点确认
          await page.evaluate(() => {
            const b = document.querySelector("button.confirm, button.submit, button[type='submit'], button[id*='confirm'], button[id*='submit']") || Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("确认") || b.textContent.includes("提交") || b.textContent.includes("解锁") || b.textContent.includes("进入") || b.textContent.includes("登录"));
            if (b) b.click();
          });
          await sleep(3000);
        }
      }
    } else {
      // 看是否有其他选项
      for (const b of state.buttons) {
        if (b.t.includes("继续") || b.t.includes("开始") || b.t.includes("下一步") || b.t.includes("查") || b.t.includes("看")) {
          console.log("  >>> 点 '" + b.t + "'");
          await page.evaluate((txt) => {
            const btn = Array.from(document.querySelectorAll("button")).find(bb => bb.textContent.trim() === txt);
            if (btn) btn.click();
          }, b.t);
          await sleep(2500);
        }
      }
    }

    // 检查是否是结束页
    if (state.bodyText.includes("结束") || state.bodyText.includes("END") || state.bodyText.includes("END")) {
      console.log("  看起来结束了");
      break;
    }
  }

  await shot(page, "qingren_final");

  // 抓 HTML
  const html = await page.content();
  fs.writeFileSync(path.join(ROOT, "qingren_full.html"), html);
  console.log("  HTML 已存: " + html.length + " 字节");

  // ===== 2) 灵异新版: 开始游戏 =====
  console.log("\n\n############### 灵异新版: 开始游戏 ###############");
  await page.goto("https://mminghuo.github.io/forum/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  // 关掉初始化弹窗 + 开始
  await page.evaluate(() => {
    const b = document.querySelector("#openComputerBtn");
    if (b) b.click();
  });
  await sleep(5000);
  await dump(page, "灵异新版 开始后", 80);
  await shot(page, "lingyi_new_02_started");

  // 找密码输入 (姐姐的数字 1234567890)
  const liState = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input, textarea")).map(e => ({tag: e.tagName, type: e.type, id: e.id, placeholder: e.placeholder, value: e.value}));
    const buttons = Array.from(document.querySelectorAll("button")).map(b => ({t: b.textContent.trim(), id: b.id, classes: b.className?.substring(0, 30)}));
    return {inputs, buttons};
  });
  console.log("  灵异新版 inputs:", JSON.stringify(liState.inputs));
  console.log("  灵异新版 buttons:", JSON.stringify(liState.buttons));

  // 试输入 1234567890
  for (const inp of liState.inputs) {
    if (inp.id) {
      await page.evaluate((id) => { const i = document.getElementById(id); if (i) { i.value = ""; i.focus(); } }, inp.id);
      await page.type("#" + inp.id, "1234567890");
      await sleep(500);
      await page.evaluate(() => {
        const b = document.querySelector("button[type='submit'], button.confirm, button[id*='login'], button[id*='confirm']") || Array.from(document.querySelectorAll("button")).find(bb => bb.textContent.includes("登录") || bb.textContent.includes("确认") || bb.textContent.includes("解锁"));
        if (b) b.click();
      });
      await sleep(3000);
    }
  }

  await dump(page, "灵异新版 输入密码后", 50);
  await shot(page, "lingyi_new_03_after_pwd");

  // 抓 HTML
  const liHtml = await page.content();
  fs.writeFileSync(path.join(ROOT, "lingyi_new_after.html"), liHtml);
  console.log("  HTML 已存: " + liHtml.length + " 字节");

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
