export default function MessageBubble({ message, currentUser, formatTime }) {
    // Check if this message is from the current user
    const isMyMessage = message.user_id === currentUser?.id;

    // Get the appropriate user data (either message sender or current user)
    const bubbleUser = isMyMessage ? currentUser : message.user;

    return (
        <div
            className={`flex items-start ${
                isMyMessage ? "justify-end" : "justify-start"
            }`}
        >
            {/* Only show other user's avatar on the left */}
            {!isMyMessage && (
                <div className="h-8 w-8 rounded-full bg-indigo-400 flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
                    {bubbleUser?.profile_picture ? (
                        <img
                            src={`/storage/${bubbleUser.profile_picture}`}
                            alt={bubbleUser.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        bubbleUser?.name?.charAt(0) || "?"
                    )}
                </div>
            )}

            {/* Message content */}
            <div
                className={`mx-3 p-3 rounded-lg shadow-sm ${
                    isMyMessage ? "bg-indigo-100" : "bg-white"
                }`}
            >
                {/* Only show name for other users' messages */}
                {!isMyMessage && (
                    <p className="text-xs text-gray-500 mb-1">
                        {bubbleUser?.name || "Unknown"}
                    </p>
                )}

                <p>{message.message}</p>

                <p className="text-xs text-gray-500 text-right mt-1">
                    {formatTime(message.sent_at)}
                    {message.edited_at && " (edited)"}
                </p>
            </div>

            {/* Only show your avatar on the right */}
            {isMyMessage && (
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
                    {currentUser?.profile_picture ? (
                        <img
                            src={`/storage/${currentUser.profile_picture}`}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        currentUser?.name?.charAt(0) || "?"
                    )}
                </div>
            )}
        </div>
    );
}
