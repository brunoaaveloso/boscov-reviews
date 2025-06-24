import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import Header from '@/components/Header';

interface Filme {
  id: number;
  nome: string;
  diretor: string;
  anoLancamento: number;
  duracao: number;
  produtora: string;
  classificacao: string;
  poster: string;
  sinopse: string;
  ativo: boolean;
}

interface DecodedToken {
  userId: number;
  email: string;
  nome: string;
  tipoUsuario: 'ADMIN' | 'USUARIO';
}

const AdminFilmes: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Filme>>({});

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
    fetch(`${API_BASE_URL}/filmes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFilmes(data))
      .catch(() => toast.error('Erro ao carregar filmes'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/filmes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilmes(filmes => filmes.map(f => f.id === id ? { ...f, ativo: false } : f));
      toast.success('Filme desativado!');
    } catch {
      toast.error('Erro ao desativar filme');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/filmes/${id}/restaurar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilmes(filmes => filmes.map(f => f.id === id ? { ...f, ativo: true } : f));
      toast.success('Filme restaurado!');
    } catch {
      toast.error('Erro ao restaurar filme');
    }
  };

  const handleEdit = (filme: Filme) => {
    setEditId(filme.id);
    setEditData(filme);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/filmes/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setFilmes(filmes => filmes.map(f => f.id === editId ? { ...f, ...updated } : f));
      setEditId(null);
      setEditData({});
      toast.success('Filme atualizado!');
    } catch {
      toast.error('Erro ao atualizar filme');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto mt-10 bg-zinc-900 p-8 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administração de Filmes</h1>
          <Button variant="outline" onClick={() => navigate('/admin/usuarios')}>Voltar</Button>
        </div>
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-amber-400">
              <th>ID</th>
              <th>Nome</th>
              <th>Diretor</th>
              <th>Ano</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filmes.map(filme => (
              <tr key={filme.id} className="bg-zinc-800">
                <td>{filme.id}</td>
                <td>
                  {editId === filme.id ? (
                    <input name="nome" value={editData.nome || ''} onChange={handleEditChange} className="bg-zinc-700 text-white px-2 py-1 rounded" />
                  ) : (
                    filme.nome
                  )}
                </td>
                <td>
                  {editId === filme.id ? (
                    <input name="diretor" value={editData.diretor || ''} onChange={handleEditChange} className="bg-zinc-700 text-white px-2 py-1 rounded" />
                  ) : (
                    filme.diretor
                  )}
                </td>
                <td>
                  {editId === filme.id ? (
                    <input name="anoLancamento" value={editData.anoLancamento || ''} onChange={handleEditChange} className="bg-zinc-700 text-white px-2 py-1 rounded" />
                  ) : (
                    filme.anoLancamento
                  )}
                </td>
                <td>
                  <span className={filme.ativo ? 'text-green-400' : 'text-red-400'}>
                    {filme.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="space-x-2">
                  {editId === filme.id ? (
                    <>
                      <Button size="sm" onClick={handleEditSave}>Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditId(null); setEditData({}); }}>Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => handleEdit(filme)}>Editar</Button>
                      {filme.ativo ? (
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(filme.id)}>Desativar</Button>
                      ) : (
                        <Button size="sm" variant="default" onClick={() => handleRestore(filme.id)}>Restaurar</Button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminFilmes; 