const { app, BrowserWindow } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const appUrl = process.env.KETEL_MAIL_SCREENSHOT_URL || "http://127.0.0.1:8080/?v=screenshots";
const outDir = path.resolve(__dirname, "..", "docs", "screenshots");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");

async function saveScreenshot(window, name) {
  const image = await window.webContents.capturePage();
  await fs.writeFile(path.join(outDir, name), image.toPNG());
}

app.whenReady().then(async () => {
  await fs.mkdir(outDir, { recursive: true });

  const window = new BrowserWindow({
    width: 1440,
    height: 980,
    show: true,
    backgroundColor: "#0f1512",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  });

  await window.loadURL(appUrl);
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await window.webContents.executeJavaScript(`
    (() => {
      const style = document.createElement("style");
      style.textContent = "*,*::before,*::after{animation:none!important;transition:none!important} iframe{visibility:hidden!important}";
      document.head.appendChild(style);
    })();
  `);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await saveScreenshot(window, "ketel-mail-inbox.png");

  await window.webContents.executeJavaScript(`
    (() => {
      const button = [...document.querySelectorAll("button")].find((node) => node.getAttribute("aria-label") === "Instellingen");
      button?.click();
      const scroller = document.querySelector(".settings-scroll");
      if (scroller) scroller.scrollTop = 0;
    })();
  `);
  await new Promise((resolve) => setTimeout(resolve, 900));
  await saveScreenshot(window, "ketel-mail-settings-templates.png");

  await window.close();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
