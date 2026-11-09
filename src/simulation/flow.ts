export const conditions=[
 {id:'clear',label:'Boa captura',hint:'Imagem clara, câmera próxima do eixo do carro.',result:'LAB3D'},
 {id:'angle',label:'Ângulo aberto',hint:'A perspectiva comprime a placa; o lado mais distante da câmera perde detalhe.',result:'LAB3?'},
 {id:'dark',label:'Pouca luz',hint:'Sem iluminação própria, a câmera recebe pouca luz e os caracteres se perdem.',result:'??B?D'},
 {id:'infrared',label:'Noite com IR',hint:'À noite, câmeras de placa usam luz infravermelha, invisível ao motorista. A placa é retrorrefletiva e devolve essa luz à câmera.',result:'LAB3D'},
] as const;
export type Condition=typeof conditions[number]['id'];
export const stages=['ready','captured','cropped','recognized','reviewed','crossed'] as const;
export type Stage=typeof stages[number];
export type Flow={condition:Condition;progress:number;running:boolean;stage:Stage;revision:number};
export const stageIndex=(stage:Stage)=>stages.indexOf(stage);
export const lastStep=stages.length-1;
export const unit=(value:number)=>Number.isFinite(value)?Math.min(1,Math.max(0,value)):0;
export const initialFlow=(condition:Condition='clear',revision=0):Flow=>({condition,revision,progress:0,running:false,stage:'ready'});
export function startPass(state:Flow,reduced=false):Flow{return {...initialFlow(state.condition,state.revision+1),running:!reduced,progress:reduced?1:0,stage:reduced?'captured':'ready'}}
export function advanceFlow(state:Flow,seconds:number,visible:boolean):Flow{
 if(!state.running||!visible)return state;
 const dt=Number.isFinite(seconds)?Math.max(0,Math.min(.1,seconds)):0;if(!dt)return state;
 const progress=Math.min(1,state.progress+dt/4),stage=progress>=.5&&state.stage==='ready'?'captured':state.stage;
 return {...state,progress,running:progress<1,stage};
}
export function nextStage(state:Flow):Flow{
 if(state.running||state.stage==='ready'||stageIndex(state.stage)===lastStep)return state;
 return {...state,stage:stages[stageIndex(state.stage)+1]};
}
/** Same pass, new image: the capture point is fixed, so only the revision changes and the reading is redone. */
export function changeCondition(state:Flow,condition:Condition):Flow{return state.condition===condition?state:{...state,condition,revision:state.revision+1}}
