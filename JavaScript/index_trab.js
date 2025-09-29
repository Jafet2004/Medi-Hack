// index_trab.js - Versión corregida
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado - Portal Trabajador iniciado");

    // Elementos DOM
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const patientHeader = document.getElementById('patientHeader');
    const patientContent = document.getElementById('patientContent');
    const noPatientMessage = document.getElementById('noPatientMessage');
    const patientName = document.getElementById('patientName');
    const patientInfo = document.getElementById('patientInfo');
    const patientPhoto = document.getElementById('patientPhoto');
    const patientBloodType = document.getElementById('patientBloodType');
    const patientAllergies = document.getElementById('patientAllergies');
    const patientChronic = document.getElementById('patientChronic');
    const saveButton = document.getElementById('saveButton');
    const crearHistorialBtn = document.getElementById('crearHistorialBtn');

    // Función para buscar pacientes en la base de datos
    async function buscarPacientes(termino) {
        searchResults.innerHTML = '';
        
        if (termino.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/buscar-pacientes?q=${encodeURIComponent(termino)}`);
            
            if (!response.ok) {
                throw new Error('Error en la búsqueda');
            }
            
            const pacientes = await response.json();
            
            if (pacientes.length > 0) {
                pacientes.forEach(paciente => {
                    const item = document.createElement('div');
                    item.className = 'search-item';
                    item.innerHTML = `
                        <h6 class="mb-1">${paciente.primer_nombre} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido} ${paciente.segundo_apellido || ''}</h6>
                        <small class="text-muted">${paciente.cedula} | Código: ${paciente.cod_pac}</small>
                    `;
                    item.addEventListener('click', () => seleccionarPaciente(paciente));
                    searchResults.appendChild(item);
                });
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="search-item text-muted">No se encontraron pacientes</div>';
                searchResults.style.display = 'block';
            }
        } catch (err) {
            console.error('Error en la búsqueda:', err);
            searchResults.innerHTML = '<div class="search-item text-muted">Error en la búsqueda</div>';
            searchResults.style.display = 'block';
        }
    }

    // Función para seleccionar un paciente
    async function seleccionarPaciente(paciente) {
        // Actualizar información básica del paciente
        const nombreCompleto = `${paciente.primer_nombre} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido} ${paciente.segundo_apellido || ''}`;
        patientName.textContent = nombreCompleto;
        
        // Cargar información detallada del paciente
        await cargarInformacionPaciente(paciente.id_usuario);
        
        patientHeader.style.display = 'block';
        patientContent.style.display = 'block';
        noPatientMessage.style.display = 'none';
        searchResults.style.display = 'none';
        searchInput.value = '';
    }

    // Función para cargar información detallada del paciente
    async function cargarInformacionPaciente(pacienteId) {
        try {
            // Cargar datos básicos del paciente
            const response = await fetch(`http://localhost:3000/api/paciente/${pacienteId}`);
            
            if (!response.ok) {
                throw new Error('Error cargando datos del paciente');
            }
            
            const paciente = await response.json();
            
            // Calcular edad
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
                fechaNacimientoFormateada = nacimiento.toISOString().split("T")[0];
            }

            // Actualizar información del encabezado
            patientInfo.textContent = `ID: ${paciente.id_usuario} | Cédula: ${paciente.cedula || "No disponible"} | Edad: ${edad} años`;
            
            // Actualizar sección de identificación
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

            // Cargar historial clínico
            await cargarHistorialClinico(pacienteId);
            
        } catch (err) {
            console.error('Error cargando información del paciente:', err);
            alert('No se pudieron cargar los datos completos del paciente');
        }
    }

    // Función para cargar historial clínico
    async function cargarHistorialClinico(pacienteId) {
        try {
            const response = await fetch(`http://localhost:3000/api/historial-completo/${pacienteId}`);
            
            if (!response.ok) {
                throw new Error('Error cargando historial');
            }
            
            const data = await response.json();
            
            const historiaCrearDiv = document.getElementById('historia-crear');
            const historiaContenidoDiv = document.getElementById('historia-contenido');

            if (!data.tieneHistorial) {
                // No tiene historial, mostrar opción para crear
                if (historiaCrearDiv) {
                    historiaCrearDiv.style.display = 'block';
                }
                if (historiaContenidoDiv) {
                    historiaContenidoDiv.style.display = 'none';
                }
                
                // Actualizar badges con información por defecto
                patientBloodType.textContent = 'Tipo Sanguíneo: No especificado';
                patientAllergies.textContent = 'Alergias: No registradas';
                patientChronic.textContent = 'Condiciones Crónicas: No registradas';
            } else {
                // Tiene historial, mostrar la información
                if (historiaCrearDiv) {
                    historiaCrearDiv.style.display = 'none';
                }
                if (historiaContenidoDiv) {
                    historiaContenidoDiv.style.display = 'block';
                }
                
                // Cargar datos del historial
                loadHistorialData(data.historial);
                
                // Actualizar badges con información del historial
                patientBloodType.textContent = `Tipo Sanguíneo: ${data.historial.tipo_sangre || 'No especificado'}`;
                
                const alergias = data.historial.alergias && data.historial.alergias.length > 0 ? 
                    data.historial.alergias.map(a => a.alergia || a).join(', ') : 'No registradas';
                patientAllergies.textContent = `Alergias: ${alergias}`;
                
                const enfermedades = data.historial.enfermedades_cronicas && data.historial.enfermedades_cronicas.length > 0 ? 
                    data.historial.enfermedades_cronicas.map(e => e.enfermedad || e).join(', ') : 'No registradas';
                patientChronic.textContent = `Condiciones Crónicas: ${enfermedades}`;
            }
        } catch (err) {
            console.error('Error cargando historial clínico:', err);
            // En caso de error, mostrar la opción para crear historial
            const historiaCrearDiv = document.getElementById('historia-crear');
            const historiaContenidoDiv = document.getElementById('historia-contenido');
            
            if (historiaCrearDiv) {
                historiaCrearDiv.style.display = 'block';
            }
            if (historiaContenidoDiv) {
                historiaContenidoDiv.style.display = 'none';
            }
        }
    }

    // Función para cargar datos del historial
    function loadHistorialData(historial) {
        console.log('Cargando datos del historial:', historial);
        
        // Tipo de sangre
        const tipoSangreElem = document.getElementById('historia-tipo-sangre');
        if (tipoSangreElem) {
            tipoSangreElem.textContent = historial.tipo_sangre || 'No especificado';
        }
        
        // Enfermedades crónicas
        const enfermedadesDiv = document.getElementById('historia-enfermedades');
        if (enfermedadesDiv) {
            if (historial.enfermedades_cronicas && historial.enfermedades_cronicas.length > 0) {
                enfermedadesDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.enfermedades_cronicas.map(enf => 
                        `<li><i class="fas fa-circle small me-2"></i>${enf.enfermedad || enf}</li>`
                    ).join('') + '</ul>';
            } else {
                enfermedadesDiv.innerHTML = '<p>No se han registrado enfermedades crónicas</p>';
            }
        }
        
        // Alergias
        const alergiasDiv = document.getElementById('historia-alergias');
        if (alergiasDiv) {
            if (historial.alergias && historial.alergias.length > 0) {
                alergiasDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.alergias.map(alergia => 
                        `<li><i class="fas fa-circle small me-2"></i>${alergia.alergia || alergia}</li>`
                    ).join('') + '</ul>';
            } else {
                alergiasDiv.innerHTML = '<p>No se han registrado alergias</p>';
            }
        }
        
        // Cirugías
        const cirugiasDiv = document.getElementById('historia-cirugias');
        if (cirugiasDiv) {
            if (historial.cirugias && historial.cirugias.length > 0) {
                cirugiasDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.cirugias.map(cirugia => 
                        `<li><i class="fas fa-circle small me-2"></i>${cirugia.tipo_cirugia} 
                         ${cirugia.fecha_cirugia ? `- ${new Date(cirugia.fecha_cirugia).toLocaleDateString()}` : ''}</li>`
                    ).join('') + '</ul>';
            } else {
                cirugiasDiv.innerHTML = '<p>No se han registrado cirugías previas</p>';
            }
        }
        
        // Hospitalizaciones
        const hospitalizacionesDiv = document.getElementById('historia-hospitalizaciones');
        if (hospitalizacionesDiv) {
            if (historial.hospitalizaciones && historial.hospitalizaciones.length > 0) {
                hospitalizacionesDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.hospitalizaciones.map(hosp => 
                        `<li><i class="fas fa-circle small me-2"></i>${hosp.motivo} 
                         ${hosp.fecha ? `- ${new Date(hosp.fecha).toLocaleDateString()}` : ''}</li>`
                    ).join('') + '</ul>';
            } else {
                hospitalizacionesDiv.innerHTML = '<p>No se han registrado hospitalizaciones previas</p>';
            }
        }
        
        // Antecedentes familiares
        const antecedentesElem = document.getElementById('historia-antecedentes');
        if (antecedentesElem) {
            antecedentesElem.textContent = 
                historial.antecedentes_familiares || 'No se han registrado antecedentes familiares';
        }
        
        // Medicamentos
        const medicamentosDiv = document.getElementById('historia-medicamentos');
        if (medicamentosDiv) {
            if (historial.medicamentos && historial.medicamentos.length > 0) {
                medicamentosDiv.innerHTML = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th></tr></thead><tbody>' + 
                    historial.medicamentos.map(med => 
                        `<tr><td>${med.nombre_medicamento}</td><td>${med.dosis || '-'}</td><td>${med.frecuencia || '-'}</td></tr>`
                    ).join('') + '</tbody></table></div>';
            } else {
                medicamentosDiv.innerHTML = '<p>No se han registrado medicamentos actuales</p>';
            }
        }
    }

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            buscarPacientes(searchInput.value);
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            buscarPacientes(searchInput.value);
        });
    }

    if (crearHistorialBtn) {
        crearHistorialBtn.addEventListener('click', () => {
            const pacienteId = obtenerPacienteIdActual();
            if (pacienteId) {
                window.location.href = `historiaCl.html?id=${pacienteId}`;
            } else {
                alert('No se ha seleccionado un paciente');
            }
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => {
            alert('Cambios guardados correctamente');
        });
    }

    // Función auxiliar para obtener el ID del paciente actual
    function obtenerPacienteIdActual() {
        // Buscar en el texto del elemento patientInfo
        const infoText = patientInfo.textContent;
        const idMatch = infoText.match(/ID:\s*(\d+)/);
        return idMatch ? idMatch[1] : null;
    }

    // Cerrar resultados de búsqueda al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (searchInput && searchResults && 
            !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    console.log("Portal Trabajador inicializado correctamente");
});




