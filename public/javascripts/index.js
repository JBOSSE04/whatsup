 //VARIABLES
 const socket = io();
 let typingTimer; 
 const usuariosConectadosElemento = document.getElementById('usuariosConectados');
 const mensajesChatContenedor = document.getElementById('mensajesChat');
 const cajaTextoInput = document.getElementById('cajaTexto');
 const nombreUsuario = document.getElementById('nombreUsuario');
 const opcionesChat = document.getElementById('opcionesChat');
 const contactos = document.getElementById('contactos');
 const escribiendoMensaje = document.getElementById('escribiendoMensaje');
 let salaSeleccionada = 'general';

 let avatarSeleccionado = ''; 

 //Control de avatar del ordenador del usuario

 document.getElementById('avatarUsuario').addEventListener('change', function(event) {
 const file = event.target.files[0];
 const reader = new FileReader();

 reader.onload = function(e) {
     const avatarImg = document.getElementById('avatar-image');
     avatarImg.src = e.target.result;
     avatarImg.style.display = 'inline-block';
 };

 reader.readAsDataURL(file);
 });

 //selección de avatar general
 function seleccionarAvatar(avatar) {

     avatarSeleccionado = avatar;
     const avatarOptions = document.querySelectorAll('.avatar-option');
     avatarOptions.forEach(option => option.classList.remove('selected'));
     const selectedOption = document.querySelector(`.avatar-option[src="${avatar}"]`);
     selectedOption.classList.add('selected');
     document.getElementById('avatar-image').src = avatar;
    
 }


 //PREVIEW DE LA IMAGEN DE AVATAR
 function displayFileName(input) {
    var fileName = input.files[0].name;
    document.getElementById('fileName').innerText = 'Archivo seleccionado: ' + fileName;

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}


 function toggleEmojis() {
    const emojisContainer = document.getElementById('emojisContainer');
    const toggleButton = document.getElementById('toggleEmojis');
    
    if (emojisContainer.style.display === 'none') {
        emojisContainer.style.display = 'block';
        toggleButton.textContent = 'Ocultar Emojis';
    } else {
        emojisContainer.style.display = 'none';
        toggleButton.textContent = 'Mostrar Emojis';
    }
}

 //GUARDAR LOS DATOS PRINCIPALES

 function enviarNick() {
    document.getElementById('vistaprincipal').style.display = 'flex';
     const nombreUsuario = document.getElementById('nombreUsuario').value;
     const estado = document.getElementById('estado').value;
     
     const avatarURL = document.getElementById('avatar-image').src;
     const mensajeErrorExistente = document.getElementById('mensajeError');
     if (nombreUsuario.trim() === '') {
        if (!mensajeErrorExistente) {
            // Si no hay un mensaje de error presente, crear uno nuevo
            const mensajeError = document.createElement('p');
            mensajeError.textContent = 'Por favor introduce un nick antes de enviar.';
            mensajeError.style.color = 'red';
            mensajeError.id = 'mensajeError'; // Agregar un ID para identificarlo fácilmente
            // Insertar el mensaje de error después del campo de entrada del nombre de usuario
            const inputNombreUsuario = document.getElementById('nombreUsuario');
            inputNombreUsuario.parentNode.insertBefore(mensajeError, inputNombreUsuario.nextSibling);
        }
        return;
    }

     contenedorMensajes.style.display = 'block';
    
     document.getElementById('contenedorNick').style.display = 'none';
     document.getElementById('avatar-info').style.display = 'block';

     document.getElementById('avatar-username').textContent = nombreUsuario;
     document.getElementById('avatar-image').style.display = 'inline-block';
     document.getElementById('avatar-estado').style.display = 'inline-block';
     document.getElementById('avatar-estado').textContent = '"' + estado+ '"' ;

     opcionesChat.style.display = 'block';

     console.log('Nombre de usuario:', nombreUsuario);
     console.log('Socket ID:', socket.id);
     socket.emit('add user', {nombreUsuario: nombreUsuario, avatar: avatarURL});
 }


 //MOSTRAR CHAT DEPENDIENDO DE LA ELECCION
 function unirseChat(nombreSala) {
     salaSeleccionada = nombreSala; 
     const contenedorMensajesGeneral = document.getElementById('general');
     const contenedorMensajesSala1 = document.getElementById('contenedorMensajesSala1');
     const contenedorMensajesSala2 = document.getElementById('contenedorMensajesSala2');

     if (nombreSala === 'general') {
         contenedorMensajesGeneral.style.display = 'block';
         contenedorMensajesSala1.style.display = 'none';
         contenedorMensajesSala2.style.display = 'none';
     } else if (nombreSala === 'Chat1') {
         contenedorMensajesGeneral.style.display = 'none';
         contenedorMensajesSala1.style.display = 'block';
         contenedorMensajesSala2.style.display = 'none';
     } else if (nombreSala === 'Chat2') {
         contenedorMensajesGeneral.style.display = 'none';
         contenedorMensajesSala1.style.display = 'none';
         contenedorMensajesSala2.style.display = 'block';
     }
 }

 
 //ENVIAR UN MENSAJE
 function enviar() {
     const mensaje = document.getElementById('cajaTexto').value;

     if (salaSeleccionada !== null && mensaje.trim() !== '') {
         console.log('Mensaje enviado:', mensaje);
         socket.emit('mensaje', { mensaje: mensaje, sala: salaSeleccionada });
         cajaTextoInput.value = '';
         socket.emit('dejarEscribir',{ sala: salaSeleccionada });
     } else {
         console.log('Error al enviar el mensaje: Sala no seleccionada o mensaje vacío.');
     }
 }

 //ENVIAR EL NICK AL PRESIONAR EL ENTER
 nombreUsuario.addEventListener('keypress', function (event) {
     if (event.key === 'Enter') {
         enviarNick();
     }
 });


 //ENVIAR MENSAJE AL PRESIONAR ENTER
 cajaTextoInput.addEventListener('keypress', function (event) {
     if (event.key === 'Enter') {
         enviar();
     } else {
         usuarioEscribiendo();
     }
 });


 //MENSEJE DE "x esta escribiendo"
 function usuarioEscribiendo() {

     if (event.key === 'Enter') {
         return;
     }
     clearTimeout(typingTimer);
     console.log('Escribiendo...');
     socket.emit('escribiendo', { sala: salaSeleccionada });

     typingTimer = setTimeout(() => {
         console.log('Se ha dejado de escribir.');
         socket.emit('dejarEscribir', { sala: salaSeleccionada }); 
     }, 2500);
 }

 //MENSAJES RECIBIDOS DEL SERVER

 socket.on('mensaje', (datos) => {
    console.log('Mensaje recibido:', datos);
    const claseMensaje = datos.emisorId === socket.id ? 'mensaje-propio' : 'mensaje-otro';

    const elementoMensaje = document.createElement('div');
    elementoMensaje.classList.add('mensaje', claseMensaje);

    if (datos.emisorId != socket.id) {
    const nombreUsuarioElemento = document.createElement('span');
    nombreUsuarioElemento.textContent = datos.emisor + ': ';
    nombreUsuarioElemento.classList.add('nombre-usuario');
    elementoMensaje.appendChild(nombreUsuarioElemento);
    }

    const mensajeElemento = document.createElement('span');
    mensajeElemento.textContent = datos.mensaje;
    elementoMensaje.appendChild(mensajeElemento);

    let mensajesChatContenedor;
    switch (datos.sala) {
    case 'general':
        mensajesChatContenedor = document.getElementById('mensajesChat');
        break;
    case 'Chat1':
        mensajesChatContenedor = document.getElementById('mensajesChatSala1');
        break;
    case 'Chat2':
        mensajesChatContenedor = document.getElementById('mensajesChatSala2');
        break;
    default:
        console.error('Sala desconocida:', datos.sala);
        return; 
    }

    if (mensajesChatContenedor) {
    mensajesChatContenedor.appendChild(elementoMensaje);
    scrollMensajesChat();
    } else {
    console.error('Contenedor de mensajes no encontrado para la sala:', datos.sala);
    }
});




