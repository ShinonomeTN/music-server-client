import configureAxios from '@/common/axios-config';

const a = configureAxios();

export default {
  async axios(event, opt) {
    return a(opt).then((response) => ({
      headers: response.headers,
      data: response.data,
      isNativeRequest: true,
    }));
  },
};
