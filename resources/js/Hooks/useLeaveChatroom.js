// useLeaveChatroom.js
import { useState } from "react";
import ChatService from "@/Services/ChatService";

/**
 * Custom hook to manage chatroom leaving functionality
 *
 * @param {number} chatRoomId - The ID of the chatroom
 * @param {Function} onLeave - Callback function when leaving is successful
 * @param {Function} handleBackToPlayground - Function to navigate back to the playground
 * @returns {Object} State and functions for chatroom leaving
 */
export function useLeaveChatroom(chatRoomId, onLeave, handleBackToPlayground) {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leavingInProgress, setLeavingInProgress] = useState(false);

    // Open the confirmation modal
    const confirmLeaveChatroom = () => {
        setShowLeaveModal(true);
    };

    // Handle the actual leave operation
    const handleLeaveChatroom = async () => {
        setLeavingInProgress(true);
        try {
            await ChatService.leaveChatroom(chatRoomId);

            if (onLeave) {
                onLeave();
            }

            // Navigate back to playground
            handleBackToPlayground();
        } catch (error) {
            console.error("Error leaving chatroom:", error);
        } finally {
            setLeavingInProgress(false);
            setShowLeaveModal(false);
        }
    };

    return {
        showLeaveModal,
        setShowLeaveModal,
        leavingInProgress,
        confirmLeaveChatroom,
        handleLeaveChatroom,
    };
}
