<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatRoomController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/login', [AuthController::class, 'login'])->name('api.login');;

Route::middleware('auth:sanctum')->group(function () {
    // User related routes
    Route::get('/user', [UserController::class, 'me']);
    Route::get('/users/{id}/basic', [UserController::class, 'getBasicInfo']);
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // Chat related routes
    Route::get('/chatrooms/{roomId}/members', [ChatRoomController::class, 'getMembers']);
    Route::get('/chatrooms/joined', [ChatRoomController::class, 'getJoinedChatRooms']);
    Route::get('/chatrooms/public', [ChatRoomController::class, 'getPublicChatRooms']);
    Route::post('/create-chatroom', [ChatRoomController::class, 'createChatRoom']);
    Route::post('/join-chatroom', [ChatRoomController::class, 'joinChatRoom']);
    Route::post('/leave-chatroom', [ChatRoomController::class, 'leaveChatRoom']);
    Route::post(
        '/user-typing',
        [ChatRoomController::class, 'userTyping']
    );
    // Message related routes
    Route::get('/messages/{chatRoomId}', [MessageController::class, 'getMessages']);
    Route::post('/send-message', [MessageController::class, 'sendMessage']);
    Route::post('/edit-message/{id}', [MessageController::class, 'editMessage']);
    Route::delete('/delete-message/{id}', [MessageController::class, 'deleteMessage']);
});
