<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatRoomController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/login', [AuthController::class, 'login'])->name('api.login');;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/send-message', [MessageController::class, 'sendMessage']);
    Route::post('/edit-message/{id}', [MessageController::class, 'editMessage']);
    Route::post('/user-typing', [ChatRoomController::class, 'userTyping']);
    Route::post('/join-chat-room', [ChatRoomController::class, 'joinChatRoom']);
    Route::post('/leave-chat-room', [ChatRoomController::class, 'leaveChatRoom']);
});
