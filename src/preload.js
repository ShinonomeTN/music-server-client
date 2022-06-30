// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer } from 'electron';

[
  ['electron', { ipcRenderer }],
  ['$native', (name, param) => ipcRenderer.invoke(name, param)],
].forEach(([key, value]) => contextBridge.exposeInMainWorld(key, value));
