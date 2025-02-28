import React, { useState } from "react";
import axios from "axios";
import Chatroom from "./Chatroom";

export default function MainPlayground({
    publicChatrooms,
    onJoinChatroom,
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
    const filteredChatrooms = publicChatrooms.filter(
        (room) =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.description &&
                room.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
    );

    // Handle joining a chatroom
    const handleJoinAttempt = async (roomId) => {
        const room = publicChatrooms.find((r) => r.id === roomId);

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
            const response = await axios.post("/api/join-chatroom", {
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
    const handlePasswordSubmit = (e) => {
        e.preventDefault();

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
        if (onJoinChatroom) {
            onJoinChatroom(null);
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

    // Default view - Public Chatrooms
    return (
        <div className="p-6">
            {/* Password Modal for Private Rooms */}
            {selectedPrivateRoom && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75"
                        onClick={closePasswordModal}
                    ></div>

                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Enter Password
                            </h3>

                            <p className="mb-4 text-gray-600">
                                "{selectedPrivateRoom.name}" is a private
                                chatroom. Please enter the password to join:
                            </p>

                            {joinError && (
                                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
                                    {joinError}
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit}>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) =>
                                        setPasswordInput(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                                    placeholder="Enter password"
                                    required
                                    autoFocus
                                />

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={closePasswordModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                        disabled={joinLoading}
                                    >
                                        {joinLoading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Joining...
                                            </span>
                                        ) : (
                                            "Join"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-center text-2xl font-bold mb-2 md:mb-0">
                    Public Chatrooms
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

            {filteredChatrooms.length === 0 ? (
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
                    <p className="mt-2 text-gray-500">
                        No chatrooms found matching "{searchTerm}"
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredChatrooms.map((room) => (
                        <div
                            key={room.id}
                            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold">
                                    {room.name}
                                </h3>
                                <div className="flex">
                                    {room.is_private && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs mr-2 px-2 py-1 rounded-full flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3 mr-1"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Private
                                        </span>
                                    )}
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                        {room.member_count || 0} members
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 mb-4 h-12 overflow-hidden">
                                {room.description ||
                                    "No description available."}
                            </p>
                            <button
                                className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md transition-colors flex items-center justify-center"
                                onClick={() => handleJoinAttempt(room.id)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
