import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MovieGrid, { Movie } from '@/components/MovieGrid';
import GenreFilter from '@/components/GenreFilter';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';
import { movieService, Genre } from '@/services/movieService';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('recent');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesData, genresData] = await Promise.all([
          movieService.getMovies(),
          movieService.getGenres()
        ]);

        setMovies(moviesData.map((filme) => ({
          id: filme.id.toString(),
          title: filme.nome,
          poster: filme.poster,
          year: filme.anoLancamento,
          director: filme.diretor,
          duration: `${Math.floor(filme.duracao / 60)}h ${filme.duracao % 60}m`,
          genres: filme.generos.map(g => g.genero.descricao),
          avaliacoes: filme.avaliacoes?.map(av => ({ nota: av.nota }))
        })));
        setGenres(genresData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenres = selectedGenres.length === 0 || 
      selectedGenres.some(genre => movie.genres.includes(genre));
    return matchesSearch && matchesGenres;
  });

  // Ordenação para a aba 'Mais Avaliados'
  const sortedMovies = activeTab === 'top-rated'
    ? [...filteredMovies].sort((a, b) => {
        const avgA = a.avaliacoes && a.avaliacoes.length > 0
          ? a.avaliacoes.reduce((sum, av) => sum + av.nota, 0) / a.avaliacoes.length
          : 0;
        const avgB = b.avaliacoes && b.avaliacoes.length > 0
          ? b.avaliacoes.reduce((sum, av) => sum + av.nota, 0) / b.avaliacoes.length
          : 0;
        return avgB - avgA;
      })
    : filteredMovies;

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} searchQuery={searchQuery} isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto max-w-7xl p-4 md:p-6 flex-grow">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Descubra Filmes</h1>
          
          <GenreFilter 
            genres={genres?.map(g => g.descricao) || []} 
            selectedGenres={selectedGenres} 
            onGenreToggle={handleGenreToggle} 
          />
          
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="recent">Recentes</TabsTrigger>
                <TabsTrigger value="top-rated">Mais Avaliados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Separator className="mb-6" />
          
          <MovieGrid movies={sortedMovies} loading={loading} />
        </section>
      </main>
    </div>
  );
};

export default Index;
