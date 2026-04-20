<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Esto obliga al modelo a usar la tabla en inglés aunque el archivo se llame distinto
    protected $table = 'products';

    protected $fillable = ['nombre', 'sku', 'precio', 'descripcion'];
}

