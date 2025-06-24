import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { movieService, Movie, Review } from '@/services/movieService';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const [filme, setFilme] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFilme = async () => {
      try {
        if (!id) throw new Error('ID do filme não encontrado');
        const data = await movieService.getMovieById(id);
        setFilme(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar filme');
      } finally {
        setLoading(false);
      }
    };

    fetchFilme();
  }, [id]);

  // Identificar o comentário do usuário logado
  let userAvaliacao = null;
  let usuarioId = null;
  if (isLoggedIn && token) {
    try {
      const decoded = jwtDecode(token) as { userId: number };
      usuarioId = decoded.userId;
      if (filme && filme.avaliacoes) {
        userAvaliacao = filme.avaliacoes.find(av => av.usuario.id === usuarioId);
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !token || !id) {
      toast.error('Você precisa estar logado para fazer uma avaliação');
      return;
    }

    try {
      setSubmitting(true);
      
      // Decodificar o token JWT
      const decodedToken = jwtDecode(token) as { userId: number };
      const usuarioId = decodedToken.userId;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado no token');
      }

      const review: Review = {
        nota: userRating,
        comentario: reviewComment,
        usuarioId
      };

      await movieService.addReview(id, review, token);
      
      // Atualizar a lista de avaliações
      const updatedFilme = await movieService.getMovieById(id);
      setFilme(updatedFilme);
      
      // Limpar o formulário
      setUserRating(0);
      setReviewComment('');
      toast.success('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Ao carregar o filme, se userAvaliacao existir, preencher os states
  useEffect(() => {
    if (userAvaliacao) {
      setUserRating(userAvaliacao.nota);
      setReviewComment(userAvaliacao.comentario);
    } else {
      setUserRating(0);
      setReviewComment('');
    }
  }, [filme, usuarioId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={isLoggedIn} />
        <main className="container mx-auto max-w-7xl p-4 md:p-6 flex-grow">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex gap-8">
              <div className="w-1/3 h-96 bg-gray-200 rounded"></div>
              <div className="w-2/3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !filme) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={isLoggedIn} />
        <main className="container mx-auto max-w-7xl p-4 md:p-6 flex-grow">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Filme não encontrado'}</h1>
            <Button onClick={() => navigate('/')}>Voltar para Home</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto max-w-7xl p-4 md:p-6 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <img 
              src={filme.poster} 
              alt={filme.nome}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-4">{filme.nome}</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Informações</h2>
                <p><span className="font-medium">Ano:</span> {filme.anoLancamento}</p>
                <p><span className="font-medium">Diretor:</span> {filme.diretor}</p>
                <p><span className="font-medium">Duração:</span> {Math.floor(filme.duracao / 60)}h {filme.duracao % 60}m</p>
                <p><span className="font-medium">Gêneros:</span> {filme.generos.map(g => g.genero.descricao).join(', ')}</p>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Sinopse</h2>
                <p className="text-gray-700">{filme.sinopse}</p>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Avaliações</h2>
                {(filme.avaliacoes && filme.avaliacoes.length > 0) ? (
                  <div className="space-y-4">
                    {filme.avaliacoes.map(avaliacao => (
                      <div key={avaliacao.id} className="bg-gray-900 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-300">{avaliacao.usuario.nome}</span>
                          </div>
                          <span className="text-yellow-500">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i}>{i < avaliacao.nota ? '★' : '☆'}</span>
                            ))}
                            <span className="ml-2">{avaliacao.nota.toFixed(1)}</span>
                          </span>
                        </div>
                        <p className="text-gray-100">{avaliacao.comentario}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma avaliação ainda.</p>
                )}
                
                {isLoggedIn ? (
                  userAvaliacao ? (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setSubmitting(true);
                      try {
                        if (!id) throw new Error('ID do filme não encontrado');
                        const review: Review = {
                          nota: userRating,
                          comentario: reviewComment,
                          usuarioId: usuarioId!
                        };
                        await movieService.updateReview(id, userAvaliacao.id, review, token!);
                        const updatedFilme = await movieService.getMovieById(id);
                        setFilme(updatedFilme);
                        toast.success('Avaliação editada com sucesso!');
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Erro ao editar avaliação. Tente novamente.');
                      } finally {
                        setSubmitting(false);
                      }
                    }} className="mt-6">
                      <h3 className="font-semibold mb-2">Editar sua avaliação</h3>
                      <StarRating rating={userRating} onChange={setUserRating} interactive />
                      <Textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Edite seu comentário..."
                        className="mb-2"
                      />
                      <Button type="submit" disabled={userRating === 0 || !reviewComment.trim() || submitting}>
                        {submitting ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="mt-6">
                      <h3 className="font-semibold mb-2">Deixe sua avaliação</h3>
                      <StarRating rating={userRating} onChange={setUserRating} interactive />
                      <Textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Escreva seu comentário..."
                        className="mb-2"
                      />
                      <Button 
                        type="submit" 
                        disabled={userRating === 0 || !reviewComment.trim() || submitting}
                      >
                        {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                      </Button>
                    </form>
                  )
                ) : (
                  <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-gray-100">
                      Faça login para deixar sua avaliação
                    </p>
                    <Button 
                      onClick={() => navigate('/login')} 
                      className="mt-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                    >
                      Fazer Login
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
