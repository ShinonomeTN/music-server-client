import '@/common/stupid';

// eslint-disable-next-line import/no-extraneous-dependencies
import { app, protocol, BrowserWindow, session } from 'electron';

// eslint-disable-next-line import/no-extraneous-dependencies
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { configureRPCHandlers, windowConfiguration } from '@/native';

// eslint-disable-next-line import/no-extraneous-dependencies
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';

const isDevelopment = process.env.NODE_ENV !== 'production';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  const win = new BrowserWindow(windowConfiguration());

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (isDevelopment) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    await win.loadURL('app://./index.html');
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow().then();
});

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // eslint-disable-next-line no-param-reassign
    details.requestHeaders['User-Agent'] = 'MusicServerManagementClient/1.0.0-SNAPSHOT';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  await createWindow();
  configureRPCHandlers();
});

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
