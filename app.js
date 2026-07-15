const tm = [
    { id: 1, name: "1. Sınıf Araç", description: "Otomobiller", example: "Binek otomobil, sedan, hatchback, küçük SUV (Aks aralığı 3.20m altı)" },
    { id: 2, name: "2. Sınıf Araç", description: "Hafif Ticari Araçlar", example: "Minibüs, panelvan, kamyonet, büyük SUV, pikap (Aks aralığı 3.20m ve üzeri)" },
    { id: 3, name: "3. Sınıf Araç", description: "Otobüsler & 3 Akslılar", example: "3 akslı her türlü yolcu otobüsü veya ağır vasıta" },
    { id: 4, name: "4. Sınıf Araç", description: "Kamyonlar (4-5 Akslı)", example: "4 veya 5 akslı tırlar, büyük kamyonlar ve inşaat araçları" },
    { id: 5, name: "5. Sınıf Araç", description: "Tırlar (6+ Akslı)", example: "6 veya daha fazla akslı dev tırlar, römorklu büyük çekiciler" },
    { id: 6, name: "6. Sınıf Araç", description: "Motosikletler", example: "Tüm 2 veya 3 tekerlekli motosikletler (HGS aboneliği ile)" }
];

const Zc = [
    { id: "osmangazi", name: "Osmangazi Köprüsü", midpoint: [40.7381, 29.5168], rates: { 1: 1170, 2: 1870, 3: 2215, 4: 2940, 5: 3715, 6: 820 }, operator: "Özel", company: "Otoyol Yatırım A.Ş. (Nurol-Özaltın-Makyol-Astaldi-Göçay)", duration: "Temmuz 2035'e kadar (22 Yıl 4 Ay)", guarantee: "Günlük 40.000 Araç (35 USD + KDV)", cost: "~1.2 Milyar $ (Proje bütünü ~6.5 Milyar $)", details: "Dilovası ile Altınova arasını bağlayarak İzmit Körfezi geçiş süresini 6 dakikaya düşüren asma köprüdür. Sektörün en büyük yap-işlet-devret yatırımlarındandır." },
    { id: "yavuz_sultan_selim", name: "Yavuz Sultan Selim Köprüsü", midpoint: [41.2064, 29.1197], rates: { 1: 110, 2: 145, 3: 250, 4: 640, 5: 795, 6: 78 }, operator: "Özel", company: "ICA (İçtaş - Astaldi Konsorsiyumu)", duration: "Mayıs 2027'ye kadar (İşletme Devir)", guarantee: "Günlük 135.000 Araç (4 USD + KDV)", cost: "~3.0 Milyar $", details: "İstanbul Boğazı'nın kuzeyinde yer alan, ağır vasıta transit geçişleri için zorunlu olan, üzerinden demiryolu hattı da geçecek şekilde tasarlanan asma köprüdür." },
    { id: "canakkale_1915", name: "1915 Çanakkale Köprüsü", midpoint: [40.3278, 26.6389], rates: { 1: 820, 2: 1230, 3: 1845, 4: 2050, 5: 3835, 6: 205 }, operator: "Özel", company: "ÇOK Otoyol A.Ş. (Limak-Yapı Merkezi-DL E&C-SK Ecoplant)", duration: "Mayıs 2034'e kadar (16 Yıl 2 Ay)", guarantee: "Günlük 45.000 Araç (15 Euro + KDV)", cost: "~2.5 Milyar Euro", details: "Gelibolu ile Lapseki'yi bağlayan, Cumhuriyet'in 100. yılına ithafen 2023 metrelik orta açıklığıyla dünyanın en uzun orta açıklıklı asma köprüsü unvanına sahiptir." },
    { id: "arrasya_tuneli", name: "Avrasya Tüneli", midpoint: [41.0022, 29.0091], rates: { 1: 156, 2: 234, 3: 0, 4: 0, 5: 0, 6: 60.8 }, operator: "Özel", company: "ATAŞ A.Ş. (Yapı Merkezi ve SK Ecoplant Ortaklığı)", duration: "Şubat 2041'e kadar (24 Yıl 5 Ay)", guarantee: "Yıllık 25.125.000 Araç geçiş garantisi", cost: "~1.25 Milyar $", details: "Tarihi Yarımada ile Kadıköy arasını deniz tabanının altından bağlayan, 5.4 km'lik çift katlı karayolu tünelidir. Deprem korumalı sismik contalara sahiptir." },
    { id: "fsm_15temmuz", name: "15 Temmuz Şehitler & FSM Köprüleri", midpoint: [41.0458, 29.0345], rates: { 1: 33, 2: 42, 3: 81, 4: 162, 5: 254, 6: 13 }, operator: "KGM", company: "KGM (Karayolları Genel Müdürlüğü)", duration: "Süresiz kamu mülkiyetindedir", guarantee: "Herhangi bir geçiş garantisi veya taahhüt yoktur", cost: "Kamu öz kaynakları ile inşa edilmiştir", details: "FSM (1988) ve 15 Temmuz Şehitler (1973) köprüleri devlete ait olup, sadece Asya'dan Avrupa yönüne geçişte ücret alınır. Avrupa-Asya yönü ücretsizdir." }
];

