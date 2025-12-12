// ============================================
// UI EFFECTS & ANIMATIONS
// ============================================

import { $ } from './utils.js';

let particleAnimationId = null;
let particles = [];
let audioContext = null;

// ============================================
// PARTICLE SYSTEM
// ============================================

export function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: Math.random() * 0.3 + 0.1
    }));
}

export function resizeCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

export function startParticles() {
    if (particleAnimationId) return;
    animateParticles();
}

export function stopParticles() {
    if (particleAnimationId) {
        cancelAnimationFrame(particleAnimationId);
        particleAnimationId = null;
    }
}

function animateParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 10, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.fillStyle = `rgba(5, 217, 232, ${p.size / 3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
        }
        if (p.x < 0 || p.x > canvas.width) {
            p.speedX *= -1;
        }
    });

    particleAnimationId = requestAnimationFrame(animateParticles);
}

// ============================================
// VISUAL EFFECTS
// ============================================

export function createStars() {
    const container = document.getElementById('stars');
    if (!container) return;

    container.innerHTML = Array.from({ length: 80 }, () => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        return star.outerHTML;
    }).join('');
}

export function startVHSTimer() {
    const vhsTime = $('vhs-time');
    if (!vhsTime) return;

    let seconds = 0;
    setInterval(() => {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        vhsTime.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

export function triggerGlitch() {
    const overlay = $('glitch-overlay');
    if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 200);
    }
}

export function triggerScreenFlash() {
    const flash = document.querySelector('.screen-flash');
    if (flash) {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 100);
    }
}

export function showAnnouncer(text, duration = 1500) {
    const announcer = $('announcer');
    const textEl = announcer?.querySelector('.announcer-text');

    if (announcer && textEl) {
        textEl.textContent = text;
        announcer.classList.add('show');
        triggerScreenFlash();
        setTimeout(() => announcer.classList.remove('show'), duration);
    }
}

export function showAchievement(icon, title, desc) {
    const popup = $('achievement-popup');
    if (!popup) return;

    popup.querySelector('.achievement-icon').textContent = icon;
    popup.querySelector('.achievement-title').textContent = title;
    popup.querySelector('.achievement-desc').textContent = desc;

    popup.classList.add('show');
    playSound('achievement');
    setTimeout(() => popup.classList.remove('show'), 4000);
}

export function launchConfetti() {
    const colors = ['#ff2a6d', '#05d9e8', '#ffe66d', '#b537f2', '#39ff14'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

// ============================================
// ENHANCED BATTLE ANIMATIONS
// ============================================

export function showClashAnimation(type = 'random') {
    const overlay = $('glitch-overlay');
    if (!overlay) return;

    const animationTypes = ['lightning', 'explosion', 'laser', 'shockwave', 'pixels'];
    const selectedType = type === 'random' ? animationTypes[Math.floor(Math.random() * animationTypes.length)] : type;

    overlay.setAttribute('data-clash-type', selectedType);
    overlay.classList.add('clash-effect');

    // Screen shake effect
    screenShake(5);

    setTimeout(() => overlay.classList.remove('clash-effect'), 300);
}

export function showCriticalHit() {
    playSound('critical-hit');

    // Strong screen shake
    screenShake(8);

    // Color invert flash
    const screen = document.querySelector('.arcade-screen');
    if (screen) {
        screen.classList.add('critical-flash');
        setTimeout(() => screen.classList.remove('critical-flash'), 150);
    }

    // Glow effect on fighters
    const f1Health = $('f1-health');
    const f2Health = $('f2-health');
    if (f1Health) f1Health.classList.add('critical-glow');
    if (f2Health) f2Health.classList.add('critical-glow');

    setTimeout(() => {
        if (f1Health) f1Health.classList.remove('critical-glow');
        if (f2Health) f2Health.classList.remove('critical-glow');
    }, 400);
}

export function showComboVisual(comboCount) {
    const comboEl = document.querySelector('.combo-counter');
    if (!comboEl) return;

    // Add visual intensity based on combo count
    if (comboCount >= 4) {
        comboEl.classList.add('combo-fire');
    }
    if (comboCount >= 6) {
        comboEl.classList.add('combo-gold');
    }

    // Pulse effect
    comboEl.style.animation = 'none';
    setTimeout(() => {
        comboEl.style.animation = 'comboPulse 0.6s ease-out';
    }, 10);
}

export function screenShake(intensity = 5) {
    const screen = document.querySelector('.arcade-screen');
    if (!screen) return;

    const duration = 200; // ms
    const frequency = 50; // Hz
    const startTime = Date.now();

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            screen.style.transform = 'translate(0, 0)';
            return;
        }

        const progress = 1 - (elapsed / duration);
        const x = (Math.random() - 0.5) * intensity * progress * 2;
        const y = (Math.random() - 0.5) * intensity * progress * 2;

        screen.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(shake);
    }

    shake();
}

// ============================================
// AUDIO
// ============================================

export function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
}

export function playSound(type) {
    const settings = JSON.parse(localStorage.getItem('battleSettings_v2') || '{}');
    if (!settings.sound || !audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    const sounds = {
        start: { freq: 440, duration: 0.1 },
        hit: { freq: 200, duration: 0.05 },
        win: { freq: [523, 659, 784], duration: 0.3 },
        combo: { freq: [440, 554, 659], duration: 0.2 },
        announce: { freq: 880, duration: 0.15 },
        achievement: { freq: [659, 784, 988, 1047], duration: 0.4 },
        'critical-hit': { freq: [100, 150], duration: 0.3 }
    };

    const sound = sounds[type] || sounds.start;

    if (Array.isArray(sound.freq)) {
        sound.freq.forEach((f, i) => {
            setTimeout(() => {
                const o = audioContext.createOscillator();
                const g = audioContext.createGain();
                o.connect(g);
                g.connect(audioContext.destination);
                o.frequency.value = f;
                g.gain.setValueAtTime(0.1, audioContext.currentTime);
                g.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                o.start();
                o.stop(audioContext.currentTime + 0.1);
            }, i * 100);
        });
    } else {
        osc.frequency.value = sound.freq;
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        osc.start();
        osc.stop(audioContext.currentTime + sound.duration);
    }
}
