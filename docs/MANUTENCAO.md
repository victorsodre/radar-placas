# Manutenção e validação

## Antes de cada entrega

- Conferir fonte/data das explicações e a distinção entre ilustração e medição.
- Validar assets, créditos e termos, incluindo autorização para servir arquivos extraíveis no navegador.
- Executar `npm test`, `npm run check` e `npm run build`; setup reproduzível com `npm ci`. Registrar os resultados.
- Revisar diff, evitar segredos e incluir apenas mudanças da tarefa. Não adicionar diretórios de configuração pessoal, tokens ou snapshots de sessão.
- Testar URL de vídeo, acesso às fontes, carregamento, fallback e navegação por teclado.
- Conferir visualmente 1440×980, 390×844 e orientação horizontal; usar ao menos um navegador desktop e um celular real quando disponível. Registrar dispositivo e limitações.
- Exercitar selecionar → isolar → reenquadrar → capturar → recortar → conferir → reset. Câmera deve conservar o objeto visível.
- Testar mecanismo no início, meio, fim, pausa, retomada, reset e alternância de aba. Ausência de NaN e poses acumuladas é critério funcional.
- Comparar cena inicial, seleção, quadros e caracteres com o guia visual. Conferir movimento reduzido; não há áudio.

## Testes proporcionais

Sete testes cobrem transições, invalidação, pausa, relógio, movimento conjunto, geometria finita, enquadramento e projeção/recorte. No navegador, repetir o fluxo completo nas três condições, seleção, isolamento, tour, exportações e fallback. Conferir que recorte e região do quadro são idênticos pixel a pixel.

## Rotina após lançamento

- A cada mudança de modelo: revisar IDs, pivôs, nomes, enquadramento, memória e créditos.
- A cada mudança de dependência: repetir build e fluxos essenciais; comparar imagens antes/depois.
- A cada mudança factual: atualizar a fonte e textos, incluindo capturas/posts ainda não publicados.
- Em revisão periódica: conferir links, disponibilidade de vídeos e situação das fontes. Conferir recomendações dos documentos técnicos antes de alterar explicações.
- Registrar bug com dispositivo, navegador, ação, resultado esperado/observado e evidência sem dados pessoais.

## Publicação e reversão

A publicação foi autorizada por Victor em 08/11/2026. O procedimento vigente, os checks, a URL e a reversão estão em [PUBLICACAO.md](PUBLICACAO.md). Pushes em `main` passam a publicar pelo workflow após validação.

## Medição do piloto

Se a medição for implementada e autorizada, observar em 7 e 28 dias: visitas à experiência, primeira interação, uso da ação principal e cliques para o vídeo. Evitar coletar placas, imagens pessoais ou identificadores desnecessários. Views dos vídeos não medem uso do aplicativo.

Usar a combinação de qualidade, uso e custo de manutenção para ajustar o próximo projeto. Não prometer crescimento ou patrocínio com base no alcance histórico.

## Regressões específicas

- Pausar antes da captura não pode gerar imagem. Retomar cruza o ponto uma vez; quadro permanece congelado enquanto o carro termina.
- Trocar condição, repetir e resetar precisam invalidar quadro e etapas. Nunca mostrar leitura antiga sob condição nova.
- Captura deve independer de órbita, zoom, isolamento e malha de exploração. Conferir restauração do renderer e da câmera.
- Projeção precisa conter os quatro cantos da placa em todas as condições. Recorte preserva perspectiva; não alegar retificação inexistente.
- Celular 390/320 px e paisagem: ação principal acessível, nenhuma largura excedente e fontes fecháveis durante rolagem.
- Os rótulos de resultado pré-definido, placa inventada e ausência de medição precisam permanecer na UI e nas capturas correspondentes.
