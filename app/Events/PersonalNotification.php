<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

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

    public function broadcastOn(): array
    {
        $channelName = 'user.' . $this->userId;

        return [
            new PrivateChannel($channelName),
        ];
    }

    public function broadcastWith(): array
    {
        $payload = [
            'type' => $this->type,
            'message' => $this->message,
            'data' => $this->data,
            'timestamp' => now()->toIso8601String(),
        ];

        return $payload;
    }
}