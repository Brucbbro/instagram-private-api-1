import axios from 'react-native-axios';
import utils from '../utils';
import defaultHeaders from '../sources/defaultHeaders';
import getFeedByHashtag from '../sources/getFeedByHashtag';
import getSelfFeed from '../sources/getSelfFeed';
import debug from 'debug';

const http = (state) => ({
  /**
   * This will load instagram's main page, and extract csrf and mid tokens from
   * response headers. Those tokens will be required for most api calls.
   */
  grabTokens: () => {
    const extractTokens = (res) => {
      const csrf = utils.extract('csrftoken', res.headers['set-cookie']);
      const mid = utils.extract('mid', res.headers['set-cookie']);

      if (csrf.length < 1 || mid.length < 1) {
        throw new Error('Tokens were not parsed');
      }

      return { csrf: csrf[0], mid: mid[0] };
    };

    return axios
      .create({ baseURL: 'https://instagram.com/', headers: state.headers })
      .request({ method: 'get', url: '/' })
      .then(extractTokens)
      .catch(() => false);
  },

  /**
   * Perform authorisation with provided username/password parameters on instagram
   *
   * @param username
   * @param password
   */
  auth: (username, password) => {
    const { csrf, mid } = state;
    const headers = state.authHeaders({ csrf, mid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      const sessionid = utils.extract('sessionid', res.headers['set-cookie']);
      const newcsrf = utils.extract('csrftoken', res.headers['set-cookie']);

      if (newcsrf.length < 1 || sessionid.length < 1) {
        throw new Error('No session id was parsed');
      }

      state.debug(res.data);
      return { csrf: newcsrf[0], sessionid: sessionid[0] };
    };

    const data = `username=${username}&password=${password}`;

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: '/accounts/login/ajax/', data })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },

  /**
   * Set like for selected media
   *
   * @param mediaId
   */
  setLike: (mediaId) => {
    const { csrf, mid, sessionid } = state;
    const headers = state.authHeaders({ csrf, mid, sessionid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      if (res.data.status !== 'ok') {
        throw new Error(res.data);
      }

      state.debug(res.data);
      return res.data;
    };

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: `/web/likes/${mediaId}/like/` })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },

  /**
   * Set comment on selected media
   *
   * @param mediaId
   * @param text
   */
  setComment: (mediaId, text) => {
    const comment = encodeURIComponent(text);
    const { csrf, mid, sessionid } = state;
    const headers = state.authHeaders({ csrf, mid, sessionid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      if (res.data.status !== 'ok') {
        throw new Error(res.data);
      }

      state.debug(res.data);
      return res.data;
    };

    const data = `comment_text=${comment}`;

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: `/web/comments/${mediaId}/add/`, data })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },

  /**
   * Follow selected user
   *
   * @param userId
   */
  setFollow: (userId) => {
    const { csrf, mid, sessionid } = state;
    const headers = state.authHeaders({ csrf, mid, sessionid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      if (res.data.status !== 'ok') {
        throw new Error(res.data);
      }

      state.debug(res.data);
      return res.data;
    };

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: `/web/friendships/${userId}/follow/` })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },

  /**
   * Unfollow selected user
   *
   * @param userId
   */
  unsetFollow: (userId) => {
    const { csrf, mid, sessionid } = state;
    const headers = state.authHeaders({ csrf, mid, sessionid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      if (res.data.status !== 'ok') {
        throw new Error(res.data);
      }

      state.debug(res.data);
      return res.data;
    };

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: `/web/friendships/${userId}/unfollow/` })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },

  getSelfFeed: (startCursor, count) => {
    const { csrf, mid, sessionid } = state;
    const headers = state.authHeaders({ csrf, mid, sessionid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      if (res.data.status !== 'ok') {
        throw new Error(res.data);
      }

      state.debug(res.data);
      return res.data;
    };

    const data = state.queries.getSelfFeed
      .replace('{{start_cursor}}', startCursor)
      .replace('{{count}}', count);

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: `/query/`, data })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },

  getFeedByHashtag: (hashtag, startCursor, count) => {
    const { csrf, mid, sessionid } = state;
    const headers = state.authHeaders({ csrf, mid, sessionid });

    const handleResponse = (res) => {
      if (res.status !== 200) {
        throw new Error(res.data);
      }

      if (res.data.status !== 'ok') {
        throw new Error(res.data);
      }

      state.debug(res.data);
      return res.data;
    };

    const data = state.queries.getFeedByHashtag
      .replace('{{hashtag}}', hashtag)
      .replace('{{start_cursor}}', startCursor)
      .replace('{{count}}', count);

    return axios
      .create({ baseURL: 'https://www.instagram.com/', headers })
      .request({ method: 'post', url: `/query/`, data })
      .then(handleResponse)
      .catch((err) => { state.debug(err); return false; });
  },
});

/**
 * Composition class
 *
 * @param csrf
 * @param mid
 * @param sessionid
 */
const Class = (res = {}) => {
  const authHeaders = ({ csrf, mid, sessionid }) => ({
    'X-CSRFToken': `${csrf}`,
    Cookie: `mid=${mid}; csrftoken=${csrf}; sessionid=${sessionid};`,
    Referer: 'https://www.instagram.com/',
  });

  const generateAuthHeaders = (authHeadersGenerator, headers, authTokens) => {
    return Object.assign({}, headers || {}, authHeadersGenerator(authTokens));
  };

  const state = Object.assign({}, res, {
    headers: defaultHeaders,
    authHeaders: generateAuthHeaders.bind(null, authHeaders, defaultHeaders),
    debug: debug('http'),
    queries: {
      getSelfFeed,
      getFeedByHashtag,
    },
  });

  return Object.assign(
    {},
    http(state)
  );
};

export default Class;
