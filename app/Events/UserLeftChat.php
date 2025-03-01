<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class UserLeftChat
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $username;
    public $chatRoomId;
    public $memberCount;

    public function __construct($userId, $chatRoomId)
    {
        $user = User::find($userId);

        $this->userId = $userId;
        $this->username = $user ? $user->username : 'Unknown User';
        $this->chatRoomId = $chatRoomId;
        $this->memberCount = count($user->chatRooms()->find($chatRoomId)->users);
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
