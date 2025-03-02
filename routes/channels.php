<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatRoom;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for chatroom broadcasts - only allow if user is a participant
Broadcast::channel('chatroom-{roomId}', function ($user, $roomId) {
    $chatroom = ChatRoom::find($roomId);

    if (!$chatroom) {
        return false;
    }

    $isParticipant = $chatroom->participants()->where('user_id', $user->id)->exists();

    return $isParticipant;
});

Broadcast::channel('test-channel', function ($user) {
    // Return true to let *any* logged-in user subscribe
    return (bool) $user;
});
