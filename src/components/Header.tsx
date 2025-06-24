import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle, Search, FilmIcon } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { jwtDecode } from 'jwt-decode';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery = '', isLoggedIn }) => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  let userName = '';
  let isAdmin = false;
  if ((isLoggedIn === undefined || isLoggedIn) && token) {
    try {
      const decoded: any = jwtDecode(token);
      userName = decoded.nome || decoded.email;
      isAdmin = decoded.tipoUsuario === 'ADMIN';
    } catch {}
  }

  return (
    <header className="bg-black sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <a href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold text-amber-500 group-hover:text-amber-400 transition-colors">
              BoscovFilmes
            </span>
            <i className="fa-solid fa-film text-amber-500 group-hover:text-amber-400 transition-colors"></i>
          </a>
          <nav className="hidden md:flex space-x-4">
            <a href="/filmes" className="px-2 py-1 hover:text-amber-400 transition-colors">Filmes</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {onSearch && (
            <form onSubmit={e => { e.preventDefault(); onSearch && onSearch(searchQuery); }} className="relative group">
              <input
                type="text"
                placeholder="Buscar filmes..."
                value={searchQuery}
                onChange={e => onSearch && onSearch(e.target.value)}
                className="bg-gray-900 rounded-full px-4 py-1 w-[200px] md:w-[250px] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors"
              >
                <i className="fa fa-search" />
              </Button>
            </form>
          )}
          {token ? (
            <>
              {userName && (
                <span className="hidden md:inline text-sm text-gray-300 mr-2">Bem-vindo, {userName}</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="rounded-full"
              >
                <i className="fa-solid fa-user text-xl"></i>
              </Button>
              {isAdmin && (
                <Button
                  onClick={() => navigate('/admin/usuarios')}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-800 rounded transition-colors text-sm mr-2"
                >
                  Administração
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-gray-600"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded transition-colors text-sm">
                Entrar
              </Button>
              <Button onClick={() => navigate('/login?tab=register')} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors text-sm">
                Cadastrar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
