/* ===================================================
   NEXUS ERP — shared.js
   ฟังก์ชันที่ใช้ร่วมกันทุกหน้า
   =================================================== */

/* ── Canvas Particle Background ── */
function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function createParticles() {
        particles = [];
        const count = Math.floor(W * H / 22000);
        for (let i = 0; i < count; i++)
            particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.2 + .4 });
    }
    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,200,255,0.25)'; ctx.fill();
        });
        particles.forEach((a, i) => {
            particles.slice(i + 1).forEach(b => {
                const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(0,200,255,${0.08 * (1 - dist / 100)})`; ctx.lineWidth = .4; ctx.stroke();
                }
            });
        });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', () => { resize(); createParticles(); });
    resize(); createParticles(); draw();
}

/* ── Toast Notification ── */
let _toastTimer;
function showToast(msg, icon = '✅', isError = false) {
    const t = document.getElementById('toast');
    const msg_ = document.getElementById('toastMsg');
    const ico = document.getElementById('toastIcon');
    if (!t || !msg_ || !ico) return;
    msg_.textContent = msg;
    ico.textContent = icon;
    t.className = 'toast' + (isError ? ' error' : '') + ' show';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── Shared product data (localStorage-backed) ── */
const DEFAULT_PRODUCTS = [
    { id: 1, name: 'สมาร์ทโฟน Samsung A55', sku: 'SAM-A55-001', category: 'อิเล็กทรอนิกส์', icon: '📱', price: 12900, stock: 45, reorder: 10, max: 100 },
    { id: 2, name: 'หูฟัง Sony WH-1000XM5', sku: 'SNY-WH-002', category: 'อิเล็กทรอนิกส์', icon: '🎮', price: 9990, stock: 8, reorder: 10, max: 50 },
    { id: 3, name: 'เสื้อยืด Uniqlo (สีขาว)', sku: 'UNQ-TS-003', category: 'เสื้อผ้า', icon: '👕', price: 490, stock: 0, reorder: 20, max: 200 },
    { id: 4, name: 'โน้ตบุ๊ก ASUS VivoBook 15', sku: 'ASS-VB-004', category: 'อิเล็กทรอนิกส์', icon: '💻', price: 22900, stock: 12, reorder: 5, max: 30 },
    { id: 5, name: 'พิซซ่า Frozen Pepperoni', sku: 'FZN-PZ-005', category: 'อาหาร / เครื่องดื่ม', icon: '🍕', price: 199, stock: 3, reorder: 15, max: 100 },
    { id: 6, name: 'เก้าอี้สำนักงาน Ergonomic', sku: 'ERG-CH-006', category: 'เฟอร์นิเจอร์', icon: '🪑', price: 6500, stock: 7, reorder: 5, max: 20 },
    { id: 7, name: 'แอร์ Daikin 9000 BTU', sku: 'DAK-AC-007', category: 'เครื่องใช้ไฟฟ้า', icon: '🔧', price: 18900, stock: 15, reorder: 3, max: 20 },
    { id: 8, name: 'ครีมกันแดด Anessa SPF50', sku: 'ANS-SS-008', category: 'อื่นๆ', icon: '🧴', price: 750, stock: 55, reorder: 20, max: 150 },
];

function loadProducts() {
    try {
        const raw = localStorage.getItem('nexus_products');
        return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    } catch { return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)); }
}

function saveProducts(products) {
    localStorage.setItem('nexus_products', JSON.stringify(products));
}

function getStatus(p) {
    if (p.stock === 0) return 'out';
    if (p.reorder > 0 && p.stock <= p.reorder) return 'low';
    return 'in';
}