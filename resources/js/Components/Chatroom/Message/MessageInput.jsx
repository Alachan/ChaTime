/**
 * Message input component with typing indicator
 */
export default function MessageInput({
    typingText,
    inputMessage,
    handleInputChange,
    handleKeyDown,
    handleSendMessage,
}) {
    return (
        <div className="bg-white border-t p-4">
            {/* Typing indicator above input */}
            {typingText && (
                <div className="text-xs text-gray-500 italic mb-2">
                    {typingText}
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </form>
        </div>
    );
}
