/* ==========================================================================
   CONFIGURATION
   ========================================================================== */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpssy0IRGOL0PEpEOPOWxKCqKfQjLSjchSQm2b2xxftDguFlulPNdRrpAcSXdMcILK/exec"; 

/* ==========================================================================
   1. DOOR OPENING LOGIC (INDEX.HTML ONLY)
   ========================================================================== */
const btn = document.getElementById('seal-btn');
if (btn) {
    const sealGlow = document.getElementById('sealGlow');
    const doorContainer = document.getElementById('doorContainer');
    const instruction = document.getElementById('instruction');
    const fxContainer = document.getElementById('fx-container');

    let isPressing = false;
    let holdProgress = 0;
    let pressStartTime = 0;
    let resetStartTime = 0;
    let animationFrame;
    let isOpen = false;
    const holdDuration = 1000; 

    btn.addEventListener('mousedown', startPress);
    window.addEventListener('mouseup', cancelPress);
    window.addEventListener('mouseleave', cancelPress);
    btn.addEventListener('touchstart', startPress, { passive: false });
    window.addEventListener('touchend', cancelPress);
    window.addEventListener('touchcancel', cancelPress);

    function startPress(e) {
        if (isOpen) return;
        e.preventDefault();
        isPressing = true;
        pressStartTime = performance.now() - (holdProgress * holdDuration);
        btn.classList.add('pressing');
        animateGlow();
    }

    function animateGlow() {
        if (!isPressing || isOpen) return;
        const now = performance.now();
        holdProgress = Math.min((now - pressStartTime) / holdDuration, 1);
        sealGlow.style.opacity = 0.1 + (holdProgress * 0.6);
        sealGlow.style.transform = `scale(${1 + holdProgress * 0.8})`;
        if (holdProgress >= 1) openDoors();
        else animationFrame = requestAnimationFrame(animateGlow);
    }

    function cancelPress() {
        if (isOpen || !isPressing) return;
        isPressing = false;
        btn.classList.remove('pressing');
        cancelAnimationFrame(animationFrame);
        
        const startP = holdProgress;
        resetStartTime = performance.now();
        
        function resetGlow() {
            const now = performance.now();
            const elapsed = now - resetStartTime;
            holdProgress = Math.max(startP - (elapsed / 400), 0); 
            sealGlow.style.opacity = 0.1 + (holdProgress * 0.6);
            sealGlow.style.transform = `scale(${1 + holdProgress * 0.8})`;
            if (holdProgress > 0) requestAnimationFrame(resetGlow);
            else {
                sealGlow.style.opacity = 0;
                sealGlow.style.transform = 'scale(0.5)';
            }
        }
        requestAnimationFrame(resetGlow);
    }

    function openDoors() {
        isOpen = true;
        btn.classList.remove('pressing');
        instruction.style.display = 'none';
        
        sealGlow.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        sealGlow.style.opacity = '0.8';
        sealGlow.style.transform = 'scale(2.5)';

        // Flower Burst (Halved)
        for (let i = 0; i < 30; i++) {
            const flower = document.createElement('div');
            flower.classList.add('flower-burst');
            flower.innerText = '🌸';
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 400;
            flower.style.left = (window.innerWidth / 2) + 'px';
            flower.style.top = (window.innerHeight / 2) + 'px';
            flower.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            flower.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            flower.style.setProperty('--rot', (Math.random() * 720) + 'deg');
            fxContainer.appendChild(flower);
            setTimeout(() => flower.remove(), 2000);
        }

        // Flower Rain (Halved)
        let spawnCount = 0;
        const interval = setInterval(() => {
            const flower = document.createElement('div');
            flower.classList.add('falling-flower');
            flower.innerText = '🌸';
            flower.style.left = Math.random() * 100 + 'vw';
            const duration = 2.5 + Math.random() * 2.5; 
            flower.style.animationDuration = duration + 's';
            flower.style.fontSize = (15 + Math.random() * 20) + 'px';
            fxContainer.appendChild(flower);
            setTimeout(() => flower.remove(), duration * 1000);
            spawnCount++;
            if (spawnCount >= 50) clearInterval(interval); 
        }, 40);

        doorContainer.classList.add('doors-open');
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
    }
}

/* ==========================================================================
   2. SMART AUTO-SCROLL (Fixed)
   ========================================================================== */
