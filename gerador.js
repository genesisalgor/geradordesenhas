const campoSenha = document.getElementById('campo-senha');
const botaoGerar = document.getElementById('botao-gerar'); 
const tamanhoSenha = document.getElementById('tamanho-senha');
const valorTamanho = document.getElementById('valor-tamanho');
const checkboxes = document.querySelectorAll('.chk-opcao');

const btnTema = document.getElementById('btn-tema');
const iconeTema = document.getElementById('icone-tema');
const htmlTag = document.documentElement;

const btnCopiar = document.getElementById('btn-copiar');
const iconeCopiar = document.getElementById('icone-copiar');
const btnVisualizar = document.getElementById('btn-visualizar');
const iconeVisualizar = document.getElementById('icone-visualizar');

const indicadorForca = document.getElementById('indicador-forca');
const textoForca = document.getElementById('texto-forca');
const metadadosEntropia = document.getElementById('metadados-entropia');

const caracteres = {
  minusculas: 'abcdefghijklmnopqrstuvwxyz',
  maiusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeros: '0123456789',
  simbolos: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

btnTema.addEventListener('click', () => {
  const novoTema = htmlTag.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
  htmlTag.setAttribute('data-bs-theme', novoTema);
  iconeTema.className = novoTema === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
});

tamanhoSenha.addEventListener('input', () => {
  valorTamanho.textContent = tamanhoSenha.value;
});

checkboxes.forEach(chk => {
  chk.addEventListener('change', () => {
    campoSenha.classList.remove('is-invalid', 'is-valid');
    if(campoSenha.value === '') campoSenha.type = "password";
    campoSenha.placeholder = "Sua Senha será Gerada Aqui";
  });
});

function obterCaractereAleatorio(stringDeCaracteres) {
  const arrayCripto = new Uint32Array(1);
  window.crypto.getRandomValues(arrayCripto);
  const indiceAleatorio = arrayCripto[0] % stringDeCaracteres.length;
  return stringDeCaracteres[indiceAleatorio];
}

function atualizarMedidorDeForca(comprimento, tamanhoPool) {
  if (tamanhoPool === 0) {
    indicadorForca.style.width = '0%';
    metadadosEntropia.textContent = '0 bits';
    textoForca.textContent = 'Defina os parâmetros';
    return;
  }

  const entropia = comprimento * Math.log2(tamanhoPool);
  metadadosEntropia.textContent = `${Math.round(entropia)} bits`;

  indicadorForca.classList.remove('bg-danger', 'bg-warning', 'bg-success');

  if (entropia < 40) {
    indicadorForca.style.width = '33%';
    indicadorForca.classList.add('bg-danger');
    textoForca.textContent = 'Senha Fraca 🔴';
  } else if (entropia >= 40 && entropia < 60) {
    indicadorForca.style.width = '66%';
    indicadorForca.classList.add('bg-warning');
    textoForca.textContent = 'Senha Média 🟡';
  } else {
    indicadorForca.style.width = '100%';
    indicadorForca.classList.add('bg-success');
    textoForca.textContent = 'Senha Forte 🔥';
  }
}

function gerarSenha() {
  campoSenha.classList.remove('is-valid', 'is-invalid');
  
  let bancoDeCaracteres = '';
  let senhaGarantida = [];
  let poolSize = 0;

  checkboxes.forEach(chk => {
    if (chk.checked) {
      const tipo = chk.getAttribute('data-tipo');
      const pool = caracteres[tipo];
      if (pool) {
        bancoDeCaracteres += pool;
        poolSize += pool.length;
        senhaGarantida.push(obterCaractereAleatorio(pool));
      }
    }
  });

  if (bancoDeCaracteres === '') {
    campoSenha.type = 'text';
    campoSenha.classList.add('is-invalid');
    campoSenha.value = '';
    campoSenha.placeholder = 'Selecione ao menos uma opção!';
    atualizarMedidorDeForca(0, 0);
    return;
  }

  const comprimentoTotal = parseInt(tamanhoSenha.value);
  let senhaFinal = [...senhaGarantida];

  while (senhaFinal.length < comprimentoTotal) {
    senhaFinal.push(obterCaractereAleatorio(bancoDeCaracteres));
  }

  for (let i = 1; i < senhaFinal.length; i++) {
    const arrayCripto = new Uint32Array(1);
    window.crypto.getRandomValues(arrayCripto);
    const j = arrayCripto[0] % (i + 1);
    [senhaFinal[i],  senhaFinal[j]] = [senhaFinal[j], senhaFinal[i]];
  }

  campoSenha.value = senhaFinal.join('');
  iconeCopiar.className = 'bi bi-copy';

  atualizarMedidorDeForca(comprimentoTotal, poolSize);
}

btnVisualizar.addEventListener('click', () => {
  if (campoSenha.classList.contains('is-invalid')) return;

  if (campoSenha.type === 'password') {
    campoSenha.type = 'text';
    iconeVisualizar.className = 'bi bi-eye-fill';
  } else {
    campoSenha.type = 'password';
    iconeVisualizar.className = 'bi bi-eye-slash-fill';
  }
});

btnCopiar.addEventListener('click', () => {
  const senha = campoSenha.value;
  if (!senha || campoSenha.classList.contains('is-invalid')) return;

  navigator.clipboard.writeText(senha).then(() => {
    iconeCopiar.className = 'bi bi-check-lg';
    campoSenha.classList.add('is-valid');
    
    setTimeout(() => {
      iconeCopiar.className = 'bi bi-copy';
      campoSenha.classList.remove('is-valid');
    }, 2000);
  }).catch(err => console.error('Erro ao copiar: ', err));
});

botaoGerar.addEventListener('click', gerarSenha);
