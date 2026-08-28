// test/walkthrough.mjs - E2E for Northern Archive
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const __filename = new URL(import.meta.url).pathname.replace(/^\/(?=[A-Z]:\/)/, "");
const ROOT = path.dirname(__filename);
const PROJ = path.dirname(ROOT);
const SHOTS = path.join(PROJ, "test", "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const PORT = 8767;
const BASE = `http://127.0.0.1:${PORT}`;

const PAGES = [
  "index.html", "archive.html", "search.html",
  "c1_baoKan.html", "c2_huJi.html", "c3_danWei.html",
  "c4_yiWu.html", "c5_qqQun.html", "c6_xiaoXun.html",
  "choose.html", "end_A_luntan.html", "end_B_shengCheng.html",
  "end_C_jiaBei.html", "end_D_chenMo.html", "end_E_naiNai.html"
];

const errors = [], failures = [];
function log(...a) { console.log("[WALK]", ...a); }

async function startServer() {
  const { default: http } = await import("http");
  const server = http.createServer((req, res) => {
    let url = req.url.split("?")[0];
    if (url === "/") url = "/index.html";
    const file = path.join(PROJ, url);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("404"); return;
    }
    const ext = path.extname(file).toLowerCase();
    const type = ext === ".html" ? "text/html" :
                 ext === ".js" ? "application/javascript" :
                 ext === ".css" ? "text/css" : "application/octet-stream";
    res.writeHead(200, { "Content-Type": type + "; charset=utf-8" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
  return server;
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, name + ".png") });
  log("shot ->", name);
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  page.on("pageerror", e => { errors.push(e.message); log("PAGE_ERROR:", e.message); });
  page.on("requestfailed", req => {
    if (req.url().endsWith("/favicon.ico")) return;
    failures.push({ url: req.url(), reason: req.failure()?.errorText });
  });

  log("===== 15 页面 200 测试 =====");
  for (const p of PAGES) {
    const r = await page.goto(`${BASE}/${p}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    if (!r || r.status() >= 400) { failures.push({ url: p }); log("HTTP_FAIL:", p); }
    else log("  OK:", p);
    await new Promise(r => setTimeout(r, 500));
  }

  // ====== 5 个结局全路径 ======
  log("===== 路径 A: 写论文 =====");
  await page.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => document.getElementById("start-btn").click());
  await new Promise(r => setTimeout(r, 1500));
  // 登录
  await page.type("#name", "李泽宇");
  await page.type("#id", "230826200112010019");
  await page.click(".archive-btn");
  await new Promise(r => setTimeout(r, 1500));
  log("  after login url =", page.url());
  // 访问 6 频道
  for (const ch of ["channel1","channel2","channel3","channel4","channel5","channel6"]) {
    await page.evaluate((c) => NA.go(c), ch);
    await new Promise(r => setTimeout(r, 800));
  }
  await shot(page, "na_chan6");
  // 抉择
  await page.goto(`${BASE}/choose.html`, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await shot(page, "na_choose");
  await page.evaluate(() => goChoice("A"));
  await new Promise(r => setTimeout(r, 2000));
  log("  url =", page.url());
  await shot(page, "na_end_A");
  await new Promise(r => setTimeout(r, 4000));
  await shot(page, "na_end_A_mid");

  log("===== 路径 B-E 类似 =====");
  for (const opt of ["B","C","D","E"]) {
    await page.goto(`${BASE}/choose.html`, { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate((o) => goChoice(o), opt);
    await new Promise(r => setTimeout(r, 2000));
    log("  " + opt + " url =", page.url());
    await shot(page, "na_end_" + opt);
  }

  log("===== 报告 =====");
  log("errors:", errors.length);
  log("failures (excl favicon):", failures.length);
  for (const f of failures) log("  -", f);
  for (const e of errors) log("  ERR:", e);
  fs.writeFileSync(path.join(SHOTS, "report.json"), JSON.stringify({ errors, failures }, null, 2));

  await browser.close();
  server.close();
  process.exit(errors.length === 0 && failures.length === 0 ? 0 : 1);
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
