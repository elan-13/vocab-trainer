import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Error interceptor to normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected network error occurred.';
    let code = 'NETWORK_ERROR';
    let status = 500;

    if (error.response) {
      status = error.response.status;
      const data = error.response.data;
      if (data && typeof data === 'object') {
        message = data.detail || data.message || JSON.stringify(data);
        code = data.code || `HTTP_${status}`;
      } else if (typeof data === 'string') {
        message = data;
      }
    } else if (error.request) {
      message = 'Could not connect to the backend server. Please verify it is running on port 8000.';
      code = 'CONNECTION_REFUSED';
    } else {
      message = error.message;
    }

    const enhancedError = new Error(message);
    enhancedError.code = code;
    enhancedError.status = status;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export const wordsApi = {
  getDueWords: async () => {
    const res = await apiClient.get('/words/due/');
    return res.data;
  },

  createWord: async (wordData) => {
    const res = await apiClient.post('/words/', wordData);
    return res.data;
  },

  reviewWord: async (wordId, score) => {
    const res = await apiClient.post(`/words/${wordId}/review/`, { score });
    return res.data;
  },

  deleteWord: async (wordId) => {
    const res = await apiClient.delete(`/words/${wordId}`);
    return res.data;
  },

  getUpcomingWords: async (limit = 50, offset = 0) => {
    const res = await apiClient.get('/words/upcoming/', {
      params: { limit, offset },
    });
    return res.data;
  },

  getHistory: async (limit = 50, offset = 0) => {
    const res = await apiClient.get('/words/history/', {
      params: { limit, offset },
    });
    return res.data;
  },
};

export default apiClient;
