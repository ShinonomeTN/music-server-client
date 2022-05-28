import { BusinessError } from '@/common/business-error';
import axios from 'axios';

function isJsonResponse(axiosResponse) {
  const contentType = axiosResponse.headers['content-type'];
  if (!contentType) return false;
  return contentType.toLowerCase().match(/application\/json.+/);
}

export default function () {
  axios.interceptors.response.use((response) => {
    if (!response) return Promise.reject(response);
    const { data } = response;
    if (isJsonResponse(response) && data.error) return Promise.reject(new BusinessError(data));

    return Promise.resolve(response);
  }, (error) => Promise.reject(error));

  return axios;
}
