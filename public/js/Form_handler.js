/**
 * Form Handler for Bistrot Des Tournelles
 * Handles reservation and contact form submissions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Reservation Form Handler
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }

    // Contact Form Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

/**
 * Handle Reservation Form Submission
 */
async function handleReservationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Gather form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            showNotification(
                'Reservation Confirmed!', 
                `Thank you ${data.name}! We've sent a confirmation to ${data.email}. We look forward to seeing you on ${data.date} at ${data.time}.`,
                'success'
            );
            form.reset();
        } else {
            // Error from server
            throw new Error(result.error || 'Failed to make reservation');
        }
    } catch (error) {
        console.error('Reservation error:', error);
        showNotification(
            'Reservation Failed', 
            error.message || 'There was an error processing your reservation. Please try again or call us directly.',
            'error'
        );
    } finally {
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

/**
 * Handle Contact Form Submission
 */
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Gather form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            showNotification(
                'Message Sent!', 
                `Thank you ${data.name}! We've received your message and will get back to you within 24 hours.`,
                'success'
            );
            form.reset();
        } else {
            // Error from server
            throw new Error(result.error || 'Failed to send message');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification(
            'Message Failed', 
            error.message || 'There was an error sending your message. Please try again or email us directly.',
            'error'
        );
    } finally {
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

/**
 * Show Notification Toast
 */
function showNotification(title, message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <div>
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = 'display: flex; gap: 1rem; align-items: flex-start;';
    
    const icon = notification.querySelector('i');
    icon.style.cssText = `font-size: 1.5rem; color: ${type === 'success' ? '#28a745' : '#dc3545'}; flex-shrink: 0;`;
    
    const textDiv = notification.querySelector('div div');
    textDiv.querySelector('h4').style.cssText = 'margin: 0 0 0.25rem 0; color: #333; font-size: 1.1rem;';
    textDiv.querySelector('p').style.cssText = 'margin: 0; color: #666; font-size: 0.95rem; line-height: 1.5;';
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = 'background: none; border: none; font-size: 1.2rem; color: #999; cursor: pointer; padding: 0; margin-left: auto;';
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Form Validation Helper
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Set minimum date for reservation to today
 */
function setMinDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

// Run on load
setMinDate();