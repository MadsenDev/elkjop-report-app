const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

(async () => {
  try {
    console.log('🚀 Launching Puppeteer to ensure Chromium is downloaded...');
    const browser = await puppeteer.launch({ headless: 'new' });
    await browser.close();
    console.log('✅ Puppeteer launched and Chromium downloaded.');

    const chromiumExecutablePath = puppeteer.executablePath();
    const chromiumBase = path.dirname(chromiumExecutablePath);
    const chromiumDest = path.resolve(__dirname, '../chromium');

    if (!fs.existsSync(chromiumBase)) {
      console.error('❌ Chromium binary not found at:', chromiumBase);
      process.exit(1);
    }

    console.log('📦 Copying Chromium from:', chromiumBase);
    console.log('➡️  To:', chromiumDest);

    fse.copySync(chromiumBase, chromiumDest, { overwrite: true });
    console.log('✅ Chromium copied successfully.');
  } catch (err) {
    console.error('❌ Error during postinstall:', err.message);
    process.exit(1);
  }
})();