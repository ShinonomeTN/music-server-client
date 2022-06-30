// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcMain, IpcMainInvokeEvent } from 'electron';

import requestDelegate from '@/native/request-delegate';
import windowDelegate from '@/native/window-delegate';
import platformDelegate from '@/native/platform-delegate';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

export type NativeRpcMethod = (event: IpcMainInvokeEvent, ...args : unknown[]) => Promise<unknown>

function rpcExecutionWrapper(method : NativeRpcMethod) {
  return async (event : IpcMainInvokeEvent, param : unknown[]) => {
    try {
      const result = await method(event, param);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

export function configureRPCHandlers() {
  const handlerList = {
    ...requestDelegate,
    ...windowDelegate,
    ...platformDelegate,
  };

  for (const [key, value] of Object.entries(handlerList)) {
    // @ts-ignore
    ipcMain.handle(key, rpcExecutionWrapper(value));
    console.log(`Register rpc method '${key}'.`);
  }
}

/*  Window configuration  */

function decideWindowSize() {
  return isDevelopment ? { width: 1200, height: 600 } : { width: 800, height: 600 };
}

function decideTitleBarStyle() {
  const { platform } = process;
  if (platform === 'win32' || platform === 'darwin') {
    return {
      titleBarStyle: 'hidden',
      titleBarOverlay: true,
    };
  }

  return {};
}

export function windowConfiguration() {
  return {
    ...decideWindowSize(),
    webPreferences: {
      preload: path.resolve(path.join(__dirname, 'preload.js')),
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
    maximizable: true,
    ...decideTitleBarStyle(),
  };
}
