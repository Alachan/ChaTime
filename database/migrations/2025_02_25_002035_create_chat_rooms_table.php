<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Name of the chat room
            $table->text('description')->nullable(); // Description of the chat room
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // User who created the chat room
            $table->boolean('is_private')->default(false); // Indicates if the chat room is private
            $table->timestamp('last_message_at')->nullable(); // Timestamp of the last message sent in the chat room
            $table->timestamps();
            $table->softDeletes(); // Soft delete column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_rooms');
    }
};