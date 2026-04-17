// ==========================================
// 1. GLOBAL STATE & UTILITIES
// ==========================================
let isSent = false;
let countdown;
let timeLeft = 3;

const smsUrlBuilder = (number, body) => {
    const cleanNumber = number.replace(/\s+/g, '');
    const target = cleanNumber || "+2348000000000";
    return `sms:${target}?body=${encodeURIComponent(body)}`;
};

// ==========================================
// 2. CORE SOS LOGIC
// ==========================================
window.playSiren = () => {
    const siren = document.getElementById('sirenAudio');
    const isStealth = localStorage.getItem('vgn_stealth_mode') === 'true';
    if (!isStealth && siren) {
        siren.play().catch(e => console.log("Audio Blocked by Browser"));
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    }
};

const showSmsButton = (body) => {
    const statusMsg = document.getElementById('statusMsg');
    const c1 = localStorage.getItem('vgn_contact') || "";
    const c2 = localStorage.getItem('vgn_contact2') || "";

    let buttonsHTML = `<div style="margin-top:15px;">`;
    if (c1) {
        buttonsHTML += `<a href="${smsUrlBuilder(c1, body)}" style="background: #CC0000; display:block; padding: 20px; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center; margin-bottom:10px; border-bottom: 4px solid #8B0000;">🚨 ALERT OPS COMMAND</a>`;
    }
    if (c2) {
        buttonsHTML += `<a href="${smsUrlBuilder(c2, body)}" style="background: #003366; display:block; padding: 20px; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center; border-bottom: 4px solid #001a33;">🛡️ NSCDC DESK</a>`;
    }
    if (!c1 && !c2) {
        buttonsHTML += `<p style="color:red; font-weight:bold; text-align:center;">⚠️ Set Contacts in Settings!</p>`;
    }
    buttonsHTML += `</div>`;
    statusMsg.innerHTML = buttonsHTML;
};

// ==========================================
// 3. MAIN ENGINE (Wait for HTML to load)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // UI ELEMENTS - Using 'sosButton' to match your HTML
    const sosButton = document.getElementById('sosButton');
    const statusMsg = document.getElementById('statusMsg');
    const timerDisplay = document.getElementById('timer');
    const stopBtn = document.getElementById('stop-btn');

    if (!sosButton) {
        console.error("CRITICAL: 'sosButton' not found in HTML!");
        return;
    }

    const startSOS = () => {
        if (isSent) return;
        timeLeft = 3;
        if (timerDisplay) timerDisplay.innerText = timeLeft;
        sosButton.classList.add('active');
        statusMsg.innerText = "HOLD FOR 3 SECONDS...";
        
        countdown = setInterval(() => {
            timeLeft--;
            if (timerDisplay) timerDisplay.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                finishSOS(); 
            }
        }, 1000);
    };

    const cancelSOS = () => {
        if (isSent) return;
        clearInterval(countdown);
        sosButton.classList.remove('active');
        if (timerDisplay) timerDisplay.innerText = "";
        statusMsg.innerText = "SENTINEL-DEFENDER: Secure";
    };

    const finishSOS = () => {
        isSent = true;
        sosButton.classList.add('sent');
        
        const hostel = localStorage.getItem('vgn_blood') || "STATION:NOT SET";
        const studentId = localStorage.getItem('vgn_allergies') || "AGRO-RANGER";

        statusMsg.innerHTML = `<p style="color: #003366; font-weight: bold; text-align: center;">🛰️ Establishing GPS Lock...</p>`;

        navigator.geolocation.getCurrentPosition((pos) => {
            const mapUrl = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
            const smsBody = `🚩 SENTINEL-DEFENDER\nID: ${hostel}\n: ${studentId}\nGPS: ${mapUrl}\nSTATUS: URGENT.`;
            showSmsButton(smsBody); 
            window.playSiren();
        }, (err) => {
            const smsBody = `🚩 SENTINEL-DEFENDER\nID: ${hostel}\n: ${studentId}\nSTATUS: URGENT (GPS OFF).`;
            showSmsButton(smsBody);
            window.playSiren();
        }, { enableHighAccuracy: true, timeout: 5000 });
    };

    // ATTACH LISTENERS
    sosButton.addEventListener('mousedown', startSOS);
    sosButton.addEventListener('mouseup', cancelSOS);
    sosButton.addEventListener('touchstart', (e) => { e.preventDefault(); startSOS(); });
    sosButton.addEventListener('touchend', cancelSOS);
    
    if (stopBtn) stopBtn.addEventListener('click', () => location.reload());
});

// --- CONTACT SAVING LOGIC ---
    const contact1Input = document.getElementById('contact1');
    const contact2Input = document.getElementById('contact2');

    if (contact1Input) {
        // Load existing number on refresh
        contact1Input.value = localStorage.getItem('vgn_contact') || '';
        // Save as you type
        contact1Input.addEventListener('input', () => {
            localStorage.setItem('vgn_contact', contact1Input.value);
        });
    }

    if (contact2Input) {
        contact2Input.value = localStorage.getItem('vgn_contact2') || '';
        contact2Input.addEventListener('input', () => {
            localStorage.setItem('vgn_contact2', contact2Input.value);
        });
    }