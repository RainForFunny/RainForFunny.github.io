// 化学元素数据
const elements = [
    { name: "氢", symbol: "H", number: 1 },
    { name: "氦", symbol: "He", number: 2 },
    { name: "锂", symbol: "Li", number: 3 },
    { name: "铍", symbol: "Be", number: 4 },
    { name: "硼", symbol: "B", number: 5 },
    { name: "碳", symbol: "C", number: 6 },
    { name: "氮", symbol: "N", number: 7 },
    { name: "氧", symbol: "O", number: 8 },
    { name: "氟", symbol: "F", number: 9 },
    { name: "氖", symbol: "Ne", number: 10 },
    { name: "钠", symbol: "Na", number: 11 },
    { name: "镁", symbol: "Mg", number: 12 },
    { name: "铝", symbol: "Al", number: 13 },
    { name: "硅", symbol: "Si", number: 14 },
    { name: "磷", symbol: "P", number: 15 },
    { name: "硫", symbol: "S", number: 16 },
    { name: "氯", symbol: "Cl", number: 17 },
    { name: "氩", symbol: "Ar", number: 18 },
    { name: "钾", symbol: "K", number: 19 },
    { name: "钙", symbol: "Ca", number: 20 }
];

// 游戏状态
let gameStarted = false;
let timer = null;
let seconds = 0;
let selectedCards = [];
let matchedPairs = 0;
let totalPairs = 10; // 我们将选择8对元素
let currentMode = 'normal'; // 'normal' 或 'hard'

// DOM元素
const gameBoard = document.getElementById('game-board');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameResult = document.getElementById('game-result');
const finalTimeElement = document.getElementById('final-time');
const finalModeElement = document.getElementById('final-mode');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const leaderboardBody = document.getElementById('leaderboard-body');
const challengeModeBtn = document.getElementById('challenge-mode-btn');

// 模式选择按钮
const normalModeBtn = document.getElementById('normal-mode-btn');
const hardModeBtn = document.getElementById('hard-mode-btn');

// 排行榜选项卡按钮
const normalLeaderboardBtn = document.getElementById('normal-leaderboard-btn');
const hardLeaderboardBtn = document.getElementById('hard-leaderboard-btn');
const challengeLeaderboardBtn = document.getElementById('challenge-leaderboard-btn');

// 初始化游戏
function initGame() {
    // 清空游戏板
    gameBoard.innerHTML = '';
    
    // 重置游戏状态
    gameStarted = false;
    seconds = 0;
    selectedCards = [];
    matchedPairs = 0;
    timeElement.textContent = '0';
    
    // 隐藏游戏结果
    gameResult.style.display = 'none';
    
    // 显示开始按钮，隐藏重新开始按钮
    startBtn.style.display = 'block';
    restartBtn.style.display = 'none';
    
    // 停止计时器
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // 更新排行榜
    updateLeaderboard(currentMode);
}

// 开始游戏
function startGame() {
    // 隐藏开始按钮，显示重新开始按钮
    startBtn.style.display = 'none';
    restartBtn.style.display = 'block';
    
    // 设置游戏状态
    gameStarted = true;
    seconds = 0;
    
    // 开始计时
    timer = setInterval(() => {
        seconds++;
        timeElement.textContent = seconds;
    }, 1000);
    
    // 创建游戏卡片
    createGameCards();
}

// 创建游戏卡片
function createGameCards() {
    // 随机选择10对元素
    const shuffledElements = [...elements].sort(() => 0.5 - Math.random()).slice(0, totalPairs);
    
    // 创建卡片数组（每对元素有两张卡片）
    let cards = [];
    shuffledElements.forEach(element => {
        if (currentMode === 'normal') {
            // 普通模式：符号和汉字
            cards.push({ type: 'name', value: element.name, elementId: element.symbol });
            cards.push({ type: 'symbol', value: element.symbol, elementId: element.symbol });
        } else if (currentMode === 'hard') {
            // 困难模式：序号和汉字
            cards.push({ type: 'name', value: element.name, elementId: element.number.toString() });
            cards.push({ type: 'number', value: element.number.toString(), elementId: element.number.toString() });
        } else {
            // 挑战模式：序号和符号
            cards.push({ type: 'symbol', value: element.symbol, elementId: element.number.toString() });
            cards.push({ type: 'number', value: element.number.toString(), elementId: element.number.toString() });
        }
    });
    
    // 随机排序卡片
    cards = cards.sort(() => 0.5 - Math.random());
    
    // 创建卡片元素并添加到游戏板
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.index = index;
        cardElement.dataset.type = card.type;
        cardElement.dataset.value = card.value;
        cardElement.dataset.elementId = card.elementId;
        cardElement.textContent = card.value;
        
        cardElement.addEventListener('click', cardClickHandler);
        gameBoard.appendChild(cardElement);
    });
}

