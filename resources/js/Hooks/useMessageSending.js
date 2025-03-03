import { useState, useRef } from "react";
import ChatService from "@/Services/ChatService";

export function useMessageSending(chatRoomId, userId, addMessageToState) {
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Send a message
    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputMessage.trim()) return;

        try {
            const response = await ChatService.sendMessage(
                chatRoomId,
                inputMessage
            );

            // Add to local state immediately
            if (addMessageToState) {
                addMessageToState(response.data);
            }

            setInputMessage("");

            // Clear the typing indicator
            clearTimeout(typingTimeoutRef.current);
            setIsTyping(false);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle input changes and typing events
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        // Only send typing event if not already typing
        if (!isTyping) {
            sendTypingEvent();
            setIsTyping(true);
        }

        // Clear previous timeout
        clearTimeout(typingTimeoutRef.current);

        // Set a new timeout to clear the typing state
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    // Send a typing event
    const sendTypingEvent = async () => {
        try {
            await ChatService.sendTypingEvent(chatRoomId);
        } catch (error) {
            console.error("Error sending typing event:", error);
        }
    };

    // Handle Enter key to send message
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return {
        inputMessage,
        setInputMessage,
        handleInputChange,
        sendMessage,
        handleKeyDown,
    };
}
