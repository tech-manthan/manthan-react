import './style.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { demos } from './registry';

const slug = new URLSearchParams(location.search).get('c');
const Demo = slug ? demos[slug] : undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>{Demo ? <Demo /> : <p>Demo not found for &quot;{slug}&quot;.</p>}</StrictMode>,
);
