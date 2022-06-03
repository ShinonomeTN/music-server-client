import configureAxios from '@/common/axios-config';

const a = configureAxios();

export default {
  axios(event, opt) {
    // Filtering some features that not supported by native platform
    // eslint-disable-next-line no-param-reassign
    if (opt.onUploadProgress) opt.onUploadProgress = null;

    return a(opt).then((response) => ({
      headers: response.headers,
      data: response.data,
      isNativeRequest: true,
    })).catch((e) => Promise.reject(e));
  },
};
