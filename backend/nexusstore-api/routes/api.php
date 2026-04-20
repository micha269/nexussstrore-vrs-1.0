<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController; // Importamos el nuevo controlador
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// 1. Rutas Públicas
Route::get('/check', function () {
    return response()->json(['status' => 'Conectado', 'proyecto' => 'NexusStore API']);
});

Route::post('/login', [AuthController::class, 'login']);

// 2. Rutas Protegidas
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/perfil', function (Request $request) {
        return $request->user()->load('role');
    });

    // Productos (NexusStore CRUD)
    Route::get('/productos', [ProductController::class, 'index']);
    Route::post('/productos', [ProductController::class, 'store']);
    Route::delete('/productos/{id}', [ProductController::class, 'destroy']);
    Route::put('/productos/{id}', [ProductController::class, 'update']);

    // Reportes
    Route::get('/reportes/movimientos', [ProductController::class, 'getMovimientos']);

    // --- GESTIÓN DE USUARIOS ---
    Route::get('/usuarios', [UserController::class, 'index']);           // Listar
    Route::post('/usuarios', [UserController::class, 'store']);          // Crear
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy']); // Eliminar
    Route::put('/usuarios/{id}/reset-password', [UserController::class, 'resetPassword']); // Recuperar/Cambiar pass

});
