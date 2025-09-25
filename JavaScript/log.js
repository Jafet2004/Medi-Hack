document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const API_BASE = 'http://localhost:3000';

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Obtener valores del formulario
        const rol = document.getElementById('rol').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validaciones básicas
        if (!rol) {
            showAlert('Por favor selecciona tu rol', 'danger');
            return;
        }

        if (!email || !password) {
            showAlert('Por favor completa todos los campos', 'danger');
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Por favor ingresa un correo electrónico válido', 'danger');
            return;
        }

        try {
            // Mostrar indicador de carga
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verificando...';
            submitButton.disabled = true;

            // Enviar datos al servidor
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Importante para cookies de sesión
                body: JSON.stringify({ rol, email, password })
            });

            const data = await response.json();

            // Restaurar botón
            submitButton.textContent = originalText;
            submitButton.disabled = false;

            if (response.ok) {
                // Login exitoso
                showAlert('Inicio de sesión exitoso', 'success');

                // Redireccionar según el rol
                setTimeout(() => {
                    switch (rol) {
                        case 'paciente':
                            window.location.href = 'index.html';
                            break;
                        case 'trabajador':
                            window.location.href = 'ind_trab.html';
                            break;
                        case 'administracion':
                            window.location.href = 'pan_Admin.html';
                            break;
                        default:
                            window.location.href = 'index.html';
                    }

                }, 1500);
            } else {
                // Error en el login
                showAlert(data.message || 'Error en el inicio de sesión', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);

            // Restaurar botón
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Iniciar sesión';
            submitButton.disabled = false;

            showAlert('Error de conexión con el servidor. Verifica que el servidor esté ejecutándose.', 'danger');
        }
    });

    // Función para mostrar alertas
    function showAlert(message, type) {
        // Eliminar alertas previas
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Crear elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insertar la alerta en el formulario
        loginForm.prepend(alertDiv);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }
});