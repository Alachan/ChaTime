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
        try {
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
                request()->secure(), // Change to true for HTTPS
                true, // Change to true for security
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
        } catch (ValidationException $e) {
            // Re-throw validation exceptions to be handled by Laravel's validator
            throw $e;
        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Authentication failed. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    // Login user and return token
    public function login(Request $request)
    {
        try {
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
                null,             // Domain (null = current domain)
                request()->secure(), // Change to true for HTTPS
                true, // Change to true for security
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
        } catch (ValidationException $e) {
            // Re-throw validation exceptions to be handled by Laravel's validator
            throw $e;
        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Authentication failed. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    // Logout user
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        // Clear the cookie
        cookie()->forget('auth_token');

        return response()->json(['message' => 'Logged out successfully']);
    }
}