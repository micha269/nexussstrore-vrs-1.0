<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
// Importante: Asegúrate de importar el modelo Role si está en otra carpeta
// use App\Models\Role;

class User extends Authenticatable {
    use HasApiTokens;

    public function role() {
        // AÑADIMOS 'rol_id' como segundo parámetro para que coincida con tu DB
        return $this->belongsTo(Role::class, 'rol_id');
    }

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'rol_id', // Tu columna real
        'estado',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
