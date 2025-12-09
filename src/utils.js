// ============================================
// DOM HELPERS & UTILITIES
// ============================================

export const $ = (id) => document.getElementById(id);
export const $$ = (sel) => document.querySelectorAll(sel);

export function switchScreen(name, screens) {
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });
    if (screens[name]) screens[name].classList.add('active');
}

export function showError(msg) {
    const el = $('error-msg');
    if (el) el.textContent = msg;
}

export function updateProgress(pct, status) {
    const bar = $('progress-bar');
    const pctEl = $('progress-pct');
    const statusEl = $('progress-status');

    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (statusEl) statusEl.textContent = status || '';
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

export function updateURL(p1, p2) {
    const params = new URLSearchParams();
    if (p1) params.set('p1', p1);
    if (p2) params.set('p2', p2);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', url);
}

export function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const p1 = params.get('p1');
    const p2 = params.get('p2');

    if (p1 && p2) {
        $('player1').value = p1;
        $('player2').value = p2;
        return { p1, p2 };
    }
    return null;
}
