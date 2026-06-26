// Estructura de datos inicial: Intentar cargar de LocalStorage, si no, empezar vacío.
let leagueData = JSON.parse(localStorage.getItem('ligaInfantilData')) || [];

// Elementos del DOM
const teamForm = document.getElementById('team-form');
const playerForm = document.getElementById('player-form');
const playerTeamSelect = document.getElementById('player-team');
const teamsContainer = document.getElementById('teams-container');

// Función para guardar en LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('ligaInfantilData', JSON.stringify(leagueData));
}

// Función para actualizar la interfaz completa
function updateUI() {
    renderTeamSelect();
    renderTeamsAndPlayers();
}

// 1. Rellena el select del formulario de jugadores con los equipos existentes
function renderTeamSelect() {
    // Mantener la opción por defecto
    playerTeamSelect.innerHTML = '<option value="" disabled selected>Selecciona un equipo</option>';
    
    leagueData.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = `${team.name} (${team.category})`;
        playerTeamSelect.appendChild(option);
    });
}

// 2. Renderiza las tarjetas de los equipos y sus listas de jugadores
function renderTeamsAndPlayers() {
    teamsContainer.innerHTML = '';

    if (leagueData.length === 0) {
        teamsContainer.innerHTML = '<p class="no-players">No hay equipos registrados todavía. ¡Crea el primero arriba!</p>';
        return;
    }

    leagueData.forEach(team => {
        // Crear contenedor del equipo
        const teamBox = document.createElement('div');
        teamBox.className = 'team-box';

        // Cabecera del equipo
        const teamTitle = document.createElement('h3');
        teamTitle.textContent = team.name;
        
        const teamCategory = document.createElement('p');
        teamCategory.className = 'category';
        teamCategory.textContent = `Categoría: ${team.category}`;

        teamBox.appendChild(teamTitle);
        teamBox.appendChild(teamCategory);

        // Lista de jugadores
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

// Evento: Crear Equipo
teamForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const teamName = document.getElementById('team-name').value.trim();
    const teamCategory = document.getElementById('team-category').value.trim();

    // Crear objeto de equipo
    const newTeam = {
        id: 'team_' + Date.now(), // ID único basado en tiempo
        name: teamName,
        category: teamCategory,
        players: []
    };

    // Agregar al estado y guardar
    leagueData.push(newTeam);
    saveToLocalStorage();
    updateUI();

    // Limpiar formulario
    teamForm.reset();
});

// Evento: Agregar Jugador
playerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const playerName = document.getElementById('player-name').value.trim();
    const playerAge = document.getElementById('player-age').value;
    const selectedTeamId = playerTeamSelect.value;

    // Crear objeto jugador
    const newPlayer = {
        id: 'player_' + Date.now(),
        name: playerName,
        age: playerAge
    };

    // Buscar el equipo seleccionado y añadirle el jugador
    const teamIndex = leagueData.findIndex(team => team.id === selectedTeamId);
    if (teamIndex !== -1) {
        leagueData[teamIndex].players.push(newPlayer);
        saveToLocalStorage();
        updateUI();
        
        // Limpiar formulario
        playerForm.reset();
    }
});

// Carga inicial al abrir la página
updateUI();