//CHAT EN EL QUE VA A   SALIR EL MENSAJE
 socket.on('escribiendo', (datos) => {
    switch (datos.sala.sala) {
    case 'general':
        mostrarMensajeEscribiendo('escribiendoMensaje', datos);
        break;
    case 'Chat1':
        mostrarMensajeEscribiendo('escribiendoMensajeSala1', datos);
        break;
    case 'Chat2':
        mostrarMensajeEscribiendo('escribiendoMensajeSala2', datos);
        break;
    default:
        console.error('Sala desconocida:', datos.sala.sala);
        break;
    }
});

//CHAT EN EL QUE VA A DEJAR DE SALIR EL MENSAJE

socket.on('dejarEscribir', (datos) => {
    switch (datos.sala.sala) {
    case 'general':
        ocultarMensajeEscribiendo('escribiendoMensaje');
        break;
    case 'Chat1':
        ocultarMensajeEscribiendo('escribiendoMensajeSala1');
        break;
    case 'Chat2':
        ocultarMensajeEscribiendo('escribiendoMensajeSala2');
        break;
    default:
        console.error('Sala desconocida:', datos.sala.sala);
        break;
    }
});

//APARECE EL MENSAJE DE ESCRIBIENDO
function mostrarMensajeEscribiendo(idContenedor, datos) {
    const escribiendoMensajeDiv = document.getElementById(idContenedor);
    console.log("esta escribiendo "+  datos.emisor.username)
    if (datos.emisorId !== socket.id) {
    escribiendoMensajeDiv.textContent = datos.emisor.username + ' está escribiendo...';
    }
}

