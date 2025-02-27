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
        // Add debugging
        Log::info('User attempting to access TeaHub:', [
            'authenticated' => Auth::check(),
            'user' => Auth::user(),
            'token' => $request->bearerToken()
        ]);

        return Inertia::render('TeaHub', [
            'user' => Auth::user(),
        ]);
    }
}
