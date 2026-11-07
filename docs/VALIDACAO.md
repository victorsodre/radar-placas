# Validação — Como o radar lê uma placa

Aceite local em 07/11/2026. Escopo implementado, sem deploy público ou envio ao X. Apuração e distinção entre captura, demonstração e medição em [APURACAO.md](APURACAO.md).

## Ambiente e reprodução

Mac, Node 26.7.0, npm 11.19.0 e Chrome. `npm ci --ignore-scripts`, `npm test` e `npm run build` aprovados; o build inclui `tsc --noEmit`, também disponível como `npm run check`. Dependências exatas no lockfile; instalação sem vulnerabilidades reportadas. Build estático conferido em `/radar-placas/`, além da prévia Vite. Nenhum recurso da GPU de produção usado.

## Sete testes automatizados

- Passagem captura ao cruzar o ponto, termina e libera as etapas na ordem correta.
- Pausa, página oculta, delta limitado e valores não finitos preservam o relógio.
- Trocar condição, repetir e reiniciar invalidam resultados com nova revisão; movimento reduzido alcança a captura sem animar.
- Placa e carro viajam juntos; rodas e poses retornam à origem; geometria contém apenas valores finitos.
- Câmera de captura contém a placa inteira nas três condições.
- Enquadramento contém os conjuntos em três posições, três condições e quatro proporções de tela.
- Recorte contém os quatro cantos; projeção inválida, fora da câmera ou com dimensões inválidas é rejeitada.

Testes do fluxo, modelo e projeção foram escritos antes das respectivas implementações; falha inicial por módulos ausentes registrada na sessão. Nenhuma meta arbitrária de cobertura.

## Navegador: 117 verificações aprovadas

80 verificações de interação, 29 no build estático, quatro após ajustar a precisão de profundidade da câmera e quatro de navegação por teclado. São asserções de fluxos, não 117 testes unitários. Logs locais: `output/browser-qa.log`, `output/production-qa.log` `output/export-qa.log` e `output/keyboard-qa.log` (ignorados pelo Git).

- Início, pausa antes da captura, retomada, final e reset. Nenhuma imagem aparece antes do ponto previsto.
- Captura → recorte → caracteres → conferência; etapas futuras bloqueadas e retorno às anteriores preservando pixels.
- Recorte de 179 × 81 no exemplo claro: comparação **pixel por pixel** com a região correspondente do quadro 1280 × 720, sem diferenças.
- As três condições produzem imagens/recortes distintos; pouca luz reduz o brilho real dos pixels. Resultados previstos e ausência de OCR real aparecem na interface.
- Trocar condição ou repetir remove o quadro e a leitura anteriores. Captura independente de órbita e malha; câmera e materiais restaurados.
- Busca com acentos/sem resultado, quatro seleções/isolamentos, restauração da câmera, clique na geometria, órbita sem seleção acidental, zoom, R, malha e tour completo.
- Movimento reduzido interrompe passagem em curso e permite retomada direta ao final. Handler de ocultação congela tempo e renderer, com `document.hidden` controlado no teste; troca nativa de aba não confirmada.
- Desktop 1440 × 980, celular 390 × 844, largura 320 e paisagem 844 × 390. Ação principal no primeiro viewport móvel, catálogo e isolamento acessíveis, sem transbordamento horizontal. Canvas limitado ao contêiner durante resize.
- Fontes fecháveis no celular mesmo com rolagem; Escape fecha diálogo. Enter inicia a passagem e avança a leitura; Tab permanece no diálogo aberto. Texto e controles HTML oferecem alternativa à seleção por canvas.
- Tela cheia, fontes locais, cinco licenças acessíveis e carregamento apenas de recursos locais. Nenhum erro de página ou resposta HTTP com falha nos fluxos concluídos.
- Perda de WebGL preserva leitura já capturada, catálogo e fontes; ações 3D são desabilitadas. Recarga recupera a cena. Falha inicial de WebGL mantém as quatro etapas explicadas em texto.
- Exportações 16:9 e 9:16 restauram a câmera. Captura/isolamento reconferidos no build final após ajustar o plano próximo para 0,1 unidade de desenho.

## Inspeção visual

Capturas reais abertas e revisadas: cena desktop/celular, vidro do carro, placa isolada, quadro, recorte, caracteres, conferência, ângulo aberto, pouca luz, fontes móveis e PNGs. Corrigidos vidro encoberto, rótulo atrás do controle, resize transitório e interferência de superfícies na captura vertical distante.

Evidências em `output/playwright/`: `desktop-final.png`, `production-desktop.png`, `vehicle-detail.png`, `capture-final.png`, `crop-final.png`, `angle-crop.png`, `dark-crop.png`, `mobile-final.png`, `mobile-crop.png`, `mobile-characters.png`, `production-mobile-review.png`, `mobile-source.png`, `landscape.png` e `export-*.png`.

## Medidas do build final

| Item | Resultado |
|---|---:|
| JavaScript minificado | 829.701 bytes; 223,79 kB gzip no relatório Vite |
| CSS minificado | 18.153 bytes; 4,57 kB gzip |
| Primeira ação habilitada | 361 ms observados no servidor local, cache aquecido |
| Cena completa, clara/ângulo aberto | 133 chamadas / 37.554 triângulos |
| Veículo isolado | 94 chamadas / 27.760 triângulos |
| PNG horizontal | 1920 × 1080; 1.524.536 bytes |
| PNG vertical | 1080 × 1920; 1.164.791 bytes |

Tempo até o primeiro controle medido por MutationObserver desde a navegação, em nova aba com cache aquecido; amostra única local, não benchmark de rede ou telefone. Contadores incluem passagens de sombra. DPR até 1,5, sombra 1024 e atualização limitada a 30 Hz; isso não comprova 30 fps em telefone. Renderização em repouso e sob ocultação conferida. Vite mantém aviso de chunk acima de 500 kB; build terminou sem erro.

## Limites do aceite

Celular emulado por viewport no Chrome do Mac; sem telefone físico, Safari/iOS ou ensaio de bateria. Cena e exposição são ilustrativas, sem sensor calibrado. O recorte é real sobre os pixels renderizados; sua localização vem da geometria conhecida, sem detector. A leitura posterior é pré-definida, sem OCR ou taxa de acerto medida. Não há dados de pessoas/veículos, upload, vigilância, identificação de proprietário ou medição de velocidade.

O escopo original permite resultados demonstrativos identificados. Esse contrato foi mantido; não se apresenta uma leitura pré-calculada como reconhecimento real. Publicação e divulgação continuam como etapa posterior autorizável por Victor.
