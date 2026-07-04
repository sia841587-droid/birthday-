// script.js

// Global Configuration
const SECRET_PASSWORD = "1218"; // Customize this password! (Birthday + Age, e.g. Dec 18 + 18 = 1218)
let isMuted = true;
let audioCtx = null;
let melodyInterval = null;

// Initialize when DOM Content Loads
document.addEventListener("DOMContentLoaded", () => {
    initGlobalBackground();
    initPageTransition();
    
    // Page-specific routing
    const pageId = document.body.id;
    if (pageId === "index-page") {
        initIndexPage();
    } else if (pageId === "password-page") {
        initPasswordPage();
    } else if (pageId === "birthday-page") {
        initBirthdayPage();
    }
});

/* ==========================================================================
   1. GLOBAL CANVAS BACKGROUND ENGINE (Stars, Particles, Hearts)
   ========================================================================== */
function initGlobalBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const maxParticles = 80;

    class CosmicParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // initial spread
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 10;
            this.size = Math.random() * 3.5 + 1;
            this.speedY = -(Math.random() * 0.8 + 0.2);
            this.speedX = Math.sin(Math.random() * 5) * 0.2;
            this.alpha = Math.random() * 0.5 + 0.3;
            this.colorType = Math.random() > 0.8 ? "heart" : "star";
            this.pulseSpeed = Math.random() * 0.02 + 0.005;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.alpha += this.pulseSpeed;
            if (this.alpha > 0.95 || this.alpha < 0.2) {
                this.pulseSpeed = -this.pulseSpeed;
            }

            // Recycle if off-screen
            if (this.y < -10) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            if (this.colorType === "star") {
                // Luxury Soft Glowing White/Blue Star
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#38bdf8";
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Cute Floating Pinkish-Blue Hearts
                ctx.fillStyle = Math.random() > 0.5 ? "#38bdf8" : "#ff2a74";
                ctx.beginPath();
                const hx = this.x;
                const hy = this.y;
                const hs = this.size * 2;
                ctx.moveTo(hx, hy + hs / 4);
                ctx.quadraticCurveTo(hx, hy, hx - hs / 2, hy);
                ctx.quadraticCurveTo(hx - hs, hy, hx - hs, hy + hs / 2);
                ctx.quadraticCurveTo(hx - hs, hy + hs, hx, hy + hs * 1.5);
                ctx.quadraticCurveTo(hx + hs, hy + hs, hx + hs, hy + hs / 2);
                ctx.quadraticCurveTo(hx + hs, hy, hx + hs / 2, hy);
                ctx.quadraticCurveTo(hx, hy, hx, hy + hs / 4);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new CosmicParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        // Draw deep cosmic underlying glow
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height));
        gradient.addColorStop(0, "#0e1c3e");
        gradient.addColorStop(1, "#060a17");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   2. TRANSITION ENGINE
   ========================================================================== */
function initPageTransition() {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay) return;

    // Automatically trigger doors opening on page entry
    if (overlay.classList.contains("active-out")) {
        setTimeout(() => {
            overlay.classList.remove("active-out");
        }, 300);
    }
}

function performTransitionTo(targetUrl) {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay) {
        window.location.href = targetUrl;
        return;
    }

    overlay.classList.add("active-in");
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 1200);
}

/* ==========================================================================
   3. SOUND SYNTHESIZER ENGINE (Web Audio API)
   ========================================================================== */
function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// Play Keypad Click Sound
function playClickSound() {
    if (isMuted) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Play Magic Fanfare/Celebration Chime
function playCelebrationSound() {
    if (isMuted) return;
    initAudio();
    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio C Major chord
    
    notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.5);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
    });
}

// Play Candle Blow Out (Synthetic Noise Wind Effect)
function playBlowSound() {
    if (isMuted) return;
    initAudio();
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // white noise
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseNode.start();
    noiseNode.stop(audioCtx.currentTime + 0.5);
}