const em = [
    { code: "O-5", name: "Gebze - İzmir Otoyolu (İstanbul-İzmir)", ratesPerKm: { 1: 1.65, 2: 2.64, 3: 3.15, 4: 4.15, 5: 5.25, 6: 1.15 }, baseEntryFee: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 5 }, operator: "Özel", company: "Otoyol Yatırım A.Ş. (Nurol-Özaltın-Makyol-Astaldi-Göçay)", duration: "Temmuz 2035'e kadar", guarantee: "Etap bazında otoyol kesimi araç taahhütleri", cost: "~6.5 Milyar $ (Köprü dahil)", details: "Seyahat süresini 8 saatten 3.5 saate indiren, Osmangazi Köprüsü'nü de içine alan Türkiye'nin en uzun yap-işlet-devret otoyol ve dev altyapı projesidir." },
    { code: "O-7", name: "Kuzey Marmara Otoyolu", ratesPerKm: { 1: 1.75, 2: 2.8, 3: 3.3, 4: 4.4, 5: 5.5, 6: 1.2 }, baseEntryFee: { 1: 12, 2: 18, 3: 22, 4: 30, 5: 36, 6: 6 }, operator: "Özel", company: "Kuzey Marmara Otoyolu Yatırım ve İşletme A.Ş. / ICA", duration: "2027 ile 2030 arası (Kesimlere göre değişen devir)", guarantee: "Kesim bazlı günlük araç garantisi mevcuttur", cost: "~4.5 Milyar $", details: "Kınalı ile Akyazı arasını bağlayarak İstanbul'un transit yük ve çevre yollarını rahatlatan, 4 şeritli tünellere sahip gelişmiş alternatif otoyol hattıdır." },
    { code: "O-21", name: "Ankara - Niğde Otoyolu", ratesPerKm: { 1: 1.2, 2: 1.9, 3: 2.25, 4: 3, 5: 3.75, 6: .85 }, baseEntryFee: { 1: 8, 2: 12, 3: 15, 4: 20, 5: 25, 6: 4 }, operator: "Özel", company: "ERG Otoyol Yatırım ve İşletme A.Ş.", duration: "2032 yılı sonuna kadar (YİD modeli)", guarantee: "Günlük 15.000 - 20.000 Araç (Kesimlere göre dinamik)", cost: "~1.5 Milyar Euro", details: "Ankara ve Niğde arasını güvenli şekilde bağlayan, Türkiye'nin ilk akıllı otoyoludur. Olay algılama kameraları ve akıllı meteorolojik sensörler barındırır." },
    { code: "O-6", name: "Malkara - Çanakkale Otoyolu", ratesPerKm: { 1: 1.5, 2: 2.4, 3: 2.85, 4: 3.8, 5: 4.75, 6: 1.05 }, baseEntryFee: { 1: 10, 2: 15, 3: 18, 4: 24, 5: 30, 6: 5 }, operator: "Özel", company: "ÇOK Otoyol A.Ş.", duration: "Mayıs 2034'e kadar", guarantee: "Günlük 45.000 Araç (Geçiş garantili protokole dahil)", cost: "~2.5 Milyar Euro (Köprü dahil)", details: "Trakya ve Kınalı-Tekirdağ aksını Çanakkale üzerinden Ege limanlarına ve İzmir'e bağlayan, 1915 Çanakkale köprüsünün bağlantı otobanıdır." },
    { code: "O-4", name: "Anadolu Otoyolu (İstanbul - Ankara)", ratesPerKm: { 1: .25, 2: .35, 3: .45, 4: .65, 5: .85, 6: .12 }, baseEntryFee: { 1: 5, 2: 7, 3: 9, 4: 12, 5: 15, 6: 2 }, operator: "KGM", company: "KGM (Kamu Otoyolu)", duration: "Süresiz kamu kontrolü", guarantee: "Geçiş garantisi yoktur", cost: "Devlet bütçesiyle yapılmıştır", details: "İstanbul Çamlıca ile Ankara Akıncı gişeleri arasını bağlayan, Bolu Dağı tünelini kapsayan ve en yoğun kullanılan devlet otoyol ağıdır." },
    { code: "O-31", name: "İzmir - Aydın Otoyolu", ratesPerKm: { 1: .22, 2: .3, 3: .4, 4: .6, 5: .8, 6: .1 }, baseEntryFee: { 1: 3, 2: 4, 3: 5, 4: 7, 5: 9, 6: 1.5 }, operator: "KGM", company: "KGM (Kamu Otoyolu)", duration: "Süresiz", guarantee: "Yok", cost: "Kamu bütçesi", details: "Ege bölgesinin en işlek kamu otoyollarından biridir. Bünyesinde Türkiye'nin en uzun otoyol tünellerinden Selatin Tüneli'ni barındırır." },
    { code: "O-32", name: "İzmir - Çeşme Otoyolu", ratesPerKm: { 1: .22, 2: .3, 3: .4, 4: .6, 5: .8, 6: .1 }, baseEntryFee: { 1: 3, 2: 4, 3: 5, 4: 7, 5: 9, 6: 1.5 }, operator: "KGM", company: "KGM (Kamu Otoyolu)", duration: "Süresiz", guarantee: "Yok", cost: "Kamu bütçesi", details: "İzmir metropolü ile Çeşme yarımadasını birbirine bağlayan otoyol, özellikle yaz aylarında turistik amaçlı seyahatler için yoğun şekilde kullanılır." },
    { code: "O-3", name: "Avrupa Otoyolu (Edirne - İstanbul)", ratesPerKm: { 1: .25, 2: .35, 3: .45, 4: .65, 5: .85, 6: .12 }, baseEntryFee: { 1: 5, 2: 7, 3: 9, 4: 12, 5: 15, 6: 2 }, operator: "KGM", company: "KGM (Kamu)", duration: "Süresiz", guarantee: "Yok", cost: "Kamu", details: "Edirne Kapıkule Sınır Kapısı ile İstanbul'u birleştiren lojistik açıdan Türkiye'nin en kritik KGM otoyollarından biridir." },
    { code: "O-51", name: "Adana - Mersin - Pozantı Otoyolu", ratesPerKm: { 1: .25, 2: .35, 3: .45, 4: .65, 5: .85, 6: .12 }, baseEntryFee: { 1: 4, 2: 6, 3: 8, 4: 10, 5: 12, 6: 2 }, operator: "KGM", company: "KGM (Kamu)", duration: "Süresiz", guarantee: "Yok", cost: "Kamu", details: "Gülek Geçidi'nden geçerek İç Anadolu'yu Çukurova sanayi bölgesine ve Mersin Limanı'na bağlayan dağlık ve lojistik önemi yüksek kamu otoyoludur." },
    { code: "O-52", name: "Adana - Şanlıurfa Otoyolu", ratesPerKm: { 1: .25, 2: .35, 3: .45, 4: .65, 5: .85, 6: .12 }, baseEntryFee: { 1: 4, 2: 6, 3: 8, 4: 10, 5: 12, 6: 2 }, operator: "KGM", company: "KGM (Kamu)", duration: "Süresiz", guarantee: "Yok", cost: "Kamu", details: "Adana'dan Osmaniye ve Gaziantep üzerinden Şanlıurfa'ya uzanan, Doğu Akdeniz ile Güneydoğu Anadolu sanayisini birbirine bağlayan KGM otobanıdır." }
];

