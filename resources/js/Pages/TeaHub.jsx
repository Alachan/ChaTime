import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import MainPlayground from "@/Components/MainPlayground";
import CreateChatroomModal from "@/Components/CreateChatroomModal";
import ProfileModal from "@/Components/ProfileModal";

export default function TeaHub() {
    const [chatrooms, setChatrooms] = useState([]);
    const [publicChatrooms, setPublicChatrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChatroom, setSelectedChatroom] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Profile related states
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const response = await axios.get("/api/user");
            setCurrentUser(response.data.user);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    // Fetch user's joined chatrooms and public chatrooms on component mount
    const fetchChatrooms = async () => {
        setLoading(true);
        try {
            // Use our actual API endpoints
            const [joinedResponse, publicResponse] = await Promise.all([
                axios.get("/api/chatrooms/joined"),
                axios.get("/api/chatrooms/public"),
            ]);

            setChatrooms(joinedResponse.data || []);
            setPublicChatrooms(publicResponse.data || []);
        } catch (error) {
            console.error("Failed to fetch chatrooms:", error);

            // Only use fallback data if we have no real data yet
            if (chatrooms.length === 0) {
                setChatrooms([
                    { id: 1, name: "Tech Talk", lastActivity: new Date() },
                    { id: 2, name: "Gaming Hub", lastActivity: new Date() },
                ]);
            }

            if (publicChatrooms.length === 0) {
                setPublicChatrooms([
                    {
                        id: 3,
                        name: "Anime Lovers",
                        description: "Chat about your favorite anime!",
                        member_count: 42,
                    },
                    {
                        id: 4,
                        name: "Sports Fans",
                        description: "Talk about sports news.",
                        member_count: 56,
                    },
                    {
                        id: 5,
                        name: "Music Appreciation",
                        description: "Share and discuss your favorite tunes",
                        member_count: 38,
                    },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch on component mount
    useEffect(() => {
        fetchUserData();
        fetchChatrooms();
    }, []);

    // Function to close sidebar
    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleProfileUpdate = (updatedUser) => {
        // Update the user state with the new data
        setCurrentUser(updatedUser);
    };

    const handleEditProfile = () => {
        setProfileModalOpen(true);
        closeSidebar();
    };

    const handleCreateChatroom = () => {
        setCreateModalOpen(true);
        closeSidebar();
    };

    const handleChatroomCreated = (newChatroom) => {
        // Add the new chatroom to the list
        setChatrooms((prevChatrooms) => [...prevChatrooms, newChatroom]);

        // Automatically select and enter the new chatroom
        setSelectedChatroom(newChatroom);
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

    const handleBackToPlayground = () => {
        setSelectedChatroom(null);
        fetchChatrooms();
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar
                chatrooms={chatrooms}
                onCreateChatroom={handleCreateChatroom}
                onEditProfile={handleEditProfile}
                user={currentUser}
                sidebarControl={{
                    isOpen: sidebarOpen,
                    toggle: () => setSidebarOpen(!sidebarOpen),
                    close: () => setSidebarOpen(false),
                }}
            />
            <main className="flex-1">
                <MainPlayground
                    publicChatrooms={publicChatrooms}
                    onJoinChatroom={handleJoinChatroom}
                    selectedChatroom={selectedChatroom}
                    currentUser={currentUser}
                    handleBackToPlayground={handleBackToPlayground}
                />
            </main>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                user={currentUser}
                onProfileUpdate={handleProfileUpdate}
            />

            {/* Create Chatroom Modal */}
            <CreateChatroomModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onChatroomCreated={handleChatroomCreated}
            />
        </div>
    );
}
