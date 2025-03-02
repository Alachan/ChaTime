/**
 * Utility functions for formatting dates, messages and other display elements
 */

/**
 * Format a timestamp to display in a message (HH:MM format)
 *
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time
 */
export function formatMessageTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Format a date to display in a message list or chat header
 * Shows today/yesterday, or the actual date for older messages
 *
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatMessageDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    // Otherwise return formatted date
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Convert a timestamp to a human-readable relative time string
 * (e.g., "2 minutes ago", "yesterday", "2 weeks ago")
 *
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time
 */
export function formatRelativeTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    // Less than a minute
    if (secondsAgo < 60) {
        return "just now";
    }

    // Less than an hour
    if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than a day
    if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Less than a week
    if (secondsAgo < 604800) {
        const days = Math.floor(secondsAgo / 86400);
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Less than a month
    if (secondsAgo < 2592000) {
        const weeks = Math.floor(secondsAgo / 604800);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    // Otherwise return the date
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Format a typing indicator message based on who is typing
 *
 * @param {Array} usernames - Array of usernames who are currently typing
 * @returns {string} - Formatted typing indicator text
 */
export function formatTypingIndicator(usernames) {
    if (!usernames || usernames.length === 0) return "";

    if (usernames.length === 1) {
        return `${usernames[0]} is typing...`;
    }

    if (usernames.length === 2) {
        return `${usernames[0]} and ${usernames[1]} are typing...`;
    }

    return `${usernames.length} people are typing...`;
}

/**
 * Format message text with basic markdown-like syntax
 * such as *bold*, _italic_, `code`, etc.
 *
 * @param {string} message - Raw message text
 * @returns {React.ReactNode} - Formatted message with React elements
 */
export function formatMessageText(message) {
    if (!message) return "";

    // This is a simplified example - in a real app you would want to use
    // a proper markdown parser like marked.js or a React-specific one

    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = message.replace(
        urlRegex,
        (url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`
    );

    // Return formatted text as HTML
    // In a real app, you'd need to sanitize this input first to prevent XSS
    return withLinks;
}

/**
 * Get the first letter of a name for avatar placeholders
 *
 * @param {string} name - User's name or username
 * @returns {string} - First letter or fallback
 */
export function getInitials(name) {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
}

/**
 * Get the avatar for a user, with fallback to initials
 *
 * @param {Object} user - User object with name and profile_picture
 * @returns {Object} - { type: 'image'|'initial', content: string }
 */
export function getUserAvatar(user) {
    if (!user) {
        return { type: "initial", content: "?" };
    }

    if (user.profile_picture) {
        return {
            type: "image",
            content: `/storage/${user.profile_picture}`,
        };
    }

    return {
        type: "initial",
        content: getInitials(user.name || user.username || "?"),
    };
}

/**
 * Format a member count with appropriate suffix
 *
 * @param {number} count - Number of members
 * @returns {string} - Formatted count (e.g., "42 members")
 */
export function formatMemberCount(count) {
    if (count === 1) return "1 chatter";
    return `${count} chatters`;
}

/**
 * Get the notification icon based on the notification type
 *
 * @param {string} type - Notification type
 * @returns {string} - Emoji icon
 */
export function getNotificationIcon(type) {
    switch (type) {
        case "success":
            return "✅";
        case "error":
            return "❌";
        case "warning":
            return "⚠️";
        case "info":
            return "ℹ️";
        default:
            return "📢";
    }
}
