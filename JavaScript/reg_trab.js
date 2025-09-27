document.getElementById("registerFormTrab").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        primer_nombre: document.getElementById("primer_nombre").value,
        segundo_nombre: document.getElementById("segundo_nombre").value,
        primer_apellido: document.getElementById("primer_apellido").value,
        segundo_apellido: document.getElementById("segundo_apellido").value,
        cedula: document.getElementById("cedula").value,
        codigo_minsa: document.getElementById("codigo_minsa").value,
        correo: document.getElementById("email").value,
        contrasena: document.getElementById("password").value,
    };

    if (data.contrasena !== document.getElementById("confirmPassword").value) {
        return alert("Las contraseñas no coinciden");
    }

    const res = await fetch("http://localhost:3000/register/trabajador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await res.json();
    alert(result.message);
    if (res.ok) window.location.href = "login.html";
});
