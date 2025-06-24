import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { FilmIcon } from 'lucide-react';
import { authService, LoginData, RegisterData } from '@/services/authService';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const [loginForm, setLoginForm] = useState<LoginData>({
    email: '',
    senha: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterData>({
    nome: '',
    email: '',
    senha: '',
    dataNascimento: ''
  });

  const [registerErrors, setRegisterErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'register') {
      setActiveTab('register');
    }
  }, [location.search]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(loginForm);
      login(data.token);
      toast({
        title: "Login com sucesso",
        description: "Bem-vindo(a) de volta!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro ao entrar",
        description: error instanceof Error ? error.message : "Erro de conexão com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  function validateRegisterForm() {
    const errors: {[key: string]: string} = {};
    if (!registerForm.nome || registerForm.nome.trim().length < 2) {
      errors.nome = 'O nome deve ter pelo menos 2 caracteres';
    }
    if (!registerForm.email || !/^\S+@\S+\.\S+$/.test(registerForm.email)) {
      errors.email = 'E-mail inválido';
    }
    if (!registerForm.senha || registerForm.senha.length < 6) {
      errors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    if (!registerForm.dataNascimento || isNaN(Date.parse(registerForm.dataNascimento))) {
      errors.dataNascimento = 'Data de nascimento inválida';
    }
    return errors;
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateRegisterForm();
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsLoading(true);
    try {
      await authService.register(registerForm);
      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso!",
      });
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Erro de cadastro",
        description: error instanceof Error ? error.message : "Erro de conexão com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Link to="/" className="flex items-center mb-6">
        <FilmIcon className="h-8 w-8 mr-2" />
        <span className="text-2xl font-bold">BoscovFilmes</span>
      </Link>
      
      <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Entre com sua conta para avaliar e comentar sobre filmes
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required
                    value={loginForm.senha}
                    onChange={(e) => setLoginForm({...loginForm, senha: e.target.value})}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit}>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Crie sua conta para começar a avaliar filmes
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome completo" 
                    required
                    value={registerForm.nome}
                    onChange={(e) => setRegisterForm({...registerForm, nome: e.target.value})}
                  />
                  {registerErrors.nome && <span className="text-red-500 text-xs">{registerErrors.nome}</span>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  />
                  {registerErrors.email && <span className="text-red-500 text-xs">{registerErrors.email}</span>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    required
                    value={registerForm.senha}
                    onChange={(e) => setRegisterForm({...registerForm, senha: e.target.value})}
                  />
                  {registerErrors.senha && <span className="text-red-500 text-xs">{registerErrors.senha}</span>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birth-date">Data de Nascimento</Label>
                  <Input 
                    id="birth-date" 
                    type="date" 
                    required
                    value={registerForm.dataNascimento}
                    onChange={(e) => setRegisterForm({...registerForm, dataNascimento: e.target.value})}
                  />
                  {registerErrors.dataNascimento && <span className="text-red-500 text-xs">{registerErrors.dataNascimento}</span>}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