const hl = [
    { name: "İstanbul ➔ İzmir (Osmangazi)", start: { name: "İstanbul", lat: 41.0082, lng: 28.9784 }, end: { name: "İzmir", lat: 38.4192, lng: 27.1287 } },
    { name: "İstanbul ➔ Ankara (Anadolu)", start: { name: "İstanbul", lat: 41.0082, lng: 28.9784 }, end: { name: "Ankara", lat: 39.9334, lng: 32.8597 } },
    { name: "Ankara ➔ Niğde (O-21)", start: { name: "Ankara", lat: 39.9334, lng: 32.8597 }, end: { name: "Niğde", lat: 37.9698, lng: 34.6766 } },
    { name: "İzmir ➔ Çeşme", start: { name: "İzmir", lat: 38.4192, lng: 27.1287 }, end: { name: "Çeşme", lat: 38.3246, lng: 26.3031 } }
];

const S_ = ["Fiat", "Renault", "Volkswagen", "Toyota", "Ford", "Hyundai", "Peugeot", "Opel", "Honda", "BMW", "Mercedes-Benz", "TOGG", "Tesla", "Chery", "Diger"];

const Fi = [
    { id: "1.0_1.2_benzin", label: "1.0 - 1.2 L Benzinli", baseConsumption: 5.6, defaultFuelPrice: 45.20 },
    { id: "1.4_1.6_benzin", label: "1.4 - 1.6 L Benzinli", baseConsumption: 6.8, defaultFuelPrice: 45.20 },
    { id: "1.3_1.6_dizel", label: "1.3 - 1.6 L Dizel", baseConsumption: 4.9, defaultFuelPrice: 44.80 },
    { id: "1.8_2.0_hybrid", label: "1.8 - 2.0 L Hibrit", baseConsumption: 4.2, defaultFuelPrice: 45.20 },
    { id: "electric", label: "Tam Elektrikli (EV)", baseConsumption: 17.5, defaultFuelPrice: 8.50, isElectric: true },
    { id: "large_motor", label: "2.0+ Litre Büyük Motor", baseConsumption: 9.8, defaultFuelPrice: 45.20 }
];

let selectedStart = null;
let selectedEnd = null;
let selectedClassId = 1;
let startMarker = null;
let endMarker = null;
let activeProjectCode = "O-5";
let allRoutesCalculated = [];
let activeRouteIndex = 0;
let routePolylinesList = [];
let map;

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initMap();
    populateVehicleClasses();
    populatePopularRoutes();
    populateBrands();
    populateFuelPresets();
    populateProjectGrid();
    loadProjectDetails("O-5");
    switchHolidayTab("days");
    setupEventListeners();
});

function initMap() {
    map = L.map('map', {
        zoomControl: true,
        minZoom: 5,
        maxZoom: 18
    }).setView([39.2, 33.0], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);
}

function populateVehicleClasses() {
    const container = document.getElementById("vehicle-classes-grid");
    container.innerHTML = "";
    tm.forEach(c => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = `class-${c.id}`;
        btn.className = `p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${c.id === selectedClassId ? "border-orange-500 bg-orange-500/10 text-orange-400 font-bold" : "border-white/5 bg-[#18181b] text-zinc-400"
            }`;
        btn.onclick = () => selectVehicleClass(c.id);
        btn.innerHTML = `<span class="text-xs font-bold font-sans">${c.id}. Sınıf</span><span class="text-[9px] text-zinc-500 block truncate mt-1">${c.description}</span>`;
        container.appendChild(btn);
    });
    updateVehicleDescription();
}

function selectVehicleClass(id) {
    selectedClassId = id;
    tm.forEach(c => {
        const el = document.getElementById(`class-${c.id}`);
        if (el) el.className = c.id === id ? "p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all border-orange-500 bg-orange-500/10 text-orange-400 font-bold" : "p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all border-white/5 bg-[#18181b] text-zinc-400";
    });
    updateVehicleDescription();
    loadProjectDetails(activeProjectCode);
    if (allRoutesCalculated.length > 0) recalculateExistingRoutes();
}

function updateVehicleDescription() {
    const current = tm.find(v => v.id === selectedClassId);
    const descEl = document.getElementById("vehicle-description-box");
    if (current && descEl) descEl.textContent = `${current.name}: ${current.example}`;
}

function populatePopularRoutes() {
    const container = document.getElementById("preset-routes-container");
    container.innerHTML = "";
    hl.forEach(route => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "px-2.5 py-1 text-[10px] bg-zinc-800/80 hover:bg-orange-500/10 hover:text-orange-400 border border-white/5 rounded-full transition cursor-pointer";
        btn.textContent = route.name;
        btn.onclick = () => selectPopularRoute(route);
        container.appendChild(btn);
    });
}

function selectPopularRoute(route) {
    selectedStart = { lat: route.start.lat, lng: route.start.lng, name: route.start.name };
    selectedEnd = { lat: route.end.lat, lng: route.end.lng, name: route.end.name };
    document.getElementById("start-query").value = route.start.name;
    document.getElementById("end-query").value = route.end.name;
    document.getElementById("clear-start").classList.remove("hidden");
    document.getElementById("clear-end").classList.remove("hidden");
    triggerRouteLoad();
}

function populateBrands() {
    const select = document.getElementById("brand-select");
    select.innerHTML = "";
    S_.forEach(brand => {
        const opt = document.createElement("option");
        opt.value = brand.toLowerCase();
        opt.textContent = brand;
        if (brand === "Fiat") opt.selected = true;
        select.appendChild(opt);
    });
}

function populateFuelPresets() {
    const select = document.getElementById("fuel-preset-select");
    select.innerHTML = "";
    Fi.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id;
        opt.textContent = f.label;
        if (f.id === "1.4_1.6_benzin") opt.selected = true;
        select.appendChild(opt);
    });
    updateFuelSliders("1.4_1.6_benzin");
}

function updateFuelSliders(presetId) {
    const preset = Fi.find(f => f.id === presetId);
    if (!preset) return;
    const consumptionVal = document.getElementById("consumption-val");
    const consumptionSlider = document.getElementById("consumption-slider");
    const priceVal = document.getElementById("price-val");
    const priceSlider = document.getElementById("price-slider");

    consumptionSlider.value = preset.baseConsumption;
    consumptionVal.innerText = `${preset.baseConsumption} ${preset.isElectric ? "kWh" : "L"}/100km`;
    priceSlider.value = preset.defaultFuelPrice;
    priceVal.innerText = `${preset.defaultFuelPrice.toFixed(2)} TL/${preset.isElectric ? "kWh" : "Litre"}`;
}