function setupAutoScroll(trackId, itemSelector) {
    const track = document.getElementById(trackId);
    if (!track) return;
    
    const items = track.querySelectorAll(itemSelector);
    let isHovered = false;
    let isVisible = false; 
    let speed = 1; 
    let direction = 1;

    track.addEventListener('mouseenter', () => isHovered = true);
    track.addEventListener('mouseleave', () => isHovered = false);
    track.addEventListener('touchstart', () => isHovered = true, {passive: true});
    track.addEventListener('touchend', () => isHovered = false, {passive: true});

    // FIXED: Lowered threshold so it triggers sooner when scrolling down
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0.05 }); 
    observer.observe(track);

    function updateActiveCard() {
        const trackCenter = track.scrollLeft + (track.clientWidth / 2);
        let closestItem = null;
        let minDistance = Infinity;

        items.forEach(item => {
            const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
            const distance = Math.abs(trackCenter - itemCenter);
            if (distance < minDistance) { minDistance = distance; closestItem = item; }
        });

        items.forEach(i => i.classList.remove('active'));
        if (closestItem && !isHovered) closestItem.classList.add('active');
    }

    function step() {
        if (isVisible && !isHovered) {
            if (track.scrollWidth > track.clientWidth) {
                track.scrollLeft += speed * direction;
                if (track.scrollLeft >= (track.scrollWidth - track.clientWidth)) direction = -1;
                else if (track.scrollLeft <= 0) direction = 1;
            }
            updateActiveCard();
        }
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => {
    setupAutoScroll('eventsTrack', '.event-card');
    setupAutoScroll('polaroidTrack', '.polaroid');
});

/* ==========================================================================
   3. COUNTDOWN
   ========================================================================== */
const cdTarget = document.getElementById("cdTarget");
if (cdTarget) {
    const targetDate = new Date("Nov 21, 2026 19:00:00 GMT+0530").getTime();
    const evDate = new Date(targetDate);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
    cdTarget.textContent = evDate.toLocaleDateString('en-IN', options).replace(' at ', ' · ') + " IST";

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(timer);
            document.getElementById("cdGrid").style.display = "none";
            document.getElementById("cdDone").hidden = false;
            return;
        }
        
        document.getElementById("cdD").innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById("cdH").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById("cdM").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById("cdS").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
    }, 1000);
}

/* ==========================================================================
   4. RSVP FORM
   ========================================================================== */
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('rsvpName').value.trim();
        const email = document.getElementById('rsvpEmail').value.trim();
        const guests = document.getElementById('rsvpGuests').value;
        const attendance = document.querySelector('input[name="attending"]:checked').value;
        const selectedEvents = Array.from(document.querySelectorAll('input[name="events"]:checked')).map(cb => cb.value);

        if (attendance === 'Yes' && selectedEvents.length === 0) {
            alert("Please select at least one event to attend.");
            return;
        }

        const btn = document.getElementById('rBtn');
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const payload = { action: 'rsvp', name: name, email: email, attending: attendance, events: selectedEvents, guests: guests };

        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            
            document.getElementById('rsvpForm').style.display = 'none';
            document.getElementById('rsvpSuccess').style.display = 'block';
        } catch (error) {
            alert("Network error. Please try again.");
            btn.textContent = 'Send RSVP';
            btn.disabled = false;
        }
    });
}

/* ==========================================================================
   5. WISHING LANTERNS
   ========================================================================== */
const bgLanterns = document.getElementById('bgLanterns');
if (bgLanterns) {
    function spawnLantern(name = "", msg = "") {
        const lantern = document.createElement('div');
        lantern.classList.add('bg-lantern');
        
        let startX = msg ? (Math.random() * 50 + 25) : (Math.random() * 90 + 5);
        lantern.style.left = `${startX}vw`;
        lantern.style.fontSize = `${Math.random() * 1.5 + 1.5}rem`;
        const duration = Math.random() * 10 + 15; 
        lantern.style.animationDuration = `${duration}s`;
        
        if (msg) {
            const tooltip = document.createElement('div');
            tooltip.classList.add('lantern-tooltip');
            tooltip.classList.add(startX < 40 ? 'align-left' : (startX > 60 ? 'align-right' : 'align-center'));
            tooltip.innerHTML = `<strong>${name}</strong><br>"${msg}"`;
            lantern.appendChild(tooltip);

            const midPointTime = duration * 0.50 * 1000; 
            setTimeout(() => {
                if (document.body.contains(lantern)) {
                    tooltip.classList.add('show');
                    setTimeout(() => { if (document.body.contains(lantern)) tooltip.classList.remove('show'); }, 2500);
                }
            }, midPointTime);
        }

        bgLanterns.appendChild(lantern);
        setTimeout(() => lantern.remove(), duration * 1000);
    }

    function spawnNextLantern() {
        spawnLantern(); 
        setTimeout(spawnNextLantern, Math.random() * 2000 + 2000);
    }
    spawnNextLantern();

    const wishForm = document.getElementById('wishForm');
    if (wishForm) {
        wishForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('guestName').value;
            const message = document.getElementById('guestWish').value;
            
            document.getElementById('wishModal').classList.remove('active');
            wishForm.reset();
            
            const newLantern = document.createElement('div');
            newLantern.classList.add('bg-lantern');
            newLantern.style.left = '50vw';
            newLantern.style.bottom = '10vh'; 
            newLantern.style.fontSize = '3.5rem';
            newLantern.style.animationDuration = '20s';
            
            const tooltip = document.createElement('div');
            tooltip.classList.add('lantern-tooltip', 'align-center');
            tooltip.innerHTML = `<strong>${name}</strong><br>"${message}"`;
            newLantern.appendChild(tooltip);
            tooltip.classList.add('show');
            setTimeout(() => { if(document.body.contains(newLantern)) tooltip.classList.remove('show'); }, 3000);

            bgLanterns.appendChild(newLantern);
            setTimeout(() => newLantern.remove(), 20000);

            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'message', name: name, message: message }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            }).catch(err => console.log('Error saving wish:', err));
        });
    }
}

