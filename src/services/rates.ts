export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  GA: number; // Gram Altın
  C: number;  // Çeyrek Altın
}

export async function fetchLiveRates(): Promise<ExchangeRates> {
  try {
    // Türkiye piyasaları için en popüler ve ücretsiz açık kaynaklı API'lardan biri
    const response = await fetch('https://finans.truncgil.com/today.json');
    const data = await response.json();
    
    // API yapısı: {"ABD DOLARI": {"Satış": "34.55"}, "EURO": {"Satış": "37.20"}, ...}
    // Not: Bu API bazen CORS politikası nedeniyle tarayıcıdan doğrudan erişilemeyebilir.
    // Eğer hata alırsak fallback (Frankfurter) sistemine geçecek.

    return {
      USD: parseFloat(data["ABD DOLARI"].Satis.replace(',', '.')),
      EUR: parseFloat(data["EURO"].Satis.replace(',', '.')),
      GBP: parseFloat(data["İNGİLİZ STERLİNİ"].Satis.replace(',', '.')),
      GA: parseFloat(data["Gram Altın"].Satis.replace(',', '.')),
      C: parseFloat(data["Çeyrek Altın"].Satis.replace(',', '.')),
    };
  } catch (error) {
    console.warn('Birinci kaynak (Truncgil) başarısız, Frankfurter deneniyor...', error);
    
    try {
      // Fallback: Frankfurter (Sadece Döviz)
      const currencyRes = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR,GBP');
      const currencyData = await currencyRes.json();
      
      const usdRate = 1 / currencyData.rates.USD;
      const rates = {
        USD: usdRate,
        EUR: 1 / currencyData.rates.EUR,
        GBP: 1 / currencyData.rates.GBP,
        GA: (2680 / 31.1035) * usdRate, // Ons üzerinden hesaplanan yaklaşık gram altın
        C: 0
      };
      rates.C = rates.GA * 1.65;
      return rates;
    } catch (e) {
      console.error('Tüm kurlar başarısız oldu:', e);
      return {
        USD: 34.58,
        EUR: 37.32,
        GBP: 44.25,
        GA: 3045,
        C: 5080
      };
    }
  }
}
