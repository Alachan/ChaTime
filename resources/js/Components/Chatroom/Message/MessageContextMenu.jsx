import React, { useEffect, useRef, useState } from "react";

/**
 * Context menu for message actions like edit, delete, etc.
 */
export default function MessageContextMenu({
    position,
    onClose,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
}) {
    const menuRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

    // Adjust position to ensure menu is fully visible in viewport
    useEffect(() => {
        if (!position || !menuRef.current) return;

        // Get menu dimensions after rendering
        const menuRect = menuRef.current.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;

        // Calculate viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate adjusted position to keep menu in viewport
        let left = position.x;
        let top = position.y;

        // Adjust horizontal position if menu would go off right edge
        if (left + menuWidth > viewportWidth - 10) {
            left = Math.max(10, viewportWidth - menuWidth - 10);
        }

        // Adjust vertical position if menu would go off bottom edge
        if (top + menuHeight > viewportHeight - 10) {
            top = Math.max(10, viewportHeight - menuHeight - 10);
        }

        // Update menu position
        setMenuPosition({ left, top });
    }, [position, menuRef.current]);

    // Close the menu when clicking outside of it
    useEffect(() => {
        if (!position) return;

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [position, onClose]);

    // If no position is provided, don't render the menu
    if (!position) return null;

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-md shadow-lg z-50 border border-gray-200 w-40"
            style={{
                left: menuPosition.left,
                top: menuPosition.top,
            }}
        >
            <ul className="py-1">
                {canEdit && (
                    <li>
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={onEdit}
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
                    </li>
                )}
                {canDelete && (
                    <li>
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            onClick={onDelete}
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
                    </li>
                )}
            </ul>
        </div>
    );
}
