export const conditions=[
 {id:'clear',label:'Boa captura',hint:'Imagem clara, câmera próxima do eixo do carro.',result:'LAB3D'},
 {id:'angle',label:'Ângulo aberto',hint:'A perspectiva comprime a placa na imagem.',result:'LA?3D'},
 {id:'dark',label:'Pouca luz',hint:'Menos luz reduz a informação visível na captura.',result:'??B?D'},
] as const;
export type Condition=typeof conditions[number]['id'];
export const stages=['ready','captured','cropped','recognized','reviewed'] as const;
export type Stage=typeof stages[number];
export type Flow={condition:Condition;progress:number;running:boolean;stage:Stage;revision:number};
export const stageIndex=(stage:Stage)=>stages.indexOf(stage);
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
 if(state.running||state.stage==='ready'||state.stage==='reviewed')return state;
 return {...state,stage:stages[stageIndex(state.stage)+1]};
}
export function changeCondition(state:Flow,condition:Condition):Flow{return state.condition===condition?state:initialFlow(condition,state.revision+1)}
