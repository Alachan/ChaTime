import { SystemMessage } from "./SystemMessage";
import { UserMessage } from "./UserMessage";

export default function MessageBubble({
    message,
    currentUser,
    onMessageDeleted,
    onMessageEdited,
}) {
    // If this is a system message, use the specialized component
    if (message.message_type && message.message_type !== "user") {
        return <SystemMessage message={message} />;
    }

    // Otherwise use the UserMessage component
    return (
        <UserMessage
            message={message}
            currentUser={currentUser}
            onMessageDeleted={onMessageDeleted}
            onMessageEdited={onMessageEdited}
        />
    );
}
