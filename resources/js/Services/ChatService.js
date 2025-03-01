import axios from "axios";

/**
 * Service for handling all chat-related API requests
 */
export default {
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
        return axios.post("/api/send-message", {
            chat_room_id: chatRoomId,
            message,
        });
    },

    /**
     * Send a typing event to a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @returns {Promise} - API response
     */
    sendTypingEvent(chatRoomId) {
        return axios.post("/api/user-typing", {
            chat_room_id: chatRoomId,
        });
    },

    /**
     * Leave a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @returns {Promise} - API response
     */
    leaveChatroom(chatRoomId) {
        return axios.post("/api/leave-chatroom", {
            chat_room_id: chatRoomId,
        });
    },

    /**
     * Get all members in a chatroom
     *
     * @param {number} chatRoomId - The ID of the chatroom
     * @returns {Promise} - API response
     */
    getChatroomMembers(chatRoomId) {
        return axios.get(`/api/chatrooms/${chatRoomId}/members`);
    },

    /** 
     * Get a user's basic information
     *
     * @param {number} userId - The ID of the user
     * @returns {Promise} - API response
     */
    getUserBasicInfo(userId) {
        return axios.get(`/api/users/${userId}/basic`);
    },
};
