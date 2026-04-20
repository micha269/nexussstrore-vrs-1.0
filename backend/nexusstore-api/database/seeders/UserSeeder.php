<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. SUPERADMIN (TÚ)
        User::create([
            'name'     => 'Super Administrador',
            'username' => 'superadmin',
            'email'    => 'superadmin@nexusstore.com',
            'password' => Hash::make('admin123'),
            'rol_id'   => 1, // El ID que definimos en el RoleSeeder
            'estado'   => 'Activo',
        ]);

        // 2. ADMIN (DUEÑO)
        User::create([
            'name'     => 'Dueño de Bodega',
            'username' => 'admin_bodega',
            'email'    => 'admin@nexusstore.com',
            'password' => Hash::make('admin123'),
            'rol_id'   => 2,
            'estado'   => 'Activo',
        ]);

        // 3. BODEGUERO (EMPLEADO)
        User::create([
            'name'     => 'Empleado Bodeguero',
            'username' => 'bodeguero_01',
            'email'    => 'bodeguero@nexusstore.com',
            'password' => Hash::make('admin123'),
            'rol_id'   => 3,
            'estado'   => 'Activo',
        ]);

        // 4. CLIENTE (VISITANTE)
        User::create([
            'name'     => 'Cliente Visitante',
            'username' => 'cliente_01',
            'email'    => 'cliente@nexusstore.com',
            'password' => Hash::make('admin123'),
            'rol_id'   => 4,
            'estado'   => 'Activo',
        ]);

        $this->command->info('Usuarios de NexusStore vinculados a sus Roles correctamente.');
    }
}