// Happy Birthday Chiptune Melody Engine
function playHappyBirthdayMelody() {
    if (isMuted) return;
    initAudio();
    if (melodyInterval) clearInterval(melodyInterval);

    // Array containing note frequencies and duration ratio
    const notes = [
        [261.63, 1], [261.63, 1], [293.66, 2], [261.63, 2], [349.23, 2], [329.63, 4], // Happy Birthday to You
        [261.63, 1], [261.63, 1], [293.66, 2], [261.63, 2], [392.00, 2], [349.23, 4], // Happy Birthday to You
        [261.63, 1], [261.63, 1], [523.25, 2], [440.00, 2], [349.23, 2], [329.63, 2], [293.66, 2], // Happy Birthday Dear [Name]
        [466.16, 1], [466.16, 1], [440.00, 2], [349.23, 2], [392.00, 2], [349.23, 4]  // Happy Birthday to You
    ];

    let currentNoteIndex = 0;
    const baseBeat = 250; // Milliseconds per quarter beat

    function playNextNote() {
        if (isMuted) return;
        const note = notes[currentNoteIndex];
        const freq = note[0];
        const duration = note[1] * baseBeat;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Soft custom hybrid waveform
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration / 1000) - 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + (duration / 1000));

        currentNoteIndex = (currentNoteIndex + 1) % notes.length;
        melodyInterval = setTimeout(playNextNote, duration + 50);
    }

    playNextNote();
}

function stopHappyBirthdayMelody() {
    if (melodyInterval) {
        clearTimeout(melodyInterval);
        melodyInterval = null;
    }
}

/* ==========================================================================
   4. INDEX PAGE LOGIC
   ========================================================================= */
function initIndexPage() {
    const speechText = document.getElementById("speech-text");
    const beginBtn = document.getElementById("begin-btn");
    
    const dialogue = [
        "Hi!! 👋",
        "I've been waiting for you.",
        "Today is very special.",
        "Are you ready?"
    ];
    
    let cycle = 0;
    
    function typeText(text, index = 0) {
        if (index < text.length) {
            speechText.textContent = text.slice(0, index + 1);
            setTimeout(() => typeText(text, index + 1), 60);
        } else {
            // Wait, then schedule next text
            setTimeout(() => {
                cycle = (cycle + 1) % dialogue.length;
                typeText(dialogue[cycle]);
            }, 2500);
        }
    }
    
    // Start Dialogue Cycle
    typeText(dialogue[0]);

    // Handle Button Click & Transition
    beginBtn.addEventListener("click", () => {
        // Trigger a soft chime to alert user audio context is ready
        isMuted = false;
        initAudio();
        playCelebrationSound();
        performTransitionTo("password.html");
    });
}

/* ==========================================================================
   5. PASSWORD PAGE LOGIC
   ========================================================================== */
