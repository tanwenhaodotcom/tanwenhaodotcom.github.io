'use strict';
(()=>{
  const article=document.getElementById('post-content');
  if(!article)return;
  const mobileTOC=document.querySelector('.mobile-toc');
  mobileTOC?.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    let heading;
    try{heading=document.getElementById(decodeURIComponent(link.hash.slice(1)))}catch(e){}
    if(!heading)return;
    event.preventDefault();
    mobileTOC.open=false;
    heading.setAttribute('tabindex','-1');
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
    // Preserve the normal anchor URL and back-button behavior.
    if(location.hash!==link.hash)history.pushState(null,'',link.hash);
  });

  function codeText(block){
    const code=block.querySelector('.code pre') || block.querySelector('pre') || block;
    const lines=code.querySelectorAll('.line');
    if(lines.length)return [...lines].map(line=>line.textContent).join('\n');
    const clone=code.cloneNode(true);
    clone.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
    return clone.textContent;
  }
  async function copy(text){
    if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return}catch(e){}}
    const field=document.createElement('textarea'),focused=document.activeElement;
    const selection=window.getSelection(),ranges=selection?[...Array(selection.rangeCount)].map((_,i)=>selection.getRangeAt(i).cloneRange()):[];
    field.value=text;field.className='copy-field';field.readOnly=true;
    document.body.append(field);field.select();field.setSelectionRange(0,text.length);
    try{if(!document.execCommand?.('copy'))throw Error('Copy unavailable')}
    finally{field.remove();focused?.focus({preventScroll:true});if(selection){selection.removeAllRanges();ranges.forEach(range=>selection.addRange(range))}}
  }
  article.querySelectorAll('figure.highlight,pre').forEach(block=>{
    if(block.tagName==='PRE' && block.closest('figure.highlight'))return;
    const wrapper=document.createElement('div'),toolbar=document.createElement('div'),button=document.createElement('button'),status=document.createElement('span');
    wrapper.className='code-block';toolbar.className='code-toolbar';
    button.type='button';button.className='copy-code';button.textContent='复制代码';
    status.className='copy-status';status.setAttribute('role','status');
    block.before(wrapper);wrapper.append(toolbar,block);toolbar.append(status,button);
    const scroll=block;
    scroll.tabIndex=0;scroll.setAttribute('aria-label','代码，可横向滚动');
    let timer,copying=false;
    button.addEventListener('click',async()=>{
      if(copying)return;
      copying=true;button.setAttribute('aria-busy','true');clearTimeout(timer);
      try{await copy(codeText(block));status.textContent='已复制'}
      catch(e){status.textContent='复制失败，请手动选择代码'}
      finally{copying=false;button.removeAttribute('aria-busy');timer=setTimeout(()=>{status.textContent=''},2500)}
    });
  });

  if(article.dataset.lightbox!=='true' || typeof HTMLDialogElement==='undefined' || !HTMLDialogElement.prototype.showModal)return;
  let dialog,preview,caption,source;
  function open(image){
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='image-lightbox';dialog.setAttribute('aria-label','图片预览');
      const close=document.createElement('button');close.type='button';close.className='lightbox-close';close.textContent='关闭';close.setAttribute('aria-label','关闭图片预览');
      preview=document.createElement('img');caption=document.createElement('p');
      dialog.append(close,preview,caption);document.body.append(dialog);
      close.addEventListener('click',()=>dialog.close());
      // The close button is the only focusable control in this modal.
      dialog.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();close.focus()}});
      dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
      dialog.addEventListener('close',()=>{document.documentElement.classList.remove('lightbox-open');source?.focus({preventScroll:true});preview.removeAttribute('src')});
    }
    source=image;preview.src=image.currentSrc || image.src;preview.alt=image.alt;
    caption.textContent=image.alt;caption.hidden=!image.alt;
    dialog.showModal();document.documentElement.classList.add('lightbox-open');
  }
  article.querySelectorAll('img').forEach(image=>{
    // Existing image links retain their original destination and keyboard behavior.
    if(image.closest('a,button,picture[data-no-lightbox]') || image.hasAttribute('data-no-lightbox'))return;
    image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-haspopup','dialog');
    image.setAttribute('aria-label','放大图片'+(image.alt?'：'+image.alt:''));
    image.classList.add('lightbox-image');
    image.addEventListener('click',()=>open(image));
    image.addEventListener('keydown',event=>{if(event.key==='Enter' || event.key===' '){event.preventDefault();open(image)}});
  });
})();
