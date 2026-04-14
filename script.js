// =====================================================
//  VARIÁVEIS GLOBAIS
// =====================================================

let todosPets = [];        // guarda todos os pets carregados do JSON
let filtroEspecie = 'todos'; // filtro ativo de espécie
let filtroPorte   = 'todos'; // filtro ativo de porte
let petSelecionado = null;   // pet escolhido ao clicar em "Quero Adotar"


// =====================================================
//  CARREGA OS PETS DO ARQUIVO pets.json
// =====================================================

async function carregarPets() {
  try {
    const resposta = await fetch('pets.json');
    todosPets = await resposta.json();
    renderizarCards();
  } catch (erro) {
    console.error('Erro ao carregar pets.json:', erro);
    document.getElementById('grid-pets').innerHTML =
      '<p class="sem-resultado">Não foi possível carregar os animais.</p>';
  }
}


// =====================================================
//  RENDERIZA OS CARDS NA TELA
// =====================================================

function renderizarCards() {
  const grid = document.getElementById('grid-pets');
  grid.innerHTML = '';

  // Filtra a lista de acordo com os filtros ativos
  const petsFiltrados = todosPets.filter(pet => {
    const especieOk = filtroEspecie === 'todos' || pet.especie === filtroEspecie;
    const porteOk   = filtroPorte   === 'todos' || pet.porte   === filtroPorte;
    return especieOk && porteOk;
  });

  // Se não encontrou nada, mostra mensagem
  if (petsFiltrados.length === 0) {
    grid.innerHTML = '<p class="sem-resultado">Nenhum animal encontrado com esses filtros. 🐾</p>';
    return;
  }

  // Cria um card para cada pet filtrado
  petsFiltrados.forEach(pet => {
    const card = document.createElement('article');
    card.className = 'card-pet';
    card.setAttribute('aria-label', `Card de adoção: ${pet.nome}`);

    card.innerHTML = `
      <img src="${pet.foto}" alt="${pet.alt}" loading="lazy" />
      <div class="card-corpo">
        <h3>${pet.nome}</h3>
        <div class="tags">
          <span class="tag">${traduzirEspecie(pet.especie)}</span>
          <span class="tag verde">${traduzirPorte(pet.porte)}</span>
          <span class="tag">${pet.idade}</span>
        </div>
        <p>${pet.descricao}</p>
        <button class="btn-adotar" onclick="abrirModal(${pet.id})" aria-label="Quero adotar ${pet.nome}">
          🐾 Quero Adotar
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}


// =====================================================
//  FUNÇÕES DE TRADUÇÃO (para exibir texto amigável)
// =====================================================

function traduzirEspecie(especie) {
  const opcoes = {
    cao:   '🐶 Cão',
    gato:  '🐱 Gato',
    outro: '🐰 Outro'
  };
  return opcoes[especie] || especie;
}

function traduzirPorte(porte) {
  const opcoes = {
    pequeno: 'Pequeno',
    medio:   'Médio',
    grande:  'Grande'
  };
  return opcoes[porte] || porte;
}


// =====================================================
//  FUNÇÕES DE FILTRO
// =====================================================

function filtrarPorEspecie(valor) {
  filtroEspecie = valor;
  destacarFiltroAtivo('grupo-especie', valor);
  renderizarCards();
}

function filtrarPorPorte(valor) {
  filtroPorte = valor;
  destacarFiltroAtivo('grupo-porte', valor);
  renderizarCards();
}

// Adiciona a classe .ativo apenas no botão clicado
function destacarFiltroAtivo(grupoId, valorAtivo) {
  const botoes = document.querySelectorAll(`#${grupoId} .btn-filtro`);
  botoes.forEach(btn => {
    if (btn.dataset.valor === valorAtivo) {
      btn.classList.add('ativo');
    } else {
      btn.classList.remove('ativo');
    }
  });
}


// =====================================================
//  MODAL — abrir e fechar
// =====================================================

function abrirModal(idPet) {
  // Encontra o pet pelo id
  petSelecionado = todosPets.find(p => p.id === idPet);

  // Preenche o campo somente leitura com o nome do pet
  document.getElementById('campo-pet').value = petSelecionado.nome;
  document.getElementById('titulo-modal').textContent = `Interesse em adotar: ${petSelecionado.nome}`;

  // Reseta o formulário e esconde a mensagem de sucesso
  document.getElementById('form-adocao').reset();
  document.getElementById('form-adocao').style.display = 'block';
  document.getElementById('mensagem-sucesso').style.display = 'none';
  document.getElementById('campo-pet').value = petSelecionado.nome; // repõe após reset

  // Abre o modal
  document.getElementById('fundo-modal').classList.add('aberto');
  document.body.style.overflow = 'hidden'; // impede scroll da página

  // Coloca o foco no primeiro campo para acessibilidade
  document.getElementById('campo-nome').focus();
}

function fecharModal() {
  document.getElementById('fundo-modal').classList.remove('aberto');
  document.body.style.overflow = ''; // libera o scroll
}

// Fecha ao clicar no fundo escuro (fora do modal)
document.getElementById('fundo-modal').addEventListener('click', function(evento) {
  if (evento.target === this) {
    fecharModal();
  }
});

// Fecha ao pressionar a tecla ESC
document.addEventListener('keydown', function(evento) {
  if (evento.key === 'Escape') {
    fecharModal();
  }
});


// =====================================================
//  ENVIO DO FORMULÁRIO DE ADOÇÃO
// =====================================================

document.getElementById('form-adocao').addEventListener('submit', function(evento) {
  evento.preventDefault(); // impede o recarregamento da página

  // Monta o objeto com os dados do pretendente
  const dadosAdocao = {
    pet:       petSelecionado ? petSelecionado.nome : '—',
    petId:     petSelecionado ? petSelecionado.id   : null,
    nome:      document.getElementById('campo-nome').value,
    email:     document.getElementById('campo-email').value,
    telefone:  document.getElementById('campo-telefone').value,
    mensagem:  document.getElementById('campo-mensagem').value,
    dataEnvio: new Date().toLocaleString('pt-BR')
  };

  // Recupera os registros já salvos (ou começa com lista vazia)
  const registros = JSON.parse(localStorage.getItem('interessados') || '[]');
  registros.push(dadosAdocao);

  // Salva de volta no localStorage
  localStorage.setItem('interessados', JSON.stringify(registros));

  // Troca o formulário pela mensagem de sucesso
  document.getElementById('form-adocao').style.display = 'none';
  document.getElementById('mensagem-sucesso').style.display = 'block';
});


// =====================================================
//  INICIALIZAÇÃO — roda ao carregar a página
// =====================================================

carregarPets();
