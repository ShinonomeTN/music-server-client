// eslint-disable-next-line import/no-extraneous-dependencies
import {
  BrowserWindow,
  BrowserView,
  IpcMainInvokeEvent,
  BrowserWindowConstructorOptions,
} from 'electron';

// eslint-disable-next-line import/extensions
import '@/common/stupid.js';
import { BusinessError } from '@/common/business-error';
import { Optional } from '@/common/foolish';
import path from 'path';

function getWindowOfIndex(index : number) : Optional<BrowserWindow> {
  const all = BrowserWindow.getAllWindows();
  if (all.isEmpty()) return null;
  return all[index];
}

export type NativeWindowOpenParams = {
  url : string,
  config : BrowserWindowConstructorOptions,
  parentWindowIndex: number,
  modal : unknown
}

export default {
  async openNewWindow(event : IpcMainInvokeEvent, { url, config, parentWindowIndex, modal } : NativeWindowOpenParams) {
    const windowConf = config || { width: 320, height: 240 };
    if (parentWindowIndex !== null) {
      const window = getWindowOfIndex(parentWindowIndex);
      // @ts-ignore
      if (window) windowConf.parent = window;
    }
    if (modal) {
      if (parentWindowIndex == null) {
        const window = getWindowOfIndex(0);
        // @ts-ignore
        if (window) windowConf.parent = window;
      }
      // @ts-ignore
      windowConf.modal = true;
    }
    const window = new BrowserWindow(windowConf);
    console.debug(`Open new window with url '${url}'.`);
    window.once('ready-to-show', () => {
      window.show();
    });
    // window.once('closed')
    await window.loadURL(url);
  },

  async openLoginWindow(event : IpcMainInvokeEvent, { url } : { url : string}) {
    const defaultWindow = getWindowOfIndex(0);
    if (!defaultWindow) console.warn('No default window found. Login window will not show.');
    const window = new BrowserWindow({
      width: 400,
      height: 600,
      modal: true,
      // @ts-ignore
      parent: defaultWindow,
      titleBarStyle: 'default',
      titleBarOverlay: true,
      webPreferences: {
        preload: path.resolve(path.join(__dirname, 'preload.js')),
        // @ts-ignore
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      },
    });
    console.debug('Open login window for url:', url);
    window.once('ready-to-show', () => {
      window.show();
    });
    const promise = new Promise((resolve, reject) => {
      let didReceiveToken = false;
      window.webContents.on('did-start-navigation', (_, newUrl) => {
        console.debug('Login window location changed:', newUrl);
        try {
          const urlCom = new URL(newUrl);
          const { searchParams } = urlCom;
          const from = searchParams.get('from');
          const token = searchParams.get('token');
          if (from === 'com.shinonometn.music.server' && token) setTimeout(() => {
            didReceiveToken = true;
            resolve(token);
            window.close();
          }, 1000);
        } catch (e) {
          console.log('error while handling url components:', e);
        }
      });

      window.once('close', () => {
        // @ts-ignore
        if (!didReceiveToken) reject(new BusinessError({ error: 'user_cancel', message: 'did_not_receive_any_token' }));
      });
    });
    await window.loadURL(url);
    return promise;
  },

  // @ts-ignore
  async openNewView(event, { url, windowIndex, sizeConfig, autoResizeOptions }) {
    const parent = getWindowOfIndex(windowIndex || 0);
    if (parent === null) return;

    const viewConfig = sizeConfig || {
      width: 300,
      height: 400,
      x: 0,
      y: 0,
    };

    const view = new BrowserView();
    // @ts-ignore
    parent.setBrowserView(view);

    console.info(`Open new view in window ${parent} with url '${url}', view bounds:`, viewConfig);

    view.setBounds(viewConfig);

    if (autoResizeOptions) view.setAutoResize(autoResizeOptions);
    await view.webContents.loadURL(url);
  },

  async maximizeWindow(event : IpcMainInvokeEvent, { windowIndex } : { windowIndex: number }) {
    const window = getWindowOfIndex(windowIndex);
    // @ts-ignore
    if (!window.isMaximized()) window.maximize();
  },

  // async minimizeWindow(event, { windowIndex }) {
  //   const window = getWindowOfIndex(windowIndex)
  // }
};
