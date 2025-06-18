/**
 * Juego de Verbos Modales en Inglés
 * Este juego permite practicar el uso de verbos modales a través de un ejercicio
 * de arrastrar y soltar (drag and drop) palabras en oraciones.
 */

// Objeto principal que almacena el estado del juego
let gameData = {
    examples: [
        // Array de ejemplos con oraciones y sus respuestas correctas
        { sentence: "I [BLANK] visit my grandmother this weekend.", answer: "might" },
        { sentence: "You [BLANK] speak English very well.", answer: "can" },
        { sentence: "Students [BLANK] wear uniforms to school.", answer: "must" },
        { sentence: "I [BLANK] go to the party if I finish my work.", answer: "will" },
        { sentence: "She [BLANK] have called me yesterday.", answer: "should" },
        { sentence: "We [BLANK] visit Paris last summer.", answer: "could" },
        { sentence: "He [BLANK] be very tired after the long journey.", answer: "may" },
        { sentence: "They [BLANK] to ask for permission first.", answer: "ought" }
    ],
    timer: 60,            // Tiempo inicial en segundos
    score: 0,             // Puntuación actual
    totalQuestions: 0,    // Total de preguntas en el juego
    gameActive: false,    // Estado actual del juego
    timerInterval: null,  // Referencia al intervalo del temporizador
    usedWords: new Set() // Conjunto de palabras ya utilizadas
};

// Array para almacenar todas las palabras disponibles en el banco de palabras
let allWords = [];

/**
 * Muestra un mensaje temporal en la interfaz
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - Tipo de mensaje ('success' o 'error')
 */
function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('statusMessage');
    messageDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

/**
 * Carga los ejemplos predeterminados en el juego
 * Reinicia el juego con las oraciones originales
 */
function loadDefaultExamples() {
    gameData.examples = [
        { sentence: "I [BLANK] visit my grandmother this weekend.", answer: "might" },
        { sentence: "You [BLANK] speak English very well.", answer: "can" },
        { sentence: "Students [BLANK] wear uniforms to school.", answer: "must" },
        { sentence: "I [BLANK] go to the party if I finish my work.", answer: "will" },
        { sentence: "She [BLANK] have called me yesterday.", answer: "should" },
        { sentence: "We [BLANK] visit Paris last summer.", answer: "could" },
        { sentence: "He [BLANK] be very tired after the long journey.", answer: "may" },
        { sentence: "They [BLANK] to ask for permission first.", answer: "ought" }
    ];
    initializeGame();
    showMessage('✅ Default examples loaded!');
}

/**
 * Alterna la visibilidad del panel de administración
 * Permite mostrar/ocultar el panel para agregar ejemplos personalizados
 */
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Funciones para el manejo de localStorage
/**
 * Guarda los ejemplos personalizados en localStorage
 * @param {Array} examples - Array de objetos con las oraciones y respuestas
 */
function saveCustomExamples(examples) {
    localStorage.setItem('customExamples', JSON.stringify(examples));
}

/**
 * Carga los ejemplos personalizados desde localStorage
 * @returns {Array} Array de ejemplos personalizados o array vacío si no hay
 */
