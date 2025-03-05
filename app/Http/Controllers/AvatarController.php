<?php

namespace App\Http\Controllers;

use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AvatarController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:4600', // max 2MB
        ]);

        $file = $request->file('avatar');

        // Initialize Cloudinary
        $cloudinary = new Cloudinary([
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key'    => env('CLOUDINARY_API_KEY'),
            'api_secret' => env('CLOUDINARY_API_SECRET'),
        ]);

        // Upload the image
        $uploadResult = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => 'profile_pictures/' . Auth::id(), // Store avatars in user-specific folders
            'transformation' => [
                'width' => 250,
                'height' => 250,
                'crop' => 'fill' // Resize image
            ],
        ]);

        // Get the image URL
        $imageUrl = $uploadResult['secure_url'];

        // Save to the user profile (assuming you have an `avatar` column in users table)
        Auth::user()->update(['profile_picture' => $imageUrl]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => $imageUrl,
        ]);
    }
}