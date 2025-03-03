import { useState, useEffect } from "react";
import ChatService from "@/Services/ChatService";

export function useMessageFetching(chatRoomId, showHistorical = false) {
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [oldestMessageId, setOldestMessageId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch initial messages
    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await ChatService.getMessages(chatRoomId, {
                page_size: 50,
                show_historical: showHistorical,
            });

            const data = response.data;
            setMessages(data.messages || []);
            setHasMoreMessages(data.has_more || false);
            setOldestMessageId(data.oldest_id);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load older messages for pagination
    const loadMoreMessages = async () => {
        if (!hasMoreMessages || !oldestMessageId || loadingMore) return;

        setLoadingMore(true);
        try {
            const response = await ChatService.getMessages(chatRoomId, {
                before_id: oldestMessageId,
                page_size: 30,
                show_historical: showHistorical,
            });

            const data = response.data;
            setMessages((prevMessages) => [
                ...(data.messages || []),
                ...prevMessages,
            ]);
            setHasMoreMessages(data.has_more || false);
            setOldestMessageId(data.oldest_id);
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Reset and fetch messages when room changes or historical setting changes
    useEffect(() => {
        if (chatRoomId) {
            setMessages([]);
            setHasMoreMessages(false);
            setOldestMessageId(null);
            fetchMessages();
        }
    }, [chatRoomId, showHistorical]);

    return {
        messages,
        setMessages,
        loading,
        loadingMore,
        hasMoreMessages,
        oldestMessageId,
        loadMoreMessages,
        fetchMessages,
    };
}