function initPasswordPage() {
    const passwordInput = document.getElementById("password-input");
    const authCard = document.getElementById("auth-card");
    const hintText = document.getElementById("password-hint-text");
    const monkeyMouth = document.getElementById("monkey-mouth");
    const authMonkeySvg = document.getElementById("auth-monkey-svg");
    const speechText = document.getElementById("speech-text");

    let currentInput = "";
    let attemptsCount = 0;

    // Typewriter for Speech Bubble
    const dialogue = [
        "Hiiii 👋",
        "I've been waiting for you ❤️",
        "Can you guess the secret password?"
    ];
    let speechCycle = 0;
    
    function startMonkeySpeech() {
        speechText.textContent = dialogue[speechCycle];
        setInterval(() => {
            if (speechText.textContent !== "Oops 😜 Try Again" && speechText.textContent !== "Yay!! Let's Celebrate!!") {
                speechCycle = (speechCycle + 1) % dialogue.length;
                speechText.textContent = dialogue[speechCycle];
            }
        }, 3000);
    }
    startMonkeySpeech();

    // Virtual Keypad Listeners
    document.querySelectorAll(".keypad-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            isMuted = false; // Enable audio on user tap
            playClickSound();
            
            // Ripple FX on Button
            const circle = document.createElement("span");
            circle.style.position = "absolute";
            circle.style.background = "rgba(255,255,255,0.25)";
            circle.style.borderRadius = "50%";
            circle.style.width = circle.style.height = "50px";
            circle.style.left = `${e.clientX - button.getBoundingClientRect().left - 25}px`;
            circle.style.top = `${e.clientY - button.getBoundingClientRect().top - 25}px`;
            circle.style.transform = "scale(0)";
            circle.style.transition = "transform 0.4s ease, opacity 0.4s ease";
            circle.style.pointerEvents = "none";
            button.appendChild(circle);
            
            setTimeout(() => {
                circle.style.transform = "scale(2.5)";
                circle.style.opacity = "0";
                setTimeout(() => circle.remove(), 400);
            }, 10);

            const val = button.getAttribute("data-val");
            handleKeyPress(val);
        });
    });

    function handleKeyPress(val) {
        if (val === "clear") {
            currentInput = "";
            passwordInput.value = "";
        } else if (val === "submit") {
            evaluatePassword();
        } else {
            if (currentInput.length < 4) {
                currentInput += val;
                passwordInput.value = currentInput;
                passwordInput.classList.add("active-typing");
                setTimeout(() => passwordInput.classList.remove("active-typing"), 150);
            }
        }
    }

    function evaluatePassword() {
        if (currentInput === SECRET_PASSWORD) {
            handleSuccess();
        } else {
            handleFailure();
        }
    }

    function handleSuccess() {
        // Trigger Canvas Confetti
        createConfettiBurst();
        
        // Audio Chime
        isMuted = false;
        playCelebrationSound();

        // Monkey jumps, claps, smiles
        authMonkeySvg.className = "monkey-svg jump";
        speechText.textContent = "Yay!! Let's Celebrate!!";
        
        setTimeout(() => {
            performTransitionTo("birthday.html");
        }, 2200);
    }

    function handleFailure() {
        attemptsCount++;
        
        // Shake card
        authCard.classList.add("shake-card");
        authMonkeySvg.classList.add("shake-head");
        
        // Sad speech bubble & facial expression
        speechText.textContent = "Oops 😜 Try Again";
        monkeyMouth.setAttribute("d", "M 45,46 Q 50,42 55,46"); // Sad curve
        
        // Haptic feel (if supported)
        if (navigator.vibrate) navigator.vibrate(150);

        setTimeout(() => {
            authCard.classList.remove("shake-card");
            authMonkeySvg.classList.remove("shake-head");
            monkeyMouth.setAttribute("d", "M 45,43 Q 50,47 55,43"); // Back to smile
            currentInput = "";
            passwordInput.value = "";
        }, 1500);

        // Offer hint if failed twice
        if (attemptsCount >= 2) {
            hintText.textContent = "Hint: His Birthday (12 Dec) + His Age (18) = 1218";
            hintText.classList.add("hint-active");
        }
    }
}

/* ==========================================================================
   6. BIRTHDAY (PAGE 3) & CELEBRATION (PAGE 4) LOGIC
   ========================================================================== */
