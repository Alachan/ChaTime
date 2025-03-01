import { motion } from "framer-motion";

export default function PasswordModal({
    isOpen,
    onClose,
    onSubmit,
    roomName,
    loading,
    error,
    passwordInput,
    setPasswordInput,
}) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black bg-opacity-75"
                onClick={onClose}
            ></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6 shadow-xl"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Enter Password
                    </h3>

                    <p className="mb-4 text-gray-600">
                        "{roomName}" is a private chatroom. Please enter the
                        password to join:
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                            placeholder="Enter password"
                            required
                            autoFocus
                        />

                        <div className="flex justify-end">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                disabled={loading || !passwordInput}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Joining...
                                    </span>
                                ) : (
                                    "Join"
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
