<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    // Disable Laravel's default timestamps
    public $timestamps = false;

    // The attributes that are mass assignable.
    protected $fillable = [
        'user_id',
        'chat_room_id',
        'message',
        'message_type',
        'sent_at',
        'edited_at',
    ];

    // The attributes that should be cast to native types.
    protected $casts = [
        'sent_at' => 'datetime',
        'edited_at' => 'datetime',
    ];

    // Message type constants
    const TYPE_USER = 'user';         // Regular user message
    const TYPE_SYSTEM = 'system';     // System info message
    const TYPE_ADMIN = 'admin';       // Admin message

    // Define the relationship with the User model.
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Define the relationship with the ChatRoom model.
    public function chatRoom()
    {
        return $this->belongsTo(ChatRoom::class);
    }
}