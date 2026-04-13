const API_BASE = 'http://localhost:8085/certifications';

// State
let certifications = [];
let currentView = 'dashboard';
let searchTerm = '';
let sortBy = 'id';
let sortDir = 'asc';

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const certTableBody = document.getElementById('certTableBody');
const certModal = document.getElementById('certModal');
const certForm = document.getElementById('certForm');
const modalTitle = document.getElementById('modalTitle');

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = item.getAttribute('data-view');
        if (viewName) switchView(viewName);
    });
});

function switchView(viewName) {
    currentView = viewName;
    views.forEach(view => {
        view.classList.add('hidden');
        if (view.id === `${viewName}View`) view.classList.remove('hidden');
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) item.classList.add('active');
    });

    if (viewName === 'certifications') fetchData();
    if (viewName === 'dashboard') updateDashboard();
}

// Fetch Data
async function fetchData() {
    try {
        const url = `${API_BASE}?search=${searchTerm}&sortBy=${sortBy}&direction=${sortDir}`;
        const response = await fetch(url);
        certifications = await response.json();
        renderTable();
        if (currentView === 'dashboard') updateDashboard();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback or error UI
    }
}

function renderTable() {
    certTableBody.innerHTML = certifications.map(cert => `
        <tr>
            <td>#${cert.id}</td>
            <td>
                <div class="name-cell">
                    <strong>${cert.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted)">${cert.ownerEmail || ''}</div>
                </div>
            </td>
            <td><span class="badge">${cert.version || 'N/A'}</span></td>
            <td>${cert.issueDate || '—'}</td>
            <td>${cert.expiryDate || '—'}</td>
            <td>
                <button class="btn-action edit" onclick="openEditModal(${cert.id})">✏️</button>
                <button class="btn-action delete" onclick="deleteCert(${cert.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function updateDashboard() {
    const total = certifications.length;
    const active = certifications.length; // Simplified for demo
    const expiring = certifications.filter(c => {
        if (!c.expiryDate) return false;
        const expiry = new Date(c.expiryDate);
        const now = new Date();
        const diff = (expiry - now) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff < 30;
    }).length;

    document.getElementById('statTotalCertifications').textContent = total;
    document.getElementById('statActiveCertifications').textContent = active;
    document.getElementById('statExpiringSoon').textContent = expiring;

    const activityList = document.getElementById('activityList');
    activityList.innerHTML = certifications.slice(0, 3).map(cert => `
        <div class="activity-item" style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem;">
            <div style="background: var(--primary); width: 10px; height: 10px; border-radius: 50%;"></div>
            <div>
                <strong>${cert.name}</strong> was issued/updated.
                <div style="font-size: 0.8rem; color: var(--text-muted)">Just now</div>
            </div>
        </div>
    `).join('') || '<div class="activity-item">No recent activity</div>';
}

// CRUD Operations
async function deleteCert(id) {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        fetchData();
    } catch (error) {
        console.error('Error deleting:', error);
    }
}

function openModal() {
    modalTitle.textContent = 'Add Certification';
    certForm.reset();
    document.getElementById('certId').value = '';
    certModal.classList.remove('hidden');
}

function openEditModal(id) {
    const cert = certifications.find(c => c.id === id);
    if (!cert) return;
    
    modalTitle.textContent = 'Edit Certification';
    document.getElementById('certId').value = cert.id;
    document.getElementById('name').value = cert.name;
    document.getElementById('description').value = cert.description || '';
    document.getElementById('version').value = cert.version || '';
    document.getElementById('validityDays').value = cert.validityDays || 365;
    document.getElementById('issueDate').value = cert.issueDate || '';
    document.getElementById('expiryDate').value = cert.expiryDate || '';
    document.getElementById('ownerEmail').value = cert.ownerEmail || '';
    
    certModal.classList.remove('hidden');
}

function closeModal() {
    certModal.classList.add('hidden');
}

certForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('certId').value;
    const certData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        version: document.getElementById('version').value,
        validityDays: document.getElementById('validityDays').value,
        issueDate: document.getElementById('issueDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        ownerEmail: document.getElementById('ownerEmail').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE}/${id}` : API_BASE;
        
        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(certData)
        });
        
        closeModal();
        fetchData();
    } catch (error) {
        console.error('Error saving:', error);
    }
});

// Search & Sort Handlers
window.handleSearch = () => {
    searchTerm = document.getElementById('certSearch').value;
    fetchData();
};

window.handleSort = () => {
    sortBy = document.getElementById('sortBy').value;
    sortDir = document.getElementById('sortDir').value;
    fetchData();
};

// Global Search (simplified)
document.getElementById('globalSearch').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    if (currentView !== 'certifications') switchView('certifications');
    document.getElementById('certSearch').value = searchTerm;
    fetchData();
});

// Init
fetchData();
updateDashboard();
window.openModal = openModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.deleteCert = deleteCert;
