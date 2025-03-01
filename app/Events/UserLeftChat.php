<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\ChatRoom;
use Illuminate\Support\Facades\Log;

class UserLeftChat implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $username;
    public $chatRoomId;
    public $memberCount;

    public function __construct($userId, $chatRoomId)
    {
        // Safely retrieve user
        $user = User::find($userId);
        // Safely retrieve chatroom
        $chatRoom = ChatRoom::find($chatRoomId);

        $this->userId = $userId;
        $this->username = $user ? $user->username : 'Unknown User';

        // Safely get member count
        $this->memberCount = $chatRoom
            ? $chatRoom->participants()->count()
            : 0;

        $this->chatRoomId = $chatRoomId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chatroom-' . $this->chatRoomId),
        ];
    }

    public function broadcastWith()
    {
        try {
            return [
                'user_id' => $this->userId,
                'username' => $this->username,
                'member_count' => $this->memberCount
            ];
        } catch (\Exception $e) {
            // Log any unexpected errors during broadcasting
            Log::error('Error in UserLeftChat broadcastWith', [
                'error' => $e->getMessage(),
                'user_id' => $this->userId,
                'chatroom_id' => $this->chatRoomId
            ]);
        }
    }
}
