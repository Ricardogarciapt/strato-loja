'use client';
/* Carrinho: estado no browser (localStorage), aberto/fechado, avisos curtos. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { chaveLinha, subtotal, type Linha } from './catalog';

type Ctx = {
  linhas: Linha[]; n: number; sub: number; aberto: boolean;
  add: (l: Omit<Linha, 'key'>) => void; remover: (key: string) => void; limpar: () => void;
  abrir: () => void; fechar: () => void; aviso: (msg: string) => void; avisoMsg: string | null;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = 'strato_cart_v3';

function ler(): Linha[] {
  try { const v = localStorage.getItem(KEY); return v ? (JSON.parse(v) as Linha[]) : []; } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [aberto, setAberto] = useState(false);
  const [avisoMsg, setAviso] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => { setLinhas(ler()); setPronto(true); }, []);
  useEffect(() => { if (pronto) try { localStorage.setItem(KEY, JSON.stringify(linhas)); } catch { /* sem armazenamento */ } }, [linhas, pronto]);

  const add = useCallback((l: Omit<Linha, 'key'>) => {
    const { q, ...rest } = l; const key = chaveLinha(rest);
    setLinhas((ls) => {
      const ex = ls.find((x) => x.key === key);
      return ex ? ls.map((x) => (x.key === key ? { ...x, q: Math.min(50, x.q + q) } : x)) : [...ls, { ...rest, q, key }];
    });
  }, []);
  const remover = useCallback((key: string) => setLinhas((ls) => ls.filter((x) => x.key !== key)), []);
  const limpar = useCallback(() => setLinhas([]), []);
  const aviso = useCallback((msg: string) => { setAviso(msg); window.setTimeout(() => setAviso(null), 2200); }, []);

  const v = useMemo<Ctx>(() => ({
    linhas, n: linhas.reduce((s, l) => s + l.q, 0), sub: subtotal(linhas), aberto,
    add, remover, limpar, abrir: () => setAberto(true), fechar: () => setAberto(false), aviso, avisoMsg,
  }), [linhas, aberto, add, remover, limpar, aviso, avisoMsg]);
  return <CartCtx.Provider value={v}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx); if (!c) throw new Error('useCart fora do CartProvider'); return c;
}
