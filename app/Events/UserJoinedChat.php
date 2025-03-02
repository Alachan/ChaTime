<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\ChatRoom;

class UserJoinedChat implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $userId;
    public $username;
    public $chatRoomId;
    public $memberCount;

    public function __construct($userId, $chatRoomId)
    {
        $user = User::find($userId);
        $chatRoom = ChatRoom::withCount('participants as member_count')->find($chatRoomId);

        $this->userId = $userId;
        $this->username = $user ? $user->username : 'Unknown User';
        $this->chatRoomId = $chatRoomId;
        $this->memberCount = $chatRoom ? $chatRoom->member_count : 0;
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
        return [
            'user_id' => $this->userId,
            'username' => $this->username,
            'member_count' => $this->memberCount
        ];
    }
}
