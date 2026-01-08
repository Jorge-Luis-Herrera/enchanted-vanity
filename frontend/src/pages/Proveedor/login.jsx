import { useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', { username, password });
      if (response.data.mensaje === "Login exitoso") {
        localStorage.setItem('isLogged', 'true');
        navigate('/admin/dashboard');
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error de conexión. ¿Está encendido el backend?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAFA] flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-xs uppercase tracking-[0.5em] font-bold text-gray-400">Enchanted Vanity</h1>
          <h2 className="text-4xl font-light tracking-tight text-gray-900">Portal de Gestión</h2>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-10 space-y-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] uppercase tracking-widest font-bold p-4 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm font-light tracking-wide"
                placeholder="admin"
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-200 py-3 focus:border-black outline-none transition-colors text-sm font-light tracking-wide"
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold py-5 hover:bg-gray-800 transition-all duration-500 disabled:bg-gray-300"
          >
            {loading ? 'Verificando...' : 'Entrar al Panel'}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition"
            >
              Volver a la tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
