import React, { useState } from "react";
import axios from "axios";
import Chatroom from "../Chatroom/Chatroom";
import ChatroomCard from "../Chatroom/ChatroomCard";
import PasswordModal from "../Modals/PasswordModal";

export default function MainPlayground({
    allChatrooms,
    joinedChatrooms,
    onJoinChatroom,
    onEnterChatroom,
    onLeaveChatroom,
    selectedChatroom,
    currentUser,
    handleBackToPlayground,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [selectedPrivateRoom, setSelectedPrivateRoom] = useState(null);

    // Filter chatrooms based on search term
    const filteredChatrooms = allChatrooms.filter(
        (room) =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.description &&
                room.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
    );

    // Handle joining a chatroom
    const handleJoinAttempt = async (roomId) => {
        const room = allChatrooms.find((r) => r.id === roomId);

        // If the room is private, we need to prompt for password
        if (room && room.is_private) {
            setSelectedPrivateRoom(room);
            return;
        }

        // Otherwise, proceed with joining
        await joinChatroom(roomId);
    };

    // Join chatroom with or without password
    const joinChatroom = async (roomId, password = null) => {
        setJoinLoading(true);
        setJoinError(null);

        try {
            await axios.post("/api/join-chatroom", {
                chat_room_id: roomId,
                password: password,
            });

            // Close password modal if it was open
            setSelectedPrivateRoom(null);
            setPasswordInput("");

            // Notify parent component
            onJoinChatroom(roomId);
        } catch (error) {
            console.error("Error joining chatroom:", error);

            if (error.response?.status === 403) {
                setJoinError("Incorrect password");
            } else {
                setJoinError("Failed to join chatroom. Please try again.");
            }
        } finally {
            setJoinLoading(false);
        }
    };

    // Handle password submission for private rooms
    const handlePasswordSubmit = () => {
        if (!selectedPrivateRoom) return;
        joinChatroom(selectedPrivateRoom.id, passwordInput);
    };

    // Handle closing the password modal
    const closePasswordModal = () => {
        setSelectedPrivateRoom(null);
        setPasswordInput("");
        setJoinError(null);
    };

    // Handle leaving a chatroom
    const handleLeaveChatroom = () => {
        // Notify parent component to clear the selected chatroom
        if (onLeaveChatroom) {
            onLeaveChatroom(selectedChatroom);
        }
    };

    // If a chatroom is selected, show the dedicated ChatroomInterface component
    if (selectedChatroom) {
        return (
            <Chatroom
                chatroom={selectedChatroom}
                user={currentUser}
                onLeave={handleLeaveChatroom}
                handleBackToPlayground={handleBackToPlayground}
            />
        );
    }

    // Default view - Hub for Chatrooms
    return (
        <div className="p-6">
            {/* Password Modal for Private Rooms */}
            <PasswordModal
                isOpen={selectedPrivateRoom !== null}
                onClose={closePasswordModal}
                onSubmit={handlePasswordSubmit}
                roomName={selectedPrivateRoom?.name || ""}
                loading={joinLoading}
                error={joinError}
                passwordInput={passwordInput}
                setPasswordInput={setPasswordInput}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-center text-2xl font-bold mb-2 md:mb-0">
                    Chatrooms - Start Brewing!
                </h2>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search chatrooms..."
                        className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {(searchTerm === "" ? allChatrooms : filteredChatrooms).length ===
            0 ? (
                <div className="text-center py-8">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <p className="mt-2 text-secondary">
                        {searchTerm === ""
                            ? "No public chatrooms available"
                            : `No chatrooms found matching "${searchTerm}"`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(searchTerm === "" ? allChatrooms : filteredChatrooms).map(
                        (room) => (
                            <ChatroomCard
                                key={room.id}
                                room={room}
                                onJoinAttempt={handleJoinAttempt}
                                onEnterChatroom={onEnterChatroom}
                                joinedChatrooms={joinedChatrooms}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}
