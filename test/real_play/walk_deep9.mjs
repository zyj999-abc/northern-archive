// 第十轮: 真玩第 6 个"找到他的情人" + 灵异新版 + 邺山彼处 + 大狗叫
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
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .chat-message, .message-content, .system-message, .post-body, .comment, .reply, .text, .description, .intro, .story, .dialogue, .script, .narrative, .scene, .choice, .option, .button, label, span, div"))
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

  // ===== 1) 找到他的情人 =====
  console.log("\n\n############### 找到他的情人 (第 6) ###############");
  try {
    const r = await page.goto("https://zdtdqr.pages.dev/", { waitUntil: "domcontentloaded" });
    await sleep(3000);
    console.log("  status:", r.status());
    await dump(page, "找到他的情人 落地", 60);
    await shot(page, "qingren_01_landing");

    // 看所有子页 + 找入口
    const sub = await page.evaluate(async (root) => {
      const cands = ["", "index.html", "index.htm", "index", "login", "start", "begin", "play", "game", "about", "story", "intro", "chapter1", "chapter2", "chapter3", "end", "ending", "true-end"];
      const results = [];
      for (const c of cands) {
        const u = root + (c ? "/" + c : "");
        try { const r = await fetch(u, { method: "HEAD" }); if (r.ok) results.push({u, status: r.status}); } catch (e) {}
      }
      return results;
    }, "https://zdtdqr.pages.dev");
    console.log("  子页:");
    sub.forEach(p => console.log("    " + p.status + "  " + p.u));

    // 抓所有真实链接
    const allLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.t.length > 1));
    console.log("  所有链接:");
    allLinks.forEach(l => console.log("    - '" + l.t.substring(0, 60) + "' -> " + l.h));

    // 点开始
    for (const a of allLinks) {
      if (a.t.includes("开始") || a.t.includes("进入") || a.t.includes("play") || a.t.includes("Play") || a.t.includes("Start") || a.t.includes("继续")) {
        try {
          await page.goto(a.h);
          await sleep(2000);
          await dump(page, "找到他的情人 走 " + a.t, 50);
          await shot(page, "qingren_02_" + a.t.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_"));
        } catch (e) {}
      }
    }
  } catch (e) { console.log("  找到他的情人 失败: " + e.message.substring(0, 100)); }

  // ===== 2) 灵异论坛 (新版) =====
  console.log("\n\n############### 灵异论坛 (新版 mminghuo) ###############");
  try {
    const r = await page.goto("https://mminghuo.github.io/forum/", { waitUntil: "domcontentloaded" });
    await sleep(3000);
    console.log("  status:", r.status());
    await dump(page, "灵异新版 落地", 60);
    await shot(page, "lingyi_new_01_landing");

    // 子页
    const sub = await page.evaluate(async (root) => {
      const cands = ["", "login.html", "register.html", "index.html", "about.html", "post.html", "list.html"];
      const results = [];
      for (const c of cands) {
        const u = root + (c ? "/" + c : "");
        try { const r = await fetch(u, { method: "HEAD" }); if (r.ok) results.push({u, status: r.status}); } catch (e) {}
      }
      return results;
    }, "https://mminghuo.github.io/forum");
    console.log("  子页:");
    sub.forEach(p => console.log("    " + p.status + "  " + p.u));

    // 抓 HTML
    const html = await page.content();
    fs.writeFileSync(path.join(ROOT, "lingyi_new_index.html"), html);
    console.log("  HTML 源: " + html.length + " 字节");
  } catch (e) { console.log("  灵异新版 失败: " + e.message.substring(0, 100)); }

  // ===== 3) 邺山彼处 (TOP 1) =====
  console.log("\n\n############### 邺山彼处 (TOP 1) ###############");
  // 找入口
  for (const url of ["https://kikoj.github.io/yeshanchu/", "https://yeshanchu.kikoj.com/", "https://kikoj.com/yeshanchu", "https://kikoj-cn.github.io/yeshanchu/", "https://yeshanchu.kikoj.cn/", "https://miyeji.cn/games/yeshan-bi-chu"]) {
    try {
      const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
      if (r.status() === 200) {
        await sleep(2000);
        const t = await page.title();
        if (!t.includes("Site not found") && !t.includes("404")) {
          console.log("  ✓ 入口: " + url + "  (" + r.status() + "): " + t);
          await dump(page, "邺山彼处 入口", 60);
          await shot(page, "yeshanchu_01_landing");
          break;
        }
      }
    } catch (e) { console.log("  ✗ " + url + ": " + e.message.substring(0, 80)); }
  }

  // ===== 4) 合成大狗叫 =====
  console.log("\n\n############### 合成大狗叫 ###############");
  try {
    const r = await page.goto("https://waoowaoo.com/games/67e24ebe311ffded9c02ad39", { waitUntil: "domcontentloaded" });
    await sleep(3000);
    console.log("  status:", r.status());
    await dump(page, "大狗叫 落地", 30);
    await shot(page, "dog_01_landing");
  } catch (e) { console.log("  大狗叫 失败: " + e.message.substring(0, 100)); }

  // ===== 5) 南湾一中: 找到我 (小红书 - 难) =====
  console.log("\n\n############### 南湾一中: 找到我 ###############");
  for (const url of ["https://www.xiaohongshu.com/discovery/item/6a241359000000002101630c?source=webshare&xhsshare=pc_web&xsec_token=AB3QyF0n-BOx7gx_S7TgY7Ly1C1XiyjR5YYaB8J4WoVZY=&xsec_source=pc_share", "https://www.xiaohongshu.com/discovery/item/6a241359000000002101630c"]) {
    try {
      const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
      await sleep(2000);
      console.log("  " + url + "  status=" + r.status());
      await shot(page, "nanwan_01");
      break;
    } catch (e) { console.log("  ✗ " + url + ": " + e.message.substring(0, 80)); }
  }

  // 搜围巾猫
  try {
    await page.goto("https://www.bing.com/search?q=%E5%8D%97%E6%B9%BE%E4%B8%80%E4%B8%AD+%E6%89%BE%E5%88%B0%E6%88%91+%E5%9B%B4%E5%B7%BE%E7%8C%AB+%E5%85%A5%E5%8F%A3", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    const links = await page.$$eval("a[href]", as => as.map(a => a.href).filter(h => h && !h.includes("bing") && !h.includes("microsoft")).slice(0, 10));
    console.log("  搜 南湾一中 入口:");
    links.forEach(l => console.log("    - " + l));
  } catch (e) {}

  await browser.close();
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
