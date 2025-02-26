<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\UserTyping;
use App\Events\UserJoinedChat;
use App\Models\ChatRoom;
use App\Events\UserLeftChat;

class ChatRoomController extends Controller
{
    public function userTyping(Request $request)
    {
        $user = Auth::user();

        broadcast(new UserTyping($user->id, $request->chat_room_id))->toOthers();

        return response()->json(['message' => "{$user->username} is typing..."]);
    }

    public function joinChatRoom(Request $request)
    {
        $user = Auth::user();
        $chatRoom = ChatRoom::findOrFail($request->chat_room_id);

        if ($chatRoom->is_private && !password_verify($request->password, $chatRoom->password)) {
            return response()->json(['error' => 'Incorrect password'], 403);
        }

        $chatRoom->participants()->syncWithoutDetaching([$user->id]);

        broadcast(new UserJoinedChat($user->id, $chatRoom->id))->toOthers();

        return response()->json(['message' => "{$user->username} joined the chat"]);
    }

    public function leaveChatRoom(Request $request) {
        $user = Auth::user();
        $chatRoom = ChatRoom::findOrFail($request->chat_room_id);
        $chatRoom->participants()->detach($user->id);

        broadcast(new UserLeftChat($user->id, $chatRoom->id))->toOthers();

        return response()->json(['message' => "{$user->username} left the chat"]);
    }
}