document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aquí iría la lógica de validación con el backend
            // Por ahora, simulamos un inicio de sesión exitoso
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simulación de validación (en un caso real, esto se haría con el servidor)
            if (email && password) {
                // Redirigir al index después del login exitoso
                window.location.href = 'index.html';
            } else {
                alert('Por favor, complete todos los campos');
            }
        });