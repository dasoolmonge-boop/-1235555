/**
 * Tactical JS Logic - Krapoviy Beret Invitation
 */

document.addEventListener('DOMContentLoaded', () => {
    initGateTransition();
    initCountdownTimer();
    initRSVPForm();
});

/**
 * Handles the opening envelope / gate screen transition
 */
function initGateTransition() {
    const gateCover = document.getElementById('gate-cover');
    const openBtn = document.getElementById('open-btn');
    const gateEmblem = document.getElementById('gate-emblem');
    const mainContent = document.getElementById('main-content');

    const handleOpen = () => {
        // Play click animation on emblem
        gateEmblem.style.transform = 'scale(0.9) rotate(-10deg)';
        
        setTimeout(() => {
            // Slide up the cover
            gateCover.classList.add('opened');
            
            // Show main content wrapper
            mainContent.classList.remove('hidden');
            
            setTimeout(() => {
                mainContent.classList.add('visible');
                // Trigger scroll to top in case browser remembered position
                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 100);

            // Completely remove gate from layout after transition completes
            setTimeout(() => {
                gateCover.style.display = 'none';
            }, 1000);
            
        }, 200);
    };

    // Open by clicking emblem or button
    if (openBtn) openBtn.addEventListener('click', handleOpen);
    if (gateEmblem) gateEmblem.addEventListener('click', handleOpen);
}

/**
 * Initializes the tactical countdown timer
 */
function initCountdownTimer() {
    // Target event date: June 5, 2026 at 10:00 AM local time
    const targetDate = new Date('2026-06-05T10:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            // Event has started
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
            
            const timerTitle = document.querySelector('.countdown-section .card-title');
            if (timerTitle) timerTitle.innerText = 'ИСПЫТАНИЯ НАЧАЛИСЬ!';
            return;
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format to two digits
        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
    }

    // Run immediately and then update every second
    updateTimer();
    setInterval(updateTimer, 1000);
}

/**
 * Controls the RSVP form operations, states, and localStorage cache
 */
function initRSVPForm() {
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
    const resetBtn = document.getElementById('reset-btn');

    // Retrieve previous submission from localStorage if exists
    const cachedName = localStorage.getItem('candidate_name');
    const cachedPhone = localStorage.getItem('candidate_phone');
    const cachedStatus = localStorage.getItem('candidate_status');

    if (cachedName && rsvpForm && rsvpSuccess) {
        // Pre-fill form fields
        document.getElementById('candidate-name').value = cachedName;
        
        const phoneInput = document.getElementById('candidate-phone');
        if (phoneInput && cachedPhone) {
            phoneInput.value = cachedPhone;
        }
        
        const radio = document.querySelector(`input[name="candidate-status"][value="${cachedStatus}"]`);
        if (radio) radio.checked = true;

        // Show success screen directly
        rsvpForm.classList.add('hidden');
        rsvpSuccess.classList.remove('hidden');
    }

    if (rsvpForm) {
        // Helper function to escape HTML special characters
        const escapeHTML = (str) => {
            return str.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;');
        };

        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('candidate-name').value.trim();
            const phoneVal = document.getElementById('candidate-phone').value.trim();
            const statusVal = document.querySelector('input[name="candidate-status"]:checked').value;

            // Remove any previous error message
            const existingError = rsvpForm.querySelector('.form-error-msg');
            if (existingError) {
                existingError.remove();
            }

            // Show loading state
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnSpinner) btnSpinner.classList.remove('hidden');

            // Form message for Telegram using HTML formatting
            const escapedName = escapeHTML(nameVal);
            const escapedPhone = escapeHTML(phoneVal);
            const messageText = `🔔 <b>Новый ответ на приглашение!</b>\n\n👤 <b>Имя:</b> ${escapedName}\n📞 <b>Телефон:</b> ${escapedPhone}\n📢 <b>Статус:</b> ${statusVal === 'ready' ? '✅ С удовольствием приду поддержать бойцов' : '❌ К сожалению, не смогу присутствовать'}`;

            // Send to Telegram Bot API
            const token = '8334443770:AAFCWnMi4CuIvk7b06NPbH4Wt943IUZGIBE';
            const chatId = '-5196552819';
            const tgUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(messageText)}&parse_mode=HTML`;

            fetch(tgUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Telegram response:', data);
                    if (data.ok) {
                        // Save to localStorage
                        localStorage.setItem('candidate_name', nameVal);
                        localStorage.setItem('candidate_phone', phoneVal);
                        localStorage.setItem('candidate_status', statusVal);

                        // Reset button states
                        if (submitBtn) submitBtn.disabled = false;
                        if (btnText) btnText.classList.remove('hidden');
                        if (btnSpinner) btnSpinner.classList.add('hidden');

                        // Switch screens
                        rsvpForm.classList.add('hidden');
                        rsvpSuccess.classList.remove('hidden');

                        // Smooth scroll to RSVP section header
                        document.getElementById('rsvp-section').scrollIntoView({ behavior: 'smooth' });
                    } else {
                        throw new Error(data.description || 'Unknown Telegram API error');
                    }
                })
                .catch(err => {
                    console.error('Telegram error:', err);

                    // Reset button states
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnText) btnText.classList.remove('hidden');
                    if (btnSpinner) btnSpinner.classList.add('hidden');

                    // Display error message
                    const errorEl = document.createElement('div');
                    errorEl.className = 'form-error-msg';
                    errorEl.style.color = '#ff4d4d';
                    errorEl.style.fontSize = '0.95rem';
                    errorEl.style.marginTop = '15px';
                    errorEl.style.textAlign = 'center';
                    errorEl.style.fontFamily = 'var(--font-body)';
                    errorEl.style.fontWeight = '500';
                    errorEl.style.lineHeight = '1.4';
                    errorEl.innerHTML = `⚠️ Ошибка при отправке. Пожалуйста, попробуйте снова или свяжитесь по телефону:<br><a href="tel:+79858302146" style="color: var(--color-gold); text-decoration: underline; font-weight: 700;">+7 (985) 830-21-46</a>`;
                    
                    rsvpForm.appendChild(errorEl);
                });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Clear cache
            localStorage.removeItem('candidate_name');
            localStorage.removeItem('candidate_phone');
            localStorage.removeItem('candidate_status');

            // Show form
            if (rsvpForm && rsvpSuccess) {
                rsvpSuccess.classList.add('hidden');
                rsvpForm.classList.remove('hidden');
            }
        });
    }
}
