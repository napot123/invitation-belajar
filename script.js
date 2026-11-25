// ==========================================
// 1. Inisialisasi Supabase
// ==========================================
const SUPABASE_URL = 'https://xezsvnovpxqeecwpknwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JranbNTHvR5FIFeasH2KGw_fkbn2Hqb';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ==========================================
// 2. Baca Parameter URL
// ==========================================
const params = new URLSearchParams(window.location.search);
const to = params.get('to') || params.get('nama') || 'Bapak/Ibu Tamu Undangan';
const instansi = params.get('instansi') || 'Mitra Edu Fair & Career Day';
const kategori = params.get('kategori') || 'Tamu Undangan';

document.getElementById('recipient-name').textContent = to;
document.getElementById('recipient-instansi').textContent = instansi;
document.getElementById('recipient-kategori').textContent = kategori;

if (to !== 'Bapak/Ibu Tamu Undangan') {
    document.getElementById('rsvp-nama').value = to;
}
if (instansi !== 'Mitra Edu Fair & Career Day') {
    document.getElementById('rsvp-instansi').value = instansi;
}

// ==========================================
// 3. Kontrol Musik (The Script - Hall of Fame)
// ==========================================
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');
let manualPaused = false;

function updateMusicButton() {
    if (!musicBtn || !bgMusic) return;
    if (bgMusic.paused) {
        musicBtn.textContent = 'Putar Musik';
        musicBtn.classList.add('paused');
    } else {
        musicBtn.textContent = 'Jeda Musik';
        musicBtn.classList.remove('paused');
    }
}

if (bgMusic && musicBtn) {
    bgMusic.volume = 0.6;

    // Sinkronisasi otomatis saat audio play/pause
    bgMusic.addEventListener('play', updateMusicButton);
    bgMusic.addEventListener('pause', updateMusicButton);

    // Coba putar otomatis
    bgMusic.play().then(updateMusicButton).catch(updateMusicButton);

    // Browser policy: putar saat user pertama kali mengklik atau menyentuh layar
    const startAudio = () => {
        if (bgMusic.paused && !manualPaused) {
            bgMusic.play().then(updateMusicButton).catch(() => {});
        }
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
    };

    document.addEventListener('click', startAudio, { passive: true });
    document.addEventListener('touchstart', startAudio, { passive: true });

    // Tombol Putar / Jeda
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgMusic.paused) {
            manualPaused = false;
            bgMusic.play().then(updateMusicButton).catch(err => {
                console.warn('Gagal memutar audio:', err);
            });
        } else {
            manualPaused = true;
            bgMusic.pause();
            updateMusicButton();
        }
    });
}

// ==========================================
// 4. Form RSVP (Langsung ke Supabase)
// ==========================================
const rsvpForm = document.getElementById('rsvp-form');
const rsvpAlert = document.getElementById('rsvp-success');
const rsvpSummary = document.getElementById('rsvp-summary');
const submitBtn = rsvpForm ? rsvpForm.querySelector('button[type="submit"]') : null;

if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nama = document.getElementById('rsvp-nama').value.trim();
        const instansiVal = document.getElementById('rsvp-instansi').value.trim();
        const status = document.getElementById('rsvp-status').value;
        const pesan = document.getElementById('rsvp-pesan').value.trim();

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';
        }

        const { error } = await supabase.from('rsvp').insert([{
            nama: nama,
            instansi: instansiVal,
            kategori: kategori,
            status: status,
            pesan: pesan || null
        }]);

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kirim Konfirmasi';
        }

        if (error) {
            alert('Gagal mengirim RSVP: ' + error.message);
            return;
        }

        if (rsvpAlert && rsvpSummary) {
            rsvpSummary.textContent = `Terima kasih, konfirmasi kehadiran atas nama "${nama}" (${status}) berhasil terkirim!`;
            rsvpAlert.classList.remove('hidden');
        }

        document.getElementById('rsvp-pesan').value = '';
    });
}
