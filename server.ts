import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { 
  BRIDGES_AND_TUNNELS, 
  HIGHWAYS, 
  getDistanceKm, 
  VEHICLE_CLASSES 
} from "./src/tollData.js";

// Initialize Gemini SDK safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined.");
}

function generateLocalFallbackInsights(
  startName: string,
  endName: string,
  totalToll: number,
  crossedItems: string[],
  vehicleClassName: string
): string {
  const normalizedCrossed = (crossedItems || []).map(item => item.toLowerCase());

  const hasOsmangazi = normalizedCrossed.some(x => x.includes("osmangazi"));
  const hasAvrasya = normalizedCrossed.some(x => x.includes("avrasya"));
  const hasCanakkale = normalizedCrossed.some(x => x.includes("çanakkale") || x.includes("canakkale"));
  const hasYss = normalizedCrossed.some(x => x.includes("yavuz sultan") || x.includes("yss") || x.includes("3. köprü"));
  const hasFsmOr15T = normalizedCrossed.some(x => x.includes("15 temmuz") || x.includes("fsm") || x.includes("şehitler"));
  const hasGebzeIzmir = normalizedCrossed.some(x => x.includes("gebze - izmir") || x.includes("o-5"));
  const hasAnkaraNigde = normalizedCrossed.some(x => x.includes("ankara - niğde") || x.includes("o-21"));
  const hasAnadolu = normalizedCrossed.some(x => x.includes("anadolu") || x.includes("o-4"));

  let insights = `### 🚗 Rota Seyahat Değerlendirmesi (${startName} ➔ ${endName})

Bu seyahat planı **${vehicleClassName}** ile planlanmış olup, rota üzerinde belirlenen geçiş yollarının analizi aşağıda çıkarılmıştır.

`;

  // 1. Ödeme Yöntemleri
  insights += `#### 1. Ödeme Yöntemleri ve Önemli Kurallar 💳
* **HGS Geçiş Sistemi:** Rota üzerindeki tüm köprü, tünel ve otoyollar **HGS (Hızlı Geçiş Sistemi)** ile entegredir. HGS bakiyenizin yeterli olduğundan emin olun.
* **Özel ve Devlet Yolları Ayrımı:** KGM (Karayolları Genel Müdürlüğü) kontrolündeki yollarda sadece HGS geçerliyken; özel otoyollarda ve geçişlerde (Gebze-İzmir, Kuzey Marmara, Ankara-Niğde, Avrasya Tüneli vb.) gişelerde kredi kartı veya nakit ödeme imkanı da bulunmaktadır.
* **15 Günlük Kanuni Süre:** HGS bakiyenizin yetersiz olduğu durumlarda ceza almamak için **15 gün içerisinde** HGS hesabınıza yükleme yapmanız veya geçiş yapılan özel şirketin web sitesinden/e-devlet üzerinden ödeme yapmanız gerekir. Aksi takdirde 4 katına kadar idari para cezası uygulanabilmektedir.

`;

  // 2. Yolculuk Değerlendirmesi
  insights += `#### 2. Yolculuk Değerlendirmesi (Zaman & Yakıt Tasarrufu) ⏱️
`;
  if (totalToll === 0) {
    insights += `* Rota üzerinde herhangi bir ücretli geçiş tespit edilmedi. Tamamen devlet karayollarını (D-Yolları) kullanarak bütçe dostu bir yolculuk gerçekleştireceksiniz. Ancak dur-kalk trafiği ve hız sınırları nedeniyle seyahat sürenizin biraz daha uzun olabileceğini göz önünde bulundurun.\n`;
  } else {
    insights += `* Toplam geçiş maliyetiniz **${totalToll} TL** olarak hesaplanmıştır. Bu ücretli yolları tercih etmek size ciddi bir zaman ve sürüş konforu avantajı sağlayacaktır.\n`;
  }

  if (hasOsmangazi) {
    insights += `* **Osmangazi Köprüsü:** İzmit Körfezi'ni dolanmak (yaklaşık 100 km) yerine köprüyü kullanmak size ortalama **75-90 dakika** zaman kazandırır ve yakıt tüketiminizi büyük ölçüde azaltır.\n`;
  }
  if (hasAvrasya) {
    insights += `* **Avrasya Tüneli:** İstanbul içi geçişte boğaz köprülerindeki trafik yoğunluğuna takılmadan, deniz altından sadece **5 dakikada** yakayı değiştirebilirsiniz. Bu tünel özellikle yoğun saatlerde yakıt tasarrufu sağlar.\n`;
  }
  if (hasCanakkale) {
    insights += `* **1915 Çanakkale Köprüsü:** Çanakkale Boğazı'nda saatlerce sürebilen feribot bekleme kuyruklarını ve olumsuz hava şartlarından kaynaklanan iptalleri tamamen devre dışı bırakarak **6 dakikada** karşıya geçiş sağlar.\n`;
  }
  if (hasYss) {
    insights += `* **Yavuz Sultan Selim Köprüsü & Kuzey Marmara Otoyolu:** Şehir içi İstanbul trafiğine girmeden, yüksek hız limitli ve geniş şeritli transit yollardan hızlı ve stressiz bir sürüş yapmanızı sağlar.\n`;
  }
  if (hasGebzeIzmir && !hasOsmangazi) {
    insights += `* **Gebze-İzmir Otoyolu:** Çift şeritli eski yollara kıyasla yüksek asfalt kalitesi ve güvenli viraj yapıları ile İstanbul-İzmir arasını yaklaşık **3.5 saate** indirerek güvenli seyahat imkanı verir.\n`;
  }
  if (hasAnkaraNigde) {
    insights += `* **Ankara-Niğde Otoyolu:** Tamamen akıllı sensörler ve kameralarla donatılmış bu otoyol, İç Anadolu'dan Akdeniz'e güvenli, kayganlığı önleyen asfalt kalitesiyle çok konforlu bir yolculuk sunar.\n`;
  }
  if (hasAnadolu) {
    insights += `* **Anadolu Otoyolu (O-4):** İstanbul ve Ankara gibi iki büyük metropolü Bolu Dağı Tüneli güzergahıyla en optimize ve güvenli şekilde birbirine bağlayan, Türkiye'nin can damarı olan otoyoldur.\n`;
  }

  insights += `\n`;

  // 3. Alternatif Rota Önerisi
  insights += `#### 3. Alternatif Ücretsiz Rota Önerileri 📍
`;
  if (hasOsmangazi) {
    insights += `* **Körfez veya Feribot Alternatifi:** Osmangazi Köprüsü ücretinden kaçınmak için İzmit Körfezi'ni eski devlet yolu üzerinden (D-100) dolaşabilirsiniz (yaklaşık 1.5 saat fazladan sürer). Veya **Eskihisar - Topçular arabalı feribotunu** tercih ederek hem mola verebilir hem de daha uygun fiyata körfezi geçebilirsiniz.\n`;
  }
  if (hasAvrasya || hasFsmOr15T) {
    insights += `* **İstanbul Boğazı Alternatifi:** Avrasya Tüneli ve Yavuz Sultan Selim Köprüsü yerine devlet işletmesindeki **15 Temmuz Şehitler** veya **Fatih Sultan Mehmet Köprülerini** kullanarak çok daha ekonomik bir boğaz geçişi sağlayabilirsiniz. Ayrıca **Harem - Sirkeci feribotu** da trafikte dinlenmek için iyi bir alternatiftir.\n`;
  }
  if (hasCanakkale) {
    insights += `* **Gestaş Feribot Alternatifi:** Köprü yerine **Gelibolu-Lapseki** veya **Eceabat-Çanakkale** feribotlarını kullanabilirsiniz. Feribot geçişi yaklaşık 25-30 dakika sürer ancak yoğun yaz dönemlerinde uzun kuyruklara hazırlıklı olmalısınız.\n`;
  }
  if (hasGebzeIzmir || hasAnkaraNigde || hasAnadolu) {
    insights += `* **Devlet Karayolları (D-Yolları):** Otoyolların yanındaki ücretsiz devlet yolları (örneğin İstanbul-Ankara için D-100, Ankara-Niğde için D-750) tamamen ücretsizdir. Ancak bu yollarda daha düşük hız sınırları (90-110 km/s), çok sayıda kırmızı ışık ve radar denetimleri bulunduğunu unutmayın.\n`;
  }
  if (totalToll > 0 && !hasOsmangazi && !hasAvrasya && !hasCanakkale && !hasGebzeIzmir && !hasAnkaraNigde && !hasAnadolu) {
    insights += `* Ücret ödemek istemiyorsanız, rotanızdaki otoyol yerine tabelalarda mavi renk ile gösterilen devlet karayollarını (D-Yolları) takip edebilirsiniz. Ücretsiz yollar daha yavaştır ancak çevreyi görerek seyahat etme imkanı sunar.\n`;
  }

  insights += `\n`;

  // 4. İlginç Bilgi
  insights += `#### 4. Yolculuk Bilgi Köşesi (Mühendislik Harikaları) 💡
`;
  let infoWritten = false;
  if (hasOsmangazi) {
    insights += `* **Osmangazi Köprüsü:** Toplam uzunluğu 2.682 metre olan köprü, dünyanın en uzun açıklıklı asma köprüleri arasında yer alır. İnşaat sürecinde kuşların göç yollarını korumak amacıyla köprünün kavisli tasarlanması çevre hassasiyetinin güzel bir örneğidir.\n`;
    infoWritten = true;
  }
  if (hasCanakkale) {
    insights += `* **1915 Çanakkale Köprüsü:** Köprünün iki kule arasındaki 2.023 metrelik orta açıklığı, Türkiye Cumhuriyeti'nin 100. kuruluş yılı olan 2023'ü simgeler. 318 metrelik çelik kuleleri ise 18 Mart 1915 Çanakkale Deniz Zaferi'ni temsil eden sembolik anlamlarla yüklüdür.\n`;
    infoWritten = true;
  }
  if (hasAvrasya) {
    insights += `* **Avrasya Tüneli:** Deniz tabanının 106 metre altından geçen iki katlı tünel, yüksek deprem güvenliği önlemleri ile tasarlanmıştır ve en şiddetli sarsıntılara dahi dayanıklı bir mühendislik harikasıdır.\n`;
    infoWritten = true;
  }
  if (hasYss) {
    insights += `* **Yavuz Sultan Selim Köprüsü:** Üzerinde 8 şeritli karayolu ve 2 şeritli demiryolu barındıracak şekilde tasarlanmış, dünyanın en geniş ve asma köprü tipinde kule yüksekliği en fazla olan köprülerinden biridir.\n`;
    infoWritten = true;
  }
  if (hasAnkaraNigde && !infoWritten) {
    insights += `* **Ankara-Niğde Otoyolu:** Türkiye'nin en akıllı otoyolu olarak bilinir. Fiber optik ağlarla donatılmış sistem, yoldaki buzlanmayı, kazaları veya anlık trafik yoğunluklarını kontrol merkezine otomatik olarak iletir.\n`;
    infoWritten = true;
  }
  if (!infoWritten) {
    insights += `* **Türkiye Otoyol Sistemi:** Türkiye genelindeki HGS sistemi, araçların durmaksızın geçiş yapabilmesini sağlayarak emisyon salınımını azaltır ve yılda milyonlarca litre yakıt tasarrufu sağlar.\n`;
  }

  insights += `\n*Not: Bu rehber, seyahatinizden en yüksek verimi alabilmeniz amacıyla akıllı yerel algoritmamız tarafından hazırlanmıştır. Keyifli ve kazasız yolculuklar dileriz!*`;

  return insights;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Calculate Toll and Route
  app.post("/api/calculate-toll", async (req, res) => {
    try {
      const { start, end, vehicleClass } = req.body;
      const classId = parseInt(vehicleClass) || 1;

      if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
        return res.status(400).json({ error: "Başlangıç ve bitiş koordinatları zorunludur." });
      }

      const startLng = parseFloat(start.lng);
      const startLat = parseFloat(start.lat);
      const endLng = parseFloat(end.lng);
      const endLat = parseFloat(end.lat);

      // Try fetching route from OSRM
      let routeData: any = null;
      let usedFallback = false;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&steps=true&geometries=geojson`;

      try {
        const response = await fetch(osrmUrl);
        if (response.ok) {
          routeData = await response.json();
        } else {
          throw new Error("OSRM service response not OK");
        }
      } catch (err) {
        console.warn("OSRM routing failed, using fallback path logic:", err);
        usedFallback = true;
      }

      let routeGeometry: [number, number][] = [];
      let totalDistanceKm = 0;
      let totalDurationMinutes = 0;
      let crossedBridges: any[] = [];
      let crossedHighways: any[] = [];

      if (routeData && routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        totalDistanceKm = Math.round(route.distance / 1000);
        totalDurationMinutes = Math.round(route.duration / 60);
        
        // GeoJSON coordinates are [lng, lat], convert to [lat, lng] for Leaflet
        if (route.geometry && route.geometry.coordinates) {
          routeGeometry = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        }

        // 1. Check Bridges and Tunnels
        // We scan our route geometry. If any coordinate in our path is very close to a bridge/tunnel midpoint, we count it.
        for (const bridge of BRIDGES_AND_TUNNELS) {
          let isCrossed = false;
          // Find if any point in routeGeometry is within 2.0 km of bridge midpoint
          for (let i = 0; i < routeGeometry.length; i += Math.max(1, Math.floor(routeGeometry.length / 300))) {
            const dist = getDistanceKm(routeGeometry[i][0], routeGeometry[i][1], bridge.midpoint[0], bridge.midpoint[1]);
            if (dist < 2.0) {
              isCrossed = true;
              break;
            }
          }

          if (isCrossed) {
            const toll = bridge.rates[classId] || 0;
            crossedBridges.push({
              id: bridge.id,
              name: bridge.name,
              toll: toll,
              operator: bridge.operator,
              description: bridge.description,
              timeSavedMinutes: bridge.timeSavedMinutes
            });
          }
        }

        // 2. Check Highways via OSRM Step Names
        // OSRM steps give us road names. We search for codes like O-5, O-4, etc.
        const highwayDistances: { [code: string]: number } = {};
        
        if (route.legs) {
          route.legs.forEach((leg: any) => {
            if (leg.steps) {
              leg.steps.forEach((step: any) => {
                const name = (step.name || "").toUpperCase();
                const ref = (step.ref || "").toUpperCase();
                
                // Search for highway code in name or ref (e.g. "O-5", "O 5", "O5")
                HIGHWAYS.forEach(hw => {
                  const pattern1 = hw.code; // "O-5"
                  const pattern2 = hw.code.replace("-", " "); // "O 5"
                  const pattern3 = hw.code.replace("-", ""); // "O5"
                  
                  if (
                    name.includes(pattern1) || name.includes(pattern2) || name.includes(pattern3) ||
                    ref.includes(pattern1) || ref.includes(pattern2) || ref.includes(pattern3) ||
                    name.includes(hw.name.toUpperCase())
                  ) {
                    const stepDistKm = step.distance / 1000;
                    highwayDistances[hw.code] = (highwayDistances[hw.code] || 0) + stepDistKm;
                  }
                });
              });
            }
          });
        }

        // If OSRM is sparse, let's also do a spatial check on highways: if route passes near key highway cities
        HIGHWAYS.forEach(hw => {
          let distance = highwayDistances[hw.code] || 0;
          
          // If the route distance is long and start/end match major cities of the highway, but step names didn't register, 
          // we do an intelligent approximation based on proximity
          if (distance === 0) {
            let startClose = false;
            let endClose = false;
            
            // Check if route passes near highway hubs
            // E.g. O-5 (İstanbul-İzmir) hubs: Bursa, Balıkesir
            if (hw.code === "O-5") {
              const bursa = [40.1885, 29.0610];
              const balikesir = [39.6484, 27.8826];
              
              let nearBursa = false;
              let nearBalikesir = false;
              
              for (let i = 0; i < routeGeometry.length; i += Math.max(1, Math.floor(routeGeometry.length / 50))) {
                if (getDistanceKm(routeGeometry[i][0], routeGeometry[i][1], bursa[0], bursa[1]) < 15) nearBursa = true;
                if (getDistanceKm(routeGeometry[i][0], routeGeometry[i][1], balikesir[0], balikesir[1]) < 15) nearBalikesir = true;
              }
              
              if (nearBursa && nearBalikesir) {
                // Approximate distance traveled on O-5 is around 320 km
                distance = 320;
              } else if (nearBursa || nearBalikesir) {
                distance = 150;
              }
            } else if (hw.code === "O-4") {
              // O-4 (İstanbul-Ankara) hubs: Bolu, Düzce
              const bolu = [40.7350, 31.6078];
              let nearBolu = false;
              for (let i = 0; i < routeGeometry.length; i += Math.max(1, Math.floor(routeGeometry.length / 50))) {
                if (getDistanceKm(routeGeometry[i][0], routeGeometry[i][1], bolu[0], bolu[1]) < 15) nearBolu = true;
              }
              if (nearBolu) {
                distance = 250; // approximate
              }
            }
          }

          if (distance > 5) { // Only count if we traveled more than 5 km
            const baseFee = hw.baseEntryFee[classId] || 0;
            const perKmRate = hw.ratesPerKm[classId] || 0;
            const toll = baseFee + (distance * perKmRate);
            
            crossedHighways.push({
              code: hw.code,
              name: hw.name,
              distanceKm: Math.round(distance),
              toll: Math.round(toll * 100) / 100,
              operator: hw.operator,
              description: hw.description
            });
          }
        });

      } else {
        // Fallback calculation (when OSRM is down or coordinate distance is small)
        usedFallback = true;
        const directDist = getDistanceKm(startLat, startLng, endLat, endLng);
        totalDistanceKm = Math.round(directDist * 1.25); // estimate road distance
        totalDurationMinutes = Math.round(totalDistanceKm * 0.8); // estimate duration at 75 km/h avg

        // Simple straight-ish line for Leaflet
        const stepsCount = 50;
        for (let i = 0; i <= stepsCount; i++) {
          const t = i / stepsCount;
          // Add a tiny curve so it doesn't look like a absolute straight line
          const currentLat = startLat + (endLat - startLat) * t + Math.sin(t * Math.PI) * 0.15;
          const currentLng = startLng + (endLng - startLng) * t + Math.cos(t * Math.PI) * 0.1;
          routeGeometry.push([currentLat, currentLng]);
        }

        // Intelligently guess which highway/bridge is crossed based on cities
        const startNameLower = (start.name || "").toLowerCase();
        const endNameLower = (end.name || "").toLowerCase();

        // 1. İstanbul - İzmir Route
        if (
          (startNameLower.includes("istanbul") && endNameLower.includes("izmir")) ||
          (startNameLower.includes("izmir") && endNameLower.includes("istanbul"))
        ) {
          // Osmangazi Bridge crossed
          const osmangazi = BRIDGES_AND_TUNNELS.find(b => b.id === "osmangazi")!;
          crossedBridges.push({
            id: osmangazi.id,
            name: osmangazi.name,
            toll: osmangazi.rates[classId] || 0,
            operator: osmangazi.operator,
            description: osmangazi.description,
            timeSavedMinutes: osmangazi.timeSavedMinutes
          });

          // O-5 crossed
          const o5 = HIGHWAYS.find(h => h.code === "O-5")!;
          const o5Dist = 380;
          crossedHighways.push({
            code: o5.code,
            name: o5.name,
            distanceKm: o5Dist,
            toll: Math.round((o5.baseEntryFee[classId] + o5Dist * o5.ratesPerKm[classId]) * 100) / 100,
            operator: o5.operator,
            description: o5.description
          });
        }
        // 2. İstanbul - Ankara Route
        else if (
          (startNameLower.includes("istanbul") && endNameLower.includes("ankara")) ||
          (startNameLower.includes("ankara") && endNameLower.includes("istanbul"))
        ) {
          const o4 = HIGHWAYS.find(h => h.code === "O-4")!;
          const o4Dist = 310;
          crossedHighways.push({
            code: o4.code,
            name: o4.name,
            distanceKm: o4Dist,
            toll: Math.round((o4.baseEntryFee[classId] + o4Dist * o4.ratesPerKm[classId]) * 100) / 100,
            operator: o4.operator,
            description: o4.description
          });

          // Standard Fatih Sultan Mehmet / 15 Temmuz Bridge
          const fsm = BRIDGES_AND_TUNNELS.find(b => b.id === "fsm_15temmuz")!;
          crossedBridges.push({
            id: fsm.id,
            name: fsm.name,
            toll: fsm.rates[classId] || 0,
            operator: fsm.operator,
            description: fsm.description,
            timeSavedMinutes: fsm.timeSavedMinutes
          });
        }
        // 3. Ankara - Niğde / Pozantı
        else if (
          (startNameLower.includes("ankara") && (endNameLower.includes("nigde") || endNameLower.includes("adana") || endNameLower.includes("mersin"))) ||
          ((startNameLower.includes("nigde") || startNameLower.includes("adana") || startNameLower.includes("mersin")) && endNameLower.includes("ankara"))
        ) {
          const o21 = HIGHWAYS.find(h => h.code === "O-21")!;
          const o21Dist = 275;
          crossedHighways.push({
            code: o21.code,
            name: o21.name,
            distanceKm: o21Dist,
            toll: Math.round((o21.baseEntryFee[classId] + o21Dist * o21.ratesPerKm[classId]) * 100) / 100,
            operator: o21.operator,
            description: o21.description
          });
        }
        // 4. İzmir - Aydın
        else if (
          (startNameLower.includes("izmir") && endNameLower.includes("aydin")) ||
          (startNameLower.includes("aydin") && endNameLower.includes("izmir"))
        ) {
          const o31 = HIGHWAYS.find(h => h.code === "O-31")!;
          const o31Dist = 110;
          crossedHighways.push({
            code: o31.code,
            name: o31.name,
            distanceKm: o31Dist,
            toll: Math.round((o31.baseEntryFee[classId] + o31Dist * o31.ratesPerKm[classId]) * 100) / 100,
            operator: o31.operator,
            description: o31.description
          });
        }
        // 5. İzmir - Çeşme
        else if (
          (startNameLower.includes("izmir") && endNameLower.includes("cesme")) ||
          (startNameLower.includes("cesme") && endNameLower.includes("izmir"))
        ) {
          const o32 = HIGHWAYS.find(h => h.code === "O-32")!;
          const o32Dist = 80;
          crossedHighways.push({
            code: o32.code,
            name: o32.name,
            distanceKm: o32Dist,
            toll: Math.round((o32.baseEntryFee[classId] + o32Dist * o32.ratesPerKm[classId]) * 100) / 100,
            operator: o32.operator,
            description: o32.description
          });
        }
      }

      // Calculate total toll cost
      const bridgeTollsSum = crossedBridges.reduce((sum, b) => sum + b.toll, 0);
      const highwayTollsSum = crossedHighways.reduce((sum, h) => sum + h.toll, 0);
      const totalToll = Math.round((bridgeTollsSum + highwayTollsSum) * 100) / 100;

      // Extract details of vehicle class
      const vehicleClassInfo = VEHICLE_CLASSES.find(v => v.id === classId) || VEHICLE_CLASSES[0];

      res.json({
        success: true,
        routeGeometry,
        totalDistanceKm,
        totalDurationMinutes,
        crossedBridges,
        crossedHighways,
        totalToll,
        vehicleClassInfo,
        usedFallback
      });

    } catch (error: any) {
      console.error("Calculate Toll API error:", error);
      res.status(500).json({ error: "Hesaplama sırasında bir sunucu hatası oluştu: " + error.message });
    }
  });

  // API Route: AI Insights & Road Trip Recommendations
  app.post("/api/route-insights", async (req, res) => {
    try {
      const { startName, endName, totalToll, crossedItems, vehicleClassName } = req.body;

      if (!ai) {
        const localFallback = generateLocalFallbackInsights(
          startName || "Başlangıç",
          endName || "Bitiş",
          totalToll || 0,
          crossedItems || [],
          vehicleClassName || "1. Sınıf Araç"
        );
        return res.json({
          success: true,
          insights: localFallback,
          isFallback: true
        });
      }

      const prompt = `Türkiye'de bir yolculuk planlanıyor.
Başlangıç Noktası: ${startName}
Bitiş Noktası: ${endName}
Araç Sınıfı: ${vehicleClassName}
Geçilen Ücretli Yollar / Köprüler: ${crossedItems && crossedItems.length > 0 ? crossedItems.join(", ") : "Hiçbir ücretli yol tespit edilmedi (Devlet yolları kullanılabilir)"}
Toplam Ödenecek Geçiş Ücreti: ${totalToll} TL

Lütfen bu rota hakkında sürücüye Türkçe olarak çok faydalı, samimi, profesyonel ve akıllı seyahat ipuçları sun. Yanıtında şunlar yer alsın:
1. Ödeme Yöntemleri: Geçişlerin nasıl yapıldığı (HGS/OGS, kredi kartı, nakit geçerliliği) ve kaçak geçiş durumunda 15 günlük cezasız ödeme süresi uyarısı.
2. Yolculuk Değerlendirmesi: Bu ücretli yolları kullanmanın sürücüye kazandıracağı tahmini süre ve yakıt tasarrufu analizi (örneğin Osmangazi Köprüsü veya Kuzey Marmara Otoyolu geçildiyse ne kadar süre kazandırır).
3. Alternatif Rota Önerisi: Ücret ödemek istemeyenler için alternatif ücretsiz yollar (örneğin feribot seçeneği veya eski D-100 karayolu) ve bunun yolculuk süresine etkisi.
4. İlginç Bilgi: Rotadaki köprü veya tünellerden biri hakkında kısa ve eğlenceli/ilginç tarihi veya mühendislik bilgisi (örn. Osmangazi Köprüsü'nün uzunluğu, Avrasya Tüneli'nin derinliği veya Çanakkale Köprüsü'nün sembolik 1915 Çanakkale zaferi anlamları).

Lütfen yanıtı markdown formatında ver. Başlıklar ve vurgular temiz ve okunabilir olsun.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Sen Türkiye otoyol sistemleri, Karayolları Genel Müdürlüğü (KGM) kuralları, HGS ödemeleri ve rota optimizasyonu konusunda uzman, sürücülere yardımcı olan güler yüzlü bir yapay zeka asistanısın.",
            temperature: 0.7,
          }
        });

        res.json({
          success: true,
          insights: response.text
        });
      } catch (geminiError: any) {
        console.warn("Gemini model call failed (possibly 503 or limit). Using robust local fallback insights:", geminiError);
        const localFallback = generateLocalFallbackInsights(
          startName || "Başlangıç",
          endName || "Bitiş",
          totalToll || 0,
          crossedItems || [],
          vehicleClassName || "1. Sınıf Araç"
        );
        res.json({
          success: true,
          insights: localFallback,
          isFallback: true
        });
      }

    } catch (error: any) {
      console.error("AI Insights API error:", error);
      try {
        const { startName, endName, totalToll, crossedItems, vehicleClassName } = req.body;
        const localFallback = generateLocalFallbackInsights(
          startName || "Başlangıç",
          endName || "Bitiş",
          totalToll || 0,
          crossedItems || [],
          vehicleClassName || "1. Sınıf Araç"
        );
        res.json({
          success: true,
          insights: localFallback,
          isFallback: true
        });
      } catch (fallbackError) {
        res.status(500).json({ error: "Yapay zeka asistanı yanıtı oluşturamadı: " + error.message });
      }
    }
  });

  // Serve static assets in production or mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
