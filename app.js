
// 1. IMPORTACIONES DE FIREBASE (Sintaxis Modular v9/v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// CONFIGURACIÓN DE TU PROYECTO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCLAW1XF5BHDB_-4pw7rVDLklVfiuIo6Zo",
    authDomain: "ligainfantilarandas-24843.firebaseapp.com",
    projectId: "ligainfantilarandas-24843",
    storageBucket: "ligainfantilarandas-24843.firebasestorage.app",
    messagingSenderId: "1034062664324",
    appId: "1:1034062664324:web:2400493fea676e1ff968d1",
    measurementId: "G-CBP7V18WN0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Referencias de la Interfaz de Usuario (UI)
const jugadorForm = document.getElementById('jugador-form');
const listaPreliminar = document.getElementById('lista-preliminar');
const plantillaCompletaGrid = document.getElementById('plantilla-completa-grid');

let todosLosJugadores = []; // Almacén local para búsquedas rápidas

// CAMBIAR DE MÓDULO (Navegación)
// Al usar type="module", debemos exponer las funciones a 'window' para que el 'onclick' del HTML las encuentre.
window.cambiarModulo = function(modulo) {
    if(modulo === 'registro') {
        document.getElementById('modulo-registro').classList.remove('hidden');
        document.getElementById('modulo-plantilla').classList.add('hidden');
        document.getElementById('btn-modulo-registro').classList.add('active');
        document.getElementById('btn-modulo-plantilla').classList.remove('active');
    } else {
        document.getElementById('modulo-registro').classList.add('hidden');
        document.getElementById('modulo-plantilla').classList.remove('hidden');
        document.getElementById('btn-modulo-plantilla').classList.add('active');
        document.getElementById('btn-modulo-registro').classList.remove('active');
    }
}

// ESCUCHAR DATOS EN TIEMPO REAL (Firestore)
onSnapshot(collection(db, "jugadores"), (snapshot) => {
    todosLosJugadores = [];
    listaPreliminar.innerHTML = '';
    plantillaCompletaGrid.innerHTML = '';

    snapshot.forEach((doc) => {
        const jugador = { id: doc.id, ...doc.data() };
        todosLosJugadores.push(jugador);
        
        // Renderizar en ambos módulos
        renderizarTarjeta(jugador, listaPreliminar);
        renderizarTarjeta(jugador, plantillaCompletaGrid);
    });
});