function populateProjectGrid() {
    const container = document.getElementById("project-selector-grid");
    container.innerHTML = "";
    Zc.forEach(br => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `p-2 text-[10px] text-zinc-300 rounded-lg border text-left cursor-pointer truncate ${br.id === activeProjectCode ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/5 bg-[#18181b]"}`;
        btn.textContent = br.name;
        btn.onclick = () => selectProj(br.id);
        container.appendChild(btn);
    });
    em.forEach(hwy => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `p-2 text-[10px] text-zinc-300 rounded-lg border text-left cursor-pointer truncate ${hwy.code === activeProjectCode ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/5 bg-[#18181b]"}`;
        btn.textContent = `${hwy.code} Otoyolu`;
        btn.onclick = () => selectProj(hwy.code);
        container.appendChild(btn);
    });
}

function selectProj(code) {
    activeProjectCode = code;
    populateProjectGrid();
    loadProjectDetails(code);
}

function loadProjectDetails(code) {
    const br = Zc.find(x => x.id === code);
    const hwy = em.find(x => x.code === code);

    const typeEl = document.getElementById("proj-type");
    const operatorEl = document.getElementById("proj-operator");
    const nameEl = document.getElementById("proj-name");
    const rateEl = document.getElementById("proj-rate-lbl");
    const companyEl = document.getElementById("proj-concession-company");
    const durationEl = document.getElementById("proj-duration");
    const guaranteeEl = document.getElementById("proj-guarantee");
    const constructionEl = document.getElementById("proj-construction");
    const detailsEl = document.getElementById("proj-details");

    const item = br || hwy;
    if (!item) return;

    typeEl.textContent = br ? "KÖPRÜ / TÜNEL" : "OTOYOL KESİMİ";
    operatorEl.textContent = item.operator;
    operatorEl.className = `text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${item.operator === "Özel" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`;
    nameEl.textContent = item.name;

    if (br) {
        const rate = br.rates[selectedClassId] || 0;
        rateEl.textContent = rate > 0 ? `${rate} TL` : "Yasaktır";
    } else {
        const base = hwy.baseEntryFee[selectedClassId] || 0;
        const rate = hwy.ratesPerKm[selectedClassId] || 0;
        rateEl.textContent = `${base} TL + ${rate.toFixed(2)} TL/km`;
    }

    companyEl.textContent = item.company || "-";
    durationEl.textContent = item.duration || "-";
    guaranteeEl.textContent = item.guarantee || "-";
    constructionEl.textContent = item.cost || "-";
    detailsEl.textContent = item.details || "-";
}

function switchHolidayTab(tabId) {
    const tabDays = document.getElementById("tab-btn-days");
    const tabFree = document.getElementById("tab-btn-free");
    const tabPaid = document.getElementById("tab-btn-paid");
    const content = document.getElementById("holiday-tab-content");

    [tabDays, tabFree, tabPaid].forEach(t => {
        t.className = "text-[10px] sm:text-xs py-1.5 px-2 rounded-lg font-bold transition-all text-zinc-400 hover:text-zinc-200";
    });

    if (tabId === "days") {
        tabDays.className = "text-[10px] sm:text-xs py-1.5 px-2 rounded-lg font-bold transition-all bg-orange-500 text-black";
        content.innerHTML = `<p class="font-bold text-zinc-200">Bayram Geçiş Kuralı:</p><p class="text-zinc-400 text-xs leading-relaxed">Milli ve dini bayramlarda sadece devlete ait (KGM) otoyol ve boğaz köprüleri (FSM, 15 Temmuz Şehitler) ücretsizdir. Özel yap-işlet-devret yolları (Osmangazi, Avrasya, Çanakkale vb.) ücretli kalmaya devam eder.</p>`;
    } else if (tabId === "free") {
        tabFree.className = "text-[10px] sm:text-xs py-1.5 px-2 rounded-lg font-bold transition-all bg-orange-500 text-black";
        content.innerHTML = `<ul class="list-disc pl-5 text-zinc-400 text-xs space-y-1"><li>Fatih Sultan Mehmet Köprüsü</li><li>15 Temmuz Şehitler Köprüsü</li><li>O-4 Anadolu Otoyolu (İstanbul - Ankara)</li><li>O-3 Avrupa Otoyolu (Edirne - İstanbul)</li><li>O-31 İzmir - Aydın & O-32 İzmir - Çeşme</li></ul>`;
    } else if (tabId === "paid") {
        tabPaid.className = "text-[10px] sm:text-xs py-1.5 px-2 rounded-lg font-bold transition-all bg-orange-500 text-black";
        content.innerHTML = `<ul class="list-disc pl-5 text-zinc-400 text-xs space-y-1"><li>Osmangazi Köprüsü (O-5 Otoyolu Geçişi)</li><li>Yavuz Sultan Selim Köprüsü (O-7 Otoyolu Geçişi)</li><li>1915 Çanakkale Köprüsü (O-6 Otoyolu Geçişi)</li><li>Avrasya Tüneli</li><li>Ankara - Niğde Otoyolu (O-21)</li></ul>`;
    }
}

