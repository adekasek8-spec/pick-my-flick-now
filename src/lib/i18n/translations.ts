export type Language = "en" | "ru" | "kk" | "es" | "fr" | "tr";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "kk", label: "Қазақша", flag: "🇰🇿" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

export type TranslationKey =
  | "brand"
  | "tagline"
  | "heroBadge"
  | "heroTitle1"
  | "heroTitle2"
  | "heroSubtitle"
  | "searchPlaceholder"
  | "findSimilar"
  | "orPickMood"
  | "saved"
  | "signOut"
  | "preferences"
  | "footer"
  // Results page
  | "back"
  | "moodSelection"
  | "similarTo"
  | "picks"
  | "like"
  | "resultsSubtitle"
  | "refreshMovies"
  | "curating"
  | "showMoreMovies"
  | "alreadySeen"
  | "noPicks"
  // Movie page
  | "watchTrailer"
  | "saveToWatchlist"
  | "inWatchlist"
  | "loadingDetails"
  | "trailer"
  | "castCrew"
  | "director"
  | "starring"
  | "genre"
  | "moodTags"
  | "moreLikeThis"
  | "seeAll"
  | "why"
  // Auth
  | "welcomeBack"
  | "signInSubtitle"
  | "email"
  | "password"
  | "signIn"
  | "noAccount"
  | "createOne"
  | "createAccount"
  | "registerSubtitle"
  | "fullName"
  | "username"
  | "confirmPassword"
  | "haveAccount"
  // Moods
  | "moodHappy"
  | "moodSad"
  | "moodCalm"
  | "moodMotivated"
  | "moodAction"
  | "moodRomantic"
  | "moodScary"
  | "moodAnime"
  | "language";

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  brand: "CINEMOOD",
  tagline: "AI Movie Picker",
  heroBadge: "AI Movie Picker",
  heroTitle1: "What should you",
  heroTitle2: "watch tonight?",
  heroSubtitle:
    "Type a film you love or pick a mood — our AI reads its genre, theme and atmosphere to hand you fresh picks every single time.",
  searchPlaceholder: "Type a movie you love… e.g. Interstellar",
  findSimilar: "Find similar",
  orPickMood: "Or pick a mood",
  saved: "saved",
  signOut: "Sign out",
  preferences: "Preferences",
  footer: "Made with 🎬 for movie nights · Powered by AI",
  back: "Back to home",
  moodSelection: "Mood selection",
  similarTo: "Similar to",
  picks: "picks",
  like: "Like",
  resultsSubtitle:
    "AI-curated for your taste. Tap any film for the full breakdown — cast, plot, trailer and more.",
  refreshMovies: "Refresh movies",
  curating: "AI is curating fresh picks…",
  showMoreMovies: "Show more movies",
  alreadySeen: "Already seen these?",
  noPicks: "No picks yet — head back home to choose a mood or search.",
  watchTrailer: "Watch trailer",
  saveToWatchlist: "Save to watchlist",
  inWatchlist: "In watchlist",
  loadingDetails: "Loading details…",
  trailer: "Trailer",
  castCrew: "Cast & crew",
  director: "Director",
  starring: "Starring",
  genre: "Genre",
  moodTags: "Mood tags",
  moreLikeThis: "More like this",
  seeAll: "See all",
  why: "Why",
  welcomeBack: "Welcome back",
  signInSubtitle: "Sign in to continue your cinematic journey.",
  email: "Email",
  password: "Password",
  signIn: "Sign in",
  noAccount: "Don't have an account?",
  createOne: "Create one",
  createAccount: "Create account",
  registerSubtitle: "Start your personal cinema journey.",
  fullName: "Full name",
  username: "Username",
  confirmPassword: "Confirm password",
  haveAccount: "Already have an account?",
  moodHappy: "Happy",
  moodSad: "Sad",
  moodCalm: "Calm",
  moodMotivated: "Motivated",
  moodAction: "Action",
  moodRomantic: "Romantic",
  moodScary: "Scary",
  moodAnime: "Anime",
  language: "Language",
};

