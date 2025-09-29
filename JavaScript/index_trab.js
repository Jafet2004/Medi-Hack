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
                            <small class="text-muted">${paciente.cedula} | ID: ${paciente.id_usuario}</small>
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
            // Guardar ID del paciente para uso posterior
            localStorage.setItem('pacienteId', paciente.id_usuario);
            
            // Actualizar información básica del paciente
            const nombreCompleto = `${paciente.primer_nombre} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido} ${paciente.segundo_apellido || ''}`;
            patientName.textContent = nombreCompleto;
            patientPhoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=120&background=random`;
            
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
                    historiaCrearDiv.style.display = 'block';
                    historiaContenidoDiv.style.display = 'none';
                    
                    // Actualizar badges con información por defecto
                    patientBloodType.textContent = 'Tipo Sanguíneo: No especificado';
                    patientAllergies.textContent = 'Alergias: No registradas';
                    patientChronic.textContent = 'Condiciones Crónicas: No registradas';
                } else {
                    // Tiene historial, mostrar la información
                    historiaCrearDiv.style.display = 'none';
                    historiaContenidoDiv.style.display = 'block';
                    
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
                document.getElementById('historia-crear').style.display = 'block';
                document.getElementById('historia-contenido').style.display = 'none';
            }
        }

        // Función para cargar datos del historial (similar a la de index.html)
        function loadHistorialData(historial) {
            // Tipo de sangre
            document.getElementById('historia-tipo-sangre').textContent = 
                historial.tipo_sangre || 'No especificado';
            
            // Enfermedades crónicas
            const enfermedadesDiv = document.getElementById('historia-enfermedades');
            if (historial.enfermedades_cronicas && historial.enfermedades_cronicas.length > 0) {
                enfermedadesDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.enfermedades_cronicas.map(enf => 
                        `<li><i class="fas fa-circle small me-2"></i>${enf.enfermedad || enf}</li>`
                    ).join('') + '</ul>';
            } else {
                enfermedadesDiv.innerHTML = '<p>No se han registrado enfermedades crónicas</p>';
            }
            
            // Alergias
            const alergiasDiv = document.getElementById('historia-alergias');
            if (historial.alergias && historial.alergias.length > 0) {
                alergiasDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.alergias.map(alergia => 
                        `<li><i class="fas fa-circle small me-2"></i>${alergia.alergia || alergia}</li>`
                    ).join('') + '</ul>';
            } else {
                alergiasDiv.innerHTML = '<p>No se han registrado alergias</p>';
            }
            
            // Cirugías
            const cirugiasDiv = document.getElementById('historia-cirugias');
            if (historial.cirugias && historial.cirugias.length > 0) {
                cirugiasDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.cirugias.map(cirugia => 
                        `<li><i class="fas fa-circle small me-2"></i>${cirugia.cirugia || cirugia}</li>`
                    ).join('') + '</ul>';
            } else {
                cirugiasDiv.innerHTML = '<p>No se han registrado cirugías previas</p>';
            }
            
            // Hospitalizaciones
            const hospitalizacionesDiv = document.getElementById('historia-hospitalizaciones');
            if (historial.hospitalizaciones && historial.hospitalizaciones.length > 0) {
                hospitalizacionesDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.hospitalizaciones.map(hosp => 
                        `<li><i class="fas fa-circle small me-2"></i>${hosp.hospitalizacion || hosp}</li>`
                    ).join('') + '</ul>';
            } else {
                hospitalizacionesDiv.innerHTML = '<p>No se han registrado hospitalizaciones previas</p>';
            }
            
            // Antecedentes familiares
            document.getElementById('historia-antecedentes').textContent = 
                historial.antecedentes_familiares || 'No se han registrado antecedentes familiares';
            
            // Medicamentos actuales
            const medicamentosDiv = document.getElementById('historia-medicamentos');
            if (historial.medicamentos_actuales && historial.medicamentos_actuales.length > 0) {
                medicamentosDiv.innerHTML = '<ul class="list-unstyled">' + 
                    historial.medicamentos_actuales.map(med => 
                        `<li><i class="fas fa-circle small me-2"></i>${med.medicamento || med}</li>`
                    ).join('') + '</ul>';
            } else {
                medicamentosDiv.innerHTML = '<p>No se han registrado medicamentos actuales</p>';
            }
        }

        // Event Listeners
        searchInput.addEventListener('input', () => {
            buscarPacientes(searchInput.value);
        });

        searchButton.addEventListener('click', () => {
            buscarPacientes(searchInput.value);
        });

        crearHistorialBtn.addEventListener('click', () => {
            const pacienteId = localStorage.getItem('pacienteId');
            if (pacienteId) {
                window.location.href = `historia_clinica.html?id=${pacienteId}`;
            } else {
                alert('No se ha seleccionado un paciente');
            }
        });

        saveButton.addEventListener('click', () => {
            alert('Cambios guardados correctamente');
        });

        // Inicialización
        document.addEventListener('DOMContentLoaded', () => {
            // Verificar si hay un paciente seleccionado previamente
            const pacienteId = localStorage.getItem('pacienteId');
            if (pacienteId) {
                // Cargar información del paciente seleccionado
                cargarInformacionPaciente(pacienteId);
                patientHeader.style.display = 'block';
                patientContent.style.display = 'block';
                noPatientMessage.style.display = 'none';
            }
        });