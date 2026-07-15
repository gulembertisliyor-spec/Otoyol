export interface VehicleTollRates {
  [classId: number]: number; // classId is 1 to 6
}

export interface BridgeTunnelToll {
  id: string;
  name: string;
  midpoint: [number, number]; // [latitude, longitude]
  rates: VehicleTollRates;
  operator: 'KGM' | 'Özel';
  description: string;
  timeSavedMinutes: number;
}

export interface HighwayToll {
  code: string; // e.g. "O-5"
  name: string;
  ratesPerKm: VehicleTollRates;
  baseEntryFee: VehicleTollRates;
  operator: 'KGM' | 'Özel';
  description: string;
  majorCities: string[];
}

export interface VehicleClass {
  id: number;
  name: string;
  description: string;
  example: string;
}

export const VEHICLE_CLASSES: VehicleClass[] = [
  { id: 1, name: "1. Sınıf Araç", description: "Otomobiller", example: "Binek otomobil, sedan, hatchback, küçük SUV (Aks aralığı 3.20m altı)" },
  { id: 2, name: "2. Sınıf Araç", description: "Hafif Ticari Araçlar", example: "Minibüs, panelvan, kamyonet, büyük SUV, pikap (Aks aralığı 3.20m ve üzeri)" },
  { id: 3, name: "3. Sınıf Araç", description: "Otobüsler & 3 Akslılar", example: "3 akslı her türlü yolcu otobüsü veya ağır vasıta" },
  { id: 4, name: "4. Sınıf Araç", description: "Kamyonlar (4-5 Akslı)", example: "4 veya 5 akslı tırlar, büyük kamyonlar ve inşaat araçları" },
  { id: 5, name: "5. Sınıf Araç", description: "Tırlar (6+ Akslı)", example: "6 veya daha fazla akslı dev tırlar, römorklu büyük çekiciler" },
  { id: 6, name: "6. Sınıf Araç", description: "Motosikletler", example: "Tüm 2 veya 3 tekerlekli motosikletler (HGS aboneliği ile)" }
];

export const BRIDGES_AND_TUNNELS: BridgeTunnelToll[] = [
  {
    id: "osmangazi",
    name: "Osmangazi Köprüsü",
    midpoint: [40.7381, 29.5168],
    rates: { 1: 1170.00, 2: 1870.00, 3: 2215.00, 4: 2940.00, 5: 3715.00, 6: 820.00 },
    operator: "Özel",
    description: "İzmit Körfezi'ni Dilovası ile Altınova arasında bağlar. İstanbul - İzmir arası ulaşım süresini 1.5 saat kısaltır.",
    timeSavedMinutes: 90
  },
  {
    id: "yavuz_sultan_selim",
    name: "Yavuz Sultan Selim Köprüsü (3. Köprü)",
    midpoint: [41.2064, 29.1197],
    rates: { 1: 110.00, 2: 145.00, 3: 250.00, 4: 640.00, 5: 795.00, 6: 78.00 },
    operator: "Özel",
    description: "İstanbul Boğazı'nın Karadeniz'e bakan kuzey tarafında yer alır. Özellikle ağır vasıtalar ve transit geçişler için zorunludur.",
    timeSavedMinutes: 45
  },
  {
    id: "canakkale_1915",
    name: "1915 Çanakkale Köprüsü",
    midpoint: [40.3278, 26.6389],
    rates: { 1: 820.00, 2: 1230.00, 3: 1845.00, 4: 2050.00, 5: 3835.00, 6: 205.00 },
    operator: "Özel",
    description: "Çanakkale Boğazı'nı Gelibolu ile Lapseki arasında bağlar. Ege ve Akdeniz'i Avrupa'ya bağlayan en önemli geçittir. Feribot kuyruklarını önler.",
    timeSavedMinutes: 60
  },
  {
    id: "avrasya_tuneli",
    name: "Avrasya Tüneli",
    midpoint: [41.0022, 29.0091],
    // 156 TL gündüz tarifesi (05:00-23:59), gece %50 indirimli. Ortalama veya gündüz tarifesini baz alıyoruz.
    rates: { 1: 156.00, 2: 234.00, 3: 0, 4: 0, 5: 0, 6: 60.80 },
    operator: "Özel",
    description: "Asya ve Avrupa yakalarını deniz tabanının altından karayolu ile bağlayan çift katlı tünel. Fatih ile Kadıköy arasını 5 dakikaya indirir. Ağır vasıtalara kapalıdır.",
    timeSavedMinutes: 40
  },
  {
    id: "fsm_15temmuz",
    name: "15 Temmuz Şehitler & FSM Köprüleri",
    midpoint: [41.0458, 29.0345], // 15 Temmuz Şehitler Köprüsü konumu
    rates: { 1: 33.00, 2: 42.00, 3: 81.00, 4: 162.00, 5: 254.00, 6: 13.00 },
    operator: "KGM",
    description: "İstanbul Boğazı üzerindeki KGM işletmesinde olan köprüler. Geçiş ücreti sadece Asya'dan Avrupa'ya gidiş yönünde alınmaktadır.",
    timeSavedMinutes: 30
  }
];