function setupEventListeners() {
    const startInp = document.getElementById("start-query");
    const clearStart = document.getElementById("clear-start");
    let startDebounce = null;

    startInp.oninput = () => {
        const q = startInp.value;
        if (q.trim().length >= 3) {
            clearStart.classList.remove("hidden");
            clearTimeout(startDebounce);
            startDebounce = setTimeout(() => fetchSuggestions(q, "start"), 350);
        } else {
            clearStart.classList.add("hidden");
            document.getElementById("start-suggestions").classList.add("hidden");
        }
    };

    clearStart.onclick = () => {
        startInp.value = ""; selectedStart = null; clearStart.classList.add("hidden");
        document.getElementById("start-suggestions").classList.add("hidden");
        if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
    };

    const endInp = document.getElementById("end-query");
    const clearEnd = document.getElementById("clear-end");
    let endDebounce = null;

    endInp.oninput = () => {
        const q = endInp.value;
        if (q.trim().length >= 3) {
            clearEnd.classList.remove("hidden");
            clearTimeout(endDebounce);
            endDebounce = setTimeout(() => fetchSuggestions(q, "end"), 350);
        } else {
            clearEnd.classList.add("hidden");
            document.getElementById("end-suggestions").classList.add("hidden");
        }
    };

    clearEnd.onclick = () => {
        endInp.value = ""; selectedEnd = null; clearEnd.classList.add("hidden");
        document.getElementById("end-suggestions").classList.add("hidden");
        if (endMarker) { map.removeLayer(endMarker); endMarker = null; }
    };

    document.getElementById("fuel-preset-select").onchange = (e) => {
        updateFuelSliders(e.target.value);
        if (allRoutesCalculated.length > 0) recalculateExistingRoutes();
    };

    const consSlider = document.getElementById("consumption-slider");
    const consVal = document.getElementById("consumption-val");
    consSlider.oninput = () => {
        const presetSelect = document.getElementById("fuel-preset-select").value;
        const isElectric = presetSelect === "electric";
        consVal.innerText = `${consSlider.value} ${isElectric ? "kWh" : "L"}/100km`;
    };
    consSlider.onchange = () => { if (allRoutesCalculated.length > 0) recalculateExistingRoutes(); };

    const pSlider = document.getElementById("price-slider");
    const pVal = document.getElementById("price-val");
    pSlider.oninput = () => {
        const presetSelect = document.getElementById("fuel-preset-select").value;
        const isElectric = presetSelect === "electric";
        pVal.innerText = `${parseFloat(pSlider.value).toFixed(2)} TL/${isElectric ? "kWh" : "Litre"}`;
    };
    pSlider.onchange = () => { if (allRoutesCalculated.length > 0) recalculateExistingRoutes(); };

    document.getElementById("calculate-btn").onclick = () => { triggerRouteLoad(); };
    document.getElementById("tab-btn-days").onclick = () => switchHolidayTab("days");
    document.getElementById("tab-btn-free").onclick = () => switchHolidayTab("free");
    document.getElementById("tab-btn-paid").onclick = () => switchHolidayTab("paid");

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#start-query") && !e.target.closest("#start-suggestions")) {
            document.getElementById("start-suggestions").classList.add("hidden");
        }
        if (!e.target.closest("#end-query") && !e.target.closest("#end-suggestions")) {
            document.getElementById("end-suggestions").classList.add("hidden");
        }
    });
}

async function fetchSuggestions(query, type) {
    const dropdown = document.getElementById(`${type}-suggestions`);
    dropdown.innerHTML = "";
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Turkey")}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "tr-TR,tr;q=0.9" } });
        if (res.ok) {
            const results = await res.json();
            if (results.length === 0) {
                dropdown.innerHTML = `<div class="p-2 text-zinc-500 italic text-[11px]">Sonuç bulunamadı.</div>`;
                dropdown.classList.remove("hidden");
                return;
            }
            results.forEach(item => {
                const addr = item.address;
                const parts = [];
                if (addr.road) parts.push(addr.road);
                if (addr.suburb) parts.push(addr.suburb);
                if (addr.town) parts.push(addr.town);
                if (addr.city || addr.province) parts.push(addr.city || addr.province);
                if (addr.state) parts.push(addr.state);
                const display = parts.length > 0 ? parts.join(", ") : item.display_name;
                const el = document.createElement("div");
                el.className = "p-2 hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer border-b border-white/[0.03] transition-colors last:border-b-0 text-[11px]";
                el.textContent = display;
                el.onclick = () => selectSuggestion(item, display, type);
                dropdown.appendChild(el);
            });
            dropdown.classList.remove("hidden");
        }
    } catch (err) {
        console.error(err);
    }
}

function selectSuggestion(item, displayName, type) {
    const inp = document.getElementById(`${type}-query`);
    inp.value = displayName;
    document.getElementById(`${type}-suggestions`).classList.add("hidden");
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    if (type === "start") {
        selectedStart = { lat, lng, name: displayName };
        if (startMarker) map.removeLayer(startMarker);
        startMarker = L.marker([lat, lng]).addTo(map).bindPopup("Başlangıç").openPopup();
        map.setView([lat, lng], 11);
    } else {
        selectedEnd = { lat, lng, name: displayName };
        if (endMarker) map.removeLayer(endMarker);
        endMarker = L.marker([lat, lng]).addTo(map).bindPopup("Varış").openPopup();
        map.setView([lat, lng], 11);
    }
}

async function triggerRouteLoad() {
    if (!selectedStart || !selectedEnd) {
        alert("Lütfen başlangıç ve varış konumlarını seçin.");
        return;
    }
    const overlay = document.getElementById("loading-overlay");
    overlay.classList.remove("hidden");
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${selectedStart.lng},${selectedStart.lat};${selectedEnd.lng},${selectedEnd.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM loading failed");
        const data = await res.json();
        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) throw new Error("No routes");
        document.getElementById("fallback-badge").classList.add("hidden");
        processAndLayoutRoutes(data.routes);
    } catch (err) {
        console.warn("OSRM error, using offline heuristics:", err);
        document.getElementById("fallback-badge").classList.remove("hidden");
        calculateSimulatedRoutes();
    } finally {
        overlay.classList.add("hidden");
    }
}

