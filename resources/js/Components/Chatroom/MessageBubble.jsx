import {
    formatMessageTime,
    getUserAvatar,
    formatMessageText,
} from "@/Utils/formatter";

export default function MessageBubble({ message, currentUser }) {
    // Check if this message is from the current user
    const isMyMessage = message.user_id === currentUser?.id;

    // Get the appropriate user data (either message sender or current user)
    const bubbleUser = isMyMessage ? currentUser : message.user;

    // Create a fallback display name for when user data is missing
    const displayName =
        bubbleUser?.name || bubbleUser?.username || "Unknown User";

    // Get avatar information
    const avatar = getUserAvatar(bubbleUser);

    return (
        <div
            className={`flex items-start ${
                isMyMessage ? "justify-end" : "justify-start"
            }`}
        >
            {/* Only show other user's avatar on the left */}
            {!isMyMessage && (
                <div className="h-8 w-8 rounded-full bg-indigo-400 flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
                    {avatar.type === "image" ? (
                        <img
                            src={avatar.content}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        avatar.content
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
                    <p className="text-xs text-gray-500 mb-1">{displayName}</p>
                )}

                {/* Using safe HTML for formatted message text */}
                <p
                    dangerouslySetInnerHTML={{
                        __html: formatMessageText(message.message),
                    }}
                />

                <p className="text-xs text-gray-500 text-right mt-1">
                    {formatMessageTime(message.sent_at)}
                    {message.edited_at && " (edited)"}
                </p>
            </div>

            {/* Only show your avatar on the right */}
            {isMyMessage && (
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
                    {avatar.type === "image" ? (
                        <img
                            src={avatar.content}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        avatar.content
                    )}
                </div>
            )}
        </div>
    );
}
