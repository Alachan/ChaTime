<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleSanctumToken
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->bearerToken()) {
            return $next($request);
        }

        if ($request->hasHeader('X-XSRF-TOKEN') && $request->hasCookie('XSRF-TOKEN')) {
            return $next($request);
        }

        if ($request->is('api/*')) {
            return $next($request);
        }

        return redirect()->route('login');
    }
}