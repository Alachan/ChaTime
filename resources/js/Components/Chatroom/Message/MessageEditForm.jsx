import { useRef } from "react";

export function MessageEditForm({
    editContent,
    setEditContent,
    handleSaveEdit,
    handleCancelEdit,
    isSubmittingEdit,
}) {
    const editInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            handleCancelEdit();
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        }
    };

    return (
        <div className="flex flex-col">
            <textarea
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={Math.max(1, (editContent.match(/\n/g) || []).length + 1)}
                autoFocus
            />
            <div className="flex justify-between text-xs">
                <div className="text-gray-500">
                    <span>Esc to cancel</span> | <span>Enter to save</span>
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
                        disabled={isSubmittingEdit}
                    >
                        {isSubmittingEdit ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
