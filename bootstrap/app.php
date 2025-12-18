<?php


use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException; 
use Inertia\Inertia; 

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
       // api: __DIR__.'/../routes/api.php', 
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {
    
        // Exclude API routes dari CSRF check
        $middleware->validateCsrfTokens(except: [
            '*',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
              
            // COOKIE
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,

        // SESSION
        \Illuminate\Session\Middleware\StartSession::class,

        // CSRF
        \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,

        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {

        // Import untuk handler di Laravel 12
       

        $exceptions->render(function (Throwable $e, $request) {

            // Tangkap semua exception 403
            if ($e instanceof HttpException && $e->getStatusCode() === 403) {
                return Inertia::render('Errors/403')->toResponse($request);
            }

        });
    })

    ->create();