import { memo } from "react";
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
    loadMoreMessages,
    user,
    typingText,
    messageEndRef,
    areaRef,
    onMessageDeleted,
    onMessageEdited,
}) {
    const MemoizedMessageBubble = memo(MessageBubble);

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
        <div ref={areaRef} className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            {/* Load More Button - always visible if there are more messages */}
            {hasMoreMessages && (
                <div className="flex justify-center items-center mb-4">
                    <button
                        onClick={loadMoreMessages}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-full text-sm flex items-center justify-center transition-colors"
                        disabled={loadingMore}
                    >
                        {loadingMore ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-700 mr-2"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                                    />
                                </svg>
                                Load earlier messages
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Main loading indicator */}
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">No tea yet. Start brewing!</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
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
                                    <MemoizedMessageBubble
                                        key={message.id}
                                        message={message}
                                        currentUser={user}
                                        onMessageDeleted={onMessageDeleted}
                                        onMessageEdited={onMessageEdited}
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
