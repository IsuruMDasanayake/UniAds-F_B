<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use App\Traits\ApiResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponse;

    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Custom 500 JSON Response with Correlation ID
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                // Determine the correct status code
                $status = 500;
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $status = 401;
                }

                if ($status >= 500) {
                    $correlationId = Str::uuid()->toString();
                    
                    // Log the detailed error with the ID for tracking
                    Log::error("Server Error [{$correlationId}]: " . $e->getMessage(), [
                        'exception' => $e,
                        'url' => $request->fullUrl(),
                        'input' => $request->all(),
                    ]);

                    return $this->error(
                        'A server error occurred. Please contact support with the reference ID below.', 
                        500, 
                        null, 
                        $correlationId
                    );
                }
            }
        });
    }
}