export const HIGHWAYS: HighwayToll[] = [
  {
    code: "O-5",
    name: "Gebze - İzmir Otoyolu (İstanbul-İzmir)",
    ratesPerKm: { 1: 1.65, 2: 2.64, 3: 3.15, 4: 4.15, 5: 5.25, 6: 1.15 },
    baseEntryFee: { 1: 10.0, 2: 15.0, 3: 20.0, 4: 25.0, 5: 30.0, 6: 5.0 },
    operator: "Özel",
    description: "Osmangazi Köprüsü'nü de içeren, İstanbul ile İzmir arasını 3.5 saate düşüren modern özel otoyol.",
    majorCities: ["Kocaeli", "Yalova", "Bursa", "Balıkesir", "Manisa", "İzmir"]
  },
  {
    code: "O-7",
    name: "Kuzey Marmara Otoyolu",
    ratesPerKm: { 1: 1.75, 2: 2.80, 3: 3.30, 4: 4.40, 5: 5.50, 6: 1.20 },
    baseEntryFee: { 1: 12.0, 2: 18.0, 3: 22.0, 4: 30.0, 5: 36.0, 6: 6.0 },
    operator: "Özel",
    description: "İstanbul'un kuzeyinden geçerek trafiği bypass eden, Yavuz Sultan Selim Köprüsü ile entegre otoyol sistemi.",
    majorCities: ["Tekirdağ", "İstanbul", "Kocaeli", "Sakarya"]
  },
  {
    code: "O-21",
    name: "Ankara - Niğde Otoyolu",
    ratesPerKm: { 1: 1.20, 2: 1.90, 3: 2.25, 4: 3.00, 5: 3.75, 6: 0.85 },
    baseEntryFee: { 1: 8.0, 2: 12.0, 3: 15.0, 4: 20.0, 5: 25.0, 6: 4.0 },
    operator: "Özel",
    description: "Ankara ile Niğde arasını bağlayan, Akdeniz Bölgesi'ne transit geçişi hızlandıran akıllı otoyol.",
    majorCities: ["Ankara", "Aksaray", "Kırşehir", "Nevşehir", "Niğde"]
  },
  {
    code: "O-6",
    name: "Malkara - Çanakkale Otoyolu",
    ratesPerKm: { 1: 1.50, 2: 2.40, 3: 2.85, 4: 3.80, 5: 4.75, 6: 1.05 },
    baseEntryFee: { 1: 10.0, 2: 15.0, 3: 18.0, 4: 24.0, 5: 30.0, 6: 5.0 },
    operator: "Özel",
    description: "1915 Çanakkale Köprüsü'nü de içine alan, Trakya ile Ege Bölgesi'ni birleştiren otoyol.",
    majorCities: ["Tekirdağ", "Çanakkale"]
  },
  {
    code: "O-4",
    name: "Anadolu Otoyolu (İstanbul - Ankara)",
    ratesPerKm: { 1: 0.25, 2: 0.35, 3: 0.45, 4: 0.65, 5: 0.85, 6: 0.12 },
    baseEntryFee: { 1: 5.0, 2: 7.0, 3: 9.0, 4: 12.0, 5: 15.0, 6: 2.0 },
    operator: "KGM",
    description: "Devlete ait en eski ve en yoğun otoyol. İstanbul ile Ankara'yı Bolu Dağı tüneli üzerinden bağlar.",
    majorCities: ["İstanbul", "Kocaeli", "Sakarya", "Düzce", "Bolu", "Ankara"]
  },
  {
    code: "O-31",
    name: "İzmir - Aydın Otoyolu",
    ratesPerKm: { 1: 0.22, 2: 0.30, 3: 0.40, 4: 0.60, 5: 0.80, 6: 0.10 },
    baseEntryFee: { 1: 3.0, 2: 4.0, 3: 5.0, 4: 7.0, 5: 9.0, 6: 1.5 },
    operator: "KGM",
    description: "İzmir ile Aydın illerini birbirine bağlayan, turistik geçişlerin yoğun olduğu devlet otoyolu.",
    majorCities: ["İzmir", "Aydın"]
  },
  {
    code: "O-32",
    name: "İzmir - Çeşme Otoyolu",
    ratesPerKm: { 1: 0.22, 2: 0.30, 3: 0.40, 4: 0.60, 5: 0.80, 6: 0.10 },
    baseEntryFee: { 1: 3.0, 2: 4.0, 3: 5.0, 4: 7.0, 5: 9.0, 6: 1.5 },
    operator: "KGM",
    description: "İzmir ile gözde tatil beldesi Çeşme'yi bağlayan, yaz aylarında çok yoğun olan devlet otoyolu.",
    majorCities: ["İzmir"]
  },
  {
    code: "O-3",
    name: "Avrupa Otoyolu (Edirne - İstanbul)",
    ratesPerKm: { 1: 0.25, 2: 0.35, 3: 0.45, 4: 0.65, 5: 0.85, 6: 0.12 },
    baseEntryFee: { 1: 5.0, 2: 7.0, 3: 9.0, 4: 12.0, 5: 15.0, 6: 2.0 },
    operator: "KGM",
    description: "Edirne sınır kapısını İstanbul'a bağlayan, KGM işletmesindeki otoyol.",
    majorCities: ["Edirne", "Kırklareli", "Tekirdağ", "İstanbul"]
  },
  {
    code: "O-51",
    name: "Adana - Mersin - Pozantı Otoyolu",
    ratesPerKm: { 1: 0.25, 2: 0.35, 3: 0.45, 4: 0.65, 5: 0.85, 6: 0.12 },
    baseEntryFee: { 1: 4.0, 2: 6.0, 3: 8.0, 4: 10.0, 5: 12.0, 6: 2.0 },
    operator: "KGM",
    description: "Mersin limanını İç Anadolu'ya ve Adana'ya bağlayan çok kritik lojistik otoyol.",
    majorCities: ["Mersin", "Adana"]
  },
  {
    code: "O-52",
    name: "Adana - Şanlıurfa Otoyolu",
    ratesPerKm: { 1: 0.25, 2: 0.35, 3: 0.45, 4: 0.65, 5: 0.85, 6: 0.12 },
    baseEntryFee: { 1: 4.0, 2: 6.0, 3: 8.0, 4: 10.0, 5: 12.0, 6: 2.0 },
    operator: "KGM",
    description: "Gaziantep üzerinden Şanlıurfa'ya kadar uzanan devlet otoyolu.",
    majorCities: ["Adana", "Osmaniye", "Gaziantep", "Şanlıurfa"]
  }
];

// Helper to calculate distance between two coordinates in kilometers (Haversine formula)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
