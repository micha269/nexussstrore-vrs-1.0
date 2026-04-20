<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User; // Asegúrate de que la 'A' de App sea mayúscula
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validar datos
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Buscar usuario con su relación de rol
        $user = User::with('role')->where('email', trim($request->email))->first();

        // Verificar si el usuario existe y la contraseña es correcta
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // 3. GENERAR EL TOKEN (Esto es lo que te faltaba)
        // Usamos Sanctum para crear una llave única para esta sesión
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. RESPONDER A REACT
        // Enviamos el token y los datos del usuario (incluyendo el nombre del rol)
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->role->nombre_rol // Esto sirve para los niveles de acceso en React
            ]
        ]);
    }
    public function logout(Request $request)
    {
        // Revoca el token que se está usando actualmente
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente en NexusStore'
        ]);
    }
}
