<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller {

    /** * Listar todos los usuarios con sus roles */
    public function index() {
        $users = DB::table('users')
            ->join('roles', 'users.rol_id', '=', 'roles.id') // <-- CAMBIADO: rol_id
            ->select('users.id', 'users.name', 'users.username', 'users.email', 'roles.nombre_rol as rol', 'users.created_at')
            ->get();
        return response()->json($users);
    }

    /** * Crear un nuevo usuario */
    public function store(Request $request) {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|min:6',
            'rol_id'   => 'required|exists:roles,id' // <-- CAMBIADO: rol_id
        ]);

        try {
            $user = User::create([
                'name'     => $validated['name'],
                'username' => $validated['username'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'rol_id'   => $validated['rol_id'], // <-- CAMBIADO: rol_id
                'estado'   => 'Activo' // Opcional: Para que no sea null si la DB lo pide
            ]);
            return response()->json(['status' => 'success', 'message' => 'Usuario creado']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /** * Restablecer contraseña */
    public function resetPassword(Request $request, $id) {
        $request->validate([ 'password' => ['required', Password::min(6)] ]);
        try {
            $user = User::findOrFail($id);
            $user->password = Hash::make($request->password);
            $user->save();
            return response()->json([ 'status' => 'success', 'message' => 'La contraseña ha sido actualizada correctamente' ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 'error', 'message' => 'No se pudo actualizar la contraseña' ], 500);
        }
    }

    /** * Eliminar un usuario */
    public function destroy($id) {
        try {
            if (auth()->id() == $id) {
                return response()->json([ 'status' => 'error', 'message' => 'No puedes eliminar tu propia cuenta' ], 403);
            }
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json([ 'status' => 'success', 'message' => 'Usuario eliminado correctamente' ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 'error', 'message' => 'Error al eliminar el usuario' ], 500);
        }
    }
}
