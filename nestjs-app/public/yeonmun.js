(() => {
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let pending=[...document.querySelectorAll('[data-reveal]')],scheduled=false;
function reveal(){scheduled=false;pending=pending.filter(el=>{const rect=el.getBoundingClientRect();if(reduce.matches || (rect.top<innerHeight*.95 && rect.bottom>0)){el.classList.add('is-visible');return false;}return true;});}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(reveal);}}
if(!reduce.matches) document.documentElement.classList.add('motion-ready');
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',schedule);addEventListener('pageshow',schedule);reveal();
const button=document.querySelector('.slider-toggle');
button.addEventListener('click',()=>{const paused=document.querySelector('.showcase').classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'슬라이드 재생':'슬라이드 일시정지';});
})();
