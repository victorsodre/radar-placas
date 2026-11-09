import {useId} from 'react';
import {ArrowUpRight,TriangleAlert} from 'lucide-react';
import {crossCheck,crossVerdict,clockBefore,clampMinutes} from '../simulation/crosscheck.ts';
import type {SourceId} from '../content/project.ts';

const clock=clockBefore(0);
const plate=(text:string)=>[...text].map((c,i)=><span key={i} className={c==='?'?'unknown':''}>{c}</span>);

export function CrossCheck({reading,minutes,onMinutes,onSource}:{reading:string;minutes:number;onMinutes:(minutes:number)=>void;onSource:(id:SourceId)=>void}){
 const id=useId(),{speed,verdict}=crossVerdict(reading,minutes),earlier=clockBefore(clampMinutes(minutes));
 return <div className={'crosscheck crosscheck--'+verdict}>
  <span className="eyebrow">CRUZAMENTO DE LEITURAS · EXEMPLO ILUSTRATIVO</span>
  <svg className="crosscheck-map" viewBox="0 0 640 150" role="img" aria-label={`Câmera B na cidade B e câmera A nesta cena, a ${crossCheck.distanceKm} km em linha reta.`}>
   <path d="M120 100 C250 46 390 46 520 100" className="crosscheck-route"/>
   <text x="320" y="30" textAnchor="middle">{crossCheck.distanceKm} km em linha reta</text>
   <circle cx="120" cy="100" r="11"/><circle cx="520" cy="100" r="11"/>
   <text x="16" y="140">Câmera B · cidade B</text><text x="624" y="140" textAnchor="end">Câmera A · esta cena</text>
  </svg>
  <ol className="crosscheck-log" aria-label="Leituras registradas">
   <li><span>Câmera B</span><time>{earlier}</time><strong>LAB3D</strong></li>
   <li><span>Câmera A</span><time>{clock}</time><strong>{plate(reading)}</strong></li>
  </ol>
  <label className="crosscheck-slider" htmlFor={id}><span>Intervalo entre as leituras</span><strong>{clampMinutes(minutes)} min</strong></label>
  <input id={id} type="range" min={crossCheck.minMinutes} max={crossCheck.maxMinutes} step={crossCheck.stepMinutes} value={clampMinutes(minutes)} onChange={e=>onMinutes(Number(e.target.value))} aria-valuetext={`${clampMinutes(minutes)} minutos`}/>
  <output className="crosscheck-verdict" htmlFor={id} aria-live="polite">
   {verdict==='incomplete'?<><strong>Sem comparação</strong><span>A leitura desta câmera tem caracteres não resolvidos. Sem a placa completa, não dá para dizer que é a mesma. Experimente “Boa captura” ou “Noite com IR”.</span></>
   :<><strong>{verdict==='clone'&&<TriangleAlert size={18} aria-hidden="true"/>}{verdict==='clone'?'Alerta: suspeita de clone':'Sem alerta'}</strong><span>{`Para ir de uma câmera à outra, seriam precisos ${Math.round(speed)} km/h de média, em linha reta. `}{verdict==='clone'?'A mesma placa estaria em dois lugares longe demais para esse intervalo.':'Um carro conseguiria fazer esse trajeto.'}</span></>}
  </output>
  <p className="crosscheck-note">Limite ilustrativo: {crossCheck.limitKmh} km/h de média. A regra real do alerta não é divulgada nas fontes consultadas. O alerta é uma suspeita: na abordagem, o número do chassi é comparado com o cadastro oficial.</p>
  <p className="crosscheck-case"><strong>Caso real.</strong> Em outubro de 2024, uma moto passou por uma câmera em Tatuí (SP). Pouco antes, a mesma placa tinha passado em Santo André, a mais de cem quilômetros. O chassi estava raspado e marcado de novo. A reportagem não informa o horário da leitura em Santo André.</p>
  <div className="crosscheck-sources"><button className="text-button" onClick={()=>onSource('clone')}>Leituras cruzadas e chassi <ArrowUpRight size={13}/></button><button className="text-button" onClick={()=>onSource('tatui')}>O caso de Tatuí <ArrowUpRight size={13}/></button></div>
 </div>;
}