const ru: Dict = {
  brand: "CINEMOOD",
  tagline: "ИИ-подборщик фильмов",
  heroBadge: "ИИ-подборщик фильмов",
  heroTitle1: "Что посмотреть",
  heroTitle2: "сегодня вечером?",
  heroSubtitle:
    "Введите любимый фильм или выберите настроение — наш ИИ подберёт свежие рекомендации каждый раз.",
  searchPlaceholder: "Введите название фильма… например, Интерстеллар",
  findSimilar: "Найти похожие",
  orPickMood: "Или выберите настроение",
  saved: "сохранено",
  signOut: "Выйти",
  preferences: "Настройки",
  footer: "Сделано с 🎬 для киновечеров · На основе ИИ",
  back: "На главную",
  moodSelection: "Выбор настроения",
  similarTo: "Похожее на",
  picks: "подборка",
  like: "Похожее на",
  resultsSubtitle:
    "Подобрано ИИ под ваш вкус. Нажмите на фильм для полной информации — актёры, сюжет, трейлер и многое другое.",
  refreshMovies: "Обновить фильмы",
  curating: "ИИ подбирает свежие фильмы…",
  showMoreMovies: "Показать ещё фильмы",
  alreadySeen: "Уже видели эти?",
  noPicks: "Пока нет рекомендаций — вернитесь на главную и выберите настроение.",
  watchTrailer: "Смотреть трейлер",
  saveToWatchlist: "В список просмотра",
  inWatchlist: "В списке",
  loadingDetails: "Загрузка информации…",
  trailer: "Трейлер",
  castCrew: "Актёры и съёмочная группа",
  director: "Режиссёр",
  starring: "В ролях",
  genre: "Жанр",
  moodTags: "Настроение",
  moreLikeThis: "Похожие фильмы",
  seeAll: "Все",
  why: "Почему",
  welcomeBack: "С возвращением",
  signInSubtitle: "Войдите, чтобы продолжить кино-путешествие.",
  email: "Эл. почта",
  password: "Пароль",
  signIn: "Войти",
  noAccount: "Нет аккаунта?",
  createOne: "Создать",
  createAccount: "Регистрация",
  registerSubtitle: "Начните своё личное кино-путешествие.",
  fullName: "Полное имя",
  username: "Имя пользователя",
  confirmPassword: "Подтвердите пароль",
  haveAccount: "Уже есть аккаунт?",
  moodHappy: "Радостное",
  moodSad: "Грустное",
  moodCalm: "Спокойное",
  moodMotivated: "Мотивирующее",
  moodAction: "Боевик",
  moodRomantic: "Романтичное",
  moodScary: "Страшное",
  moodAnime: "Аниме",
  language: "Язык",
};

const kk: Dict = {
  brand: "CINEMOOD",
  tagline: "ЖИ фильм таңдағыш",
  heroBadge: "ЖИ фильм таңдағыш",
  heroTitle1: "Бүгін кешке нені",
  heroTitle2: "көру керек?",
  heroSubtitle:
    "Ұнайтын фильмді жазыңыз немесе көңіл-күйді таңдаңыз — ЖИ әр жолы жаңа ұсыныстар береді.",
  searchPlaceholder: "Ұнайтын фильмді жазыңыз… мысалы, Интерстеллар",
  findSimilar: "Ұқсастарды табу",
  orPickMood: "Немесе көңіл-күйді таңдаңыз",
  saved: "сақталды",
  signOut: "Шығу",
  preferences: "Параметрлер",
  footer: "Кино кештері үшін 🎬 жасалған · ЖИ негізінде",
  back: "Басты бетке",
  moodSelection: "Көңіл-күй",
  similarTo: "Ұқсас",
  picks: "таңдау",
  like: "Ұқсас",
  resultsSubtitle:
    "ЖИ сіздің талғамыңызға арнап таңдады. Толық ақпарат үшін фильмді басыңыз — актёрлер, сюжет, трейлер.",
  refreshMovies: "Фильмдерді жаңарту",
  curating: "ЖИ жаңа фильмдерді таңдауда…",
  showMoreMovies: "Көбірек көрсету",
  alreadySeen: "Бұларды көрдіңіз бе?",
  noPicks: "Әзірге таңдау жоқ — басты бетке оралып, көңіл-күйді таңдаңыз.",
  watchTrailer: "Трейлерді көру",
  saveToWatchlist: "Тізімге сақтау",
  inWatchlist: "Тізімде",
  loadingDetails: "Ақпарат жүктелуде…",
  trailer: "Трейлер",
  castCrew: "Актёрлер мен команда",
  director: "Режиссёр",
  starring: "Басты рөлдерде",
  genre: "Жанр",
  moodTags: "Көңіл-күй",
  moreLikeThis: "Ұқсас фильмдер",
  seeAll: "Барлығы",
  why: "Себебі",
  welcomeBack: "Қайта келдіңіз",
  signInSubtitle: "Кино саяхатыңызды жалғастыру үшін кіріңіз.",
  email: "Эл. пошта",
  password: "Құпиясөз",
  signIn: "Кіру",
  noAccount: "Аккаунтыңыз жоқ па?",
  createOne: "Тіркелу",
  createAccount: "Тіркелу",
  registerSubtitle: "Жеке кино саяхатыңызды бастаңыз.",
  fullName: "Толық аты",
  username: "Қолданушы аты",
  confirmPassword: "Құпиясөзді растаңыз",
  haveAccount: "Аккаунтыңыз бар ма?",
  moodHappy: "Қуанышты",
  moodSad: "Көңілсіз",
  moodCalm: "Тыныш",
  moodMotivated: "Шабыттандырғыш",
  moodAction: "Экшн",
  moodRomantic: "Романтикалық",
  moodScary: "Қорқынышты",
  moodAnime: "Аниме",
  language: "Тіл",
};

