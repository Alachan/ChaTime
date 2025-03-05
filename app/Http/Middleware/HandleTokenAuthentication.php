<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;

class HandleTokenAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        $bearerToken = $request->bearerToken();
        $encryptedCookieToken = $request->cookie('auth_token');

        Log::info('Auth Check', [
            'url' => $request->url(),
            'has_bearer' => !empty($bearerToken),
            'has_cookie' => !empty($encryptedCookieToken),
            'cookie_value' => $encryptedCookieToken
        ]);

        // If there is no Authorization header, but an encrypted cookie exists
        if (!$bearerToken && $encryptedCookieToken) {
            try {
                // Decrypt the cookie value to get the actual token
                $decryptedToken = Crypt::decrypt($encryptedCookieToken);

                // Set the decrypted token as the Bearer token
                $request->headers->set('Authorization', 'Bearer ' . $decryptedToken);
                Log::info('Set bearer from decrypted cookie', ['decrypted' => $decryptedToken]);
            } catch (\Exception $e) {
                Log::error('Failed to decrypt auth_token cookie', [
                    'error' => $e->getMessage(),
                    'encrypted_value' => $encryptedCookieToken
                ]);
            }
        }

        return $next($request);
    }
}
