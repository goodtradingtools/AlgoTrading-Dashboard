const SUPABASE_URL = 'https://dbkbxiyhvomjamtdnfuf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRia2J4aXlodm9tamFtdGRuZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTI4NDYsImV4cCI6MjA5MDk2ODg0Nn0.W_nSLLHa1q_yvH76Rqy82E577TMtYH1Gk20wXOEe1F0';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    grid.innerHTML = ''; // Clear loading state

    accounts.forEach(acc => {
        const isProfit = acc.profit >= 0;
        const isFloatingPos = acc.floating_now >= 0;

        // Format tanggal/jam dari kolom last_update_wib
        const updateTime = new Date(acc.last_update).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const card = `
            <div class="card-account">
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
                        <span class="val mono">$${acc.equity.toLocaleString()}</span>
                    </div>
                    <div style="text-align: right;">
                        <label>Daily Profit</label>
                        <span class="val mono ${isProfit ? 'profit' : 'loss'}">
                            ${isProfit ? '+' : ''}$${acc.profit.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div class="sub-stats">
                    <div class="stat-box">
                        <small>Balance</small>
                        <span class="mono">$${acc.balance.toLocaleString()}</span>
                    </div>
                    <div class="stat-box">
                        <small>Floating</small>
                        <span class="mono ${isFloatingPos ? 'profit' : 'loss'}">$${acc.floating_now.toLocaleString()}</span>
                    </div>
                    <div class="stat-box">
                        <small>Max DD</small>
                        <span class="mono loss">$${acc.max_floating_val.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// Jalankan update pertama kali
updateDashboard();

// Refresh data setiap 30 detik agar hemat kuota Supabase tapi tetap real-time
setInterval(updateDashboard, 30000);
