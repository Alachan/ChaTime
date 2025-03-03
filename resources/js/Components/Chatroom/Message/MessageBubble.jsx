import { useState, useRef } from "react";
import {
    formatMessageTime,
    getUserAvatar,
    formatMessageText,
} from "@/Utils/formatter";
import MessageContextMenu from "./MessageContextMenu";
import useLongPress from "@/Hooks/useLongPress";
import ConfirmationModal from "@/Components/Modals/ConfirmationModal";
import ChatService from "@/Services/ChatService";

export default function MessageBubble({
    message,
    currentUser,
    onMessageDeleted,
    onMessageEdited,
}) {
    const [contextMenu, setContextMenu] = useState(null);
    const messageRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const editInputRef = useRef(null);

    // First check if this is a system message
    if (message.message_type && message.message_type !== "user") {
        return renderSystemMessage(message);
    }

    // Check if this message is from the current user (to enable edit/delete)
    const isMyMessage = message.user_id === currentUser?.id;

    // Function to handle right-click (desktop)
    const handleRightClick = (e) => {
        if (isMyMessage) {
            e.preventDefault(); // Prevent default browser context menu

            // Use the position of the right-click within the message bubble
            // The target is now the bubble itself
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
            });
        }
    };

    // Function to handle long-press (mobile)
    const handleLongPress = (e) => {
        if (isMyMessage && messageRef.current) {
            // Double-check that e.currentTarget is still valid
            const target = e.currentTarget;
            if (!target) return;

            const rect = target.getBoundingClientRect();
            // For mobile, position relative to the message bubble (centered horizontally if possible)
            const centerX = rect.left + rect.width / 2;

            // Position menu near the message bubble, centered if possible
            setContextMenu({
                x: centerX - 80, // Try to center the menu (width ~160px)
                y: rect.top + 40, // Position below the message
            });
        }
    };

    // Function to close context menu
    const closeContextMenu = () => {
        setContextMenu(null);
    };

    // Set up long press detection
    const longPressEvent = useLongPress(handleLongPress);

    // Function to handle message deletion
    const handleDeleteMessage = async () => {
        setIsDeleting(true);
        closeContextMenu();

        try {
            await ChatService.deleteMessage(message.id);
            if (onMessageDeleted) {
                onMessageDeleted(message.id);
            }
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error("Error deleting message:", error);
            // Show error notification if needed
        } finally {
            setIsDeleting(false);
        }
    };

    // Function to confirm deletion
    const confirmDelete = () => {
        setShowDeleteConfirm(true);
        closeContextMenu();
    };

    // Handle Edit Message
    const handleEditMessage = () => {
        closeContextMenu();
        setEditContent(message.message);
        setIsEditing(true);

        // Focus the edit input after it's rendered
        setTimeout(() => {
            if (editInputRef.current) {
                editInputRef.current.focus();
                // Position cursor at the end
                editInputRef.current.selectionStart =
                    editInputRef.current.value.length;
            }
        }, 0);
    };

    // Handle save edit
    const handleSaveEdit = async () => {
        // Don't submit if the content is empty or hasn't changed
        if (!editContent.trim() || editContent === message.message) {
            setIsEditing(false);
            return;
        }

        setIsSubmittingEdit(true);

        try {
            const response = await ChatService.editMessage(
                message.id,
                editContent
            );

            if (onMessageEdited) {
                onMessageEdited(response.data);
            }
        } catch (error) {
            console.error("Error editing message:", error);
            // Show error notification if needed
        } finally {
            setIsSubmittingEdit(false);
            setIsEditing(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent("");
    };

    // Handle keyboard events in edit input
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            handleCancelEdit();
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        }
    };

    // Get the user from message.user or use a placeholder
    const bubbleUser = isMyMessage ? currentUser : message.user;

    // Otherwise, render a regular user message
    return renderUserMessage(
        message,
        bubbleUser,
        isMyMessage,
        messageRef,
        longPressEvent,
        handleRightClick,
        contextMenu,
        closeContextMenu,
        handleEditMessage,
        confirmDelete,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDeleteMessage,
        isDeleting,
        isEditing,
        editContent,
        setEditContent,
        handleSaveEdit,
        handleCancelEdit,
        handleKeyDown,
        editInputRef,
        isSubmittingEdit
    );
}

