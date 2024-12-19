// Definição do inimigo
let enemies = [];  // Lista de inimigos no mapa

// Número de inimigos no mapa
const enemyCount = 3;

// Função para criar inimigos em posições aleatórias no mapa
function createEnemies() {
    enemies = []; // Limpa a lista de inimigos antes de criar novos
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: Math.floor(Math.random() * mapWidth), // Posição x do inimigo no mapa
            y: Math.floor(Math.random() * mapHeight), // Posição y do inimigo no mapa
            health: 100, // Saúde do inimigo
            speed: 0.02, // Velocidade do inimigo
            radius: 0.3, // Raio de colisão
            angle: Math.random() * 2 * Math.PI, // Ângulo do inimigo
        });
    }
}

// Função para verificar colisão entre o inimigo e a parede
function isEnemyCollision(x, y) {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    return (
        mapX < 0 ||
        mapY < 0 ||
        mapX >= mapWidth ||
        mapY >= mapHeight ||
        map[mapY * mapWidth + mapX] === 1 // Verifica se há uma parede no local
    );
}

// Função para mover o inimigo em direção ao jogador, considerando a colisão com a parede
function moveEnemy(enemy) {
    const angleToPlayer = Math.atan2(playerY - enemy.y, playerX - enemy.x);
    const nextX = enemy.x + Math.cos(angleToPlayer) * enemy.speed;
    const nextY = enemy.y + Math.sin(angleToPlayer) * enemy.speed;

    // Verifica se a próxima posição do inimigo colide com uma parede
    if (!isEnemyCollision(nextX, nextY)) {
        // Se não houver colisão, move o inimigo para a nova posição
        enemy.x = nextX;
        enemy.y = nextY;
    } else {
        // Caso haja colisão, o inimigo muda de direção aleatoriamente
        enemy.angle += (Math.random() - 0.5) * Math.PI / 4; // Desvia aleatoriamente para a esquerda ou direita
    }
}

// Função para verificar colisão entre o inimigo e o jogador
function checkEnemyCollision(enemy) {
    const distanceToPlayer = Math.sqrt(Math.pow(playerX - enemy.x, 2) + Math.pow(playerY - enemy.y, 2));
    if (distanceToPlayer < enemy.radius) {
        playerHealth -= 1; // Dano ao jogador
    }
}

// Função para verificar se o inimigo está dentro do campo de visão do jogador
function isEnemyVisible(enemy) {
    const dx = enemy.x - playerX;
    const dy = enemy.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy); // Distância do inimigo para o jogador

    // Calculando o ângulo entre o jogador e o inimigo
    const angleToEnemy = Math.atan2(dy, dx);
    const angleDifference = Math.abs(playerAngle - angleToEnemy); // Diferença angular entre o jogador e o inimigo

    // O inimigo é visível se a diferença de ângulo for menor que o campo de visão
    return angleDifference < fov / 2;
}

// Função para desenhar o inimigo 3D apenas se ele estiver na frente do jogador
function drawEnemy(enemy) {
    if (!isEnemyVisible(enemy)) {
        return; // Se o inimigo não for visível, não o desenha
    }

    // Calculando a direção do inimigo em relação ao jogador
    const dx = enemy.x - playerX;
    const dy = enemy.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy); // Distância do inimigo para o jogador

    // Ajuste no tamanho do inimigo: quanto mais próximo, maior ele fica
    const maxScale = 1.5;  // Escala máxima do inimigo
    const minScale = 0.1;  // Escala mínima do inimigo
    const scaleFactor = 1 / distance;  // Fator de escala inversamente proporcional à distância
    const scale = Math.min(maxScale, Math.max(minScale, scaleFactor)); // Aplica a escala máxima e mínima

    const angle = Math.atan2(dy, dx);

    // Verificando se o inimigo está dentro do campo de visão do jogador (FOV)
    const angleToEnemy = Math.atan2(dy, dx); // Ângulo do inimigo em relação ao jogador
    const angleDifference = Math.abs(playerAngle - angleToEnemy); // Diferença angular

    // O inimigo está visível apenas se a diferença de ângulo for menor que o campo de visão do jogador
    if (angleDifference > fov / 2) {
        return; // O inimigo está fora do campo de visão, não desenha
    }

    // Calculando a posição do inimigo na tela
    const screenX = (Math.cos(angle) * distance) * scale + width / 2;
    const screenY = (Math.sin(angle) * distance) * scale + height / 2;

    // Desenha o inimigo usando uma imagem ou círculo para representação 3D
    Wallctx.beginPath();
    Wallctx.arc(screenX, screenY, 20 * scale, 0, Math.PI * 2);
    Wallctx.fillStyle = 'red'; // Cor do inimigo
    Wallctx.fill();
    Wallctx.stroke();
}

// Função para atualizar todos os inimigos
function updateEnemies() {
    enemies.forEach(enemy => {
        moveEnemy(enemy);  // Movimenta o inimigo em direção ao jogador, com colisão
        checkEnemyCollision(enemy); // Verifica a colisão com o jogador
        drawEnemy(enemy); // Desenha o inimigo na tela, somente se estiver na frente do jogador
    });
}

// Expondo as funções `createEnemies` e `updateEnemies` para o script principal
window.createEnemies = createEnemies;
window.updateEnemies = updateEnemies;
