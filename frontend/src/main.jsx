import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = import.meta.env.VITE_API_URL || '/api';
const fallback = [
  { id: 'prd_aurora', name: 'Aurora Headphones', price: 129.99, category: 'Audio', image: '🎧' },
  { id: 'prd_orbit', name: 'Orbit Smart Lamp', price: 74.5, category: 'Home', image: '💡' },
  { id: 'prd_slate', name: 'Slate Keyboard', price: 99, category: 'Workspace', image: '⌨️' },
  { id: 'prd_flux', name: 'Flux Bottle', price: 32, category: 'Lifestyle', image: '🧴' }
];

function App() {
  const [products, setProducts] = useState(fallback);
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState('');
  useEffect(() => { fetch(`${api}/products`).then(r => r.ok ? r.json() : []).then(p => p.length && setProducts(p)).catch(() => {}); }, []);
  const total = useMemo(() => cart.reduce((n, item) => n + item.price * item.quantity, 0), [cart]);
  function add(product) { setCart(current => { const found = current.find(x => x.id === product.id); return found ? current.map(x => x.id === product.id ? { ...x, quantity: x.quantity + 1 } : x) : [...current, { ...product, quantity: 1 }]; }); }
  async function checkout() {
    if (!cart.length) return;
    try { const order = await fetch(`${api}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'usr_demo', items: cart }) }).then(r => r.json()); await fetch(`${api}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id, amount: total }) }); setCart([]); setNotice(`Order ${order.id} confirmed — payment succeeded.`); } catch { setNotice('Services are unavailable. Start Docker Compose and try again.'); }
  }
  return <main><nav><strong>◈ smart<span>commerce</span></strong><span className="cart">Cart · {cart.reduce((n, i) => n + i.quantity, 0)}</span></nav><section className="hero"><p>CURATED TECH FOR DAILY LIFE</p><h1>Small upgrades.<br/><em>Big momentum.</em></h1><span>Thoughtful objects that make the everyday feel better.</span></section><section className="content"><div><h2>Featured essentials</h2><div className="grid">{products.map(product => <article key={product.id}><div className="emoji">{product.image}</div><small>{product.category}</small><h3>{product.name}</h3><p>${product.price.toFixed(2)}</p><button onClick={() => add(product)}>Add to cart</button></article>)}</div></div><aside><h2>Your cart</h2>{cart.length ? cart.map(item => <p className="line" key={item.id}>{item.name} <b>×{item.quantity}</b></p>) : <p className="muted">Nothing here yet.</p>}<div className="total"><span>Total</span><b>${total.toFixed(2)}</b></div><button className="checkout" disabled={!cart.length} onClick={checkout}>Checkout</button>{notice && <p className="notice">{notice}</p>}</aside></section></main>;
}
createRoot(document.getElementById('root')).render(<App />);
