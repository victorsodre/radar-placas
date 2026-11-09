import * as T from 'three';
import { fit } from './camera.ts';
import type { ReadingCard } from './types.ts';

type Box = { x: number; y: number; width: number; height: number };

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) { ctx.fillText(line, x, y); y += lineHeight; line = word; }
    else line = next;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

/** Crop, characters and context: the part of the experiment worth sharing. */
function drawReading(ctx: CanvasRenderingContext2D, card: ReadingCard, area: Box) {
  const pad = 36, inner = area.width - pad * 2;
  ctx.fillStyle = '#12152b'; ctx.strokeStyle = '#272c4c'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(area.x, area.y, area.width, area.height, 14); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'left'; let y = area.y + pad + 14;
  ctx.fillStyle = '#a9aecb'; ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText(`LEITURA DEMONSTRATIVA · ${card.condition.toUpperCase()}`, area.x + pad, y); y += 26;
  const scale = Math.min(inner / card.crop.width, 190 / card.crop.height), w = card.crop.width * scale, h = card.crop.height * scale;
  ctx.drawImage(card.crop, area.x + pad, y, w, h); y += h + 34;
  const size = Math.min(110, inner / 5.6), step = inner / 5;
  ctx.font = `${size}px "JetBrains Mono", monospace`; ctx.textAlign = 'center';
  [...card.result].forEach((c, i) => { ctx.fillStyle = c === '?' ? '#ef7d42' : '#f1f2f8'; ctx.fillText(c, area.x + pad + step * (i + .5), y + size * .8); });
  y += size + 30; ctx.textAlign = 'left';
  ctx.fillStyle = '#d4d8e8'; ctx.font = '24px Archivo, sans-serif';
  wrap(ctx, card.note, area.x + pad, y, inner, 34);
}

function deliver(blob: Blob, name: string) {
  const download = () => {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const file = new File([blob], name, { type: 'image/png' });
  // On phones the share sheet reaches Instagram and WhatsApp directly; elsewhere the file is saved.
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file], title: 'Da placa ao clone · ovictorlab' }).catch((error: unknown) => { if ((error as Error).name !== 'AbortError') download(); });
  } else download();
}

export function saveSceneImage(renderer: T.WebGLRenderer, scene: T.Scene, camera: T.PerspectiveCamera, bounds: T.Box3, portrait = false, card?: ReadingCard) {
  const width = portrait ? 1080 : 1920, height = portrait ? 1920 : 1080;
  const heading = portrait ? 250 : 150, footer = 100, margin = 50;
  const panel: Box | null = card ? (portrait
    ? { x: margin, y: height - footer - 640, width: width - margin * 2, height: 610 }
    : { x: width - margin - 620, y: heading + 10, width: 620, height: height - heading - footer - 40 }) : null;
  const sceneWidth = panel && !portrait ? panel.x - 20 : width;
  const sceneHeight = (panel && portrait ? panel.y - 20 : height - footer) - heading;
  const size = renderer.getSize(new T.Vector2()), ratio = renderer.getPixelRatio(), aspect = camera.aspect;
  const position = camera.position.clone(), quaternion = camera.quaternion.clone();
  const direction = camera.position.clone().sub(bounds.getCenter(new T.Vector3()));
  const output = document.createElement('canvas'); output.width = width; output.height = height;
  const ctx = output.getContext('2d'); if (!ctx) throw new Error('Não foi possível preparar a imagem.');
  try {
    renderer.setPixelRatio(1); renderer.setSize(sceneWidth, sceneHeight, false);
    camera.aspect = sceneWidth / sceneHeight; fit(camera, bounds, direction);
    renderer.render(scene, camera);
    ctx.fillStyle = '#0b0d1a'; ctx.fillRect(0, 0, width, height);
    const gradient = ctx.createRadialGradient(width * .5, height * .45, 20, width * .5, height * .45, width * .7);
    gradient.addColorStop(0, '#182033'); gradient.addColorStop(1, '#0b0d1a'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.drawImage(renderer.domElement, 0, heading);
    if (card && panel) drawReading(ctx, card, panel);
    ctx.save(); ctx.translate(margin, 38); ctx.scale(.42, .42); ctx.strokeStyle = '#ffd21f'; ctx.fillStyle = '#ffd21f'; ctx.lineWidth = 14;
    ctx.stroke(new Path2D('M50 12 A38 38 0 1 0 88 50')); ctx.beginPath(); ctx.arc(50, 50, 13, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f1f2f8'; ctx.font = '34px "Archivo Black", sans-serif'; ctx.fillText('ovictorlab', 108, 72);
    ctx.font = `${portrait ? 56 : 44}px Anton, sans-serif`; ctx.fillText('DA PLACA AO CLONE', margin, portrait ? 174 : 130);
    ctx.fillStyle = '#a9aecb'; ctx.font = `${portrait ? 18 : 22}px Archivo, sans-serif`; ctx.fillText('Cena ilustrativa · Placa inventada · Leitura pré-definida', margin, height - 53);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffd21f'; ctx.fillText('ovictorlab.com', width - margin, height - 53);
    output.toBlob(blob => { if (blob) deliver(blob, `ovictorlab-placas${portrait ? '-vertical' : ''}.png`); });
  } finally {
    renderer.setPixelRatio(ratio); renderer.setSize(size.x, size.y, false);
    camera.aspect = aspect; camera.position.copy(position); camera.quaternion.copy(quaternion); camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
}
