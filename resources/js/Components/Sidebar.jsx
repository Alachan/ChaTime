import React, { useState } from "react";

export default function Sidebar({ chatrooms, onCreateChatroom }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* Sidebar Toggle for Mobile */}
            <button
                className="absolute top-4 left-4 md:hidden bg-gray-700 text-white px-3 py-2 rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            {/* Sidebar */}
            <aside
                className={`bg-gray-900 text-white w-64 h-screen p-4 flex flex-col transition-transform transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 md:w-80 fixed md:static z-50`}
            >
                {/* Settings Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2">⚙️ Settings</h2>
                    <button className="w-full text-left px-4 py-2 bg-gray-800 rounded">
                        Profile Settings
                    </button>
                </div>

                {/* My Chatrooms Section */}
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-lg font-bold mb-2">💬 My Chatrooms</h2>
                    <ul>
                        {chatrooms.map((room) => (
                            <li key={room.id} className="mb-2">
                                <button className="w-full text-left px-4 py-2 bg-gray-800 rounded">
                                    {room.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Create Chatroom Button */}
                <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 mt-4 rounded"
                    onClick={onCreateChatroom}
                >
                    + Create Chatroom
                </button>
            </aside>
        </>
    );
}
