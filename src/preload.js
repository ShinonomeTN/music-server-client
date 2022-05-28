// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
});

contextBridge.exposeInMainWorld('$native', (name, param) => ipcRenderer.invoke(name, param));
