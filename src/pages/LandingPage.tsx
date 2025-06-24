import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { jwtDecode } from "jwt-decode";
import Header from '@/components/Header';

interface DecodedToken {
  userId: number;
  email: string;
  nome: string;
}

export function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn, token, logout } = useAuth();
  let userName = '';
  
  if (isLoggedIn && token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      userName = decoded.nome || decoded.email;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
    }
  }

  return (
    <div className="bg-black text-white font-sans">
      <Header />

      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-0">
          <img
            src="https://images.unsplash.com/photo-1557759677-209e5b9103c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMGNvbGxhZ2V8ZW58MHx8fHwxNzQ3NTIwMjE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 text-amber-500">
              Explore o Mundo do Cinema
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              Descubra milhares de filmes, organize suas listas de favoritos e encontre sua próxima
              grande aventura cinematográfica.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => navigate("/filmes")}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-md font-bold transform hover:scale-105 transition-all duration-300"
              >
                Explorar Catálogo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-4">BoscovFilmes</h3>
              <p className="text-gray-400 mb-4">
                A sua plataforma de avaliações com os melhores filmes e séries em um só lugar.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-amber-500 transition-colors">Início</a></li>
                <li><a href="/filmes" className="text-gray-400 hover:text-amber-500 transition-colors">Catálogo</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 BoscovFilmes. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 