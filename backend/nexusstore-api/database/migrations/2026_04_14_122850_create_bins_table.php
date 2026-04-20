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
        Schema::create('bins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses');
            $table->string('codigo_bin', 50)->unique();
            $table->decimal('capacidad_m3', 10, 4);
            $table->decimal('capacidad_kg', 10, 2);
            $table->enum('estado', ['Disponible', 'Ocupada', 'Bloqueada', 'Dañada'])->default('Disponible');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bins');
    }
};
