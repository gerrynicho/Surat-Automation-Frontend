import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";

import shotMasuk from "../../../public/panduan/01-masuk.png";
import shotKepengurusanBaru from "../../../public/panduan/02-kepengurusan-baru.png";
import shotKepengurusanTersimpan from "../../../public/panduan/03-kepengurusan-tersimpan.png";
import shotFormSurat from "../../../public/panduan/04-form-surat.png";
import shotTinjau from "../../../public/panduan/05-tinjau.png";
import shotSelesai from "../../../public/panduan/06-selesai.png";
import shotUbah from "../../../public/panduan/07-ubah-kepengurusan.png";

export const metadata: Metadata = {
  title: "Panduan — TPKB Surat Generator",
};

const SECTIONS = [
  { id: "masuk", title: "Masuk ke aplikasi" },
  { id: "kepengurusan-baru", title: "Membuat kepengurusan baru" },
  { id: "buat-surat", title: "Membuat surat" },
  { id: "tinjau", title: "Memeriksa dan menyimpan surat" },
  { id: "arsip", title: "Di mana surat dan arsip tersimpan" },
  { id: "arsip-surat", title: "Melihat, mengubah, atau menghapus surat yang sudah dibuat" },
  { id: "ubah", title: "Mengganti Ketua, tanda tangan, kop surat, atau footer" },
  { id: "error", title: "Kalau muncul pesan error" },
];

const FORM_FIELDS: { name: string; meaning: string; example: string }[] = [
  {
    name: "Kepengurusan",
    meaning: "Kepengurusan yang mengeluarkan surat. Menentukan kop surat, tanda tangan, dan arsip yang dipakai.",
    example: "TPKB ITS 2026",
  },
  {
    name: "Nama dokumen",
    meaning: "Nama file PDF di Google Drive. Tidak dicetak di surat. Terisi otomatis dari nama kegiatan dan peserta pertama; boleh diubah.",
    example: "Surat Izin Baksos - Kevin Hartanto",
  },
  {
    name: "Tanggal pengajuan",
    meaning: "Tanggal surat, ditulis lengkap. Muncul di kanan atas surat. Sudah terisi tanggal hari ini.",
    example: "23 Juni 2026",
  },
  {
    name: "Bulan",
    meaning: "Bulan pengajuan dalam angka Romawi, ikut tertulis di nomor surat (mis. 006/B/TPKB-ITS/VI/2026). Terisi sendiri setelah tanggal pengajuan diketik.",
    example: "VI",
  },
  {
    name: "Kode surat",
    meaning: "Huruf di tengah nomor surat. A = tujuan internal TPKB, B = luar TPKB tapi masih di ITS, C = luar ITS. Sudah terisi B, yang dipakai untuk surat izin.",
    example: "B",
  },
  {
    name: "Perihal",
    meaning: "Keterangan singkat untuk catatan arsip di spreadsheet. Tidak dicetak di surat. Terisi otomatis dari nama peserta; boleh diubah.",
    example: "Surat Izin Kegiatan - Kevin Hartanto dkk.",
  },
  {
    name: "Tujuan surat",
    meaning: "Jabatan atau nama penerima. Ditulis di bawah “Yth.” Sudah terisi “Direktorat Kemahasiswaan”; ganti kalau suratnya untuk pihak lain.",
    example: "Wakil Rektor Bidang Kemahasiswaan",
  },
  {
    name: "Ditujukan ke (centang ITS)",
    meaning: "Dicentang: baris di bawah penerima tertulis “Institut Teknologi Sepuluh Nopember”. Tidak dicentang: tertulis “Di tempat”.",
    example: "Dicentang",
  },
  {
    name: "Nama kegiatan",
    meaning: "Kegiatan TPKB yang diikuti peserta. Dicetak tebal di surat.",
    example: "Bakti Sosial TPKB ITS 2026",
  },
  {
    name: "Hari / tanggal kegiatan",
    meaning: "Kapan kegiatan berlangsung. Terisi hari ini sebagai contoh; ganti dengan tanggal kegiatan.",
    example: "Senin, 29 Juni 2026",
  },
  {
    name: "Acara yang minta izin",
    meaning: "Kelas atau acara yang tidak bisa dihadiri peserta. Dicetak tebal di surat.",
    example: "Kelas Algoritma Lanjutan",
  },
  {
    name: "Peserta",
    meaning: "Nama, NRP, dan jurusan setiap mahasiswa. Tekan “+ Tambah peserta” untuk menambah baris.",
    example: "Kevin Hartanto, 5025231042, Teknik Informatika",
  },
];

