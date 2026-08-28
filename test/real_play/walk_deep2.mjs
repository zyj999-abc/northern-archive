// 第三轮: wayback 搜索 mygarden + 陈雨彤 JS 登录 + 谜页集 TOP 6
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
    return Array.from(document.querySelectorAll("h1, h2, h3, h4, p, li, dd, .title, .content, .post-content, .message, .mail-content, .article, .forum-post, .reply-content, .meta, .user-info"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 8 && t.length < 1500)
      .slice(0, 60);
  });
  texts.forEach((t, i) => console.log("  " + (i+1) + ". " + t.substring(0, 250)));
  const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 60), h: a.href})).filter(a => a.t).slice(0, 40));
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

  // ===== 1) wayback 搜 mygarden.net =====
  console.log("\n\n############### wayback 搜 mygarden.net ###############");
  await page.goto("https://anninganya-glitch.github.io/waybackmachinepage/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  // 输入 mygarden
  await page.type("#urlInput", "mygarden.net");
  await sleep(500);
  await shot(page, "mimi_05_wayback_input");
  // 点搜索
  await page.click("#searchBtn");
  await sleep(3000);
  await dump(page, "wayback 搜完 mygarden");
  await shot(page, "mimi_06_wayback_result");

  // 找结果中的所有跳转链接
  const archiveLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.h && a.h.includes("anninganya-glitch") && !a.h.endsWith("#")));
  console.log("  内部子页链接:");
  archiveLinks.forEach(l => console.log("    - '" + l.t + "' -> " + l.h));

  // ===== 2) 秘密花园全站爬 - 找全部页面 =====
  console.log("\n\n############### 秘密花园全站爬 ###############");
  const mimiRoot = "https://anninganya-glitch.github.io";
  const allMimiPages = await page.evaluate(async (root) => {
    // 尝试枚举常见路径
    const candidates = [
      "", "index.html", "index2.html", "new", "old", "v1", "v2",
      "page1", "page2", "page3", "page4", "page5",
      "1", "2", "3", "4", "5",
      "chapter1", "chapter2", "chapter3",
      "ch1", "ch2", "ch3", "ch4", "ch5",
      "scene1", "scene2", "scene3",
      "001", "002", "003", "004", "005",
      "ep1", "ep2", "ep3", "ep4", "ep5",
      "blog", "post", "post.html",
      "new.html", "new2.html", "new3.html",
      "search.html", "result.html",
      "blog.html", "post1.html", "post2.html",
      "waybackmachinepage", "waybackmachinepage2", "waybackmachinepage3",
      "weibo", "weibo.html", "xiaohongshu", "xiaohongshu.html",
      "douban", "douban.html", "lofter", "lofter.html",
      "garden", "garden.html", "mygarden", "mygarden.html",
      "blog-post", "blog-post-1", "blog-post-2", "blog-post-3",
      "chat", "chat.html",
      "qq", "qq.html", "wechat", "wechat.html",
      "phone", "phone.html", "sms", "sms.html",
      "video", "video.html", "audio", "audio.html",
      "epilogue", "end", "ending", "true-end",
      "map", "sitemap", "sitemap.html",
      "credits", "credits.html",
      "My-Secret-Garden", "My-Secret-Garden.html",
      "char", "character", "characters", "menu", "start", "play",
      "new/post1", "new/post2", "new/post3", "new/post-1", "new/post-2",
      "blog/index", "blog/post1", "blog/post2",
      "waybackmachinepage/result", "waybackmachinepage/post1",
      "waybackmachinepage/post", "waybackmachinepage/search",
      "My-Secret-Garden/post1", "My-Secret-Garden/post2",
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
  }, mimiRoot);
  console.log("  找到 " + allMimiPages.length + " 个真实页面:");
  allMimiPages.forEach(p => console.log("    " + p.status + "  " + p.u));

  // ===== 3) 关键: 找谜页集 TOP 6 (用其他源) =====
  console.log("\n\n############### 找 TOP 6 谜页集 (备用源) ###############");
  // miyeji.com SSL error, 用 http + 备用源
  try {
    await page.goto("http://www.miyeji.com/", { waitUntil: "domcontentloaded", timeout: 15000 });
    await sleep(3000);
    await dump(page, "miyeji http 尝试");
    await shot(page, "miyeji_http");
  } catch (e) { console.log("  miyeji http 失败: " + e.message.substring(0, 80)); }

  // 备用: 直接搜 miyeji 站点
  // 已知: 青苗/秘密花园/陈雨彤/灵异/溪埕/古木/失忆
  const knownGames = [
    {name: "灵异论坛", url: "https://fangyulanting.github.io/forum/"},
    {name: "溪埕", url: "https://xcstudio.github.io/"},
    {name: "秘密花园", url: "https://anninganya-glitch.github.io/My-Secret-Garden/"},
    {name: "青苗中学", url: "https://qingmiaomiddleschool.github.io/Start-Game-/"},
    {name: "陈雨彤", url: "https://www.bingzhuyetan.com/"},
    {name: "?", url: "?"},
  ];
  for (const g of knownGames) {
    if (g.url === "?") continue;
    try {
      const r = await page.goto(g.url, { waitUntil: "domcontentloaded", timeout: 10000 });
      await sleep(2000);
      const t = await page.title();
      console.log("  ✓ " + g.name + " (" + r.status() + "): " + t);
    } catch (e) { console.log("  ✗ " + g.name + ": " + e.message.substring(0, 80)); }
  }

  // ===== 4) 陈雨彤: 找源码 =====
  console.log("\n\n############### 陈雨彤: 抓 login.html + 抓 js ###############");
  await page.goto("https://www.bingzhuyetan.com/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const loginSrc = await page.content();
  fs.writeFileSync(path.join(ROOT, "chenyutong_login.html"), loginSrc);
  console.log("  login.html 已保存: " + loginSrc.length + " 字节");
  // 找所有 script
  const scripts = await page.$$eval("script[src]", ss => ss.map(s => s.src));
  console.log("  script 资源:", scripts);
  // 内联 script
  const inlineScripts = await page.$$eval("script:not([src])", ss => ss.map(s => s.textContent));
  console.log("  inline script 数量:", inlineScripts.length);
  inlineScripts.forEach((s, i) => console.log("    [" + i + "] " + s.substring(0, 500)));

  // 试常见账号 + 错误响应
  await page.evaluate(() => { document.querySelector("#username").value = "admin"; document.querySelector("#password").value = "admin"; });
  await page.click("button.login-btn");
  await sleep(2000);
  const errMsg = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".error, .err, .msg, .alert, [role=alert], .login-error, #error")).map(e => e.textContent.trim()).filter(t => t);
  });
  console.log("  错误提示:", JSON.stringify(errMsg));
  await shot(page, "chenyutong_after_admin");
  const htmlAfterErr = await page.content();
  fs.writeFileSync(path.join(ROOT, "chenyutong_login_after_err.html"), htmlAfterErr);

  // ===== 5) 找谜页集 (用 web archive 查 miyeji 之前的快照) =====
  console.log("\n\n############### web.archive.org 查 miyeji ###############");
  try {
    await page.goto("https://web.archive.org/web/2024*/miyeji.com", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await shot(page, "archive_miyeji");
  } catch (e) { console.log("  archive 失败: " + e.message.substring(0, 80)); }

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
