<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Return the authenticated user's data.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    // public function updateProfile(Request $request)
    // {
    //     $user = Auth::user();

    //     $request->validate([
    //         'name' => 'nullable|string',
    //         'username' => 'nullable|string|unique:users,username,' . $user->id,
    //         'profile_picture' => 'nullable|image|max:2048',
    //         'bio' => 'nullable|string',
    //     ]);

    //     if ($request->hasFile('profile_picture')) {
    //         $profileImage = $request->file('profile_picture')->store('profile_pictures', 'public');
    //         $user->profile_picture = $profileImage;
    //     }

    //     $user->update([
    //         'name' => $request->name ?? $user->name,
    //         'username' => $request->username ?? $user->username,
    //         'bio' => $request->bio ?? $user->bio,
    //     ]);

    //     return response()->json([
    //         'message' => 'Profile updated successfully',
    //         'user' => $user,
    //     ]);
    // }
}