// 第四轮: 啾啾登录陈雨彤 + 2009 旧博客 + 找第 6 个热作
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
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .forum-post, .reply-content, .meta, .post, .post-title, .username, .post-meta"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 5 && t.length < 1500)
      .slice(0, 80);
  });
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 250)));
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

  // ===== 1) 陈雨彤: 登录啾啾 =====
  console.log("\n\n############### 陈雨彤: 啾啾/920916 登录 ###############");
  await page.goto("https://www.bingzhuyetan.com/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.evaluate(() => { document.querySelector("#username").value = "啾啾"; document.querySelector("#password").value = "920916"; });
  await page.click("button.login-btn");
  await sleep(3000);
  await dump(page, "陈雨彤 登录后");
  await shot(page, "chenyutong_01_logged_in");
  // localStorage
  const ls = await page.evaluate(() => {
    return Object.keys(localStorage).map(k => ({k, v: localStorage.getItem(k)}));
  });
  console.log("  localStorage:", JSON.stringify(ls));

  // 探索: 看所有文章/帖子, 找陈雨彤相关
  console.log("\n  探索所有分类页:");
  const sections = ["daoting-tushuo", "bimo-chunqiu", "guangying-liunian", "zhanwu-gonggao", "shiwenzheshan"];
  for (const s of sections) {
    try {
      const r = await page.goto("https://www.bingzhuyetan.com/" + s + ".html", { waitUntil: "domcontentloaded" });
      if (r.status() === 200) {
        await sleep(2000);
        const titles = await page.$$eval(".post-title, .article-title, h2, h3, .thread-title", els => els.map(e => e.textContent.trim()).filter(t => t.length > 5 && t.length < 100).slice(0, 25));
        console.log("    " + s + " (" + r.status() + "):");
        titles.forEach((t, i) => console.log("      " + (i+1) + ". " + t));
        await shot(page, "chenyutong_section_" + s);
        if (titles.some(t => t.includes("陈雨彤") || t.includes("雨彤") || t.includes("寻找") || t.includes("失踪") || t.includes("她"))) {
          console.log("      ★★★ 包含陈雨彤! 找具体链接");
          const link = await page.$$eval("a[href]", as => as.find(a => a.textContent.includes("陈雨彤") || a.textContent.includes("雨彤") || a.textContent.includes("寻找")));
          if (link) {
            console.log("      找到帖子: " + link.textContent + " -> " + link.href);
            await page.goto(link.href);
            await sleep(2000);
            await shot(page, "chenyutong_target_post");
            await dump(page, "陈雨彤 目标帖");
          }
        }
      }
    } catch (e) { console.log("    " + s + " 失败: " + e.message.substring(0, 60)); }
  }

  // 搜站内: 用站内 searchInput
  console.log("\n  站内搜 '陈雨彤':");
  await page.goto("https://www.bingzhuyetan.com/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await page.type("#searchInput", "陈雨彤");
  await page.click("button.search-btn");
  await sleep(2000);
  await dump(page, "陈雨彤 搜索结果");
  await shot(page, "chenyutong_search_result");

  // ===== 2) 秘密花园: 2009 旧博客 =====
  console.log("\n\n############### 秘密花园 2009 旧博客 ###############");
  await page.goto("https://anninganya-glitch.github.io/2009/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dump(page, "秘密花园 2009");
  await shot(page, "mimi_07_2009");
  // 找博客子页
  const blogLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.h && a.h.includes("anninganya-glitch") && !a.h.endsWith("#") && a.t.length > 0));
  console.log("  博客子页 (" + blogLinks.length + "):");
  blogLinks.forEach(l => console.log("    - '" + l.t + "' -> " + l.h));

  // 遍历子页
  for (const l of blogLinks.slice(0, 15)) {
    try {
      const r = await page.goto(l.h, { waitUntil: "domcontentloaded" });
      if (r.status() === 200) {
        await sleep(1500);
        const t = await page.title();
        const headings = await page.$$eval("h1, h2, h3, .post-title, .entry-title, .post-content p", els => els.map(e => e.textContent.trim().replace(/\s+/g, " ")).filter(t => t.length > 5).slice(0, 8));
        console.log("    " + l.t + " (" + r.status() + ")  title=" + t);
        headings.forEach(h => console.log("        " + h.substring(0, 150)));
        await shot(page, "mimi_08_blog_" + (l.t.substring(0, 20) || l.h.split("/").slice(-1)[0]).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_"));
      }
    } catch (e) { console.log("    " + l.t + " 失败: " + e.message.substring(0, 60)); }
  }

  // ===== 3) 找第 6 个 TOP 6 =====
  console.log("\n\n############### 找 TOP 6 第 6 个 ###############");
  // 候选: 谜页集其他热作
  const candidates = [
    {n: "北一", url: "https://baiyi1996.github.io/"},
    {n: "失忆症", url: "https://amnesia-mystery.github.io/"},
    {n: "古木", url: "https://gumu-story.github.io/"},
    {n: "梦魇", url: "https://nightmare-story.github.io/"},
    {n: "404", url: "https://404-not-found.github.io/"},
    {n: "陈雨彤 v2", url: "https://czystory.github.io/"},
    {n: "白日梦", url: "https://dreammystery.github.io/"},
    {n: "江城子", url: "https://jiangchengzi.github.io/"},
    {n: "灯下黑", url: "https://lampblack-game.github.io/"},
    {n: "寻仙", url: "https://seekimmortal.github.io/"},
    {n: "无声", url: "https://silentgame.github.io/"},
    {n: "迷宫", url: "https://labyrinth-story.github.io/"},
    {n: "驿站", url: "https://yizhans.github.io/"},
    {n: "白熊", url: "https://polar-bear-story.github.io/"},
  ];
  for (const g of candidates) {
    try {
      const r = await page.goto(g.url, { waitUntil: "domcontentloaded", timeout: 8000 });
      if (r.status() === 200) {
        const t = await page.title();
        if (!t.includes("Site not found") && !t.includes("404")) {
          console.log("  ✓ " + g.n + ": " + t);
        }
      }
    } catch (e) { console.log("  ✗ " + g.n + ": " + e.message.substring(0, 60)); }
  }

  // ===== 4) 找灵异论坛和溪埕的新地址 =====
  console.log("\n\n############### 灵异论坛/溪埕 找新地址 ###############");
  // 搜 GitHub
  const searchQueries = [
    "灵异论坛 谜页集",
    "溪埕 谜页集 校园",
    "古木 谜页集",
  ];
  for (const q of searchQueries) {
    try {
      await page.goto("https://www.bing.com/search?q=" + encodeURIComponent(q), { waitUntil: "domcontentloaded" });
      await sleep(2000);
      const links = await page.$$eval("a[href]", as => as.map(a => a.href).filter(h => h && (h.includes("github.io") || h.includes("miyeji"))).slice(0, 5));
      console.log("  搜 '" + q + "':");
      links.forEach(l => console.log("    - " + l));
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
