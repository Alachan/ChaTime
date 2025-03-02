import { createContext, useContext, useState, useEffect } from "react";
import ChatService from "@/Services/ChatService";

// Create the context
const ChatContext = createContext();

/**
 * Chat context provider that manages global chat state
 * and provides chat-related functions to child components
 */
export function ChatProvider({ children, currentUser }) {
    // Global state for user cache that persists across chatroom changes
    const [userCache, setUserCache] = useState({});

    /**
     * Ensure we have data for all participants in a chatroom
     *
     * @param {number} chatroomId - The ID of the chatroom
     */
    const loadChatroomMembers = async (chatroomId) => {
        try {
            const response = await ChatService.getChatroomMembers(chatroomId);
            const members = response.data;

            setUserCache((prevCache) => {
                // Create a new cache object with all previous entries
                const updatedCache = { ...prevCache };

                // Only add members that aren't in the cache or need updating
                members.forEach((member) => {
                    if (!member || !member.id) return;

                    const existingMember = updatedCache[member.id];

                    // Add if not in cache, or update if something changed
                    if (
                        !existingMember ||
                        existingMember.name !== member.name ||
                        existingMember.username !== member.username ||
                        existingMember.profile_picture !==
                            member.profile_picture
                    ) {
                        updatedCache[member.id] = member;
                    }
                });

                // Ensure current user has latest data
                if (currentUser && currentUser.id) {
                    updatedCache[currentUser.id] = currentUser;
                }

                return updatedCache;
            });

            return members;
        } catch (error) {
            console.error("Error loading chatroom members:", error);
            return [];
        }
    };

    /**
     * Enrich a message with user data
     *
     * @param {Object} message - The message to enrich
     * @returns {Object} - The enriched message with user data
     */
    const enrichMessageWithUserData = (message) => {
        // If message already has user data, return as is
        if (message.user) return message;

        // If it's the current user's message, use current user data
        if (message.user_id === currentUser?.id) {
            return { ...message, user: currentUser };
        }

        // Otherwise, look up in the cache
        const cachedUser = userCache[message.user_id];
        return {
            ...message,
            user: cachedUser || { id: message.user_id },
        };
    };

    // Context value to be provided
    const contextValue = {
        userCache,
        enrichMessageWithUserData,
        loadChatroomMembers,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
}

/**
 * Custom hook to use the chat context
 */
export function useChatContext() {
    const context = useContext(ChatContext);

    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }

    return context;
}