const es: Dict = {
  brand: "CINEMOOD",
  tagline: "Selector de películas con IA",
  heroBadge: "Selector con IA",
  heroTitle1: "¿Qué deberías",
  heroTitle2: "ver esta noche?",
  heroSubtitle:
    "Escribe una película que te guste o elige un estado de ánimo — nuestra IA te dará recomendaciones frescas cada vez.",
  searchPlaceholder: "Escribe una película que te guste… ej. Interstellar",
  findSimilar: "Buscar similares",
  orPickMood: "O elige un estado de ánimo",
  saved: "guardadas",
  signOut: "Cerrar sesión",
  preferences: "Preferencias",
  footer: "Hecho con 🎬 para noches de cine · Impulsado por IA",
  back: "Volver al inicio",
  moodSelection: "Estado de ánimo",
  similarTo: "Similar a",
  picks: "selecciones",
  like: "Como",
  resultsSubtitle:
    "Curado por IA para tu gusto. Toca cualquier película para ver detalles — reparto, trama y tráiler.",
  refreshMovies: "Actualizar películas",
  curating: "La IA está seleccionando películas…",
  showMoreMovies: "Mostrar más",
  alreadySeen: "¿Ya las viste?",
  noPicks: "Aún no hay selecciones — vuelve al inicio y elige un estado.",
  watchTrailer: "Ver tráiler",
  saveToWatchlist: "Guardar en lista",
  inWatchlist: "En la lista",
  loadingDetails: "Cargando detalles…",
  trailer: "Tráiler",
  castCrew: "Reparto y equipo",
  director: "Director",
  starring: "Protagonistas",
  genre: "Género",
  moodTags: "Etiquetas",
  moreLikeThis: "Más como esto",
  seeAll: "Ver todo",
  why: "Por qué",
  welcomeBack: "Bienvenido de nuevo",
  signInSubtitle: "Inicia sesión para continuar tu viaje cinematográfico.",
  email: "Correo",
  password: "Contraseña",
  signIn: "Iniciar sesión",
  noAccount: "¿No tienes cuenta?",
  createOne: "Crear una",
  createAccount: "Crear cuenta",
  registerSubtitle: "Empieza tu viaje de cine personal.",
  fullName: "Nombre completo",
  username: "Usuario",
  confirmPassword: "Confirmar contraseña",
  haveAccount: "¿Ya tienes cuenta?",
  moodHappy: "Feliz",
  moodSad: "Triste",
  moodCalm: "Tranquilo",
  moodMotivated: "Motivado",
  moodAction: "Acción",
  moodRomantic: "Romántico",
  moodScary: "Miedo",
  moodAnime: "Anime",
  language: "Idioma",
};

