import React, { useState } from "react";

export default function MainPlayground({
    publicChatrooms,
    onJoinChatroom,
    selectedChatroom,
}) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter chatrooms based on search term
    const filteredChatrooms = publicChatrooms.filter(
        (room) =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.description &&
                room.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
    );

    // If a chatroom is selected, show chat interface
    if (selectedChatroom) {
        return (
            <div className="flex flex-col h-screen">
                {/* Chatroom Header */}
                <div className="bg-white border-b md:pl-4 pl-12 py-3 flex items-center justify-evenly md:justify-between shadow-sm">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {selectedChatroom.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {selectedChatroom.description}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 pr-1">
                        <span className="text-sm text-gray-500">
                            {selectedChatroom.memberCount || 0} members
                        </span>
                    </div>
                </div>

                {/* Message Area (Placeholder) */}
                <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-indigo-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                                U
                            </div>
                            <div className="ml-3 bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">
                                    User1
                                </p>
                                <p>Welcome to the chatroom!</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-green-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <div className="ml-3 bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">
                                    System
                                </p>
                                <p>
                                    This is where messages will appear. Start
                                    chatting!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t p-4">
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default view - Public Chatrooms
    return (
        <div className="p-6">
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
                                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                    {room.memberCount || 0} members
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 mb-4 h-12 overflow-hidden">
                                {room.description ||
                                    "No description available."}
                            </p>
                            <button
                                className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md transition-colors flex items-center justify-center"
                                onClick={() => onJoinChatroom(room.id)}
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
