<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration controls what cross-origin requests may execute
    | within your application. These settings ensure the security of your
    | API when accessed from different frontends (e.g., your React app).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'], // Allow all request methods (GET, POST, PUT, DELETE, etc.)

    'allowed_origins' => ['http://127.0.0.1:8000', 'http://127.0.0.1:8001', 'http://localhost:5173'], // Add Vite's dev server if using it

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Allow all headers

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
