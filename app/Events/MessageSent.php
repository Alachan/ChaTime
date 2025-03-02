<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chatroom-' . $this->message->chat_room_id),
        ];
    }

    public function broadcastWith()
    {
        // Load the user before broadcasting
        $user = User::select('id', 'name', 'username', 'profile_picture')
            ->find($this->message->user_id);

        return [
            'id' => $this->message->id,
            'user_id' => $this->message->user_id,
            'message' => $this->message->message,
            'message_type' => $this->message->message_type,
            'sent_at' => $this->message->sent_at,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_picture' => $user->profile_picture
            ] : null
        ];
    }
}