<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class roleseeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
    {
        DB::table('roles')->insert([
            ['id' => 1, 'nombre_rol' => 'superadmin', 'descripcion' => 'Desarrollador con control total del sistema'],
            ['id' => 2, 'nombre_rol' => 'admin', 'descripcion' => 'Dueño de la bodega, gestiona usuarios y reportes'],
            ['id' => 3, 'nombre_rol' => 'bodeguero', 'descripcion' => 'Empleado que gestiona entradas y salidas de stock'],
            ['id' => 4, 'nombre_rol' => 'cliente', 'descripcion' => 'Visitante que solo puede consultar productos'],
        ]);
    }

    }

