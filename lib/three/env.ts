/* Luz de estúdio realista: HDRI CC0 da Poly Haven (via @pmndrs/assets) como ambiente de reflexos. */
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

const cache = new Map<string, Promise<THREE.Texture | null>>();

function carregar(url: string) {
  if (!cache.has(url)) {
    cache.set(url, new Promise((res) => {
      new EXRLoader().load(url, (tex) => { tex.mapping = THREE.EquirectangularReflectionMapping; res(tex); }, undefined, () => res(null));
    }));
  }
  return cache.get(url)!;
}

/** Aplica o HDRI ao ambiente da cena (reflexos); a luz direta da cena mantém-se. */
export async function aplicarHDRI(renderer: THREE.WebGLRenderer, scene: THREE.Scene, url = '/hdri/studio.exr', intensidade = 0.55, excluir: THREE.Object3D[] = []) {
  try {
    const tex = await carregar(url); if (!tex) return false;
    const pm = new THREE.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(tex).texture; pm.dispose();
    scene.environment = env;
    scene.traverse((o) => {
      if (excluir.includes(o)) { const mm = (o as THREE.Mesh).material as THREE.MeshStandardMaterial; if (mm && 'envMapIntensity' in mm) mm.envMapIntensity = 0; return; }
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && 'envMapIntensity' in m) m.envMapIntensity = intensidade;
    });
    return true;
  } catch { return false; }
}
