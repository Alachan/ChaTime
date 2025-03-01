import axios from "axios";

// ✅ Set Axios as default for all requests
window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;

// ✅ Ensure Axios always has the Bearer token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            console.log("🛠️ Attaching Bearer token:", token);
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        config.withCredentials = true; // Ensures cookies are sent
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to quickly build robust real-time web applications.
 */

import './echo';
