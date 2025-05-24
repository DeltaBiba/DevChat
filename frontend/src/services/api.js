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
)



// Authentication API functions
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post("/login", {username, password});
    return response.data
  },
  
  register: async (username, password) => {
    const response = await api.post("/register", { username, password });
    return response.data;
  }
}


// Users API functions
export const userAPI = {
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  
  searchUser: async (username) => {
    const response = await api.get(`/users/search/${username}`);
    return response.data;
  }
}


// Chats API functions
export const chatAPI = {
  getChats: async () => {
    const response = await api.get("/chats");
    return response.data;
  },
  
  createChatByUsernames: async (name, usernames = []) => {
    const response = await api.post("/chats/by-usernames", {
      name, usernames, is_group: usernames.length > 0
    });
    return response.data;
  },
  
  getMessages: async (chatId) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  }
}

export const loginUser = authAPI.login;
export const registerUser = authAPI.register;

export default api;