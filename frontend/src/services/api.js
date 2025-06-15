import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.error || error.message || "Something went wrong",
    };
  }
};

export const authAPI = {
  login: async (username, password) => {
    return handleApiCall(async () => {
      const response = await api.post("/login", { username, password });
      return response.data;
    });
  },

  register: async (username, password) => {
    return handleApiCall(async () => {
      const response = await api.post("/register", { username, password });
      return response.data;
    });
  },
};

export const userAPI = {
  getUsers: async () => {
    return handleApiCall(async () => {
      const response = await api.get("/users");
      return response.data;
    });
  },

  searchUser: async (username) => {
    return handleApiCall(async () => {
      const response = await api.get(`/users/search/${username}`);
      return response.data;
    });
  },
};

export const chatAPI = {
  getChats: async () => {
    return handleApiCall(async () => {
      const response = await api.get("/chats");
      return response.data;
    });
  },

  createChatByUsernames: async (name, usernames = [], isGroup = false) => {
    return handleApiCall(async () => {
      const response = await api.post("/chats/by-usernames", {
        name,
        usernames,
        is_group: isGroup || usernames.length > 1, // Автоматически делаем групповым если больше 1 пользователя
      });
      return response.data;
    });
  },

  createChatWithUser: async (username) => {
    return handleApiCall(async () => {
      const response = await api.post("/chats/with-user", { username });
      return response.data;
    });
  },

  getMessages: async (chatId) => {
    return handleApiCall(async () => {
      const response = await api.get(`/chats/${chatId}/messages`);
      return response.data;
    });
  },

  sendMessage: async (chatId, text) => {
    return handleApiCall(async () => {
      const response = await api.post(`/chats/${chatId}/messages`, { text });
      return response.data;
    });
  },

  deleteChat: async (chatId) => {
    return handleApiCall(async () => {
      const response = await api.delete(`/chats/${chatId}`);
      return response.data;
    });
  },
};

export const loginUser = (username, password) =>
  authAPI.login(username, password);
export const registerUser = (username, password) =>
  authAPI.register(username, password);

export default api;
