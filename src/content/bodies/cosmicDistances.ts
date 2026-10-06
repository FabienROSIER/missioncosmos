export const AU_KM = 149_597_870.7;
export const LIGHT_YEAR_KM = 9_460_730_472_580.8;
export const DISTANCE_STOPS = [
  {
    id: 'moon',
    title: 'La Lune',
    measure: 'Terre → Lune · distance moyenne',
    value: '384 400 km',
    note: 'Sa lumière met environ 1,3 seconde pour nous atteindre.',
  },
  {
    id: 'sun',
    title: 'Le Soleil',
    measure: 'Terre → Soleil · distance moyenne',
    value: '1 UA · environ 150 millions de km',
    note: '1 UA = la distance moyenne entre la Terre et le Soleil. La lumière met environ 8 minutes et 20 secondes.',
  },
  {
    id: 'system',
    title: 'Les planètes lointaines',
    measure: 'Soleil → Neptune · distance moyenne',
    value: 'Environ 30 UA',
    note: 'Neptune est la plus lointaine des huit planètes. Le Système solaire continue au-delà de son orbite !',
  },
  {
    id: 'proxima',
    title: 'Une étoile voisine',
    measure: 'Notre voisinage → Proxima du Centaure',
    value: 'Environ 4,24 années-lumière',
    note: 'Ces étoiles voisines appartiennent, comme le Soleil, à la Voie lactée. Une année-lumière est une distance : le chemin de la lumière en un an.',
  },
  {
    id: 'milky-way',
    title: 'La Voie lactée',
    measure: 'Largeur du disque d’étoiles, estimée',
    value: 'Environ 100 000 années-lumière',
    note: 'Ici, on compare la largeur de la galaxie, pas sa distance depuis la Terre : nous sommes à l’intérieur.',
  },
  {
    id: 'andromeda',
    title: 'Une autre galaxie',
    measure: 'Notre galaxie → Andromède',
    value: 'Environ 2,5 millions d’années-lumière',
    note: 'Même notre grande galaxie voisine est incroyablement éloignée.',
  },
  {
    id: 'universe',
    title: 'L’Univers observable',
    measure: 'Largeur de l’Univers observable, estimée aujourd’hui',
    value: 'Environ 93 milliards d’années-lumière',
    note: 'C’est la région dont la lumière peut nous parvenir, pas le bord de tout l’Univers. L’espace s’est agrandi pendant le voyage de cette lumière.',
  },
] as const;
export const DELIVERY_TARGETS = [
  { id: 'moon', label: 'La Lune', km: 384_400 },
  { id: 'sun', label: 'Le Soleil', km: AU_KM },
  { id: 'proxima', label: 'Proxima du Centaure', km: 4.24 * LIGHT_YEAR_KM },
  { id: 'andromeda', label: 'Andromède', km: 2_500_000 * LIGHT_YEAR_KM },
] as const;
