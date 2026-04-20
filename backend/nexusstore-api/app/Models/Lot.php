<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class lot extends Model
{
    protected $fillable = [
        'product_id','bin_id', 'numero_lote',
        'fecha_vencimiento','stock_fisico', 'stock_reservado'
    ];
    //relacion inversa un lote pertenece a un producto
    public function product(){
        return $this->belongsTo(Product::class);

    }
    public function movements(){
        return $this->hasMany(kardex::class);
    }
}
