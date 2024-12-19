// Configura o canvas e o contexto principal
const Wallcanvas = document.getElementById('Wall'); // Obtém o elemento de canvas para o mapa principal
if (!Wallcanvas) {
    console.error('Canvas element with id "Wall" not found.');
}
const Wallctx = Wallcanvas.getContext('2d'); // Obtém o contexto 2D do canvas principal

// Define a largura e altura do canvas principal
const width = window.innerWidth;  // Largura da tela do navegador
const height = window.innerHeight; // Altura da tela do navegador
Wallcanvas.width = width;  // Define a largura do canvas principal
Wallcanvas.height = height;  // Define a altura do canvas principal

// Configura o canvas do HUD (Heads-Up Display)
const HUDcanvas = document.createElement('canvas'); // Cria um novo canvas para o HUD
HUDcanvas.id = 'HUD';  // Atribui um id para o canvas HUD
HUDcanvas.width = width / 2; // O HUD ocupa 50% da largura da tela
HUDcanvas.height = height / 5; // O HUD ocupa 20% da altura da tela
HUDcanvas.style.position = 'absolute'; // Coloca o canvas HUD de forma absoluta
HUDcanvas.style.bottom = '0'; // Posiciona o HUD no fundo da tela
HUDcanvas.style.left = '50%'; // Centraliza horizontalmente o canvas HUD
HUDcanvas.style.transform = 'translateX(-50%)'; // Ajusta para garantir que fique centralizado
document.body.appendChild(HUDcanvas);  // Adiciona o canvas HUD ao corpo do documento

const HUDctx = HUDcanvas.getContext('2d'); // Obtém o contexto 2D para desenhar no canvas do HUD

// Variáveis do jogo
const keys = {};  // Armazena o estado das teclas pressionadas
let showNoAmmoMessage = false;  // Variável para controlar a exibição da mensagem
let isReloading = false //Variável para controlar o estado de recarga
let playerHealth = 100;  // Saúde inicial do jogador
let playerAmmo = 50;     // Quantidade de munição inicial do jogador
let playerX = 5;  // Posição inicial do jogador no eixo X
let playerY = 5;  // Posição inicial do jogador no eixo Y
let playerAngle = Math.PI / 4;  // Ângulo inicial do jogador (diagonal)
const fov = Math.PI / 3;  // Campo de visão (Field of View)
const depth = 16;  // Profundidade máxima do raycasting (distância até a parede)
const mapWidth = 20; // Largura do mapa
const mapHeight = 20; // Altura do mapa
const map = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 // Define um mapa simples onde 1 é uma parede e 0 é espaço livre
];

// Textura da parede
const wallTexture = new Image(); // Cria uma nova imagem para as paredes
wallTexture.src = './Sprites/Wall.png';  // Carrega a textura da parede

// Carrega a imagem do inimigo
const enemyImage = new Image(); // Cria uma nova imagem para os inimigos
enemyImage.src = './Sprites/enemy.png';  // Caminho para a imagem do inimigo

// Função para verificar colisão com paredes
function isCollision(x, y) {
    const mapX = Math.floor(x); // Arredonda a posição x para verificar a posição no mapa
    const mapY = Math.floor(y); // Arredonda a posição y para verificar a posição no mapa
    return (
        mapX < 0 ||  // Se a posição for fora dos limites do mapa
        mapY < 0 ||  // Se a posição for fora dos limites do mapa
        mapX >= mapWidth ||  // Se a posição x for maior que a largura do mapa
        mapY >= mapHeight ||  // Se a posição y for maior que a altura do mapa
        map[mapY * mapWidth + mapX] === 1  // Se a posição no mapa for uma parede (1)
    );
}

// Função para criar inimigos
function createEnemies() {
    for (let i = 0; i < 5; i++) {  // Cria 5 inimigos no mapa
        let x, y;

        // Gera coordenadas aleatórias para os inimigos
        do {
            x = Math.floor(Math.random() * mapWidth); // Posição x aleatória do inimigo
            y = Math.floor(Math.random() * mapHeight); // Posição y aleatória do inimigo
        } while (map[y * mapWidth + x] === 1);  // Garante que o inimigo não seja colocado em uma parede

        enemies.push({
            x: x,  // Posição x do inimigo
            y: y,  // Posição y do inimigo
            health: 100,  // Saúde do inimigo
            speed: 0.02,  // Velocidade do inimigo
            radius: 0.3,  // Raio de colisão do inimigo
        });
    }
}

