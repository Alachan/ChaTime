<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  ...$guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        // Explicitly check common guards (session-based & token-based)
        $guards = empty($guards) ? ['sanctum', null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                Log::info('Redirecting authenticated user from auth pages', [
                    'user_id' => Auth::guard($guard)->id(),
                    'guard' => $guard,
                    'from' => $request->path(),
                    'to' => '/teahub'
                ]);

                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Already authenticated'], 200);
                }

                return redirect('/teahub');
            }
        }

        return $next($request);
    }
}