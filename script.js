let poems = [];
let currentAudio = null;
let isFormattingHidden = false;

// Charger les données depuis le fichier JSON
async function loadPoems() {
    try {
        const response = await fetch('poems.json');
        poems = await response.json();
        createTiles();
        setupScrollFade();
    } catch (error) {
        console.error('Erreur lors du chargement des poèmes:', error);
    }
}

function parseHTMLContent(content) {
    if (Array.isArray(content)) {
        return content.join('\n');
    }
    return content;
}

function createTiles() {
    const grid = document.getElementById('poemsGrid');
    grid.innerHTML = '';
    
    poems.forEach((poem, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        
        const isActive = poem.active !== false;
        
        if (!isActive) {
            tile.classList.add('inactive');
        } else {
            tile.onclick = () => openModal(index);
        }
        
        tile.innerHTML = `
            <div class="tile-bg" style="background-image: url('${poem.image}')"></div>
            <div class="tile-overlay">
                <h3 class="tile-title">${poem.title}</h3>
            </div>
        `;
        grid.appendChild(tile);
    });
}

// Fonction pour faire disparaître les tuiles sous le header
function setupScrollFade() {
    const header = document.querySelector('header');
    const tiles = document.querySelectorAll('.tile');
    
    function updateTilesFade() {
        const headerRect = header.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        
        tiles.forEach(tile => {
            const tileRect = tile.getBoundingClientRect();
            const tileTop = tileRect.top;
            const tileBottom = tileRect.bottom;
            
            // Si la tuile entre dans la zone du header
            if (tileTop < headerBottom && tileBottom > headerRect.top) {
                // Calculer le pourcentage de visibilité
                const tileInHeaderHeight = headerBottom - tileTop;
                const tileHeight = tileRect.height;
                const fadeRatio = 1 - (tileInHeaderHeight / tileHeight);
                
                // Appliquer l'opacité
                tile.style.opacity = Math.max(0, fadeRatio);
            } else if (tileBottom <= headerRect.top) {
                // La tuile est complètement au-dessus
                tile.style.opacity = '0';
            } else {
                // La tuile est complètement visible
                tile.style.opacity = '1';
            }
        });
    }
    
    // Mettre à jour au scroll et au chargement
    window.addEventListener('scroll', updateTilesFade);
    window.addEventListener('resize', updateTilesFade);
    updateTilesFade();
}

function openModal(index) {
    const poem = poems[index];
    const contentHTML = parseHTMLContent(poem.content);
    
    document.getElementById('modalHeader').style.backgroundImage = `url('${poem.image}')`;
    document.getElementById('modalTitle').textContent = poem.title;
    document.getElementById('poemContent').innerHTML = contentHTML;
    document.getElementById('modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Réinitialiser l'état du formatage
    isFormattingHidden = false;
    document.getElementById('poemContent').classList.remove('hide-formatting');
    document.getElementById('toggleFormattingBtn').classList.remove('active');
    
    // Configurer l'audio si disponible
    const audioElement = document.getElementById('poemAudio');
    const playBtn = document.getElementById('playAudioBtn');
    
    if (poem.sound) {
        audioElement.src = poem.sound;
        playBtn.style.display = 'flex';
        playBtn.classList.remove('playing');
    } else {
        playBtn.style.display = 'none';
    }
    
    // Arrêter l'audio précédent si existant
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Arrêter l'audio
    const audioElement = document.getElementById('poemAudio');
    audioElement.pause();
    audioElement.currentTime = 0;
    document.getElementById('playAudioBtn').classList.remove('playing');
}

// Toggle formatage
document.getElementById('toggleFormattingBtn').addEventListener('click', function() {
    isFormattingHidden = !isFormattingHidden;
    const poemContent = document.getElementById('poemContent');
    
    if (isFormattingHidden) {
        poemContent.classList.add('hide-formatting');
        this.classList.add('active');
    } else {
        poemContent.classList.remove('hide-formatting');
        this.classList.remove('active');
    }
});

// Gestion de l'audio
document.getElementById('playAudioBtn').addEventListener('click', function() {
    const audioElement = document.getElementById('poemAudio');
    
    if (audioElement.paused) {
        audioElement.play();
        this.classList.add('playing');
        this.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        `;
    } else {
        audioElement.pause();
        this.classList.remove('playing');
        this.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        `;
    }
});

// Quand l'audio se termine
document.getElementById('poemAudio').addEventListener('ended', function() {
    const playBtn = document.getElementById('playAudioBtn');
    playBtn.classList.remove('playing');
    playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    `;
});

// Event listeners
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Charger les poèmes au démarrage
loadPoems();