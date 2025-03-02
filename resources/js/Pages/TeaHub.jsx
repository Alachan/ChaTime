import { useEffect, useState } from "react";
import UserService from "@/Services/UserService";
import ChatService from "@/Services/ChatService";
import Sidebar from "@/Components/Layout/Sidebar";
import MainPlayground from "@/Components/Layout/MainPlayground";
import CreateChatroomModal from "@/Components/Modals/CreateChatroomModal";
import ProfileModal from "@/Components/Modals/ProfileModal";
import { ChatProvider } from "@/Contexts/ChatContext";
import toast, { Toaster } from "react-hot-toast";
import { getNotificationIcon } from "@/Utils/formatter";

export default function TeaHub() {
    const [joinedChatrooms, setJoinedChatrooms] = useState([]);
    const [allChatrooms, setAllChatrooms] = useState([]);
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
            const response = await UserService.getCurrentUser();
            setCurrentUser(response.data.user);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    // Fetch user's joined chatrooms and all chatrooms on component mount
    const fetchChatrooms = async () => {
        setLoading(true);
        try {
            // Use our actual API endpoints
            const [joinedResponse, allResponse] = await Promise.all([
                ChatService.getJoinedChatrooms(),
                ChatService.getAllChatrooms(),
            ]);

            setJoinedChatrooms(joinedResponse.data || []);
            setAllChatrooms(allResponse.data || []);
        } catch (error) {
            console.error("Failed to fetch chatrooms:", error);
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
        setJoinedChatrooms((prevChatrooms) => [...prevChatrooms, newChatroom]);

        const created = {
            ...newChatroom,
            first_join: true,
        };

        // Automatically select and enter the new chatroom
        setSelectedChatroom(created);
    };

    const handleJoinOrEnterChatroom = (chatroomId) => {
        const selected = allChatrooms.find((room) => room.id === chatroomId);

        const alreadyJoined = joinedChatrooms.some(
            (room) => room.id === chatroomId
        );

        if (alreadyJoined) {
            setSelectedChatroom(selected);
        } else {
            // Create a copy with updated member count
            const updatedRoom = {
                ...selected,
                member_count: selected.member_count + 1,
                first_join: true,
            };

            setJoinedChatrooms([...joinedChatrooms, updatedRoom]);
            setSelectedChatroom(updatedRoom);
        }
    };

    const handleLeaveChatroom = (chatroomId) => {
        setJoinedChatrooms(
            joinedChatrooms.filter((room) => room.id !== chatroomId)
        );
        setSelectedChatroom(null);
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
                    chatrooms={joinedChatrooms}
                    onCreateChatroom={handleCreateChatroom}
                    onEditProfile={handleEditProfile}
                    onClickChatroom={handleJoinOrEnterChatroom}
                    user={currentUser}
                    sidebarControl={{
                        isOpen: sidebarOpen,
                        toggle: () => setSidebarOpen(!sidebarOpen),
                        close: () => setSidebarOpen(false),
                    }}
                />
                <main className="flex-1">
                    <MainPlayground
                        allChatrooms={allChatrooms}
                        joinedChatrooms={joinedChatrooms}
                        onJoinChatroom={handleJoinOrEnterChatroom}
                        onLeaveChatroom={handleLeaveChatroom}
                        onEnterChatroom={handleJoinOrEnterChatroom}
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
