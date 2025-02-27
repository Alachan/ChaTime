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
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // User is logged in, redirect to ChatSpace
                Log::info('Redirecting authenticated user from auth pages', [
                    'user_id' => Auth::id(),
                    'from' => $request->path(),
                    'to' => '/chatspace'
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
