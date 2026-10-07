/* ============================================
   BUILDEASY — Smart Company Search
   Supports: Name / Location / Pincode / Proximity
   ============================================ */

const API_BASE = 'http://localhost:5000/api';

let userLat = null;
let userLng = null;

/* ─── On Page Load: auto-detect location silently ─── */
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                markDetected();
                // Auto-load nearby companies on first visit
                const q = document.getElementById('smartSearch').value.trim();
                if (!q) runSearch();
            },
            () => { /* Silent fail — user must search manually */ }
        );
    }

    // Allow Enter key to trigger search
    document.getElementById('smartSearch').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runSearch();
    });

    // Live search mode hint as user types
    document.getElementById('smartSearch').addEventListener('input', updateModeBadge);
});

/* ─── Quick-set from hint chips ─── */
function setSearch(value) {
    document.getElementById('smartSearch').value = value;
    updateModeBadge();
    runSearch();
}

/* ─── Detect Location ─── */
function detectLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    const btn = document.getElementById('btnDetect');
    btn.textContent = '⏳';
    btn.title = 'Detecting…';

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            markDetected();
            // If search box is empty, immediately show nearby
            const q = document.getElementById('smartSearch').value.trim();
            if (!q) runSearch();
        },
        (err) => {
            alert('Location detection failed: ' + err.message);
            btn.textContent = '📍';
            btn.title = 'Detect My Location';
            btn.classList.remove('detected');
        }
    );
}

function markDetected() {
    const btn = document.getElementById('btnDetect');
    btn.textContent = '✅';
    btn.title = 'Location detected';
    btn.classList.add('detected');
}

/* ─── Determine search mode from input ─── */
function classifyInput(q) {
    if (!q) return 'proximity';
    if (/^\d{6}$/.test(q)) return 'pincode';
    return 'text';
}

/* ─── Update the hint badge ─── */
function updateModeBadge() {
    const q = document.getElementById('smartSearch').value.trim();
    const badge = document.getElementById('searchModeBadge');
    const text = document.getElementById('searchModeText');
    const mode = classifyInput(q);

    const labels = {
        text: '🔤 Name / Location',
        pincode: '🔢 Pincode',
        proximity: userLat ? '📡 Nearby' : '📡 Proximity',
    };

    badge.style.display = 'flex';
    text.textContent = labels[mode];
}

/* ─── Main Search Function ─── */
async function runSearch() {
    const q = document.getElementById('smartSearch').value.trim();
    const filterMaterial = document.getElementById('filterMaterial').value;
    const radius = document.getElementById('filterRadius').value;
    const grid = document.getElementById('resultsGrid');
    const countEl = document.getElementById('resultsCount');
    const heading = document.getElementById('resultsHeading');

    // Update mode badge
    updateModeBadge();

    // Show loading
    grid.innerHTML = '<div class="empty-results"><div class="emoji">⏳</div><h3>Searching…</h3><p>Please wait</p></div>';
    countEl.style.display = 'none';

    // Build API URL
    let url = `${API_BASE}/companies/search?`;
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (userLat && userLng) url += `lat=${userLat}&lng=${userLng}&`;
    url += `radius=${radius}`;

    try {
        const res = await fetch(url);
        const result = await res.json();

        if (!res.ok || !result.success) {
            grid.innerHTML = `<div class="empty-results"><div class="emoji">❌</div><h3>Error</h3><p>${result.message || 'Search failed.'}</p></div>`;
            return;
        }

        let companies = result.data;

        // Client-side material filtering (if material filter set)
        // We check after loading expanded materials later; for now filter by category names fetched
        // (actual material filter is applied when rendering cards — hide those cards that don't have the material)

        const mode = result.searchMode;
        const modeLabels = {
            text: `Results for "${q}"`,
            pincode: `Companies in Pincode ${q}`,
            proximity: 'Nearby Companies',
            all: 'All Companies',
        };
        heading.textContent = modeLabels[mode] || 'Results';

        if (companies.length === 0) {
            grid.innerHTML = '<div class="empty-results"><div class="emoji">🔍</div><h3>No companies found</h3><p>Try a different name, area, city, or pincode.</p></div>';
            countEl.style.display = 'none';
            return;
        }

        countEl.textContent = `${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'} found`;
        countEl.style.display = 'inline-block';

        grid.innerHTML = companies.map((c, i) => buildCard(c, i)).join('');

        // Fetch materials for all cards and apply material filter
        await Promise.all(companies.map((c, i) => preloadMaterials(c._id, i, filterMaterial)));

    } catch (error) {
        grid.innerHTML = '<div class="empty-results"><div class="emoji">⚠️</div><h3>Connection Error</h3><p>Could not reach the server. Make sure it is running on localhost:5000.</p></div>';
    }
}

