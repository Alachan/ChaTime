import axios from "axios";

/**
 * Service for handling all user-related API requests
 */
export default {
    /**
     * Get the currently authenticated user
     *
     * @returns {Promise} - API response with user data
     */
    getCurrentUser() {
        return axios.get("/api/user");
    },

    /**
     * Update the current user's profile
     *
     * @param {Object} profileData - The profile data to update
     * @returns {Promise} - API response
     */
    updateProfile(profileData) {
        return axios.post("/api/user/update", profileData);
    },

    /**
     * Log the user out
     *
     * @returns {Promise} - API response
     */
    logout() {
        return axios.post("/api/logout");
    },

    /**
     * Login a user
     *
     * @param {Object} credentials - User credentials {email, password}
     * @returns {Promise} - API response with user and token
     */
    login(credentials) {
        return axios.post("/api/login", credentials, {
            withCredentials: true,
        });
    },

    /**
     * Register a new user
     *
     * @param {Object} userData - User registration data
     * @returns {Promise} - API response with user and token
     */
    register(userData) {
        return axios.post("/api/register", userData, {
            withCredentials: true,
        });
    },
};
