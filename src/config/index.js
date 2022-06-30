import { $native } from '@/common/native';

const config = {
  isWeb: !window.electron,
  platform: null,
  titleBarHeight: 0,
  /** @type { 'webapp'  | 'webpage' | 'native' } */
  // eslint-disable-next-line
  appMode: (!window.electron) ? ((window.navigator.standalone) ? 'webapp' : 'webpage') : 'native',
};

export function reloadNativeConfig() {
  setTimeout(() => {
    $native('platform', null)
      .then((result) => {
        config.platform = result;
        if (result === 'darwin') config.titleBarHeight = 30;
        else config.titleBarHeight = 60;

        document.body.style.setProperty('--ms-title-inset', `${config.titleBarHeight}px`);
      })
      .catch(() => {
        console.info('Did not detect native platform.');
      });
  }, 1000);
}

export default config;
