import React from "react";

export default function MainPlayground({ publicChatrooms, onJoinChatroom }) {
    return (
        <div className="flex-1 bg-white p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">🌍 Public Chatrooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicChatrooms.map((room) => (
                    <div
                        key={room.id}
                        className="bg-gray-100 p-4 rounded-lg shadow"
                    >
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                        <p className="text-sm text-gray-600">
                            {room.description}
                        </p>
                        <button
                            className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                            onClick={() => onJoinChatroom(room.id)}
                        >
                            Join
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
