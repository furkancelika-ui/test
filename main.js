const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

// Veriler: Windows'ta %APPDATA%\KisiselHarcamalarim\veri
app.setPath("userData", path.join(app.getPath("appData"), "KisiselHarcamalarim"));
const dataDir = () => path.join(app.getPath("userData"), "veri");
const dataFile = () => path.join(dataDir(), "butce.json");
const backupDir = () => path.join(dataDir(), "otomatik-yedekler");
const KEEP_BACKUPS = 60;

function ensureDirs() {
  fs.mkdirSync(backupDir(), { recursive: true });
}

function readData() {
  for (const f of [dataFile(), dataFile() + ".bak"]) {
    try {
      const o = JSON.parse(fs.readFileSync(f, "utf8"));
      if (o && typeof o.m === "string") return o;
    } catch (e) {}
  }
  return null;
}

// Güvenli yazma: önce geçici dosyaya yaz, sonra yerine taşı
function writeData(o) {
  ensureDirs();
  const f = dataFile(), tmp = f + ".tmp";
  const json = JSON.stringify({ m: o.m, s: o.s, ts: Date.now() });
  fs.writeFileSync(tmp, json, "utf8");
  if (fs.existsSync(f)) fs.copyFileSync(f, f + ".bak");
  fs.renameSync(tmp, f);
  dailyBackup(json);
}

// Günde bir otomatik yedek, son 60 gün saklanır
function dailyBackup(json) {
  const day = new Date().toISOString().slice(0, 10);
  const bf = path.join(backupDir(), `butce-${day}.json`);
  fs.writeFileSync(bf, json, "utf8");
  const all = fs.readdirSync(backupDir()).filter(n => /^butce-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
  all.slice(0, Math.max(0, all.length - KEEP_BACKUPS)).forEach(n => {
    try { fs.unlinkSync(path.join(backupDir(), n)); } catch (e) {}
  });
}

ipcMain.on("data:load", e => { e.returnValue = readData(); });

let pending = null, timer = null;
function flush() {
  clearTimeout(timer); timer = null;
  if (!pending) return;
  try { writeData(pending); } catch (err) { console.error("Kaydedilemedi:", err); }
  pending = null;
}
ipcMain.on("data:save", (_e, o) => {
  pending = o;
  clearTimeout(timer);
  timer = setTimeout(flush, 300);
});

ipcMain.handle("file:save", async (e, { name, text }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const ext = path.extname(name).slice(1);
  const r = await dialog.showSaveDialog(win, {
    defaultPath: path.join(app.getPath("documents"), name),
    filters: [{ name: ext.toUpperCase(), extensions: [ext] }]
  });
  if (r.canceled || !r.filePath) return null;
  fs.writeFileSync(r.filePath, text, "utf8");
  return r.filePath;
});

function buildMenu() {
  const tpl = [
    {
      label: "Dosya",
      submenu: [
        { label: "Veri klasörünü aç", click: () => { ensureDirs(); shell.openPath(dataDir()); } },
        { label: "Otomatik yedekler klasörünü aç", click: () => { ensureDirs(); shell.openPath(backupDir()); } },
        { type: "separator" },
        { role: "quit", label: "Çıkış" }
      ]
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "resetZoom", label: "Normal boyut" },
        { role: "zoomIn", label: "Büyüt" },
        { role: "zoomOut", label: "Küçült" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam ekran" }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 380,
    backgroundColor: "#0f1218",
    title: "Kişisel Harcamalarım",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, "src", "index.html"));
  // Dış bağlantıları programın içinde açma; internete bağlanma
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", ev => ev.preventDefault());
}

// Tek kopya çalışsın (iki pencere aynı dosyaya yazmasın)
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  });
  app.whenReady().then(() => {
    ensureDirs();
    buildMenu();
    createWindow();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on("before-quit", flush);
  app.on("window-all-closed", () => { flush(); if (process.platform !== "darwin") app.quit(); });
}