/**
 * Render a system message with appropriate styles based on type
 */
function renderSystemMessage(message) {
    const messageType = message.message_type || "system";

    // Define styles based on message type
    const styles = {
        system: {
            container: "flex justify-center my-2",
            bubble: "bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500",
        },
        admin: {
            container: "flex justify-center my-2",
            bubble: "bg-blue-100 px-2 py-2 rounded-md text-sm text-blue-700 border border-blue-200 font-medium",
        },
    };

    // Get the appropriate style or default to system
    const style = styles[messageType] || styles.system;

    return (
        <div className={style.container}>
            <div className={style.bubble}>
                {message.message}
                {message.sent_at && (
                    <span className="text-xs ml-2 opacity-60">
                        {formatMessageTime(message.sent_at)}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Render a regular user message bubble
 */
function renderUserMessage(
    message,
    bubbleUser,
    isMyMessage,
    messageRef,
    longPressEvent,
    handleRightClick,
    contextMenu,
    closeContextMenu,
    handleEditMessage,
    confirmDelete,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteMessage,
    isDeleting,
    isEditing,
    editContent,
    setEditContent,
    handleSaveEdit,
    handleCancelEdit,
    handleKeyDown,
    editInputRef,
    isSubmittingEdit
) {
    // Create a fallback display name for when user data is missing
    const displayName =
        bubbleUser?.name || bubbleUser?.username || "Unknown User";

    // Get avatar information
    const avatar = getUserAvatar(bubbleUser);

    return (
        <>
            <div
                ref={messageRef}
                className={`flex items-start ${
                    isMyMessage ? "justify-end" : "justify-start"
                } relative`}
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

                {/* Message content - context menu only triggers on this element */}
                <div
                    className={`mx-3 p-3 rounded-lg shadow-sm ${
                        isMyMessage ? "bg-indigo-100" : "bg-white"
                    } max-w-md break-words`}
                    onContextMenu={isMyMessage ? handleRightClick : undefined}
                    {...(isMyMessage ? longPressEvent : {})}
                >
                    {/* Only show name for other users' messages */}
                    {!isMyMessage && (
                        <p className="text-xs text-gray-500 mb-1">
                            {displayName}
                        </p>
                    )}

                    {/* Edit mode */}
                    {isEditing ? (
                        <div className="flex flex-col">
                            <textarea
                                ref={editInputRef}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-2 py-1 border rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={Math.max(
                                    1,
                                    (editContent.match(/\n/g) || []).length + 1
                                )}
                            />
                            <div className="flex justify-between text-xs">
                                <div className="text-gray-500">
                                    <span>Esc to cancel</span> |{" "}
                                    <span>Enter to save</span>
                                </div>
                                <div className="flex space-x-1 ml-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-gray-pink hover:text-moderate-blue"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="text-save hover:text-happy-blue"
                                        disabled={
                                            isSubmittingEdit ||
                                            !editContent.trim() ||
                                            editContent === message.message
                                        }
                                    >
                                        {isSubmittingEdit
                                            ? "Saving..."
                                            : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Regular message content */}
                            <div
                                className="overflow-hidden overflow-wrap-anywhere break-words"
                                dangerouslySetInnerHTML={{
                                    __html: formatMessageText(message.message),
                                }}
                            />

                            <p className="text-xs text-gray-500 text-right mt-1">
                                {formatMessageTime(message.sent_at)}
                                {message.edited_at && " (edited)"}
                            </p>
                        </>
                    )}
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

            {/* Context menu for the message (positioned fixed to avoid scroll issues) */}
            <MessageContextMenu
                position={contextMenu}
                onClose={closeContextMenu}
                onDelete={confirmDelete}
                onEdit={handleEditMessage}
                canEdit={isMyMessage}
                canDelete={isMyMessage}
            />

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteMessage}
                title="Delete Message"
                message="Are you sure you want to delete this message? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonClass="bg-red-500 hover:bg-red-600"
                isLoading={isDeleting}
            />
        </>
    );
}
