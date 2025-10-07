<?php


use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Core\ColumnController;
use App\Http\Controllers\Core\TaskController;
use App\Http\Controllers\Core\WorkSpaceController;
use Illuminate\Support\Facades\Route;

// CSRF Protection for SPA
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/check-auth', [AuthController::class, 'checkAuth']);

    // Workspaces
    Route::apiResource('workspaces', WorkSpaceController::class);

    // Columns
    Route::apiResource('columns', ColumnController::class)->except(['index', 'show']);
    Route::put('/columns/{column}/reorder', [ColumnController::class, 'reorder']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::put('/tasks/{task}/move', [TaskController::class, 'move']);
});
