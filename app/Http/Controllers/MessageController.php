<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use App\Events\MessageSent;
use App\Events\MessageEdited;
use App\Events\MessageDeleted;

class MessageController extends Controller
{
    public function sendMessage(Request $request) {
        $message = Message::create([
            'user_id' => Auth::id(),
            'chat_room_id' => $request->chat_room_id,
            'message' => $request->message,
            'sent_at' => now(),
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function editMessage(Request $request, $id) {
        $message = Message::findOrFail($id);

        $message->update([
            'message' => $request->message,
            'edited_at' => now(),
        ]);

        broadcast(new MessageEdited($message))->toOthers();

        return response()->json($message);
    }

    public function deleteMessage($id) {
        $message = Message::findOrFail($id);

        $chatRoomId = $message->chat_room_id;
        $message->delete();

        broadcast(new MessageDeleted($id, $chatRoomId))->toOthers();

        return response()->json(['message' => 'Deleted successfully']);
    }
}