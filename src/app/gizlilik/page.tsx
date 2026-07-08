import Link from "next/link";

export const metadata = { title: "Gizlilik ve KVKK — Pinle" };

export default function Privacy() {
  return (
    <main className="paper-grain mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-6">
      <Link href="/" className="flex items-center gap-1.5">
        <span className="text-2xl">📍</span>
        <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
      </Link>
      <h1 className="text-2xl font-extrabold">Gizlilik ve KVKK Aydınlatma Metni</h1>

      <div className="sticker p-4 text-sm leading-relaxed flex flex-col gap-3">
        <p>
          <strong>Özet:</strong> Hesap yok, e-posta yok, telefon yok. Konumun takip edilmez.
          Sadece haritaya kendi eklediğin içerik saklanır.
        </p>

        <h2 className="text-base font-extrabold">1. Veri Sorumlusu</h2>
        <p>
          [ŞİRKET/ŞAHIS ADI], [adres]. İletişim: [e-posta].{" "}
          <em className="opacity-60">(Launch öncesi doldurulacak.)</em>
        </p>

        <h2 className="text-base font-extrabold">2. İşlenen Veriler</h2>
        <p>
          <strong>Anonim kimlik çerezi:</strong> Tarayıcına rastgele üretilmiş bir kimlik
          yerleştirilir; puanların ve içeriklerin bu kimliğe bağlıdır. Gerçek kimliğinle
          eşleştirilmez. <strong>İçerik verileri:</strong> Eklediğin pinler (mekan/konu adı,
          kategori, fiyat, not, fotoğraf ve pinlediğin noktanın koordinatı), yorumların ve
          oyların. <strong>Kullanım verisi:</strong> Günlük tekil ziyaret sayısı (anonim
          kimlik bazında, IP adresi saklanmaz).
        </p>

        <h2 className="text-base font-extrabold">3. İşlenmeyen Veriler</h2>
        <p>
          Ad-soyad, e-posta, telefon, cihaz konum geçmişi toplanmaz. &quot;Konumumu bul&quot;
          özelliği konumunu yalnızca cihazında, haritayı ortalamak için kullanır — sunucuya
          gönderilmez.
        </p>

        <h2 className="text-base font-extrabold">4. İşleme Amacı ve Hukuki Sebep</h2>
        <p>
          Veriler, hizmetin sunulması (haritanın çalışması, puan/rozet sistemi) ve içerik
          kalitesinin korunması (spam/kötüye kullanım önleme) amacıyla, KVKK m.5/2-f
          (meşru menfaat) kapsamında işlenir.
        </p>

        <h2 className="text-base font-extrabold">5. Paylaşım ve Saklama</h2>
        <p>
          Eklediğin içerikler herkese açıktır. Verilerin üçüncü taraflara satılmaz,
          reklam amaçlı paylaşılmaz. Harita altlığı{" "}
          <a href="https://openfreemap.org" className="underline">OpenFreeMap</a>{" "}
          üzerinden yüklenir; bu istekler sırasında IP adresin ilgili servise iletilir.
          İçerikler sen silinmesini isteyene kadar saklanır.
        </p>

        <h2 className="text-base font-extrabold">6. Hakların (KVKK m.11)</h2>
        <p>
          Verilerine erişme, düzeltme, silme ve işlemeye itiraz etme hakkına sahipsin.
          Talebin için [e-posta] adresine anonim kullanıcı adınla (profilde görünen isim)
          başvurabilirsin; anonim kimliğinle eşleşen tüm veriler silinir.
        </p>

        <h2 className="text-base font-extrabold">7. İçerik Kuralları</h2>
        <p>
          Kişisel bilgi (isim, telefon, adres, plaka) içeren, hakaret veya nefret söylemi
          barındıran içerikler kaldırılır. Anı pinlerinde üçüncü kişileri teşhis edilebilir
          şekilde anlatmak yasaktır. Uygunsuz içeriği her pinin altındaki &quot;Bildir&quot;
          ile işaretleyebilirsin; eşik aşıldığında içerik otomatik gizlenir. Bir kullanıcının
          tüm içeriklerini görmek istemiyorsan &quot;Kullanıcıyı gizle&quot; ile bu cihazda
          gizleyebilirsin.
        </p>

        <p className="opacity-60">
          Bu metin bir taslaktır; yayına almadan önce hukuki danışmanlık alınması önerilir.
          Son güncelleme: 5 Temmuz 2026.
        </p>
      </div>

      <Link href="/" className="btn btn-tomato px-8 py-3 self-center">
        Haritaya Dön 🗺️
      </Link>
    </main>
  );
}
