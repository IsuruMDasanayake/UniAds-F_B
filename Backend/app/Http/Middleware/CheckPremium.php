<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPremium
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
{
    $user = auth()->user();

    // Check if user is not an institute
    if ($user->role !== 'Institute') {
        return abort(403, 'Only institute accounts can access this page.');
    }

    $institute = $user->institute;

    // Check if the institute is not premium or expired
    if (!$institute || !$institute->hasActivePremium()) {
        return redirect()->route('pricing')->with('error', 'You need a premium subscription to access this feature.');
    }

    return $next($request);
}

}
