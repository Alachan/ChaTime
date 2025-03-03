import axios from "axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Set up Pusher globally for Echo
window.Pusher = Pusher;

// Initialize Echo
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
});

// ✅ Set Axios as default for all requests
window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;

// ✅ Ensure Axios always has the Bearer token and Socket ID
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        // Attach Socket ID to all requests - this is what makes toOthers() work!
        if (window.Echo && window.Echo.socketId()) {
            config.headers["X-Socket-ID"] = window.Echo.socketId();
        }

        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
