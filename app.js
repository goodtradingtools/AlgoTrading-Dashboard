// Konfigurasi Supabase Anda
const _supabase = supabase.createClient('URL_ANDA', 'KEY_ANDA');
const NOMOR_AKUN = 69670609; // Ganti sesuai akun Anda

async function fetchData() {
    // 1. Ambil data Akun Utama
    const { data: account } = await _supabase
        .from('trading_accounts')
        .select('*')
        .eq('account_number', NOMOR_AKUN)
        .single();

    if (account) {
        document.getElementById('acc-name').innerText = account.account_name;
        document.getElementById('acc-num').innerText = account.account_number;
        document.getElementById('balance').innerText = '$' + account.balance.toLocaleString();
        document.getElementById('equity').innerText = '$' + account.equity.toLocaleString();
        document.getElementById('floating').innerText = '$' + account.floating_now.toLocaleString();
        document.getElementById('daily-profit').innerText = (account.profit >= 0 ? '+' : '') + '$' + account.profit.toLocaleString();
        document.getElementById('max-dd').innerText = '$' + account.max_floating_val.toLocaleString();
        document.getElementById('daily-dd').innerText = '$' + account.daily_floating_val.toLocaleString();
        
        // Update Jam WIB
        const rawDate = new Date(account.last_update_wib);
        document.getElementById('last-update').innerText = rawDate.toLocaleTimeString('id-ID');
    }
}

// Jalankan auto-refresh setiap 30 detik
setInterval(fetchData, 30000);
fetchData();
