import axios from 'axios';

const get = async (config) => {
  if (window.electron) {
    if (window.electron.ipcRenderer) {
      const render = window.electron.ipcRenderer;
      const response = await render.invoke('request', config);
      return response;
    }
  }
  const response = await axios.request(config);
  return response;
};

export default {
  request: async (config) => {
    const response = await get(config);
    return response;
  },
};
