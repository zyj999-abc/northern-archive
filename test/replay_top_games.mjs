// test/replay_top_games.mjs — 重点抓「拟物化」和「细节堆」截图
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const __filename = new URL(import.meta.url).pathname.replace(/^\/(?=[A-Z]:\/)/, "");
const ROOT = path.dirname(__filename);
const TOPDIR = "D:\\Desktop\\kai\\z\\gz\\_research_top_games";
const SHOTS = path.join(TOPDIR, "shots2");
fs.mkdirSync(SHOTS, { recursive: true });

async function shot(page, name, fullPage = true) {
  await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage });
  console.log("  shot ->", name);
}

const games = [
  { name: "1_lingyi", url: "https://mminghuo.github.io/forum/" },
  { name: "2_mimi",   url: "https://anninganya-glitch.github.io/My-Secret-Garden/" },
  { name: "4_qingmiao", url: "https://qingmiaomiddleschool.github.io/Start-Game-/" },
  { name: "5_chenyutong", url: "https://www.bingzhuyetan.com/" },
  { name: "6_xicheng", url: "https://www.hces.edu.tw.solve.quest/" }
];

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  for (const g of games) {
    console.log(`\n===== ${g.name} =====`);
    await page.goto(g.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));
    await shot(page, g.name + "_1_top");
    // 滚动 50% 抓中段
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await new Promise(r => setTimeout(r, 1500));
    await shot(page, g.name + "_2_mid");
    // 滚动到 100%
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1500));
    await shot(page, g.name + "_3_bottom");
  }

  // 溪埕 — 抓 5 个内页
  console.log("\n===== 溪埕 内页 =====");
  const subpages = ["works.html", "lunch.html", "guestbook.html", "classes.html", "internal.html", "training.html", "anniversary.html", "activities.html"];
  for (const p of subpages) {
    await page.goto(`https://www.hces.edu.tw.solve.quest/${p}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await shot(page, "xicheng_" + p.replace(".html", ""));
  }

  // 溪埕 找 1989-09-18 公告
  await page.goto(`https://www.hces.edu.tw.solve.quest/news_20030918.html`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await shot(page, "xicheng_news_20030918_v2");

  // 灵异论坛内页
  for (const p of ["login.html", "desktop.html"]) {
    await page.goto(`https://mminghuo.github.io/forum/${p}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await shot(page, "lingyi_" + p.replace(".html", ""));
  }

  // 秘密花园 step 2 (跳过去)
  await page.goto("https://anninganya-glitch.github.io/new/", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 3000));
  await shot(page, "2_mimi_step2_full");

  // 找 start 按钮点了之后的所有页
  const links = await page.$$eval("a", as => as.map(a => a.href).filter(h => h.includes("anninganya") && !h.includes("github.com")));
  console.log("  mimi links:", links);
  for (const l of links.slice(0, 5)) {
    try {
      await page.goto(l, { waitUntil: "domcontentloaded", timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await shot(page, "mimi_" + l.split("/").pop().replace(".html","").replace(/[^a-zA-Z0-9_-]/g,"_"));
    } catch (e) {}
  }

  await browser.close();

  const files = fs.readdirSync(SHOTS).filter(f => f.endsWith(".png"));
  console.log("\n=== 报告 ===");
  console.log(`截图 ${files.length} 张:`);
  files.forEach(f => console.log(`  ${f}  ${(fs.statSync(path.join(SHOTS,f)).size/1024).toFixed(0)}KB`));
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
