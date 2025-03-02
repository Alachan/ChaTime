<?php

namespace App\Services;

use App\Models\Message;
use App\Models\ChatRoom;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Log;

class SystemMessageService
{
    /**
     * Create a system message
     *
     * @param int $chatRoomId
     * @param string $messageText
     * @param string $messageType
     * @param int|null $relatedUserId User ID related to the message (e.g., who joined/left)
     * @param bool $broadcast Whether to broadcast the message via websockets
     * @return Message
     */
    public static function create($chatRoomId, $messageText, $messageType = Message::TYPE_SYSTEM, $relatedUserId = null, $broadcast = true)
    {
        try {
            // Create the message record
            $message = Message::create([
                'user_id' => $relatedUserId, // Can be null for pure system messages
                'chat_room_id' => $chatRoomId,
                'message' => $messageText,
                'message_type' => $messageType,
                'sent_at' => now(),
            ]);

            // Update the chatroom's last_message_at timestamp
            ChatRoom::where('id', $chatRoomId)->update(['last_message_at' => now()]);

            // Broadcast the message to all users if requested
            if ($broadcast) {
                broadcast(new MessageSent($message))->toOthers();
            }

            return $message;
        } catch (\Exception $e) {
            Log::error('Failed to create system message', [
                'error' => $e->getMessage(),
                'chat_room_id' => $chatRoomId,
                'message' => $messageText,
                'type' => $messageType
            ]);

            throw $e;
        }
    }

    /**
     * Create a user joined message
     *
     * @param int $chatRoomId
     * @param User $user
     * @param bool $broadcast
     * @return Message
     */
    public static function userJoined($chatRoomId, User $user, $broadcast = true)
    {
        $message = "{$user->username} joined for a sip!";
        return self::create($chatRoomId, $message, Message::TYPE_SYSTEM, $user->id, $broadcast);
    }

    /**
     * Create a user left message
     *
     * @param int $chatRoomId
     * @param User $user
     * @param bool $broadcast
     * @return Message
     */
    public static function userLeft($chatRoomId, User $user, $broadcast = true)
    {
        $message = "{$user->username} left for other refreshment.";
        return self::create($chatRoomId, $message, Message::TYPE_SYSTEM, $user->id, $broadcast);
    }

    /**
     * Create a welcome message for a user
     *
     * @param int $chatRoomId
     * @param User $user
     * @param bool $broadcast
     * @return Message
     */
    public static function welcomeUser($chatRoomId, User $user, $broadcast = false)
    {
        // Get the chat room name
        $chatRoom = ChatRoom::find($chatRoomId);
        $chatRoomName = $chatRoom ? $chatRoom->name : 'this chatroom';

        $message = "Welcome to {$chatRoomName}! Enjoy the new tea!";
        return self::create($chatRoomId, $message, Message::TYPE_SYSTEM, $user->id, $broadcast);
    }

    /**
     * Create an admin message
     *
     * @param int $chatRoomId
     * @param string $messageText
     * @param bool $broadcast
     * @return Message
     */
    public static function adminMessage($chatRoomId, $messageText, User $user, $broadcast = true)
    {
        return self::create($chatRoomId, $messageText, Message::TYPE_ADMIN, $user->id, $broadcast);
    }
}