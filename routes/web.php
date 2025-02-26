<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ChatimeController;

// Redirect `/` to `/login` if not authenticated
// Route::get('/', function () {
//     return auth()->check()
//         ? redirect()->route('chatime')
//         : redirect()->route('login');
// });

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
})->name('register');

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/chatime', [ChatimeController::class, 'index'])->name('chatime');
});
