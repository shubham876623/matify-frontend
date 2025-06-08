import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;


const api = axios.create({
  baseURL,
  withCredentials: true       
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

api.interceptors.request.use(async (config) => {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh");

  if (!access || !refresh) return config;

  const payload = JSON.parse(atob(access.split(".")[1]));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now + 30) {
    try {
      const response = await axios.post(`${baseURL}/auth/jwt/refresh/`, {
        refresh,
      });

      access = response.data.access;
      localStorage.setItem("access_token", access);
    } catch (err) {
      console.error("Refresh token expired. Logging out...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }
  }

  config.headers.Authorization = `Bearer ${access}`;
  return config;
});

export default api;
