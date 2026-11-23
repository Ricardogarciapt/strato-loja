/* Exporta a peça configurada (cor, nome, logótipo, medida) para GLB, em metros, para a realidade aumentada. */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { getStrato3D } from './strato3d';

export type OpcoesPeca = { texto?: string; logo?: HTMLImageElement | null; espessura?: number; largura?: number };

export async function glbDaPeca(id: string, corId: string, opts: OpcoesPeca): Promise<Blob> {
  const S = getStrato3D();
  const obj: THREE.Object3D = S.build(id, corId, opts);
  const root = new THREE.Group(); root.add(obj); root.scale.setScalar(0.01); // cm → m
  root.updateMatrixWorld(true);
  const exp = new GLTFExporter();
  const buf = await new Promise<ArrayBuffer>((res, rej) =>
    exp.parse(root, (r) => res(r as ArrayBuffer), (e) => rej(e), { binary: true, onlyVisible: true }),
  );
  return new Blob([buf], { type: 'model/gltf-binary' });
}
