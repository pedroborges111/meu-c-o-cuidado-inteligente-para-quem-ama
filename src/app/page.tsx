"use client";

import { useState, useEffect, useRef } from "react";
import { Dog, Heart, BookOpen, CheckCircle2, Award, User, ChevronRight, Sparkles, ArrowRight, ArrowLeft, Mail, Lock, UserCircle, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Tipos
interface DogProfile {
  id?: string;
  name: string;
  age: string;
  breed: string;
  size: "pequeno" | "médio" | "grande" | "";
  energy: "baixo" | "médio" | "alto" | "";
  gender: "macho" | "fêmea" | "";
  weight: string;
  photo: string;
}

interface DailyTask {
  id: string;
  label: string;
  completed: boolean;
  date?: string;
}

interface MiniCourse {
  id: number;
  title: string;
  duration: string;
  content: string[];
  tip: string;
  completed: boolean;
}

export default function MeuCaoApp() {
  // Estados de autenticação
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados do app
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [dogProfile, setDogProfile] = useState<DogProfile>({
    name: "",
    age: "",
    breed: "",
    size: "",
    energy: "",
    gender: "",
    weight: "",
    photo: ""
  });
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: "1", label: "Carinho e atenção", completed: false },
    { id: "2", label: "Passeio curto", completed: false },
    { id: "3", label: "Treino rápido (5 min)", completed: false }
  ]);
  const [selectedCourse, setSelectedCourse] = useState<MiniCourse | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [miniCourses, setMiniCourses] = useState<MiniCourse[]>([
    {
      id: 1,
      title: "Como criar vínculo com seu cachorro",
      duration: "3 min",
      completed: false,
      content: [
        "O vínculo com seu cão não acontece da noite para o dia. É construído através de pequenos momentos diários de conexão genuína.",
        "Dedique tempo de qualidade: mesmo que sejam apenas 10 minutos, esteja presente de verdade. Sem celular, sem distrações.",
        "Aprenda a linguagem dele: observe como ele se comunica. A cauda, as orelhas, os olhos - tudo isso fala com você.",
        "Seja consistente: cães amam rotina. Eles se sentem seguros quando sabem o que esperar de você.",
        "Respeite o espaço dele: vínculo também é sobre respeito. Se ele quer ficar sozinho, tudo bem."
      ],
      tip: "Hoje, sente-se no chão ao lado do seu cão por 5 minutos. Apenas estejam juntos, sem fazer nada específico. Observe como ele reage."
    },
    {
      id: 2,
      title: "Como fazer carinho do jeito certo",
      duration: "2 min",
      completed: false,
      content: [
        "Nem todo carinho é bem-vindo. Muitos cães não gostam de tapinhas na cabeça ou abraços apertados.",
        "Áreas preferidas: a maioria dos cães adora carinho no peito, na lateral do corpo e na base da cauda.",
        "Evite: tocar o topo da cabeça de forma brusca, abraçar muito forte ou tocar as patas sem ele estar acostumado.",
        "Leia os sinais: se ele se afasta, lambe os lábios ou vira a cabeça, ele está dizendo 'não, obrigado'.",
        "Deixe ele vir até você: o melhor carinho é aquele que o cão pede, não o que forçamos nele."
      ],
      tip: "Experimente fazer carinho no peito do seu cão hoje, com movimentos suaves. Observe se ele se aproxima pedindo mais."
    },
    {
      id: 3,
      title: "Rotina básica para cães com tutores ocupados",
      duration: "3 min",
      completed: false,
      content: [
        "Você não precisa de horas livres para cuidar bem do seu cão. Pequenos momentos bem aproveitados fazem toda a diferença.",
        "Manhã (5-10 min): um carinho sincero ao acordar e uma brincadeira rápida antes de sair.",
        "Durante o dia: se possível, uma mensagem de vídeo ou pedir para alguém dar atenção a ele.",
        "Noite (15-20 min): um passeio curto, mesmo que seja só na quadra. O importante é sair juntos.",
        "Antes de dormir (5 min): um momento de conexão, carinho e palavras suaves."
      ],
      tip: "Estabeleça um 'ritual de bom dia' com seu cão. Pode ser um carinho específico ou uma palavra especial. Faça isso todos os dias."
    },
    {
      id: 4,
      title: "Como ensinar: sentar",
      duration: "4 min",
      completed: false,
      content: [
        "Ensinar 'sentar' é um dos comandos mais úteis e fáceis de treinar. É a base para muitos outros comportamentos.",
        "Passo 1: Pegue um petisco e mostre para o cão, deixando-o cheirar mas não pegar.",
        "Passo 2: Leve o petisco lentamente acima da cabeça dele, movendo para trás. Naturalmente, ele vai sentar para acompanhar o movimento.",
        "Passo 3: No momento exato em que o bumbum tocar o chão, diga 'senta' e dê o petisco imediatamente.",
        "Passo 4: Repita 5 vezes, faça uma pausa para brincar, e repita mais 5 vezes.",
        "Dica importante: seja paciente. Alguns cães aprendem em um dia, outros levam uma semana. Ambos estão indo bem."
      ],
      tip: "Pratique 2 sessões de 5 minutos hoje. Manhã e noite. Não force se ele não estiver interessado."
    },
    {
      id: 5,
      title: "Como ensinar: deitar",
      duration: "4 min",
      completed: false,
      content: [
        "O comando 'deita' é perfeito para acalmar seu cão em momentos de excitação ou quando você precisa que ele fique quieto.",
        "Pré-requisito: é mais fácil ensinar 'deita' depois que ele já sabe 'senta'.",
        "Passo 1: Peça para ele sentar primeiro.",
        "Passo 2: Com um petisco na mão, leve-o do nariz do cão até o chão, em linha reta para baixo e um pouco para frente.",
        "Passo 3: Quando o corpo todo estiver no chão, diga 'deita' e dê o petisco.",
        "Passo 4: Se ele levantar o bumbum para pegar o petisco, não dê. Espere ele deitar completamente.",
        "Pratique em sessões curtas: 5 minutos é suficiente. Cães aprendem melhor em treinos curtos e frequentes."
      ],
      tip: "Depois que ele aprender, pratique em lugares diferentes: sala, quintal, parque. Isso ajuda ele a entender que o comando vale em qualquer lugar."
    },
    {
      id: 6,
      title: "Seu cachorro se comunica com você — aprenda os sinais",
      duration: "3 min",
      completed: false,
      content: [
        "Cães falam o tempo todo, mas não com palavras. Eles usam o corpo inteiro para se comunicar.",
        "Cauda abanando: nem sempre significa felicidade. Observe a velocidade e a altura. Cauda alta e rápida = excitação. Cauda baixa e lenta = insegurança.",
        "Lambendo os lábios: quando não há comida por perto, isso geralmente significa desconforto ou ansiedade.",
        "Bocejo: cães bocejam quando estão estressados ou tentando se acalmar, não apenas quando têm sono.",
        "Orelhas para trás: pode ser medo, submissão ou apenas atenção ao que está atrás dele.",
        "Olhar fixo: pode ser desafio (se for tenso) ou pedido de atenção (se for suave).",
        "Corpo relaxado: quando tudo está solto e macio, seu cão está confortável e feliz."
      ],
      tip: "Hoje, observe seu cão por 5 minutos sem interagir. Apenas observe. Você vai começar a notar padrões que nunca viu antes."
    },
    {
      id: 7,
      title: "Boas-vindas em casa: como tornar esse momento especial",
      duration: "3 min",
      completed: false,
      content: [
        "A forma como você chega em casa define o tom emocional do resto do dia para o seu cão.",
        "Evite excesso de excitação: se você chega gritando e pulando, ele vai ficar ansioso e hiperativo.",
        "Chegue com calma: entre, tire os sapatos, respire. Depois, cumprimente seu cão com carinho suave.",
        "Ignore por 2 minutos: parece cruel, mas ajuda cães muito ansiosos a se acalmarem. Depois, dê atenção total.",
        "Crie um ritual: pode ser um carinho específico, uma palavra especial ou um brinquedo favorito. Consistência traz segurança.",
        "Dedique 5 minutos: depois de se acomodar, sente-se no chão e esteja presente com ele. Esse é o momento mais importante do dia dele."
      ],
      tip: "Experimente chegar em casa hoje de forma mais calma. Observe como seu cão reage diferente quando você está tranquilo."
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar sessão do Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        loadUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados do usuário do Supabase
  const loadUserData = async (userId: string) => {
    try {
      // Carregar perfil do cão
      const { data: dogData, error: dogError } = await supabase
        .from('dog_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (dogData && !dogError) {
        setDogProfile({
          id: dogData.id,
          name: dogData.name,
          age: dogData.age,
          breed: dogData.breed,
          size: dogData.size,
          energy: dogData.energy,
          gender: dogData.gender,
          weight: dogData.weight || "",
          photo: dogData.photo_url || ""
        });
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }

      // Carregar tarefas do dia
      const today = new Date().toISOString().split('T')[0];
      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);

      if (tasksData && tasksData.length > 0) {
        setDailyTasks(tasksData.map(task => ({
          id: task.id,
          label: task.label,
          completed: task.completed,
          date: task.date
        })));
      } else {
        // Criar tarefas padrão para hoje
        await createDefaultTasks(userId, dogData?.id);
      }

      // Carregar progresso dos cursos
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressData && progressData.length > 0) {
        setMiniCourses(prev => prev.map(course => {
          const progress = progressData.find(p => p.course_id === course.id);
          return progress ? { ...course, completed: progress.completed } : course;
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Criar tarefas padrão
  const createDefaultTasks = async (userId: string, dogProfileId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const defaultTasks = [
      { label: "Carinho e atenção", completed: false },
      { label: "Passeio curto", completed: false },
      { label: "Treino rápido (5 min)", completed: false }
    ];

    const tasksToInsert = defaultTasks.map(task => ({
      user_id: userId,
      dog_profile_id: dogProfileId,
      label: task.label,
      completed: task.completed,
      date: today
    }));

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select();

    if (data && !error) {
      setDailyTasks(data.map(task => ({
        id: task.id,
        label: task.label,
        completed: task.completed,
        date: task.date
      })));
    }
  };

  // Salvar perfil do cão no Supabase
  const saveDogProfile = async () => {
    if (!session) return;

    try {
      const profileData = {
        user_id: session.user.id,
        name: dogProfile.name,
        age: dogProfile.age,
        breed: dogProfile.breed,
        size: dogProfile.size,
        energy: dogProfile.energy,
        gender: dogProfile.gender,
        weight: dogProfile.weight,
        photo_url: dogProfile.photo
      };

      if (dogProfile.id) {
        // Atualizar perfil existente
        await supabase
          .from('dog_profiles')
          .update(profileData)
          .eq('id', dogProfile.id);
      } else {
        // Criar novo perfil
        const { data, error } = await supabase
          .from('dog_profiles')
          .insert([profileData])
          .select()
          .single();

        if (data && !error) {
          setDogProfile({ ...dogProfile, id: data.id });
          // Criar tarefas padrão
          await createDefaultTasks(session.user.id, data.id);
        }
      }

      setShowOnboarding(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  // Toggle tarefa
  const toggleTask = async (id: string) => {
    if (!session) return;

    const task = dailyTasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    try {
      await supabase
        .from('daily_tasks')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', id);

      setDailyTasks(prev => prev.map(t =>
        t.id === id ? { ...t, completed: newCompleted } : t
      ));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  // Completar curso
  const completeCourse = async () => {
    if (!selectedCourse || !session) return;

    try {
      await supabase
        .from('course_progress')
        .upsert({
          user_id: session.user.id,
          course_id: selectedCourse.id,
          completed: true,
          completed_at: new Date().toISOString()
        });

      setMiniCourses(prev => prev.map(course =>
        course.id === selectedCourse.id ? { ...course, completed: true } : course
      ));
      setShowCourseDialog(false);
    } catch (error) {
      console.error('Erro ao completar curso:', error);
    }
  };

  // Handler para upload de foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDogProfile({ ...dogProfile, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handlers de navegação do onboarding
  const nextStep = () => {
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      saveDogProfile();
    }
  };

  const prevStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const canProceed = () => {
    switch (onboardingStep) {
      case 0: return true;
      case 1: return dogProfile.name.trim() !== "";
      case 2: return dogProfile.age.trim() !== "";
      case 3: return dogProfile.breed.trim() !== "";
      case 4: return dogProfile.size !== "";
      case 5: return dogProfile.energy !== "";
      case 6: return dogProfile.gender !== "";
      default: return false;
    }
  };

  const openCourse = (course: MiniCourse) => {
    setSelectedCourse(course);
    setShowCourseDialog(true);
  };

  // Animação de círculo expandindo
  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>, callback: () => void) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    callback();
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setShowOnboarding(false);
  };

  // Cálculos
  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const taskProgress = (completedTasks / dailyTasks.length) * 100;
  const completedCourses = miniCourses.filter(c => c.completed).length;
  const courseProgress = (completedCourses / miniCourses.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF7F50] via-[#FF9A6C] to-[#1E3A8A] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Tela de Login com Supabase Auth
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF7F50] via-[#FF9A6C] to-[#1E3A8A] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Efeitos de fundo decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-300/5 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md p-8 md:p-10 shadow-2xl backdrop-blur-sm bg-white/95 relative z-10 border-0">
          {/* Logo e Título */}
          <div className="text-center space-y-6 mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/03fbc955-0ee5-48cb-ae3d-fcd598c598fe.png" 
                alt="Meu Cão - Beagle" 
                className="w-48 h-48 rounded-full object-cover drop-shadow-2xl"
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] bg-clip-text text-transparent">
                Meu Cão
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Cuidado inteligente para quem ama!
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <Sparkles className="w-4 h-4 inline mr-1 text-[#FF7F50]" />
                Entre com sua conta e comece a cuidar melhor do seu melhor amigo
              </p>
            </div>
          </div>

          {/* Supabase Auth UI */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#FF7F50',
                    brandAccent: '#FF6A3D',
                  },
                },
              },
            }}
            providers={['google', 'facebook']}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Continuar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha segura',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Continuar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
              },
            }}
          />

          <p className="text-xs text-center text-gray-500 pt-4 mt-4 border-t">
            Ao criar sua conta, você concorda com nossos termos de uso e política de privacidade
          </p>
        </Card>
      </div>
    );
  }

  // Onboarding
  if (showOnboarding) {
    const progressPercentage = ((onboardingStep + 1) / 7) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF7F50] via-[#FF9A6C] to-[#1E3A8A] flex items-center justify-center p-4 relative overflow-hidden">
        <style jsx>{`
          @keyframes ripple {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(4);
              opacity: 0;
            }
          }

          .ripple-effect {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF7F50 0%, #1E3A8A 100%);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
            transform: translate(-50%, -50%);
          }

          .card-option {
            position: relative;
            overflow: hidden;
          }
        `}</style>

        {/* Efeitos de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-lg p-8 md:p-10 shadow-2xl backdrop-blur-sm bg-white/95 relative z-10 border-0">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">
                Passo {onboardingStep + 1} de 7
              </span>
              <span className="text-xs font-medium text-[#FF7F50]">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Step 0: Welcome */}
          {onboardingStep === 0 && (
            <div className="space-y-6 text-center animate-in fade-in duration-500">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] bg-clip-text text-transparent">
                  Bem-vindo!
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Vamos conhecer seu melhor amigo
                </p>
              </div>
              <div className="pt-4 space-y-4">
                <div className="flex items-start gap-3 text-left p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#FF7F50] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Vamos criar um perfil personalizado para seu cão e começar uma jornada incrível juntos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Nome com foto */}
          {onboardingStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Qual o nome dele(a)?</h2>
                <p className="text-gray-600">Vamos começar pelo mais importante</p>
              </div>

              <div className="flex justify-center mb-4">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-32 h-32 rounded-full border-4 border-dashed border-gray-300 hover:border-[#FF7F50] transition-all overflow-hidden bg-gray-50 hover:bg-gray-100 group"
                  >
                    {dogProfile.photo ? (
                      <>
                        <img
                          src={dogProfile.photo}
                          alt="Foto do pet"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Camera className="w-10 h-10 text-gray-400 group-hover:text-[#FF7F50] transition-colors mb-2" />
                        <span className="text-xs text-gray-500 group-hover:text-[#FF7F50] transition-colors px-2">
                          Adicionar foto
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dogName" className="text-gray-700 font-medium">
                  Nome do seu pet
                </Label>
                <Input
                  id="dogName"
                  placeholder="Ex: Thor, Luna, Bob..."
                  value={dogProfile.name}
                  onChange={(e) => setDogProfile({ ...dogProfile, name: e.target.value })}
                  className="text-lg h-12 border-2 focus:border-[#FF7F50] transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Idade */}
          {onboardingStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Quantos anos {dogProfile.name} tem?</h2>
                <p className="text-gray-600">Isso nos ajuda a personalizar os cuidados</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-700 font-medium">
                  Idade
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  placeholder="Ex: 2, 8, 5..."
                  value={dogProfile.age}
                  onChange={(e) => setDogProfile({ ...dogProfile, age: e.target.value })}
                  className="text-lg h-12 border-2 focus:border-[#FF7F50] transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: Raça */}
          {onboardingStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Qual a raça de {dogProfile.name}?</h2>
                <p className="text-gray-600">Ou se é um vira-lata especial</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed" className="text-gray-700 font-medium">
                  Raça
                </Label>
                <Input
                  id="breed"
                  placeholder="Ex: Labrador, SRD, Vira-lata, Golden..."
                  value={dogProfile.breed}
                  onChange={(e) => setDogProfile({ ...dogProfile, breed: e.target.value })}
                  className="text-lg h-12 border-2 focus:border-[#FF7F50] transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 4: Porte */}
          {onboardingStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Qual o porte de {dogProfile.name}?</h2>
                <p className="text-gray-600">Escolha a opção que melhor se encaixa</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: "pequeno", label: "Pequeno", desc: "Até 10kg" },
                  { value: "médio", label: "Médio", desc: "10kg a 25kg" },
                  { value: "grande", label: "Grande", desc: "Acima de 25kg" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => handleCardClick(e, () => setDogProfile({ ...dogProfile, size: option.value as "pequeno" | "médio" | "grande" }))}
                    className={`card-option w-full p-5 rounded-xl border-2 text-left transition-all ${
                      dogProfile.size === option.value
                        ? "border-transparent bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] text-white shadow-lg scale-[1.02]"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className={`font-bold text-lg mb-1 ${dogProfile.size === option.value ? "text-white" : "text-gray-800"}`}>
                      {option.label}
                    </div>
                    <div className={`text-sm ${dogProfile.size === option.value ? "text-white/90" : "text-gray-600"}`}>
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Energia */}
          {onboardingStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Qual o nível de energia?</h2>
                <p className="text-gray-600">Isso ajuda a criar a rotina ideal</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: "baixo", label: "Baixo", desc: "Prefere descansar e é mais tranquilo" },
                  { value: "médio", label: "Médio", desc: "Equilibrado entre atividade e descanso" },
                  { value: "alto", label: "Alto", desc: "Muito ativo e sempre pronto para brincar" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => handleCardClick(e, () => setDogProfile({ ...dogProfile, energy: option.value as "baixo" | "médio" | "alto" }))}
                    className={`card-option w-full p-5 rounded-xl border-2 text-left transition-all ${
                      dogProfile.energy === option.value
                        ? "border-transparent bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] text-white shadow-lg scale-[1.02]"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className={`font-bold text-lg mb-1 ${dogProfile.energy === option.value ? "text-white" : "text-gray-800"}`}>
                      {option.label}
                    </div>
                    <div className={`text-sm ${dogProfile.energy === option.value ? "text-white/90" : "text-gray-600"}`}>
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Gênero */}
          {onboardingStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Última pergunta!</h2>
                <p className="text-gray-600">{dogProfile.name} é macho ou fêmea?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={(e) => handleCardClick(e, () => setDogProfile({ ...dogProfile, gender: "macho" }))}
                  className={`card-option p-6 rounded-xl border-2 text-center transition-all ${
                    dogProfile.gender === "macho"
                      ? "border-transparent bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] text-white shadow-lg scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="text-4xl mb-2">🐕</div>
                  <div className={`font-bold text-lg ${dogProfile.gender === "macho" ? "text-white" : "text-gray-800"}`}>
                    Macho
                  </div>
                </button>
                <button
                  onClick={(e) => handleCardClick(e, () => setDogProfile({ ...dogProfile, gender: "fêmea" }))}
                  className={`card-option p-6 rounded-xl border-2 text-center transition-all ${
                    dogProfile.gender === "fêmea"
                      ? "border-transparent bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] text-white shadow-lg scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="text-4xl mb-2">🐕</div>
                  <div className={`font-bold text-lg ${dogProfile.gender === "fêmea" ? "text-white" : "text-gray-800"}`}>
                    Fêmea
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <Button
              onClick={prevStep}
              disabled={onboardingStep === 0}
              variant="outline"
              className="h-12 border-2 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex-1 h-12 bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] hover:from-[#FF6A3D] hover:to-[#1E3A8A] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {onboardingStep === 6 ? "Finalizar" : "Continuar"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // App principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF7F50] to-[#1E3A8A] rounded-full flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Meu Cão</h1>
              <p className="text-xs text-gray-500">Cuidado inteligente</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Saudação */}
        <Card className="p-6 bg-gradient-to-br from-[#FF7F50]/10 to-[#1E3A8A]/10 border-[#FF7F50]/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-[#FF7F50]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {dogProfile.name} sentiu sua falta hoje
              </h2>
              <p className="text-gray-700">
                Pequenos cuidados criam grandes vínculos.
              </p>
            </div>
          </div>
        </Card>

        {/* Rotina do dia */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF7F50]" />
              Rotina de hoje
            </h3>
            <span className="text-sm text-gray-500">
              {completedTasks}/{dailyTasks.length}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="data-[state=checked]:bg-[#FF7F50] data-[state=checked]:border-[#FF7F50]"
                />
                <span
                  className={`flex-1 ${
                    task.completed ? "line-through text-gray-400" : "text-gray-700"
                  }`}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>

          <Progress value={taskProgress} className="h-2" />
          {completedTasks === dailyTasks.length && (
            <p className="text-center text-sm text-[#FF7F50] mt-3 font-medium">
              Você está fazendo o seu melhor! 🎉
            </p>
          )}
        </Card>

        {/* Progresso geral */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Cursos</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {completedCourses}/{miniCourses.length}
            </div>
            <Progress value={courseProgress} className="h-1.5" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-700">Vínculo</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {Math.round((courseProgress + taskProgress) / 2)}%
            </div>
            <Progress value={(courseProgress + taskProgress) / 2} className="h-1.5" />
          </Card>
        </div>

        {/* Mini-cursos */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF7F50]" />
            Aprender com Meu Cão
          </h3>

          <div className="space-y-3">
            {miniCourses.map((course) => (
              <Card
                key={course.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                  course.completed ? "bg-green-50 border-green-200" : "hover:border-[#FF7F50]/30"
                }`}
                onClick={() => openCourse(course)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.duration} de leitura</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mensagem motivacional */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <p className="text-center text-gray-700 italic">
            "Você está fazendo o seu melhor. Pequenos cuidados criam grandes vínculos."
          </p>
        </Card>
      </main>

      {/* Dialog do curso */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gray-800">
                  {selectedCourse.title}
                </DialogTitle>
                <p className="text-sm text-gray-500">{selectedCourse.duration} de leitura</p>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {selectedCourse.content.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-blue-50 border-[#FF7F50]/20 mt-6">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF7F50]" />
                    Experimente hoje
                  </h4>
                  <p className="text-gray-700">{selectedCourse.tip}</p>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCourseDialog(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                {!selectedCourse.completed && (
                  <Button
                    onClick={completeCourse}
                    className="flex-1 bg-gradient-to-r from-[#FF7F50] to-[#1E3A8A] hover:from-[#FF6A3D] hover:to-[#1E3A8A]"
                  >
                    Marcar como concluído
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
