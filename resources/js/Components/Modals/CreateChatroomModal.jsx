import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function CreateChatroomModal({
    isOpen,
    onClose,
    onChatroomCreated,
}) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const response = await axios.post("/api/create-chatroom", formData);

            // Success! Let the parent component know a chatroom was created
            if (onChatroomCreated) {
                onChatroomCreated(response.data.chatroom);
            }

            // Close the modal and reset form
            onClose();
            setFormData({
                name: "",
                description: "",
                password: "",
            });
        } catch (error) {
            console.error("Error creating chatroom:", error);

            // Handle validation errors from backend
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    general:
                        error.response?.data?.message ||
                        "Failed to create chatroom",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black bg-opacity-75"
                onClick={onClose}
            ></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6 shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                            Create New Chatroom
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* General Error */}
                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                {errors.general}
                            </div>
                        )}

                        {/* Chatroom Name */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Chatroom Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter chatroom name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="What's this chatroom about?"
                                rows="3"
                            ></textarea>
                        </div>

                        {/* Private Chatroom */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Password Protection
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Leave empty for public chatroom"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Add a password to make this chatroom private
                            </p>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                className="mx-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                disabled={isLoading || !formData.name.trim()}
                            >
                                {isLoading ? (
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
                                        Creating...
                                    </span>
                                ) : (
                                    "Create Chatroom"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
