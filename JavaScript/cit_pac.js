document.addEventListener('DOMContentLoaded', function () {
    let currentDate = new Date();
    let selectedDate = null;
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const horaSelect = document.getElementById('hora');
    const citasTable = document.querySelector('#tabla-citas tbody');
    const specialtiesList = document.getElementById('specialties-list');

    let doctorDisponibilidad = JSON.parse(localStorage.getItem("doctorDisponibilidad")) || {};

    // Función para manejar la selección de especialidades
    function setupSpecialtiesSelection() {
        const specialtyItems = specialtiesList.querySelectorAll('.specialty-item');
        
        specialtyItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remover clase active de todos los items
                specialtyItems.forEach(i => i.classList.remove('active'));
                
                // Agregar clase active al item clickeado
                this.classList.add('active');
                
                // Aquí puedes agregar lógica adicional si necesitas
                // filtrar médicos por especialidad, por ejemplo
                console.log('Especialidad seleccionada:', this.getAttribute('data-especialidad'));
            });
        });
    }

    // generar calendario solo con días disponibles
    function generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = '';

        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        dayNames.forEach(d => {
            const div = document.createElement('div');
            div.classList.add('calendar-day', 'header');
            div.textContent = d;
            calendarDays.appendChild(div);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) {
            let empty = document.createElement('div');
            empty.classList.add('calendar-day', 'other-month');
            calendarDays.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            let dateKey = new Date(year, month, d).toISOString().split("T")[0];
            let div = document.createElement('div');
            div.classList.add('calendar-day');
            div.textContent = d;

            if (doctorDisponibilidad[dateKey]) {
                div.classList.add('available');
                div.addEventListener("click", () => {
                    selectDate(dateKey, div);
                });
            } else {
                div.classList.add('unavailable');
            }
            calendarDays.appendChild(div);
        }
    }

    function selectDate(dateKey, element) {
        document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        selectedDate = dateKey;

        // cargar horas disponibles
        horaSelect.innerHTML = "";
        doctorDisponibilidad[dateKey].forEach(h => {
            let opt = document.createElement("option");
            opt.textContent = h;
            horaSelect.appendChild(opt);
        });
    }

    prevMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });
    nextMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    // agendar cita
    document.getElementById("agendarBtn").addEventListener("click", () => {
        if (!selectedDate) {
            alert("Seleccione una fecha disponible");
            return;
        }
        let hora = horaSelect.value;
        if (!hora || hora === "Seleccionar hora") {
            alert("Seleccione una hora");
            return;
        }
        
        // Obtener la especialidad seleccionada
        const selectedSpecialty = document.querySelector('.specialty-item.active');
        if (!selectedSpecialty) {
            alert("Seleccione una especialidad médica");
            return;
        }
        
        let medico = document.getElementById("medico").value;
        let especialidad = selectedSpecialty.getAttribute('data-especialidad');
        let paciente = "NIREGA DEL CARMEN BALMACEDA LÓPEZ";
        let motivo = document.getElementById("motivo").value;

        // En la función de agendar cita, modifica la creación del objeto nuevaCita:
        let nuevaCita = {
            paciente,
            fecha: selectedDate,
            hora,
            medico,
            consultorio: document.getElementById("consultorio").value,
            especialidad,
            motivo,
            estado: "Pendiente"
        };

        let citas = JSON.parse(localStorage.getItem("citasPacientes")) || [];
        citas.push(nuevaCita);
        localStorage.setItem("citasPacientes", JSON.stringify(citas));

        cargarCitas();
        alert("Cita agendada con éxito.");
    });

    function cargarCitas() {
        citasTable.innerHTML = "";
        let citas = JSON.parse(localStorage.getItem("citasPacientes")) || [];
        citas.forEach(c => {
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${c.fecha}</td><td>${c.hora}</td><td>${c.medico}</td><td>${c.especialidad}</td><td><span class="badge bg-warning">${c.estado}</span></td>`;
            citasTable.appendChild(tr);
        });
    }

    // Inicializar
    generateCalendar(currentDate);
    cargarCitas();
    setupSpecialtiesSelection();
});