// 卡片点击处理函数
function cardClickHandler() {
    if (!gameStarted || this.classList.contains('matched') || this.classList.contains('flipped') || selectedCards.length >= 2) return;
    
    // 翻转卡片
    this.classList.add('flipped');
    selectedCards.push(this);
    
    // 如果选择了两张卡片，检查是否匹配
    if (selectedCards.length === 2) {
        checkForMatch();
    }
}

// 检查是否匹配
function checkForMatch() {
    const [card1, card2] = selectedCards;
    
    // 如果两张卡片的elementId相同，则匹配成功
    if (card1.dataset.elementId === card2.dataset.elementId && card1.dataset.type !== card2.dataset.type) {
        // 匹配成功
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            selectedCards = [];
            matchedPairs++;
            
            // 检查游戏是否结束
            if (matchedPairs === totalPairs) {
                endGame();
            }
        }, 500);
    } else {
        // 匹配失败，翻回卡片
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            selectedCards = [];
        }, 1000);
    }
}

// 结束游戏
function endGame() {
    // 停止计时器
    clearInterval(timer);
    gameStarted = false;
    
    // 显示游戏结果
    finalTimeElement.textContent = seconds;
    finalModeElement.textContent = currentMode === 'normal' ? '普通模式' : '困难模式';
    gameResult.style.display = 'block';
}

// 保存分数
function saveScore() {
    const playerName = playerNameInput.value.trim() || '匿名玩家';
    
    // 获取现有排行榜
    const leaderboardKey = currentMode === 'normal' ? 'chemistryGameNormalLeaderboard' : 
    currentMode === 'hard' ? 'chemistryGameHardLeaderboard' : 
    'chemistryGameChallengeLeaderboard';
    let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    
    // 添加新分数
    leaderboard.push({ name: playerName, time: seconds });
    
    // 按时间排序
    leaderboard.sort((a, b) => a.time - b.time);
    
    // 只保留前10名
    leaderboard = leaderboard.slice(0, 10);
    
    // 保存到本地存储
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    
    // 更新排行榜显示
    updateLeaderboard(currentMode);
    
    // 重置游戏
    initGame();
}

// 更新排行榜显示
function updateLeaderboard(mode) {
    // 清空排行榜
    leaderboardBody.innerHTML = '';
    
    // 获取排行榜数据
    const leaderboardKey = mode === 'normal' ? 'chemistryGameNormalLeaderboard' : 
                          mode === 'hard' ? 'chemistryGameHardLeaderboard' : 
                          'chemistryGameChallengeLeaderboard';
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    
    // 添加排行榜项
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = entry.name;
        
        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(timeCell);
        
        leaderboardBody.appendChild(row);
    });
}

// 切换游戏模式
function switchGameMode(mode) {
    if (gameStarted) {
        if (!confirm('切换模式将结束当前游戏，确定要切换吗？')) {
            return;
        }
        // 停止当前游戏
        clearInterval(timer);
    }
    
    currentMode = mode;
    
    // 更新模式按钮状态
    normalModeBtn.classList.remove('active');
    hardModeBtn.classList.remove('active');
    challengeModeBtn.classList.remove('active');
    if (mode === 'normal') {
        normalModeBtn.classList.add('active');
    } else if (mode === 'hard') {
        hardModeBtn.classList.add('active');
    } else {
        challengeModeBtn.classList.add('active');
    }
    
    // 重置游戏
    initGame();
}

// 切换排行榜显示
function switchLeaderboard(mode) {
    // 更新排行榜选项卡状态
    normalLeaderboardBtn.classList.remove('active');
    hardLeaderboardBtn.classList.remove('active');
    challengeLeaderboardBtn.classList.remove('active');
    
    if (mode === 'normal') {
        normalLeaderboardBtn.classList.add('active');
    } else if (mode === 'hard') {
        hardLeaderboardBtn.classList.add('active');
    } else {
        challengeLeaderboardBtn.classList.add('active');
    }
    
    // 更新排行榜显示
    updateLeaderboard(mode);
}

// 事件监听器
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', initGame);
saveScoreBtn.addEventListener('click', saveScore);
challengeModeBtn.addEventListener('click', () => switchGameMode('challenge'));

// 模式切换事件
normalModeBtn.addEventListener('click', () => switchGameMode('normal'));
hardModeBtn.addEventListener('click', () => switchGameMode('hard'));

// 排行榜选项卡事件
normalLeaderboardBtn.addEventListener('click', () => switchLeaderboard('normal'));
hardLeaderboardBtn.addEventListener('click', () => switchLeaderboard('hard'));
challengeModeBtn.addEventListener('click', () => switchGameMode('challenge'));
challengeModeBtn.addEventListener('click', () => switchLeaderboard('challenge'));

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    updateLeaderboard('normal');
});