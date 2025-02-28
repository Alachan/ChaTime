import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileModal({
    isOpen,
    onClose,
    user,
    onProfileUpdate,
}) {
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        profile_picture: null,
    });
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                bio: user.bio || "",
                profile_picture: null,
            });
        }
    }, [user]);

    // track if changes were made
    const hasChanges =
        user?.name !== formData.name ||
        user?.bio !== formData.bio ||
        preview !== null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profile_picture: file });

            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const data = new FormData();
        data.append("name", formData.name);
        data.append("bio", formData.bio);
        if (formData.profile_picture) {
            data.append("profile_picture", formData.profile_picture);
        }

        try {
            const response = await axios.post("/api/profile/update", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Get the updated user data from response
            const updatedUser = response.data.user;

            setSuccessMessage("Profile updated successfully!");

            // Call the callback with updated user data
            if (onProfileUpdate && updatedUser) {
                onProfileUpdate(updatedUser);
            }

            setTimeout(() => {
                onClose();
                setSuccessMessage("");
            }, 500);
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage(
                error.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black bg-opacity-75 md:z-30"
                onClick={onClose}
            ></div>

            {/* Modal Container - Full screen on mobile, centered modal on desktop */}
            <div className="flex items-center justify-center p-4">
                <div className="bg-gray-800 text-white fixed inset-0 md:relative md:inset-auto w-full md:max-w-md md:rounded-lg md:mx-auto md:my-auto md:shadow-xl z-50">
                    {/* Unified header for both mobile and desktop */}
                    <div className="bg-gray-900 p-4 md:p-6 flex items-center justify-between border-b border-gray-700 md:rounded-t-lg">
                        <h2 className="text-xl font-bold">Edit Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
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

                    {/* Form Content - Same for both mobile and desktop */}
                    <div className="p-6">
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-900 text-green-200 rounded">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Profile Picture with Username */}
                            <div className="mb-6 flex flex-col items-center">
                                {/* Profile Picture with Edit Icon Overlay */}
                                <div className="relative w-24 h-24 group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user?.profile_picture ? (
                                            <img
                                                src={`/storage/${user.profile_picture}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-xl font-bold">
                                                {user?.name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Edit Icon Overlay */}
                                    <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {/* Display Username (not editable) */}
                                <div className="mt-2 text-gray-400 text-sm">
                                    @{user?.username || "username"}
                                </div>
                            </div>

                            {/* Display Name */}
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring focus:ring-indigo-500 text-white"
                                />
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <label className="block text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring focus:ring-indigo-500 text-white"
                                    rows="3"
                                ></textarea>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="mx-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading || !hasChanges}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
