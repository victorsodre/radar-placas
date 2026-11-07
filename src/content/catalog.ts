export const catalog=[
 {id:'vehicle',label:'Veículo cenográfico',detail:'O carro atravessa a cena. A imagem é congelada quando ele alcança a marca na via.',note:'Trajeto e tempo ilustrativos. Não há medição de velocidade.',sourceId:'speed'},
 {id:'plate',label:'Placa inventada',detail:'LAB3D é a sequência que queremos encontrar na imagem. A placa foi desenhada para este laboratório.',note:'Não corresponde a um cadastro de veículos. A imagem precisa preservar seus detalhes.',sourceId:'capture'},
 {id:'camera',label:'Câmera',detail:'Uma câmera virtual registra o carro no ponto marcado. Sua posição muda no exemplo de ângulo aberto.',note:'A captura é produzida pela cena. Não usamos câmera do dispositivo ou imagens de terceiros.',sourceId:'capture'},
 {id:'field',label:'Campo de visão',detail:'O volume amarelo mostra a área enquadrada pela câmera no ponto de captura. A placa precisa aparecer dentro dela.',note:'As linhas são guias de visualização, não ondas de radar ou luz visível.',sourceId:'capture'},
] as const;
export type PartId=typeof catalog[number]['id'];