// FUNCIÓN PARA RENDERIZAR TARJETA DE JUGADOR
function renderizarTarjeta(jugador, contenedor) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
        <div class="player-number">#${jugador.numero}</div>
        <img src="${jugador.fotoUrl}" class="player-photo" alt="${jugador.nombre}">
        <div class="player-info">
            <h4>${jugador.nombre}</h4>
            <p>${jugador.equipo} - ${jugador.anio}</p>
            <p style="color: #00f0ff; font-size: 10px;">${jugador.temporada}</p>
            <button class="btn-delete" onclick="eliminarJugador('${jugador.id}')">Borrar</button>
        </div>
    `;
    contenedor.appendChild(card);
}

// GUARDAR JUGADOR (Formulario)
jugadorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const temporada = document.getElementById('temporada').value;
    const equipo = document.getElementById('equipo').value;
    const nombre = document.getElementById('nombre').value;
    const anio = document.getElementById('anio-nacimiento').value;
    const numero = document.getElementById('numero').value;
    const fotoArchivo = document.getElementById('foto').files[0];

    if (!fotoArchivo) {
        alert("Por favor, selecciona una foto.");
        return;
    }

    try {
        // 1. Subir Foto a Firebase Storage utilizando la sintaxis modular
        const storageRef = ref(storage, `fotos_jugadores/${Date.now()}_${fotoArchivo.name}`);
        const snapshot = await uploadBytes(storageRef, fotoArchivo);
        const fotoUrl = await getDownloadURL(snapshot.ref);

        // 2. Guardar metadata en Firestore utilizando la sintaxis modular
        await addDoc(collection(db, "jugadores"), {
            temporada,
            equipo,
            nombre,
            anio,
            numero,
            fotoUrl
        });

        alert("¡Jugador registrado exitosamente!");
        jugadorForm.reset();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al procesar el registro: " + error.message);
    }
});

// BORRAR REGISTROS (Expuesto a window para el onclick en la tarjeta)
window.eliminarJugador = async function(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este jugador de la base de datos?")) {
        try {
            await deleteDoc(doc(db, "jugadores", id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar al jugador.");
        }
    }
}

// FILTRAR PLANTILLA (Expuesto a window para el oninput del HTML)
window.filtrarPlantilla = function() {
    const busqueda = document.getElementById('search-plantilla').value.toLowerCase();
    plantillaCompletaGrid.innerHTML = '';
    
    const filtrados = todosLosJugadores.filter(j => 
        j.nombre.toLowerCase().includes(busqueda) || 
        j.equipo.toLowerCase().includes(busqueda)
    );

    filtrados.forEach(jugador => renderizarTarjeta(jugador, plantillaCompletaGrid));
};

// CAMBIAR DE MÓDULO (Navegación)
window.cambiarModulo = function(modulo) {
    if(modulo === 'registro') {
        document.getElementById('modulo-registro').classList.remove('hidden');
        document.getElementById('modulo-plantilla').classList.add('hidden');
        document.getElementById('btn-modulo-registro').classList.add('active');
        document.getElementById('btn-modulo-plantilla').classList.remove('active');
    } else {
        document.getElementById('modulo-registro').classList.add('hidden');
        document.getElementById('modulo-plantilla').classList.remove('hidden');
        document.getElementById('btn-modulo-plantilla').classList.add('active');
        document.getElementById('btn-modulo-registro').classList.remove('active');
    }
}

// ESCUCHAR DATOS EN TIEMPO REAL (Firestore)
onSnapshot(collection(db, "jugadores"), (snapshot) => {
    todosLosJugadores = [];
    listaPreliminar.innerHTML = '';
    plantillaCompletaGrid.innerHTML = '';

    snapshot.forEach((doc) => {
        const jugador = { id: doc.id, ...doc.data() };
        todosLosJugadores.push(jugador);
        
        // Renderizar en ambos módulos
        renderizarTarjeta(jugador, listaPreliminar);
        renderizarTarjeta(jugador, plantillaCompletaGrid);
    });
});

// FUNCIÓN PARA RENDERIZAR TARJETA DE JUGADOR
function renderizarTarjeta(jugador, contenedor) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
        <div class="player-number">#${jugador.numero}</div>
        <img src="${jugador.fotoUrl}" class="player-photo" alt="${jugador.nombre}">
        <div class="player-info">
            <h4>${jugador.nombre}</h4>
            <p>${jugador.equipo} - ${jugador.anio}</p>
            <p style="color: #00f0ff; font-size: 10px;">${jugador.temporada}</p>
            <button class="btn-delete" onclick="eliminarJugador('${jugador.id}')">Borrar</button>
        </div>
    `;
    contenedor.appendChild(card);
}

// GUARDAR JUGADOR (Formulario)
jugadorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const temporada = document.getElementById('temporada').value;
    const equipo = document.getElementById('equipo').value;
    const nombre = document.getElementById('nombre').value;
    const anio = document.getElementById('anio-nacimiento').value;
    const numero = document.getElementById('numero').value;
    const fotoArchivo = document.getElementById('foto').files[0];

    try {
        // 1. Subir Foto a Firebase Storage
        const storageRef = firebase.ref(storage, `fotos_jugadores/${Date.now()}_${fotoArchivo.name}`);
        const snapshot = await uploadBytes(storageRef, fotoArchivo);
        const fotoUrl = await getDownloadURL(snapshot.ref);

        // 2. Guardar metadata en Firestore
        await firebase.addDoc(collection(db, "jugadores"), {
            temporada,
            equipo,
            nombre,
            anio,
            numero,
            fotoUrl
        });

        alert("¡Jugador registrado exitosamente!");
        jugadorForm.reset();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al procesar el registro.");
    }
});

// BORRAR REGISTROS
window.eliminarJugador = async function(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este jugador de la base de datos?")) {
        try {
            await firebase.deleteDoc(doc(db, "jugadores", id));
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}

// FILTRAR PLANTILLA
window.filtrarPlantilla = function() {
    const busqueda = document.getElementById('search-plantilla').value.toLowerCase();
    plantillaCompletaGrid.innerHTML = '';
    
    const filtrados = todosLosJugadores.filter(j => 
        j.nombre.toLowerCase().includes(busqueda) || 
        j.equipo.toLowerCase().includes(busqueda)
    );

    filtrados.forEach(jugador => renderizarTarjeta(jugador, plantillaCompletaGrid));
}
