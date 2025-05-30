// =======================
// Elementos DOM
// =======================
const form = document.getElementById('resetForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const formContainer = document.querySelector('.form-container');
const formTitle = document.querySelector('.form-title'); // Asegúrate que tengas este elemento en tu HTML

// =======================
// Configuración
// =======================
const baseUrl = 'http://20.251.145.196:5000';
const token = new URLSearchParams(window.location.search).get('token');

// =======================
// Utilidades
// =======================
const showMessage = (msg, type = 'error') => {
  messageEl.textContent = msg;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
};

const hideMessage = () => {
  messageEl.style.display = 'none';
};

// =======================
// Verificar token
// =======================
const verificarToken = async () => {
  if (!token) {
    showMessage('Token no válido.');
    submitBtn.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/reset-password/${encodeURIComponent(token)}`);
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.mensaje || 'Token inválido o expirado.');
      submitBtn.disabled = true;

      // Ocultar solo el formulario y título, pero dejar visible el mensaje
      if (form) form.style.display = 'none';
      if (formTitle) formTitle.style.display = 'none';
    }
  } catch (err) {
    showMessage('Error al verificar token.');
    submitBtn.disabled = true;
  }
};

// =======================
// Enviar nueva contraseña
// =======================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const password = form.newPassword.value.trim();
  const confirm = form.confirmPassword.value.trim();

  if (!password || !confirm) {
    showMessage('Completa todos los campos.');
    return;
  }

  if (password !== confirm) {
    showMessage('Las contraseñas no coinciden.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    const res = await fetch(`${baseUrl}/api/auth/reset-password/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevaPassword: password }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(data.mensaje || 'Contraseña actualizada.', 'success');
      form.reset();
      modal.classList.add('active');

      // Mostrar modal 15 segundos y luego ocultar solo formulario y título,
      // pero dejar mensaje visible para que usuario vea info importante
      setTimeout(() => {
        modal.classList.remove('active');
        if (form) form.style.display = 'none';
        if (formTitle) formTitle.style.display = 'none';
        // El contenedor no se oculta para que el mensaje siga visible
      }, 15000);
    } else {
      showMessage(data.mensaje || 'Error al actualizar la contraseña.');
    }
  } catch (err) {
    showMessage('Error de red. Intenta más tarde.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar nueva contraseña';
  }
});

// =======================
// Modal: botón cerrar
// =======================
modalCloseBtn?.addEventListener('click', () => {
  modal.classList.remove('active');
  if (form) form.style.display = 'none';
  if (formTitle) formTitle.style.display = 'none';
  // De nuevo, mensaje queda visible
});

// =======================
// Mostrar/Ocultar contraseña
// =======================
document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    if (!input) return;

    input.type = input.type === 'password' ? 'text' : 'password';
    btn.setAttribute('aria-label', input.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');

    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

    if (eyeOpen && eyeClosed) {
      if (input.type === 'password') {
        eyeOpen.style.display = 'inline';
        eyeClosed.style.display = 'none';
      } else {
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'inline';
      }
    }
  });
});

// =======================
// Init
// =======================
window.addEventListener('DOMContentLoaded', verificarToken);
