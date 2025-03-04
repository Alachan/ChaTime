import axios from "axios";
import { getApiPrefix } from "@/Utils/formatter";
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
        const token = localStorage.getItem("auth_token");

        if (token) {
            return axios.get(`${getApiPrefix()}/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } else {
            return axios.get(`${getApiPrefix()}/user`, {
                withCredentials: true,
            });
        }
    },

    /**
     * Update the current user's profile
     *
     * @param {Object} profileData - The profile data to update
     * @returns {Promise} - API response
     */
    updateProfile(profileData) {
        return axios.post(`${getApiPrefix()}/user/update`, profileData);
    },

    /**
     * Log the user out
     *
     * @returns {Promise} - API response
     */
    logout() {
        return axios.post(`${getApiPrefix()}/logout`);
    },

    /**
     * Login a user
     *
     * @param {Object} credentials - User credentials {email, password}
     * @returns {Promise} - API response with user and token
     */
    login(credentials) {
        return axios.post(`${getApiPrefix()}/login`, credentials, {
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
        return axios.post(`${getApiPrefix()}/register`, userData, {
            withCredentials: true,
        });
    },
};
