<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Laravel por defecto busca la tabla 'roles', así que esto es opcional pero seguro
    protected $table = 'roles';

    // Campos que se pueden llenar
    protected $fillable = ['nombre_rol', 'descripcion'];
}
