<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Message;
use App\Models\ChatRoom;
use App\Events\MessageSent;
use App\Events\MessageEdited;
use App\Events\MessageDeleted;
use App\Services\SystemMessageService;


class MessageController extends Controller
{
    /**
     * Get messages for a specific chat room with pagination
     */
    public function getMessages($chatRoomId, Request $request)
    {
        try {
            // Verify that the user is a member of this chat room
            $user = Auth::user();
            $chatRoom = ChatRoom::findOrFail($chatRoomId);

            if (!$chatRoom->participants->contains($user->id)) {
                return response()->json(['error' => 'You are not a member of this chat room'], 403);
            }

            // Get when this user joined the chatroom
            $userJoinedAt = $chatRoom->participants()
                ->where('user_id', $user->id)
                ->first()->pivot->created_at;

            $beforeId = $request->query('before_id');
            $pageSize = min(intval($request->query('page_size', 50)), 100);

            // Base query - start with most recent messages
            $query = Message::where('chat_room_id', $chatRoomId)
                ->with('user:id,name,username,profile_picture');

            // Filter out user's own join/leave messages and others' welcome messages
            $query->where(function ($q) use ($user) {
                $q->whereNot(function ($exclude) use ($user) {
                    $exclude->where('user_id', $user->id)
                        ->where('message_type', 'system')
                        ->where(function ($content) {
                            $content->where('message', 'like', '%joined for a sip%')
                                ->orWhere('message', 'like', '%left for other refreshment%');
                        });
                });
            })->where(function ($q) use ($user) {
                $q->whereNot(function ($exclude) use ($user) {
                    $exclude->where('user_id', '!=', $user->id)
                        ->where('message_type', 'system')
                        ->where('message', 'like', '%Enjoy the new tea%');
                });
            });

            // Apply pagination if a before_id is provided
            if ($beforeId) {
                $query->where('id', '<', $beforeId);
            } else {
                // Only show messages sent after the user joined the chatroom
                $query->where(function ($q) use ($userJoinedAt, $user) {
                    $q->where('sent_at', '>=', $userJoinedAt)
                        ->orWhere('user_id', $user->id);
                });
            }

            // Get messages in chunks for pagination
            $messages = $query->orderBy('id', 'desc')  // Most recent first for pagination
                ->limit($pageSize)
                ->get()
                ->sortBy('id')  // Then sort to display oldest first
                ->values();

            // Check if there are more messages to load
            $oldestLoadedId = $messages->first() ? $messages->first()->id : null;
            $hasMoreMessages = false;

            if ($oldestLoadedId) {
                $hasMoreMessages = Message::where('chat_room_id', $chatRoomId)
                    ->where('id', '<', $oldestLoadedId)
                    ->exists();
            }

            return response()->json([
                'messages' => $messages,
                'has_more' => $hasMoreMessages,
                'oldest_id' => $oldestLoadedId,
            ]);
        } catch (\Exception $e) {
            // Log any unexpected errors
            Log::error('GetMessages Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred while fetching messages',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function sendMessage(Request $request)
    {
        try {
            $request->validate([
                'chat_room_id' => 'required|exists:chat_rooms,id',
                'message' => 'required|string|max:10000',
            ]);

            $message = Message::create([
                'user_id' => Auth::id(),
                'chat_room_id' => $request->chat_room_id,
                'message' => $request->message,
                'sent_at' => now(),
            ]);

            // Update the last message timestamp
            $chatRoom = ChatRoom::findOrFail($request->chat_room_id);
            $chatRoom->update(['last_message_at' => now()]);

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
        try {
            $request->validate([
                'message' => 'required|string|max:10000',
            ]);

            $message = Message::findOrFail($id);

            // Check if the authenticated user is the owner of this message
            if ($message->user_id !== Auth::id()) {
                return response()->json(['error' => 'You can only edit your own messages'], 403);
            }

            // Check if message is system or admin type (can't be edited)
            if ($message->message_type !== 'user' && $message->message_type !== null) {
                return response()->json(['error' => 'System messages cannot be edited'], 403);
            }

            // Update the message
            $message->message = $request->message;
            $message->edited_at = now();
            $message->save();

            // Update the last message timestamp
            $chatRoom = $message->chatRoom;
            $chatRoom->update(['last_message_at' => now()]);

            // Broadcast the edit event to others
            broadcast(new MessageEdited($message, $message->chat_room_id))->toOthers();

            return response()->json([
                'id' => $message->id,
                'message' => $message->message,
                'edited_at' => $message->edited_at->toIso8601String()
            ]);
        } catch (\Exception $e) {
            Log::error('Message edit error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message_id' => $id
            ]);

            return response()->json(['error' => 'Failed to edit message: ' . $e->getMessage()], 500);
        }
    }

    public function deleteMessage($id)
    {
        try {
            $message = Message::findOrFail($id);

            $chatRoomId = $message->chat_room_id;

            // Check if the authenticated user is the owner of this message
            if ($message->user_id !== Auth::id()) {
                return response()->json(['error' => 'You can only delete your own messages'], 403);
            }

            $message->delete();

            broadcast(new MessageDeleted((int) $id, $chatRoomId))->toOthers();

            return response()->json(['message' => 'Deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Message delete error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message_id' => $id
            ]);

            return response()->json([
                'error' => 'Failed to delete message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a system message to a chatroom
     * This would typically be an admin function
     */
    public function sendSystemMessage(Request $request)
    {
        // Require admin role for this action
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'chat_room_id' => 'required|exists:chat_rooms,id',
            'message' => 'required|string',
            'message_type' => 'required|in:system,admin'
        ]);

        try {
            // Use appropriate method based on message type
            if ($request->message_type === Message::TYPE_ADMIN) {
                $message = SystemMessageService::adminMessage(
                    $request->chat_room_id,
                    $request->message,
                    $request->Auth::user()
                );
            } else {
                $message = SystemMessageService::create(
                    $request->chat_room_id,
                    $request->message,
                    Message::TYPE_SYSTEM
                );
            }

            return response()->json($message);
        } catch (\Exception $e) {
            Log::error('System message send error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Failed to send system message'], 500);
        }
    }
}