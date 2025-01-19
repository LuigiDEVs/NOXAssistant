import { AudioManager } from './audio-manager.js';
import { setupSocket } from './socket.js';

// Create a logging system that preserves the original console context
const logger = {
    originalConsole: {
        log: console.log.bind(console),
        error: console.error.bind(console),
        warn: console.warn.bind(console)
    },

    addLogEntry(type, ...args) {
        const logsList = document.getElementById('logs');
        if (!logsList) return;
        
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const time = new Date().toLocaleTimeString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join(' ');
        
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-type-${type}">${message}</span>
        `;
        
        logsList.insertBefore(entry, logsList.firstChild);
        
        // Keep only the last 50 logs
        while (logsList.children.length > 50) {
            logsList.removeChild(logsList.lastChild);
        }
        
        // Call original console method
        const method = type === 'info' ? 'log' : type;
        if (this.originalConsole[method]) {
            this.originalConsole[method].apply(console, args);
        }
    },

    log: function(...args) {
        this.addLogEntry('info', ...args);
    },

    error: function(...args) {
        this.addLogEntry('error', ...args);
    },

    warn: function(...args) {
        this.addLogEntry('warn', ...args);
    }
};

// Bind the methods to ensure proper 'this' context
logger.log = logger.log.bind(logger);
logger.error = logger.error.bind(logger);
logger.warn = logger.warn.bind(logger);

// Override console methods
console.log = logger.log;
console.error = logger.error;
console.warn = logger.warn;

document.addEventListener('DOMContentLoaded', async () => {
    const socket = setupSocket();
    const audioManager = new AudioManager(socket);
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const avatarContainer = document.getElementById('avatar-container');
    const soundWave = document.querySelector('.sound-wave');
    const conversation = document.getElementById('conversation');
    
    // Handle smooth scrolling for navigation links
    document.querySelectorAll('.navbar-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.navbar-links a').forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            const href = this.getAttribute('href');
            
            // Special handling for Home link
            if (href === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            // Handle other navigation links
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Initialize FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        // Set initial height to 0
        answer.style.maxHeight = '0px';
        
        question.addEventListener('click', () => {
            // Toggle active state
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    otherAnswer.style.maxHeight = '0px';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Toggle answer visibility with smooth animation
            if (!isActive) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            } else {
                answer.style.maxHeight = '0px';
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Initialize sound wave animation
    const bars = soundWave.querySelectorAll('span');
    let animationFrameId = null;
    
    function updateSoundWave() {
        bars.forEach(bar => {
            const height = Math.random() * 40 + 10;
            bar.style.height = `${height}px`;
        });
        animationFrameId = requestAnimationFrame(updateSoundWave);
    }
    
    function startSpeakingAnimation() {
        avatarContainer.classList.add('avatar-speaking');
        soundWave.style.display = 'flex';
        updateSoundWave();
    }
    
    function stopSpeakingAnimation() {
        avatarContainer.classList.remove('avatar-speaking');
        soundWave.style.display = 'none';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }
    
    // Initially hide sound wave
    soundWave.style.display = 'none';
    
    startBtn.addEventListener('click', async () => {
        try {
            await audioManager.initialize();
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    });
    
    stopBtn.addEventListener('click', () => {
        audioManager.cleanup();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
    
    // Handle speaking state and responses
    socket.on('response', (message) => {
        conversation.textContent = message;
    });
    
    socket.on('audio', () => {
        startSpeakingAnimation();
    });
    
    socket.on('stop-audio', () => {
        stopSpeakingAnimation();
    });
    
    // Initial button state
    stopBtn.disabled = true;
});