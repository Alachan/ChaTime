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
    Route::post('/user/update', [UserController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Chatroom resource routes
    Route::get('/chatrooms', [ChatRoomController::class, 'getAllChatRooms']);
    Route::get('/chatrooms/joined', [ChatRoomController::class, 'getJoinedChatRooms']);
    Route::post('/chatrooms', [ChatRoomController::class, 'createChatRoom']);
    // Membership actions as separate endpoints
    Route::post('/chatrooms/join', [ChatRoomController::class, 'joinChatRoom']);
    Route::post('/chatrooms/leave', [ChatRoomController::class, 'leaveChatRoom']);
    // Activity indicators
    Route::post('/chatrooms/typing', [ChatRoomController::class, 'userTyping']);

    // Message related routes
    Route::get('/messages/{chatRoomId}', [MessageController::class, 'getMessages']);
    Route::post('/messages', [MessageController::class, 'sendMessage']);
    Route::post('/messages/{id}', [MessageController::class, 'editMessage']);
    Route::delete('/messages/{id}', [MessageController::class, 'deleteMessage']);
    // System message route
    Route::post('/messages/system', [MessageController::class, 'sendSystemMessage']);
});