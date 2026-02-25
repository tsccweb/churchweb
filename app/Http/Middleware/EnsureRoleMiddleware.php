<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role = null): Response
    {
        // If no role specified, allow through
        if (!$role) {
            return $next($request);
        }

        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Get the user's role
        $userRole = $request->user()->role;

        // Check if user has required role
        if ($userRole !== $role) {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        return $next($request);
    }
}