// Função para desenhar os inimigos
function drawEnemy(enemy) {
    const dx = enemy.x - playerX;  // Diferença de posição x entre o jogador e o inimigo
    const dy = enemy.y - playerY;  // Diferença de posição y entre o jogador e o inimigo
    const distance = Math.sqrt(dx * dx + dy * dy);  // Distância entre o jogador e o inimigo

    const angleToEnemy = Math.atan2(dy, dx);  // Calcula o ângulo entre o jogador e o inimigo
    const angleDifference = Math.abs(playerAngle - angleToEnemy); // Diferença angular entre o jogador e o inimigo
    if (angleDifference > fov / 2) {  // Se o inimigo estiver fora do campo de visão, não desenha
        return;
    }

    const scale = Math.max(0.1, 1 / distance);  // Escala do inimigo com base na distância

    const screenX = (Math.cos(angleToEnemy) * distance) * scale + width / 2;  // Posição x do inimigo na tela
    const screenY = (Math.sin(angleToEnemy) * distance) * scale + height / 2;  // Posição y do inimigo na tela

    Wallctx.drawImage(enemyImage, screenX - 25 * scale, screenY - 25 * scale, 50 * scale, 50 * scale);  // Desenha o inimigo
}

// Função para atualizar os inimigos
function updateEnemy() {
    enemies.forEach(enemy => {
        drawEnemy(enemy);  // Atualiza e desenha todos os inimigos
    });
}

// Função principal do jogo
function gameLoop() {
    Wallctx.clearRect(0, 0, width, height);  // Limpa o canvas principal
    HUDctx.clearRect(0, 0, HUDcanvas.width, HUDcanvas.height);  // Limpa o canvas do HUD

    updatePlayer();  // Atualiza a posição e movimento do jogador
    castRays();  // Executa o raycasting para desenhar as paredes
    drawHUD();  // Desenha o HUD
    updateEnemy();  // Atualiza e desenha os inimigos

    requestAnimationFrame(gameLoop);  // Chama o próximo quadro do jogo
}

// Raycasting
function castRays() {
    const rayCount = width;  // O número de raios a ser disparado
    const angleStep = fov / rayCount;  // O passo do ângulo entre cada raio

    for (let x = 0; x < rayCount; x++) {
        const rayAngle = playerAngle - fov / 2 + angleStep * x;  // Calcula o ângulo de cada raio
        let distance = 0;
        let hit = false;

        while (!hit && distance < depth) {
            distance += 0.1;  // Aumenta a distância do raio a cada iteração
            const rayX = playerX + Math.cos(rayAngle) * distance;  // Calcula a posição x do raio
            const rayY = playerY + Math.sin(rayAngle) * distance;  // Calcula a posição y do raio
            if (isCollision(rayX, rayY)) {  // Verifica se o raio atingiu uma parede
                hit = true;
            }
        }

        const wallHeight = Math.min(height / distance, height);  // Altura da parede desenhada
        const wallTop = (height - wallHeight) / 2;  // A posição superior da parede desenhada
        const wallBottom = (height + wallHeight) / 2;  // A posição inferior da parede desenhada

        // Delimitar o teto e o chão (distâncias ajustadas)
        Wallctx.fillStyle = '#87CEEB';  // Cor do céu (azul claro)
        Wallctx.fillRect(x, 0, 1, wallTop);  // Desenha o teto (cima da parede)

        Wallctx.fillStyle = '#87CEEB';  // Cor do chão (cinza escuro)
        Wallctx.fillRect(x, 0, 1, wallTop);  // Desenha o céu
        Wallctx.fillStyle = '#2F4F4F';  // Chão (cinza escuro)
        Wallctx.fillRect(x, wallBottom, 1, height - wallBottom);  // Desenha o chão (abaixo da parede)

        if (hit) {
            Wallctx.drawImage(
                wallTexture,
                0, 0, wallTexture.width, wallTexture.height,
                x, wallTop, 1, wallHeight  // Desenha a parede no canvas
            );
        }
    }
}

