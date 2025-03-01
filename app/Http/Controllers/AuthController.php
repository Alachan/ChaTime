<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // Register a new user
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'name' => 'required|string',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name,
        ]);

        // Create a Sanctum token and return it
        $token = $user->createToken('auth_token')->plainTextToken;

        // Create the cookie explicitly
        $cookie = cookie(
            'auth_token',     // Cookie name
            $token,           // Cookie value
            60 * 24 * 7,      // Duration in minutes
            '/',              // Path
            null,     // Domain (null = current domain)
            false,            // Secure (set to false for testing)
            false,            // HttpOnly (set to false for testing)
            false,            // Raw
            'lax'             // SameSite
        );

        // Debug for server-side logging
        Log::info('Setting auth cookie', [
            'token' => $token,
            'cookie_created' => !empty($cookie)
        ]);

        return response()
            ->json([
                'user' => $user,
                'token' => $token,
            ])
            ->cookie($cookie);
    }

    // Login user and return token
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Create the cookie explicitly
        $cookie = cookie(
            'auth_token',     // Cookie name
            $token,           // Cookie value
            60 * 24 * 7,      // Duration in minutes
            '/',              // Path
            '.127.0.0.1',             // Domain (null = current domain)
            false,            // Secure (set to false for testing)
            false,            // HttpOnly (set to false for testing)
            false,            // Raw
            'lax'             // SameSite
        );

        // Debug for server-side logging
        Log::info('Setting auth cookie', [
            'token' => $token,
            'cookie_created' => !empty($cookie)
        ]);

        return response()
            ->json([
                'user' => $user,
                'token' => $token,
            ])
            ->cookie($cookie);
    }

    // Logout user
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
