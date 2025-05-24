// src/api/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; 

// Base POST request helper
const postRequest = async (endpoint, data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    // You can extend this to return error codes/messages
    throw new Error(error.response?.data?.message || "API error");
  }
};

// Exported API functions
export const loginUser = (username, password) =>
  postRequest("/login", { username, password });

export const registerUser = (username, password) =>
  postRequest("/register", { username, password });
