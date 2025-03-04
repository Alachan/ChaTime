<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TeaHubController;
use App\Http\Middleware\RedirectIfAuthenticated;

// Guest routes
Route::middleware(['guest'])->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Login');
    })->name('login');

    Route::get('/register', function () {
        return Inertia::render('Register');
    })->name('register');
});

// Authenticated routes
Route::middleware(['auth:sanctum', 'web'])->group(function () {
    Route::get('/teahub', [TeaHubController::class, 'index'])->name('teahub');
});

// Fallback route - redirect to login if not logged in
Route::get('/', function () {
    return redirect('/login');
});