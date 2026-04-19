import api from "./api";

const authService = {
  register: (data) => api.post("/auth/register/", data),

  login: async (email, password) => {
    const res = await api.post("/auth/login/", { email, password });
    const { access, refresh, user } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));
    return res.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      await api.post("/auth/logout/", { refresh });
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (data) => api.patch("/auth/profile/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("access_token"),
};

export default authService;