function loadCustomExamples() {
    const saved = localStorage.getItem('customExamples');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Muestra la lista de ejemplos personalizados en la interfaz
 */
function displayCustomExamples() {
    const customExamples = loadCustomExamples();
    const list = document.getElementById('customExamplesList');
    list.innerHTML = '';

    customExamples.forEach((example, index) => {
        const item = document.createElement('div');
        item.className = 'custom-example-item';
        item.innerHTML = `
            <span>${example.sentence}</span>
            <span class="delete-example" onclick="deleteCustomExample(${index})">❌</span>
        `;
        list.appendChild(item);
    });
}

/**
 * Agrega un nuevo ejemplo personalizado
 * Valida los campos y guarda el ejemplo en localStorage
 */
function addExample() {
    const sentence = document.getElementById('newSentence').value.trim();
    const answer = document.getElementById('newAnswer').value.trim();

    // Validaciones específicas
    if (!sentence) {
        showMessage('❌ Por favor escribe una oración', 'error');
        return;
    }
    if (!answer) {
        showMessage('❌ Por favor escribe la respuesta correcta', 'error');
        return;
    }
    if (!sentence.includes('[BLANK]')) {
        showMessage('❌ La oración debe contener [BLANK] para indicar donde va la respuesta', 'error');
        return;
    }

    // Si pasó todas las validaciones, agregar el ejemplo
    const customExamples = loadCustomExamples();
    customExamples.push({ sentence, answer });
    saveCustomExamples(customExamples);

    // Limpiar los campos
    document.getElementById('newSentence').value = '';
    document.getElementById('newAnswer').value = '';

    displayCustomExamples();

    // Verificar si estamos usando ejemplos personalizados
    const useCustomExamples = document.getElementById('useCustomExamples').checked;
    if (useCustomExamples) {
        gameData.examples = [...customExamples];
        initializeGame();
    }

    showMessage('✅ ¡Ejemplo agregado correctamente!');
}

/**
 * Inicializa el juego
 * Genera el banco de palabras y configura las oraciones
 */
function initializeGame() {
    // Generate word bank with correct answers and distractors
    allWords = [];
    gameData.examples.forEach(example => {
        if (!allWords.includes(example.answer)) {
            allWords.push(example.answer);
        }
    });

    // Add some distractors
    const distractors = ['would', 'shall', 'ought'];
    distractors.forEach(word => {
        if (!allWords.includes(word) && allWords.length < 12) {
            allWords.push(word);
        }
    });

    // Shuffle words
    allWords = shuffleArray(allWords);

    createWordBank();
    createSentences();
    updateScore();
    gameData.usedWords.clear();
}

/**
 * Mezcla aleatoriamente un array
 * @param {Array} array - Array a mezclar
 * @returns {Array} Array mezclado
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Crea el banco de palabras en la interfaz
 * Genera los elementos arrastrables con los verbos modales
 */
function createWordBank() {
    const wordBank = document.getElementById('wordBank');
    wordBank.innerHTML = '';

    allWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';
        wordElement.draggable = true;
        wordElement.textContent = word;
        wordElement.id = `word-${word}`;

        wordElement.addEventListener('dragstart', handleDragStart);
        wordElement.addEventListener('dragend', handleDragEnd);

        wordBank.appendChild(wordElement);
    });
}

/**
 * Crea las oraciones en la interfaz
 * Genera las zonas donde se pueden soltar las palabras
 */
function createSentences() {
    const sentencesContainer = document.getElementById('sentences');
    sentencesContainer.innerHTML = '';

    gameData.examples.forEach((example, index) => {
        const sentenceDiv = document.createElement('div');
        sentenceDiv.className = 'sentence';
        sentenceDiv.id = `sentence-${index}`;

        const parts = example.sentence.split('[BLANK]');
        let html = parts[0];

        html += `<span class="drop-zone" 
                         ondrop="handleDrop(event, ${index})" 
                         ondragover="handleDragOver(event)"
                         ondragleave="handleDragLeave(event)"
                         onclick="clearDropZone(${index})"
                         id="drop-${index}"></span>`;

        html += parts[1] || '';
        sentenceDiv.innerHTML = html;

        sentencesContainer.appendChild(sentenceDiv);
    });

    gameData.totalQuestions = gameData.examples.length;
}

/**
 * Limpia una zona de soltar cuando se hace clic en ella
 * @param {number} index - Índice de la zona a limpiar
 */
function clearDropZone(index) {
    const dropzone = document.getElementById(`drop-${index}`);
    if (dropzone && dropzone.textContent) {
        const word = dropzone.textContent;
        dropzone.textContent = '';
        dropzone.classList.remove('filled');

        // Show the word back in word bank
        const wordElement = document.getElementById(`word-${word}`);
        if (wordElement) {
            wordElement.classList.remove('used');
            gameData.usedWords.delete(word);
        }
    }
}

/**
 * Maneja el inicio del arrastre de una palabra
 * @param {DragEvent} e - Evento de arrastre
 */
function handleDragStart(e) {
    if (e.target.classList.contains('used')) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
}

/**
 * Maneja el fin del arrastre de una palabra
 * @param {DragEvent} e - Evento de arrastre
 */
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

/**
 * Maneja el evento cuando una palabra se arrastra sobre una zona válida
 * @param {DragEvent} e - Evento de arrastre
 */
function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

/**
 * Maneja el evento cuando una palabra sale de una zona válida
 * @param {DragEvent} e - Evento de arrastre
 */
function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

/**
 * Maneja la acción de soltar una palabra en una zona
 * @param {DragEvent} e - Evento de soltar
 * @param {number} index - Índice de la zona donde se soltó
 */
