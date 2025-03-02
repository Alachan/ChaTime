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
        // Create a FormData object if there are files to upload
        if (profileData.profile_picture instanceof File) {
            const formData = new FormData();

            // Add all properties to the form data
            Object.keys(profileData).forEach((key) => {
                formData.append(key, profileData[key]);
            });

            return axios.post("/api/user/update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }

        // Regular JSON post if no files
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
        return axios.post(route("api.login"), credentials, {
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
        return axios.post(route("api.register"), userData, {
            withCredentials: true,
        });
    },
};
