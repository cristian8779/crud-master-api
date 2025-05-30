// =======================
// Elementos DOM
// =======================
const form = document.getElementById('resetForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modalCloseBtn');

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

      // Mostrar modal 3 segundos y luego ocultar formulario y modal
      setTimeout(() => {
        modal.classList.remove('active');
        form.style.display = 'none';
      }, 3000);
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
// Modal
// =======================
modalCloseBtn?.addEventListener('click', () => {
  modal.classList.remove('active');
  form.style.display = 'none'; // También oculta el formulario al cerrar manualmente
});

// =======================
// Mostrar/Ocultar contraseña
// =======================
document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (!input) return;

    input.type = input.type === 'password' ? 'text' : 'password';
    btn.setAttribute('aria-label', input.type === 'password' ? 'Mostrar' : 'Ocultar');
  });
});

// =======================
// Init
// =======================
window.addEventListener('DOMContentLoaded', verificarToken);