function handleDrop(e, index) {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');

    // Ensure drop is on correct zone
    let dropzone = e.target;
    if (!dropzone.classList.contains('drop-zone')) {
        return;
    }

    // Clear previous word if exists
    if (dropzone.textContent) {
        const prevWord = dropzone.textContent;
        const prevWordElement = document.getElementById(`word-${prevWord}`);
        if (prevWordElement) {
            prevWordElement.classList.remove('used');
            gameData.usedWords.delete(prevWord);
        }
    }

    dropzone.classList.remove('drag-over');
    dropzone.textContent = word;
    dropzone.classList.add('filled');

    // Mark word as used
    const wordElement = document.getElementById(`word-${word}`);
    if (wordElement) {
        wordElement.classList.add('used');
        gameData.usedWords.add(word);
    }
}

/**
 * Inicia una nueva partida
 * Configura el temporizador y reinicia el estado del juego
 */
function startGame() {
    if (gameData.gameActive) return;

    gameData.gameActive = true;
    gameData.timer = 60;
    gameData.score = 0;

    // Reset all sentences and word bank
    resetGameState();

    // Update button states
    document.getElementById('startBtn').disabled = true;

    // Start timer
    gameData.timerInterval = setInterval(() => {
        gameData.timer--;
        updateTimer();

        if (gameData.timer <= 0) {
            endGame();
        }
    }, 1000);

    showMessage('🎮 Game started! Drag words to complete sentences.');
}

/**
 * Actualiza el temporizador en la interfaz
 * Agrega una advertencia visual cuando queda poco tiempo
 */
function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `⏰ Time: ${gameData.timer}s`;

    if (gameData.timer <= 10) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }
}

/**
 * Verifica las respuestas actuales
 * Marca las respuestas correctas e incorrectas y actualiza la puntuación
 */
function checkAnswers() {
    if (!gameData.gameActive) {
        showMessage('⚠️ Please start the game first!', 'error');
        return;
    }

    gameData.score = 0;
    let hasAnswers = false;

    gameData.examples.forEach((example, index) => {
        const dropzone = document.getElementById(`drop-${index}`);
        const sentence = document.getElementById(`sentence-${index}`);

        // Clear previous classes
        sentence.classList.remove('correct', 'incorrect');

        // Check if dropzone has content
        if (!dropzone || !dropzone.textContent.trim()) {
            return;
        }

        hasAnswers = true;
        const userAnswer = dropzone.textContent.trim().toLowerCase();
        const correctAnswer = example.answer.toLowerCase();

        if (userAnswer === correctAnswer) {
            gameData.score++;
            sentence.classList.add('correct');
        } else {
            sentence.classList.add('incorrect');
        }
    });

    if (!hasAnswers) {
        showMessage('⚠️ Please complete at least one sentence before checking!', 'error');
        return;
    }

    updateScore();

    // Calculate score out of 10
    const scoreOutOf10 = (gameData.score / gameData.totalQuestions) * 10;
    const roundedScore = Math.round(scoreOutOf10 * 10) / 10;

    // Show result message
    showMessage(`✨ Resultado: ${gameData.score}/${gameData.totalQuestions} correctas - Calificación: ${roundedScore}/10`);

    // End game if all answers are correct
    if (gameData.score === gameData.totalQuestions) {
        setTimeout(() => {
            endGame();
        }, 1500);
    }
}

/**
 * Actualiza la puntuación mostrada en la interfaz
 */
function updateScore() {
    document.getElementById('score').textContent = `📊 Score: ${gameData.score}/${gameData.totalQuestions}`;
}

/**
 * Reinicia el estado del juego
 * Limpia todas las zonas y reinicia las palabras disponibles
 */
function resetGameState() {
    // Reset dropzones
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.textContent = '';
        zone.classList.remove('filled', 'drag-over');
    });

    // Reset sentences
    document.querySelectorAll('.sentence').forEach(sentence => {
        sentence.classList.remove('correct', 'incorrect');
    });

    // Reset word bank
    document.querySelectorAll('.word-item').forEach(word => {
        word.classList.remove('used');
    });

    gameData.usedWords.clear();
}

/**
 * Reinicia completamente el juego
 * Detiene el temporizador y prepara para una nueva partida
 */
function resetGame() {
    gameData.gameActive = false;
    gameData.score = 0;
    gameData.timer = 60;

    if (gameData.timerInterval) {
        clearInterval(gameData.timerInterval);
    }

    // Enable start button
    document.getElementById('startBtn').disabled = false;

    resetGameState();
    updateTimer();
    updateScore();

    showMessage('🔄 Game reset! Ready to start again.');
}

/**
 * Finaliza el juego
 * Muestra la pantalla de resultados con animaciones según la puntuación
 */
