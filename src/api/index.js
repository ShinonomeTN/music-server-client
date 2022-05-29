import appConfig from '@/config';
import { BusinessError } from '@/common/business-error';
import configureAxios from '@/common/axios-config';

// eslint-disable-next-line no-undef
// noinspection JSUnresolvedVariable
const $axios = (() => {
  if (!appConfig.isWeb) return ((request) => window.$native('axios', request));
  const axios = configureAxios();
  return (request) => axios(request);
})();

// noinspection JSValidateTypes
/**
 * @typedef { Object } ApiStorage
 * @property { String } serverUrl server url
 * @property { String } token access token
 */
const config = {
  apiScopes: [
    'create_playlist',
    'read_playlist',
    'update_playlist',
    'delete_playlist',
    'admin_cover_management',
    'admin_track_management',
    'admin_recording_management',
    'admin_album_management',
    'admin_artist_management',
    'user_info',
    'admin_user_management',
  ],
  /** @type { ApiStorage } */ storage: new Proxy({}, {
    get: (_, prop) => localStorage.getItem(`api.info.${prop}`) || null,
    set: (_, prop, value) => {
      localStorage.setItem(`api.info.${prop}`, value);
      return true;
    },
  }),
  loginPageUrl() {
    return `${this.storage.serverUrl}/api/auth`;
  },
  coverArtUrlOf(filePath) {
    if (appConfig.isWeb) return `/api/cover-art/${filePath}`;
    const { serverUrl } = this.storage;
    if (!serverUrl) return null;
    return `${serverUrl}/api/cover-art/${filePath}`;
  },
};

function composeRequestUrl(location) {
  let newLocation = location;
  if (!newLocation.startsWith('/')) newLocation = `/${location}`;
  if (appConfig.isWeb) return newLocation;
  const { serverUrl } = config.storage;
  if (!serverUrl) throw new BusinessError({ error: 'no_server_address_config', message: 'server_address_not_configured' });
  return `${serverUrl}${newLocation}`;
}

const defaultHeaders = {};

function computeHeaders() {
  if (appConfig.isWeb) return defaultHeaders;
  const headers = { ...defaultHeaders };
  const { token } = config.storage;
  if (token) { headers['X-APP-TOKEN'] = token; }
  return headers;
}

function getRequest(url, additional) {
  const headers = {
    ...(additional ? (additional.headers || {}) : {}),
    ...computeHeaders(),
  };
  const newConfig = additional || {};
  newConfig.headers = null;

  return {
    method: 'get',
    url,
    headers,
    ...additional,
  };
}

function postRequest(url, additional) {
  const headers = {
    ...(additional ? (additional.headers || {}) : {}),
    ...computeHeaders(),
  };
  const newConfig = additional || {};
  newConfig.headers = null;

  return {
    method: 'post',
    url,
    headers,
    ...newConfig,
  };
}

/**
 * @typedef { Object } Page Koemans common database pagination query result
 *
 * @property { number } offset record offset
 * @property { number } size content size per page
 * @property { number } total how many records match current predicate
 * @property { number } totalPageCount total page count
 * @property { number } currentPageIndex current page index
 * @property { boolean } hasTotalItemQuery if this request counting all items that match query predicate
 * @property { boolean } empty if this page is empty
 *
 * @property { boolean } hasNext has next page
 * @property { boolean } hasPrev has previous page
 * @property { Object[] } content page elements
 */
export default {
  config,
  /**
   * Fetch remote music server configuration
   * @param { String } serverAddress remote server address with protocol
   */
  fetchRemoteServerInfo(serverAddress) {
    return $axios(getRequest(`${serverAddress}/.music_server.json`));
  },

  fetchCurrentServerInfo() {
    return $axios(getRequest('.music_server.json'));
  },

  fetchRemoteUserInfo() {
    return $axios(getRequest(composeRequestUrl('api/auth/login')));
  },

  refreshSession() {
    return $axios(postRequest(composeRequestUrl('api/auth/login/refresh')));
  },

  refreshToken() {
    return $axios(postRequest(composeRequestUrl('api/auth/token/refresh')));
  },

  auth_login({ username, password }) {
    const query = new URLSearchParams({
      username, password,
    });
    return $axios(postRequest(composeRequestUrl('api/auth/login'), {
      data: query,
    }));
  },

  /** @return { Page } album page query result */
  album_listAll(params) {
    return $axios(getRequest(
      composeRequestUrl('api/meta/album'),
      {
        params,
      },
    )).then(({ data }) => data);
  },

  /** @return { Page } artist page query result */
  artist_listAll(params) {
    return $axios(getRequest(composeRequestUrl('api/meta/artist'), {
      params,
    })).then(({ data }) => data);
  },

  /** @return { Page } track page query result */
  track_listAll(params) {
    return $axios(getRequest(composeRequestUrl('api/meta/track'), {
      params,
    }));
  },

  /** @return { Page } cover art page query result */
  coverArt_listAll(params) {
    return $axios(getRequest(composeRequestUrl('/api/cover-art'), {
      params,
    })).then(({ data }) => data);
  },
};
