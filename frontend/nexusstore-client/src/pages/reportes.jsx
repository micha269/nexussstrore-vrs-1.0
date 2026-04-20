import Reporteros from '../components/Reporteros';

export default function ReportesPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Reportería NexusStore</h1>
                <p className="text-slate-500">Historial completo de trazabilidad del inventario</p>
            </div>
            
            <Reporteros />
        </div>
    );
}
