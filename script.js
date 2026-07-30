// ===== 自定义光标 =====
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// 光环延迟跟随
function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// 悬停效果（扩大光圈）
document.querySelectorAll('a, button, .project-card, .lab-item, .devlog-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorRing.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorRing.classList.remove('hover');
    });
});

// ===== 滚动进度条 =====
const scrollProgress = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = progress + '%';
});

// ===== 导航高亮当前板块 =====
const sections = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 180;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// ===== 滚动入场动画（每次进入都触发） =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.closest('.about')) {
                entry.target.querySelectorAll('.skill-fill').forEach(fill => {
                    fill.classList.add('animate');
                });
            }
        } else {
            entry.target.classList.remove('visible');
            if (entry.target.closest('.about')) {
                entry.target.querySelectorAll('.skill-fill').forEach(fill => {
                    fill.classList.remove('animate');
                });
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.panel-header, .project-card, .lab-item, .timeline-item, .devlog-item, .about-text, .skills-section').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ===== 项目卡片 3D 倾斜效果 =====
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = (y - centerY) / centerY * -5;
        const tiltY = (x - centerX) / centerX * 5;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== 键盘方向键导航 =====
document.addEventListener('keydown', (e) => {
    const panels = Array.from(document.querySelectorAll('.panel'));
    const currentIndex = panels.findIndex(p => {
        const rect = p.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
    });

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const next = panels[Math.min(currentIndex + 1, panels.length - 1)];
        next.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = panels[Math.max(currentIndex - 1, 0)];
        prev.scrollIntoView({ behavior: 'smooth' });
    }
});

/* ===== 星河粒子系统 ===== */
(() => {
    'use strict';

    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h, dpr;

    const CONFIG = {
        starCount: 200,
        minSize: 0.5,
        maxSize: 2.2,
        baseSpeed: 0.04,
        twinkleSpeed: 0.025,
        orangeRatio: 0.20,
        codeStarRatio: 0.30,
    };

    const CODE_CHARS = ['{', '}', ';', '<', '>', '/', '=', '(', ')', '[', ']', '*', '&', '|', '0', '1', '+', '-', '#', '!'];

    function resize() {
        dpr = window.devicePixelRatio || 1;
        w = canvas.parentElement.clientWidth;
        h = canvas.parentElement.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < CONFIG.starCount; i++) {
	const edge = Math.random();
	let x, y;
	if (edge < 0.5) { // 上边缘或下边缘 (50%)
    	    x = Math.random() * w;
    	    y = Math.random() < 0.5 ? Math.random() * h * 0.15 : h - Math.random() * h * 0.15;
	} else { // 左边缘或右边缘 (50%)
    	    x = Math.random() < 0.5 ? Math.random() * w * 0.15 : w - Math.random() * w * 0.15;
    	    y = Math.random() * h;
	}
            const isOrange = Math.random() < CONFIG.orangeRatio;
            const isCode = !isOrange && Math.random() < CONFIG.codeStarRatio;
            stars.push({
                x, y,
                r: CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize),
                baseAlpha: 0.4 + Math.random() * 0.6,
                alpha: 0,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: CONFIG.twinkleSpeed + Math.random() * 0.03,
                speedX: (Math.random() - 0.5) * CONFIG.baseSpeed,
                speedY: (Math.random() - 0.5) * CONFIG.baseSpeed * 0.3,
                isOrange,
                isCode,
                codeChar: isCode ? CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)] : '',
            });
        }
    }

    function drawStar(s) {
        s.twinklePhase += s.twinkleSpeed;
        const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
        const alpha = s.baseAlpha * twinkle;

        s.x += s.speedX;
        s.y += s.speedY;

        // 循环边界
        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        if (s.y > h + 10) s.y = -10;

if (s.isCode) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.75;
    ctx.shadowColor = 'rgba(255, 107, 26, 0.4)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = `hsl(25, 90%, 68%)`;
    ctx.font = `${14 + s.r * 6}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 新增：少许旋转（±12°）
    const angle = s._rotAngle || (s._rotAngle = (Math.random() - 0.5) * 0.42);
    ctx.translate(s.x, s.y);
    ctx.rotate(angle);
    ctx.fillText(s.codeChar, 0, 0);
    ctx.restore();
        } else if (s.isOrange) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 26, ${alpha})`;
            ctx.fill();
            const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
            glow.addColorStop(0, `rgba(255, 107, 26, ${alpha * 0.3})`);
            glow.addColorStop(1, 'rgba(255, 107, 26, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(s.x - s.r * 7, s.y - s.r * 7, s.r * 14, s.r * 14);
            ctx.restore();
        } else {
            ctx.save();
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(190, 210, 250, ${alpha})`;
            ctx.fill();
            ctx.restore();
        }
    }

    function animate() {
        // 完全清除画布，消除拖尾
        ctx.clearRect(0, 0, w, h);
        stars.forEach(drawStar);
        requestAnimationFrame(animate);
    }

    resize();
    initStars();
    animate();

    window.addEventListener('resize', () => {
        resize();
        initStars();
    });
})();