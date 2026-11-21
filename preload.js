const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Program açılırken kayıtlı veriyi okur: { m, s } ya da null
  load: () => ipcRenderer.sendSync("data:load"),
  // Her değişiklikte veriyi diske yazar
  save: (m, s) => ipcRenderer.send("data:save", { m, s }),
  // Yedek / Excel dosyasını "Farklı kaydet" penceresiyle kaydeder
  saveFile: (name, text) => ipcRenderer.invoke("file:save", { name, text })
});
