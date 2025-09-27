document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        primer_nombre: document.getElementById("primer_nombre").value,
        segundo_nombre: document.getElementById("segundo_nombre").value,
        primer_apellido: document.getElementById("primer_apellido").value,
        segundo_apellido: document.getElementById("segundo_apellido").value,
        cedula: document.getElementById("cedula").value,
        codigo_paciente: document.getElementById("codigo_paciente").value,
        email: document.getElementById("email").value,
        contrasena: document.getElementById("password").value, // 👈 CORREGIDO
        fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
        celular: document.getElementById("celular").value,
        direccion: document.getElementById("direccion").value,
        genero: document.getElementById("genero").value
    };

    if (data.contrasena !== document.getElementById("confirmPassword").value) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/register/paciente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (res.ok) {
            alert(result.message);
            window.location.href = "login.html";
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Error al registrar:", err);
        alert("Error de conexión con el servidor");
    }
});
