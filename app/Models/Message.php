<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    // The attributes that are mass assignable.
    protected $fillable = [
        'user_id',
        'chat_room_id',
        'message',
        'is_read',
        'sent_at',
        'received_at',
        'edited_at',
    ];

    // The attributes that should be cast to native types.
    protected $casts = [
        'is_read' => 'boolean',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
        'edited_at' => 'datetime',
    ];

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