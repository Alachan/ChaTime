<?php

use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Routing\Middleware\SubstituteBindings;

class Kernel extends \Illuminate\Foundation\Http\Kernel {
    protected $middlewareGroups = [
        'api' => [
            EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            SubstituteBindings::class,
        ],

        'web' => [
            \App\Http\Middleware\HandleSanctumToken::class,
        ],
    ];
}
