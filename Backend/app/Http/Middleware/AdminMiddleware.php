<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Illuminate\Support\Facades\Log::info('AdminMiddleware called. Auth check: ' . (auth()->check() ? 'Yes' : 'No'));
        if (auth()->check()) {
            \Illuminate\Support\Facades\Log::info('User role: ' . auth()->user()->role);
        }

        if (!auth()->check() || auth()->user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized: Admin access required.'], 403);
        }

        return $next($request);
    }
}
