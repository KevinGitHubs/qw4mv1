// script.js

// Data game
const games = [
    { id: 'mlbb', name: 'Mobile Legends', icon: 'fas fa-chess-queen' },
    { id: 'ff', name: 'Free Fire', icon: 'fas fa-fire' },
    { id: 'pubg', name: 'PUBG Mobile', icon: 'fas fa-crosshairs' },
    { id: 'valorant', name: 'Valorant', icon: 'fas fa-gun' }
];

// Data paket diamond (bisa disesuaikan dengan produk API)
const packs = [
    { id: 'mlbb_86', game: 'mlbb', diamonds: 86, price: 20000 },
    { id: 'mlbb_172', game: 'mlbb', diamonds: 172, price: 40000 },
    { id: 'mlbb_257', game: 'mlbb', diamonds: 257, price: 60000 },
    { id: 'ff_70', game: 'ff', diamonds: 70, price: 15000 },
    { id: 'ff_140', game: 'ff', diamonds: 140, price: 30000 },
    { id: 'ff_355', game: 'ff', diamonds: 355, price: 70000 },
    { id: 'pubg_60', game: 'pubg', diamonds: 60, price: 18000 },
    { id: 'pubg_180', game: 'pubg', diamonds: 180, price: 50000 },
    { id: 'valorant_475', game: 'valorant', diamonds: 475, price: 95000 },
];

// Data metode pembayaran
const payments = [
    { id: 'bca', name: 'BCA Virtual Account', icon: 'fas fa-university' },
    { id: 'mandiri', name: 'Mandiri VA', icon: 'fas fa-university' },
    { id: 'gopay', name: 'GoPay', icon: 'fas fa-mobile-alt' },
    { id: 'ovo', name: 'OVO', icon: 'fas fa-mobile-alt' },
    { id: 'dana', name: 'DANA', icon: 'fas fa-wallet' },
    { id: 'alfamart', name: 'Alfamart', icon: 'fas fa-store' }
];

// State
let selectedGame = null;
let cekTimeout = null;

// Elemen DOM
const gameGrid = document.getElementById('gameGrid');
const topupPanel = document.getElementById('topupPanel');
const panelIcon = document.getElementById('panelIcon');
const panelTitle = document.getElementById('panelTitle');
const userIdInput = document.getElementById('userId');
const zoneIdInput = document.getElementById('zoneId');
const serverInput = document.getElementById('server');
const accountNameDiv = document.getElementById('accountName');
const packContainer = document.getElementById('packContainer');
const selectedPackInput = document.getElementById('selectedPack');
const paymentContainer = document.getElementById('paymentContainer');
const selectedPaymentInput = document.getElementById('selectedPayment');
const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');
const form = document.getElementById('topupForm');

// Render game cards
games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.game = game.id;
    card.innerHTML = `
        <i class="${game.icon}"></i>
        <h3>${game.name}</h3>
    `;
    card.addEventListener('click', () => selectGame(game));
    gameGrid.appendChild(card);
});

// Fungsi pilih game
function selectGame(game) {
    // Hapus class selected dari semua card
    document.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));
    // Tambah class ke card yang dipilih
    const selectedCard = Array.from(document.querySelectorAll('.game-card')).find(
        c => c.dataset.game === game.id
    );
    if (selectedCard) selectedCard.classList.add('selected');

    selectedGame = game;
    panelIcon.className = game.icon;
    panelTitle.textContent = `Topup ${game.name}`;

    // Reset form dan tampilkan panel
    resetForm();
    topupPanel.style.display = 'block';
    window.scrollTo({ top: topupPanel.offsetTop - 20, behavior: 'smooth' });

    // Render paket diamond untuk game ini
    renderPacks(game.id);
}

// Reset form saat ganti game
function resetForm() {
    userIdInput.value = '';
    zoneIdInput.value = '';
    serverInput.value = '';
    accountNameDiv.style.display = 'none';
    accountNameDiv.innerHTML = '';
    selectedPackInput.value = '';
    selectedPaymentInput.value = '';
    // Hapus selected dari pack dan payment
    document.querySelectorAll('.pack-card').forEach(p => p.classList.remove('selected'));
    document.querySelectorAll('.payment-item').forEach(p => p.classList.remove('selected'));
}

