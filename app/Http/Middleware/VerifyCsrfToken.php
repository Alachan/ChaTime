<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*',
        'api/api/*',
        'broadcasting/auth',
    ];

    /**
     * Determine if the request has a URI that should pass through CSRF verification.
     */
    protected function inExceptArray($request)
    {
        // Disable CSRF in production (Vercel) since we use token auth
        if (env('APP_ENV') === 'production') {
            return true;
        }

        return parent::inExceptArray($request);
    }
}