import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import Header from '@/components/Header';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  status: boolean;
  tipoUsuario: 'ADMIN' | 'USUARIO';
  dataNascimento: string;
}

interface DecodedToken {
  userId: number;
  email: string;
  nome: string;
  tipoUsuario: 'ADMIN' | 'USUARIO';
}

const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.tipoUsuario !== 'ADMIN') {
      toast.error('Acesso restrito a administradores.');
      navigate('/');
      return;
    }
    fetch(`${API_BASE_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsuarios(data.usuarios))
      .catch(() => toast.error('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleStatus = async (id: number, status: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      setUsuarios(users => users.map(u => u.id === id ? { ...u, status } : u));
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleTipo = async (id: number, tipoUsuario: 'ADMIN' | 'USUARIO') => {
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/${id}/tipo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tipoUsuario })
      });
      if (!res.ok) throw new Error();
      setUsuarios(users => users.map(u => u.id === id ? { ...u, tipoUsuario } : u));
      toast.success('Tipo de usuário atualizado!');
    } catch {
      toast.error('Erro ao atualizar tipo de usuário');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto mt-10 bg-zinc-900 p-8 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administração de Usuários</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')}>Voltar</Button>
            <Button variant="default" onClick={() => navigate('/admin/filmes')}>Filmes</Button>
          </div>
        </div>
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-amber-400">
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Status</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="bg-zinc-800">
                <td>{usuario.id}</td>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className={usuario.status ? 'text-green-400' : 'text-red-400'}>
                    {usuario.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>{usuario.tipoUsuario}</td>
                <td className="space-x-2">
                  <Button
                    size="sm"
                    variant={usuario.status ? 'outline' : 'default'}
                    onClick={() => handleStatus(usuario.id, !usuario.status)}
                  >
                    {usuario.status ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant={usuario.tipoUsuario === 'ADMIN' ? 'outline' : 'default'}
                    onClick={() => handleTipo(usuario.id, usuario.tipoUsuario === 'ADMIN' ? 'USUARIO' : 'ADMIN')}
                  >
                    {usuario.tipoUsuario === 'ADMIN' ? 'Tornar Usuário' : 'Tornar Admin'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminUsers; 