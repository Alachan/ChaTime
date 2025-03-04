<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Return the authenticated user's data.
     */
    public function me(Request $request)
    {
        // Try session-based authentication
        // if (Auth::check()) {
        //     return response()->json(['user' => Auth::user()]);
        // }

        // Try API token-based authentication
        $user = $request->user();
        if ($user) {
            return response()->json(['user' => $user]);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'nullable|string',
            'profile_picture_url' => 'nullable|url', // Now we expect a URL instead of a file
            'bio' => 'nullable|string',
        ]);

        // Update the user with the provided data
        $user->update([
            'name' => $request->name ?? $user->name,
            'profile_picture' => $request->profile_picture_url ?? $user->profile_picture,
            'bio' => $request->bio ?? $user->bio,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }
}