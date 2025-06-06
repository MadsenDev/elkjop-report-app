const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    await browser.close();

    const chromiumExecutablePath = puppeteer.executablePath();
    const chromiumBase = path.dirname(chromiumExecutablePath);
    const chromiumDest = path.resolve(__dirname, '../dist_electron/chromium');

    if (!fs.existsSync(chromiumBase)) {
      console.error('❌ Chromium binary not found at:', chromiumBase);
      process.exit(1);
    }

    fse.copySync(chromiumBase, chromiumDest, { overwrite: true });
  } catch (err) {
    console.error('❌ Error during Chromium copy:', err.message);
    process.exit(1);
  }
})();