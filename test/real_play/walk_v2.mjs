// v2 真玩截图测试
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const ROOT = "D:\\Desktop\\kai\\z\\gz\\northern-archive\\v2";
const SHOTS = path.join(ROOT, "..", "test", "real_play", "v2_shots");
fs.mkdirSync(SHOTS, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true, timeout: 15000 });
  console.log("  shot:", name);
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  // 1. 锁屏
  await page.goto("http://localhost:8765/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  await shot(page, "v2_01_lock");

  // 2. 输入 PIN 0826
  console.log("  >>> 输入 0826");
  for (const d of "0826") {
    await page.evaluate((digit) => {
      const btn = document.querySelector(`.ios-key[data-num='${digit}']`);
      if (btn) btn.click();
    }, d);
    await sleep(400);
  }
  await sleep(3000);
  // 检查 state
  const state1 = await page.evaluate(() => ({
    pin: STATE.pin,
    unlocked: STATE.unlocked,
    stage: STATE.stage,
    lockDisplay: document.getElementById('iosLock').style.display,
    warningDisplay: document.getElementById('warningPopup').style.display,
    macosDisplay: document.getElementById('macosDesktop').style.display,
  }));
  console.log("  state1:", JSON.stringify(state1));
  await shot(page, "v2_02_after_pin");

  // 如果 lock 还显示, 强制跳到警告
  if (state1.lockDisplay !== 'none' && state1.macosDisplay === 'none') {
    console.log("  >>> PIN 失败, 强制跳到警告");
    await page.evaluate(() => {
      document.getElementById('iosLock').style.display = 'none';
      document.getElementById('warningPopup').style.display = 'flex';
    });
    await sleep(2000);
  }

  // 3. 关警告
  await page.evaluate(() => {
    // 先 hide
    document.getElementById('warningPopup').style.setProperty('display', 'none', 'important');
    // 再 show macOS
    document.getElementById('macosDesktop').style.setProperty('display', 'block', 'important');
    if (typeof startTextRain === 'function') startTextRain();
  });
  await sleep(2000);

  // 4. 点开备忘录
  await page.evaluate(() => openMacApp('notes'));
  await sleep(2000);
  await shot(page, "v2_04_notes_diary");

  // 5. 切到回收站
  await page.evaluate(() => {
    const items = document.querySelectorAll(".macos-notes-sidebar-item");
    const recycle = Array.from(items).find(i => i.dataset.cat === 'recycle');
    if (recycle) recycle.click();
  });
  await sleep(1500);
  await shot(page, "v2_05_notes_recycle");

  // 6. 关闭备忘录 + 打开文件夹
  await page.evaluate(() => closeMacApp('notes'));
  await sleep(500);
  await page.evaluate(() => openMacApp('folder'));
  await sleep(2000);
  await shot(page, "v2_06_folder_pw");

  // 7. 输入密码 wyynlzdq
  await page.type("#folderPwInput", "wyynlzdq");
  await sleep(500);
  await shot(page, "v2_07_folder_pw_typed");

  // 8. 点确定
  await page.evaluate(() => submitFolderPw());
  await sleep(1500);
  await shot(page, "v2_08_folder_opened");

  // 9. 关弹窗 + 打开邮件
  await page.evaluate(() => closeModal());
  await sleep(500);
  await page.evaluate(() => closeMacApp('folder'));
  await sleep(500);
  await page.evaluate(() => openMacApp('mail'));
  await sleep(2000);
  await shot(page, "v2_09_mail_inbox");

  // 10. 点第一封邮件
  await page.evaluate(() => openEmail(1));
  await sleep(2000);
  await shot(page, "v2_10_email_1");

  // 11. 关弹窗 + 打开论坛
  await page.evaluate(() => closeModal());
  await sleep(500);
  await page.evaluate(() => closeMacApp('mail'));
  await sleep(500);
  await page.evaluate(() => openMacApp('forum'));
  await sleep(2000);
  await shot(page, "v2_11_forum");

  // 12. 论坛搜林又
  await page.type("#forumSearch", "林又");
  await sleep(1500);
  await shot(page, "v2_12_forum_search");

  // 13. 错 PIN
  await page.evaluate(() => openMacApp('chat'));
  await sleep(1000);
  await page.evaluate(() => closeMacApp('chat'));
  await sleep(500);
  // 重启到锁屏
  await page.evaluate(() => {
    location.reload();
  });
  await sleep(3000);
  for (const d of "0000") {
    await page.evaluate((digit) => {
      const btn = document.querySelector(`.ios-key[data-num='${digit}']`);
      if (btn) btn.click();
    }, d);
    await sleep(300);
  }
  await sleep(1000);
  await shot(page, "v2_13_wrong_pin");

  await browser.close();
  console.log("--- 完成");
  const files = fs.readdirSync(SHOTS).sort();
  files.forEach(f => {
    const s = fs.statSync(path.join(SHOTS,f)).size;
    console.log("  " + f + "  " + (s/1024).toFixed(0) + "KB");
  });
}

main().catch(e => { console.error("FATAL", e); process.exit(2); });
