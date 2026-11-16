/* Formspree AJAX integration for Farming Simulator Guide. */
const form = document.getElementById('contactForm');
const submit = document.getElementById('contactSubmit');
const status = document.getElementById('contactStatus');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  status.textContent = 'Sending your message…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = Array.isArray(data.errors) ? data.errors.map(e => e.message).filter(Boolean).join(' ') : '';
      throw new Error(message || 'Message could not be sent.');
    }
    form.reset();
    status.textContent = 'Thank you — your message has been sent.';
  } catch (error) {
    status.textContent = error.message || 'Sorry, your message could not be sent. Please try again.';
  } finally {
    submit.disabled = false;
  }
});
