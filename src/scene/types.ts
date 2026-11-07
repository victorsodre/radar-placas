import type * as T from 'three';
import type {catalog} from '../content/catalog.ts';
import type {Condition} from '../simulation/flow.ts';
import type {Region} from './projection.ts';
export type Part=typeof catalog[number]&{group:T.Group};
export type ViewState={progress:number;condition:Condition;selected:string|null;isolated:boolean;wireframe:boolean};
export type Capture={frame:string;crop:string;region:Region;condition:Condition;revision:number};
export type SceneHandle={parts:Part[];update:(state:ViewState)=>void;home:()=>void;focus:(id:string)=>void;zoom:(factor:number)=>void;capture:(portrait?:boolean)=>void;readPlate:(condition:Condition,revision:number)=>Capture;dispose:()=>void};
