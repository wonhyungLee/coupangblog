// Enhanced Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Game constants
        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.COLORS = [
            null,
            '#FF0D72', // T - Magenta
            '#0DC2FF', // I - Cyan  
            '#0DFF72', // S - Green
            '#F538FF', // Z - Purple
            '#FF8E0D', // L - Orange
            '#FFE138', // J - Yellow
            '#3877FF'  // O - Blue
        ];
        
        // Game state
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.isPaused = false;
        
        // Piece data
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        // Piece templates
        this.pieceTypes = 'TILSJOZ';
        this.pieces = {
            'T': [
                [0,1,0],
                [1,1,1],
                [0,0,0]
            ],
            'I': [
                [0,0,0,0],
                [2,2,2,2],
                [0,0,0,0],
                [0,0,0,0]
            ],
            'L': [
                [0,3,0],
                [0,3,0],
                [0,3,3]
            ],
            'S': [
                [0,4,4],
                [4,4,0],
                [0,0,0]
            ],
            'J': [
                [0,5,0],
                [0,5,0],
                [5,5,0]
            ],
            'O': [
                [6,6],
                [6,6]
            ],
            'Z': [
                [7,7,0],
                [0,7,7],
                [0,0,0]
            ]
        };
        
        // Game statistics
        this.stats = {
            totalPlays: parseInt(localStorage.getItem('tetris-total-plays') || 0),
            totalLines: parseInt(localStorage.getItem('tetris-total-lines') || 0),
            totalScore: parseInt(localStorage.getItem('tetris-total-score') || 0)
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupUI();
        this.draw();
        this.hideGameOverlay();
    }
    
    createBoard() {
        return Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.dropPiece();
                    break;
                case 'ArrowUp':
                case ' ':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
            }
        });
        
        // Game control buttons
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        
        // Mobile controls
        document.getElementById('mobile-left').addEventListener('click', () => this.movePiece(-1));
        document.getElementById('mobile-right').addEventListener('click', () => this.movePiece(1));
        document.getElementById('mobile-down').addEventListener('click', () => this.dropPiece());
        document.getElementById('mobile-rotate').addEventListener('click', () => this.rotatePiece());
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                if (this.gameRunning) this.togglePause();
            } else if (e.key === 'r' || e.key === 'R') {
                if (this.gameRunning) this.restartGame();
            }
        });
        
        // Touch controls for mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.isPaused) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            
            if (deltaTime < 200) { // Quick tap
                this.rotatePiece();
            } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.movePiece(1);
                else if (deltaX < -30) this.movePiece(-1);
            } else if (deltaY > 30) {
                this.dropPiece();
            }
        });
    }
    
    setupUI() {
        this.updateDisplay();
        this.drawNextPiece();
    }
    
    showGameOverlay(title, message, showButton = true) {
        const overlay = document.getElementById('game-overlay');
        const titleEl = document.getElementById('overlay-title');
        const messageEl = document.getElementById('overlay-message');
        const buttonEl = document.getElementById('start-game-btn');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        buttonEl.style.display = showButton ? 'block' : 'none';
        overlay.style.display = 'flex';
    }
    
    hideGameOverlay() {
        document.getElementById('game-overlay').style.display = 'none';
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.isPaused = false;
        this.hideGameOverlay();
        this.spawnPiece();
        this.updateDropInterval();
        this.update();
        
        // Update UI
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('restart-btn').disabled = false;
        document.getElementById('quit-btn').disabled = false;
        
        // Update statistics
        this.stats.totalPlays++;
        localStorage.setItem('tetris-total-plays', this.stats.totalPlays);
        document.getElementById('total-plays').textContent = this.stats.totalPlays;
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.isPaused) {
            pauseBtn.innerHTML = '<span class="btn-icon">▶️</span>재개';
            this.showGameOverlay('일시정지', '게임이 일시정지되었습니다', false);
        } else {
            pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span>일시정지';
            this.hideGameOverlay();
            this.update();
        }
    }
    
    restartGame() {
        this.reset();
        this.startGame();
    }
    
    quitGame() {
        this.reset();
        this.showGameOverlay('테트리스 시작', '준비되셨나요?', true);
    }
    
    playAgain() {
        document.getElementById('game-over-modal').style.display = 'none';
        this.reset();
        this.startGame();
    }
    
    reset() {
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropInterval = 1000;
        
        this.updateDisplay();
        this.draw();
        this.drawNextPiece();
        
        // Reset UI
        document.getElementById('pause-btn').innerHTML = '<span class="btn-icon">⏸️</span>일시정지';
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('restart-btn').disabled = true;
        document.getElementById('quit-btn').disabled = true;
    }
    
    spawnPiece() {
        const type = this.nextPiece || this.getRandomPieceType();
        this.nextPiece = this.getRandomPieceType();
        
        this.currentPiece = {
            type: type,
            matrix: this.copyMatrix(this.pieces[type]),
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.pieces[type][0].length / 2),
            y: 0
        };
        
        this.drawNextPiece();
        
        if (this.checkCollision()) {
            this.endGame();
        }
    }
    
    getRandomPieceType() {
        return this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
    }
    
    copyMatrix(matrix) {
        return matrix.map(row => [...row]);
    }
    
    checkCollision() {
        if (!this.currentPiece) return false;
        
        const { matrix, x, y } = this.currentPiece;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] &&
                    (x + col < 0 ||
                     x + col >= this.BOARD_WIDTH ||
                     y + row >= this.BOARD_HEIGHT ||
                     (y + row >= 0 && this.board[y + row][x + col]))) {
                    return true;
                }
            }
        }
        return false;
    }
    
    mergePiece() {
        const { matrix, x, y } = this.currentPiece;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && y + row >= 0) {
                    this.board[y + row][x + col] = matrix[row][col];
                }
            }
        }
    }
    
    movePiece(dir) {
        if (!this.currentPiece) return;
        
        this.currentPiece.x += dir;
        if (this.checkCollision()) {
            this.currentPiece.x -= dir;
        }
    }
    
    dropPiece() {
        if (!this.currentPiece) return;
        
        this.currentPiece.y++;
        this.dropCounter = 0;
        
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.mergePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const originalMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = this.rotateMatrix(originalMatrix);
        
        // Wall kicks
        let offsetX = 0;
        if (this.checkCollision()) {
            // Try moving right
            this.currentPiece.x++;
            offsetX = 1;
            if (this.checkCollision()) {
                // Try moving left instead
                this.currentPiece.x -= 2;
                offsetX = -1;
                if (this.checkCollision()) {
                    // Revert rotation
                    this.currentPiece.x += 1;
                    this.currentPiece.matrix = originalMatrix;
                }
            }
        }
    }
    
    rotateMatrix(matrix) {
        const N = matrix.length;
        const rotated = [];
        for (let i = 0; i < N; i++) {
            rotated.push([]);
            for (let j = 0; j < N; j++) {
                rotated[i][j] = matrix[N - 1 - j][i];
            }
        }
        return rotated;
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            // Scoring system
            const lineScores = [0, 100, 300, 500, 800];
            this.score += lineScores[linesCleared] * this.level;
            
            // Level progression
            if (this.lines >= this.level * 10) {
                this.level++;
                this.updateDropInterval();
                this.showLevelUpEffect();
            }
            
            // Update statistics
            this.stats.totalLines += linesCleared;
            this.stats.totalScore += lineScores[linesCleared] * this.level;
            localStorage.setItem('tetris-total-lines', this.stats.totalLines);
            localStorage.setItem('tetris-total-score', this.stats.totalScore);
            document.getElementById('total-lines').textContent = this.stats.totalLines;
            
            this.updateDisplay();
            this.playLineClearEffect();
        }
    }
    
    updateDropInterval() {
        this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 100);
    }
    
    showLevelUpEffect() {
        // Visual feedback for level up
        const scoreBoard = document.querySelector('.score-board');
        scoreBoard.classList.add('celebration');
        setTimeout(() => scoreBoard.classList.remove('celebration'), 500);
    }
    
    playLineClearEffect() {
        // Visual feedback for line clear
        // Could add sound effects here if enabled
        if (window.soundEnabled) {
            // Play sound effect
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
        }
        
        // Draw grid lines
        this.drawGrid();
    }
    
    drawBoard() {
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.COLORS[this.board[row][col]]);
                }
            }
        }
    }
    
    drawPiece(piece) {
        const { matrix, x, y } = piece;
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    this.drawBlock(x + col, y + row, this.COLORS[matrix[row][col]]);
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        const blockX = x * this.BLOCK_SIZE;
        const blockY = y * this.BLOCK_SIZE;
        
        // Main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(blockX + 1, blockY + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(blockX + 1, blockY + 1, this.BLOCK_SIZE - 2, 3);
        this.ctx.fillRect(blockX + 1, blockY + 1, 3, this.BLOCK_SIZE - 2);
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(blockX + this.BLOCK_SIZE - 4, blockY + 4, 3, this.BLOCK_SIZE - 4);
        this.ctx.fillRect(blockX + 4, blockY + this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4, 3);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= this.BOARD_WIDTH; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(i * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= this.BOARD_HEIGHT; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, i * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#f8f9fa';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const matrix = this.pieces[this.nextPiece];
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - matrix[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - matrix.length * blockSize) / 2;
            
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        const x = offsetX + col * blockSize;
                        const y = offsetY + row * blockSize;
                        
                        this.nextCtx.fillStyle = this.COLORS[matrix[row][col]];
                        this.nextCtx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
                        
                        // Mini highlight
                        this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        this.nextCtx.fillRect(x + 1, y + 1, blockSize - 2, 2);
                        this.nextCtx.fillRect(x + 1, y + 1, 2, blockSize - 2);
                    }
                }
            }
        }
    }
    
    update(time = 0) {
        if (!this.gameRunning || this.gameOver || this.isPaused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.dropPiece();
        }
        
        this.draw();
        requestAnimationFrame((time) => this.update(time));
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        
        // Check for high score
        const currentHighScore = parseInt(localStorage.getItem('tetrisHighScore') || 0);
        const isNewRecord = this.score > currentHighScore;
        
        if (isNewRecord) {
            localStorage.setItem('tetrisHighScore', this.score);
            document.getElementById('score-input').style.display = 'block';
            document.getElementById('save-score-btn').style.display = 'inline-flex';
        }
        
        // Update final score display
        document.getElementById('final-score').textContent = this.score.toLocaleString();
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-lines').textContent = this.lines;
        
        // Show game over modal
        document.getElementById('game-over-modal').style.display = 'block';
        
        // Reset UI
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('restart-btn').disabled = true;
        document.getElementById('quit-btn').disabled = true;
    }
}

// Initialize game when page loads
let tetrisGame;

document.addEventListener('DOMContentLoaded', () => {
    tetrisGame = new TetrisGame();
    
    // Initialize with welcome overlay
    tetrisGame.showGameOverlay('🎮 테트리스 마스터', '클래식한 테트리스를 즐겨보세요!', true);
});

// Export for global access
window.TetrisGame = TetrisGame;