//DEJA DE APARECER EL MENSAJE DE ESCRIBIENDO
function ocultarMensajeEscribiendo(idContenedor) {
    const escribiendoMensajeDiv = document.getElementById(idContenedor);
    escribiendoMensajeDiv.textContent = '';
}

 //SCROLL
 function scrollMensajesChat() {
     const mensajesChatContenedor = document.getElementById('mensajesChat');
     mensajesChatContenedor.scrollTop = mensajesChatContenedor.scrollHeight;
 }

 //FUNCION PARA ENVIAR EL EMOJI
 function enviarEmoji(emoji) {
     const imagenData = {
         emoji: emoji,
         sala: salaSeleccionada 
     };
     socket.emit('imagen', imagenData);
     console.log('Emoji enviado:', emoji);
 }

 //EMOJIS
 socket.on('imagen', (datos) => {
     console.log('Imagen recibida:', datos);
     const claseMensaje = datos.emisorId === socket.id ? 'mensaje-propio' : 'mensaje-otro';

     const elementoMensaje = document.createElement('div');
     elementoMensaje.classList.add('mensaje', claseMensaje);

     if (datos.emisorId != socket.id) {
         const nombreUsuarioElemento = document.createElement('span');
         nombreUsuarioElemento.textContent = datos.emisor.username + ': ';
         nombreUsuarioElemento.classList.add('nombre-usuario');
         elementoMensaje.appendChild(nombreUsuarioElemento);
     }

     const imagenElemento = document.createElement('img');
     imagenElemento.src = datos.datos.emoji;
     elementoMensaje.appendChild(imagenElemento);

     let mensajesChatContenedor;
     switch (datos.sala) {
         case 'general':
             mensajesChatContenedor = document.getElementById('mensajesChat');
             break;
         case 'Chat1':
             mensajesChatContenedor = document.getElementById('mensajesChatSala1');
             break;
         case 'Chat2':
             mensajesChatContenedor = document.getElementById('mensajesChatSala2');
             break;
         default:
             console.error('Sala desconocida:', datos.sala);
             return; 
     }

     if (mensajesChatContenedor) {
         mensajesChatContenedor.appendChild(elementoMensaje);
         scrollMensajesChat();
     } else {
         console.error('Contenedor de mensajes no encontrado para la sala:', datos.sala);
     }
 });

 //NUMERO DE USUARIOS CONECTADOS
 socket.on('updateUsers', (users) => {
    console.log(users)
    const usuariosConectadosElementos = document.querySelectorAll('.usuariosConectados');
    usuariosConectadosElementos.forEach(elemento => {
        elemento.innerText = 'Usuarios Conectados: ' + users.length;
    });

    contactos.innerHTML = '';

    users.forEach(usuario => {
        const divUsuario = document.createElement('div');

        const imgAvatar = document.createElement('img');
        imgAvatar.src = usuario.avatar; 
        imgAvatar.alt = 'Avatar de ' + usuario.username;
        imgAvatar.id = 'avatar-image';

        const nombreUsuario = document.createElement('span');
        nombreUsuario.textContent = usuario.username;

        divUsuario.appendChild(imgAvatar);
        divUsuario.appendChild(nombreUsuario);

        divUsuario.classList.add('opcionChat');
        divUsuario.addEventListener('click', () => {
        });
        contactos.appendChild(divUsuario);
    });
});


 //APARTADO DE FILES
 const uploadButton = document.getElementById('uploadButton');
 const fileInput = document.getElementById('sampleFile');
 const endpoint = 'https://whatsup.onrender.com/upload';

 uploadButton.addEventListener('click', () => {
     const file = fileInput.files[0];
     const formData = new FormData();
     formData.append('sampleFile', file);

     fetch(endpoint, {
         method: 'POST',
         body: formData
     })
     .then(response => response.text())
     .then(data => {
         console.log(data);
         socket.emit('nuevoArchivo', { archivo: file.name, emisorId: socket.id, sala: salaSeleccionada });

         
     })
     .catch(error => {
         console.error(error);
         alert('Error uploading file');
     });
 });



 //Recibe la informacion de archivos del servidor
 socket.on('nuevoArchivo', archivo => {
     const claseMensaje = archivo.emisorId === socket.id ? 'mensaje-propio' : 'mensaje-otro';
     const mensajeArchivo = document.createElement('div');
     mensajeArchivo.classList.add('mensaje', claseMensaje, 'mensaje-archivo');

     if (archivo.emisorId != socket.id) {
         const nombreUsuarioSpan = document.createElement('span');
         nombreUsuarioSpan.textContent = archivo.emisor.username + ': ';
         mensajeArchivo.appendChild(nombreUsuarioSpan);
     }

     const extension = archivo.archivo.archivo.split('.').pop().toLowerCase();
     const esImagen = ['jpg', 'jpeg', 'png', 'gif'].includes(extension);

     if (esImagen) {
         const imagen = document.createElement('img');
         imagen.classList.add('imagenArchivo');
         imagen.src = 'archivos/' + archivo.archivo.archivo;
         imagen.alt = archivo.archivo.archivo;
         mensajeArchivo.appendChild(imagen);

         const enlaceDescarga = document.createElement('a');
         enlaceDescarga.href = 'archivos/' + archivo.archivo.archivo;
         enlaceDescarga.download = archivo.archivo.archivo;
         const iconoDescarga = document.createElement('i');
         iconoDescarga.classList.add('fas', 'fa-download');
         enlaceDescarga.appendChild(iconoDescarga);
         mensajeArchivo.appendChild(enlaceDescarga);
     } else {
         const nombreArchivoSpan = document.createElement('span');
         nombreArchivoSpan.innerHTML = archivo.archivo.archivo + "&nbsp;&nbsp;&nbsp;";
         mensajeArchivo.appendChild(nombreArchivoSpan);

         const enlaceDescargaArchivo = document.createElement('a');
         enlaceDescargaArchivo.href = 'archivos/' + archivo.archivo.archivo;
         enlaceDescargaArchivo.download = archivo.archivo.archivo;
         const iconoDescarga = document.createElement('i');
         iconoDescarga.classList.add('fas', 'fa-download');
         enlaceDescargaArchivo.appendChild(iconoDescarga);
         mensajeArchivo.appendChild(enlaceDescargaArchivo);
     }

     let mensajesChatContenedor;
     switch (archivo.sala) {
         case 'general':
             mensajesChatContenedor = document.getElementById('mensajesChat');
             break;
         case 'Chat1':
             mensajesChatContenedor = document.getElementById('mensajesChatSala1');
             break;
         case 'Chat2':
             mensajesChatContenedor = document.getElementById('mensajesChatSala2');
             break;
         default:
             console.error('Sala desconocida:', archivo.sala);
             return; 
     }

     // Agregar el mensaje al contenedor correspondiente
     mensajesChatContenedor.appendChild(mensajeArchivo);
     scrollMensajesChat();
 });


 


 //MENSAJE DE DESCONEXION
 socket.on('user disconnected', (username) => {
     const mensajeDesconexion = document.createElement('div');
     mensajeDesconexion.classList.add('mensajeDesconexion');

     const nombreUsuarioSpan = document.createElement('span');
     nombreUsuarioSpan.textContent = username.username;
     nombreUsuarioSpan.style.color = 'blue';

     const restoTextoSpan = document.createElement('span');
     restoTextoSpan.textContent = ' se ha desconectado';

     mensajeDesconexion.appendChild(nombreUsuarioSpan);
     mensajeDesconexion.appendChild(restoTextoSpan);

     const desconexionElements = document.querySelectorAll('.desconexion');
     desconexionElements.forEach(element => {
         element.appendChild(mensajeDesconexion.cloneNode(true));
     });

     scrollMensajesChat();

     setTimeout(() => {
        const mensajesDesconexion = document.querySelectorAll('.mensajeDesconexion');
        mensajesDesconexion.forEach(mensaje => {
            mensaje.style.transition = 'opacity 1s';
            mensaje.style.opacity = '0';

            setTimeout(() => {
                mensaje.remove();
            }, 1000);
        });
    }, 3000);
 });

 //MENSAJE DE CONEXIÓN
 socket.on('user connected', (username) => {
    if (socket.id !== username.emisorId) {
        const mensajeConexion = document.createElement('div');
        mensajeConexion.classList.add('mensajeConexion');
        
        const nombreUsuarioSpan = document.createElement('span');
        nombreUsuarioSpan.textContent = username.username;
        nombreUsuarioSpan.style.color = 'green';

        const restoTextoSpan = document.createElement('span');
        restoTextoSpan.textContent = ' se ha conectado';

        mensajeConexion.appendChild(nombreUsuarioSpan);
        mensajeConexion.appendChild(restoTextoSpan);

        const desconexionElements = document.querySelectorAll('.desconexion');
        desconexionElements.forEach(element => {
            element.appendChild(mensajeConexion.cloneNode(true));
        });

        scrollMensajesChat();

        setTimeout(() => {
            const mensajesConexion = document.querySelectorAll('.mensajeConexion');
            mensajesConexion.forEach(mensaje => {
                mensaje.style.transition = 'opacity 1s';
                mensaje.style.opacity = '0';

                setTimeout(() => {
                    mensaje.remove();
                }, 1000);
            });
        }, 3000);
    }
});