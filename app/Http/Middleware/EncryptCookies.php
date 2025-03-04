<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;
use Closure;
use Illuminate\Support\Facades\Log;

class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array
     */
    protected $except = [
        'auth_token', // Ensure this cookie is not encrypted
    ];

    /**
     * Handle the incoming request.
     */
    public function handle($request, Closure $next)
    {
        // Log that middleware is running
        Log::info('EncryptCookies middleware is running.');

        // Log the cookies received in the request
        Log::info('Request Cookies:', $request->cookies->all());

        // Log excluded cookies to confirm 'auth_token' is skipped
        Log::info('Excluded cookies:', $this->except);

        return parent::handle($request, $next);
    }
}