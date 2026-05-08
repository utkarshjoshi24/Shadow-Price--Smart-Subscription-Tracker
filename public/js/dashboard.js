// Check Auth
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
            window.location.href = '/login';
            return;
        }
        const user = await res.json();
        document.getElementById('userGreeting').innerText = `Hello, ${user.username}`;
        loadDashboard();
    } catch (err) {
        window.location.href = '/login';
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
}

document.getElementById('logoutBtn').addEventListener('click', handleLogout);
document.getElementById('changeUserBtn').addEventListener('click', handleLogout);

// View Switching Logic
const sidebarNav = document.getElementById('sidebarNav');
const views = document.querySelectorAll('.view-section');

sidebarNav.addEventListener('click', (e) => {
    if(e.target.tagName === 'A') {
        e.preventDefault();
        const targetViewId = 'view-' + e.target.getAttribute('data-view');
        
        // if no data-view, ignore for now
        if(!e.target.getAttribute('data-view')) return;

        // Update active class
        sidebarNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        e.target.classList.add('active');

        // Toggle views
        views.forEach(view => {
            if(view.id === targetViewId) {
                view.classList.remove('hidden-view');
            } else {
                view.classList.add('hidden-view');
            }
        });
    }
});

// Search Filter Logic
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.sub-item');
    items.forEach(item => {
        const name = item.querySelector('.sub-name').innerText.toLowerCase();
        if(name.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
if(localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', (e) => {
    if(e.target.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
});

async function loadDashboard() {
    await fetchAnalytics();
    await fetchSubscriptions();
}

let categoryChartInstance = null;

async function fetchAnalytics() {
    try {
        const res = await fetch('/api/subscriptions/analytics');
        const data = await res.json();
        document.getElementById('monthlyTotal').innerText = `₹${data.monthlyTotal}`;
        document.getElementById('yearlyWasted').innerText = `₹${data.moneyWastedThisYear}`;
        document.getElementById('fiveYearTotal').innerText = `₹${data.fiveYearTotal}`;
        
        // Health Score
        const healthScoreEl = document.getElementById('healthScore');
        const healthMsgEl = document.getElementById('healthMessage');
        healthScoreEl.innerText = `${data.healthScore}/100`;
        if(data.healthScore >= 80) {
            healthScoreEl.style.color = 'var(--accent)';
            healthMsgEl.innerText = "Highly Efficient!";
        } else if(data.healthScore >= 50) {
            healthScoreEl.style.color = '#ffaa00';
            healthMsgEl.innerText = "Needs Optimization.";
        } else {
            healthScoreEl.style.color = 'var(--danger)';
            healthMsgEl.innerText = "Money Leakage Detected!";
        }

        // Render Chart
        renderChart(data.categoryBreakdown);
    } catch (err) {
        console.error('Failed to load analytics', err);
    }
}

function renderChart(categoryBreakdown) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const labels = Object.keys(categoryBreakdown);
    const values = Object.values(categoryBreakdown);

    if(categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#8a2be2', '#00f0ff', '#ff2a5f', '#ffaa00', '#00ff7f'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom', labels: { color: '#ffffff', font: { family: 'Outfit' } } }
            },
            cutout: '70%'
        }
    });
}

function getLogoUrl(name) {
    const domainMap = {
        'netflix': 'netflix.com',
        'spotify premium': 'spotify.com',
        'spotify': 'spotify.com',
        'aws cloud': 'aws.amazon.com',
        'adobe creative cloud': 'adobe.com',
        'gym membership': 'anytimefitness.com', // just a placeholder
        'chatgpt plus': 'openai.com',
        'apple music': 'apple.com',
        'google one': 'google.com'
    };
    
    const key = name.toLowerCase().trim();
    if (domainMap[key]) {
        return `https://logo.clearbit.com/${domainMap[key]}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d333b&color=fff&bold=true`;
}

async function fetchSubscriptions() {
    try {
        const res = await fetch('/api/subscriptions');
        const subs = await res.json();
        
        const list = document.getElementById('subsList');
        list.innerHTML = '';

        if (subs.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No subscriptions yet. Add one!</div>';
            return;
        }

        subs.forEach(sub => {
            const date = new Date(sub.nextRenewal).toLocaleDateString();
            const usageClass = sub.usageStatus === 'Unused' ? 'color: var(--danger); font-weight: bold;' : (sub.usageStatus === 'Rarely Used' ? 'color: #ffaa00;' : 'color: var(--accent);');
            
            // Cancel action alert
            let actionAlert = '';
            if(sub.usageStatus === 'Unused' || sub.usageStatus === 'Rarely Used') {
                actionAlert = `<button onclick="deleteSub('${sub._id}')" class="btn btn-danger" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; margin-top: 5px; animation: pulse 2s infinite;">CANCEL NOW</button>`;
            } else {
                actionAlert = `<button onclick="deleteSub('${sub._id}')" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem;">Stop Tracking</button>`;
            }

            const logoUrl = getLogoUrl(sub.name);

            const div = document.createElement('div');
            div.className = 'sub-item glass';
            div.innerHTML = `
                <div class="sub-info-wrapper">
                    <img src="${logoUrl}" class="sub-logo" alt="${sub.name} logo" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=2d333b&color=fff';">
                    <div class="sub-info">
                        <div class="sub-name">${sub.name} <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); margin-left: 5px;">${sub.category}</span></div>
                        <div class="sub-meta">Renews on: ${date} • ${sub.billingCycle} • <span style="${usageClass}">${sub.usageStatus}</span></div>
                        <div class="sub-actions">
                            ${actionAlert}
                        </div>
                    </div>
                </div>
                <div class="sub-price">₹${sub.price}</div>
            `;
            list.appendChild(div);
        });
    } catch (err) {
        console.error('Failed to load subscriptions', err);
    }
}

document.getElementById('addSubForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = 'Adding...';

    const sub = {
        name: document.getElementById('subName').value,
        price: parseFloat(document.getElementById('subPrice').value),
        billingCycle: document.getElementById('subCycle').value,
        category: document.getElementById('subCategory').value,
        usageStatus: document.getElementById('subUsageStatus').value,
        nextRenewal: document.getElementById('subDate').value
    };

    try {
        const res = await fetch('/api/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub)
        });

        if (res.ok) {
            e.target.reset();
            loadDashboard();
        }
    } catch (err) {
        console.error(err);
    } finally {
        btn.innerText = 'Track Subscription';
    }
});

async function deleteSub(id) {
    if(!confirm('Are you sure you want to stop tracking this subscription?')) return;
    try {
        await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
        loadDashboard();
    } catch (err) {
        console.error(err);
    }
}

// Init
checkAuth();
