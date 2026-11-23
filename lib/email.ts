/* Aviso por email ao atelier (Resend). Sem chave, regista só no log do servidor. */
export async function avisarAtelier(assunto: string, texto: string) {
  const key = process.env.RESEND_API_KEY; const to = process.env.ATELIER_EMAIL;
  if (!key || !to) { console.log(`[strato] ${assunto}\n${texto}`); return false; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'STRATO <loja@resend.dev>', to: [to], subject: assunto, text: texto }),
  });
  return r.ok;
}
