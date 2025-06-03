// src/api.js
import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:8000/api", 
});

api.interceptors.request.use((config) => {
  const token = getToken();
  console.log
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
