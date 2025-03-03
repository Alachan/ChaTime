/**
 * Navigation bar for the chatroom with back button and leave chatroom option
 */
export default function ChatroomNavigation({ onBackClick, onLeaveChatroom }) {
    return (
        <div className="bg-fade py-1 px-4 text-sm border-b flex items-center justify-between z-50">
            <button
                onClick={onBackClick}
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <button
                onClick={onLeaveChatroom}
                className="text-red-400 hover:text-red-700 text-sm"
            >
                Leave Chatroom
            </button>
        </div>
    );
}
