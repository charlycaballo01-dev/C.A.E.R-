function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.btn-submit');
  const errorMsg = document.getElementById('formError');
  const originalText = 'Enviar consulta por Email →';
  const data = new FormData(form);
  const nombre = data.get('nombre') || 'Alguien';
  const modalidad = data.get('modalidad') || 'Sin especificar';

  btn.textContent = 'Enviando...';
  btn.disabled = true;
  errorMsg.style.display = 'none';

  fetch('https://formsubmit.co/ajax/charlycaballo01@gmail.com', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: data
  })
  .then(async res => {
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.success === false) {
      throw new Error(result.message || 'No se pudo enviar el formulario.');
    }
    return result;
  })
  .then(() => {
    if (window.__avisarNuevoMensaje) window.__avisarNuevoMensaje(nombre, modalidad);
    btn.textContent = '¡Mensaje enviado! ✓';
    btn.style.background = '#2a7a3a';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  })
  .catch(() => {
    btn.textContent = originalText;
    btn.disabled = false;
    errorMsg.style.display = 'block';
  });
}
const formContacto = document.getElementById('formContacto');
if (formContacto) formContacto.addEventListener('submit', handleSubmit);

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('is-open', !isOpen);
  });
  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    }
  });
}

(function() {
  var v = document.getElementById('logoVideo');
  if (!v) return;
  v.muted = true;
  var tryPlay = function() {
    var p = v.play();
    if (p !== undefined) { p.catch(function(){}); }
  };
  if (v.readyState >= 2) { tryPlay(); }
  v.addEventListener('loadeddata', tryPlay);
  document.addEventListener('click', tryPlay, { once: true });
})();
