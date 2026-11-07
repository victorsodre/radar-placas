# Escopo — Como o radar lê uma placa

## Pergunta e resultado esperado

Como uma imagem vira uma sequência de letras e números? O visitante deve conseguir explicar o mecanismo depois de explorar a cena e acionar seus controles.

Um carro, uma câmera e uma placa fictícia. A experiência mostra captura, recorte e leitura em um fluxo didático local, com falhas ilustrativas identificadas.

## Conjuntos da primeira versão

- Veículo cenográfico
- Placa fictícia
- Câmera e campo de visão
- Quadro capturado
- Região da placa
- Caracteres e resultado

Esses grupos são uma proposta semântica; validar sua correspondência com a geometria e as fontes antes de nomear peças como reais.

## Ações principais

| Controle | Comportamento planejado |
|---|---|
| Passar pela câmera | Executa uma captura ilustrativa em posição definida. |
| Alterar condição | Compara ângulo ou iluminação usando exemplos controlados. |
| Ver leitura | Expõe as etapas e permite comparar imagem com resultado. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`ready → captured → cropped → recognized → reviewed; changingCondition invalida o resultado anterior.`

## Critérios específicos de conclusão

- Usar somente placas inventadas e não consultar bases de veículos ou pessoas.
- Distinguir leitura óptica de placa e medição de velocidade; uma não comprova a outra.
- Resultados pré-calculados são rotulados como demonstração, sem alegar OCR real ou taxa de acerto medida.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- O modelo funciona no desktop e no celular de referência, com reset e fallback conferidos.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Vigilância real, consulta de placas, identificação de proprietários e integração com fiscalização.
- Upload de fotos pessoais e reconhecimento de veículos do público.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.
