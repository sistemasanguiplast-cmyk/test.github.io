// 1. Configuración de Firebase (REEMPLAZA ESTO CON TUS DATOS REALES)
const firebaseConfig = {
  apiKey: "AIzaSyCeZwffjdMJScGt4kCAtnfpSgBqzBVtoMI",
  authDomain: "test-anguiplast.firebaseapp.com",
  projectId: "test-anguiplast",
  storageBucket: "test-anguiplast.firebasestorage.app",
  messagingSenderId: "792813541157",
  appId: "1:792813541157:web:ad98c2c26307ce88826ccc",
  measurementId: "G-HYF70X482Z"
};

// 2. Inicializar Firebase y la base de datos Firestore (Sintaxis compatible)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referencia a la colección de la base de datos
const teamsCollection = db.collection("equipos");

// Elementos del DOM
const teamForm = document.getElementById('team-form');
const playerForm = document.getElementById('player-form');
const playerTeamSelect = document.getElementById('player-team');
const teamsContainer = document.getElementById('teams-container');

// Variable global para la copia local de los datos
let localLeagueData = [];

// 3. Escuchar cambios en tiempo real
teamsCollection.onSnapshot((snapshot) => {
    localLeagueData = [];
    
    snapshot.forEach((doc) => {
        const teamData = doc.data();
        localLeagueData.push({
            id: doc.id,
            name: teamData.name,
            category: teamData.category,
            players: teamData.players || []
        });
    });

    // Ordenar alfabéticamente por nombre de equipo
    localLeagueData.sort((a, b) => a.name.localeCompare(b.name));

    // Actualizar la interfaz
    updateUI();
}, (error) => {
    console.error("Error en tiempo real: ", error);
});

function updateUI() {
    renderTeamSelect();
    renderTeamsAndPlayers();
}

function renderTeamSelect() {
    playerTeamSelect.innerHTML = '<option value="" disabled selected>Selecciona un equipo</option>';
    
    localLeagueData.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = `${team.name} (${team.category})`;
        playerTeamSelect.appendChild(option);
    });
}

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

// Evento: Guardar un Equipo
teamForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const teamName = document.getElementById('team-name').value.trim();
    const teamCategory = document.getElementById('team-category').value.trim();

    try {
        await teamsCollection.add({
            name: teamName,
            category: teamCategory,
            players: []
        });
        teamForm.reset();
    } catch (error) {
        console.error("Error al guardar el equipo: ", error);
        alert("Hubo un error al conectar con la base de datos.");
    }
});

// Evento: Agregar Jugador
playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const playerName = document.getElementById('player-name').value.trim();
    const playerAge = parseInt(document.getElementById('player-age').value);
    const selectedTeamId = playerTeamSelect.value;

    const targetTeam = localLeagueData.find(team => team.id === selectedTeamId);
    
    if (targetTeam) {
        const updatedPlayers = [...targetTeam.players, { name: playerName, age: playerAge }];
        
        try {
            // Actualizar usando la sintaxis clásica de Firebase
            await teamsCollection.doc(selectedTeamId).update({
                players: updatedPlayers
            });
            playerForm.reset();
        } catch (error) {
            console.error("Error al registrar jugador: ", error);
            alert("No se pudo inscribir al jugador.");
        }
    }
});
