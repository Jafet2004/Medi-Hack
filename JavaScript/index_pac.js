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

