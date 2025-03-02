import MessageBubble from "./MessageBubble";
import { formatRelativeTime } from "@/Utils/formatter";

/**
 * The scrollable message list component showing chat history
 */
export default function MessageArea({
    messages,
    loading,
    loadingMore,
    hasMoreMessages,
    showHistorical,
    toggleHistoricalMessages,
    user,
    typingText,
    messageEndRef,
    listRef,
}) {
    // Group messages by date
    const groupedMessages = messages.reduce((grouped, message) => {
        // Get the date for the message
        const date = message.sent_at
            ? new Date(message.sent_at).toDateString()
            : "Unknown";

        // If we already have this date group, add to it
        const existingGroup = grouped.find(
            (g) => g.type === "date" && g.date === date
        );

        if (existingGroup) {
            existingGroup.messages.push(message);
            return grouped;
        }

        // Otherwise create a new date group
        return [
            ...grouped,
            {
                type: "date",
                date,
                dateDisplay: formatRelativeTime(message.sent_at),
                messages: [message],
            },
        ];
    }, []);

    return (
        <div ref={listRef} className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            {/* Historical messages toggle */}
            {hasMoreMessages || showHistorical ? (
                <div className="text-center mb-2">
                    <button
                        onClick={toggleHistoricalMessages}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                        {showHistorical
                            ? "Hide older messages"
                            : "Show messages from before you joined"}
                    </button>
                </div>
            ) : null}

            {/* Loading indicator for older messages */}
            {loadingMore && (
                <div className="flex justify-center items-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                    <span className="ml-2 text-sm text-gray-500">
                        Loading earlier messages...
                    </span>
                </div>
            )}

            {/* Main loading indicator */}
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">
                        No messages yet. Start the conversation!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Render grouped messages by date */}
                    {groupedMessages.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-4">
                            {/* Show date divider for date groups */}
                            {group.type === "date" && (
                                <div className="flex justify-center my-3">
                                    <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                                        {group.dateDisplay}
                                    </div>
                                </div>
                            )}

                            {/* For date groups, render all messages */}
                            {group.type === "date" &&
                                group.messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        currentUser={user}
                                    />
                                ))}
                        </div>
                    ))}

                    {/* Typing indicators - Only shown if there ARE users typing */}
                    {typingText.length > 0 && (
                        <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white font-bold">
                                ?
                            </div>
                            <div className="ml-3 bg-white p-2 rounded-lg shadow-sm">
                                <div className="flex space-x-1">
                                    <span className="animate-bounce">.</span>
                                    <span
                                        className="animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    >
                                        .
                                    </span>
                                    <span
                                        className="animate-bounce"
                                        style={{ animationDelay: "0.4s" }}
                                    >
                                        .
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messageEndRef} />
                </div>
            )}
        </div>
    );
}
