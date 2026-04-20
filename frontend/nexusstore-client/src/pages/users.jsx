import UserManager from '../components/usermanager';

export default function UsersPage() {
    return (
        <div className="p-6 min-h-screen">
            {/* Cabecera de la página */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-cyan-500">👥</span> Gestión de Personal
                </h1>
                <p className="text-slate-500 mt-2">
                    Administra los accesos, roles y contraseñas de los usuarios de NexusStore.
                </p>
            </div>

            {/* Componente Modular de Gestión */}
            <div className="grid grid-cols-1 gap-8">
                <UserManager />
            </div>
        </div>
    );
}
