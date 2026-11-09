// Illustrative cross-check between two plate readings. Distance, clock and limit are
// didactic values chosen for this lab; real systems do not publish their alert rule.
export const crossCheck={distanceKm:120,limitKmh:150,minMinutes:10,maxMinutes:180,stepMinutes:5,defaultMinutes:30,readingAt:14*60} as const;
export type Verdict='incomplete'|'possible'|'clone';

/** Lowest average speed (km/h) that covers a straight line in the given interval. */
export function requiredSpeed(distanceKm:number,minutes:number){
 if(!Number.isFinite(distanceKm)||!Number.isFinite(minutes)||distanceKm<0||minutes<=0)return Infinity;
 return distanceKm/(minutes/60);
}
export const clampMinutes=(minutes:number)=>Number.isFinite(minutes)?Math.min(crossCheck.maxMinutes,Math.max(crossCheck.minMinutes,Math.round(minutes/crossCheck.stepMinutes)*crossCheck.stepMinutes)):crossCheck.defaultMinutes;
export const isComplete=(reading:string)=>reading.length>0&&!reading.includes('?');

/** A reading with unresolved characters cannot be matched; otherwise the interval decides. */
export function crossVerdict(reading:string,minutes:number,config:{distanceKm:number;limitKmh:number}=crossCheck){
 const speed=requiredSpeed(config.distanceKm,clampMinutes(minutes));
 const verdict:Verdict=!isComplete(reading)?'incomplete':speed>config.limitKmh?'clone':'possible';
 return {speed,verdict};
}
/** Clock (HH:MM, same day) of the earlier reading, `minutes` before the reading of this scene. */
export function clockBefore(minutes:number,at:number=crossCheck.readingAt){
 const total=((at-minutes)%1440+1440)%1440;
 return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
