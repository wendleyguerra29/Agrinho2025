let estadoJogo = 'TELA_INICIAL';

const produtosInfo = {
    'milho': { emoji: '🌽', colhidos: 0 },
    'tomate': { emoji: '🍅', colhidos: 0 },
    'cenoura': { emoji: '🥕', colhidos: 0 }
};
const tiposProdutos = Object.keys(produtosInfo);
let moedasInovacao = 0;
let felicidadeCidade = 0;
const metaFelicidade = 120;

let notas = [];
let trilhasX = [];
let zonaDeAcertoY;
let velocidadeNotas = 2.5;
let spawnsPorSegundo = 1;
let framesDesdeUltimoSpawn = 0;

let predios = [];
let particulasEntrega = [];

let upgrades = {
    'sementes': { nivel: 1, custo: 15, emoji: '🌱' },
    'velocidade': { nivel: 1, custo: 20, emoji: '🚜' }
};

function setup() {
    createCanvas(800, 600);
    textAlign(CENTER, CENTER);
    
    trilhasX = [width * 0.3, width * 0.5, width * 0.7];
    zonaDeAcertoY = height - 100;
    
    for (let i = 0; i < 3; i++) {
        predios.push(new Predio(150 + i * 220, 300));
    }
}

function draw() {
    background('#222');
    switch (estadoJogo) {
        case 'TELA_INICIAL': telaInicial(); break;
        case 'FASE_CAMPO': faseCampo(); break;
        case 'LOJA_UPGRADE': lojaUpgrade(); break;
        case 'FASE_CIDADE': faseCidade(); break;
        case 'FESTA': festa(); break;
    }
}

function mousePressed() {
    if (estadoJogo === 'TELA_INICIAL') {
        iniciarFaseCampo();
    } else if (estadoJogo === 'LOJA_UPGRADE') {
        if (mouseY > 250 && mouseY < 300) {
            if (mouseX > 150 && mouseX < 350) comprarUpgrade('sementes');
            if (mouseX > 450 && mouseX < 650) comprarUpgrade('velocidade');
        }
        if (mouseY > 450 && mouseY < 500 && mouseX > 300 && mouseX < 500) {
            iniciarFaseCidade();
        }
    } else if (estadoJogo === 'FASE_CIDADE') {
        for (let p of predios) {
            p.clique();
        }
    } else if (estadoJogo === 'FESTA') {
        reiniciarJogo();
    }
}

function keyPressed() {
    if (estadoJogo === 'FASE_CAMPO') {
        let teclaTrilha = -1;
        if (key === 'a' || key === 'A') teclaTrilha = 0;
        if (key === 's' || key === 'S') teclaTrilha = 1;
        if (key === 'd' || key === 'D') teclaTrilha = 2;
        
        if (teclaTrilha !== -1) {
            let acertou = false;
            for (let i = notas.length - 1; i >= 0; i--) {
                if (notas[i].trilha === teclaTrilha) {
                    if (notas[i].estaNaZona()) {
                        let produtosGanhos = 1 + (upgrades.sementes.nivel - 1);
                        produtosInfo[notas[i].tipo].colhidos += produtosGanhos;
                        notas.splice(i, 1);
                        acertou = true;
                        break;
                    }
                }
            }
        }
    }
}

function telaInicial() {
    background('#87CEEB');
    fill('#228B22');
    noStroke();
    rect(0, height - 150, width, 150);
    
    fill(255);
    stroke(0);
    strokeWeight(5);
    textSize(50);
    text('Colheita Conectada', width / 2, height / 2 - 100);
    
    textSize(32);
    noStroke();
    fill(0);
    text('Clique para iniciar', width / 2, height / 2 + 50);
}

