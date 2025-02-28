import React, { useEffect, useState } from "react";
import Sidebar from "@/Components/Sidebar";
import MainPlayground from "@/Components/MainPlayground";

export default function TeaHub() {
    const [chatrooms, setChatrooms] = useState([
        { id: 1, name: "Tech Talk" },
        { id: 2, name: "Gaming Hub" },
    ]);

    const [publicChatrooms, setPublicChatrooms] = useState([
        {
            id: 3,
            name: "Anime Lovers",
            description: "Chat about your favorite anime!",
        },
        { id: 4, name: "Sports Fans", description: "Talk about sports news." },
    ]);

    const handleCreateChatroom = () => {
        const newChatroom = { id: Date.now(), name: "New Chatroom" };
        setChatrooms([...chatrooms, newChatroom]);
    };

    const handleJoinChatroom = (id) => {
        alert(`Joined chatroom ${id}!`);
    };

    return (
        <div className="flex h-screen">
            <Sidebar
                chatrooms={chatrooms}
                onCreateChatroom={handleCreateChatroom}
            />
            <MainPlayground
                publicChatrooms={publicChatrooms}
                onJoinChatroom={handleJoinChatroom}
            />
        </div>
    );
}
