<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kardex', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lot_id')->constrained('lots');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('tipo_movimiento', ['Entrada', 'Salida', 'Ajuste', 'Traslado']);
            $table->integer('cantidad');
            $table->string('referencia_documento')->nullable(); // OC o Factura
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kardex');
    }
};