function recalculateExistingRoutes() {
    if (allRoutesCalculated[0] && allRoutesCalculated[0].rawRoute) {
        const rawList = allRoutesCalculated.map(r => r.rawRoute);
        processAndLayoutRoutes(rawList, activeRouteIndex);
    } else {
        calculateSimulatedRoutes();
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeTaxAndFuel(totalDistance, totalDuration, totalToll, crossedBridges, crossedHighways) {
    const consumptionLPer100 = parseFloat(document.getElementById("consumption-slider").value);
    const fuelUnitPrice = parseFloat(document.getElementById("price-slider").value);
    const fuelLiterConsumed = (totalDistance / 100) * consumptionLPer100;
    const totalFuelCost = Math.round(fuelLiterConsumed * fuelUnitPrice);
    const grandTotal = totalToll + totalFuelCost;

    const tollKdv = totalToll * (0.2 / 1.2);
    const tollNet = totalToll - tollKdv;
    const presetSelect = document.getElementById("fuel-preset-select").value;
    const isElectric = presetSelect === "electric";

    let fuelOtv = 0, fuelKdv = 0;
    if (isElectric) {
        fuelKdv = totalFuelCost * (0.2 / 1.2);
        fuelOtv = totalFuelCost * 0.05;
    } else {
        const otvPerLiter = presetSelect.includes("dizel") ? 10.59 : 11.29;
        fuelOtv = Math.min(fuelLiterConsumed * otvPerLiter, totalFuelCost * 0.40);
        fuelKdv = totalFuelCost * (0.2 / 1.2);
    }
    return {
        totalDistance, totalDuration, crossedHighways, crossedBridges,
        totalToll, totalFuelCost, grandTotal, tollKdv, tollNet, fuelOtv, fuelKdv,
        totalFuelTax: fuelOtv + fuelKdv, fuelNet: totalFuelCost - (fuelOtv + fuelKdv), totalTax: tollKdv + (fuelOtv + fuelKdv), totalNet: tollNet + (totalFuelCost - (fuelOtv + fuelKdv)), isElectric
    };
}

function computeRouteMetrics(rawRoute) {
    const totalDistance = rawRoute.distance / 1000;
    const totalDuration = rawRoute.duration / 60;
    const crossedHighwaysMap = {};

    for (const leg of rawRoute.legs) {
        for (const step of leg.steps || []) {
            const ref = step.ref;
            const name = step.name;
            em.forEach(hwy => {
                let matches = false;
                if (ref && ref.toLowerCase().includes(hwy.code.toLowerCase())) matches = true;
                else if (name && (name.toLowerCase().includes(hwy.code.toLowerCase()) || name.toLowerCase().replace("ı", "i").includes(hwy.name.toLowerCase().split(" ")[0].replace("ı", "i")))) matches = true;

                if (matches) {
                    if (!crossedHighwaysMap[hwy.code]) {
                        crossedHighwaysMap[hwy.code] = {
                            code: hwy.code, name: hwy.name, distanceKm: 0,
                            baseEntryFee: hwy.baseEntryFee[selectedClassId] || 0,
                            ratesPerKm: hwy.ratesPerKm[selectedClassId] || 0,
                            operator: hwy.operator
                        };
                    }
                    crossedHighwaysMap[hwy.code].distanceKm += step.distance / 1000;
                }
            });
        }
    }

    const crossedBridges = [];
    Zc.forEach(br => {
        let minD = Infinity;
        for (const crd of rawRoute.geometry.coordinates) {
            const d = getDistance(crd[1], crd[0], br.midpoint[0], br.midpoint[1]);
            if (d < minD) minD = d;
        }
        const th = br.id === "avrasya_tuneli" ? 0.8 : 0.65;
        if (minD < th) {
            const rate = br.rates[selectedClassId] || 0;
            if (rate > 0) {
                crossedBridges.push({ id: br.id, name: br.name, toll: rate, operator: br.operator });
            }
        }
    });

    let totalToll = 0;
    crossedBridges.forEach(b => totalToll += b.toll);

    const crossedHighways = [];
    Object.values(crossedHighwaysMap).forEach(h => {
        let dist = h.distanceKm;
        if (h.code === "O-5" && dist > 430) dist = 430;
        if (h.code === "O-4" && dist > 380) dist = 380;
        let toll = 0;
        if (dist > 1.5) toll = h.baseEntryFee + (h.ratesPerKm * dist);
        h.toll = toll;
        totalToll += toll;
        crossedHighways.push(h);
    });
    return computeTaxAndFuel(totalDistance, totalDuration, totalToll, crossedBridges, crossedHighways);
}

function processAndLayoutRoutes(rawRoutes, defaultIndex = 0) {
    routePolylinesList.forEach(line => map.removeLayer(line));
    routePolylinesList = [];

    allRoutesCalculated = rawRoutes.map((rawRoute, idx) => {
        return { index: idx, rawRoute, metrics: computeRouteMetrics(rawRoute) };
    });

    const unique = [];
    const seen = new Set();
    allRoutesCalculated.forEach(r => {
        const key = `${r.metrics.totalToll.toFixed(0)}-${r.metrics.totalDistance.toFixed(0)}`;
        if (!seen.has(key)) { seen.add(key); unique.push(r); }
    });
    allRoutesCalculated = unique;

    activeRouteIndex = defaultIndex < allRoutesCalculated.length ? defaultIndex : 0;

    allRoutesCalculated.forEach((item, idx) => {
        const coords = item.rawRoute.geometry.coordinates.map(c => [c[1], c[0]]);
        const isSel = idx === activeRouteIndex;
        const polyline = L.polyline(coords, {
            color: isSel ? '#f97316' : '#3f3f46',
            weight: isSel ? 6 : 4,
            opacity: isSel ? 0.9 : 0.4,
            dashArray: isSel ? undefined : "5, 8"
        }).addTo(map);
        polyline.on('click', () => selectRoute(idx));
        routePolylinesList.push(polyline);
    });

    if (routePolylinesList[activeRouteIndex]) {
        map.fitBounds(routePolylinesList[activeRouteIndex].getBounds(), { padding: [40, 40] });
    }

    if (selectedStart && !startMarker) startMarker = L.marker([selectedStart.lat, selectedStart.lng]).addTo(map).bindPopup("Başlangıç");
    if (selectedEnd && !endMarker) endMarker = L.marker([selectedEnd.lat, selectedEnd.lng]).addTo(map).bindPopup("Varış");

    renderAlternativesCards();
    renderRouteDetails(allRoutesCalculated[activeRouteIndex].metrics);
}

function selectRoute(index) {
    if (index >= allRoutesCalculated.length) return;
    activeRouteIndex = index;
    routePolylinesList.forEach((line, idx) => {
        const isSel = idx === activeRouteIndex;
        line.setStyle({
            color: isSel ? '#f97316' : '#3f3f46',
            weight: isSel ? 6 : 4,
            opacity: isSel ? 0.9 : 0.4,
            dashArray: isSel ? undefined : "5, 8"
        });
        if (isSel) line.bringToFront();
    });
    renderAlternativesCards();
    renderRouteDetails(allRoutesCalculated[activeRouteIndex].metrics);
}

function renderAlternativesCards() {
    const container = document.getElementById("route-alternatives-container");
    container.innerHTML = "";
    allRoutesCalculated.forEach((item, idx) => {
        const metrics = item.metrics;
        const isSel = idx === activeRouteIndex;
        let label = idx === 0 ? "En Hızlı Rota" : `Alternatif Rota ${idx}`;

        const crossesOsmangazi = metrics.crossedBridges.some(b => b.id === "osmangazi");
        const crossesYSS = metrics.crossedBridges.some(b => b.id === "yavuz_sultan_selim");
        const crossesCanakkale = metrics.crossedBridges.some(b => b.id === "canakkale_1915");
        const crossesAvrasya = metrics.crossedBridges.some(b => b.id === "avrasya_tuneli");

        let pathInfo = "Devlet Yolu (Ücretsiz)";
        if (crossesOsmangazi) pathInfo = "Osmangazi Köprüsü";
        else if (crossesYSS) pathInfo = "Yavuz Sultan S. Köprüsü";
        else if (crossesCanakkale) pathInfo = "1915 Çanakkale Köprüsü";
        else if (crossesAvrasya) pathInfo = "Avrasya Tüneli";
        else if (metrics.totalToll > 0) pathInfo = "Otoyol Geçişi";

        const totalCostStr = `${Math.round(metrics.grandTotal).toLocaleString("tr-TR")} TL`;
        const hours = Math.floor(metrics.totalDuration / 60);
        const mins = Math.round(metrics.totalDuration % 60);
        const timeStr = hours > 0 ? `${hours} sa ${mins} dk` : `${mins} dk`;

        const card = document.createElement("button");
        card.type = "button";
        card.className = `p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between items-start gap-1 w-full ${isSel ? "border-orange-500 bg-orange-500/10 text-orange-400 font-medium" : "border-white/5 bg-[#18181b] text-zinc-400 hover:text-zinc-200"
            }`;
        card.onclick = () => selectRoute(idx);
        card.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <span class="text-[9px] font-bold uppercase ${isSel ? 'text-orange-400' : 'text-zinc-500'}">${label}</span>
        <span class="text-[10px] font-bold font-mono ${isSel ? 'text-orange-400' : 'text-zinc-300'}">${totalCostStr}</span>
      </div>
      <span class="text-xs font-bold text-zinc-200 block truncate w-full">${pathInfo}</span>
      <span class="text-[9px] text-zinc-500 font-mono">${timeStr} • ${metrics.totalDistance.toFixed(0)} km</span>
    `;
        container.appendChild(card);
    });
}

function calculateSimulatedRoutes() {
    const start = selectedStart;
    const end = selectedEnd;
    const directDist = getDistance(start.lat, start.lng, end.lat, end.lng);

    routePolylinesList.forEach(line => map.removeLayer(line));
    routePolylinesList = [];
    allRoutesCalculated = [];

    const otoyolDist = directDist * 1.21;
    const otoyolDur = (otoyolDist / 98) * 60;
    let crossedBridges = [];
    let crossedHighwaysMap = {};

    const isStartNW = start.lat > 40.5 && start.lng < 30.0;
    const isEndNW = end.lat > 40.5 && end.lng < 30.0;
    const isStartSW = start.lat < 40.4 && start.lng < 28.5;
    const isEndSW = end.lat < 40.4 && end.lng < 28.5;
    const isStartBursa = start.lat >= 39.9 && start.lat <= 40.4 && start.lng >= 28.5 && start.lng <= 29.6;
    const isEndBursa = end.lat >= 39.9 && end.lat <= 40.4 && end.lng >= 28.5 && end.lng <= 29.6;

    if ((isStartNW && (isEndSW || isEndBursa)) || ((isStartSW || isStartBursa) && isEndNW)) {
        const br = Zc.find(b => b.id === "osmangazi");
        crossedBridges.push({ id: br.id, name: br.name, toll: br.rates[selectedClassId] || 0, operator: br.operator });
        const hwy = em.find(h => h.code === "O-5");
        crossedHighwaysMap["O-5"] = {
            code: hwy.code, name: hwy.name, distanceKm: Math.min(otoyolDist, 400),
            baseEntryFee: hwy.baseEntryFee[selectedClassId] || 0, ratesPerKm: hwy.ratesPerKm[selectedClassId] || 0, operator: hwy.operator
        };
    }

    const isStartAnkara = start.lat >= 39.5 && start.lat <= 40.5 && start.lng >= 32.0;
    const isEndAnkara = end.lat >= 39.5 && end.lat <= 40.5 && end.lng >= 32.0;
    if ((isStartNW && isEndAnkara) || (isStartAnkara && isEndNW)) {
        const hwy = em.find(h => h.code === "O-4");
        crossedHighwaysMap["O-4"] = {
            code: hwy.code, name: hwy.name, distanceKm: Math.min(otoyolDist, 370),
            baseEntryFee: hwy.baseEntryFee[selectedClassId] || 0, ratesPerKm: hwy.ratesPerKm[selectedClassId] || 0, operator: hwy.operator
        };
    }

    const isStartSouth = start.lat < 38.5 && start.lng >= 32.0;
    const isEndSouth = end.lat < 38.5 && end.lng >= 32.0;
    if ((isStartAnkara && isEndSouth) || (isStartSouth && isEndAnkara)) {
        const hwy = em.find(h => h.code === "O-21");
        crossedHighwaysMap["O-21"] = {
            code: hwy.code, name: hwy.name, distanceKm: Math.min(otoyolDist, 275),
            baseEntryFee: hwy.baseEntryFee[selectedClassId] || 0, ratesPerKm: hwy.ratesPerKm[selectedClassId] || 0, operator: hwy.operator
        };
    }

    let totalToll1 = 0;
    crossedBridges.forEach(b => totalToll1 += b.toll);
    const crossedHighways1 = [];
    Object.values(crossedHighwaysMap).forEach(h => {
        h.toll = h.baseEntryFee + h.ratesPerKm * h.distanceKm;
        totalToll1 += h.toll;
        crossedHighways1.push(h);
    });

    const metrics1 = computeTaxAndFuel(otoyolDist, otoyolDur, totalToll1, crossedBridges, crossedHighways1);
    allRoutesCalculated.push({
        index: 0,
        metrics: metrics1,
        coordinates: [[start.lat, start.lng], [end.lat, end.lng]]
    });

    const alternativeDist = directDist * 1.27;
    const alternativeDur = (alternativeDist / 78) * 60;
    const metrics2 = computeTaxAndFuel(alternativeDist, alternativeDur, 0, [], []);

    const midLat = (start.lat + end.lat) / 2 + 0.15;
    const midLng = (start.lng + end.lng) / 2 + 0.15;
    allRoutesCalculated.push({
        index: 1,
        metrics: metrics2,
        coordinates: [[start.lat, start.lng], [midLat, midLng], [end.lat, end.lng]]
    });

    activeRouteIndex = 0;
    allRoutesCalculated.forEach((item, idx) => {
        const isSel = idx === activeRouteIndex;
        const polyline = L.polyline(item.coordinates, {
            color: isSel ? '#f97316' : '#3f3f46',
            weight: isSel ? 6 : 4,
            opacity: isSel ? 0.9 : 0.4,
            dashArray: isSel ? undefined : "5, 8"
        }).addTo(map);
        polyline.on('click', () => selectRoute(idx));
        routePolylinesList.push(polyline);
    });

    if (routePolylinesList[activeRouteIndex]) {
        map.fitBounds(routePolylinesList[activeRouteIndex].getBounds(), { padding: [40, 40] });
    }

    if (selectedStart && !startMarker) startMarker = L.marker([selectedStart.lat, selectedStart.lng]).addTo(map).bindPopup("Başlangıç");
    if (selectedEnd && !endMarker) endMarker = L.marker([selectedEnd.lat, selectedEnd.lng]).addTo(map).bindPopup("Varış");

    renderAlternativesCards();
    renderRouteDetails(allRoutesCalculated[activeRouteIndex].metrics);
}

function renderRouteDetails(m) {
    document.getElementById("toll-cost-val").textContent = m.totalToll.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById("fuel-cost-val").textContent = m.totalFuelCost.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById("total-cost-val").textContent = m.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById("distance-val").textContent = m.totalDistance.toFixed(1);

    const hours = Math.floor(m.totalDuration / 60);
    const mins = Math.round(m.totalDuration % 60);
    document.getElementById("duration-val").textContent = hours > 0 ? `${hours} sa ${mins} dk` : `${mins} dk`;

    document.getElementById("net-fee-lbl").textContent = `${m.totalNet.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
    document.getElementById("toll-kdv-lbl").textContent = `${m.tollKdv.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
    document.getElementById("fuel-kdv-lbl").textContent = `${m.fuelKdv.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;

    const otvTitle = document.getElementById("fuel-otv-title");
    if (m.isElectric) {
        otvTitle.innerHTML = `Akaryakıt BTV (%5): <b class="text-zinc-200 font-mono" id="fuel-otv-lbl">0.00 TL</b>`;
    } else {
        otvTitle.innerHTML = `Akaryakıt ÖTV (Maktu): <b class="text-zinc-200 font-mono" id="fuel-otv-lbl">0.00 TL</b>`;
    }
    document.getElementById("fuel-otv-lbl").textContent = `${m.fuelOtv.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;

    const stack = document.getElementById("tax-stacked-bar");
    stack.innerHTML = "";
    const pctNet = m.grandTotal > 0 ? (m.totalNet / m.grandTotal) * 100 : 100;
    const pctTollKdv = m.grandTotal > 0 ? (m.tollKdv / m.grandTotal) * 100 : 0;
    const pctFuelKdv = m.grandTotal > 0 ? (m.fuelKdv / m.grandTotal) * 100 : 0;
    const pctFuelOtv = m.grandTotal > 0 ? (m.fuelOtv / m.grandTotal) * 100 : 0;

    stack.innerHTML = `
    <div style="width: ${pctNet}%" class="bg-zinc-600 h-full transition-all" title="Net Maliyet: %${pctNet.toFixed(1)}"></div>
    <div style="width: ${pctTollKdv}%" class="bg-cyan-500 h-full transition-all" title="Otoyol KDV (%20): %${pctTollKdv.toFixed(1)}"></div>
    <div style="width: ${pctFuelKdv}%" class="bg-orange-500 h-full transition-all" title="Akaryakıt KDV (%20): %${pctFuelKdv.toFixed(1)}"></div>
    <div style="width: ${pctFuelOtv}%" class="bg-red-500 h-full transition-all" title="Akaryakıt ÖTV: %${pctFuelOtv.toFixed(1)}"></div>
  `;

    const itemsContainer = document.getElementById("crossed-items-list");
    itemsContainer.innerHTML = "";

    if (m.crossedBridges.length === 0 && m.crossedHighways.length === 0) {
        itemsContainer.innerHTML = `
      <div class="py-6 text-center">
        <div class="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
          <i data-lucide="shield-check" class="w-6 h-6 text-emerald-400"></i>
        </div>
        <p class="text-[11px] text-zinc-400">Rotada herhangi bir ücretli otoyol veya köprü bulunmamaktadır. Tamamen ücretsiz devlet yollarını kullanmaktasınız.</p>
      </div>
    `;
    } else {
        if (m.crossedBridges.length > 0) {
            const header = document.createElement("h4");
            header.className = "text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1";
            header.textContent = `KÖPRÜ VE TÜNELLER (${m.crossedBridges.length})`;
            itemsContainer.appendChild(header);

            m.crossedBridges.forEach(b => {
                const item = document.createElement("div");
                item.className = "flex flex-col p-3 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/[0.03] transition-all";
                item.innerHTML = `
          <div class="flex items-start justify-between w-full">
            <div>
              <span class="text-xs font-bold text-zinc-200 block">${b.name}</span>
              <span class="text-[9px] text-zinc-500 font-semibold uppercase">${b.operator} İŞLETMESİ • KDV DAHİL</span>
            </div>
            <span class="text-xs font-extrabold text-orange-400 font-mono">${b.toll.toFixed(2)} TL</span>
          </div>
        `;
                itemsContainer.appendChild(item);
            });
        }

        if (m.crossedHighways.length > 0) {
            const header = document.createElement("h4");
            header.className = "text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2";
            header.textContent = `OTOYOL KESİMLERİ (${m.crossedHighways.length})`;
            itemsContainer.appendChild(header);

            m.crossedHighways.forEach(h => {
                const item = document.createElement("div");
                item.className = "flex flex-col p-3 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/[0.03] transition-all";
                item.innerHTML = `
          <div class="flex items-start justify-between w-full">
            <div>
              <span class="text-xs font-bold text-zinc-200 block">${h.name}</span>
              <span class="text-[9px] text-zinc-500 font-semibold uppercase">${h.operator} İŞLETMESİ • KDV DAHİL</span>
            </div>
            <span class="text-xs font-extrabold text-orange-400 font-mono">${h.toll.toFixed(2)} TL</span>
          </div>
          <div class="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-[9px] text-zinc-500">
            <span>Kullanılan Bölüm: <b class="text-zinc-400 font-mono">${h.distanceKm.toFixed(1)} km</b></span>
            <span>•</span>
            <span>Birim Fiyat: <b class="text-zinc-400 font-mono">${h.ratesPerKm.toFixed(2)} TL/km</b></span>
          </div>
        `;
                itemsContainer.appendChild(item);
            });
        }
    }

    document.getElementById("results-placeholder").classList.add("hidden");
    document.getElementById("results-drawer").classList.remove("hidden");
    lucide.createIcons();
}
