import { VideoSection } from './ui/VideoSection.tsx';
import { CollectionNav } from './ui/CollectionNav.tsx';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Box,ChevronRight,Download,Focus,Layers3,Maximize,Minus,Pause,Play,Plus,RotateCcw,Search,X} from 'lucide-react';
import {Brand} from './ui/Brand.tsx';
import {Sources} from './ui/Sources.tsx';
import {createScene} from './scene/runtime.ts';
import {initialFlow,startPass,advanceFlow,nextStage,stageIndex,changeCondition,conditions,type Condition} from './simulation/flow.ts';
import {catalog} from './content/catalog.ts';
import {type SourceId} from './content/project.ts';
import type {Capture,SceneHandle} from './scene/types.ts';

export function App(){
 const host=useRef<HTMLDivElement>(null),scene=useRef<SceneHandle|null>(null),inspector=useRef<HTMLElement>(null),reading=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const [flow,setFlow]=useState(initialFlow),[snapshot,setSnapshot]=useState<Capture|null>(null),[step,setStep]=useState(1),[loaded,setLoaded]=useState(false);
 const [selected,setSelected]=useState<string|null>(null),[isolated,setIsolated]=useState(false),[wireframe,setWireframe]=useState(false),[tour,setTour]=useState<number|null>(null);
 const [drawer,setDrawer]=useState(false),[search,setSearch]=useState(''),[source,setSource]=useState<SourceId|'overview'|null>(null),[error,setError]=useState<string|null>(null),[notice,setNotice]=useState('');
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const pause=useCallback(()=>setFlow(s=>({...s,running:false})),[]);
 const select=useCallback((id:string|null)=>{pause();setSelected(id);setIsolated(false);setTour(null)},[pause]);
 const ready=loaded&&!error,current=catalog.find(p=>p.id===selected),condition=conditions.find(c=>c.id===flow.condition)!;
 const validCapture=snapshot?.revision===flow.revision&&snapshot.condition===flow.condition?snapshot:null;
 useEffect(()=>{
  let cancelled=false;
  void document.fonts.ready.then(()=>{if(cancelled||!host.current)return;try{scene.current=createScene(host.current,select,text=>{setError(text);pause()});setLoaded(true)}catch{setError('Seu navegador não conseguiu abrir a cena 3D. As explicações e fontes continuam disponíveis.')}});
  return()=>{cancelled=true;scene.current?.dispose();scene.current=null};
 },[pause,select]);
 useEffect(()=>{scene.current?.update({progress:flow.progress,condition:flow.condition,selected,isolated,wireframe})},[flow.progress,flow.condition,selected,isolated,wireframe,loaded]);
 useEffect(()=>{
  if(!ready||flow.stage==='ready'||validCapture)return;
  try{setSnapshot(scene.current!.readPlate(flow.condition,flow.revision));setNotice('Imagem capturada. A leitura está disponível abaixo da cena.')}catch{pause();setError('Não foi possível capturar a cena. Recarregue para tentar novamente.')}
 },[flow.stage,flow.condition,flow.revision,validCapture,ready,pause]);
 useEffect(()=>{
  if(!flow.running)return;let raf=0,last=performance.now();
  const tick=(now:number)=>{if(now-last>=32){const dt=(now-last)/1000;last=now;setFlow(s=>advanceFlow(s,dt,!document.hidden))}raf=requestAnimationFrame(tick)};
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[flow.running]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{setReduced(media.matches);if(media.matches)pause()};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[pause]);
 useEffect(()=>{if(drawer)dialog.current?.showModal();else dialog.current?.close()},[drawer]);
 useEffect(()=>{if(selected&&innerWidth<=900){const id=requestAnimationFrame(()=>inspector.current?.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'}));return()=>cancelAnimationFrame(id)}},[selected,reduced]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target instanceof HTMLInputElement||source||drawer)return;if(e.key.toLowerCase()==='r')scene.current?.home();if(e.key==='Escape')select(null)};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[source,drawer,select]);
 function start(){setSnapshot(null);setStep(1);setSelected(null);setIsolated(false);setTour(null);setFlow(s=>startPass(s,reduced));setNotice('Nova passagem. O resultado anterior foi descartado.')}
 function change(c:Condition){if(c===flow.condition)return;setSnapshot(null);setStep(1);setIsolated(false);setSelected(null);setTour(null);setFlow(s=>changeCondition(s,c));setNotice('Condição alterada. Faça uma nova passagem para capturar a imagem.')}
 function reset(){setFlow(s=>initialFlow('clear',s.revision+1));setSnapshot(null);setStep(1);setSelected(null);setIsolated(false);setWireframe(false);setTour(null);setSearch('');requestAnimationFrame(()=>scene.current?.home());setNotice('Experiência reiniciada.')}
 function showReading(){pause();reading.current?.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});reading.current?.focus({preventScroll:true})}
 function primary(){if(flow.running){pause();return}if(flow.progress>0&&flow.progress<1){if(reduced){setFlow(s=>({...s,progress:1,stage:s.stage==='ready'?'captured':s.stage}))}else setFlow(s=>({...s,running:true}));return}if(validCapture){showReading();return}start()}
 function advance(){if(step<stageIndex(flow.stage)){setStep(s=>s+1);return}setFlow(nextStage);setStep(s=>Math.min(4,s+1));setNotice('Próxima etapa da leitura demonstrativa.')}
 function guide(i:number){pause();setTour(i);setSelected(catalog[i].id);setIsolated(false);requestAnimationFrame(()=>scene.current?.focus(catalog[i].id))}
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setNotice('Tela cheia não disponível neste navegador.')}}
 const normalize=(s:string)=>s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu,'');
 const list=()=> <><label className="search"><Search size={15}/><input aria-label="Encontrar conjunto" placeholder="Encontrar conjunto" value={search} onChange={e=>setSearch(e.target.value)}/><span>04</span></label><div className="parts-list">{catalog.filter(p=>normalize(p.label).includes(normalize(search))).map((p)=><button className={'part-row'+(p.id===selected?' selected':'')} aria-pressed={p.id===selected} key={p.id} onClick={()=>{select(p.id);setDrawer(false)}}><strong>{p.label}</strong><ChevronRight size={14}/></button>)}{!catalog.some(p=>normalize(p.label).includes(normalize(search)))&&<small>Nenhum conjunto encontrado.</small>}</div></>;
 const primaryLabel=flow.running?'Pausar passagem':flow.progress>0&&flow.progress<1?'Continuar passagem':validCapture?'Ver leitura':'Passar pela câmera';
 return <div className="app">
  <header className="header"><Brand/><div className="collection-label">O MUNDO POR DENTRO <span>/</span> LAB 07</div><a className="video-link" href="#video">Ver o vídeo <ArrowUpRight size={15}/></a></header>
  <main>
   <section className="workspace" aria-label="Explorar a captura">
    <div className="heading"><p className="eyebrow"><span/>EXPERIMENTO 07 <i>—</i> LEITURA DE PLACAS</p><h1>DA IMAGEM<br/>À PLACA<span>.</span></h1><p>Um carro, uma câmera.<br/>Como a imagem vira caracteres?</p></div>
    <div className="canvas-region"><div className="scene-host" ref={host}/>{error&&<div className="scene-error" role="alert"><Box size={28}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={()=>location.reload()}>Tentar novamente</button></div>}<div className="scene-mode"><span className="status-dot"/>CENA ILUSTRATIVA <span>·</span> PLACA INVENTADA</div><div className="orbit-hint">Arraste para girar <span>·</span> Selecione para explorar</div></div>
    <aside className="sidebar"><div className="sidebar-label">ENTENDA A CAPTURA.</div>{list()}<button className="text-button tour-button" disabled={!ready} onClick={()=>guide(0)}>Conhecer os conjuntos <ArrowRight size={15}/></button><p className="sidebar-note">Ler letras e números<br/>não é medir velocidade.</p><button className="text-button" onClick={()=>setSource('speed')}>Entender a diferença <ArrowUpRight size={14}/></button></aside>
    <div className="camera-tools"><button aria-label="Aproximar cena" disabled={!ready} onClick={()=>scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar cena" disabled={!ready} onClick={()=>scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" disabled={!ready} onClick={()=>scene.current?.home()}><Focus size={18}/></button><button aria-label="Mostrar malha" aria-pressed={wireframe} disabled={!ready} onClick={()=>setWireframe(v=>!v)}><Box size={17}/></button><button aria-label="Salvar imagem horizontal" disabled={!ready} onClick={()=>scene.current?.capture()}><Download size={17}/></button><button aria-label="Salvar imagem vertical" disabled={!ready} onClick={()=>scene.current?.capture(true)}>9:16</button>{Boolean(document.documentElement.requestFullscreen)&&<button aria-label="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
    {current&&<section className="inspector" ref={inspector} aria-label="Conjunto selecionado"><div className="dialog-top"><span className="eyebrow">{tour===null?'EM DETALHE':`CONHEÇA A CENA · ${tour+1}/4`}</span><button className="icon-button" aria-label="Fechar detalhe" onClick={()=>select(null)}><X size={16}/></button></div><h2>{current.label}</h2><p>{current.detail}</p><small>{current.note}</small><button className="text-button" onClick={()=>setSource(current.sourceId)}>Fonte e limites <ArrowUpRight size={13}/></button><div className="inspector-actions"><button disabled={!ready} aria-pressed={isolated} onClick={()=>{pause();setIsolated(v=>!v)}}><Layers3 size={14}/>{isolated?'Ver cena completa':'Isolar'}</button><button disabled={!ready} onClick={()=>scene.current?.focus(current.id)}><Focus size={14}/>Aproximar</button></div>{tour!==null&&<div className="inspector-actions"><button disabled={tour===0} onClick={()=>guide(tour-1)}><ArrowLeft size={14}/>Anterior</button><button onClick={()=>tour<3?guide(tour+1):setTour(null)}>{tour<3?'Próximo conjunto':'Concluir'}<ArrowRight size={14}/></button></div>}</section>}
    <div className="mobile-actions"><button onClick={()=>setDrawer(true)}><Layers3 size={16}/>Conjuntos <span>4</span></button><button disabled={!ready} onClick={()=>guide(0)}>Conhecer a cena <ArrowRight size={15}/></button></div>
    <section className="control-dock" aria-label="Controlar passagem">
     <div className="dock-top"><button className="primary" disabled={!ready} onClick={primary}>{flow.running?<Pause size={16}/>:validCapture&&flow.progress===1?<ArrowRight size={16}/>:<Play size={16}/>} {primaryLabel}</button><div className="pass-status"><strong>{flow.stage==='ready'?'No ponto marcado, a câmera captura.':'Imagem congelada no ponto de captura.'}</strong><span>{Math.round(flow.progress*100)}% da passagem · sem medição de velocidade</span></div><button className="icon-button" aria-label="Reiniciar experiência" onClick={reset}><RotateCcw size={18}/></button></div>
     <div className="pass-track" aria-label="Progresso da passagem"><span style={{width:`${flow.progress*100}%`}}/><i/><small>CAPTURA</small></div>
     <div className="condition-row"><span>Condição da imagem</span><div role="group" aria-label="Condição da captura">{conditions.map(c=><button key={c.id} disabled={!ready} aria-pressed={flow.condition===c.id} onClick={()=>change(c.id)}>{c.label}</button>)}</div></div>
     <div className="dock-bottom"><small>{condition.hint}</small>{validCapture&&<button className="text-button" disabled={!ready} onClick={start}>Passar novamente <RotateCcw size={13}/></button>}</div>
    </section>
    <div className="representation-note">CAPTURA VIRTUAL · RESULTADOS DIDÁTICOS <button onClick={()=>setSource('overview')}>Como funciona <ArrowUpRight size={12}/></button></div>
   </section>
   {validCapture&&<section className="reading" ref={reading} tabIndex={-1} aria-label="Leitura demonstrativa" data-stage={flow.stage}>
    <div className="reading-heading"><p className="eyebrow">DA CÂMERA AO TEXTO</p><h2>Uma imagem.<br/>Quatro etapas<span>.</span></h2><p>Condição: <strong>{condition.label}</strong></p><p className="reading-limit">O recorte vem da cena.<br/>A leitura é pré-definida,<br/>sem OCR real.</p><button className="text-button" onClick={()=>setSource('capture')}>Fontes e limites <ArrowUpRight size={14}/></button></div>
    <div className="reading-body"><nav className="reading-steps" aria-label="Etapas da leitura">{['Captura','Recorte','Caracteres','Conferência'].map((title,i)=><button key={title} aria-current={step===i+1?'step':undefined} disabled={stageIndex(flow.stage)<i+1} onClick={()=>setStep(i+1)}><span>0{i+1}</span>{title}</button>)}</nav>
     <div className="reading-visual">
      {step<=2&&<figure className={'frame-figure '+(step===2?'with-crop':'')}><div className="frame-image"><img src={validCapture.frame} alt={`Quadro da câmera virtual: ${condition.label}, carro com placa cenográfica.`}/>{step===2&&<svg viewBox="0 0 1280 720" aria-label="Região da placa destacada"><polygon points={validCapture.region.points.map(p=>`${p.x},${p.y}`).join(' ')}/></svg>}</div><figcaption>Quadro congelado · mesma posição em todas as condições</figcaption></figure>}
      {step>=2&&step<=3&&<figure className="crop-figure"><span className="eyebrow">REGIÃO DA PLACA</span><img src={validCapture.crop} alt={`Recorte da placa LAB3D na condição ${condition.label}.`}/><figcaption>Recorte dos pixels capturados, preservando a perspectiva.</figcaption></figure>}
      {step===3&&<div className="character-result"><span className="eyebrow">RESULTADO PRÉ-DEFINIDO DA DEMONSTRAÇÃO</span><div className="characters" aria-label={`Leitura demonstrativa: ${condition.result}`}>{[...condition.result].map((c,i)=><span key={i} className={c==='?'?'unknown':''}>{c}</span>)}</div><p>{condition.result.includes('?')?'“?” indica um caractere não resolvido neste exemplo.':'Neste exemplo previsto, os cinco caracteres coincidem.'}</p></div>}
      {step===4&&<div className="comparison"><div><span>Na placa cenográfica</span><strong>LAB3D</strong></div><div><span>Na demonstração</span><strong>{[...condition.result].map((c,i)=><span key={i} className={c==='?'?'unknown':''}>{c}</span>)}</strong></div><p>Conferir a imagem ajuda a perceber o que a leitura deixou de resolver. Estes resultados foram escolhidos para explicar o processo; não são uma medição de acerto.</p><button className="text-button" onClick={()=>{document.querySelector('.control-dock')?.scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'})}}>Comparar outra condição <ArrowRight size={15}/></button></div>}
     </div>
     <div className="reading-footer"><p>{['A câmera gera uma imagem do carro. Ela ainda não é uma sequência de caracteres.','A região da placa é separada do restante da imagem.','Um sistema real usa reconhecimento óptico para interpretar os caracteres. Aqui, o resultado é demonstrativo.','Reconhecer uma sequência não identifica o proprietário, confirma clonagem ou mede velocidade.'][step-1]}</p>{step<4&&<button className="primary" disabled={flow.running||!ready} onClick={advance}>{['Ver recorte','Ver caracteres','Conferir resultado'][step-1]}<ArrowRight size={15}/></button>}</div>
    </div>
   </section>}
   {error&&!validCapture&&<section className="text-fallback"><h2>Como a imagem vira caracteres</h2><ol><li>A câmera captura uma imagem.</li><li>O sistema localiza a região da placa.</li><li>Um OCR interpreta os caracteres visíveis.</li><li>A imagem e o resultado podem ser conferidos.</li></ol><p>Neste laboratório, os resultados são pré-definidos e a placa é inventada. Não há OCR real ou medição de velocidade.</p></section>}
  </main>
  <VideoSection/><footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={()=>setSource('overview')}>Fontes, representação e créditos <ArrowUpRight size={13}/></button><CollectionNav current="radar-placas"/></footer>
  <Sources source={source} onClose={()=>setSource(null)}/><dialog className="parts-dialog" ref={dialog} aria-label="Conjuntos da cena" onClose={()=>setDrawer(false)}><div className="dialog-top"><span className="eyebrow">CONHEÇA A CENA</span><button className="icon-button" aria-label="Fechar conjuntos" onClick={()=>setDrawer(false)}><X size={18}/></button></div>{list()}</dialog><span className="sr-only" role="status" aria-live="polite">{notice}</span>
 </div>;
}
