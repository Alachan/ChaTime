import { useRef, useEffect } from "react";

/**
 * Message context menu - appears when a message is long-pressed or right-clicked
 * Used for message actions like edit and delete
 */
export default function MessageContextMenu({
    position,
    onClose,
    onDelete,
    onEdit,
    canEdit = true,
    canDelete = true,
}) {
    const menuRef = useRef(null);

    // Handle clicks outside the menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // If no position is provided, don't render anything
    if (!position) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bg-white rounded-md shadow-lg py-1 z-50 w-48 border border-gray-200"
            style={{
                left: position.x,
                top: position.y,
            }}
        >
            {canEdit && (
                <button
                    onClick={onEdit}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    Edit Message
                </button>
            )}
            {canDelete && (
                <button
                    onClick={onDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                    Delete Message
                </button>
            )}
        </div>
    );
}
