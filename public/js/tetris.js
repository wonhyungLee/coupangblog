// Tetris Game Implementation
class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.blockSize = 30;
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.board = this.createBoard();
        
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        this.colors = [
            null,
            '#FF0D72', // T
            '#0DC2FF', // I
            '#0DFF72', // S
            '#F538FF', // Z
            '#FF8E0D', // L
            '#FFE138', // J
            '#3877FF'  // O
        ];
        
        this.pieces = 'TISZLJO';
        this.createPiece = {
            'T': [[0,1,0],[1,1,1],[0,0,0]],
            'I': [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
            'S': [[0,2,2],[2,2,0],[0,0,0]],
            'Z': [[3,3,0],[0,3,3],[0,0,0]],
            'L': [[0,4,0],[0,4,0],[0,4,4]],
            'J': [[0,5,0],[0,5,0],[5,5,0]],
            'O': [[6,6],[6,6]]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.reset();
    }
    
    createBoard() {
        return Array(this.boardHeight).fill(null).map(() => Array(this.boardWidth).fill(0));
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.move(-1);
                    break;
                case 'ArrowRight':
                    this.move(1);
                    break;
                case 'ArrowDown':
                    this.drop();
                    break;
                case 'ArrowUp':
                case ' ':
                    this.rotate();
                    break;
            }
        });
        
        // 게임 컨트롤 버튼
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());
        document.getElementById('play-again-btn').addEventListener('click', () => {
            document.getElementById('game-over-modal').style.display = 'none';
            this.reset();
        });
        
        // 모바일 컨트롤
        document.getElementById('mobile-left').addEventListener('click', () => this.move(-1));
        document.getElementById('mobile-right').addEventListener('click', () => this.move(1));
        document.getElementById('mobile-down').addEventListener('click', () => this.drop());
        document.getElementById('mobile-rotate').addEventListener('click', () => this.rotate());
        
        // 전역 키 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            } else if (e.key === 'r' || e.key === 'R') {
                this.reset();
            }
        });
    }
    
    start() {
        if (!this.gameOver && !this.currentPiece) {
            this.spawnPiece();
            this.update();
            document.getElementById('start-btn').disabled = true;
            document.getElementById('pause-btn').disabled = false;
        }
    }
    
    togglePause() {
        if (this.gameOver) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? '재개' : '일시정지';
        if (!this.isPaused) {
            this.update();
        }
    }
    
    reset() {
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropInterval = 1000;
        
        this.updateDisplay();
        this.draw();
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = '일시정지';
        document.getElementById('game-over-modal').style.display = 'none';
    }
    
    spawnPiece() {
        const type = this.nextPiece || this.pieces[Math.floor(Math.random() * this.pieces.length)];
        this.nextPiece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        
        this.currentPiece = {
            type: type,
            matrix: this.createPiece[type],
            x: Math.floor(this.boardWidth / 2) - Math.floor(this.createPiece[type][0].length / 2),
            y: 0
        };
        
        this.drawNextPiece();
        
        if (this.collision()) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    collision() {
        const { matrix, x, y } = this.currentPiece;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] &&
                    (x + col < 0 ||
                     x + col >= this.boardWidth ||
                     y + row >= this.boardHeight ||
                     this.board[y + row][x + col])) {
                    return true;
                }
            }
        }
        return false;
    }
    
    merge() {
        const { matrix, x, y } = this.currentPiece;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    this.board[y + row][x + col] = matrix[row][col];
                }
            }
        }
    }
    
    move(dir) {
        this.currentPiece.x += dir;
        if (this.collision()) {
            this.currentPiece.x -= dir;
        }
    }
    
    drop() {
        this.currentPiece.y++;
        this.dropCounter = 0;
        
        if (this.collision()) {
            this.currentPiece.y--;
            this.merge();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    rotate() {
        const matrix = this.currentPiece.matrix;
        const N = matrix.length;
        const rotated = matrix.map((row, i) =>
            row.map((val, j) => matrix[N - 1 - j][i])
        );
        
        const previousMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = rotated;
        
        if (this.collision()) {
            this.currentPiece.matrix = previousMatrix;
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.boardHeight - 1; row >= 0; row--) {
            if (this.board[row].every(val => val !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                row++; // 같은 행을 다시 확인
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            
            // 레벨 업
            if (this.lines >= this.level * 10) {
                this.level++;
                this.dropInterval = Math.max(100, this.dropInterval - 100);
            }
            
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    draw() {
        // 캔버스 초기화
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 보드 그리기
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.colors[this.board[row][col]]);
                }
            }
        }
        
        // 현재 조각 그리기
        if (this.currentPiece) {
            const { matrix, x, y } = this.currentPiece;
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        this.drawBlock(x + col, y + row, this.colors[matrix[row][col]]);
                    }
                }
            }
        }
        
        // 격자선 그리기
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.boardWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.blockSize, 0);
            this.ctx.lineTo(i * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.boardHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.blockSize);
            this.ctx.lineTo(this.canvas.width, i * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, 
                         this.blockSize - 1, this.blockSize - 1);
        
        // 하이라이트
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, 
                         this.blockSize - 1, 3);
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, 
                         3, this.blockSize - 1);
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#fff';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const matrix = this.createPiece[this.nextPiece];
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - matrix[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - matrix.length * blockSize) / 2;
            
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        this.nextCtx.fillStyle = this.colors[matrix[row][col]];
                        this.nextCtx.fillRect(
                            offsetX + col * blockSize,
                            offsetY + row * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );
                    }
                }
            }
        }
    }
    
    update(time = 0) {
        if (this.gameOver || this.isPaused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
        
        this.draw();
        requestAnimationFrame((time) => this.update(time));
    }
    
    showGameOver() {
        const highScore = localStorage.getItem('tetrisHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('tetrisHighScore', this.score);
        }
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('high-score').textContent = Math.max(this.score, highScore);
        document.getElementById('game-over-modal').style.display = 'block';
        
        // 서버에 점수 저장 (로그인한 경우)
        if (typeof user !== 'undefined' && user) {
            fetch('/game/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: 'tetris',
                    score: this.score
                })
            });
        }
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris();
});
