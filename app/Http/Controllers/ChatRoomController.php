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

    public function getPublicChatRooms()
    {
        $chatRooms = ChatRoom::where('is_private', false)
            ->withCount('participants as member_count')
            ->with('creator:id,name,username')
            ->orderBy('last_message_at', 'desc')
            ->get();

        return response()->json($chatRooms);
    }

    public function getJoinedChatRooms()
    {
        $user = Auth::user();

        $chatRooms = $user->chatRooms()
            ->with('creator:id,name,username')
            ->withCount('participants as member_count')
            ->orderBy('last_message_at', 'desc')
            ->get();

        return response()->json($chatRooms);
    }

    public function createChatRoom(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        $user = Auth::user();

        $chatRoomData = [
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => $user->id,
            'is_private' => !empty($request->password), // Set is_private based on password presence
        ];

        // Hash password if provided
        if ($request->password) {
            $chatRoomData['password'] = bcrypt($request->password);
        }

        $chatRoom = ChatRoom::create($chatRoomData);

        // Add the creator as a participant
        $chatRoom->participants()->attach($user->id);

        return response()->json([
            'message' => 'Chatroom created successfully',
            'chatroom' => $chatRoom
        ]);
    }

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

    public function leaveChatRoom(Request $request)
    {
        $user = Auth::user();
        $chatRoom = ChatRoom::findOrFail($request->chat_room_id);
        $chatRoom->participants()->detach($user->id);

        broadcast(new UserLeftChat($user->id, $chatRoom->id))->toOthers();

        return response()->json(['message' => "{$user->username} left the chat"]);
    }
}
