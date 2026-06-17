const { app, BrowserWindow, Menu, shell } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

let mainWindow;
let serverPort;

function resolveAppPath(...parts) {
  return path.join(app.getAppPath(), ...parts);
}

function findFreePort(start = 18080) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(start, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : start;
      server.close(() => resolve(port));
    });
  });
}

function waitForServer(url, attempts = 80) {
  return new Promise((resolve, reject) => {
    let count = 0;

    function tryRequest() {
      count += 1;
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
      request.setTimeout(700, () => {
        request.destroy();
        retry();
      });
    }

    function retry() {
      if (count >= attempts) {
        reject(new Error("Ketel Mail server startte niet snel genoeg."));
        return;
      }
      setTimeout(tryRequest, 120);
    }

    tryRequest();
  });
}

async function startLocalServer() {
  serverPort = await findFreePort();
  process.env.PORT = String(serverPort);
  process.env.KETEL_MAIL_DATA_DIR = app.getPath("userData");
  process.env.ELECTRON_RUN_AS_NODE = "";

  const serverEntry = resolveAppPath("server", "index.js");
  await import(pathToFileURL(serverEntry).href);
  await waitForServer(`http://127.0.0.1:${serverPort}/api/status`);
}

function createWindow() {
  const iconPath = resolveAppPath("public", "icons", "ketel-mail-icon.png");

  mainWindow = new BrowserWindow({
    title: "Ketel Mail",
    width: 1320,
    height: 900,
    minWidth: 1060,
    minHeight: 720,
    show: false,
    backgroundColor: "#0f1512",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      backgroundThrottling: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL(`http://127.0.0.1:${serverPort}/?desktop=1`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(`http://127.0.0.1:${serverPort}`)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    app.setName("Ketel Mail");
    await startLocalServer();
    createWindow();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
