const form = document.getElementById('resetForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modalCloseBtn');

const baseUrl = 'http://20.251.145.196:5000';
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutos
let attempts = 0;
let lockUntil = null;

function showMessage(msg, type = 'error') {
  messageEl.textContent = msg;
  messageEl.className = `message show ${type === 'success' ? 'success' : 'error'}`;
  messageEl.style.display = 'block';
}

function hideMessage() {
  messageEl.style.display = 'none';
}

function sanitizeInput(input) {
  // Elimina caracteres problemáticos y espacios al inicio y final
  return input.replace(/[<>"'`;]/g, '').trim();
}

function validatePassword(password) {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y sin espacios
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/;
  return regex.test(password);
}

function isLocked() {
  return lockUntil && Date.now() < lockUntil;
}

function getRemainingLockTimeSeconds() {
  return Math.ceil((lockUntil - Date.now()) / 1000);
}

async function verifyToken() {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    showMessage('Token no válido o no encontrado en la URL.');
    submitBtn.disabled = true;
    return false;
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/reset-password/${encodeURIComponent(token)}`);
    const data = await res.json();

    if (!res.ok || !data.valido) {
      showMessage(data.mensaje || 'Este enlace para cambiar la contraseña ha expirado o es inválido.');
      submitBtn.disabled = true;
      return false;
    }
    return true;
  } catch {
    showMessage('Error de conexión al verificar el token.');
    submitBtn.disabled = true;
    return false;
  }
}

function lockForm() {
  lockUntil = Date.now() + LOCK_TIME_MS;
  submitBtn.disabled = true;
  showMessage(`Demasiados intentos fallidos. Intenta nuevamente en ${LOCK_TIME_MS / 60000} minutos.`);
}

window.addEventListener('DOMContentLoaded', async () => {
  await verifyToken();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isLocked()) {
    showMessage(`Demasiados intentos fallidos. Intenta de nuevo en ${getRemainingLockTimeSeconds()} segundos.`);
    return;
  }

  hideMessage();

  const newPasswordRaw = form.newPassword.value;
  const confirmPasswordRaw = form.confirmPassword.value;
  const newPassword = sanitizeInput(newPasswordRaw);
  const confirmPassword = sanitizeInput(confirmPasswordRaw);

  if (!newPassword) {
    showMessage('La contraseña es obligatoria.');
    return;
  }
  if (!validatePassword(newPassword)) {
    showMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número, sin espacios.');
    return;
  }
  if (!confirmPassword) {
    showMessage('Confirma tu contraseña.');
    return;
  }
  if (newPassword !== confirmPassword) {
    showMessage('Las contraseñas no coinciden.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Guardando... <span class="spinner"></span>';

  try {
    const res = await fetch(`${baseUrl}/api/auth/reset-password/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevaPassword: newPassword }),
      credentials: 'same-origin',
    });

    const data = await res.json();

    if (res.ok) {
      form.reset();
      showMessage('Contraseña actualizada correctamente.', 'success');
      modal.classList.add('active');
      attempts = 0; // Resetear intentos tras éxito
    } else {
      // Manejo errores específicos
      if (res.status === 400 && data.mensaje?.toLowerCase().includes('token')) {
        showMessage(data.mensaje || 'Token inválido o expirado.');
        submitBtn.disabled = true;
      } else if (res.status === 429) {
        showMessage('Demasiadas solicitudes. Por favor espera un momento.');
      } else {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          lockForm();
        } else {
          showMessage(data.mensaje || 'Error al actualizar contraseña.');
        }
      }
    }
  } catch {
    showMessage('Error de conexión. Intenta nuevamente.');
  } finally {
    if (!isLocked()) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar nueva contraseña';
    }
  }
});

modalCloseBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Mostrar/Ocultar contraseña con accesibilidad
document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const eyeOpen = button.querySelector('#eye-open');
    const eyeClosed = button.querySelector('#eye-closed');

    if (eyeOpen && eyeClosed) {
      eyeOpen.style.display = isPassword ? 'inline' : 'none';
      eyeClosed.style.display = isPassword ? 'none' : 'inline';
    }

    button.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});