// Función para cargar información del trabajador
async function cargarInformacionTrabajador() {
    try {
        // Verificar sesión primero
        const sessionResponse = await fetch("http://localhost:3000/check-session", {
            credentials: "include"
        });

        if (!sessionResponse.ok) {
            throw new Error("Error verificando sesión");
        }

        const sessionData = await sessionResponse.json();
        console.log("Datos de sesión:", sessionData);

        if (!sessionData.loggedIn || !sessionData.user) {
            console.log("Usuario no autenticado");
            actualizarInterfazTrabajador(null, null);
            return;
        }

        console.log("Usuario ID:", sessionData.user.id, "Tipo:", sessionData.user.tipo);

        // Obtener información del trabajador
        const trabajadorResponse = await fetch(`http://localhost:3000/api/trabajador/${sessionData.user.id}`, {
            credentials: "include"
        });

        if (!trabajadorResponse.ok) {
            throw new Error(`Error HTTP: ${trabajadorResponse.status}`);
        }

        const trabajador = await trabajadorResponse.json();
        console.log("Datos del trabajador:", trabajador);

        // Actualizar la interfaz
        actualizarInterfazTrabajador(trabajador, sessionData.user);

    } catch (err) {
        console.error("Error cargando información del trabajador:", err);
        actualizarInterfazTrabajador(null, null);
    }
}

