import {useEffect,useRef} from 'react';
import {ArrowUpRight,X} from 'lucide-react';
import {sources,type SourceId} from '../content/project.ts';
export function Sources({source,onClose}:{source:SourceId|'overview'|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(source){dialog.current?.showModal();requestAnimationFrame(()=>{dialog.current?.querySelector(`[data-source="${source}"]`)?.scrollIntoView({block:'nearest'})})}else dialog.current?.close()},[source]);
 return <dialog className="sources-dialog" ref={dialog} aria-label="Fontes e representação" onClose={onClose}>
  <div className="dialog-top"><span className="eyebrow">POR TRÁS DO EXPERIMENTO</span><button className="icon-button" aria-label="Fechar fontes" onClick={onClose}><X size={18}/></button></div>
  <h2>Imagem, recorte<br/>e demonstração.</h2><p>A câmera virtual captura a cena. O recorte usa essa imagem. Os caracteres seguintes são <strong>resultados pré-definidos</strong>, não um OCR executado sobre os pixels.</p>
  <p>A placa LAB3D é cenográfica. Ângulo, luz e infravermelho mudam a imagem. No cruzamento, distância, horários e limite são <strong>ilustrativos</strong>: a conta mostra a velocidade média mínima que o trajeto exigiria, não mede um veículo real. Nada aqui calcula taxa de acerto ou constata infração.</p>
  {sources.map(s=><details key={s.id} data-source={s.id} open={source===s.id}><summary>{s.title}</summary><p><strong>{s.author}</strong><br/>{s.date}</p><p>{s.method}</p><p>{s.scope}</p><a href={s.url} target="_blank" rel="noreferrer">Abrir fonte original <ArrowUpRight size={14}/></a></details>)}
  <p className="credits">Direção, geometria, placa e imagens: Victor Sodré / ovictorlab. Modelo autoral; nenhum veículo, fotografia, som ou mapa de terceiros incorporado. Exploração inspirada no Fusquinha.</p>
  <p className="credits">Licenças: {['bibliotecas','anton','archivo','archivo-black','jetbrains-mono'].map((f,i)=><span key={f}>{i>0&&' · '}<a href={`${import.meta.env.BASE_URL}licenses/${f}.txt`} target="_blank" rel="noreferrer">{f}</a></span>)}</p>
 </dialog>;
}
