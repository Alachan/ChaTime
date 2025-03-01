<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TeaHubController;
use App\Http\Middleware\RedirectIfAuthenticated;

// Auth routes (login/register) with middleware to redirect if already authenticated
Route::middleware([RedirectIfAuthenticated::class])->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Login');
    })->name('login');

    Route::get('/register', function () {
        return Inertia::render('Register');
    })->name('register');
});

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/teahub', [TeaHubController::class, 'index'])->name('teahub');
});