function initBirthdayPage() {
    const musicToggle = document.getElementById("music-toggle");
    const candles = document.querySelectorAll(".candle");
    const birthdayCake = document.getElementById("birthday-cake");
    const boySpeech = document.getElementById("boy-speech");
    const girlSpeech = document.getElementById("girl-speech");
    const boyMonkey = document.getElementById("birthday-boy-monkey").querySelector(".monkey-svg");
    const girlMonkey = document.getElementById("birthday-girl-monkey").querySelector(".monkey-svg");
    const giftsIntro = document.getElementById("gifts-intro");
    const giftsGrid = document.getElementById("gifts-grid");
    
    let activeCandlesCount = candles.length;
    let musicPlaying = false;

    // Music control handler
    musicToggle.addEventListener("click", () => {
        if (!musicPlaying) {
            isMuted = false;
            playHappyBirthdayMelody();
            musicToggle.querySelector(".music-icon").textContent = "🔊";
            musicToggle.querySelector(".music-label").textContent = "Magic Music Playing";
            musicPlaying = true;
        } else {
            isMuted = true;
            stopHappyBirthdayMelody();
            musicToggle.querySelector(".music-icon").textContent = "🔇";
            musicToggle.querySelector(".music-label").textContent = "Magic Music Paused";
            musicPlaying = false;
        }
    });

    // Handle Candle blowout when user clicks/taps cake area
    candles.forEach(candle => {
        candle.addEventListener("click", (e) => {
            e.stopPropagation(); // Avoid triggering double events on container
            if (candle.classList.contains("active")) {
                blowCandle(candle);
            }
        });
    });

    birthdayCake.addEventListener("click", () => {
        // Fallback: Blow all active candles if cake is clicked generally
        candles.forEach(candle => {
            if (candle.classList.contains("active")) {
                blowCandle(candle);
            }
        });
    });

    function blowCandle(candle) {
        candle.classList.remove("active");
        candle.classList.add("blown");
        activeCandlesCount--;

        // Unmute and play sound
        isMuted = false;
        playBlowSound();

        if (activeCandlesCount === 0) {
            handleAllCandlesBlown();
        }
    }

    function handleAllCandlesBlown() {
        // Play Upbeat Happy Birthday Track automatically
        playHappyBirthdayMelody();
        musicToggle.querySelector(".music-icon").textContent = "🔊";
        musicToggle.querySelector(".music-label").textContent = "Magic Music Playing";
        musicPlaying = true;

        // Visual effects
        createConfettiBurst();
        boySpeech.textContent = "Yay! The wish is sent! ✨";
        girlSpeech.textContent = "Look below! 🎁";

        // Make monkeys dance
        boyMonkey.className = "monkey-svg dance";
        girlMonkey.className = "monkey-svg dance girl-monkey";

        // Reveal Gifts
        setTimeout(() => {
            giftsIntro.classList.remove("hidden");
            giftsGrid.classList.remove("hidden");
            
            // Smoothly scroll down
            giftsIntro.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1200);
    }

    // Modal & Gift Card Handlers
    const giftModal = document.getElementById("gift-modal");
    const modalContent = document.getElementById("modal-content-area");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const nextStageWrapper = document.getElementById("next-stage-wrapper");

    const openedGifts = new Set();

    document.querySelectorAll(".luxury-gift-box").forEach(box => {
        box.addEventListener("click", () => {
            const giftNum = parseInt(box.getAttribute("data-gift"));
            box.classList.add("opened");
            openedGifts.add(giftNum);
            
            // Render specific template
            renderGiftModal(giftNum);
            giftModal.classList.add("active");

            // If all 4 gifts are opened, reveal the entry to Page 4
            if (openedGifts.size === 4) {
                setTimeout(() => {
                    nextStageWrapper.classList.remove("hidden");
                    nextStageWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 1000);
            }
        });
    });

    modalCloseBtn.addEventListener("click", () => {
        giftModal.classList.remove("active");
        modalContent.innerHTML = "";
    });

    window.addEventListener("click", (e) => {
        if (e.target === giftModal) {
            giftModal.classList.remove("active");
            modalContent.innerHTML = "";
        }
    });

    // Gift Renderer
    function renderGiftModal(num) {
        if (num === 1) {
            // PHOTO GALLERY
            modalContent.innerHTML = `
                <h2 class="sub-glow-text">Memory Lane 🖼️</h2>
                <p class="subtitle" style="margin-bottom:15px;">A collection of beautiful starry moments...</p>
                <div class="carousel-container">
                    <div class="carousel-slides" id="carousel-slides">
                        <div class="carousel-slide">
                            <img src="https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&q=80&w=600" alt="Stars">
                            <div class="carousel-caption"><h4>A starry night of dreaming... ✨</h4></div>
                        </div>
                        <div class="carousel-slide">
                            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600" alt="Lights">
                            <div class="carousel-caption"><h4>Endless magical celebrations 🎆</h4></div>
                        </div>
                        <div class="carousel-slide">
                            <img src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600" alt="Party balloons">
                            <div class="carousel-caption"><h4>Brighter than a thousand balloons 🎈</h4></div>
                        </div>
                    </div>
                    <button class="carousel-btn prev" id="slide-prev">&#10094;</button>
                    <button class="carousel-btn next" id="slide-next">&#10095;</button>
                </div>
            `;
            initCarousel();
        } else if (num === 2) {
            // VIDEO PLAYER MOCK
            modalContent.innerHTML = `
                <h2 class="sub-glow-text">Video Memories 🎥</h2>
                <p class="subtitle" style="margin-bottom:15px;">Press play to preview your magical message</p>
                <div class="video-player-mock">
                    <img class="video-thumb" src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600" alt="Video cover">
                    <div class="video-overlay" id="vid-overlay">
                        <div class="play-button-circle" id="mock-play-btn"></div>
                        <p style="margin-top:15px; font-weight:bold; text-shadow:0 2px 4px #000;">Play Magical Chimes</p>
                    </div>
                </div>
            `;
            document.getElementById("mock-play-btn").addEventListener("click", () => {
                document.getElementById("vid-overlay").innerHTML = `
                    <div class="animated-scale-up" style="text-align:center; padding: 20px;">
                        <span style="font-size:3.5rem;">🌌</span>
                        <h4 style="color:#fff; margin-top:10px;">Playing Chimes Harmony...</h4>
                        <p style="color:#cbd5e1; font-size:0.9rem; margin-top:6px;">Hope your day is as spectacular as this tune!</p>
                    </div>
                `;
                playCelebrationSound();
            });
        } else if (num === 3) {
            // TYPING LETTER
            modalContent.innerHTML = `
                <h2 class="sub-glow-text">A Heartfelt Note ✉️</h2>
                <div class="letter-envelope" id="letter-envelope">
                    <div class="envelope-body">
                        <div class="wax-seal">❤️</div>
                    </div>
                </div>
                <div class="letter-paper" id="letter-paper">
                    <h3 class="letter-title">To the Most Special Person...</h3>
                    <p class="letter-text" id="letter-text"></p>
                    <div class="letter-signature">With all my love,<br>Your Magical Monkey Companion 🐒</div>
                </div>
            `;
            const envelope = document.getElementById("letter-envelope");
            const paper = document.getElementById("letter-paper");
            const textEl = document.getElementById("letter-text");

            const letterContents = "Today, we celebrate the amazing spark you bring into this universe. Entering your 18th year is a milestone filled with infinite potentials. Never lose your lovely curiosity, your genuine smile, and the deep kindness of your spirit. Keep shining brighter than the stars, reach for your grandest aspirations, and remember that you are profoundly loved. Wishing you a year as premium and flawless as your wonderful heart!";

            envelope.addEventListener("click", () => {
                envelope.classList.add("hidden");
                paper.style.display = "block";
                
                // Typing text effect
                let lIdx = 0;
                function typeLetter() {
                    if (lIdx < letterContents.length) {
                        textEl.textContent += letterContents.charAt(lIdx);
                        lIdx++;
                        setTimeout(typeLetter, 35);
                    }
                }
                typeLetter();
            });
        } else if (num === 4) {
            // YOUTUBE LINK
            modalContent.innerHTML = `
                <h2 class="sub-glow-text">The Sound of Celebration 🎵</h2>
                <div class="yt-music-card">
                    <div class="yt-logo">▶</div>
                    <p class="subtitle" style="margin-bottom:20px;">I curated a beautiful song just for you on YouTube. Click below to listen and add magic to your night!</p>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="btn btn-primary btn-glow" style="text-decoration:none;">
                        <span>Open on YouTube 🚀</span>
                    </a>
                </div>
            `;
        }
    }

    // Carousel Slider Logic helper
    function initCarousel() {
        const slides = document.getElementById("carousel-slides");
        const prev = document.getElementById("slide-prev");
        const next = document.getElementById("slide-next");
        let activeIdx = 0;

        function updateSlide() {
            slides.style.transform = `translateX(-${activeIdx * 100}%)`;
        }

        prev.addEventListener("click", () => {
            activeIdx = activeIdx > 0 ? activeIdx - 1 : 2;
            updateSlide();
        });

        next.addEventListener("click", () => {
            activeIdx = activeIdx < 2 ? activeIdx + 1 : 0;
            updateSlide();
        });
    }

    // Page 4: Handle entering Final Celebration
    const goCelebrationBtn = document.getElementById("go-to-celebration-btn");
    const birthdayMain = document.getElementById("birthday-main-section");
    const finalCelebration = document.getElementById("final-celebration-section");

    goCelebrationBtn.addEventListener("click", () => {
        // Trigger a glowing flash or door overlay
        const overlay = document.getElementById("transition-overlay");
        overlay.classList.add("active-in");
        
        setTimeout(() => {
            birthdayMain.classList.add("hidden");
            finalCelebration.classList.remove("hidden");
            overlay.classList.remove("active-in");
            overlay.classList.add("active-out");
            
            // Initialize massive continuous fireworks & balloons
            startFinalCelebrationEngine();
            
            setTimeout(() => {
                overlay.classList.remove("active-out");
            }, 1000);
        }, 1000);
    });

    // Replay adventure button logic
    document.getElementById("replay-btn").addEventListener("click", () => {
        stopHappyBirthdayMelody();
        performTransitionTo("index.html");
    });
}

/* ==========================================================================
   7. PAGE 4 CELEBRATION EFFECTS (Continuous Fireworks & Balloon system)
   ========================================================================== */
function startFinalCelebrationEngine() {
    const canvas = document.getElementById("sparkle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const fireworks = [];
    const particles = [];
    const balloons = [];

    class Firework {
        constructor() {
            this.x = Math.random() * width;
            this.y = height;
            this.targetY = Math.random() * (height * 0.5) + 50;
            this.speed = Math.random() * 4 + 4;
            this.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
        }

        update() {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                // Explode!
                for (let i = 0; i < 40; i++) {
                    particles.push(new ExplosionParticle(this.x, this.y, this.color));
                }
                return false; // delete firework
            }
            return true;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class ExplosionParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // gravity
            this.alpha -= this.decay;
            return this.alpha > 0;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Luxury drifting balloons
    class Balloon {
        constructor() {
            this.x = Math.random() * width;
            this.y = height + 50;
            this.speed = Math.random() * 1.5 + 0.8;
            this.radius = Math.random() * 20 + 20;
            this.color = Math.random() > 0.5 ? "#38bdf8" : "#ffffff"; // blue/white theme
            this.angle = Math.random() * 5;
        }

        update() {
            this.y -= this.speed;
            this.x += Math.sin(this.angle) * 0.4;
            this.angle += 0.02;
            return this.y > -100;
        }

        draw() {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1.5;

            // Draw balloon oval
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.radius * 0.8, this.radius, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Balloon knot
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.radius);
            ctx.lineTo(this.x - 4, this.y + this.radius + 6);
            ctx.lineTo(this.x + 4, this.y + this.radius + 6);
            ctx.closePath();
            ctx.fill();

            // String
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.radius + 6);
            ctx.quadraticCurveTo(this.x - 10, this.y + this.radius + 30, this.x + 5, this.y + this.radius + 50);
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.stroke();

            ctx.restore();
        }
    }

    function runEngine() {
        ctx.clearRect(0, 0, width, height);

        // Periodically spawn elements
        if (Math.random() < 0.05) {
            fireworks.push(new Firework());
        }
        if (Math.random() < 0.02) {
            balloons.push(new Balloon());
        }

        // Update & Draw fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            if (!fireworks[i].update()) {
                fireworks.splice(i, 1);
            } else {
                fireworks[i].draw();
            }
        }

        // Update & Draw explosion particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw();
            }
        }

        // Update & Draw balloons
        for (let i = balloons.length - 1; i >= 0; i--) {
            if (!balloons[i].update()) {
                balloons.splice(i, 1);
            } else {
                balloons[i].draw();
            }
        }

        requestAnimationFrame(runEngine);
    }

    runEngine();
}

/* ==========================================================================
   8. UTILITY: LIGHTWEIGHT CONFETTI BURST
   ========================================================================== */
function createConfettiBurst() {
    const canvas = document.getElementById("sparkle-canvas") || document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const colors = ["#38bdf8", "#00f0ff", "#ff2a74", "#ffffff", "#00ffaa", "#facc15"];
    const pieces = [];

    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * window.innerWidth,
            y: -20,
            r: Math.random() * 6 + 4,
            d: Math.random() * 50 + 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }

    let frame = 0;
    function drawConfetti() {
        frame++;
        if (frame > 220) return; // Stop after ~4 seconds

        ctx.save();
        pieces.forEach((p) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });
        ctx.restore();
        
        requestAnimationFrame(drawConfetti);
    }

    drawConfetti();
      }
