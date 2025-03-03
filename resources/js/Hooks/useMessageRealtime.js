import { useEffect } from "react";

export function useMessageRealtime(chatRoomId, userId, hooks) {
    const { setMessages, setMemberCount, setTypingUsers } = hooks;

    useEffect(() => {
        if (!chatRoomId || !window.Echo) return;

        // Subscribe to the chatroom channel
        const channel = window.Echo.private(`chatroom-${chatRoomId}`);

        // Listen for user joined event
        channel.listen("UserJoinedChat", (e) => {
            console.log("User joined event received:", e);
            setMemberCount(e.member_count);
        });

        // Listen for user left event
        channel.listen("UserLeftChat", (e) => {
            console.log("User left event received:", e);
            setMemberCount(e.member_count);
        });

        // Listen for typing
        channel.listen("UserTyping", (e) => {
            console.log("User typing:", e);

            // Skip if it's the current user
            if (e.user_id === userId) return;

            // Add user to typing users
            setTypingUsers((prev) => ({
                ...prev,
                [e.user_id]: {
                    username: e.username,
                    timestamp: Date.now(),
                },
            }));

            // Remove user after 3 seconds of no typing
            setTimeout(() => {
                setTypingUsers((prev) => {
                    const newTyping = { ...prev };
                    delete newTyping[e.user_id];
                    return newTyping;
                });
            }, 3000);
        });

        // Listen for new messages
        channel.listen("MessageSent", (e) => {
            console.log("Message received:", e);

            // Create message object from the event
            const newMessage = {
                id: e.id,
                user_id: e.user_id,
                message: e.message,
                message_type: e.message_type,
                sent_at: e.sent_at,
                user: e.user,
            };

            // Add the message to the state
            setMessages((prev) => [...prev, newMessage]);
        });

        // Listen for message edits
        channel.listen("MessageEdited", (e) => {
            console.log("Message edited event:", e);

            // Update the message in our state
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === e.id
                        ? { ...msg, message: e.message, edited_at: e.edited_at }
                        : msg
                )
            );
        });

        // Listen for message deletions
        channel.listen("MessageDeleted", (e) => {
            console.log("Message deleted event received:", e);

            setMessages((prevMessages) =>
                prevMessages.filter((msg) => msg.id !== e.id)
            );
        });

        // Cleanup function
        return () => {
            channel.stopListening("UserJoinedChat");
            channel.stopListening("UserLeftChat");
            channel.stopListening("UserTyping");
            channel.stopListening("MessageSent");
            channel.stopListening("MessageEdited");
            channel.stopListening("MessageDeleted");
        };
    }, [chatRoomId, userId]);
}
