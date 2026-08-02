import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1020] px-6 text-white">
      <div className="text-center">
        <p className="text-lg text-slate-300">Página de login ainda não implementada.</p>
        <Link to="/register" className="mt-4 inline-block text-emerald-400 hover:underline">
          Voltar para criar conta
        </Link>
      </div>
    </div>
  );
}