// Función para actualizar la interfaz con la información del trabajador
function actualizarInterfazTrabajador(trabajador, userSession) {
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");
    const dropdownUserName = document.getElementById("dropdownUserName");
    const dropdownUserSpecialty = document.getElementById("dropdownUserSpecialty");

    if (trabajador) {
        const nombreCompleto = `${trabajador.primer_nombre || ""} ${trabajador.segundo_nombre || ""} ${trabajador.primer_apellido || ""} ${trabajador.segundo_apellido || ""}`
            .trim()
            .replace(/\s+/g, " ");

        const iniciales = `${(trabajador.primer_nombre || "").charAt(0)}${(trabajador.primer_apellido || "").charAt(0)}`.toUpperCase();

        console.log("Actualizando interfaz con:", { nombreCompleto, iniciales, especialidad: trabajador.especialidad });

        // 🔹 Avatar y nombre en la navbar
        if (userAvatar) userAvatar.textContent = iniciales || "UM";
        if (userName) userName.textContent = nombreCompleto || "Usuario Médico";

        // 🔹 Dropdown principal
        if (dropdownUserName) dropdownUserName.textContent = nombreCompleto || "Usuario Médico";
        if (dropdownUserSpecialty) dropdownUserSpecialty.textContent = trabajador.especialidad || "Profesional de la salud";

        // 🔹 Datos dentro de "Mi Perfil"
        if (document.getElementById("userProfileName")) {
            document.getElementById("userProfileName").textContent = nombreCompleto || "Usuario Médico";
        }
        if (document.getElementById("userProfileSpecialty")) {
            document.getElementById("userProfileSpecialty").textContent = trabajador.especialidad || "Profesional de la salud";
        }

    } else {
        console.log("Usando información por defecto");

        if (userAvatar) userAvatar.textContent = "UM";
        if (userName) userName.textContent = "Médico";
        if (dropdownUserName) dropdownUserName.textContent = "Usuario Médico";
        if (dropdownUserSpecialty) dropdownUserSpecialty.textContent = "Profesional de la salud";

        if (document.getElementById("userProfileName")) {
            document.getElementById("userProfileName").textContent = "Usuario Médico";
        }
        if (document.getElementById("userProfileSpecialty")) {
            document.getElementById("userProfileSpecialty").textContent = "Profesional de la salud";
        }
    }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarInformacionTrabajador);
