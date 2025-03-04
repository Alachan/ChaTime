<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class TeaHubController extends Controller
{

    public function index(Request $request)
    {
        // Debug the actual authentication state
        Log::info('TeaHub Access Debug:', [
            'authenticated' => Auth::check(),
            'user' => Auth::user(),
            'token' => $request->bearerToken(),
            'session_has_auth' => $request->session()->has('auth.password_confirmed_at'),
            'cookie_token' => $request->cookie('auth_token')
        ]);

        if (!Auth::check()) {
            Log::warning('User not authenticated, redirecting to login');
            return redirect()->route('login');
        }

        return Inertia::render('TeaHub', [
            'user' => Auth::user(),
        ]);
    }
}