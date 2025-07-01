document.addEventListener('DOMContentLoaded', () => {
    const flashcardsDisplay = document.getElementById('flashcardsDisplay');
    const cardControls = document.getElementById('cardControls');
    const prevCardBtn = document.getElementById('prevCardBtn');
    const nextCardBtn = document.getElementById('nextCardBtn');
    const cardCounter = document.getElementById('cardCounter');
    const errorMessage = document.getElementById('errorMessage');
    const initialMessage = document.getElementById('initialMessage');

    let currentFlashcards = [];
    let currentCardIndex = 0;

    /**
     * Parses the URL query string to get the 'theme' parameter.
     * @returns {string|null} The value of the 'theme' parameter or null if not found.
     */
    function getThemeFromQueryString() {
        const params = new URLSearchParams(window.location.search);
        return params.get('theme');
    }

    /**
     * Loads the available themes from `data/themes.json` and then attempts to load
     * flashcards based on the 'theme' query parameter in the URL.
     */
    async function loadThemesAndFlashcards() {
        try {
            initialMessage.textContent = 'Cargando temas...';
            const response = await fetch('data/themes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const themes = await response.json();
            const requestedThemeParam = getThemeFromQueryString();

            let themeFound = false;
            if (requestedThemeParam) {
                const selectedTheme = themes.find(theme => theme.queryParam === requestedThemeParam);
                if (selectedTheme) {
                    await fetchFlashcards(selectedTheme.file);
                    themeFound = true;
                }
            }

            if (!themeFound) {
                // If no theme param, or invalid param, try to load a default or show error
                const defaultTheme = themes.find(theme => theme.queryParam === 'it_all_en'); // Default to IT English consolidated
                if (defaultTheme) {
                    errorMessage.textContent = requestedThemeParam ? `Tema '${requestedThemeParam}' no encontrado. Cargando tema por defecto.` : 'No se especificó un tema. Cargando tema por defecto.';
                    await fetchFlashcards(defaultTheme.file);
                } else {
                    errorMessage.textContent = 'No se pudo cargar el tema. Por favor, especifica un tema válido en la URL (ej. ?theme=it_all_en).';
                    initialMessage.style.display = 'block';
                    initialMessage.textContent = 'Selecciona un tema válido en la URL.';
                    cardControls.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error loading themes or flashcards:', error);
            errorMessage.textContent = `Error al cargar: ${error.message}. Asegúrate de que los archivos JSON existen.`;
            initialMessage.style.display = 'block';
            initialMessage.textContent = 'Error al cargar los datos.';
            cardControls.style.display = 'none';
        }
    }

    /**
     * Fetches flashcards from the specified theme file.
     * @param {string} filename - The filename of the JSON containing flashcards.
     */
    async function fetchFlashcards(filename) {
        try {
            errorMessage.textContent = ''; // Clear previous errors
            initialMessage.style.display = 'none'; // Hide initial message
            flashcardsDisplay.innerHTML = '<p id="loadingMessage">Cargando tarjetas...</p>'; // Show loading message

            const response = await fetch(`data/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('El archivo del tema está vacío o no tiene el formato correcto.');
            }
            currentFlashcards = data;
            currentCardIndex = 0;
            renderFlashcard(); // Display the first card
            cardControls.style.display = 'flex'; // Show controls
        } catch (error) {
            console.error('Error fetching flashcards:', error);
            errorMessage.textContent = `Error al cargar las tarjetas: ${error.message}.`;
            flashcardsDisplay.innerHTML = ''; // Clear any partial display
            cardControls.style.display = 'none'; // Hide controls
            initialMessage.style.display = 'block'; // Show initial message
            initialMessage.textContent = 'No se pudieron cargar las tarjetas para este tema.';
            currentFlashcards = []; // Clear cards on error
        }
    }

    /**
     * Renders the current flashcard to the display.
     */
    function renderFlashcard() {
        flashcardsDisplay.innerHTML = ''; // Clear previous card
        if (currentFlashcards.length === 0) {
            flashcardsDisplay.innerHTML = '<p>No hay tarjetas para este tema.</p>';
            cardCounter.textContent = 'Card 0 Of 0';
            cardControls.style.display = 'none';
            initialMessage.style.display = 'block';
            initialMessage.textContent = 'No hay tarjetas disponibles.';
            return;
        }

        const flashcard = currentFlashcards[currentCardIndex];

        const cardDiv = document.createElement('div');
        cardDiv.classList.add('flashcard');

        const cardInner = document.createElement('div');
        cardInner.classList.add('flashcard-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('flashcard-front');
        cardFront.textContent = flashcard.front;

        const cardBack = document.createElement('div');
        cardBack.classList.add('flashcard-back');
        cardBack.textContent = flashcard.back;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardDiv.appendChild(cardInner);

        flashcardsDisplay.appendChild(cardDiv);

        // Add click listener to flip the card
        cardDiv.addEventListener('click', () => {
            cardDiv.classList.toggle('flipped');
        });

        // Update card counter
        cardCounter.textContent = `Card ${currentCardIndex + 1} Of ${currentFlashcards.length}`;
    }

    // --- Event Listeners ---

    // Previous card button click handler
    prevCardBtn.addEventListener('click', () => {
        if (currentFlashcards.length === 0) return;
        currentCardIndex = (currentCardIndex - 1 + currentFlashcards.length) % currentFlashcards.length;
        renderFlashcard();
    });

    // Next card button click handler
    nextCardBtn.addEventListener('click', () => {
        if (currentFlashcards.length === 0) return;
        currentCardIndex = (currentCardIndex + 1) % currentFlashcards.length;
        renderFlashcard();
    });

    // Initial load of themes and flashcards based on query string
    loadThemesAndFlashcards();
});