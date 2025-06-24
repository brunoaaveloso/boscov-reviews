import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';
import Header from '@/components/Header';

interface DecodedToken {
  userId: number;
  email: string;
  nome: string;
}

interface UserData {
  nome: string;
  email: string;
  dataNascimento: string;
  senha?: string;
}

const Profile: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({ nome: '', email: '', dataNascimento: '' });
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  let isAdmin = false;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      isAdmin = decoded.tipoUsuario === 'ADMIN';
    } catch {}
  }

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode<DecodedToken>(token);
    fetch(`${API_BASE_URL}/usuarios/${decoded.userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUserData({
          nome: data.usuario.nome,
          email: data.usuario.email,
          dataNascimento: data.usuario.dataNascimento?.substring(0, 10) || ''
        });
      })
      .catch(() => toast.error('Erro ao carregar dados do usuário'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const decoded = jwtDecode<DecodedToken>(token!);
      const body: UserData = { ...userData };
      if (senha && senha.length >= 6) {
        body.senha = senha;
      }
      const res = await fetch(`${API_BASE_URL}/usuarios/${decoded.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Erro ao atualizar usuário');
      toast.success('Dados atualizados com sucesso!');
      setSenha('');
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-10 bg-zinc-900 p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" value={userData.nome} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" value={userData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input id="dataNascimento" name="dataNascimento" type="date" value={userData.dataNascimento} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="senha">Nova Senha (opcional)</Label>
            <Input id="senha" name="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Deixe em branco para não alterar" minLength={6} />
          </div>
          <div className="flex justify-between items-center mt-6">
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
            <Button type="button" variant="outline" onClick={logout}>Sair</Button>
            {isAdmin && (
              <Button
                type="button"
                className="bg-amber-700 hover:bg-amber-800 text-white ml-2"
                onClick={() => navigate('/admin/usuarios')}
              >
                Administração
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile; 