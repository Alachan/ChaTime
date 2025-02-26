<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatRoom extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'created_by',
        'is_private',
        'password',
        'last_message_at',
    ];

    protected $hidden = ['password']; // Hide password field when returning JSON

    protected $casts = [
        'is_private' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    /**
     * Relationship: A ChatRoom belongs to a user (creator).
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: A ChatRoom has many messages.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Relationship: Many-to-Many - Users in a ChatRoom.
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'chat_room_user')
            ->withTimestamps();
    }
}