// 2. Configuración de Firebase de tu web app (REEMPLAZA ESTO CON TUS DATOS)
const firebaseConfig = {
    apiKey: "AIzaSyCeZwffjdMJScGt4kCAtnfpSgBqzBVtoMI",
    authDomain: "test-anguiplast.firebaseapp.com",
    projectId: "test-anguiplast",
    storageBucket: "test-anguiplast.firebasestorage.app",
    messagingSenderId: "792813541157",
    appId: "1:792813541157:web:ad98c2c26307ce88826ccc",
    measurementId: "G-HYF70X482Z"
};

// 3. Inicializar Firebase y la base de datos Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias a las colecciones de la base de datos
const teamsCollection = collection(db, "equipos");

// Elementos del DOM
const teamForm = document.getElementById('team-form');
const playerForm = document.getElementById('player-form');
const playerTeamSelect = document.getElementById('player-team');
const teamsContainer = document.getElementById('teams-container');

// Variable global para mantener una copia local de los datos de la base de datos
let localLeagueData = [];

// 4. Escuchar cambios en la base de datos en TIEMPO REAL
//onSnapshot se ejecuta automáticamente cada vez que se crea un equipo o jugador en Firebase
onSnapshot(teamsCollection, (snapshot) => {
    localLeagueData = [];
    
    snapshot.forEach((doc) => {
        const teamData = doc.data();
        localLeagueData.push({
            id: doc.id, // El ID ahora lo genera automáticamente Firebase
            name: teamData.name,
            category: teamData.category,
            players: teamData.players || [] // Si no tiene jugadores, inicializa vacío
        });
    });

    // Ordenar alfabéticamente por nombre de equipo
    localLeagueData.sort((a, b) => a.name.localeCompare(b.name));

    // Actualizar la interfaz con los nuevos datos recibidos
    updateUI();
});

// Función para actualizar los elementos visuales
function updateUI() {
    renderTeamSelect();
    renderTeamsAndPlayers();
}

// Rellena el select del formulario de jugadores con los equipos de Firebase
function renderTeamSelect() {
    playerTeamSelect.innerHTML = '<option value="" disabled selected>Selecciona un equipo</option>';
    
    localLeagueData.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = `${team.name} (${team.category})`;
        playerTeamSelect.appendChild(option);
    });
}

// Renderiza las tarjetas de los equipos y sus listas de jugadores
function renderTeamsAndPlayers() {
    teamsContainer.innerHTML = '';

    if (localLeagueData.length === 0) {
        teamsContainer.innerHTML = '<p class="no-players">No hay equipos registrados todavía. ¡Crea el primero arriba!</p>';
        return;
    }

    localLeagueData.forEach(team => {
        const teamBox = document.createElement('div');
        teamBox.className = 'team-box';

        const teamTitle = document.createElement('h3');
        teamTitle.textContent = team.name;
        
        const teamCategory = document.createElement('p');
        teamCategory.className = 'category';
        teamCategory.textContent = `Categoría: ${team.category}`;

        teamBox.appendChild(teamTitle);
        teamBox.appendChild(teamCategory);

        const playerList = document.createElement('ul');
        playerList.className = 'player-list';

        if (team.players.length === 0) {
            playerList.innerHTML = '<li class="no-players">Sin jugadores inscritos aún</li>';
        } else {
            team.players.forEach(player => {
                const playerItem = document.createElement('li');
                playerItem.innerHTML = `
                    <span>👤 ${player.name}</span>
                    <span class="player-age-badge">${player.age} años</span>
                `;
                playerList.appendChild(playerItem);
            });
        }

        teamBox.appendChild(playerList);
        teamsContainer.appendChild(teamBox);
    });
}

// Evento: Guardar un Equipo en Firebase
teamForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const teamName = document.getElementById('team-name').value.trim();
    const teamCategory = document.getElementById('team-category').value.trim();

    try {
        // Añade un nuevo documento a la colección "equipos" en Firebase
        await addDoc(teamsCollection, {
            name: teamName,
            category: teamCategory,
            players: [] // Inicia sin jugadores
        });
        
        teamForm.reset();
    } catch (error) {
        console.error("Error al guardar el equipo: ", error);
        alert("Hubo un error al conectar con la base de datos.");
    }
});

// Evento: Agregar Jugador a un Equipo en Firebase
playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const playerName = document.getElementById('player-name').value.trim();
    const playerAge = parseInt(document.getElementById('player-age').value);
    const selectedTeamId = playerTeamSelect.value;

    // Buscar el equipo de manera local para clonar sus datos actuales
    const targetTeam = localLeagueData.find(team => team.id === selectedTeamId);
    
    if (targetTeam) {
        // Creamos el nuevo arreglo de jugadores añadiendo el nuevo
        const updatedPlayers = [...targetTeam.players, { name: playerName, age: playerAge }];
        
        try {
            // Nota: Para actualizar arreglos en Firebase v10 de forma sencilla, 
            // importamos dinámicamente la función "doc" y "updateDoc"
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            
            const teamRef = doc(db, "equipos", selectedTeamId);
            
            // Actualizamos la lista de jugadores de ese equipo específico en la nube
            await updateDoc(teamRef, {
                players: updatedPlayers
            });

            playerForm.reset();
        } catch (error) {
            console.error("Error al registrar jugador: ", error);
            alert("No se pudo inscribir al jugador.");
        }
    }
});