const ERRORS: { message: string; meaning: string; action: string }[] = [
  {
    message: "API key tidak valid",
    meaning: "Password yang diketik salah.",
    action: "Periksa huruf besar/kecil dan spasi, lalu coba lagi. Minta password ke pengurus kalau lupa.",
  },
  {
    message: "Unauthorized",
    meaning: "Sesi masukmu sudah tidak berlaku.",
    action: "Muat ulang halaman, lalu masukkan password lagi.",
  },
  {
    message: "Data Ketua belum lengkap / Tanda tangan Ketua belum diunggah / Stempel belum diunggah",
    meaning: "Kepengurusan itu belum punya data yang wajib ada di surat.",
    action: "Buka Kelola Kepengurusan, pilih kepengurusannya, lengkapi, simpan. Lalu buat ulang pratinjau surat.",
  },
  {
    message: "Kepengurusan … sudah ada",
    meaning: "Nama itu sudah dipakai.",
    action: "Untuk mengubahnya, pilih “Ubah: (nama)” di daftar. Untuk yang baru, pakai nama lain.",
  },
  {
    message: "Gambar harus berformat PNG atau JPG / ukuran gambar maksimal 4 MB",
    meaning: "File yang dipilih bukan gambar yang didukung, atau terlalu besar.",
    action: "Simpan ulang gambar sebagai PNG atau JPG dan perkecil ukurannya.",
  },
  {
    message: "Bulan tidak sesuai dengan tanggal pengajuan",
    meaning: "Bulan Romawi yang dipilih berbeda dari bulan di tanggal pengajuan.",
    action: "Samakan keduanya. Contoh: tanggal “23 Juni 2026” berarti bulan VI.",
  },
  {
    message: "Nomor surat … sudah tercatat di spreadsheet, tetapi PDF gagal disimpan",
    meaning: "Nomornya sudah masuk arsip, tapi file PDF tidak sampai ke Google Drive.",
    action: "Buka spreadsheet arsip, hapus isi baris bernomor itu, lalu tekan “Surat sudah benar, simpan” sekali lagi.",
  },
  {
    message: "Baris … di spreadsheet arsip tidak punya nomor yang valid",
    meaning: "Baris terakhir di spreadsheet arsip terisi sebagian, tanpa angka di kolom NO.",
    action: "Buka spreadsheet arsip, isi kolom NO. di baris itu atau kosongkan seluruh barisnya.",
  },
  {
    message: "… not found in folder … / “Berkas Keluar” subfolder not found",
    meaning: "Folder kepengurusan di Google Drive tidak lengkap (spreadsheet arsip atau folder Berkas Keluar hilang).",
    action: "Kembalikan dari Trash Google Drive kalau terhapus. Kalau tidak bisa, hubungi pengelola aplikasi.",
  },
  {
    message: "Gagal menyusun PDF surat",
    meaning: "Ada masalah di sisi aplikasi, bukan di isianmu.",
    action: "Coba sekali lagi. Kalau masih gagal, hubungi pengelola aplikasi.",
  },
];

