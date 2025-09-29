    document.addEventListener("DOMContentLoaded", function(){
      let currentDate = new Date();
      let selectedDays = JSON.parse(localStorage.getItem("doctorDisponibilidad")) || {};
      let selectedDate = null;

      const calendarDays = document.getElementById("calendar-days");
      const currentMonthElement = document.getElementById("current-month");
      const tablaSolicitudes = document.querySelector("#tabla-solicitudes tbody");

      function generateCalendar(date){
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = "";

        ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].forEach(d=>{
          let div=document.createElement("div");
          div.classList.add("calendar-day","header");
          div.textContent=d;
          calendarDays.appendChild(div);
        });

        const firstDay = new Date(year,month,1).getDay();
        const daysInMonth = new Date(year,month+1,0).getDate();

        for(let i=0;i<firstDay;i++){
          let empty=document.createElement("div");
          empty.classList.add("calendar-day","other-month");
          calendarDays.appendChild(empty);
        }

        for(let d=1; d<=daysInMonth; d++){
          let dateKey=new Date(year,month,d).toISOString().split("T")[0];
          let div=document.createElement("div");
          div.classList.add("calendar-day");
          div.textContent=d;

          if(selectedDays[dateKey] && selectedDays[dateKey].length>0){
            div.classList.add("available");
          }
          div.addEventListener("click",()=>{
            document.querySelectorAll(".calendar-day.selected").forEach(el=>el.classList.remove("selected"));
            div.classList.add("selected");
            selectedDate=dateKey;
            mostrarHorasDisponibles();
          });

          calendarDays.appendChild(div);
        }
      }

      function mostrarHorasDisponibles(){
        let lista=document.getElementById("horasLista");
        lista.innerHTML="";
        if(!selectedDate) return;
        let horas=selectedDays[selectedDate]||[];
        horas.forEach(h=>{
          let li=document.createElement("li");
          li.textContent=h;
          li.classList.add("list-group-item","d-flex","justify-content-between","align-items-center");
          let btn=document.createElement("button");
          btn.textContent="Quitar";
          btn.classList.add("btn","btn-sm","btn-danger");
          btn.addEventListener("click",()=>{
            selectedDays[selectedDate]=selectedDays[selectedDate].filter(x=>x!==h);
            if(selectedDays[selectedDate].length===0) delete selectedDays[selectedDate];
            localStorage.setItem("doctorDisponibilidad",JSON.stringify(selectedDays));
            mostrarHorasDisponibles();
            generateCalendar(currentDate);
          });
          li.appendChild(btn);
          lista.appendChild(li);
        });
      }

      document.getElementById("guardar-disponibilidad").addEventListener("click",()=>{
        if(!selectedDate){alert("Seleccione un día en el calendario");return;}
        let hora=document.getElementById("hora-disponible").value;
        if(!selectedDays[selectedDate]) selectedDays[selectedDate]=[];
        if(!selectedDays[selectedDate].includes(hora)){
          selectedDays[selectedDate].push(hora);
          localStorage.setItem("doctorDisponibilidad",JSON.stringify(selectedDays));
        }
        mostrarHorasDisponibles();
        generateCalendar(currentDate);
      });

      // navegación
      document.getElementById("prev-month").addEventListener("click",()=>{
        currentDate.setMonth(currentDate.getMonth()-1);
        generateCalendar(currentDate);
      });
      document.getElementById("next-month").addEventListener("click",()=>{
        currentDate.setMonth(currentDate.getMonth()+1);
        generateCalendar(currentDate);
      });

      // cargar solicitudes
      function cargarSolicitudes(){
        let citas=JSON.parse(localStorage.getItem("citasPacientes"))||[];
        tablaSolicitudes.innerHTML="";
        citas.forEach((c,idx)=>{
          let tr=document.createElement("tr");
          tr.innerHTML=`
            <td>${c.paciente}</td>
            <td>${c.fecha}</td>
            <td>${c.hora}</td>
            <td><span class="badge ${c.estado==="Confirmada"?"bg-success":(c.estado==="Rechazada"?"bg-danger":"bg-warning")}">${c.estado}</span></td>
            <td>
              <button class="btn btn-sm btn-success confirmar">✔</button>
              <button class="btn btn-sm btn-danger rechazar">✖</button>
            </td>`;
          tablaSolicitudes.appendChild(tr);

          tr.querySelector(".confirmar").addEventListener("click",()=>{
            citas[idx].estado="Confirmada";
            localStorage.setItem("citasPacientes",JSON.stringify(citas));
            cargarSolicitudes();
          });
          tr.querySelector(".rechazar").addEventListener("click",()=>{
            citas[idx].estado="Rechazada";
            // devolver hora a disponibilidad
            if(!selectedDays[citas[idx].fecha]) selectedDays[citas[idx].fecha]=[];
            if(!selectedDays[citas[idx].fecha].includes(citas[idx].hora)){
              selectedDays[citas[idx].fecha].push(citas[idx].hora);
            }
            localStorage.setItem("doctorDisponibilidad",JSON.stringify(selectedDays));
            localStorage.setItem("citasPacientes",JSON.stringify(citas));
            cargarSolicitudes();
            generateCalendar(currentDate);
          });
        });
      }

      generateCalendar(currentDate);
      cargarSolicitudes();
    });