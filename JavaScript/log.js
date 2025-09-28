document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const API_BASE = 'http://localhost:3000';

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const rol = document.getElementById('rol').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!rol) {
            showAlert('Por favor selecciona tu rol', 'danger');
            return;
        }
        if (!email || !password) {
            showAlert('Por favor completa todos los campos', 'danger');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Por favor ingresa un correo electrónico válido', 'danger');
            return;
        }

        try {
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verificando...';
            submitButton.disabled = true;

            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ rol, email, password })
            });

            const data = await response.json();

            submitButton.textContent = originalText;
            submitButton.disabled = false;

            if (response.ok) {
                showAlert('Inicio de sesión exitoso', 'success');

                // Guardamos el ID del usuario según el rol
                if (rol === 'paciente') {
                    localStorage.setItem('pacienteId', data.user.id);
                } else if (rol === 'trabajador') {
                    localStorage.setItem('trabajadorId', data.user.id);
                }
                if (rol === 'administracion') {
                    localStorage.setItem('adminId', data.user.id);
                }
                // Redirigir
                setTimeout(() => {
                    switch (rol) {
                        case 'paciente':
                            window.location.href = 'index.html'; // aquí entra index_pac.js
                            break;
                        case 'trabajador':
                            window.location.href = 'ind_trab.html'; // aquí entra index_trab.js
                            break;
                        case 'administracion':
                            window.location.href = 'pan_Admin.html';
                            break;
                        default:
                            window.location.href = 'index.html';
                    }
                }, 1500);

            } else {
                showAlert(data.message || 'Error en el inicio de sesión', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Iniciar sesión';
            submitButton.disabled = false;
            showAlert('Error de conexión con el servidor. Verifica que el servidor esté ejecutándose.', 'danger');
        }
    });

    function showAlert(message, type) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) existingAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        loginForm.prepend(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }
});
