import streamlit as st
import google.generativeai as genai
import os

# Sayfa Ayarları
st.set_page_config(page_title="Otoyol Vergi ve Yük Sayacı", page_icon="🛣️", layout="centered")

# --- API AYARLARI ---
# Streamlit Cloud üzerinde API anahtarını st.secrets üzerinden almalısın
# (GitHub'a doğrudan API key yazmak tehlikelidir)
try:
    API_KEY = st.secrets["GEMINI_API_KEY"]
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash') # AI Studio'da kullandığın model
except Exception as e:
    st.warning("Lütfen Streamlit Cloud üzerinden GEMINI_API_KEY gizli anahtarınızı ayarlayın.")

# --- TASLAK VERİ (KGM & Vergi Simülasyonu) ---
# Gerçek projede bunu ayrı bir JSON'dan okuyacağız
ornek_gise_verisi = {
    "camlica_akinci": {
        "guzergah": "Çamlıca (İstanbul) - Akıncı (Ankara)",
        "toplam_ucret": 350.00,
        "kdv_orani": 0.20
    }
}

# --- ARAYÜZ (UI) ---
st.title("🛣️ Ulaşım Hakkı: Kime, Ne Ödüyoruz?")
st.markdown("""
Bu araç, Türkiye'deki ücretli yollarda cebinizden çıkan paranın gerçekte nereye gittiğini hesaplar. 
*Devlet yolları halkındır, ulaşım temel bir haktır.*
""")

st.divider()

st.subheader("Gidiş-Geliş Rotanızı Seçin")
rota = st.selectbox("Güzergah:", ["Çamlıca (İstanbul) - Akıncı (Ankara)"])

if st.button("Maliyeti ve Vergiyi Hesapla"):
    # Matematiksel Hesaplama
    secilen_veri = ornek_gise_verisi["camlica_akinci"]
    toplam = secilen_veri["toplam_ucret"]
    cikan_kdv = toplam - (toplam / (1 + secilen_veri["kdv_orani"]))
    gise_net = toplam - cikan_kdv
    
    # Asgari Ücret / Zaman Kıyası (Örnek: 2026 yılı ortalama saatlik asgari ücret)
    saatlik_asgari_ucret = 120.00 
    calisma_saati_karsiligi = toplam / saatlik_asgari_ucret
    
    # Ekran Çıktıları
    st.success(f"Bu yolculuğun toplam maliyeti: **{toplam:.2f} ₺**")
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric(label="Özel İşletmeciye Giden", value=f"{gise_net:.2f} ₺")
    with col2:
        st.metric(label="Devlete Giden Vergi (KDV)", value=f"{cikan_kdv:.2f} ₺")
        
    st.info(f"💡 **Sınıfsal Yük:** Bu gişe ücretini ödeyebilmek için asgari ücretli bir vatandaşın tam **{calisma_saati_karsiligi:.1f} saat** çalışması gerekiyor.")
    
    # AI Studio (Gemini) Entegrasyonu: Aktivist Söylem Üretimi
    st.subheader("Bütçe Gerçekleri")
    with st.spinner("AI analiz ediyor..."):
        prompt = f"""
        Bir vatandaş otoyol gişesine {toplam} TL ödedi. Bunun {cikan_kdv:.2f} TL'si vergi. 
        Bu tutarın ne kadar büyük bir toplumsal kaynak olduğunu anlatan, yap-işlet-devret projelerini 
        ve asgari ücretlinin alım gücünü eleştiren 2 paragraflık vurucu ve şeffaflık talep eden bir metin yaz.
        """
        try:
            response = model.generate_content(prompt)
            st.write(response.text)
        except Exception as e:
            st.error("AI modeliyle iletişim kurulamadı. API kotanızı veya bağlantınızı kontrol edin.")
