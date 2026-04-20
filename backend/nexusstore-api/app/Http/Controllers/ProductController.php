<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller {
    /** * Listar productos con su stock total sumado de los lotes */
    public function index() {
        $products = DB::table('products')
            ->leftJoin('lots', 'products.id', '=', 'lots.product_id')
            ->select( 'products.*', DB::raw('SUM(lots.stock_fisico) as stock_total') )
            ->groupBy('products.id')
            ->get();
        return response()->json($products);
    }

    /** * Crear producto, su lote inicial y registro en Kardex */
    /**
 * Crear producto, su lote inicial y registro en Kardex
 */
public function store(Request $request)
{
    // 1. Validamos los datos que vienen de tu formulario en React
    $validated = $request->validate([
        'nombre'      => 'required|string|max:255',
        'sku'         => 'required|string|unique:products,sku',
        'precio'      => 'required|numeric|min:0',
        'descripcion' => 'nullable|string',
        'stock'       => 'required|integer|min:0' // "Existencias" del form
    ]);

    try {
        // Iniciamos transacción para asegurar que las 3 tablas se llenen
        return DB::transaction(function () use ($request, $validated) {

            // 2. Crear el Producto (Tabla: products)
            // Usamos rol_id si tu tabla users depende de ello, pero aquí es creación de producto
            $productId = DB::table('products')->insertGetId([
                'nombre'       => $validated['nombre'],
                'sku'          => $validated['sku'],
                'precio'       => $validated['precio'],
                'descripcion'  => $validated['descripcion'] ?? 'Sin descripción',
                'stock_minimo' => 5, // Valor por defecto
                'estado'       => 'Activo',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // 3. Crear el Lote Inicial (Tabla: lots)
            // bin_id 1 es el que creamos por consola (A1)
            $lotId = DB::table('lots')->insertGetId([
                'product_id'        => $productId,
                'bin_id'            => 1,
                'numero_lote'       => 'LOTE-' . time() . '-' . rand(100, 999), // <--- ESTO garantiza que no choque
                'stock_fisico'      => $validated['stock'],
                'stock_reservado'   => 0,
                'fecha_vencimiento' => now()->addMonths(6),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);


            // 4. Registrar en Kardex (Tabla: kardex)
            // 'Entrada' es uno de los valores permitidos por tu CHECK constraint
            DB::table('kardex')->insert([
                'lot_id'               => $lotId,
                'user_id'              => Auth::id() ?? 1, // Usuario que registra
                'tipo_movimiento'      => 'Entrada',
                'cantidad'             => $validated['stock'],
                'referencia_documento' => 'Carga inicial de producto: ' . $validated['nombre'],
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => '¡Producto e Inventario registrados!',
                'product_id' => $productId
            ], 201);
        });

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error al registrar: ' . $e->getMessage()
        ], 500);
    }
}

    /** * Actualizar datos y registrar ajuste en Kardex si cambia el stock */
    public function update(Request $request, $id) {
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'precio' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0'
        ]);

        try {
            return DB::transaction(function () use ($request, $id, $validated) {
                if ($request->has('stock')) {
                    $lote = DB::table('lots')->where('product_id', $id)->first();
                    if ($lote) {
                        $diferencia = $request->stock - $lote->stock_fisico;
                        if ($diferencia != 0) {
                            DB::table('lots')->where('id', $lote->id)->update([
                                'stock_fisico' => $request->stock,
                                'updated_at' => now()
                            ]);

                            // REGISTRO EN KARDEX (Corregido para cumplir con el CHECK de la DB)
                            DB::table('kardex')->insert([
                                'lot_id' => $lote->id,
                                'user_id' => Auth::id() ?? 1,
                                'tipo_movimiento' => 'Ajuste', // <--- CAMBIADO para usar solo valores permitidos
                                'cantidad' => abs($diferencia),
                                'referencia_documento' => 'Actualización manual de stock',
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }

                DB::table('products')->where('id', $id)->update(
                    array_merge($request->only(['nombre', 'precio', 'descripcion']), ['updated_at' => now()])
                );

                return response()->json(['message' => 'Producto y Kardex actualizados']);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
{
    try {
        // En lugar de borrar, actualizamos el estado
        $updated = DB::table('products')
            ->where('id', $id)
            ->update([
                'estado' => 'Inactivo', // Asegúrate de tener esta columna o usa una similar
                'updated_at' => now()
            ]);

        if ($updated) {
            // OPCIONAL: Registrar en el Kardex que el producto fue descontinuado
            $lote = DB::table('lots')->where('product_id', $id)->first();
            if ($lote) {
                DB::table('kardex')->insert([
                    'lot_id' => $lote->id,
                    'user_id' => Auth::id(),
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => 0,
                    'referencia_documento' => 'PRODUCTO ELIMINADO DEL SISTEMA',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json(['message' => 'Producto desactivado. El historial se mantiene.']);
        }

        return response()->json(['message' => 'Producto no encontrado'], 404);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
    }
}

    public function getMovimientos()
    {
        $reporte = DB::table('kardex')
            ->join('lots', 'kardex.lot_id', '=', 'lots.id')
            ->join('products', 'lots.product_id', '=', 'products.id')
            ->join('users', 'kardex.user_id', '=', 'users.id')
            ->select(
                'kardex.id',
                'products.nombre as producto',
                'users.name as usuario',
                'kardex.tipo_movimiento',
                'kardex.cantidad',
                'kardex.referencia_documento',
                'kardex.created_at'
            )
            ->orderBy('kardex.created_at', 'desc')
            ->get();

        return response()->json($reporte);
    }
}
