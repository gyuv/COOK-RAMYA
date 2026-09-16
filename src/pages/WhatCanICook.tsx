import { useState } from 'react';
import { Link } from 'react-router-dom';
import { whatCanICook, type CookMatch } from '../lib/recommend';
import { useStore } from '../store/useStore';
import { FoodArt } from '../components/FoodArt';
import { EmptyState, SectionHead, ProgressBar } from '../components/ui';
import { useSeo } from '../hooks/useSeo';
import { formatMinutes } from '../hooks/useTick';

const COMMON = ['onion', 'tomato', 'potato', 'rice', 'egg', 'green chilli', 'coconut', 'curd', 'toor dal', 'urad dal', 'coriander', 'curry leaves', 'chicken', 'paneer'];

export default function WhatCanICook() {
  useSeo('What can I cook?', 'Tell RAMYA-COOK what ingredients you have and find matching Indian recipes.');
  const pantry = useStore((s) => s.pantry);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<CookMatch[] | null>(null);

  const add = (v: string) => { const t = v.trim().toLowerCase(); if (t && !items.includes(t)) setItems((x) => [...x, t]); setInput(''); };
  const run = (list = items) => setResults(whatCanICook(list));

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 820 }}>
      <span className="eyebrow">Cook with what you have</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>What can I cook?</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Add the ingredients you have — we'll find recipes you can (almost) make.</p>

      <div className="card card-pad">
        <div className="row gap8">
          <input className="input" placeholder="e.g. tomato, onion, rice, egg…" value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(input); }} />
          <button className="btn btn-primary" onClick={() => add(input)}>Add</button>
        </div>
        {pantry.length > 0 && <button className="chip" style={{ marginTop: 10 }} onClick={() => { const p = pantry.map((x) => x.name.toLowerCase()); setItems(p); run(p); }}>Use my pantry ({pantry.length})</button>}
        <div className="eyebrow" style={{ margin: '14px 0 6px' }}>Common ingredients</div>
        <div className="row wrap gap6">{COMMON.map((c) => <button key={c} className={`chip ${items.includes(c) ? 'active' : ''}`} onClick={() => (items.includes(c) ? setItems(items.filter((x) => x !== c)) : add(c))}>{c}</button>)}</div>

        {items.length > 0 && (
          <>
            <div className="eyebrow" style={{ margin: '14px 0 6px' }}>You have ({items.length})</div>
            <div className="row wrap gap6">{items.map((it) => <button key={it} className="chip active" onClick={() => setItems(items.filter((x) => x !== it))}>{it} ✕</button>)}</div>
            <button className="btn btn-primary btn-block mt16" onClick={() => run()}>Find recipes →</button>
          </>
        )}
      </div>

      {results && (
        results.length === 0 ? (
          <div style={{ marginTop: 20 }}><EmptyState emoji="🧺" title="No close matches yet" body="Add a few more ingredients — even staples like rice, onion or dal open up lots of recipes." /></div>
        ) : (
          <section className="section">
            <SectionHead title={`${results.length} recipes you can make`} />
            <div className="grid grid-auto-lg">
              {results.map(({ recipe, have, missing, matchPct }) => (
                <Link key={recipe.id} to={`/recipes/${recipe.slug}`} className="recipe-card">
                  <div className="thumb" style={{ aspectRatio: '16 / 9' }}><FoodArt art={recipe.art} seed={recipe.id} /></div>
                  <div className="rc-body">
                    <div className="rc-title" style={{ fontSize: '1rem' }}>{recipe.name}</div>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>{recipe.state} · ⏱ {formatMinutes(recipe.prepMin + recipe.cookMin)}</div>
                    <div style={{ margin: '6px 0 4px' }}><ProgressBar value={matchPct} max={100} /></div>
                    <div className="row between" style={{ fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--green)' }}>Have {have.length}</span>
                      {missing.length > 0 ? <span className="muted">Need {missing.length} more</span> : <span style={{ color: 'var(--green)' }}>You have it all!</span>}
                    </div>
                    {missing.length > 0 && <div className="muted" style={{ fontSize: '0.76rem', marginTop: 4 }}>Missing: {missing.slice(0, 3).join(', ')}{missing.length > 3 ? '…' : ''}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}
