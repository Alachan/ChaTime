import axios from "axios";

window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

window.axios.defaults.withCredentials = true; // Allow authentication via cookies

// Retrieve token from localStorage
const token = localStorage.getItem("auth_token");

if (token) {
    window.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Ensure token is set on every request
axios.interceptors.request.use(
    (request) => {
        const storedToken = localStorage.getItem("auth_token");
        if (storedToken) {
            request.headers["Authorization"] = `Bearer ${storedToken}`;
        }
        return request;
    },
    (error) => Promise.reject(error)
);