function endGame() {
    gameData.gameActive = false;
    document.getElementById('startBtn').disabled = false;

    if (gameData.timerInterval) {
        clearInterval(gameData.timerInterval);
    }

    const percentage = Math.round((gameData.score / gameData.totalQuestions) * 100);
    let message = '';

    let isPerfectScore = gameData.score === gameData.totalQuestions;
    let isExcellentScore = percentage >= 80;

    if (isPerfectScore) {
        message = `
                    <div class="celebration">
                        ${createConfetti()}
                    </div>
                    <div class="perfect-score">
                        🌟 ¡PERFECTO! 🌟<br>
                        ¡Felicitaciones!
                    </div>
                    <p>Has demostrado un dominio total de los verbos modales.</p>
                `;
    } else if (isExcellentScore) {
        message = `
                    <div class="celebration">
                        ${createConfetti()}
                    </div>
                    <div class="perfect-score">
                        🎉 ¡Excelente! 🎉<br>
                        ¡Muy bien hecho!
                    </div>
                `;
    } else if (percentage >= 60) {
        message = '👍 Good job!';
    } else {
        message = '💪 Keep practicing!';
    }

    document.getElementById('finalScore').innerHTML = `
                ${message}<br>
                Final Score: ${gameData.score}/${gameData.totalQuestions} (${percentage}%)
            `;

    document.getElementById('gameOver').style.display = 'flex';
}

/**
 * Cierra la pantalla de fin de juego
 * Prepara el juego para una nueva partida
 */
function closeGameOver() {
    document.getElementById('gameOver').style.display = 'none';
    resetGame();
}

/**
 * Crea el efecto de confeti para celebrar una buena puntuación
 * @returns {string} HTML del confeti con animaciones
 */
function createConfetti() {
    let confetti = '';
    const colors = ['#667eea', '#764ba2', '#48bb78', '#4299e1', '#ed64a6'];
    for (let i = 0; i < 50; i++) {
        const left = Math.random() * 100;
        const animationDuration = 1 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti += `<div class="confetti" style="left: ${left}%; animation: confetti ${animationDuration}s ease-out infinite; background-color: ${color}; animation-delay: ${Math.random() * 3}s"></div>`;
    }
    return confetti;
}

/**
 * Cambia entre ejemplos personalizados y ejemplos por defecto
 * Si no hay ejemplos personalizados, vuelve a los de defecto
 */
function toggleCustomExamples() {
    const useCustom = document.getElementById('useCustomExamples').checked;
    if (useCustom) {
        loadCustomExamplesIntoGame();
    } else {
        loadDefaultExamples();
    }
}

/**
 * Carga los ejemplos personalizados en el juego
 * Si no hay ejemplos personalizados, vuelve a los de defecto
 */
function loadCustomExamplesIntoGame() {
    const customExamples = loadCustomExamples();
    if (customExamples.length === 0) {
        showMessage('⚠️ No hay ejemplos personalizados. Se usarán los ejemplos por defecto.', 'error');
        document.getElementById('useCustomExamples').checked = false;
        loadDefaultExamples();
        return;
    }
    gameData.examples = [...customExamples];
    initializeGame();
    showMessage('✅ Ejemplos personalizados cargados!');
}

/**
 * Elimina un ejemplo personalizado por su índice
 * Si no quedan ejemplos personalizados, vuelve a los de defecto
 */
function deleteCustomExample(index) {
    const customExamples = loadCustomExamples();
    customExamples.splice(index, 1);
    saveCustomExamples(customExamples);
    displayCustomExamples();

    if (document.getElementById('useCustomExamples').checked) {
        if (customExamples.length === 0) {
            document.getElementById('useCustomExamples').checked = false;
            loadDefaultExamples();
        } else {
            loadCustomExamplesIntoGame();
        }
    }

    showMessage('✅ Ejemplo eliminado correctamente');
}

/**
 * Elimina todos los ejemplos personalizados del almacenamiento
 * Vuelve a los ejemplos por defecto
 */
function clearCustomExamples() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los ejemplos personalizados?')) {
        localStorage.removeItem('customExamples');
        displayCustomExamples();
        document.getElementById('useCustomExamples').checked = false;
        loadDefaultExamples();
        showMessage('✅ Todos los ejemplos personalizados han sido eliminados');
    }
}

// Initialize the game when page loads
window.onload = function () {
    initializeGame();
    displayCustomExamples();
    showMessage('👋 Welcome! Click "Start Game" to begin playing.');
};
