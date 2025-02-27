import React, { useEffect, useState } from "react";
import Sidebar from "@/Components/Sidebar";
import MainPlayground from "@/Components/MainPlayground";
import axios from "axios";

export default function TeaHub() {
    const [chatrooms, setChatrooms] = useState([]);
    const [publicChatrooms, setPublicChatrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChatroom, setSelectedChatroom] = useState(null);

    // Fetch user's joined chatrooms and public chatrooms on component mount
    useEffect(() => {
        const fetchChatrooms = async () => {
            try {
                // Example API calls - update with your actual endpoints
                const joinedResponse = await axios.get("/api/chatrooms/joined");
                const publicResponse = await axios.get("/api/chatrooms/public");

                setChatrooms(joinedResponse.data || []);
                setPublicChatrooms(publicResponse.data || []);
            } catch (error) {
                console.error("Failed to fetch chatrooms:", error);
                // Fallback to dummy data if API not implemented yet
                setChatrooms([
                    { id: 1, name: "Tech Talk", lastActivity: new Date() },
                    { id: 2, name: "Gaming Hub", lastActivity: new Date() },
                ]);
                setPublicChatrooms([
                    {
                        id: 3,
                        name: "Anime Lovers",
                        description: "Chat about your favorite anime!",
                        memberCount: 42,
                    },
                    {
                        id: 4,
                        name: "Sports Fans",
                        description: "Talk about sports news.",
                        memberCount: 56,
                    },
                    {
                        id: 5,
                        name: "Music Appreciation",
                        description: "Share and discuss your favorite tunes",
                        memberCount: 38,
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchChatrooms();
    }, []);

    const handleCreateChatroom = () => {
        // TODO: Replace with modal or redirect to create chatroom page
        const name = prompt("Enter chatroom name:");
        if (name) {
            const newChatroom = {
                id: Date.now(),
                name,
                lastActivity: new Date(),
            };
            setChatrooms([...chatrooms, newChatroom]);
        }
    };

    const handleJoinChatroom = (chatroomId) => {
        const selectedRoom = publicChatrooms.find(
            (room) => room.id === chatroomId
        );
        if (selectedRoom) {
            setSelectedChatroom(selectedRoom);
            // TODO: Implement actual joining logic with API call

            // Add to joined chatrooms if not already there
            if (!chatrooms.some((room) => room.id === chatroomId)) {
                setChatrooms([...chatrooms, selectedRoom]);
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar
                chatrooms={chatrooms}
                onCreateChatroom={handleCreateChatroom}
            />
            <main className="flex-1">
                <MainPlayground
                    publicChatrooms={publicChatrooms}
                    onJoinChatroom={handleJoinChatroom}
                    selectedChatroom={selectedChatroom}
                />
            </main>
        </div>
    );
}
