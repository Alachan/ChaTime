<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ChatRoom;
use App\Events\UserTyping;
use App\Events\UserJoinedChat;
use App\Events\UserLeftChat;
use App\Events\PersonalNotification;
use Illuminate\Support\Facades\Log;

class ChatRoomController extends Controller
{
    public function getMembers($roomId)
    {
        $chatRoom = ChatRoom::findOrFail($roomId);

        // Check if the user is authorized to see this room's members
        if (!$chatRoom->participants()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $members = $chatRoom->participants()
            ->select('id', 'name', 'username', 'profile_picture')
            ->get();

        return response()->json($members);
    }

    public function getPublicChatRooms()
    {
        $chatRooms = ChatRoom::withCount('participants as member_count')
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
            'last_message_at' => now(),
        ];

        // Hash password if provided
        if ($request->password) {
            $chatRoomData['password'] = bcrypt($request->password);
        }

        $chatRoom = ChatRoom::create($chatRoomData);

        // Add the creator as a participant
        $chatRoom->participants()->attach($user->id);

        // Manually load the creator relationship and participant count
        $chatRoom->load('creator:id,name,username');
        $chatRoom->loadCount('participants as member_count');

        // Broadcast to creator
        broadcast(new PersonalNotification(
            $user->id,
            'success',
            'You successfully created the chatroom ' . $chatRoom->name . '!',
            [
                'action' => 'created',
                'chatroom' => $chatRoom->toArray()
            ]
        ));

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

        // Check if user is already a member to avoid duplicate events
        $alreadyJoined = $chatRoom->participants()->where('user_id', $user->id)->exists();

        if (!$alreadyJoined) {
            // Add user to participants
            $chatRoom->participants()->attach($user->id);

            // Get updated chat room with member count
            $chatRoom->refresh();
            $chatRoom->loadCount('participants as member_count');

            // Broadcast to <other></other>
            broadcast(new UserJoinedChat($user->id, $chatRoom->id))->toOthers();

            // Personal notification to the user
            broadcast(new PersonalNotification(
                $user->id,
                'success',
                'You joined chatroom: ' . $chatRoom->name . ' successfully!',
                [
                    'action' => 'joined',
                    'chatroom' => $chatRoom->toArray()
                ]
            ));
        }

        // Return the updated chat room data
        return response()->json([
            'message' => "{$user->username} joined the chat",
            'chatroom' => $chatRoom->load('creator:id,name,username')->loadCount('participants as member_count')
        ]);
    }

    public function leaveChatRoom(Request $request)
    {
        try {
            // Retrieve authenticated user and chatroom
            $user = Auth::user();

            // Find the chatroom and log its initial state
            $chatRoom = ChatRoom::findOrFail($request->chat_room_id);

            // Store info before removal
            $chatroomInfo = [
                'id' => $chatRoom->id,
                'name' => $chatRoom->name
            ];

            // Remove user from participants
            $chatRoom->participants()->detach($user->id);

            // Refresh and get updated member count
            $chatRoom->refresh();
            $chatRoom->loadCount('participants as member_count');

            // Broadcast to others that user left the chat
            try {
                broadcast(new UserLeftChat($user->id, $chatRoom->id))->toOthers();
            } catch (\Exception $broadcastError) {
                Log::warning('UserLeftChat Event Broadcast Failed', [
                    'error' => $broadcastError->getMessage(),
                    'user_id' => $user->id,
                    'chatroom_id' => $chatRoom->id
                ]);
            }

            // Personal notification to the user
            try {
                broadcast(new PersonalNotification(
                    $user->id,
                    'info',
                    'You left chatroom: ' . $chatroomInfo['name'] . ' successfully!',
                    [
                        'action' => 'left',
                        'chatroom' => $chatroomInfo
                    ]
                ));
            } catch (\Exception $notificationError) {
                Log::warning('Personal Notification Broadcast Failed', [
                    'error' => $notificationError->getMessage(),
                    'user_id' => $user->id,
                    'chatroom_name' => $chatroomInfo['name']
                ]);
            }

            return response()->json([
                'message' => "{$user->username} left the chat",
                'chatroom' => $chatRoom->load('creator:id,name,username')->loadCount('participants as member_count')
            ]);
        } catch (\Exception $e) {
            // Return error response
            return response()->json([
                'message' => 'Failed to leave chatroom',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
