import React from "react";

export default function ChatroomCard({
    room,
    onJoinAttempt,
    onEnterChatroom,
    joinedChatrooms,
}) {
    // Check if user has already joined this chatroom
    const isJoined = joinedChatrooms.some(
        (joinedRoom) => joinedRoom.id === room.id
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Header section with chatroom name and lock icon */}
            <div className="mb-2 flex items-center">
                {room.is_private && (
                    <span
                        className="text-yellow-600 mr-1"
                        title="Private chatroom"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                )}
                <h3
                    className="text-lg font-semibold truncate"
                    title={room.name}
                >
                    {room.name}
                </h3>
            </div>

            {/* Member count badge */}
            <div className="mb-3">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {room.member_count || 0} members
                </span>
            </div>

            {/* Description section with fixed height */}
            <div className="flex-grow mb-4">
                <p
                    className="text-sm text-gray-600 line-clamp-3 overflow-hidden"
                    title={room.description || ""}
                >
                    {room.description || "No description available."}
                </p>
            </div>

            {/* Action button */}
            {isJoined ? (
                <button
                    className="w-full mt-auto bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition-colors flex items-center justify-center"
                    onClick={() => onEnterChatroom(room.id)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Enter Chatroom
                </button>
            ) : (
                <button
                    className="w-full mt-auto bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md transition-colors flex items-center justify-center"
                    onClick={() => onJoinAttempt(room.id)}
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
            )}
        </div>
    );
}
