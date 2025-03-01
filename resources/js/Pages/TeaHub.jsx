import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/Components/Layout/Sidebar";
import MainPlayground from "@/Components/Layout/MainPlayground";
import CreateChatroomModal from "@/Components/Modals/CreateChatroomModal";
import ProfileModal from "@/Components/Modals/ProfileModal";
import { ChatProvider } from "@/Contexts/ChatContext";
import toast, { Toaster } from "react-hot-toast";

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

    // Set up Echo listeners for global updates
    useEffect(() => {
        if (!window.Echo || !currentUser) return;

        // Set up a channel to listen for general updates
        const channel = window.Echo.private(`user.${currentUser.id}`);

        // Listen for personal user notifications
        channel.listen("PersonalNotification", (e) => {
            console.log("User notification received:", e);

            // Show a toast notification based on the type
            toast(e.message, {
                icon: getNotificationIcon(e.type),
                duration: 3000,
            });
        });

        // Cleanup function
        return () => {
            channel.stopListening("PersonalNotification");
        };
    }, [currentUser]);

    // Helper function to get icon for different notification types
    const getNotificationIcon = (type) => {
        switch (type) {
            case "success":
                return "✅";
            case "error":
                return "❌";
            case "warning":
                return "⚠️";
            case "info":
                return "ℹ️";
            default:
                return "📢";
        }
    };

    // Fetch on component mount
    useEffect(() => {
        fetchUserData();
        fetchChatrooms();

        // Set up periodic refresh (every 30 seconds)
        const timer = setInterval(() => {
            if (!selectedChatroom) {
                // Only auto-refresh when not in a chatroom
                fetchChatrooms();
            }
        }, 30000);

        return () => {
            clearInterval(timer);
        };
    }, [selectedChatroom]);

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
            // Create a copy with updated member count
            // const updatedRoom = {
            //     ...selectedRoom,
            //     member_count: selectedRoom.member_count + 1,
            // };
            setSelectedChatroom(selectedRoom);

            // Add to joined chatrooms if not already there
            if (!chatrooms.some((room) => room.id === chatroomId)) {
                setChatrooms([...chatrooms, selectedRoom]);
            }
        }
    };

    const handleEnterChatroom = (chatroomId) => {
        const selectedRoom = chatrooms.find((r) => r.id === chatroomId);
        if (selectedRoom) {
            setSelectedChatroom(selectedRoom);
        }
    };

    const handleBackToPlayground = () => {
        setSelectedChatroom(null);
        fetchChatrooms();
    };

    return (
        <ChatProvider currentUser={currentUser}>
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                        style: {
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            color: "#4a4e69",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                            maxWidth: "350px", // Prevents overly wide toasts
                            width: "auto", // Adapts width dynamically
                            minWidth: "150px", // Avoids shrinking too much
                            textAlign: "left", // Keeps text aligned naturally
                            padding: "12px 0px 12px 33px", // Keeps spacing balanced
                            fontSize: "16px",
                            fontWeight: "500",
                        },
                    }}
                />
                <Sidebar
                    chatrooms={chatrooms}
                    onCreateChatroom={handleCreateChatroom}
                    onEditProfile={handleEditProfile}
                    onClickChatroom={handleEnterChatroom}
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
                        joinedChatrooms={chatrooms}
                        onJoinChatroom={handleJoinChatroom}
                        onEnterChatroom={handleEnterChatroom}
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
        </ChatProvider>
    );
}
