import { formatMessageTime } from "@/Utils/formatter";

export function SystemMessage({ message }) {
    const messageType = message.message_type || "system";

    // Define styles based on message type
    const styles = {
        system: {
            container: "flex justify-center my-2",
            bubble: "bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500",
        },
        admin: {
            container: "flex justify-center my-2",
            bubble: "bg-blue-100 px-2 py-2 rounded-md text-sm text-blue-700 border border-blue-200 font-medium",
        },
    };

    // Get the appropriate style or default to system
    const style = styles[messageType] || styles.system;

    return (
        <div className={style.container}>
            <div className={style.bubble}>
                {message.message}
                {message.sent_at && (
                    <span className="text-xs ml-2 opacity-60">
                        {formatMessageTime(message.sent_at)}
                    </span>
                )}
            </div>
        </div>
    );
}
