# Arquitetura implementada

Aplicação estática: React 19.2.6, TypeScript 5.9.3, Three.js 0.187.0 e Vite 8.3.6. Node >=22.18; versões exatas no lockfile. Não depende dos outros repositórios ou da GPU de produção.

| Módulo | Responsabilidade |
|---|---|
| src/App.tsx | Passagem, revisão das etapas, invalidação, seleção e fallback |
| src/simulation/flow.ts | Transições, relógio limitado, revisões e condições demonstrativas |
| src/scene/model.ts | Carro, placa, câmera, via, campo de visão e poses determinísticas |
| src/scene/projection.ts | Projeção dos quatro cantos e retângulo de recorte validado |
| src/scene/runtime.ts | Renderização, câmera de exploração, câmera de captura, seleção e descarte |
| src/scene/camera.ts | Enquadramento dos volumes por projeção |
| src/scene/capture.ts | PNG de exploração com marca e limites |
| src/content/ | Catálogo, vídeo e fontes primárias |
| src/ui/ e styles.css | Marca, fichas, layout e controles HTML |

## Estado e invariantes

`ready → captured → cropped → recognized → reviewed`. Uma passagem dura quatro segundos de animação, sem velocidade física atribuída. A captura corresponde sempre ao progresso 0,5. O carro termina em 1 e para. Tempo por atualização limitado a 0,1 s; pausa/ocultação congelam o progresso. Movimento reduzido permite atingir o final por gesto, sem animar.

Cada nova passagem, mudança de condição ou reset incrementa `revision`. Uma captura só pode ser exibida quando sua revisão e condição correspondem ao fluxo atual. Navegar para uma etapa anterior não altera seus pixels ou libera uma etapa ainda não atingida. Reset restaura boa captura, origem, sem seleção, isolamento ou malha.

IDs físicos: vehicle, plate, camera, field. Placa e carro usam a mesma translação; rodas derivam da distância percorrida. Campo de visão é guia, não intercepta cliques sobre o carro; também pode ser selecionado pela lista. Quadros, região da placa e resultado são informações do painel HTML.

## Captura e recorte

Uma câmera própria, independente da órbita do visitante, renderiza 1280 × 720 no ponto de captura. Durante essa operação, guias, câmera cenográfica, seleção e malha de exploração ficam ocultas. O recorte usa a caixa dos quatro cantos projetados, com margem de oito pixels. Imagem e recorte são PNGs locais em memória. Não há detector, OCR, servidor ou upload.

A rotina restaura pose do modelo, visibilidade, materiais, exposição, tamanho e DPR do renderer. O PNG de divulgação também restaura a câmera. As condições alteram posição da câmera ou exposição virtual; a sequência de caracteres é um exemplo previsto, explicitado na UI.

## Renderização e falhas

DPR até 1,5; sombra 1024; renderização sob demanda com limite de 30 atualizações/s. Para em repouso e em página oculta. Não há órbita automática ou áudio. Limite de atualização não é medição de desempenho em telefone.

Perda ou indisponibilidade inicial de WebGL preserva explicações/fontes e desabilita ações 3D. Uma captura já feita continua consultável após perda de contexto. Recarregar tenta recriar a cena. Build com base `./`, conferido em `/radar-placas/`. Medidas e limitações em VALIDACAO.md.