function faseCampo() {
    background('#A0D995');
    desenharHUD();
    
    for (let x of trilhasX) {
        stroke(0, 50);
        line(x, 0, x, height);
    }
    noStroke();
    fill(0, 30);
    rect(0, zonaDeAcertoY - 35, width, 70);
    fill(255);
    textSize(32);
    text("A", trilhasX[0], zonaDeAcertoY);
    text("S", trilhasX[1], zonaDeAcertoY);
    text("D", trilhasX[2], zonaDeAcertoY);

    framesDesdeUltimoSpawn++;
    if (framesDesdeUltimoSpawn > 60 / spawnsPorSegundo) {
        notas.push(new Nota());
        framesDesdeUltimoSpawn = 0;
    }
    
    for (let i = notas.length - 1; i >= 0; i--) {
        notas[i].atualizar();
        notas[i].desenhar();
        if (notas[i].y > height) {
            notas.splice(i, 1);
        }
    }

    if (notas.length > 20) estadoJogo = 'LOJA_UPGRADE';
}

function lojaUpgrade() {
    background('#4a4a4a');
    fill('#FFD700');
    textSize(40);
    text("Loja de Inovações 🏙️", width / 2, 80);
    
    fill(255);
    textSize(28);
    text(`Moedas: ${moedasInovacao} 🪙`, width / 2, 150);
    
    fill(upgrades.sementes.custo <= moedasInovacao ? '#3CB371' : '#888');
    rect(150, 250, 200, 50, 10);
    fill(0);
    textSize(20);
    text(`${upgrades.sementes.emoji} Sementes Nv.${upgrades.sementes.nivel + 1}`, 250, 275);
    
    fill(upgrades.velocidade.custo <= moedasInovacao ? '#3CB371' : '#888');
    rect(450, 250, 200, 50, 10);
    fill(0);
    text(`${upgrades.velocidade.emoji} Trator Nv.${upgrades.velocidade.nivel + 1}`, 550, 275);

    fill(255);
    textSize(18);
    text(`Custo: ${upgrades.sementes.custo} 🪙`, 250, 315);
    text(`Custo: ${upgrades.velocidade.custo} 🪙`, 550, 315);
    
    fill('#87CEEB');
    rect(300, 450, 200, 50, 10);
    fill(0);
    textSize(28);
    text("Abastecer!", 400, 475);
}

function faseCidade() {
    background('#B4B4B4');
    desenharHUD();

    for(let p of particulasEntrega) p.desenhar();
    for(let p of predios) p.desenhar();

    for(let i = particulasEntrega.length - 1; i >= 0; i--) {
        particulasEntrega[i].atualizar();
        if(particulasEntrega[i].vida <= 0) particulasEntrega.splice(i,1);
    }

    if (felicidadeCidade >= metaFelicidade) {
        estadoJogo = 'FESTA';
    }
}

function festa() {
    background('#D8BFD8');
    
    textSize(100);
    text('🧑‍🌾', 150, 400);
    text('🏙️', width - 150, 400);
    
    textSize(50);
    text('🎉', width / 2, 300);
    text('✨', width / 2 - 100, 250);
    text('🥳', width / 2 + 100, 250);

    fill('#FFD700');
    stroke(0);
    strokeWeight(4);
    textSize(40);
    text('CONEXÃO COMPLETA!', width / 2, 150);
    
    noStroke();
    fill(0);
    textSize(28);
    text('O campo e a cidade celebram em harmonia!', width / 2, 220);
    text('Clique para jogar novamente', width / 2, height - 100);
}

class Nota {
    constructor() {
        this.trilha = floor(random(3));
        this.x = trilhasX[this.trilha];
        this.y = -20;
        this.tipo = random(tiposProdutos);
        this.emoji = produtosInfo[this.tipo].emoji;
        this.velocidade = velocidadeNotas - (upgrades.velocidade.nivel - 1) * 0.3;
    }
    
    atualizar() { this.y += this.velocidade; }
    
    desenhar() {
        textSize(40);
        text(this.emoji, this.x, this.y);
    }
    
    estaNaZona() { return this.y > zonaDeAcertoY - 35 && this.y < zonaDeAcertoY + 35; }
}

