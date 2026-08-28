// 真实玩 3 个剩下的游戏
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

async function dumpPage(page, name) {
  console.log("\n========== " + name + " ==========");
  console.log("  url:", page.url());
  // 标题
  const title = await page.title();
  console.log("  title:", title);
  // 所有可点击
  const links = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim().slice(0, 40), h: a.href})).filter(a => a.t || a.h).slice(0, 30));
  console.log("  链接 (前 30):");
  links.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.t + "'  -> " + l.h.substring(0, 60)));
  // 所有 button
  const buttons = await page.$$eval("button", els => els.map(b => ({t: b.textContent.trim(), id: b.id, classes: b.className?.substring(0, 30)})).filter(b => b.t || b.id));
  console.log("  buttons:", JSON.stringify(buttons));
  // inputs
  const inputs = await page.$$eval("input, textarea", els => els.map(e => ({tag: e.tagName, type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, value: e.value})));
  console.log("  inputs:", JSON.stringify(inputs));
  // 重要文字片段
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h1, h2, h3, p, .title, .intro, .notice, .warning, .hint, .description"))
      .map(e => e.textContent.trim().replace(/\s+/g, " "))
      .filter(t => t.length > 10 && t.length < 500)
      .slice(0, 15);
  });
  console.log("  关键文字 (前 15):");
  texts.forEach((t, i) => console.log("    " + (i+1) + ". " + t.substring(0, 120)));
}

async function tryAll(page, name) {
  console.log("\n========== " + name + ": 真实玩 ==========");
  // 列出所有可点击
  await dumpPage(page, name + " 初始页");
  await shot(page, name + "_01_initial");
  // 点所有外部 link
  const allLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.h && a.h.startsWith("http") && a.t.length > 0).slice(0, 15));
  console.log("  真实可玩链接:");
  for (let i = 0; i < allLinks.length; i++) {
    const l = allLinks[i];
    if (l.h === page.url()) continue;
    console.log("    [" + (i+1) + "] 访问: " + l.t + "  ->  " + l.h);
    try {
      await page.goto(l.h, { waitUntil: "domcontentloaded", timeout: 15000 });
      await sleep(1500);
      await shot(page, name + "_link_" + (i+1));
      const newLinks = await page.$$eval("a[href]", as => as.map(a => a.textContent.trim()).filter(t => t).slice(0, 5));
      console.log("        页面内子链接: " + newLinks.join(" / "));
    } catch (e) { console.log("        失败: " + e.message.substring(0, 80)); }
    await page.goBack({ waitUntil: "domcontentloaded" });
    await sleep(1500);
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ============= 1) 秘密花园 =============
  console.log("\n\n############### 秘密花园 ###############");
  await page.goto("https://anninganya-glitch.github.io/My-Secret-Garden/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dumpPage(page, "秘密花园 落地页");
  await shot(page, "mimi_01_landing");
  // 点击"开始游戏"按钮 - 但之前发现没 button，找 a
  const startClicked = await page.evaluate(() => {
    const a = document.querySelector("a.start-button");
    if (a) { a.click(); return "a.start-button"; }
    const b = document.querySelector("button.start-button");
    if (b) { b.click(); return "button.start-button"; }
    const any = Array.from(document.querySelectorAll("a, button")).find(el => el.textContent.includes("开始"));
    if (any) { any.click(); return "text-match: " + any.textContent.trim(); }
    return null;
  });
  console.log("  点了: " + startClicked);
  await sleep(3000);
  console.log("  url after click:", page.url());
  await shot(page, "mimi_02_after_start");
  await dumpPage(page, "秘密花园 step2");

  // ============= 2) 青苗中学 =============
  console.log("\n\n############### 青苗中学 ###############");
  await page.goto("https://qingmiaomiddleschool.github.io/Start-Game-/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dumpPage(page, "青苗中学 落地页");
  await shot(page, "qingmiao_01_landing");
  // 看所有 js (尝试找密码)
  const qmCode = await page.evaluate(() => {
    return document.documentElement.outerHTML.length;
  });
  console.log("  HTML 长度:", qmCode);
  // 抓所有 input + 试密码
  const qmInputs = await page.$$eval("input", els => els.map(e => ({type: e.type, id: e.id, placeholder: e.placeholder})));
  console.log("  inputs:", JSON.stringify(qmInputs));
  if (qmInputs.length > 0) {
    // 试常见邮箱格式
    const testEmails = ["a@a.com", "test@test.com", "111@111.com", "林昭@qq.com", "linzhao@qq.com", "123@123.com", "a@163.com", "demo@demo.com"];
    for (const e of testEmails) {
      try {
        await page.evaluate(() => { document.querySelectorAll("input").forEach(i => i.value = ""); });
        await page.type(qmInputs[0].id ? "#" + qmInputs[0].id : "input", e);
        // 找 form 提交或 button
        const submitClicked = await page.evaluate(() => {
          const btn = document.querySelector("button[type=submit], button.start, .start-btn, button");
          if (btn) { btn.click(); return true; }
          const form = document.querySelector("form");
          if (form) { form.requestSubmit ? form.requestSubmit() : form.submit(); return true; }
          return false;
        });
        if (submitClicked) {
          await sleep(2000);
          const newUrl = page.url();
          if (newUrl !== "https://qingmiaomiddleschool.github.io/Start-Game-/") {
            console.log("  ✓ email '" + e + "' 跳转! new url:", newUrl);
            await shot(page, "qingmiao_02_after_email");
            await dumpPage(page, "青苗中学 step2");
            break;
          }
        }
      } catch (err) { console.log("  email '" + e + "' err: " + err.message.substring(0, 60)); }
    }
  }

  // ============= 3) 陈雨彤 =============
  console.log("\n\n############### 寻找陈雨彤 ###############");
  await page.goto("https://www.bingzhuyetan.com/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dumpPage(page, "陈雨彤 落地页");
  await shot(page, "chenyutong_01_landing");
  // 找"开始"/"进入"链接
  const entryLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.t && (a.t.includes("开始") || a.t.includes("进入") || a.t.includes("查询") || a.t.includes("登录") || a.t.includes("搜索"))).slice(0, 10));
  console.log("  入口链接:", JSON.stringify(entryLinks));
  for (const l of entryLinks) {
    if (l.h.startsWith("http")) {
      console.log("  跳转到: " + l.h);
      await page.goto(l.h, { waitUntil: "domcontentloaded" });
      await sleep(2000);
      await shot(page, "chenyutong_entry");
      await dumpPage(page, "陈雨彤 " + l.t);
    }
  }
  // 找所有"非首页"的链接
  const innerLinks = await page.$$eval("a[href]", as => as.map(a => ({t: a.textContent.trim(), h: a.href})).filter(a => a.h && (a.h.includes(".html") || a.h.endsWith("/")) && !a.h.includes("#")).slice(0, 15));
  console.log("  内部链接:");
  innerLinks.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.t + "' -> " + l.h));

  await browser.close();

  const files = fs.readdirSync(SHOTS).filter(f => f.endsWith(".png"));
  console.log("\n=== 总报告 ===");
  console.log("截图 " + files.length + " 张");
  files.slice(-30).forEach(f => console.log("  " + f + "  " + (fs.statSync(path.join(SHOTS,f)).size/1024).toFixed(0) + "KB"));
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