const fr: Dict = {
  brand: "CINEMOOD",
  tagline: "Sélecteur de films IA",
  heroBadge: "Sélecteur IA",
  heroTitle1: "Que devriez-vous",
  heroTitle2: "regarder ce soir ?",
  heroSubtitle:
    "Tapez un film que vous aimez ou choisissez une humeur — notre IA vous donne des recommandations fraîches à chaque fois.",
  searchPlaceholder: "Tapez un film que vous aimez… ex. Interstellar",
  findSimilar: "Trouver similaires",
  orPickMood: "Ou choisissez une humeur",
  saved: "enregistrés",
  signOut: "Déconnexion",
  preferences: "Préférences",
  footer: "Fait avec 🎬 pour les soirées ciné · Propulsé par l'IA",
  back: "Retour à l'accueil",
  moodSelection: "Humeur",
  similarTo: "Similaire à",
  picks: "choix",
  like: "Comme",
  resultsSubtitle:
    "Sélectionné par l'IA pour votre goût. Touchez un film pour tous les détails.",
  refreshMovies: "Actualiser",
  curating: "L'IA sélectionne des films frais…",
  showMoreMovies: "Voir plus",
  alreadySeen: "Déjà vus ?",
  noPicks: "Aucune sélection — retournez à l'accueil pour choisir une humeur.",
  watchTrailer: "Voir la bande-annonce",
  saveToWatchlist: "Ajouter à la liste",
  inWatchlist: "Dans la liste",
  loadingDetails: "Chargement…",
  trailer: "Bande-annonce",
  castCrew: "Casting & équipe",
  director: "Réalisateur",
  starring: "Avec",
  genre: "Genre",
  moodTags: "Ambiance",
  moreLikeThis: "À voir aussi",
  seeAll: "Tout voir",
  why: "Pourquoi",
  welcomeBack: "Bon retour",
  signInSubtitle: "Connectez-vous pour continuer votre voyage cinéma.",
  email: "Email",
  password: "Mot de passe",
  signIn: "Se connecter",
  noAccount: "Pas de compte ?",
  createOne: "Créer",
  createAccount: "Créer un compte",
  registerSubtitle: "Commencez votre voyage cinéma personnel.",
  fullName: "Nom complet",
  username: "Pseudo",
  confirmPassword: "Confirmer le mot de passe",
  haveAccount: "Déjà un compte ?",
  moodHappy: "Joyeux",
  moodSad: "Triste",
  moodCalm: "Calme",
  moodMotivated: "Motivé",
  moodAction: "Action",
  moodRomantic: "Romantique",
  moodScary: "Effrayant",
  moodAnime: "Anime",
  language: "Langue",
};

const tr: Dict = {
  brand: "CINEMOOD",
  tagline: "AI Film Seçici",
  heroBadge: "AI Film Seçici",
  heroTitle1: "Bu akşam",
  heroTitle2: "ne izlemelisin?",
  heroSubtitle:
    "Sevdiğin bir filmi yaz veya bir ruh hali seç — yapay zekamız her seferinde taze öneriler sunar.",
  searchPlaceholder: "Sevdiğin bir film yaz… örn. Interstellar",
  findSimilar: "Benzerlerini bul",
  orPickMood: "Ya da bir ruh hali seç",
  saved: "kaydedildi",
  signOut: "Çıkış",
  preferences: "Tercihler",
  footer: "Film geceleri için 🎬 ile yapıldı · AI destekli",
  back: "Ana sayfaya dön",
  moodSelection: "Ruh hali",
  similarTo: "Benzer",
  picks: "seçim",
  like: "Benzer",
  resultsSubtitle:
    "Zevkin için AI tarafından seçildi. Detaylar için filme dokun.",
  refreshMovies: "Filmleri yenile",
  curating: "AI taze filmler seçiyor…",
  showMoreMovies: "Daha fazla göster",
  alreadySeen: "Bunları gördün mü?",
  noPicks: "Henüz seçim yok — ana sayfaya dönüp bir ruh hali seç.",
  watchTrailer: "Fragmanı izle",
  saveToWatchlist: "Listeye kaydet",
  inWatchlist: "Listede",
  loadingDetails: "Detaylar yükleniyor…",
  trailer: "Fragman",
  castCrew: "Oyuncular ve ekip",
  director: "Yönetmen",
  starring: "Başrolde",
  genre: "Tür",
  moodTags: "Ruh hali",
  moreLikeThis: "Benzer filmler",
  seeAll: "Tümünü gör",
  why: "Neden",
  welcomeBack: "Tekrar hoş geldin",
  signInSubtitle: "Sinema yolculuğuna devam etmek için giriş yap.",
  email: "E-posta",
  password: "Şifre",
  signIn: "Giriş yap",
  noAccount: "Hesabın yok mu?",
  createOne: "Oluştur",
  createAccount: "Hesap oluştur",
  registerSubtitle: "Kişisel sinema yolculuğuna başla.",
  fullName: "Ad soyad",
  username: "Kullanıcı adı",
  confirmPassword: "Şifreyi onayla",
  haveAccount: "Zaten hesabın var mı?",
  moodHappy: "Mutlu",
  moodSad: "Hüzünlü",
  moodCalm: "Sakin",
  moodMotivated: "Motive",
  moodAction: "Aksiyon",
  moodRomantic: "Romantik",
  moodScary: "Korkutucu",
  moodAnime: "Anime",
  language: "Dil",
};

export const TRANSLATIONS: Record<Language, Dict> = { en, ru, kk, es, fr, tr };
