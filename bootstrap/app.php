<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Routing\Middleware\SubstituteBindings;
use App\Http\Middleware\HandleTokenAuthentication;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Http\Middleware\ValidatePostSize;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyCsrfToken;
use App\Http\Middleware\EncryptCookies;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->use([
            PreventRequestsDuringMaintenance::class,
            ValidatePostSize::class,
            ConvertEmptyStringsToNull::class,
        ]);

        $middleware->api(append: [
            HandleTokenAuthentication::class,
            // For API routes, you need stateful requests so cookies work with tokens
            EnsureFrontendRequestsAreStateful::class,
            SubstituteBindings::class,
        ]);

        // Build web middleware array
        $webMiddleware = [
            EncryptCookies::class,
            HandleTokenAuthentication::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            ShareErrorsFromSession::class,
        ];

        // Only add CSRF protection in non-production (we use token auth in production)
        if (env('APP_ENV') !== 'production') {
            $webMiddleware[] = VerifyCsrfToken::class;
        }

        $webMiddleware[] = SubstituteBindings::class;
        $webMiddleware[] = HandleInertiaRequests::class;
        $webMiddleware[] = AddLinkHeadersForPreloadedAssets::class;

        $middleware->web(append: $webMiddleware);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
