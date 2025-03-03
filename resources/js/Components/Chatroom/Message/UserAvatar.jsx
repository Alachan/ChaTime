export function UserAvatar({ user, position = "left" }) {
    const displayName = user?.name || user?.username || "Unknown User";

    // Get avatar type (image or initial)
    const avatarType = user?.profile_picture ? "image" : "initial";
    const avatarContent =
        avatarType === "image"
            ? `/storage/${user.profile_picture}`
            : user?.name?.charAt(0) || "?";

    return (
        <div
            className={`h-8 w-8 rounded-full ${
                position === "left" ? "bg-indigo-400" : "bg-indigo-500"
            } flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden`}
        >
            {avatarType === "image" ? (
                <img
                    src={avatarContent}
                    alt={displayName}
                    className="w-full h-full object-cover"
                />
            ) : (
                avatarContent
            )}
        </div>
    );
}
