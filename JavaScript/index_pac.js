// index_pac.js
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM cargado - iniciando verificación de paciente");

    const API_BASE = "http://localhost:3000";
    const pacienteId = localStorage.getItem("pacienteId");

    if (!pacienteId) {
        console.warn("No se encontró pacienteId en localStorage");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/paciente/${pacienteId}`, {
            credentials: "include"
        });

        if (response.status === 401) {
            console.warn("No autenticado, redirigiendo a login");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Error cargando los datos del paciente");
        }

        const paciente = await response.json();
        console.log("Datos del paciente:", paciente);

        // === Calcular edad ===
        let edad = "No disponible";
        let fechaNacimientoFormateada = "No disponible";
        if (paciente.fecha_nacimiento) {
            const nacimiento = new Date(paciente.fecha_nacimiento);
            const hoy = new Date();
            edad = hoy.getFullYear() - nacimiento.getFullYear();
            const m = hoy.getMonth() - nacimiento.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
            }
            // Formato YYYY-MM-DD
            fechaNacimientoFormateada = nacimiento.toISOString().split("T")[0];
        }

        // === Actualizar cabecera ===
        document.getElementById("patient-fullname").textContent =
            `${paciente.primer_nombre} ${paciente.segundo_nombre || ""} ${paciente.primer_apellido} ${paciente.segundo_apellido || ""}`;
        document.getElementById("patient-info").textContent =
            `Código: ${paciente.cod_pac} | Cédula: ${paciente.cedula || "No disponible"} | Edad: ${edad} años`;

        // === Actualizar sección de Identificación ===
        document.getElementById("patient-fullname-ident").textContent =
            `${paciente.primer_nombre} ${paciente.segundo_nombre || ""} ${paciente.primer_apellido} ${paciente.segundo_apellido || ""}`;
        document.getElementById("patient-cedula").textContent = paciente.cedula || "No disponible";
        document.getElementById("patient-fecha-nacimiento").textContent = fechaNacimientoFormateada;
        document.getElementById("patient-edad").textContent = `${edad} años`;
        document.getElementById("patient-genero").textContent = paciente.genero || "No disponible";
        document.getElementById("patient-telefono").textContent = paciente.celular || "No disponible";
        document.getElementById("patient-email").textContent = paciente.correo || "No disponible";
        document.getElementById("patient-direccion").textContent = paciente.direccion || "No disponible";
        document.getElementById("patient-ocupacion").textContent = paciente.ocupacion || "No disponible";
        document.getElementById("patient-estado-civil").textContent = paciente.estado_civil || "No disponible";

    } catch (err) {
        console.error("Error obteniendo datos del paciente:", err);
        alert("No se pudieron cargar los datos del paciente");
    }
});

//---------------------------------------------

// Función para cargar y mostrar las citas del paciente
function cargarCitasPaciente() {
    const listaCitas = document.getElementById('lista-citas');
    const sinCitas = document.getElementById('sin-citas');
    
    // Obtener citas del localStorage
    const citas = JSON.parse(localStorage.getItem('citasPacientes')) || [];
    
    // Filtrar citas del paciente actual (puedes ajustar esta lógica según tu implementación)
    const pacienteActual = "NIREGA DEL CARMEN BALMACEDA LÓPEZ"; // Esto debería venir de la sesión
    const citasPaciente = citas.filter(cita => cita.paciente === pacienteActual);
    
    // Limpiar lista actual
    listaCitas.innerHTML = '';
    
    if (citasPaciente.length === 0) {
        sinCitas.style.display = 'block';
        return;
    }
    
    sinCitas.style.display = 'none';
    
    // Mostrar cada cita
    citasPaciente.forEach(cita => {
        const citaCard = document.createElement('div');
        citaCard.className = `card cita-card mb-3 ${cita.estado.toLowerCase()}`;
        
        // Determinar clase de estado para el badge
        let estadoClase = 'bg-secondary';
        if (cita.estado === 'Aprobada') estadoClase = 'bg-success';
        if (cita.estado === 'Pendiente') estadoClase = 'bg-warning';
        if (cita.estado === 'Cancelada') estadoClase = 'bg-danger';
        
        citaCard.innerHTML = `
            <div class="card-body">
                <div class="cita-info">
                    <div class="cita-details">
                        <h6 class="card-title">${cita.especialidad}</h6>
                        <p class="mb-1"><strong>Doctor:</strong> ${cita.medico}</p>
                        <p class="mb-1"><strong>Consultorio:</strong> ${cita.consultorio || 'Por asignar'}</p>
                        <p class="mb-1"><strong>Fecha y hora:</strong> ${formatearFecha(cita.fecha)} ${cita.hora}</p>
                        ${cita.motivo ? `<p class="mb-0"><strong>Motivo:</strong> ${cita.motivo}</p>` : ''}
                    </div>
                    <div class="cita-status">
                        <span class="badge estado-badge ${estadoClase}">${cita.estado}</span>
                    </div>
                </div>
            </div>
        `;
        
        listaCitas.appendChild(citaCard);
    });
}

// Función para formatear la fecha
function formatearFecha(fechaString) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}

// Cargar citas cuando la pestaña esté activa
document.addEventListener('DOMContentLoaded', function() {
    // Escuchar cambios en las pestañas
    const citaTab = document.getElementById('cita-tab');
    if (citaTab) {
        citaTab.addEventListener('click', function() {
            setTimeout(cargarCitasPaciente, 100);
        });
    }
    
    // Cargar citas si ya estamos en la pestaña de citas
    if (window.location.hash === '#cita' || document.getElementById('cita').classList.contains('active')) {
        cargarCitasPaciente();
    }
});