/* ─── Build a company result card ─── */
function buildCard(c, i) {
    const locationLine = [c.locationName, c.city].filter(Boolean).join(', ');
    const distTag = c.distanceKm != null
        ? `<span class="distance-badge">📍 ${c.distanceKm} km away</span>`
        : '';
    const pinTag = c.pinCode
        ? `<span class="pincode-tag">📮 ${c.pinCode}</span>`
        : '';

    return `
    <div class="company-card" id="company-${i}" data-company-id="${c._id}">
        <div class="card-top">
            <span class="card-badge">✅ Verified Supplier</span>
            ${distTag}
        </div>
        <h3>${escHtml(c.name)}</h3>
        ${locationLine ? `<div class="meta"><span class="meta-icon">📍</span>${escHtml(locationLine)}</div>` : ''}
        ${c.address ? `<div class="meta"><span class="meta-icon">🏠</span>${escHtml(c.address)}</div>` : ''}
        ${c.phone ? `<div class="meta"><span class="meta-icon">📞</span>${escHtml(c.phone)}</div>` : ''}
        ${pinTag}
        <div class="mat-types" id="mat-pills-${i}">
            <span class="mat-pill" style="background:#e2e8f0;color:#94a3b8;font-style:italic;">Loading materials…</span>
        </div>
        <button class="btn-materials" onclick="toggleMaterials('${c._id}', ${i})">
            📦 View Materials
        </button>
        <div class="materials-expand" id="materials-${i}">
            <h4>Available Materials &amp; Prices</h4>
            <div class="mat-list" id="mat-list-${i}">Loading…</div>
        </div>
    </div>`;
}

/* ─── Pre-load materials on render + populate pills ─── */
async function preloadMaterials(companyId, index, materialFilter) {
    try {
        const res = await fetch(`${API_BASE}/companies/${companyId}/materials`);
        const result = await res.json();

        if (!result.success) return;

        const materials = result.data;
        const pillsEl = document.getElementById(`mat-pills-${index}`);
        const listEl = document.getElementById(`mat-list-${index}`);
        const card = document.getElementById(`company-${index}`);

        // Populate pills
        if (pillsEl) {
            const types = [...new Set(materials.map(m => m.category || m.name).filter(Boolean))];
            pillsEl.innerHTML = types.length
                ? types.slice(0, 5).map(t => `<span class="mat-pill">${escHtml(t)}</span>`).join('')
                : '<span class="mat-pill" style="color:#94a3b8;font-style:italic;">No materials listed</span>';
        }

        // Populate expandable list
        if (listEl) {
            listEl.innerHTML = materials.length
                ? materials.map(m => `
                    <div class="mat-item">
                        <span class="mat-name">${escHtml(m.name)} <span style="color:#94a3b8;font-size:11px;">(${escHtml(m.category || '—')})</span></span>
                        <span class="mat-price">₹${Number(m.price).toLocaleString('en-IN')}/${m.unit || 'unit'}</span>
                    </div>`).join('')
                : '<p style="color:#94a3b8;font-size:13px;">No approved materials listed yet.</p>';
        }

        // Apply material filter — hide card if selected material not found
        if (materialFilter && card) {
            const hasType = materials.some(m =>
                (m.category || '').toLowerCase() === materialFilter.toLowerCase() ||
                (m.name || '').toLowerCase().includes(materialFilter.toLowerCase())
            );
            card.style.display = hasType ? '' : 'none';
        }

    } catch (_) {
        const pillsEl = document.getElementById(`mat-pills-${index}`);
        if (pillsEl) pillsEl.innerHTML = '';
    }
}

/* ─── Toggle Materials Expand ─── */
async function toggleMaterials(companyId, index) {
    const expand = document.getElementById(`materials-${index}`);
    expand.classList.toggle('open');
}

/* ─── Escape HTML ─── */
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
