import { BusinessError } from '@/common/business-error';
import axios, { AxiosError, AxiosResponse, AxiosResponseHeaders } from 'axios';
import { Optional } from '@/common/foolish';

function isJsonResponse(response: AxiosResponse): boolean {
  const contentType = response.headers['content-type'];
  if (!contentType) return false;
  return !!contentType.toLowerCase().match(/application\/json.+/);
}

export type HorizontalAlignments = 'left' | 'center' | 'right'

export function sizeFixedString(string: string, size = 0, alignment: HorizontalAlignments = 'left', paddingChar = ' '): string {
  const chars = (length: number) => {
    const char = paddingChar || ' ';
    let s = '';
    for (let i = 0; i < length; i++) s += char;
    return s;
  };

  const diff = size - string.length;
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

export class PrettyAxiosRequest {
  method: Optional<string>
  location: Optional<string>
  httpVersion: Optional<string>
  headers: Record<string, Optional<string>>
  url: Optional<string>
  timeout: Optional<number>
  data: Optional<unknown>

  constructor(
    method: Optional<string> = undefined, location: Optional<string> = undefined, httpVersion: Optional<string> = undefined,
    headers: Record<string, Optional<string>> = {}, url: Optional<string> = undefined, timeout: Optional<number> = undefined,
    data: Optional<unknown> = undefined,
  ) {
    this.method = method;
    this.location = location;
    this.httpVersion = httpVersion;
    this.headers = headers;
    this.url = url;
    this.timeout = timeout;
    this.data = data;
  }

  static fromError({ request, config }: AxiosError): PrettyAxiosRequest {
    if (!request || !config) return new PrettyAxiosRequest();
    // eslint-disable-next-line no-underscore-dangle
    const header = request._header;
    let method = null;
    let location = null;
    let httpVersion = null;
    let headerLines = [];

    if (header) {
      headerLines = header.split('\r\n').map((line: string) => line.trim()).filter((line: string) => line !== '');
      if (headerLines.length >= 1) [method, location, httpVersion] = headerLines.splice(0, 1)[0].split(' ');
    }

    return new PrettyAxiosRequest(
      method,
      location,
      httpVersion,
      headerLines.mapNotNull((line: string) => {
        const [matched, key, value] = (line.match(/^(.+[^:]):(.+)$/) || []) as string[];
        return matched ? [key, value] : null;
        // @ts-ignore
      }).mapToMap(([key]) => key, ([, value]) => value),
      config.url,
      config.timeout,
      config.data,
    );
  }
}

export class PrettyAxiosResponse {
  status: Optional<number>
  statusText: Optional<string>
  headers: AxiosResponseHeaders
  data: Optional<unknown>

  constructor(status: Optional<number> = undefined,
    statusText: Optional<string> = undefined,
    headers: AxiosResponseHeaders = {},
    data: Optional<unknown> = undefined) {
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.data = data;
  }

  static fromError({ response }: AxiosError) {
    if (!response) return new PrettyAxiosResponse();
    return new PrettyAxiosResponse(
      response.status,
      response.statusText,
      response.headers,
      response.data,
    );
  }
}

export class PrettyAxiosError {
  error: Optional<unknown>
  code: Optional<string>
  request: PrettyAxiosRequest
  response: PrettyAxiosResponse

  constructor(
    request: PrettyAxiosRequest, response: PrettyAxiosResponse,
    error: Optional<unknown> = undefined, code: Optional<string> = undefined,
  ) {
    this.error = error;
    this.code = code;
    this.request = request;
    this.response = response;
  }

  toStringReport(): string {
    // @ts-ignore
    const tableOf = (val) => {
      const headers = Object.entries(val || {});
      // @ts-ignore
      const maxLength = headers.map(([key]) => key).max((item) => item.length);
      return headers.map(([key, value]) => `| ${sizeFixedString(key, maxLength, 'right')} | ${value}`).join('\n');
    };

    const { code, request, response } = this;

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

  static fromError(error: AxiosError): PrettyAxiosError {
    return new PrettyAxiosError(
      PrettyAxiosRequest.fromError(error),
      PrettyAxiosResponse.fromError(error),
      error,
      error.code,
    );
  }
}

export class AxiosConfiguration {
  errorHandlers: Array<(error: PrettyAxiosError | BusinessError) => void> = []
}

const axiosConfiguration = new AxiosConfiguration();

export default function () {
  axios.interceptors.response.use((response) => {
    if (!response) return Promise.reject(new Error('Could not get axios response.'));

    const { data } = response;
    if (isJsonResponse(response) && data.error) {
      const error = new BusinessError(data);
      for (const errorHandler of axiosConfiguration.errorHandlers) errorHandler(error);
      return Promise.reject(error);
    }

    return Promise.resolve(response);
  }, (error: AxiosError) => Promise.reject((() => {
    const pretty = PrettyAxiosError.fromError(error);
    for (const errorHandler of axiosConfiguration.errorHandlers) errorHandler(pretty);
    return pretty;
  })()));

  axios.defaults.timeout = 10000;

  return axios;
}
