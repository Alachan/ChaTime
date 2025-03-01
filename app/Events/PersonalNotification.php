<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PersonalNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $type;    // 'chat', 'system', 'success', 'error', etc.
    public $message; // The notification message
    public $data;    // Optional additional data (could be a chatroom, user, etc.)

    /**
     * Create a new event instance.
     *
     * @param int $userId The user to notify
     * @param string $type The notification type
     * @param string $message The notification message
     * @param array|null $data Additional data to include
     */
    public function __construct($userId, $type, $message, $data = null)
    {
        $this->userId = $userId;
        $this->type = $type;
        $this->message = $message;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    /**
     * The data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'type' => $this->type,
            'message' => $this->message,
            'data' => $this->data,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}