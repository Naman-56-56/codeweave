// Anime.js CDN loader (if not already loaded)
if (typeof anime === 'undefined') {
  const animeScript = document.createElement('script');
  animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
  animeScript.async = false;
  document.head.appendChild(animeScript);
}