// Atualiza o jogador
function updatePlayer() {
    const moveSpeed = 0.04;  // Velocidade de movimento do jogador
    const turnSpeed = 0.025;  // Velocidade de rotação do jogador

    let newX = playerX;
    let newY = playerY;

    if (keys['w'] || keys['W']) {  // Se a tecla W for pressionada, move o jogador para frente
        newX += Math.cos(playerAngle) * moveSpeed;
        newY += Math.sin(playerAngle) * moveSpeed;
    }
    if (keys['s'] || keys['S']) {  // Se a tecla S for pressionada, move o jogador para trás
        newX -= Math.cos(playerAngle) * moveSpeed;
        newY -= Math.sin(playerAngle) * moveSpeed;
    }
    if (keys['a'] || keys['A']) {  // Se a tecla A for pressionada, move o jogador para a esquerda
        newX += Math.sin(playerAngle) * moveSpeed;
        newY -= Math.cos(playerAngle) * moveSpeed;
    }
    if (keys['d'] || keys['D']) {  // Se a tecla D for pressionada, move o jogador para a direita
        newX -= Math.sin(playerAngle) * moveSpeed;
        newY += Math.cos(playerAngle) * moveSpeed;
    }

    if (!isCollision(newX, newY)) {  // Verifica se a nova posição do jogador não colide com paredes
        playerX = newX;
        playerY = newY;
    }

    if (keys['ArrowLeft']) playerAngle -= turnSpeed;  // Se a seta esquerda for pressionada, gira para a esquerda
    if (keys['ArrowRight']) playerAngle += turnSpeed;  // Se a seta direita for pressionada, gira para a direita
}

// Função para criar e disparar a arma (projéteis)
class Arma {

    constructor(nome, elementoArma) {
        this.nome = nome;  // Nome da arma
        this.elementoArma = elementoArma;  // Elemento HTML da arma
        this.municao = 10;  // Quantidade inicial de munição
    }

    atirar() { 
        if(isReloading){
            console.log("Recarregando, aguarde...")
            return
        }
        if (playerAmmo > 0) {  // Se ainda houver munição
            console.log(`Disparo efetuado com a ${this.nome}!`);
            playerAmmo--;  // Decrementa a munição
            this.criarProjetil();  // Cria o projétil
            showNoAmmoMessage = false;  // Reseta a mensagem
        } else {
            console.log("Sem munição! Recarregue.");
            showNoAmmoMessage = true;  // Exibe a mensagem "Sem munição!"
        }
    } 

}

// Função para desenhar o HUD no canto inferior centralizado
function drawHUD() {
    HUDctx.fillStyle = 'white';  // Cor do texto do HUD
    HUDctx.font = '20px Arial';  // Define a fonte do texto

    // Desenha a saúde do jogador no HUD
    HUDctx.fillText(`Vida: ${playerHealth}`, 10, HUDcanvas.height - 10);
    
    // Desenha a munição do jogador no HUD
    HUDctx.fillText(`Munição: ${playerAmmo}`, HUDcanvas.width - 150, HUDcanvas.height - 10);
    
    // Se o jogador estiver sem munição, exibe a mensagem "Sem munição! Recarregue."
    if (showNoAmmoMessage) {
        HUDctx.fillStyle = 'red';  // Cor vermelha para a mensagem de erro
        HUDctx.font = '25px Arial';  // Tamanho de fonte maior para a mensagem
        HUDctx.fillText("Sem munição! Recarregue.", 10, 30);  // Exibe no canto superior esquerdo
    }

         // Exibe mensagem de recarga
    if (playerAmmo === 50) {
        HUDctx.fillStyle = 'green';
        HUDctx.font = '25px Arial';
        HUDctx.fillText("Recarregado!", 10, 60);
    }
}

function recarregar() {
    if (playerAmmo === 0 && !isReloading) {  // Só recarrega se a munição estiver vazia
        console.log("Recarregando...");
        isReloading = true // Marca que o jogador está recarregando
        showNoAmmoMessage = true // Exibe a mensagem "Sem munição! Recarregue."
    }
    //tempo de espera para recarregar
    setTimeout(() => {
        playerAmmo = 50 //Define a munição de volta para o máximo
        isReloading = False //Marca que a recarga foi concluída
        console.log("Recarga Concluída!")
    }, 3000)
}

// Eventos de teclado para movimentação
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;  // Registra a tecla pressionada
    if (e.key === ' ') {  // Verifica se a tecla pressionada é a barra de espaço
        arma.atirar();  // Chama a função de disparo da arma
    }
    if (e.key === 'r' || e.key === 'R') {  // Se a tecla "R" for pressionada
        recarregar();  // Chama a função de recarregar
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;  // Remove o registro de tecla pressionada
});

// Inicialização da arma (pistola)
const armaElement = document.getElementById('arma');  // Obtém o elemento HTML da arma
const arma = new Arma('Pistola', armaElement);  // Cria a instância da arma com nome e elemento

// Inicia o jogo quando a textura da parede e do inimigo estiverem carregadas
wallTexture.onload = () => {
    enemyImage.onload = () => {
        createEnemies();  // Cria inimigos
        gameLoop();  // Inicia o loop do jogo
    };
};