// Render paket diamond berdasarkan game
function renderPacks(gameId) {
    const filtered = packs.filter(p => p.game === gameId);
    packContainer.innerHTML = '';
    filtered.forEach(pack => {
        const packEl = document.createElement('div');
        packEl.className = 'pack-card';
        packEl.dataset.id = pack.id;
        packEl.dataset.diamonds = pack.diamonds;
        packEl.dataset.price = pack.price;
        packEl.innerHTML = `
            <div class="diamond">${pack.diamonds} 💎</div>
            <div class="price">Rp ${pack.price.toLocaleString()}</div>
        `;
        packEl.addEventListener('click', () => {
            document.querySelectorAll('.pack-card').forEach(p => p.classList.remove('selected'));
            packEl.classList.add('selected');
            selectedPackInput.value = pack.id;
        });
        packContainer.appendChild(packEl);
    });
}

// Render metode pembayaran
payments.forEach(pay => {
    const payEl = document.createElement('div');
    payEl.className = 'payment-item';
    payEl.dataset.id = pay.id;
    payEl.innerHTML = `
        <i class="${pay.icon}"></i>
        <span>${pay.name}</span>
    `;
    payEl.addEventListener('click', () => {
        document.querySelectorAll('.payment-item').forEach(p => p.classList.remove('selected'));
        payEl.classList.add('selected');
        selectedPaymentInput.value = pay.id;
    });
    paymentContainer.appendChild(payEl);
});

// Cek ID otomatis (dengan debounce)
function cekAkun() {
    const userId = userIdInput.value.trim();
    const zoneId = zoneIdInput.value.trim();
    const server = serverInput.value.trim();

    if (!selectedGame || !userId) {
        accountNameDiv.style.display = 'none';
        return;
    }

    // Tampilkan loading
    accountNameDiv.style.display = 'block';
    accountNameDiv.className = 'account-name';
    accountNameDiv.innerHTML = '<span class="loading"></span> Mencari akun...';

    // Clear timeout sebelumnya
    if (cekTimeout) clearTimeout(cekTimeout);

    // Debounce 500ms
    cekTimeout = setTimeout(async () => {
        try {
            // Panggil Netlify Function untuk cek ID
            const response = await fetch('/.netlify/functions/cek', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game: selectedGame.id,
                    userId,
                    zoneId,
                    server
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                accountNameDiv.className = 'account-name success';
                accountNameDiv.innerHTML = `✅ Nama Akun: ${data.nickname}`;
            } else {
                accountNameDiv.className = 'account-name error';
                accountNameDiv.innerHTML = `❌ ${data.error || 'Akun tidak ditemukan'}`;
            }
        } catch (err) {
            accountNameDiv.className = 'account-name error';
            accountNameDiv.innerHTML = '❌ Gagal menghubungi server';
        }
    }, 500);
}

// Event listener untuk input ID dan zone
userIdInput.addEventListener('input', cekAkun);
zoneIdInput.addEventListener('input', cekAkun);
serverInput.addEventListener('input', cekAkun);

// Submit form topup
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedGame) {
        showResult('Pilih game terlebih dahulu.', 'error');
        return;
    }

    const userId = userIdInput.value.trim();
    const zoneId = zoneIdInput.value.trim();
    const server = serverInput.value.trim();
    const packId = selectedPackInput.value;
    const paymentId = selectedPaymentInput.value;

    if (!userId || !packId || !paymentId) {
        showResult('Harap isi ID, pilih paket diamond, dan metode pembayaran.', 'error');
        return;
    }

    // Cari detail paket
    const pack = packs.find(p => p.id === packId);
    if (!pack) {
        showResult('Paket tidak valid.', 'error');
        return;
    }

    // Disable tombol
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Memproses...';

    try {
        const response = await fetch('/.netlify/functions/topup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game: selectedGame.id,
                userId,
                zoneId,
                server,
                packId,
                diamonds: pack.diamonds,
                price: pack.price,
                payment: paymentId
            })
        });

        const data = await response.json();

        if (response.ok) {
            showResult(`✅ Topup berhasil! Transaksi ID: ${data.transaction_id || '-'}`, 'success');
            // Reset form?
            // resetForm();
        } else {
            showResult(`❌ Gagal: ${data.error || 'Terjadi kesalahan'}`, 'error');
        }
    } catch (err) {
        showResult('❌ Gagal menghubungi server.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Beli Sekarang';
    }
});

function showResult(msg, type) {
    resultDiv.textContent = msg;
    resultDiv.className = type;
    resultDiv.style.display = 'block';
    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 7000);
}