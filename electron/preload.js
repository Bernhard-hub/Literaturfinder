"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    },
    openExternal: (url) => {
        electron_1.shell.openExternal(url);
    },
    // PDF Download API
    selectDownloadFolder: () => electron_1.ipcRenderer.invoke('select-download-folder'),
    downloadPdf: (args) => electron_1.ipcRenderer.invoke('download-pdf', args),
    writeFile: (args) => electron_1.ipcRenderer.invoke('write-file', args),
    createDirectory: (dirPath) => electron_1.ipcRenderer.invoke('create-directory', dirPath),
    // Download Progress Listener
    onDownloadProgress: (callback) => {
        electron_1.ipcRenderer.on('download-progress', (event, data) => callback(data));
    },
    removeDownloadProgressListener: () => {
        electron_1.ipcRenderer.removeAllListeners('download-progress');
    },
    // DevTools Toggle
    toggleDevTools: () => electron_1.ipcRenderer.invoke('toggle-devtools')
});
