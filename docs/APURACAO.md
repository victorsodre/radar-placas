# Apuração — leitura de placas

Apuração em 07/11/2026, ampliada em 09/11/2026 (luz infravermelha e cruzamento de leituras). Aplicação validada localmente. A referência editorial é o vídeo indicado no README; fatos técnicos abaixo retornam à documentação primária.

## Fonte consultada

[Axis — License plate capture](https://whitepapers.axis.com/en-us/license-plate-capture), documento de dezembro de 2024, consultado em 07/11/2026. Lidas introdução, instalação, iluminação, configurações e reconhecimento por software.

- Captura é obter uma imagem legível; leitura usa software para localizar e interpretar os caracteres.
- Contraste e nitidez dependem da captura. Posição da câmera, ângulo, foco, iluminação e exposição influenciam o resultado.
- Exposição prolongada de um objeto em movimento pode borrar os caracteres; pouca luz e saturação também reduzem informação útil.
- O processamento pode ocorrer na câmera ou em um servidor. Isso não implica consulta a cadastro de proprietário.
- À noite, o documento recomenda luz infravermelha, invisível ao motorista, e explica que a placa é retrorrefletiva: devolve a luz na direção de onde veio (releitura em 09/11/2026).

É documentação de fabricante. Recomendações numéricas são condicionadas ao equipamento e à instalação; não serão apresentadas como limites universais ou taxas medidas desta experiência. Nenhuma imagem ou asset da fonte foi incorporado.

## Cruzamento de leituras: fontes conferidas

[Agência Estadual de Notícias do Paraná — Olho Vivo](https://www.parana.pr.gov.br/aen/Noticia/Olho-Vivo-seis-carros-clonados-sao-apreendidos-com-sistema-de-cameras-inteligentes-do), 24/02/2026, consultada em 09/11/2026. Notícia oficial: 1.012 câmeras inteligentes em 22 municípios; cita como indício de clone a mesma placa em locais muito distantes em curto intervalo e a comparação do chassi com o cadastro oficial. Não publica a regra do alerta.

[O Progresso de Tatuí](https://oprogressodetatui.com.br/muralha-paulista-em-tatui-identifica-moto-com-placa-clonada/), 15/10/2024, consultada em 09/11/2026. Moto com placa clonada localizada pela Muralha Paulista em Tatuí (SP); pouco antes, a mesma placa passou em Santo André; chassi desbastado e remarcado. Não informa o horário da leitura em Santo André nem a regra que disparou o alerta.

Distância, horários e limite de velocidade média do cruzamento são ilustrativos e aparecem assim na tela.

## Contrato da demonstração implementado

Manter o escopo aprovado: um veículo e placa cenográfica, captura em posição definida, recorte e caracteres apresentados passo a passo. Alterar a condição invalida captura e resultado anteriores. Resultados previstos precisam estar rotulados como demonstração, sem declarar OCR real ou confiança estatística.

Leitura de uma sequência não comprova velocidade, identidade do proprietário, clonagem ou infração. Nenhum acesso a dados de veículos/pessoas ou upload de fotos do público.

## Medição de velocidade: fonte conferida

[Inmetro — medidores por laços indutivos](https://www.gov.br/inmetro/pt-br/acesso-a-informacao/perguntas-frequentes/metrologia-legal/medidor-de-velocidade-radar/como-o-radar-de-lacos-indutivos-faz-para-distinguir-qual-veiculo-excedeu-a-velocidade-se-muitos-passam-ao-mesmo-tempo-sobre-a-via), publicado em 15/05/2017 e atualizado em 05/12/2023. Texto lido em 07/11/2026 pelo link do índice oficial, após falha no endereço tentado inicialmente.

O exemplo usa distância conhecida entre sensores e tempo de passagem; cada faixa possui seu conjunto. A câmera pode registrar a imagem associada ao evento. A aplicação usa isso para distinguir medição e reconhecimento, sem afirmar que todos os instrumentos funcionam por laços ou que câmeras jamais estimam velocidade.

## Decisões de implementação

- Uma câmera virtual captura 1280 × 720 pixels no meio da passagem. A imagem da placa é recortada a partir da projeção de seus quatro cantos; nenhum detector é executado.
- LAB3D é uma sequência cenográfica deliberadamente curta, sem consulta a bases ou vínculo com proprietário.
- Boa captura, ângulo aberto, pouca luz e noite com IR alteram posição da câmera, exposição virtual ou o brilho da placa retrorrefletiva (IR em tons de cinza). Não há simulação calibrada de sensor, ruído ou taxa de reconhecimento.
- Na cena 3D, "Pouca luz" e "Noite com IR" escurecem a iluminação. Com IR aparecem um anel no iluminador, um cone do iluminador até a placa e a placa clara. O IR é invisível; o vermelho é convenção de desenho e a legenda da cena diz isso.
- O carro cruza a marca de captura no meio da passagem e para antes do poste da câmera, sem atravessá-lo.
- A leitura usa resultados previstos: LAB3D (boa captura e noite com IR), LAB3? (ângulo aberto, perde a ponta mais distante) e ??B?D (pouca luz). O ponto de interrogação é um recurso didático, não uma probabilidade calculada. Isso aparece junto ao resultado.
- O campo de visão é uma guia geométrica, não emissão luminosa ou eletromagnética. Trajeto e duração não produzem velocidade em km/h.
- O cruzamento (etapa 05) compara a leitura desta câmera com uma leitura anterior da mesma placa em outra câmera e calcula a velocidade média necessária em linha reta. Leitura com "?" não entra na comparação.
- Origem das imagens, recorte, fonte e condição permanecem identificados. Alterar a condição refaz a leitura na mesma passagem e mantém a etapa; repetir ou reiniciar invalida o quadro e as etapas anteriores.
- Nenhuma foto, placa real, figura de fabricante, áudio ou modelo de terceiros incorporado. Geometria, placa e capturas são autorais.
