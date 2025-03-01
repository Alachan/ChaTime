/**
 * The header section of a chatroom showing name, description and member count
 */
export default function ChatroomHeader({ chatroom, memberCount }) {
    return (
        <div className="bg-white border-b md:pl-4 pl-12 py-3 flex items-center justify-between shadow-sm">
            <div>
                <h2 className="text-xl font-semibold">{chatroom.name}</h2>
                <p className="text-sm text-gray-500">{chatroom.description}</p>
            </div>
            <div className="flex items-center space-x-2 pr-4">
                <span className="text-sm text-gray-500">
                    {memberCount} members
                </span>
            </div>
        </div>
    );
}
