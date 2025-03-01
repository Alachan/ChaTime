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
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function getBasicInfo($id)
    {
        $user = User::select('id', 'name', 'username', 'profile_picture')
            ->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'nullable|string',
            'profile_picture' => 'nullable|image|max:2048',
            'bio' => 'nullable|string',
        ]);

        if ($request->hasFile('profile_picture')) {
            // Delete the old profile picture if it exists
            if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // Store the new profile picture
            $profileImage = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $profileImage;
        }

        $user->update([
            'name' => $request->name ?? $user->name,
            'bio' => $request->bio ?? $user->bio,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }
}
