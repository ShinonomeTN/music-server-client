import configureAxios from '@/common/axios-config';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IpcMainInvokeEvent } from 'electron';

const a = configureAxios();

export default {
  axios(event : IpcMainInvokeEvent, opt : unknown) {
    // Filtering some features that not supported by native platform
    // eslint-disable-next-line no-param-reassign
    // @ts-ignore
    if (opt.onUploadProgress) opt.onUploadProgress = null;

    // @ts-ignore
    return a(opt).then((response) => ({
      headers: response.headers,
      data: response.data,
      isNativeRequest: true,
    })).catch((e) => Promise.reject(e));
  },
};
