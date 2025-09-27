// index_pac.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - iniciando verificación de sesión');
    checkSessionAndLoadPatientData();
});

// Función para verificar sesión y cargar datos del paciente
async function checkSessionAndLoadPatientData() {
    try {
        console.log('Verificando sesión...');
        
        const sessionResponse = await fetch(`/check-session`, {
            credentials: 'include'
        });
        
        console.log('Respuesta de sesión:', sessionResponse.status);
        const sessionData = await sessionResponse.json();
        console.log('Datos de sesión:', sessionData);
        
        if (!sessionData.loggedIn) {
            console.log('No hay sesión activa, redirigiendo...');
            window.location.href = 'login.html';
            return;
        }

        // Verificar que el usuario sea un paciente
        if (sessionData.user.tipo !== 'paciente') {
            console.log('Usuario no es paciente, redirigiendo...');
            window.location.href = 'login.html';
            return;
        }

        console.log('Sesión activa, cargando datos del paciente ID:', sessionData.user.id);
        await loadPatientData(sessionData.user.id);
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        showError('Error de conexión con el servidor');
    }
}

// Función para cargar datos del paciente
async function loadPatientData(userId) {
    try {
        console.log('Cargando datos del paciente con ID:', userId);
        
        const response = await fetch(`/api/paciente/${userId}`, {
            credentials: 'include',
            
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Respuesta del servidor:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const patientData = await response.json();
        console.log('Datos del paciente recibidos:', patientData);
        
        updatePatientInterface(patientData);
        
    } catch (error) {
        console.error('Error cargando datos del paciente:', error);
        showError('Error al cargar la información del paciente: ' + error.message);
    }
}

// Función para actualizar la interfaz con los datos del paciente
function updatePatientInterface(patientData) {
    console.log('Actualizando interfaz con datos:', patientData);
    
    // Actualizar header del paciente
    const fullName = `${patientData.primer_nombre} ${patientData.segundo_nombre || ''} ${patientData.primer_apellido} ${patientData.segundo_apellido || ''}`.trim();
    document.getElementById('patient-fullname').textContent = fullName;
    
    const age = calculateAge(patientData.fecha_nacimiento);
    document.getElementById('patient-info').textContent = 
        `ID: ${patientData.cod_pac || 'N/A'} | Cédula: ${patientData.cedula} | Edad: ${age} años`;

    // Actualizar sección de identificación
    updateIdentificationSection(patientData);
}

// Función para actualizar la sección de identificación
function updateIdentificationSection(patientData) {
    console.log('Actualizando sección de identificación');
    
    // Columna izquierda
    const leftColumn = document.querySelector('#identificacion .col-md-6:nth-child(1)');
    if (leftColumn) {
        leftColumn.innerHTML = `
            <p><strong>Nombre completo:</strong> ${patientData.primer_nombre} ${patientData.segundo_nombre || ''} ${patientData.primer_apellido} ${patientData.segundo_apellido || ''}</p>
            <p><strong>Cédula:</strong> ${patientData.cedula}</p>
            <p><strong>Fecha de nacimiento:</strong> ${formatDate(patientData.fecha_nacimiento)}</p>
            <p><strong>Edad:</strong> ${calculateAge(patientData.fecha_nacimiento)} años</p>
            <p><strong>Género:</strong> ${patientData.genero || 'No especificado'}</p>
        `;
    }

    // Columna derecha
    const rightColumn = document.querySelector('#identificacion .col-md-6:nth-child(2)');
    if (rightColumn) {
        rightColumn.innerHTML = `
            <p><strong>Teléfono:</strong> ${patientData.celular || 'No especificado'}</p>
            <p><strong>Correo electrónico:</strong> ${patientData.correo}</p>
            <p><strong>Dirección:</strong> ${patientData.direccion || 'No especificada'}</p>
            <p><strong>Ocupación:</strong> ${patientData.ocupacion || 'No especificada'}</p>
            <p><strong>Estado civil:</strong> ${patientData.estado_civil || 'No especificado'}</p>
        `;
    }
}

// Función para calcular la edad desde la fecha de nacimiento
function calculateAge(birthDate) {
    if (!birthDate) return 'No especificada';
    
    try {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    } catch (error) {
        console.error('Error calculando edad:', error);
        return 'Error';
    }
}

// Función para formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'No especificada';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Fecha inválida';
    }
}

// Función para mostrar errores
function showError(message) {
    console.error('Error:', message);
    // Puedes implementar un sistema de notificaciones más elegante
    alert(message);
}

// Manejar cierre de sesión
document.addEventListener('click', function(e) {
    if (e.target.closest('a[href="login.html"]')) {
        e.preventDefault();
        logout();
    }
});

// Función para cerrar sesión
async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        window.location.href = 'login.html';
    }
}