class Predio {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.largura = 120;
        this.altura = 180;
        this.pedido = null;
        this.satisfeito = false;
        this.gerarNovoPedido();
    }
    
    gerarNovoPedido() {
        this.satisfeito = false;
        this.pedido = random(tiposProdutos);
    }
    
    desenhar() {
        fill(this.satisfeito ? '#FFD700' : '#FFF');
        stroke(0);
        rect(this.x, this.y, this.largura, this.altura);
        
        if (!this.satisfeito) {
            textSize(40);
            text(produtosInfo[this.pedido].emoji, this.x + this.largura / 2, this.y - 40);
        }
    }
    
    clique() {
        if (!this.satisfeito && mouseX > this.x && mouseX < this.x + this.largura && mouseY > this.y && mouseY < this.y + this.altura) {
            if (produtosInfo[this.pedido].colhidos >= 5) {
                produtosInfo[this.pedido].colhidos -= 5;
                moedasInovacao += 10;
                felicidadeCidade += 15;
                this.satisfeito = true;
                
                for(let i=0; i<10; i++) {
                    particulasEntrega.push(new Particula(this.x + this.largura/2, this.y + this.altura/2, produtosInfo[this.pedido].emoji));
                }
                
                setTimeout(() => this.gerarNovoPedido(), 3000);
            }
        }
    }
}

class Particula {
    constructor(x, y, emoji) {
        this.x = x;
        this.y = y;
        this.vx = random(-2, 2);
        this.vy = random(-3, -1);
        this.emoji = emoji;
        this.vida = 255;
    }

    atualizar() {
        this.x += this.vx;
        this.y += this.vy;
        this.vida -= 5;
    }

    desenhar() {
        noStroke();
        push();
        tint(255, this.vida);
        textSize(20);
        text(this.emoji, this.x, this.y);
        pop();
    }
}

function desenharHUD() {
    textSize(24);
    noStroke();
    fill(0, 100);
    rect(0, 0, width, 50);
    fill(255);
    
    let textoProdutos = `${produtosInfo['milho'].emoji} ${produtosInfo['milho'].colhidos} | ${produtosInfo['tomate'].emoji} ${produtosInfo['tomate'].colhidos} | ${produtosInfo['cenoura'].emoji} ${produtosInfo['cenoura'].colhidos}`;
    
    if (estadoJogo === 'FASE_CAMPO') {
        text(textoProdutos, width / 2, 25);
    } else if (estadoJogo === 'FASE_CIDADE') {
        text(textoProdutos, 200, 25);
        text(`🪙 ${moedasInovacao}`, 480, 25);
        text(`😊 ${felicidadeCidade}`, 680, 25);
    }
}

function comprarUpgrade(tipo) {
    if (tipo === 'sementes' && moedasInovacao >= upgrades.sementes.custo) {
        moedasInovacao -= upgrades.sementes.custo;
        upgrades.sementes.nivel++;
        upgrades.sementes.custo = floor(upgrades.sementes.custo * 1.8);
    }
    if (tipo === 'velocidade' && moedasInovacao >= upgrades.velocidade.custo) {
        moedasInovacao -= upgrades.velocidade.custo;
        upgrades.velocidade.nivel++;
        upgrades.velocidade.custo = floor(upgrades.velocidade.custo * 2);
    }
}

function iniciarFaseCampo() {
    estadoJogo = 'FASE_CAMPO';
    notas = [];
}

function iniciarFaseCidade() {
    estadoJogo = 'FASE_CIDADE';
    felicidadeCidade = 0;
    for(let p of predios) {
        p.gerarNovoPedido();
    }
}

function reiniciarJogo() {
    for (let tipo in produtosInfo) {
        produtosInfo[tipo].colhidos = 0;
    }
    moedasInovacao = 0;
    upgrades = {
        'sementes': { nivel: 1, custo: 15, emoji: '🌱' },
        'velocidade': { nivel: 1, custo: 20, emoji: '🚜' }
    };
    estadoJogo = 'TELA_INICIAL';
}