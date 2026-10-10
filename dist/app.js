document.getElementById('year').textContent=new Date().getFullYear();
const modal=document.getElementById('lightbox');
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const img=modal.querySelector('img');img.src=button.dataset.photo;img.alt=button.dataset.caption;modal.querySelector('p').textContent=button.dataset.caption;modal.showModal();}));
modal.querySelector('.close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
