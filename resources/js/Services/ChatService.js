import axios from "axios";

/**
 * Service for handling all chat-related API requests
 */
export default {
    /**
     * Get all chatrooms
     *
     * @returns {Promise} - API response
     */
    getAllChatrooms() {
        return axios.get("/api/chatrooms");
    },

    /**
     * Get all chatrooms the user has joined
     *
     * @returns {Promise} - API response
     */
    getJoinedChatrooms() {
        return axios.get("/api/chatrooms/joined");
    },

    /**
     * Create a chatroom
     *
     * @param {Object} formData - The form data containing chatroom details
     * @param {string} formData.name - The name of the chatroom
     * @param {string} formData.description - The description of the chatroom
     * @param {string|null} [formData.password=null] - The password for the chatroom (optional)
     * @returns {Promise} - API response
     */
    createChatroom({ name, description, password = null }) {
        return axios.post("/api/chatrooms", {
            name,
            description,
            password,
        });
    },

    /**
     * Join a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @param {string|null} [password=null] - The password for the chatroom
     * @returns {Promise} - API response
     */
    joinChatroom(chatRoomId, password = null) {
        return axios.post("/api/chatrooms/join", {
            chat_room_id: chatRoomId,
            password: password,
        });
    },

    /**
     * Leave a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @returns {Promise} - API response
     */
    leaveChatroom(chatRoomId) {
        return axios.post("/api/chatrooms/leave", {
            chat_room_id: chatRoomId,
        });
    },

    /**
     * Get messages for a specific chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @param {Object} params - Query parameters
     * @returns {Promise} - API response
     */
    getMessages(chatRoomId, params = {}) {
        return axios.get(`/api/messages/${chatRoomId}`, { params });
    },

    /**
     * Send a message to a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @param {string} message - The message content
     * @returns {Promise} - API response
     */
    sendMessage(chatRoomId, message) {
        return axios.post("/api/messages", {
            chat_room_id: chatRoomId,
            message,
        });
    },

    /**
     * Edit a message
     *
     * @param {number} messageId - The ID of the message to edit
     * @param {string} newMessage - The new message content
     * @returns {Promise} - API response
     */
    editMessage(messageId, newMessage) {
        return axios.post(`/api/messages/${messageId}`, {
            message: newMessage,
        });
    },

    /**
     * Delete a message
     *
     * @param {number} messageId - The ID of the message
     * @returns {Promise} - API response
     */
    deleteMessage(messageId) {
        return axios.delete(`/api/messages/${messageId}`);
    },

    /**
     * Send a typing event to a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @returns {Promise} - API response
     */
    sendTypingEvent(chatRoomId) {
        return axios.post("/api/chatrooms/typing", {
            chat_room_id: chatRoomId,
        });
    },
};
