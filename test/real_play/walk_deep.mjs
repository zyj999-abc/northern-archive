// Deep dive 3 个新发现
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
  // 真实可见文本 (前 30 段)
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .forum-post, .reply-content, .meta"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 8 && t.length < 1500)
      .slice(0, 60);
  });
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 220)));
  // 链接
  const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href})).filter(a => a.t).slice(0, 40));
  console.log("  链接:");
  links.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.t.substring(0, 50) + "' -> " + l.h.substring(0, 80)));
  // buttons
  const buttons = await page.$$eval("button", els => els.map(b => ({t: b.textContent.trim(), id: b.id, classes: b.className?.substring(0, 40)})).filter(b => b.t || b.id));
  console.log("  buttons:", JSON.stringify(buttons));
  // inputs
  const inputs = await page.$$eval("input, textarea", els => els.map(e => ({tag: e.tagName, type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, value: e.value?.substring(0, 30)})));
  console.log("  inputs:", JSON.stringify(inputs));
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 1) 秘密花园: 跳 waybackmachine =====
  console.log("\n\n############### 秘密花园 step 3: wayback ###############");
  await page.goto("https://anninganya-glitch.github.io/waybackmachinepage/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dump(page, "秘密花园 wayback");
  await shot(page, "mimi_03_wayback");

  // ===== 2) 秘密花园: 看 new 论坛的"网页链接" =====
  console.log("\n\n############### 秘密花园 step 4: 论坛 more ###############");
  await page.goto("https://anninganya-glitch.github.io/new/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dump(page, "秘密花园 比邻论坛");
  await shot(page, "mimi_04_forum_full");
  // 看底部所有链接
  const allFootLinks = await page.$$eval("a", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.h && a.h.startsWith("http") && a.h !== "https://anninganya-glitch.github.io/new/#"));
  console.log("  外部 http 链接 (" + allFootLinks.length + "):");
  allFootLinks.forEach(l => console.log("    - '" + l.t + "' -> " + l.h));

  // ===== 3) 秘密花园: 还有 waybackmachine 之外 =====
  const mimiOtherPages = [
    "https://anninganya-glitch.github.io/waybackmachinepage/",
    "https://anninganya-glitch.github.io/My-Secret-Garden/char.html",
    "https://anninganya-glitch.github.io/My-Secret-Garden/character.html",
    "https://anninganya-glitch.github.io/My-Secret-Garden/menu.html",
    "https://anninganya-glitch.github.io/My-Secret-Garden/start.html",
    "https://anninganya-glitch.github.io/My-Secret-Garden/index.html",
  ];
  for (const u of mimiOtherPages) {
    try {
      const r = await page.goto(u, { waitUntil: "domcontentloaded", timeout: 10000 });
      console.log("\n  " + u + " => " + r.status());
      if (r.status() === 200) {
        await sleep(2000);
        const t = await page.title();
        console.log("    title: " + t);
        await shot(page, "mimi_extra_" + u.split("/").slice(-2).join("_").replace(/\.|\?/g, "_"));
      }
    } catch (e) { console.log("    err: " + e.message.substring(0, 80)); }
  }

  // ===== 4) 青苗中学: 404-ymail 邮件系统 =====
  console.log("\n\n############### 青苗中学: 404-ymail ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/404-ymail.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dump(page, "青苗中学 404-ymail");
  await shot(page, "qingmiao_02_ymail");
  // 看 localStorage 邮件数据
  const mails = await page.evaluate(() => {
    return Object.keys(localStorage).map(k => {
      const v = localStorage.getItem(k);
      return {k, v: v?.substring(0, 2000)};
    });
  });
  console.log("  localStorage 键 (" + mails.length + "):");
  mails.forEach(m => {
    console.log("    -- " + m.k + " --");
    console.log("    " + m.v);
  });

  // ===== 5) 陈雨彤: 试登录秉烛夜谈 =====
  console.log("\n\n############### 陈雨彤: 登录试一下 ###############");
  await page.goto("https://www.bingzhuyetan.com/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await dump(page, "陈雨彤 login");
  // 试游客登录
  const tryLogins = [
    {u: "guest", p: "guest"},
    {u: "demo", p: "demo"},
    {u: "test", p: "test"},
    {u: "admin", p: "admin"},
    {u: "chenyutong", p: "chenyutong"},
    {u: "陈雨彤", p: "陈雨彤"},
    {u: "demo", p: "demo123"},
    {u: "visitor", p: "visitor"},
    {u: "用户", p: "密码"},
  ];
  for (const {u, p} of tryLogins) {
    try {
      await page.evaluate(([u, p]) => {
        const a = document.querySelector("#username"); if (a) a.value = u;
        const b = document.querySelector("#password"); if (b) b.value = p;
      }, [u, p]);
      await sleep(500);
      const before = page.url();
      await page.click("button.login-btn");
      await sleep(2000);
      const after = page.url();
      if (after !== before) {
        console.log("  ✓ 成功! '" + u + "'/'" + p + "' 跳转: " + after);
        await shot(page, "chenyutong_logged_in");
        break;
      }
    } catch (e) { console.log("  '" + u + "' err: " + e.message.substring(0, 60)); }
  }
  // 试注册?
  await page.goto("https://www.bingzhuyetan.com/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const regBtn = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll(".tab, .tab-item, [data-tab], button")).map(b => ({t: b.textContent.trim(), classes: b.className?.substring(0, 30), data: b.dataset?.tab || b.dataset?.target}));
    return tabs;
  });
  console.log("  登录页 tabs:", JSON.stringify(regBtn));
  await shot(page, "chenyutong_login_full");

  // 试点击站内文章/帖子: 直接访问几个分类
  const sections = ["daoting-tushuo", "bimo-chunqiu", "guangying-liunian", "zhanwu-gonggao"];
  for (const s of sections) {
    try {
      const r = await page.goto("https://www.bingzhuyetan.com/" + s + ".html", { waitUntil: "domcontentloaded" });
      await sleep(2000);
      if (r.status() === 200) {
        await shot(page, "chenyutong_section_" + s);
        const titles = await page.$$eval(".post-title, .article-title, h2, h3", els => els.map(e => e.textContent.trim()).filter(t => t.length > 5 && t.length < 100).slice(0, 15));
        console.log("  " + s + " 文章:");
        titles.forEach((t, i) => console.log("    " + (i+1) + ". " + t));
      }
    } catch (e) {}
  }

  // ===== 6) 看谜页集 TOP 6 还有谁 =====
  console.log("\n\n############### 谜页集 TOP 6 完整列表 ###############");
  await page.goto("https://www.miyeji.com/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const allGames = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.h && (a.h.includes(".html") || a.h.endsWith("/")) && a.t.length > 1).slice(0, 40));
  console.log("  谜页集首页 40 链接:");
  allGames.forEach((g, i) => console.log("    " + (i+1) + ". '" + g.t.substring(0, 30) + "' -> " + g.h));

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
