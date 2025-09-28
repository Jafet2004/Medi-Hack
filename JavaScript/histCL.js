// histCL.js - Versión completa y corregida
document.addEventListener('DOMContentLoaded', function() {
    console.log('histCL.js cargado - verificando contexto');
    
    // Verificar si estamos en la página de creación de historial
    if (document.getElementById('historialForm')) {
        console.log('Inicializando formulario de historial');
        initializeHistorialForm();
    }
    
    // Verificar si estamos en la página principal para mostrar/ocultar historial
    if (document.getElementById('historia-crear')) {
        console.log('Verificando existencia de historial');
        checkHistorialExistence();
    }
});

function initializeHistorialForm() {
    console.log('Inicializando formulario...');
    
    // Mostrar/ocultar campo de otras enfermedades
    const otrosCronicos = document.getElementById('otrosCronicos');
    if (otrosCronicos) {
        otrosCronicos.addEventListener('change', function() {
            const container = document.getElementById('otrasEnfermedadesContainer');
            if (container) {
                container.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Mostrar/ocultar campo de otras alergias
    const alergiaOtros = document.getElementById('alergiaOtros');
    if (alergiaOtros) {
        alergiaOtros.addEventListener('change', function() {
            const container = document.getElementById('otrasAlergiasContainer');
            if (container) {
                container.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Configurar el formulario
    const historialForm = document.getElementById('historialForm');
    if (historialForm) {
        historialForm.addEventListener('submit', handleHistorialSubmit);
    }
    
    console.log('Formulario inicializado correctamente');
}

// Funciones para agregar/eliminar cirugías
function addCirugia() {
    const container = document.getElementById('cirugiasContainer');
    if (!container) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'cirugia-item mb-3';
    newItem.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-2">
                <input type="text" class="form-control" name="tipo_cirugia[]" placeholder="Tipo de cirugía" required>
            </div>
            <div class="col-md-4 mb-2">
                <input type="date" class="form-control" name="fecha_cirugia[]" placeholder="Fecha">
            </div>
            <div class="col-md-2 mb-2">
                <button type="button" class="btn btn-danger btn-sm w-100" onclick="removeCirugia(this)"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
}

function removeCirugia(button) {
    const item = button.closest('.cirugia-item');
    if (item) {
        item.remove();
    }
}

// Funciones para agregar/eliminar hospitalizaciones
function addHospitalizacion() {
    const container = document.getElementById('hospitalizacionesContainer');
    if (!container) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'hospitalizacion-item mb-3';
    newItem.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-2">
                <input type="text" class="form-control" name="motivo_hospitalizacion[]" placeholder="Motivo de hospitalización" required>
            </div>
            <div class="col-md-4 mb-2">
                <input type="date" class="form-control" name="fecha_hospitalizacion[]" placeholder="Fecha">
            </div>
            <div class="col-md-2 mb-2">
                <button type="button" class="btn btn-danger btn-sm w-100" onclick="removeHospitalizacion(this)"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
}

function removeHospitalizacion(button) {
    const item = button.closest('.hospitalizacion-item');
    if (item) {
        item.remove();
    }
}

// Funciones para agregar/eliminar medicamentos
function addMedicamento() {
    const container = document.getElementById('medicamentosContainer');
    if (!container) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'medicamento-item mb-3';
    newItem.innerHTML = `
        <div class="row">
            <div class="col-md-5 mb-2">
                <input type="text" class="form-control" name="nombre_medicamento[]" placeholder="Nombre del medicamento" required>
            </div>
            <div class="col-md-3 mb-2">
                <input type="text" class="form-control" name="dosis_medicamento[]" placeholder="Dosis">
            </div>
            <div class="col-md-2 mb-2">
                <input type="text" class="form-control" name="frecuencia_medicamento[]" placeholder="Frecuencia">
            </div>
            <div class="col-md-2 mb-2">
                <button type="button" class="btn btn-danger btn-sm w-100" onclick="removeMedicamento(this)"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
}

function removeMedicamento(button) {
    const item = button.closest('.medicamento-item');
    if (item) {
        item.remove();
    }
}

// Manejar el envío del formulario de historial
async function handleHistorialSubmit(e) {
    e.preventDefault();
    console.log('Enviando formulario de historial...');

    const pacienteId = localStorage.getItem("pacienteId");
    if (!pacienteId) {
        alert("No se encontró el paciente en sesión");
        return;
    }

    // Recopilar datos del formulario
    const formData = new FormData(document.getElementById('historialForm'));
    
    // Datos principales del historial
    const data = {
        idPaciente: parseInt(pacienteId),
        tipo_sangre: formData.get('bloodType'),
        antecedentes_familiares: formData.get('antecedentesFamiliares')
    };

    console.log('Datos principales:', data);

    // Recopilar enfermedades crónicas
    data.enfermedadesCronicas = [];
    const enfermedadesCheckboxes = document.querySelectorAll('input[name="enfermedadesCronicas"]:checked');
    enfermedadesCheckboxes.forEach(cb => {
        if (cb.value !== 'otros') {
            data.enfermedadesCronicas.push(cb.value);
        }
    });
    
    // Agregar enfermedad "otros" si está marcada y tiene valor
    if (document.getElementById('otrosCronicos') && document.getElementById('otrosCronicos').checked) {
        const otraEnfermedad = document.getElementById('otrasEnfermedades')?.value;
        if (otraEnfermedad && otraEnfermedad.trim()) {
            data.enfermedadesCronicas.push(otraEnfermedad.trim());
        }
    }

    // Recopilar alergias
    data.alergias = [];
    const alergiasCheckboxes = document.querySelectorAll('input[name="alergias"]:checked');
    alergiasCheckboxes.forEach(cb => {
        if (cb.value !== 'otros') {
            data.alergias.push(cb.value);
        }
    });
    
    // Agregar alergia "otros" si está marcada y tiene valor
    if (document.getElementById('alergiaOtros') && document.getElementById('alergiaOtros').checked) {
        const otraAlergia = document.getElementById('otrasAlergias')?.value;
        if (otraAlergia && otraAlergia.trim()) {
            data.alergias.push(otraAlergia.trim());
        }
    }

    // Recopilar cirugías
    data.cirugias = [];
    const tiposCirugia = formData.getAll('tipo_cirugia[]');
    const fechasCirugia = formData.getAll('fecha_cirugia[]');
    tiposCirugia.forEach((tipo, index) => {
        if (tipo && tipo.trim()) {
            data.cirugias.push({
                tipo_cirugia: tipo.trim(),
                fecha_cirugia: fechasCirugia[index] || null
            });
        }
    });

    // Recopilar hospitalizaciones
    data.hospitalizaciones = [];
    const motivosHospitalizacion = formData.getAll('motivo_hospitalizacion[]');
    const fechasHospitalizacion = formData.getAll('fecha_hospitalizacion[]');
    motivosHospitalizacion.forEach((motivo, index) => {
        if (motivo && motivo.trim()) {
            data.hospitalizaciones.push({
                motivo: motivo.trim(),
                fecha: fechasHospitalizacion[index] || null
            });
        }
    });

    // Recopilar medicamentos
    data.medicamentos = [];
    const nombresMedicamento = formData.getAll('nombre_medicamento[]');
    const dosisMedicamento = formData.getAll('dosis_medicamento[]');
    const frecuenciasMedicamento = formData.getAll('frecuencia_medicamento[]');
    nombresMedicamento.forEach((nombre, index) => {
        if (nombre && nombre.trim()) {
            data.medicamentos.push({
                nombre_medicamento: nombre.trim(),
                dosis: dosisMedicamento[index] || '',
                frecuencia: frecuenciasMedicamento[index] || ''
            });
        }
    });

    console.log('Datos completos a enviar:', data);

    try {
        const response = await fetch("http://localhost:3000/api/historial-completo", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Respuesta del servidor:', result);

        if (response.ok) {
            alert("Historial clínico creado correctamente");
            window.location.href = "index.html";
        } else {
            alert(result.error || "No se pudo crear el historial");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Error de conexión con el servidor");
    }
}

// Verificar si el paciente ya tiene historial clínico
async function checkHistorialExistence() {
    const pacienteId = localStorage.getItem('pacienteId');
    if (!pacienteId) {
        console.log('No se encontró pacienteId en localStorage');
        return;
    }

    console.log('Verificando historial para paciente:', pacienteId);

    try {
        // Usar la nueva ruta que incluye todos los datos
        const res = await fetch(`http://localhost:3000/api/historial-completo/${pacienteId}`);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Datos de historial recibidos:', data);

        const historiaCrearDiv = document.getElementById('historia-crear');
        const historiaContenidoDiv = document.getElementById('historia-contenido');

        if (!data.tieneHistorial) {
            // No tiene historial, mostrar opción para crear
            console.log('Paciente no tiene historial');
            if (historiaCrearDiv) {
                historiaCrearDiv.style.display = 'block';
            }
            if (historiaContenidoDiv) {
                historiaContenidoDiv.style.display = 'none';
            }
        } else {
            // Tiene historial, mostrar la información
            console.log('Paciente tiene historial:', data.historial);
            if (historiaCrearDiv) {
                historiaCrearDiv.style.display = 'none';
            }
            if (historiaContenidoDiv) {
                historiaContenidoDiv.style.display = 'block';
                // Usar la función global definida en index.html
                if (typeof window.loadHistorialData === 'function') {
                    window.loadHistorialData(data.historial);
                } else {
                    console.warn('loadHistorialData no está disponible');
                    // Fallback: mostrar datos básicos
                    displayHistorialFallback(data.historial);
                }
            }
        }
    } catch (err) {
        console.error('Error al verificar historial:', err);
        // En caso de error, mostrar la opción para crear historial
        const historiaCrearDiv = document.getElementById('historia-crear');
        if (historiaCrearDiv) {
            historiaCrearDiv.style.display = 'block';
        }
    }
}

// Función fallback para mostrar historial si loadHistorialData no está disponible
function displayHistorialFallback(historial) {
    console.log('Usando fallback para mostrar historial:', historial);
    
    // Tipo de sangre
    const tipoSangreElem = document.getElementById('historia-tipo-sangre');
    if (tipoSangreElem) {
        tipoSangreElem.textContent = historial.tipo_sangre || 'No especificado';
    }
    
    // Enfermedades crónicas
    const enfermedadesElem = document.getElementById('historia-enfermedades');
    if (enfermedadesElem) {
        if (historial.enfermedades_cronicas && historial.enfermedades_cronicas.length > 0) {
            enfermedadesElem.innerHTML = historial.enfermedades_cronicas.map(enf => 
                `<p><i class="fas fa-circle small me-2"></i>${enf.enfermedad || enf}</p>`
            ).join('');
        } else {
            enfermedadesElem.innerHTML = '<p>No se han registrado enfermedades crónicas</p>';
        }
    }
    
    // Alergias
    const alergiasElem = document.getElementById('historia-alergias');
    if (alergiasElem) {
        if (historial.alergias && historial.alergias.length > 0) {
            alergiasElem.innerHTML = historial.alergias.map(alergia => 
                `<p><i class="fas fa-circle small me-2"></i>${alergia.alergia || alergia}</p>`
            ).join('');
        } else {
            alergiasElem.innerHTML = '<p>No se han registrado alergias</p>';
        }
    }
    
    // Mostrar mensaje de que los datos se cargaron
    console.log('Historial mostrado usando fallback');
}

// Función para cargar datos del historial existente (compatibilidad)
function loadHistorialData(historial) {
    console.log('Cargando datos del historial:', historial);
    
    // Esta función será sobrescrita por la definida en index.html
    // Aquí solo mostramos un mensaje de fallback
    displayHistorialFallback(historial);
}

// Hacer las funciones disponibles globalmente para los onclick
window.addCirugia = addCirugia;
window.removeCirugia = removeCirugia;
window.addHospitalizacion = addHospitalizacion;
window.removeHospitalizacion = removeHospitalizacion;
window.addMedicamento = addMedicamento;
window.removeMedicamento = removeMedicamento;
window.loadHistorialData = loadHistorialData;