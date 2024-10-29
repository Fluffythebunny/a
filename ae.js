class GlassOverlay {
    constructor() {
        this.positions = [];
        this.maxOverlays = 5;
        this.secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.userInput = [];
        this.init();
    }

    createGlassElement() {
        const glass = document.createElement('div');
        glass.className = 'glass-overlay';
        
        const gif = document.createElement('img');
        gif.src = 'https://github.com/Fluffythebunny/-/blob/fbc52f70bfca8021f5e00dacea1bd1120ff872fe/v0Izhmyv.gif?raw=true';
        glass.appendChild(gif);

        const randomSize = Math.floor(Math.random() * (300 - 150) + 150);
        const x = Math.random() * (window.innerWidth - randomSize);
        const y = Math.random() * (window.innerHeight - randomSize);
        
        glass.style.cssText = `
            position: fixed;
            width: ${randomSize}px;
            height: ${randomSize}px;
            left: 0;
            top: 0;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            transform: translate(${x}px, ${y}px);
            z-index: 1000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            touch-action: none;
            cursor: grab;
        `;

        gif.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            object-fit: cover;
            pointer-events: none;
        `;

        this.makeDraggable(glass);
        return { element: glass, x, y, size: randomSize };
    }

    makeDraggable(element) {
        let pos = { x: 0, y: 0 };
        let vel = { x: 0, y: 0 };
        let lastPos = { x: 0, y: 0 };
        let rotation = 0;
        let angularVel = 0;
        let isDragging = false;
        let animationFrame;

        const getTransform = () => {
            const style = window.getComputedStyle(element);
            const matrix = new WebKitCSSMatrix(style.transform);
            return { x: matrix.m41, y: matrix.m42 };
        };

        const applyPhysics = () => {
            if (!isDragging) {
                vel.x *= 0.95;
                vel.y *= 0.95;
                angularVel *= 0.95;
                
                pos.x += vel.x;
                pos.y += vel.y;
                rotation += angularVel;

                if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1) {
                    angularVel = (vel.x * 0.2);
                }

                if (pos.x < 0 || pos.x > window.innerWidth - element.offsetWidth) {
                    vel.x *= -0.7;
                    angularVel *= -0.7;
                    pos.x = pos.x < 0 ? 0 : window.innerWidth - element.offsetWidth;
                }
                if (pos.y < 0 || pos.y > window.innerHeight - element.offsetHeight) {
                    vel.y *= -0.7;
                    angularVel *= -0.7;
                    pos.y = pos.y < 0 ? 0 : window.innerHeight - element.offsetHeight;
                }

                element.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`;

                if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || Math.abs(angularVel) > 0.1) {
                    animationFrame = requestAnimationFrame(applyPhysics);
                }
            }
        };

        const startDragging = (e) => {
            isDragging = true;
            element.style.cursor = 'grabbing';
            
            const currentTransform = getTransform();
            pos.x = currentTransform.x;
            pos.y = currentTransform.y;
            
            lastPos.x = e.clientX;
            lastPos.y = e.clientY;
            
            cancelAnimationFrame(animationFrame);
        };

        const onDrag = (e) => {
            if (!isDragging) return;

            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;

            pos.x += dx;
            pos.y += dy;

            vel.x = dx;
            vel.y = dy;

            angularVel = dx * 0.2;
            rotation += angularVel;

            lastPos.x = e.clientX;
            lastPos.y = e.clientY;

            element.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`;
        };

        const stopDragging = () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'grab';
                applyPhysics();
            }
        };

        element.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDragging);
        element.addEventListener('dblclick', () => {
            element.style.animation = 'scaleOut 0.3s ease-in forwards';
            setTimeout(() => element.remove(), 300);
        });
    }

    addOverlay() {
        if (this.positions.length >= this.maxOverlays) {
            const oldestOverlay = this.positions.shift();
            oldestOverlay.element.remove();
        }

        const newOverlay = this.createGlassElement();
        document.body.appendChild(newOverlay.element);
        this.positions.push(newOverlay);
    }

    handleKeyPress(event) {
        this.userInput.push(event.key);
        
        if (this.userInput.length > this.secretCode.length) {
            this.userInput.shift();
        }

        if (this.userInput.join(',') === this.secretCode.join(',')) {
            this.addOverlay();
            this.userInput = [];
        }
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        const style = document.createElement('style');
        style.textContent = `
            @keyframes scaleIn {
                from { transform: scale(0) rotate(-180deg); }
                to { transform: scale(1) rotate(0deg); }
            }
            @keyframes scaleOut {
                from { transform: scale(1) rotate(0deg); }
                to { transform: scale(0) rotate(180deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
const glassOverlay = new GlassOverlay();
