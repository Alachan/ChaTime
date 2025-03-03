// UserMessage.jsx
import { useState, useRef } from "react";
import MessageContextMenu from "./MessageContextMenu";
import useLongPress from "@/Hooks/useLongPress";
import ConfirmationModal from "@/Components/Modals/ConfirmationModal";
import ChatService from "@/Services/ChatService";
import { UserMessageContent } from "./UserMessageContent";
import { UserAvatar } from "./UserAvatar";

export function UserMessage({
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

    // Check if this message is from the current user
    const isMyMessage = message.user_id === currentUser?.id;

    // Get the user from message.user or use current user
    const bubbleUser = isMyMessage ? currentUser : message.user;

    // Function to handle right-click (desktop)
    const handleRightClick = (e) => {
        if (isMyMessage) {
            e.preventDefault();
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
            });
        }
    };

    // Function to handle long-press (mobile)
    const handleLongPress = (e) => {
        if (isMyMessage && messageRef.current) {
            const target = e.currentTarget;
            if (!target) return;

            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;

            setContextMenu({
                x: centerX - 80,
                y: rect.top + 40,
            });
        }
    };

    // Set up long press detection
    const longPressEvent = useLongPress(handleLongPress);

    // Context menu handlers
    const closeContextMenu = () => setContextMenu(null);

    const handleEditMessage = () => {
        closeContextMenu();
        setEditContent(message.message);
        setIsEditing(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
        closeContextMenu();
    };

    // Edit handlers
    const handleSaveEdit = async () => {
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
        } finally {
            setIsSubmittingEdit(false);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent("");
    };

    // Delete handler
    const handleDeleteMessage = async () => {
        setIsDeleting(true);

        try {
            await ChatService.deleteMessage(message.id);
            if (onMessageDeleted) {
                onMessageDeleted(message.id);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Create props for the edit form
    const editProps = {
        editContent,
        setEditContent,
        handleSaveEdit,
        handleCancelEdit,
        isSubmittingEdit,
    };

    // Create user display name
    const displayName =
        bubbleUser?.name || bubbleUser?.username || "Unknown User";

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
                    <UserAvatar user={bubbleUser} position="left" />
                )}

                {/* Message content */}
                <div
                    className={`mx-3 p-3 rounded-lg shadow-sm ${
                        isMyMessage ? "bg-indigo-100" : "bg-tea"
                    } max-w-md break-words`}
                    onContextMenu={isMyMessage ? handleRightClick : undefined}
                    {...(isMyMessage ? longPressEvent : {})}
                >
                    {/* Only show name for other users' messages */}
                    {!isMyMessage && (
                        <p className="text-xs font-semibold text-killer mb-1">
                            {displayName}
                        </p>
                    )}

                    {/* Message content or edit form */}
                    <UserMessageContent
                        message={message}
                        isEditing={isEditing}
                        editProps={editProps}
                    />
                </div>

                {/* Only show your avatar on the right */}
                {isMyMessage && (
                    <UserAvatar user={bubbleUser} position="right" />
                )}
            </div>

            {/* Context menu */}
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
