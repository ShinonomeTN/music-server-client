import { BusinessError } from '@/common/business-error';
import axios from 'axios';
import { filteringFields } from '@/common/stupid';

function isJsonResponse(axiosResponse) {
  const contentType = axiosResponse.headers['content-type'];
  if (!contentType) return false;
  return contentType.toLowerCase()
    .match(/application\/json.+/);
}

const configuration = {
  errorHandlers: [],
};

export const prettyAxiosError = (error) => ({
  error,
  code: error.code,
  request: {
    ...(({ request, config }) => {
      if (!request) return {};

      const headers = (() => {
        // eslint-disable-next-line no-underscore-dangle
        const header = request._header; if (!header) return null;
        const headerLines = header
          .split('\r\n')
          .map((line) => line.trim())
          .filter((line) => line !== '');

        const [method, location, httpVersion] = headerLines.splice(0, 1)[0].split(' ');
        return {
          method,
          location,
          httpVersion,
          headers: headerLines.mapNotNull((line) => {
            const [matched, key, value] = line.match(/^(.+[^:]):(.+)$/);
            return matched ? [key, value] : null;
          }).mapToMap(([key]) => key, ([, value]) => value),
        };
      })() || (() => ({
        method: 'UNKNOWN',
        location: 'UNKNOWN',
        httpVersion: 'UNKNOWN',
        headers: [],
      }))();

      return {
        ...headers,
        ...filteringFields(config, 'url', 'timeout', 'data'),
      };
    })(error),
  },

  response: ((response) => (response ? {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data,
  } : {}))(error.response),
});

function sizeFixed(string, size, alignment, paddingChar) {
  const chars = (length) => {
    const char = paddingChar || ' ';
    let s = '';
    for (let i = 0; i < length; i++) s += char;
    return s;
  };

  const diff = size.length - string.length;
  if (diff <= 0) return string;
  switch (alignment || 'left') {
    case 'center': {
      if (diff % 2 !== 0) return `${chars(Math.floor(diff / 2))}${string}${chars(Math.ceil(diff / 2))}`;
      const surrounding = chars(diff / 2);
      return `${surrounding}${string}${surrounding}`;
    }
    case 'right': {
      return `${chars(diff)}${string}`;
    }
    default: {
      return `${string}${chars(diff)}`;
    }
  }
}

export function prettyAxiosErrorReport({ code, request, response }) {
  const tableOf = (val) => {
    const headers = Object.entries(val || {});
    const maxLength = headers.map(([key]) => key).max((item) => item.length);
    return headers.map(([key, value]) => `| ${sizeFixed(key, maxLength, 'right')} | ${value}`).join('\n');
  };

  return `
----------------------------------------------------------------------------------------------------
- Axios Request Error (${code})
------------------------------------------ [[ Request ]] -------------------------------------------
[${request.method}] ${request.location} (${request.httpVersion})
- Headers ------------------------------------------------------------------------------------------
${tableOf(request.headers)}
- Body    ------------------------------------------------------------------------------------------
${request.data}
------------------------------------------ [[ Response ]] ------------------------------------------
[${response.status}] ${response.statusText}
- Headers ------------------------------------------------------------------------------------------
${tableOf(request.headers)}
- Body    ------------------------------------------------------------------------------------------
${response.data}
----------------------------------------------------------------------------------------------------
`.trim();
}

export default function () {
  axios.interceptors.response.use((response) => {
    if (!response) return Promise.reject(new Error('Could not get axios response.'));

    const { data } = response;
    if (isJsonResponse(response) && data.error) {
      const error = new BusinessError(data);
      for (const errorHandler of configuration.errorHandlers) errorHandler(error);
      return Promise.reject(error);
    }

    return Promise.resolve(response);
  }, (error) => Promise.reject((() => {
    const pretty = prettyAxiosError(error);
    for (const errorHandler of configuration.errorHandlers) errorHandler(pretty);
    return pretty;
  })()));

  axios.defaults.timeout = 10000;

  return axios;
}