export default function Page() {
  return (
    <PageShell title="Panduan">
      <div className="flex flex-col gap-10 text-sm leading-relaxed text-gray-700">
        <section className="flex flex-col gap-3">
          <p>
            Aplikasi ini membuat <strong>Surat Permohonan Izin Kegiatan</strong> TPKB ITS
            secara otomatis. Kamu cukup mengisi formulir; aplikasi yang menyusun surat
            lengkap dengan kop, tanda tangan Ketua, dan stempel, memberi nomor surat,
            mencatatnya di arsip, lalu menyimpan PDF-nya ke Google Drive.
          </p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="mb-1 font-medium text-gray-900">Yang perlu disiapkan</p>
            <ul className="list-disc pl-5">
              <li>Password aplikasi (minta ke pengurus).</li>
              <li>
                Hanya saat membuat kepengurusan baru: gambar tanda tangan Ketua dan
                gambar kop surat, berformat PNG atau JPG.
              </li>
            </ul>
          </div>
          <nav aria-label="Daftar isi">
            <p className="mb-1 font-medium text-gray-900">Daftar isi</p>
            <ol className="list-decimal pl-5">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="underline hover:text-gray-900">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        <Section n={1} id="masuk">
          <Steps>
            <li>Buka aplikasi. Sebuah kotak akan meminta password.</li>
            <li>
              Ketik password, lalu tekan <B>Masuk</B>.
            </li>
            <li>
              Kalau muncul tulisan merah “API key tidak valid”, password-nya salah. Ketik
              ulang dengan teliti.
            </li>
          </Steps>
          <p>
            Password cukup dimasukkan sekali di perangkat yang sama. Di bagian atas ada
            tiga menu: <B>Buat Surat</B>, <B>Kelola Kepengurusan</B>, dan <B>Panduan</B>{" "}
            (halaman ini).
          </p>
          <Shot src={shotMasuk} alt="Kotak password yang muncul saat aplikasi pertama kali dibuka" />
        </Section>

        <Section n={2} id="kepengurusan-baru">
          <p>
            Dilakukan <strong>sekali saja</strong> setiap ada kepengurusan baru (misalnya
            tiap pergantian tahun). Kalau kepengurusanmu sudah ada di daftar, lewati
            bagian ini.
          </p>
          <Steps>
            <li>
              Buka menu <B>Kelola Kepengurusan</B>. Pastikan pilihan paling atas adalah{" "}
              <B>+ Buat kepengurusan baru</B>.
            </li>
            <li>
              Isi <B>Nama kepengurusan</B>, contohnya “TPKB ITS 2027”. Nama ini menjadi
              nama folder di Google Drive.
            </li>
            <li>
              Isi <B>Jabatan penanda tangan</B> (contoh: “Ketua TPKB ITS 2027”),{" "}
              <B>Nama Ketua</B>, dan <B>NRP Ketua</B>. Ketiganya dicetak di bagian tanda
              tangan surat.
            </li>
            <li>
              Di bagian <B>Gambar</B>, tekan <B>Choose File</B> lalu pilih gambarnya:
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <B>Tanda tangan Ketua</B> (wajib). Paling bagus berlatar transparan
                  atau putih bersih.
                </li>
                <li>
                  <B>Kop surat (header)</B>. Satu gambar memanjang selebar kertas.
                </li>
                <li>
                  <B>Footer</B> (boleh kosong). Gambar hiasan di bagian bawah kertas.
                </li>
                <li>
                  <B>Stempel</B> (boleh kosong). Kalau kosong, stempel TPKB yang sudah
                  ada yang dipakai.
                </li>
              </ul>
            </li>
            <li>
              Tekan <B>Buat Kepengurusan</B> dan tunggu. Proses ini bisa sampai satu
              menit; jangan tekan tombolnya berkali-kali.
            </li>
          </Steps>
          <Shot src={shotKepengurusanBaru} alt="Formulir Kelola Kepengurusan yang sudah terisi untuk kepengurusan baru" />
          <p>
            Setelah muncul kotak hijau “berhasil dibuat”, aplikasi sudah menyiapkan
            semuanya di Google Drive: folder kepengurusan, spreadsheet arsip yang masih
            kosong, dan folder “Berkas Keluar”. Surat pertama akan bernomor 001.
          </p>
          <Shot src={shotKepengurusanTersimpan} alt="Kotak hijau tanda kepengurusan berhasil dibuat, dengan gambar yang sedang dipakai" />
          <Note>
            Spreadsheet arsip yang baru adalah salinan dari kepengurusan lain dengan isi
            yang sudah dikosongkan. Judul di bagian atasnya (misalnya “DATABASE NOMOR
            BERKAS TPKB ITS 2026”) masih judul lama. Buka spreadsheet itu sekali dan ganti
            judulnya; ini tidak memengaruhi aplikasi.
          </Note>
        </Section>

        <Section n={3} id="buat-surat">
          <Steps>
            <li>
              Buka menu <B>Buat Surat</B>, lalu pilih <B>Kepengurusan</B>. Kotak “Surat
              terakhir” menampilkan nomor surat yang paling akhir tercatat.
            </li>
            <li>
              Sebagian kolom sudah terisi (tanggal, kode, tujuan). Periksa dan ubah
              yang perlu, lalu isi sisanya. Penjelasan tiap kolom ada di daftar di bawah
              gambar.
            </li>
            <li>
              Tekan <B>Lihat Pratinjau Surat</B>. Di langkah ini{" "}
              <strong>belum ada yang disimpan</strong>.
            </li>
          </Steps>
          <Shot src={shotFormSurat} alt="Formulir Buat Surat yang sudah terisi lengkap" />
          <p className="font-medium text-gray-900">Arti setiap kolom</p>
          <dl className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200">
            {FORM_FIELDS.map((f) => (
              <div key={f.name} className="px-4 py-3">
                <dt className="font-medium text-gray-900">{f.name}</dt>
                <dd>{f.meaning}</dd>
                <dd className="text-gray-500">Contoh: {f.example}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section n={4} id="tinjau">
          <Steps>
            <li>
              Surat tampil sebagai PDF. Baca pelan-pelan: nama, tanggal, daftar peserta,
              dan bagian tanda tangan. Tekan <B>Buka di tab baru</B> kalau ingin
              melihatnya lebih besar (di HP, pratinjau kadang hanya bisa dibuka dengan
              cara ini).
            </li>
            <li>
              Ada yang salah? Tekan <B>Perbaiki isian</B>. Kamu kembali ke formulir
              dengan isian yang masih utuh; perbaiki, lalu lihat pratinjau lagi. Boleh
              diulang berapa kali pun, tidak ada nomor surat yang terpakai.
            </li>
            <li>
              Sudah benar? Tekan <B>Surat sudah benar, simpan</B>. Baru di sinilah nomor
              surat dicatat dan PDF disimpan.
            </li>
          </Steps>
          <Shot src={shotTinjau} alt="Halaman Tinjau Surat dengan pratinjau PDF dan dua tombol di bawahnya" />
          <Note>
            Nomor di halaman tinjau adalah <strong>perkiraan</strong>. Kalau ada orang lain
            yang menyimpan surat lebih dulu, suratmu mendapat nomor berikutnya. Nomor yang
            pasti selalu tertulis di halaman “Selesai” dan di PDF yang tersimpan.
          </Note>
          <p>
            Kalau muncul kotak kuning “Surat belum bisa disimpan”, ada data kepengurusan
            yang belum lengkap. Ikuti tautan di kotak itu ke Kelola Kepengurusan.
          </p>
          <Shot src={shotSelesai} alt="Halaman Selesai yang menampilkan nomor surat dan tombol Lihat PDF di Google Drive" />
        </Section>

        <Section n={5} id="arsip">
          <p>Semuanya ada di Google Drive TPKB, di dalam folder kepengurusanmu:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Folder “Berkas Keluar”</strong>: semua PDF surat yang sudah
              disimpan. Tombol <B>Lihat PDF di Google Drive</B> di halaman Selesai
              langsung membuka file-nya.
            </li>
            <li>
              <strong>Spreadsheet arsip</strong>: satu baris untuk setiap surat, berisi
              nomor urut, bulan, tanggal pengajuan, perihal, kode, dan nomor surat
              lengkap. Kotak “ONLINE” di baris itu otomatis tercentang.
            </li>
          </ul>
          <p>
            Kamu tetap boleh menambah baris sendiri di spreadsheet arsip untuk surat yang
            dibuat di luar aplikasi. Pastikan kolom NO. selalu terisi angka, karena
            aplikasi melanjutkan penomoran dari baris terakhir.
          </p>
        </Section>

        <Section n={6} id="arsip-surat">
          <p>
            Buka <B>Arsip Surat</B>, lalu pilih kepengurusan. Semua surat di arsip tampil
            dari yang paling baru, dan bisa dicari lewat nomor, perihal, atau tanggal.
          </p>
          <ul className="list-disc pl-5">
            <li>
              <B>Lihat</B>: menampilkan catatan arsip, isi surat, daftar peserta, dan
              PDF-nya.
            </li>
            <li>
              <B>Edit</B>: membuka formulir yang sudah terisi. Perbaiki isinya, tekan{" "}
              <B>Lihat Pratinjau Surat</B>, periksa, lalu tekan <B>Simpan perubahan</B>.
              Nomor urut tidak berubah (bagian kode dan bulan di nomor surat mengikuti
              isian yang baru). PDF yang lama diganti (yang lama masuk Sampah
              Google Drive) dan baris di spreadsheet arsip ikut diperbarui.
            </li>
            <li>
              <B>Hapus</B>: PDF dipindahkan ke Sampah Google Drive, dari sana masih bisa
              dipulihkan selama 30 hari.
            </li>
          </ul>
          <Note>
            Nomor surat tidak boleh dipakai dua kali. Karena itu, kalau yang dihapus{" "}
            <strong>bukan surat terakhir</strong>, barisnya tetap ada di spreadsheet arsip
            dengan tanda <strong>[DIBATALKAN]</strong> dan nomornya tidak dipakai lagi.
            Hanya kalau yang dihapus adalah <strong>surat terakhir</strong>, barisnya
            dikosongkan dan nomornya dipakai oleh surat berikutnya.
          </Note>
          <p>
            Surat bertanda <B>Hanya lihat</B> adalah surat yang dibuat sebelum ada Arsip
            Surat, atau yang barisnya diisi langsung di spreadsheet. Aplikasi tidak
            menyimpan isinya, jadi surat seperti itu hanya bisa diubah langsung di
            spreadsheet arsip.
          </p>
          <p>
            Isi setiap surat disimpan di tab <strong>“Data Surat”</strong> pada
            spreadsheet arsip. Tab itu diisi otomatis oleh aplikasi; jangan diubah atau
            dihapus, karena tanpa itu surat tidak bisa diedit lagi dari aplikasi.
          </p>
        </Section>

        <Section n={7} id="ubah">
          <p>
            Dipakai saat Ketua berganti, tanda tangan diperbarui, atau desain kop surat
            dan footer berubah.
          </p>
          <Steps>
            <li>
              Buka <B>Kelola Kepengurusan</B>, lalu pilih <B>Ubah: (nama kepengurusan)</B>.
              Data dan gambar yang sedang dipakai akan tampil.
            </li>
            <li>
              Ubah tulisan yang perlu diubah. Untuk mengganti gambar, tekan{" "}
              <B>Choose File</B> di gambar itu saja. Gambar yang tidak dipilih tidak
              berubah.
            </li>
            <li>
              Tekan <B>Simpan Perubahan</B>. Surat berikutnya langsung memakai data baru.
            </li>
          </Steps>
          <Shot src={shotUbah} alt="Kelola Kepengurusan dalam mode Ubah, menampilkan gambar yang sedang dipakai" />
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="mb-1 font-medium text-gray-900">Tips gambar</p>
            <ul className="list-disc pl-5">
              <li>
                Kop surat dan footer ditempel <strong>selebar kertas</strong>, menempel
                di tepi atas dan bawah. Buat gambarnya memanjang, kira-kira 2000 piksel
                lebarnya, supaya tajam saat dicetak.
              </li>
              <li>
                Footer yang tinggi (lebih dari 3 cm) dianggap hiasan latar: teks surat
                boleh berjalan di atas bagian kosongnya.
              </li>
              <li>
                Stempel sebaiknya PNG berlatar transparan, supaya tulisan di bawahnya
                tetap terlihat.
              </li>
              <li>
                Surat yang sudah tersimpan tidak ikut berubah. Hanya surat baru yang
                memakai gambar baru.
              </li>
            </ul>
          </div>
        </Section>

        <Section n={8} id="error">
          <p>
            Pesan error ditulis dengan huruf merah di dekat tombol. Cari pesanmu di
            daftar ini:
          </p>
          <dl className="flex flex-col gap-3">
            {ERRORS.map((e) => (
              <div key={e.message} className="rounded-lg border border-gray-200 px-4 py-3">
                <dt className="font-medium text-red-700">{e.message}</dt>
                <dd className="mt-1">
                  <span className="text-gray-900">Artinya:</span> {e.meaning}
                </dd>
                <dd>
                  <span className="text-gray-900">Yang dilakukan:</span> {e.action}
                </dd>
              </div>
            ))}
          </dl>
          <Note>
            Tombol terasa lama? Itu wajar. Aplikasi perlu menghubungi Google Drive, yang
            bisa memakan 10 sampai 30 detik. Tekan tombol sekali saja dan tunggu sampai
            tulisannya berubah.
          </Note>
        </Section>

        <p>
          Siap mencoba?{" "}
          <Link href="/" className="font-medium text-gray-900 underline">
            Buat surat sekarang
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

function Section({ n, id, children }: { n: number; id: string; children: React.ReactNode }) {
  const title = SECTIONS.find((s) => s.id === id)?.title ?? "";
  return (
    <section id={id} className="flex scroll-mt-4 flex-col gap-3">
      <h2 className="text-base font-semibold text-gray-900">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="flex list-decimal flex-col gap-1.5 pl-5">{children}</ol>;
}

/** Name of a button, menu or field exactly as it appears on screen. */
function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-gray-900">{children}</strong>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
      {children}
    </p>
  );
}

function Shot({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes="(max-width: 672px) 100vw, 608px"
      className="h-auto w-full rounded-lg border border-gray-200"
    />
  );
}
