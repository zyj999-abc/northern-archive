// 真实游玩 puppeteer - 走完所有按钮 + 看体验报告
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

async function dumpClickables(page, scope) {
  return await page.evaluate((sel) => {
    const els = document.querySelectorAll(sel);
    return Array.from(els).map(e => ({
      tag: e.tagName,
      text: (e.textContent||"").trim().slice(0, 60),
      href: e.href || null,
      id: e.id || null,
      classes: e.className || null
    })).slice(0, 40);
  }, scope);
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // ===== 1) 灵异论坛: 真实走完 =====
  console.log("\n========== 灵异论坛 - 真实走 ==========");
  await page.goto("https://mminghuo.github.io/forum/", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await shot(page, "lingyi_01_index");
  console.log("  url:", page.url());

  // 看菜单
  const menu = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button")).map(b => ({id: b.id, text: b.textContent.trim()})).filter(b => b.text);
  });
  console.log("  菜单按钮:", JSON.stringify(menu));

  // 点 "开始新游戏"
  await page.evaluate(() => {
    const b = document.getElementById("newGameOption");
    if (b) b.click();
  });
  await sleep(1500);
  await shot(page, "lingyi_02_newgame_dialog");
  // 看 dialog
  const dialog = await page.evaluate(() => {
    const d = document.getElementById("confirmDialog");
    return d ? {class: d.className, title: document.getElementById("dialogTitle")?.textContent, text: document.getElementById("dialogText")?.textContent} : null;
  });
  console.log("  dialog:", dialog);

  // 点确认
  await page.evaluate(() => {
    document.getElementById("dialogConfirmBtn")?.click();
  });
  await sleep(2000);
  await shot(page, "lingyi_03_after_confirm");
  console.log("  url after confirm:", page.url());

  // 跳到 login.html
  await page.goto("https://mminghuo.github.io/forum/login.html", { waitUntil: "domcontentloaded" });
  await sleep(2500);
  await shot(page, "lingyi_04_login");
  const inputs = await page.$$eval("input", els => els.map(e => ({type: e.type, id: e.id, placeholder: e.placeholder})));
  console.log("  inputs:", JSON.stringify(inputs));
  // 找所有提示文字
  const hints = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("body *"))
      .map(e => e.textContent.trim())
      .filter(t => t.length > 5 && t.length < 200 && (t.includes("密") || t.includes("提示") || t.includes("hint") || t.includes("题") || t.includes("线索")))
      .slice(0, 10);
  });
  console.log("  提示/线索文本:");
  hints.forEach((h, i) => console.log("    " + (i+1) + ". " + h));

  // 试密码 — 加入 1234567890 (从源码)
  const pwdList = ["1234", "12345", "123456", "password", "admin", "guest", "0000", "666666", "luntan", "123", "233", "666", "111", "admin123", "1234567890", "0123456789"];
  let pwdFound = null;
  for (const pwd of pwdList) {
    await page.evaluate(() => { const i = document.querySelector("#passwordInput") || document.querySelector("input[type=password]"); if (i) i.value = ""; });
    await page.type("#passwordInput", pwd);
    await page.click("button[type=submit], button.login-btn, button, #loginButton").catch(()=>{});
    await sleep(1500);
    if (!page.url().includes("login")) {
      console.log("  ✓ 密码 '" + pwd + "' 成功! url =", page.url());
      pwdFound = pwd;
      break;
    }
  }
  if (!pwdFound) {
    console.log("  ✗ 12 个常见密码都失败");
    // 抓错误信息
    const errText = await page.evaluate(() => {
      const errs = Array.from(document.querySelectorAll(".err, .error, [class*=error]"));
      return errs.map(e => e.textContent.trim()).filter(t => t).slice(0, 3);
    });
    console.log("  错误信息:", errText);
    // 查源码
    const source = await page.content();
    const pw = source.match(/password\s*===\s*['"]([^'"]+)['"]|password\s*=\s*['"]([^'"]+)['"]|gamePassword\s*=\s*['"]([^'"]+)['"]/i);
    if (pw) {
      const found = pw[1] || pw[2] || pw[3];
      console.log("  \u26a0 源码匹配密码:", found);
    }
  }
  await shot(page, "lingyi_05_pwd_result");

  // === 2) 灵异论坛 desktop.html (即使没登录也看结构) ===
  console.log("\n--- 灵异论坛: desktop.html ---");
  await page.goto("https://mminghuo.github.io/forum/desktop.html", { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await shot(page, "lingyi_06_desktop");
  console.log("  url:", page.url());
  // 列所有可点
  const desktopClickables = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, [onclick], [class*=icon], a"))
      .map(e => ({tag: e.tagName, text: e.textContent.trim().slice(0, 30), id: e.id, classes: e.className?.substring(0, 30)}))
      .filter(e => e.text || e.id)
      .slice(0, 40);
  });
  console.log("  desktop 可点元素 (前 30):");
  desktopClickables.slice(0, 30).forEach((e, i) => console.log("    " + (i+1) + ". <" + e.tag + ">", e.id ? "#" + e.id : "", e.text ? "text='" + e.text + "'" : ""));

  // 找所有聊天对象/NPC
  const chats = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("[data-name], [class*=npc], [class*=chat-item], [class*=contact]"));
    return all.map(e => ({name: e.dataset.name, text: e.textContent.trim().slice(0, 40), class: e.className?.substring(0, 30)})).slice(0, 20);
  });
  console.log("  聊天对象 (data-name):", JSON.stringify(chats));

  // localStorage
  const ls = await page.evaluate(() => {
    const out = {};
    try { Object.keys(localStorage).forEach(k => out[k] = (localStorage.getItem(k) || "").substring(0, 60)); } catch(e) {}
    return out;
  });
  console.log("  localStorage:", JSON.stringify(ls, null, 2));

  // 找所有 link 跳转
  const links = await page.$$eval("a[href]", as => as.map(a => ({text: a.textContent.trim().slice(0, 20), href: a.href})).filter(a => a.href && !a.href.includes("#")).slice(0, 30));
  console.log("  所有链接 (前 30):");
  links.forEach((l, i) => console.log("    " + (i+1) + ". '" + l.text + "'  -> " + l.href));

  // 找 5 结局触发器
  const ends = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[class*=end], [data-end], [id*=end]"))
      .map(e => ({id: e.id, class: e.className, text: e.textContent.trim().slice(0, 30)}))
      .slice(0, 20);
  });
  console.log("  结局元素:", JSON.stringify(ends));

  await browser.close();

  const files = fs.readdirSync(SHOTS).filter(f => f.endsWith(".png"));
  console.log("\n=== 报告 ===");
  console.log("截图 " + files.length + " 张");
  files.forEach(f => console.log("  " + f + "  " + (fs.statSync(path.join(SHOTS,f)).size/1024).toFixed(0) + "KB"));
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
