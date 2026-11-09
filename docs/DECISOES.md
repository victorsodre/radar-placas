# Decisões e estado

## 2026-11-07 — documentação inicial

- Victor solicitou salvar o plano no VicMind, criar uma pasta para cada projeto, preparar guias de desenvolvimento/identidade, enviar ao GitHub e escrever posts do X para uso posterior.
- Planejamento detalhado criado; prioridade recomendada **7/10**. A prioridade pode mudar após o piloto e a validação de assets.
- Identidade: ovictorlab.com / Laboratório noturno. Interações: referência Fusquinha, adaptadas à pergunta do projeto.
- Repositório inicialmente privado por escolha operacional conservadora nesta fase. O pedido autoriza o envio dos guias; não foi tratado como solicitação de implementar e publicar os aplicativos.
- Nenhuma postagem no X enviada. Textos de protótipo e lançamento têm condições explícitas de uso.

## 2026-11-07 — implementação e aceite local

O pedido posterior de desenvolver todos os projetos autorizou a aplicação; publicação permanece fora desta rodada.

- Cena autoral com carro, placa LAB3D, câmera e campo de visão. Captura virtual fixa no meio da passagem; nenhuma placa real ou cadastro consultado.
- Quadro e recorte vêm do renderer. Caracteres são resultados pré-definidos, explicitados junto à imagem. Ângulo e exposição alteram os pixels sem simular sensor calibrado.
- Revisão invalida captura e resultado ao trocar condição, repetir ou reiniciar. Exploração não interfere na câmera de captura.
- Marca, fontes locais, seleção, isolamento, tour, malha, tela cheia e PNGs. Corte/desmontagem e áudio dispensados por não ajudarem a pergunta.
- Sete testes, 117 verificações Chrome e build em subpasta aprovados. Celular emulado, sem ensaio físico ou taxa de OCR medida.
- Guias e rascunho de bastidor atualizados. Sem deploy ou envio ao X.

Próximo da coleção: motor-navio. Evidências em VALIDACAO.md.

## Como registrar mudanças

Acrescentar data, decisão, motivo, fonte/evidência, arquivos afetados e consequência para o escopo. Separar proposta, implementação, validação e publicação. Preservar decisões antigas com indicação de substituição quando necessário.

## 2026-11-08 — repositório público e GitHub Pages

Victor autorizou aprimorar e tornar públicos os dez projetos com HTML funcional e identidade oficial. Esta decisão substitui a restrição histórica de publicação acima. Incluídos navegação entre os dez sites, canonical/OG/X, prévia real, sitemap, página 404, verificação de caminhos e workflow com testes/build antes do deploy. URL: https://victorsodre.github.io/radar-placas/. Conteúdo e modelo educativo preservados; nenhum post enviado ao X. Procedimento e reversão em PUBLICACAO.md.

## 2026-11-08 — vídeo do canal incorporado

Pedido de Victor: embed abaixo do experimento e thumbnail clicável no README. Vídeo `F5GFaFoAbYg`, autoria ovictorlab confirmada pelo oEmbed público. O vídeo trata de placas clonadas. A experiência mostra captura, recorte e uma leitura demonstrativa; não identifica veículos reais. Player `youtube-nocookie.com`, criado só por clique, `autoplay=0`, controles nativos, referrer de origem e link direto sempre disponível. Capa local para não carregar o YouTube na abertura; layout portrait. Cabeçalho leva à seção `#video`. Identidade preservada; nenhum upload ou alteração de vídeo no canal.

## 2026-11-09 — cruzamento de leituras e revisão

Pedido de Victor ("faça tudo" a partir da revisão dos dez labs). Liga o experimento ao vídeo incorporado (EP282, placa clonada).

- Etapa 05 **Cruzamento**: duas câmeras a 120 km (ilustrativo), mesma placa LAB3D, intervalo ajustável e velocidade média mínima em linha reta; acima de 150 km/h (limite ilustrativo) acende "suspeita de clone". Leitura com "?" não entra na comparação. Fontes: AEN-PR 24/02/2026 (mesma placa em locais distantes em curto intervalo; chassi comparado com o cadastro) e O Progresso de Tatuí 15/10/2024 (caso Tatuí/Santo André, sem horário da primeira leitura). A regra real do alerta não é publicada; isso aparece na tela.
- Nova condição **Noite com IR** (quadro em tons de cinza, placa retrorrefletiva clara). "Pouca luz" passa a dizer que falta iluminação própria. Fonte: white paper da Axis (luz infravermelha à noite; placas retrorrefletivas).
- Trocar a condição refaz a leitura na mesma passagem e mantém a etapa (antes zerava a passagem e escondia as etapas). "Ângulo aberto" agora perde o caractere da ponta mais distante da câmera (LAB3?).
- PNG horizontal/vertical leva o recorte, os caracteres e, na etapa 05, o resultado do cruzamento; no celular abre a folha de compartilhamento.
- Nome único "Placa clonada: como a câmera lê e o sistema descobre" (title/OG), h1 "Da placa ao clone", resumo em texto no index.html e JSON-LD VideoObject do EP282.
- Celular: texto ≥ 11 px, alvos ≥ 44 px, descrição da passagem visível, ferramentas abaixo da cena, rolagem vertical livre sobre o canvas (touch-action pan-y), rodinha rola a página (Ctrl/⌘ + rodinha aproxima). Câmera mantém a órbita em resize, tela cheia, condição e isolamento. Toque no canvas só seleciona peça; não pausa nem desmarca.
