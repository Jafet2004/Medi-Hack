// Manejo del formulario de registro para trabajadores
        document.getElementById('registerFormTrab').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validación básica
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            // Aquí iría la lógica para enviar los datos al servidor
            // y registrar al trabajador en la base de datos
            
            // Simulación de registro exitoso
            alert('Registro exitoso. Ahora puede iniciar sesión.');
            window.location.href = 'login.html';
        });

        // Previsualización de la imagen seleccionada
        document.getElementById('foto').addEventListener('change', function(e) {
            const container = document.querySelector('.profile-picture-container');
            const placeholder = document.querySelector('.profile-picture-placeholder');
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Crear imagen si no existe
                    let img = container.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        container.appendChild(img);
                    }
                    
                    img.src = e.target.result;
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                }
                
                reader.readAsDataURL(this.files[0]);
            }
        });