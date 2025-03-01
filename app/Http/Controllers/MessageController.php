<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use App\Models\ChatRoom;
use App\Events\MessageSent;
use App\Events\MessageEdited;
use App\Events\MessageDeleted;
use Illuminate\Support\Facades\Log;


class MessageController extends Controller
{
    /**
     * Get messages for a specific chat room with pagination
     */
    public function getMessages($chatRoomId, Request $request)
    {
        // Verify that the user is a member of this chat room
        $user = Auth::user();
        $chatRoom = ChatRoom::findOrFail($chatRoomId);

        if (!$chatRoom->participants->contains($user->id)) {
            return response()->json(['error' => 'You are not a member of this chat room'], 403);
        }

        // Get when this user joined the chatroom
        $userJoinedAt = $chatRoom->participants()->where('user_id', $user->id)->first()->pivot->created_at;

        // Example: /api/messages/5?show_historical=true&before_id=123&page_size=50
        // Find if we should show historical messages (before the user joined)
        $showHistorical = $request->query('show_historical', false);

        // Get the before_id for pagination (load messages before this ID)
        $beforeId = $request->query('before_id');

        // Default page size
        $pageSize = min(intval($request->query('page_size', 50)), 100);

        // Base query
        $query = Message::where('chat_room_id', $chatRoomId)
            ->with('user:id,name,username,profile_picture');

        // Apply historical message filter if needed
        if (!$showHistorical) {
            $query->where(function ($q) use ($userJoinedAt, $user) {
                $q->where('created_at', '>=', $userJoinedAt)
                    ->orWhere('user_id', $user->id);
            });
        }

        // Apply pagination if a before_id is provided
        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        // Get messages in descending order for pagination, but return in ascending order
        $messages = $query->orderBy('id', 'desc')
            ->limit($pageSize)
            ->get()
            ->sortBy('id')
            ->values();

        // Check if there are more messages to load
        $hasMore = $beforeId ? $query->count() >= $pageSize : false;

        return response()->json([
            'messages' => $messages,
            'has_more' => $hasMore,
            'oldest_id' => $messages->first() ? $messages->first()->id : null,
        ]);
    }

    public function sendMessage(Request $request)
    {
        try {
            Log::info('Message send attempt', [
                'user_id' => Auth::id(),
                'chat_room_id' => $request->chat_room_id,
                'message' => $request->message
            ]);

            $message = Message::create([
                'user_id' => Auth::id(),
                'chat_room_id' => $request->chat_room_id,
                'message' => $request->message,
                'sent_at' => now(),
            ]);

            broadcast(new MessageSent($message))->toOthers();

            return response()->json($message);
        } catch (\Exception $e) {
            Log::error('Message send error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }

    public function editMessage(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        $message->update([
            'message' => $request->message,
            'edited_at' => now(),
        ]);

        broadcast(new MessageEdited($message))->toOthers();

        return response()->json($message);
    }

    public function deleteMessage($id)
    {
        $message = Message::findOrFail($id);

        $chatRoomId = $message->chat_room_id;
        $message->delete();

        broadcast(new MessageDeleted($id, $chatRoomId))->toOthers();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
