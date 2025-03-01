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

    // Initialize user cache with current user
    useEffect(() => {
        if (currentUser) {
            setUserCache((cache) => ({
                ...cache,
                [currentUser.id]: currentUser,
            }));
        }
    }, [currentUser]);

    /**
     * Add a user to the cache
     *
     * @param {Object} user - The user object to add to cache
     */
    const addUserToCache = (user) => {
        if (user && user.id) {
            setUserCache((cache) => ({
                ...cache,
                [user.id]: user,
            }));
        }
    };

    /**
     * Get a user from the cache, fetching from API if not found
     *
     * @param {number} userId - The ID of the user to get
     * @returns {Promise} - Resolves with the user object
     */
    const getUserData = async (userId) => {
        // If user is in cache, return it
        if (userCache[userId]) {
            return userCache[userId];
        }

        // Otherwise fetch from API
        try {
            const response = await ChatService.getUserBasicInfo(userId);
            const userData = response.data;

            // Add to cache
            addUserToCache(userData);

            return userData;
        } catch (error) {
            console.error(`Error fetching user data for ID ${userId}:`, error);
            return null;
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

    /**
     * Ensure we have data for all participants in a chatroom
     *
     * @param {number} chatroomId - The ID of the chatroom
     */
    const loadChatroomMembers = async (chatroomId) => {
        try {
            const response = await ChatService.getChatroomMembers(chatroomId);
            const members = response.data;

            // Add all participants to cache
            members.forEach((member) => {
                addUserToCache(member);
            });

            return participants;
        } catch (error) {
            console.error("Error loading chatroom members:", error);
            return [];
        }
    };

    // Context value to be provided
    const contextValue = {
        userCache,
        getUserData,
        addUserToCache,
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
