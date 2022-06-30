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

function processConfig(additional) {
  const headers = {
    ...(additional ? (additional.headers || {}) : {}),
    ...computeHeaders(),
  };
  const newConfig = additional || {};
  newConfig.headers = null;

  return {
    headers,
    ...newConfig,
  };
}

function getRequest(url, additional) {
  return {
    method: 'get',
    url,
    ...processConfig(additional),
  };
}

function postRequest(url, additional) {
  return {
    method: 'post',
    url,
    ...processConfig(additional),
  };
}

function deleteRequest(url, additional) {
  return {
    method: 'delete',
    url,
    ...processConfig(additional),
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
   *
   */
  fetchRemoteServerInfo(serverAddress) {
    return $axios(getRequest(`${serverAddress}/.music_server.json`)).then(({ data }) => data);
  },

  fetchCurrentServerInfo() {
    return $axios(getRequest(composeRequestUrl('.music_server.json'))).then(({ data }) => data);
  },

  fetchRemoteUserInfo() {
    return $axios(getRequest(composeRequestUrl('api/auth/login'))).then(({ data }) => data);
  },

  refreshSession() {
    return $axios(postRequest(composeRequestUrl('api/auth/login/refresh'))).then(({ data }) => data);
  },

  refreshToken(token) {
    return $axios(postRequest(composeRequestUrl('api/auth/token/refresh'), {
      headers: {
        'X-APP-TOKEN': token,
      },
    })).then(({ data }) => data.token);
  },

  auth_login({ username, password }) {
    const query = new URLSearchParams({
      username, password,
    });
    return $axios(postRequest(composeRequestUrl('api/auth/login'), {
      data: query,
    })).then(({ data }) => data);
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

  album_get(id) {
    return $axios(getRequest(
      composeRequestUrl(`api/meta/album/${id}`),
    )).then(({ data }) => data);
  },

  album_create({ title, artistIds, coverArtIds }) {
    const query = new URLSearchParams({ title });
    artistIds.forEach((item) => query.append('albumArtistId', `${item}`));
    coverArtIds.forEach((item) => query.append('albumArtId', `${item}`));
    return $axios(postRequest(composeRequestUrl('api/meta/album'), {
      data: query,
    })).then(({ data }) => data);
  },

  album_tracks(albumId) {
    return $axios(getRequest(composeRequestUrl(`api/meta/album/${albumId}/track`)))
      .then(({ data }) => data);
  },

  album_save(albumId, { title, artistIds, coverArtIds }) {
    const query = new URLSearchParams({ title });
    artistIds.forEach((id) => query.append('albumArtistId', `${id}`));
    coverArtIds.forEach((id) => query.append('albumArtId', `${id}`));
    return $axios(
      postRequest(composeRequestUrl(`api/meta/album/${albumId}`), {
        data: query,
      }),
    ).then(({ data }) => data);
  },

  /** @return { Page } artist page query result */
  artist_listAll(params) {
    return $axios(
      getRequest(composeRequestUrl('api/meta/artist'), {
        params,
      }),
    ).then(({ data }) => data);
  },

  artist_create({ name }) {
    const query = new URLSearchParams({ name });
    return $axios(
      postRequest(composeRequestUrl('api/meta/artist'), {
        data: query,
      }),
    ).then(({ data }) => data);
  },

  /** @return { Page } track page query result */
  track_listAll(params) {
    return $axios(
      getRequest(composeRequestUrl('api/meta/track'), {
        params,
      }),
    ).then(({ data }) => data);
  },

  track_create({ title, artistIds, albumId, diskNumber, trackNumber }) {
    const query = new URLSearchParams({ title, diskNumber, trackNumber, albumId });
    artistIds.forEach((item) => query.append('artistId', `${item}`));
    return $axios(
      postRequest(composeRequestUrl('api/meta/track'), {
        data: query,
      }),
    ).then(({ data }) => data);
  },

  track_delete(id) {
    return $axios(
      deleteRequest(composeRequestUrl(`api/meta/track/${id}`)),
    ).then(({ data }) => data);
  },

  track_update(id, { title, artistIds, albumId, diskNumber, trackNumber }) {
    const query = new URLSearchParams({ title, diskNumber, trackNumber, albumId });
    artistIds.forEach((item) => query.append('artistId', `${item}`));
    return $axios(
      postRequest(composeRequestUrl(`api/meta/track/${id}`), {
        data: query,
      }),
    ).then(({ data }) => data);
  },

  recording_create({ trackId, protocol, server, location }) {
    const query = new URLSearchParams({ protocol, server, location });
    return $axios(
      postRequest(composeRequestUrl(`api/meta/track/${trackId}/recording`), {
        data: query,
      }),
    ).then(({ data }) => data);
  },

  recording_delete(id) {
    return $axios(
      deleteRequest(composeRequestUrl(`api/meta/recording/${id}`)),
    ).then(({ data }) => data);
  },

  recording_update(id, { protocol, server, location }) {
    const query = new URLSearchParams({ protocol, server, location });
    return $axios(
      postRequest(composeRequestUrl(`api/meta/recording/${id}`), {
        data: query,
      }),
    ).then(({ data }) => data);
  },

  /** @return { Page } cover art page query result */
  coverArt_listAll(params) {
    return $axios(getRequest(composeRequestUrl('/api/cover-art'), {
      params,
    })).then(({ data }) => data);
  },

  coverArt_upload(files, onUploadProgress) {
    const form = new FormData();
    files.forEach((file) => form.append('cover_art', file));
    return $axios(postRequest(composeRequestUrl('/api/cover-art'), {
      data: form,
      onUploadProgress,
    })).then(({ data }) => data);
  },

  playlist_listAll() {
    return $axios(getRequest(composeRequestUrl('/api/library/playlist'))).then(({ data }) => data);
  },
};
