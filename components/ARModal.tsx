'use client';
/* Realidade aumentada: gera o GLB da peça configurada e abre-o no model-viewer
   (WebXR / Scene Viewer no Android, Quick Look no iPhone com USDZ gerado na hora).
   No computador mostra também um código QR que abre a mesma configuração no telemóvel. */
import { useEffect, useState } from 'react';
import qrcode from 'qrcode-generator';
import { glbDaPeca, type OpcoesPeca } from '@/lib/three/exportar';
import type { T } from '@/lib/i18n';

type Props = { id: string; cor: string; opts: OpcoesPeca; nome: string; t: T; partilha: string; onClose: () => void };

export function ARModal({ id, cor, opts, nome, t, partilha, onClose }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [qr, setQr] = useState<string>('');

  useEffect(() => {
    let url = ''; let vivo = true;
    import('@google/model-viewer').catch(() => null);
    glbDaPeca(id, cor, opts).then((b) => { if (!vivo) return; url = URL.createObjectURL(b); setSrc(url); }).catch(() => setSrc(''));
    try { const q = qrcode(0, 'M'); q.addData(partilha); q.make(); setQr(q.createDataURL(4, 2)); } catch { /* sem QR */ }
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    return () => { vivo = false; removeEventListener('keydown', k); if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="armodal" role="dialog" aria-modal="true" aria-label={t('ar_t')} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <div className="top"><h3>{t('ar_t')} · {nome}</h3><button onClick={onClose} aria-label={t('ar_close')}>×</button></div>
        <p className="mut" style={{ margin: 0 }}>{t('ar_p')}</p>
        {src ? (
          <model-viewer src={src} alt={nome} ar="" ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
            camera-controls="" auto-rotate="" shadow-intensity="1" exposure="1" environment-image="neutral" touch-action="pan-y">
            <button slot="ar-button" className="btn gold" style={{ position: 'absolute', left: '50%', bottom: 16, transform: 'translateX(-50%)' }}>{t('ar_cta')}</button>
          </model-viewer>
        ) : <p className="note">{src === '' ? '—' : t('ar_load')}</p>}
        <p className="small mut" style={{ margin: 0 }}>{t('ar_hint')}</p>
        {qr && <div className="qr"><img src={qr} alt="QR" /><span>{t('ar_q')}</span></div>}
      </div>
    </div>
  );
}
