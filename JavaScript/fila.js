document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const listaFila = document.getElementById('lista-fila');
    const sinCitas = document.getElementById('sin-citas');
    const tablaCitasAprobadas = document.querySelector('#tabla-citas-aprobadas tbody');
    const fechaFiltro = document.getElementById('fecha-filtro');
    const especialidadFiltro = document.getElementById('especialidad-filtro');

    // Establecer fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    fechaFiltro.value = hoy;

    // Cargar información del paciente
    cargarInfoPaciente();

    // Cargar fila virtual
    cargarFilaVirtual();

    // Cargar todas las citas aprobadas
    cargarCitasAprobadas();

    // Event listeners para filtros
    fechaFiltro.addEventListener('change', cargarFilaVirtual);
    especialidadFiltro.addEventListener('change', cargarFilaVirtual);

    // Actualizar automáticamente cada 30 segundos
    setInterval(cargarFilaVirtual, 30000);

    function cargarInfoPaciente() {
        // Simular datos del paciente (en un caso real vendrían de una API o localStorage)
        document.getElementById('patient-name').textContent = 'Jafet Alexander Aguilar Martinez';
        document.getElementById('patient-exp').textContent = 'JAAM-221104-2025';
        document.getElementById('patient-id').textContent = '001-221104-1018U';
        document.getElementById('patient-age').textContent = '20 años';
        document.getElementById('patient-gender').textContent = 'M';
        document.getElementById('patient-phone').textContent = 'Cargando...';
    }

    function cargarFilaVirtual() {
        const fechaSeleccionada = fechaFiltro.value;
        const especialidadSeleccionada = especialidadFiltro.value;

        // Obtener citas del localStorage
        let citas = JSON.parse(localStorage.getItem('citasPacientes')) || [];
        
        // Filtrar solo citas aprobadas para la fecha seleccionada
        let citasFiltradas = citas.filter(cita => 
            cita.estado === 'Aprobada' && 
            cita.fecha === fechaSeleccionada &&
            (especialidadSeleccionada === '' || cita.especialidad === especialidadSeleccionada)
        );

        // Ordenar citas por hora
        citasFiltradas.sort((a, b) => {
            const horaA = convertirHoraANumero(a.hora);
            const horaB = convertirHoraANumero(b.hora);
            return horaA - horaB;
        });

        // Limpiar lista
        listaFila.innerHTML = '';

        if (citasFiltradas.length === 0) {
            sinCitas.style.display = 'block';
            return;
        }

        sinCitas.style.display = 'none';

        // Obtener la hora actual para determinar posición actual
        const ahora = new Date();
        const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

        let citaActualEncontrada = false;

        // Mostrar cada cita en la fila
        citasFiltradas.forEach((cita, index) => {
            const citaDiv = document.createElement('div');
            const numeroOrden = index + 1;
            const horaCita = convertirHoraANumero(cita.hora);
            
            let claseEstado = 'en-espera';
            let textoEstado = 'En espera';
            let esActual = false;

            // Determinar si es la cita actual o próxima
            if (!citaActualEncontrada && horaCita <= horaActual) {
                claseEstado = 'actual';
                textoEstado = 'Siendo atendido';
                esActual = true;
                citaActualEncontrada = true;
            } else if (!citaActualEncontrada && index === 0) {
                claseEstado = 'proxima';
                textoEstado = 'Próximo';
            }

            citaDiv.className = `cita-en-fila ${claseEstado}`;
            citaDiv.innerHTML = `
                <div class="numero-orden">${numeroOrden}</div>
                <div class="cita-info">
                    <h5 class="mb-2">${cita.especialidad}</h5>
                    <div class="row">
                        <div class="col-md-4">
                            <p class="mb-1"><strong><i class="fas fa-user-md me-2"></i>Médico:</strong> ${cita.medico}</p>
                        </div>
                        <div class="col-md-4">
                            <p class="mb-1"><strong><i class="fas fa-door-open me-2"></i>Consultorio:</strong> ${cita.consultorio}</p>
                        </div>
                        <div class="col-md-4">
                            <p class="mb-1"><strong><i class="fas fa-clock me-2"></i>Hora:</strong> ${cita.hora}</p>
                        </div>
                    </div>
                    <div class="tiempo-estimado">
                        <i class="fas fa-hourglass-half me-1"></i>
                        ${calcularTiempoEstimado(numeroOrden, esActual)}
                    </div>
                </div>
                <span class="estado-fila estado-${claseEstado}">${textoEstado}</span>
            `;

            listaFila.appendChild(citaDiv);
        });
    }

    function cargarCitasAprobadas() {
        // Obtener todas las citas aprobadas
        let citas = JSON.parse(localStorage.getItem('citasPacientes')) || [];
        let citasAprobadas = citas.filter(cita => cita.estado === 'Aprobada');

        // Ordenar por fecha y hora
        citasAprobadas.sort((a, b) => {
            const fechaA = new Date(a.fecha + ' ' + a.hora);
            const fechaB = new Date(b.fecha + ' ' + b.hora);
            return fechaA - fechaB;
        });

        // Limpiar tabla
        tablaCitasAprobadas.innerHTML = '';

        if (citasAprobadas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="7" class="text-center">No tienes citas aprobadas</td>`;
            tablaCitasAprobadas.appendChild(tr);
            return;
        }

        // Mostrar cada cita aprobada
        citasAprobadas.forEach((cita, index) => {
            const tr = document.createElement('tr');
            
            // Calcular número de orden para el día específico
            const citasDelDia = citasAprobadas.filter(c => c.fecha === cita.fecha);
            const ordenDelDia = citasDelDia.findIndex(c => c === cita) + 1;

            tr.innerHTML = `
                <td>${ordenDelDia}</td>
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${cita.hora}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.consultorio}</td>
                <td>${cita.medico}</td>
                <td><span class="badge bg-success">${cita.estado}</span></td>
            `;
            tablaCitasAprobadas.appendChild(tr);
        });
    }

    // Funciones auxiliares
    function convertirHoraANumero(hora) {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos;
    }

    function calcularTiempoEstimado(orden, esActual) {
        if (esActual) {
            return 'Siendo atendido en este momento';
        } else if (orden === 1) {
            return 'Próximo en ser atendido';
        } else {
            const tiempoEstimado = (orden - 1) * 20; // 20 minutos por cita
            return `Tiempo estimado: ~${tiempoEstimado} minutos`;
        }
    }

    function formatearFecha(fechaString) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaString).toLocaleDateString('es-ES', opciones);
    }
});