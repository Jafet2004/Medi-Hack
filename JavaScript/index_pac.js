// JavaScript para la página del paciente
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/paciente/me', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // No autenticado, redirigir a login
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.paciente) {
            const paciente = data.paciente;
            
            // Calcular edad a partir de la fecha de nacimiento
            const edad = calcularEdad(paciente.fecha_nacimiento);
            
            // Actualizar el header del paciente
            actualizarPatientHeader(paciente, edad);
            
            // Actualizar datos de identificación
            actualizarDatosIdentificacion(paciente, edad);
            
            // Configurar la visibilidad de las secciones según autenticación
            configurarVisibilidadSecciones(true);
            
        } else {
            throw new Error('Datos del paciente no disponibles');
        }
    } catch (error) {
        console.error("Error obteniendo datos:", error);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            // No autorizado, redirigir a login
            window.location.href = "login.html";
        } else {
            // Mostrar mensaje de error al usuario
            mostrarError("Error al cargar los datos del paciente. Por favor, recarga la página.");
            configurarVisibilidadSecciones(false);
        }
    }
});

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 'No especificada';
    
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return `${edad} años`;
}

function actualizarPatientHeader(paciente, edad) {
    // Construir nombre completo
    const nombreCompleto = [
        paciente.primer_nombre,
        paciente.segundo_nombre,
        paciente.primer_apellido,
        paciente.segundo_apellido
    ].filter(Boolean).join(' ');
    
    // Actualizar elementos del DOM
    document.getElementById('patient-fullname').textContent = nombreCompleto || 'Nombre no disponible';
    document.getElementById('patient-info').textContent = 
        `ID: ${paciente.id_usuario || 'N/A'} | Cédula: ${paciente.cedula || 'N/A'} | Edad: ${edad}`;
    
    // Actualizar foto con las iniciales del paciente
    const iniciales = obtenerIniciales(paciente);
    document.getElementById('patient-photo').src = 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciales)}&size=120&background=random`;
}

function actualizarDatosIdentificacion(paciente, edad) {
    const nombreCompleto = [
        paciente.primer_nombre,
        paciente.segundo_nombre,
        paciente.primer_apellido,
        paciente.segundo_apellido
    ].filter(Boolean).join(' ');
    
    const identificacionHTML = `
        <div class="col-md-6">
            <p><strong>Nombre completo:</strong> ${nombreCompleto || 'No especificado'}</p>
            <p><strong>Cédula:</strong> ${paciente.cedula || 'No especificada'}</p>
            <p><strong>Fecha de nacimiento:</strong> ${formatearFecha(paciente.fecha_nacimiento) || 'No especificada'}</p>
            <p><strong>Edad:</strong> ${edad}</p>
            <p><strong>Género:</strong> ${paciente.genero || 'No especificado'}</p>
            <p><strong>Nacionalidad:</strong> ${paciente.nacionalidad || 'No especificada'}</p>
        </div>
        <div class="col-md-6">
            <p><strong>Teléfono:</strong> ${paciente.celular || 'No especificado'}</p>
            <p><strong>Correo electrónico:</strong> ${paciente.correo || 'No especificado'}</p>
            <p><strong>Dirección:</strong> ${paciente.direccion || 'No especificada'}</p>
            <p><strong>Ocupación:</strong> ${paciente.ocupacion || 'No especificada'}</p>
            <p><strong>Estado civil:</strong> ${paciente.estado_civil || 'No especificado'}</p>
            <p><strong>Tipo de sangre:</strong> ${paciente.tipo_sangre || 'No especificado'}</p>
        </div>
    `;
    
    const identificacionContainer = document.querySelector('#identificacion .card-body .row');
    if (identificacionContainer) {
        identificacionContainer.innerHTML = identificacionHTML;
    }
    
    // Actualizar contacto de emergencia si está disponible
    actualizarContactoEmergencia(paciente);
}

function actualizarContactoEmergencia(paciente) {
    const contactoEmergenciaHTML = `
        <h5 class="section-title">Contacto de Emergencia</h5>
        <p><strong>Nombre:</strong> ${paciente.contacto_emergencia_nombre || 'No especificado'}</p>
        <p><strong>Parentesco:</strong> ${paciente.contacto_emergencia_parentesco || 'No especificado'}</p>
        <p><strong>Teléfono:</strong> ${paciente.contacto_emergencia_telefono || 'No especificado'}</p>
    `;
    
    const contactoContainer = document.querySelector('#identificacion .card-body .mt-3');
    if (contactoContainer) {
        contactoContainer.innerHTML = contactoEmergenciaHTML;
    }
}

function obtenerIniciales(paciente) {
    const inicialNombre = paciente.primer_nombre ? paciente.primer_nombre.charAt(0) : '';
    const inicialApellido = paciente.primer_apellido ? paciente.primer_apellido.charAt(0) : '';
    return `${inicialNombre}${inicialApellido}` || 'U';
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    
    try {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES');
    } catch (error) {
        return fecha;
    }
}

function configurarVisibilidadSecciones(autenticado) {
    // Mostrar/ocultar secciones según autenticación
    const seccionesNoAutenticadas = document.getElementById('historia-no-autenticado');
    const seccionesAutenticadas = document.getElementById('historia-ver');
    
    if (seccionesNoAutenticadas && seccionesAutenticadas) {
        if (autenticado) {
            seccionesNoAutenticadas.style.display = 'none';
            seccionesAutenticadas.style.display = 'block';
        } else {
            seccionesNoAutenticadas.style.display = 'block';
            seccionesAutenticadas.style.display = 'none';
        }
    }
}

function mostrarError(mensaje) {
    // Crear y mostrar mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar al inicio del contenido principal
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
    }
}

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});