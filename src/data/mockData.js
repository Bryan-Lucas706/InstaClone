// ============================================================
// INSTACLONE — Dados Mock Realistas
//
// Estes dados servem como seed inicial do localStorage.
// Simulam um ambiente social real com usuários distintos,
// posts variados, comentários e interações já existentes.
// ============================================================

// --- Usuários ---
// Campos espelham o shape que a API real retornaria.
// Senhas em texto plano APENAS porque é modo mock local —
// nunca faremos isso com uma API real.
export const MOCK_USERS = [
  {
    id: 'user_001',
    username: 'usuario_teste',
    name: 'Usuário Teste',
    email: 'teste@instaclone.com',
    password: 'senha123', // credencial de teste documentada no prompt
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=usuario_teste',
    bio: '📸 Fotógrafo amador | 🌎 Viajante nas horas vagas | Vue.js lover',
    followersCount: 248,
    followingCount: 183,
    // Lista de IDs de quem este usuário segue
    following: ['user_002', 'user_003'],
    // Lista de IDs dos seguidores deste usuário
    followers: ['user_002', 'user_004'],
  },
  {
    id: 'user_002',
    username: 'ana_viagens',
    name: 'Ana Beatriz',
    email: 'ana@instaclone.com',
    password: 'senha123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana_viagens',
    bio: '✈️ 32 países | 📍 Atualmente: Lisboa | Dicas de viagem todo dia',
    followersCount: 12400,
    followingCount: 892,
    following: ['user_001', 'user_003', 'user_004'],
    followers: ['user_001', 'user_003', 'user_004'],
  },
  {
    id: 'user_003',
    username: 'dev_carlos',
    name: 'Carlos Eduardo',
    email: 'carlos@instaclone.com',
    password: 'senha123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev_carlos',
    bio: '💻 Desenvolvedor Full Stack | ☕ Viciado em café | Open Source',
    followersCount: 3100,
    followingCount: 410,
    following: ['user_001', 'user_002'],
    followers: ['user_001', 'user_002', 'user_004'],
  },
  {
    id: 'user_004',
    username: 'julia_food',
    name: 'Júlia Mendes',
    email: 'julia@instaclone.com',
    password: 'senha123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia_food',
    bio: '🍕 Chef caseira | 📖 Receitas autorais | Comida de verdade 🌿',
    followersCount: 8750,
    followingCount: 643,
    following: ['user_002', 'user_003'],
    followers: ['user_001', 'user_002', 'user_003'],
  },
]

