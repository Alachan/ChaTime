import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import UserService from "@/Services/UserService";

export default function Sidebar({
    chatrooms,
    onCreateChatroom,
    onEditProfile,
    onClickChatroom,
    user,
    sidebarControl,
}) {
    const [loading, setLoading] = useState(!user);
    // Use the sidebar control object
    const { isOpen, toggle, close } = sidebarControl;

    // Toggle dropdown for profile menu
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await UserService.logout();
            localStorage.removeItem("auth_token");

            // Clear the auth_token cookie by setting it to expire in the past
            document.cookie =
                "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            router.visit("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleEditProfile = () => {
        onEditProfile(); // Call the callback function from parent
        setProfileMenuOpen(false); // Close the dropdown
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="fixed top-4 left-2 z-50 md:hidden bg-emerald-200 text-secondary p-1 rounded-md shadow-lg"
                onClick={toggle}
                aria-label="Toggle sidebar"
            >
                {isOpen ? (
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
                ) : (
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
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                )}
            </button>

            {/* Sidebar */}
            <aside
                className={`bg-gray-900 text-white w-72 h-screen flex flex-col transition-all duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 fixed md:sticky top-0 left-0 z-40 shadow-xl`}
            >
                {/* Profile Section */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center relative md:pl-0 pl-12">
                        <div
                            className="w-12 h-12 rounded-full bg-indigo-400 flex-shrink-0 cursor-pointer overflow-hidden"
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        >
                            {user?.profile_picture ? (
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

                        <div className="ml-3 flex-grow">
                            <p className="font-medium truncate">
                                {loading ? "Loading..." : user?.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {loading ? "" : user?.username}
                            </p>
                        </div>

                        <button
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        {/* Profile Dropdown Menu */}
                        {profileMenuOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 py-2 bg-gray-800 rounded-md shadow-lg z-50">
                                <button
                                    onClick={handleEditProfile}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chatrooms Section */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    <h2 className="text-lg font-semibold mb-3 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        My Chatrooms
                    </h2>

                    {chatrooms.length === 0 ? (
                        <div className="text-gray-400 text-sm p-3 text-center">
                            You haven't joined any chatrooms yet.
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {chatrooms.map((room) => (
                                <li key={room.id}>
                                    <button
                                        className="w-full flex items-center text-left p-3 rounded-md hover:bg-gray-800 transition-colors"
                                        onClick={() => {
                                            onClickChatroom(room.id);
                                            // Always call close - it will only affect mobile view
                                            close();
                                        }}
                                    >
                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                        <span className="truncate">
                                            {room.name}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Create Chatroom Button */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={onCreateChatroom}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Create New Chatroom
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
