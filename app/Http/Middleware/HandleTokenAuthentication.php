<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HandleTokenAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        $bearerToken = $request->bearerToken();
        $cookieToken = $request->cookie('auth_token');

        Log::info('Auth Check', [
            'url' => $request->url(),
            'has_bearer' => !empty($bearerToken),
            'has_cookie' => !empty($cookieToken),
            'cookie_value' => $cookieToken
        ]);

        // If there is no Authorization header, but a cookie exists, set the Authorization header
        if (!$bearerToken && $cookieToken) {
            $request->headers->set('Authorization', 'Bearer ' . $cookieToken);
            Log::info('Set bearer from cookie');
        }

        return $next($request);
    }
}
