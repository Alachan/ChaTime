import { formatMessageTime, formatMessageText } from "@/Utils/formatter";
import { MessageEditForm } from "./MessageEditForm";

export function UserMessageContent({ message, isEditing, editProps }) {
    if (isEditing) {
        return <MessageEditForm {...editProps} />;
    }

    return (
        <>
            <div
                className="overflow-hidden overflow-wrap-anywhere break-words"
                dangerouslySetInnerHTML={{
                    __html: formatMessageText(message.message),
                }}
            />

            <p className="text-xs text-gray-500 text-right mt-1">
                {formatMessageTime(message.sent_at)}
                {message.edited_at && " (edited)"}
            </p>
        </>
    );
}
