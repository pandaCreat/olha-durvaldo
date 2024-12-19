// Função para simular o disparo de uma arma com projéteis
class Arma {
    constructor(nome, elementoArma) {
        this.nome = nome;
        this.elementoArma = elementoArma; // Elemento da arma no HTML
        this.municao = 10; // Quantidade de munição inicial
    }

    atirar() {
        if (this.municao > 0) {
            console.log(`Disparo efetuado com a ${this.nome}!`);
            this.municao--;
            console.log(`Munição restante: ${this.municao}`);
            this.criarProjetil();
        } else {
            console.log("Sem munição! Recarregue.");
        }
    }

    // Criação e animação do projétil
    criarProjetil() {
        const projétil = document.createElement("div");
        projétil.classList.add("projetil");

        // Definir a posição inicial do projétil, saindo da posição da arma
        const armaPosX = this.elementoArma.offsetLeft + this.elementoArma.offsetWidth;
        const armaPosY = this.elementoArma.offsetTop + this.elementoArma.offsetHeight / 2 - 2.5;

        projétil.style.left = `${armaPosX}px`;
        projétil.style.top = `${armaPosY}px`;

        // Adiciona o projétil à tela
        document.body.appendChild(projétil);

        // Anima o projétil para frente (movimento para a direita)
        let posX = armaPosX;
        const interval = setInterval(() => {
            posX += 5; // Velocidade do projétil
            projétil.style.left = `${posX}px`;

            // Se o projétil sair da tela, remove ele
            if (posX > window.innerWidth) {
                clearInterval(interval);
                projétil.remove();
            }
        }, 10); // Intervalo de movimento (quanto menor o valor, mais rápido)
    }
}

// Encontrar o elemento da arma no HTML
const armaElement = document.getElementById("arma");

// Criar uma instância da arma
const minhaArma = new Arma("Pistola", armaElement);

// Função que escuta o pressionamento da tecla
document.addEventListener("keydown", function(event) {
    if (event.key === " " || event.code === "Space") {  // Verifica se a tecla pressionada é "Espaço"
        minhaArma.atirar();
    }
});