// --- Posts ---
// createdAt usa timestamps escalonados para simular um feed real
// com posts em momentos distintos (minutos, horas e dias atrás).
export const MOCK_POSTS = [
  {
    id: 'post_001',
    authorId: 'user_002',
    // picsum.photos entrega imagens reais e variadas por seed numérico
    imageUrl: 'https://picsum.photos/seed/lisbon/600/600',
    caption: 'Lisboa ao pôr do sol 🌅 Cada vez que venho aqui fico mais apaixonada por essa cidade. A luz do fim de tarde batendo nos azulejos é indescritível. #Lisboa #Portugal #Viagem #GoldenHour',
    location: 'Lisboa, Portugal',
    likesCount: 847,
    // likedBy guarda IDs dos usuários que curtiram — usado pelo toggleLike
    likedBy: ['user_001', 'user_003'],
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 min atrás
    comments: [
      {
        id: 'comment_001a',
        userId: 'user_001',
        username: 'usuario_teste',
        text: 'Que foto incrível! Lisboa está na minha lista faz anos 😍',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'comment_001b',
        userId: 'user_003',
        username: 'dev_carlos',
        text: 'A arquitetura portuguesa é realmente única. Quero muito conhecer!',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        id: 'comment_001c',
        userId: 'user_004',
        username: 'julia_food',
        text: 'E a gastronomia de lá então?? Pastel de nata todo dia 🥐❤️',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
  },
  {
    id: 'post_002',
    authorId: 'user_004',
    imageUrl: 'https://picsum.photos/seed/pasta/600/600',
    caption: 'Massa fresca feita com amor hoje de manhã 🍝 Segredo: farinha 00 + ovos caipiras + muita paciência. A receita completa tá nos stories! #CozinhaAutoral #MassaFresca #ReceitaCaseira',
    location: 'São Paulo, SP',
    likesCount: 1243,
    likedBy: ['user_001', 'user_002', 'user_003'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
    comments: [
      {
        id: 'comment_002a',
        userId: 'user_002',
        username: 'ana_viagens',
        text: 'Meu Deus que perfeição!! Quando você abre restaurante?? 😭',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
      {
        id: 'comment_002b',
        userId: 'user_001',
        username: 'usuario_teste',
        text: 'Preciso dessa receita com urgência! 🙏',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: 'post_003',
    authorId: 'user_003',
    imageUrl: 'https://picsum.photos/seed/coding/600/600',
    caption: 'Setup novo funcionando 💻⚡ Depois de meses usando setup de 2018, finalmente upgradei. Produtividade nas alturas! Monitor ultrawide muda tudo pra quem trabalha com código. #DevLife #Setup #Programação #HomeOffice',
    location: 'Home Office, Belo Horizonte',
    likesCount: 562,
    likedBy: ['user_002', 'user_004'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h atrás
    comments: [
      {
        id: 'comment_003a',
        userId: 'user_001',
        username: 'usuario_teste',
        text: 'Que setup dos sonhos!! Qual o monitor?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'post_004',
    authorId: 'user_001',
    imageUrl: 'https://picsum.photos/seed/forest/600/600',
    caption: 'Trilha da manhã antes do trabalho 🌿 Começar o dia no meio da natureza recarrega de um jeito que nenhum café consegue. Recomendo fortemente! #Trilha #Natureza #BemEstar #ManhãNaMata',
    location: 'Parque Estadual, Curitiba',
    likesCount: 389,
    likedBy: ['user_002', 'user_003', 'user_004'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23h atrás
    comments: [
      {
        id: 'comment_004a',
        userId: 'user_004',
        username: 'julia_food',
        text: 'Que lugar lindo!! Fica perto de casa?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: 'comment_004b',
        userId: 'user_002',
        username: 'ana_viagens',
        text: 'Curitiba tem parques tão bonitos 💚',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
  {
    id: 'post_005',
    authorId: 'user_002',
    imageUrl: 'https://picsum.photos/seed/beach/600/600',
    caption: 'Quando a viagem supera todas as expectativas 🌊 Essa praia ficou do lado de fora dos guias turísticos por anos — e ainda bem, porque continua um paraíso intocado. Não vou revelar o nome pra proteger o lugar 🤫 #PraiaEscondida #Viagem #Natureza',
    location: 'Localização secreta 🤫',
    likesCount: 2180,
    likedBy: ['user_001', 'user_003', 'user_004'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
    comments: [
      {
        id: 'comment_005a',
        userId: 'user_003',
        username: 'dev_carlos',
        text: 'Me manda o nome no direct pfv 😂😂',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
      },
      {
        id: 'comment_005b',
        userId: 'user_004',
        username: 'julia_food',
        text: 'Maravilhoso demais!! Parece irreal 😍',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
      },
      {
        id: 'comment_005c',
        userId: 'user_001',
        username: 'usuario_teste',
        text: 'Esse azul do mar... foto ou render?? 😂',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      },
    ],
  },
  {
    id: 'post_006',
    authorId: 'user_004',
    imageUrl: 'https://picsum.photos/seed/dessert/600/600',
    caption: 'Cheesecake de maracujá com calda de frutas vermelhas 🍰❤️ Testei essa combinação por acidente e virou o hit da família. Doce, azedinho, cremoso — tudo equilibrado. Receita no blog (link na bio)! #Sobremesa #Cheesecake #Confeitaria #ReceitaDoce',
    location: 'São Paulo, SP',
    likesCount: 934,
    likedBy: ['user_001', 'user_002'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 dias atrás
    comments: [
      {
        id: 'comment_006a',
        userId: 'user_001',
        username: 'usuario_teste',
        text: 'Já estou salivando só de olhar a foto 🤤',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      },
      {
        id: 'comment_006b',
        userId: 'user_002',
        username: 'ana_viagens',
        text: 'Aprendi a fazer cheesecake em NY e nunca mais parei! Esse teu tá lindo 👏',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 68).toISOString(),
      },
    ],
  },
]