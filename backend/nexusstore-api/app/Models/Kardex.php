<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kardex extends Model
{
    protected $table='kardex';
    protected $fillable = [
        'lot_id',
        'user_id',
        'tipo_de_movimiento',
        'cantidad',
        'referencia_documento '


    ];
    //un registro de cardex pertenece a un lote
    public function lot(){
        return $this-> belongsTo(Lot::class);
    }
    //un registro de kardex fue creado por ususario
    public function user(){
        return $this ->belongsTo(User::class);
    }

}