/* ==========================================================================
   6. BLESSING INTERACTION
   ========================================================================== */
const blessingTrigger = document.getElementById('blessingTrigger');
if (blessingTrigger) {
    const lightRay = document.getElementById('lightRay');
    const blessingImg = document.getElementById('blessingImg');
    const handOverlay = document.getElementById('handOverlay');
    const blessingSuccess = document.getElementById('blessingSuccess');

    let pressTimer, isPressing = false, progress = 0;

    function startPress(e) {
        e.preventDefault();
        if(blessingSuccess.classList.contains('active')) return;
        isPressing = true;
        handOverlay.style.opacity = '0';
        lightRay.style.opacity = '1';
        
        pressTimer = setInterval(() => {
            if (!isPressing) return;
            progress += 2;
            if (progress > 100) progress = 100;
            lightRay.style.transform = `translateX(-50%) scaleY(${progress / 100})`;
            blessingImg.style.filter = `brightness(${0.85 + (progress / 100) * 0.15})`;
            
            if (progress === 100) {
                clearInterval(pressTimer);
                blessingSuccess.classList.add('active');
                setTimeout(() => { blessingSuccess.classList.remove('active'); resetBlessing(); }, 4000);
            }
        }, 30);
    }

    function cancelPress() {
        isPressing = false;
        clearInterval(pressTimer);
        if (progress < 100) {
            const resetInterval = setInterval(() => {
                progress -= 5;
                if (progress <= 0) { progress = 0; clearInterval(resetInterval); lightRay.style.opacity = '0'; }
                lightRay.style.transform = `translateX(-50%) scaleY(${progress / 100})`;
                blessingImg.style.filter = `brightness(${0.85 + (progress / 100) * 0.15})`;
            }, 20);
            setTimeout(() => handOverlay.style.opacity = '1', 300);
        }
    }

    function resetBlessing() {
        progress = 0; isPressing = false;
        lightRay.style.opacity = '0';
        lightRay.style.transform = `translateX(-50%) scaleY(0)`;
        blessingImg.style.filter = `brightness(0.85)`;
        handOverlay.style.opacity = '1';
    }

    blessingTrigger.addEventListener('mousedown', startPress);
    blessingTrigger.addEventListener('mouseup', cancelPress);
    blessingTrigger.addEventListener('mouseleave', cancelPress);
    blessingTrigger.addEventListener('touchstart', startPress, { passive: false });
    blessingTrigger.addEventListener('touchend', cancelPress);
}

/* ==========================================================================
   7. WEDDING WALL UPLOAD & FETCH (Fixed & Compressed)
   ========================================================================== */
const wallTrack = document.getElementById('wallTrack');
if (wallTrack) {
    const wallUpload = document.getElementById('wall-upload');

    async function loadWeddingWall() {
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getPhotos`);
            const data = await response.json();
            
            if (data.status === 'success' && data.photos) {
                data.photos.forEach(photo => {
                    addPhotoToWall(photo.url, photo.name);
                });
            }
        } catch (e) {
            console.log("Could not load wedding wall photos:", e);
        }
    }
    loadWeddingWall();

    wallUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const names = prompt("Enter the names for the photo caption (e.g., The Sharma Family):", "Our Family");
        const finalName = names || "Our Family";

        const uploadCard = document.querySelector('.upload-card');
        uploadCard.innerHTML = `<div class="upload-icon">⏳</div><span>Uploading...</span>`;

        // Compress image before sending to prevent Google Apps Script payload limits
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = async function() {
                // Create canvas to resize
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Resize to max 800px wide
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to JPEG with 0.7 quality
                const base64Data = canvas.toDataURL('image/jpeg', 0.7);
                
                try {
                    const response = await fetch(APPS_SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'uploadPhoto',
                            image: base64Data,
                            caption: finalName
                        }),
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                    });
                    
                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        addPhotoToWall(result.url, finalName);
                    } else {
                        alert("Failed to upload: " + (result.message || "Unknown error"));
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error uploading image.");
                } finally {
                    uploadCard.innerHTML = `<div class="upload-icon">📸</div><span>Upload Photo</span>`;
                    wallUpload.value = ''; 
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function addPhotoToWall(url, caption) {
        const newPhotoDiv = document.createElement('div');
        newPhotoDiv.classList.add('wall-photo', 'photo-pop-in'); // Added animation class
        
        const img = document.createElement('img');
        img.src = url;
        
        const captionDiv = document.createElement('div');
        captionDiv.classList.add('wall-caption');
        captionDiv.textContent = caption;
        
        newPhotoDiv.appendChild(img);
        newPhotoDiv.appendChild(captionDiv);
        
        const uploadCard = document.querySelector('.upload-card');
        uploadCard.insertAdjacentElement('afterend', newPhotoDiv);
    }
}