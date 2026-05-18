export interface Game {
  id: string;
  title: string;
  developer: string;
  price: number;
  genre: string;
  description: string;
  coverImage: string;
  heroImage?: string;
  gallery: string[];
  pros: string[];
  cons: string[];
}

export const games: Game[] = [
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    developer: 'CD Projekt Red',
    price: 299.99,
    genre: 'Mundo Aberto, Ação, RPG',
    description: 'Um futuro distópico onde a tecnologia é tudo. Explore Night City como V, um mercenário em busca de implantes que garantem a imortalidade.',
    coverImage: '/public/fotos 2077/thumb2077.jpg',
    heroImage: '/public/fotos 2077/cartaz.webp',
    gallery: [
      '/public/fotos 2077/1.jpg',
      '/public/fotos 2077/2.jpg',
      '/public/fotos 2077/3.jpg'
    ],
    pros: [
      'Mundo aberto extremamente imersivo e detalhado',
      'História espetacular com personagens profundos',
      'Total liberdade para escolher como jogar'
    ],
    cons: [
      'Temática pesada e adulta',
      'Exige hardware de ponta para gráficos no máximo'
    ]
  },
  {
    id: 'resident-evil-requiem',
    title: 'Resident Evil Requiem',
    developer: 'Capcom',
    price: 349.99,
    genre: 'Survival Horror',
    description: 'Sobreviva ao pesadelo em uma experiência aterrorizante de survival horror e mistérios sombrios. O mal retorna.',
    coverImage: '/public/fotos R9/thumbR9.jpg', // Assuming this exists or falls back
    heroImage: '/public/fotos R9/cartaz.webp',
    gallery: [
      '/public/fotos R9/1.jpg',
      '/public/fotos R9/2.jpg',
      '/public/fotos R9/3.jpg'
    ],
    pros: [
      'Gráficos fotorrealistas assustadores',
      'Retorno às raízes do survival horror',
      'Inimigos imprevisíveis'
    ],
    cons: [
      'Pode ser muito intenso para jogadores casuais',
      'Inventário extremamente limitado'
    ]
  },
  {
    id: 'arc-raiders',
    title: 'ARC Raiders',
    developer: 'Embark Studios',
    price: 0, // Free to play or adjust if needed
    genre: 'Shooter Cooperativo',
    description: 'Enfrente máquinas espaciais em um shooter cooperativo de tirar o fôlego. Junte-se à resistência.',
    coverImage: '/public/fotos ARC/thumbARC.jpg',
    heroImage: '/public/fotos ARC/cartaz.png',
    gallery: [
      '/public/fotos ARC/1.jpg',
      '/public/fotos ARC/2.jpg',
      '/public/fotos ARC/3.jpg'
    ],
    pros: [
      'Cooperativo viciante',
      'Visuais deslumbrantes no motor Unreal Engine',
      'Combate tático e frenético'
    ],
    cons: [
      'Requer constante conexão com a internet',
      'Curva de aprendizado íngreme'
    ]
  },
  {
    id: 'spider-man-2',
    title: 'Spider-Man 2',
    developer: 'Insomniac Games',
    price: 349.99,
    genre: 'Ação, Aventura',
    description: 'Balance pela cidade de Nova York com Peter Parker e Miles Morales. Enfrente o terrível Venom.',
    coverImage: '/public/fotos SPIDER-MAN/thumbSpider.jpg',
    heroImage: '/public/fotos SPIDER-MAN/cartaz.jpg',
    gallery: [
      '/public/fotos SPIDER-MAN/1.jpg',
      '/public/fotos SPIDER-MAN/2.jpg',
      '/public/fotos SPIDER-MAN/3.jpg'
    ],
    pros: [
      'Dois protagonistas jogáveis com estilos únicos',
      'A melhor representação de NY já feita',
      'Combate fluido e cinematográfico'
    ],
    cons: [
      'Missões secundárias podem ser repetitivas',
      'História principal relativamente curta'
    ]
  }
];

export const getGameById = (id: string) => games.find(g => g.id === id);
