const SUPABASE_URL = 'https://dbkbxiyhvomjamtdnfuf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRia2J4aXlodm9tamFtdGRuZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTI4NDYsImV4cCI6MjA5MDk2ODg0Nn0.W_nSLLHa1q_yvH76Rqy82E577TMtYH1Gk20wXOEe1F0';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variable global untuk menyimpan grafik agar bisa dihapus/update
let myChart = null;

// --- 2. FUNGSI UNTUK MENAMPILKAN GRAFIK (DI MODAL) ---
async function showGrowthChart(accNumber, accName) {
    const modal = document.getElementById('chartModal');
    modal.style.display = "block";
    document.getElementById('modalTitle').innerText = `Growth: ${accName}`;

    // Ambil data history dari tabel profit_history
    const { data: history, error } = await _supabase
        .from('profit_history')
        .select('report_date, balance_value')
        .eq('account_number', accNumber)
        .order('report_date', { ascending: true });

    if (error) {
        console.error("Error fetching history:", error);
        return;
    }

    // Siapkan label (tanggal) dan data (balance)
    const labels = history.map(h => {
        const d = new Date(h.report_date);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    });
    const values = history.map(h => h.balance_value);

    // Hancurkan chart lama jika ada agar tidak tumpang tindih
    if (myChart) { myChart.destroy(); }

    const ctx = document.getElementById('growthChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Balance ($)',
                data: values,
                borderColor: '#00ffbd',
                backgroundColor: 'rgba(0, 255, 189, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#00ffbd'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#2b3139' }, ticks: { color: '#848e9c' } },
                x: { grid: { display: false }, ticks: { color: '#848e9c' } }
            }
        }
    });
}

// --- 3. FUNGSI UPDATE DASHBOARD UTAMA ---
async function updateDashboard() {
    const { data: accounts, error } = await _supabase
        .from('trading_accounts')
        .select('*')
        .order('last_update', { ascending: false });

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    const grid = document.getElementById('accounts-grid');
    document.getElementById('account-count').innerText = accounts.length;
    grid.innerHTML = ''; 

    accounts.forEach(acc => {
        // Proteksi data null
        const equity = (acc.equity ?? 0).toLocaleString();
        const balance = (acc.balance ?? 0).toLocaleString();
        const profit = (acc.profit ?? 0).toLocaleString();
        const floating = (acc.floating_now ?? 0).toLocaleString();
        const maxDD = (acc.max_floating_val ?? 0).toLocaleString();
        
        const isProfit = (acc.profit ?? 0) >= 0;
        const isFloatingPos = (acc.floating_now ?? 0) >= 0;

        // Format waktu ke WIB
        const updateTime = new Date(acc.last_update).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta' 
        });

        // Template kartu (Menambahkan event onclick untuk panggil grafik)
        const card = `
            <div class="card-account" onclick="showGrowthChart('${acc.account_number}', '${acc.account_name || 'Account'}')">
                <div class="card-header">
                    <div>
                        <span class="acc-name">${acc.account_name || 'Unnamed Account'}</span>
                        <span class="acc-num mono">#${acc.account_number}</span>
                    </div>
                    <span class="time-tag mono">${updateTime} WIB</span>
                </div>

                <div class="main-info">
                    <div>
                        <label>Equity</label>
                        <span class="val mono">$${equity}</span>
                    </div>
                    <div style="text-align: right;">
                        <label>Daily Profit</label>
                        <span class="val mono ${isProfit ? 'profit' : 'loss'}">
                            ${isProfit ? '+' : ''}$${profit}
                        </span>
                    </div>
                </div>

                <div class="sub-stats">
                    <div class="stat-box">
                        <small>Balance</small>
                        <span class="mono">$${balance}</span>
                    </div>
                    <div class="stat-box">
                        <small>Floating</small>
                        <span class="mono ${isFloatingPos ? 'profit' : 'loss'}">$${floating}</span>
                    </div>
                    <div class="stat-box">
                        <small>Max DD</small>
                        <span class="mono loss">$${maxDD}</span>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// --- 4. LOGIKA MODAL (TUTUP POP-UP) ---
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('chartModal');
    const closeBtn = document.querySelector('.close-btn');

    // Pakai IF agar tidak error jika tombol belum ada
    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = "none"; };
    }
    
    if (modal) {
        window.onclick = (event) => {
            if (event.target == modal) { modal.style.display = "none"; }
        };
    }

    // PAKSA JALANKAN UPDATE DASHBOARD
    updateDashboard();
    setInterval(updateDashboard, 30000);
});
