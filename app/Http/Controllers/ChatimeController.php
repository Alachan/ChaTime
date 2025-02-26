<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class ChatimeController extends Controller
{

    public function index(Request $request)
    {
        // Add debugging
        Log::info('User attempting to access chatime:', [
            'authenticated' => Auth::check(),
            'user' => Auth::user(),
            'token' => $request->bearerToken()
        ]);

        return Inertia::render('Chatime', [
            'user' => Auth::user(),
        ]);
    }
}
