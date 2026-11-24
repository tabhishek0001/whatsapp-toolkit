(() => {
'use strict';
const $=s=>document.querySelector(s);
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove('show'),1800)};
const esc=s=>String(s??'').trim();
function waUrl(){const phone=esc($('#phone').value).replace(/[+\s()-]/g,'');const msg=esc($('#message').value);if(!/^\d{6,15}$/.test(phone)){return ''}return 'https://wa.me/'+phone+(msg?'?text='+encodeURIComponent(msg):'')}
function refreshWa(){const u=waUrl();$('#waLink').value=u;$('#openChat').href=u||'#';$('#openChat').classList.toggle('disabled',!u)}
['phone','message'].forEach(id=>$('#'+id).addEventListener('input',refreshWa));
async function copy(v,label){if(!v)return toast('Nothing to copy');try{await navigator.clipboard.writeText(v);toast(label+' copied')}catch{toast('Copy failed — select and copy manually')}}
$('#copyLink').onclick=()=>copy($('#waLink').value,'Link');
$('#downloadLink').onclick=()=>{const v=$('#waLink').value;if(!v)return toast('Generate a link first');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([v],{type:'text/plain'}));a.download='whatsapp-link.txt';a.click();URL.revokeObjectURL(a.href)};
const templates={sales:()=>`${esc($('#greeting').value)||'Hello'}${esc($('#customer').value)?' '+esc($('#customer').value):''}! I'm reaching out from ${esc($('#businessName').value)||'our business'} regarding ${esc($('#offer').value)||'our latest offer'}. Would you like to know more?`,support:()=>`${esc($('#greeting').value)||'Hello'}${esc($('#customer').value)?' '+esc($('#customer').value):''}! Thank you for contacting ${esc($('#businessName').value)||'us'}. Please share your order/reference number and the issue you need help with.`,followup:()=>`${esc($('#greeting').value)||'Hello'}${esc($('#customer').value)?' '+esc($('#customer').value):''}! Just following up regarding ${esc($('#offer').value)||'our earlier conversation'}. Please let me know if you have any questions.`,custom:()=>$('#builderMessage').value};
function build(){if($('#template').value!=='custom')$('#builderMessage').value=templates[$('#template').value]()}
['greeting','customer','businessName','offer','template'].forEach(id=>$('#'+id).addEventListener('input',build));$('#template').addEventListener('change',build);build();
$('#copyMessage').onclick=()=>copy($('#builderMessage').value,'Message');
$('#useMessage').onclick=()=>{$('#message').value=$('#builderMessage').value;refreshWa();location.hash='tools';toast('Message added to link builder')};
function campaign(){const base=esc($('#campaignUrl').value);if(!base){$('#campaignResult').value='';return}try{const u=new URL(base);if(!['http:','https:'].includes(u.protocol))throw new Error('Unsupported protocol');[['utm_source',$('#utmSource').value],['utm_medium',$('#utmMedium').value],['utm_campaign',$('#utmCampaign').value]].forEach(([k,v])=>{if(esc(v))u.searchParams.set(k,esc(v))});$('#campaignResult').value=u.toString()}catch{$('#campaignResult').value='Invalid URL'}}
['campaignUrl','utmSource','utmMedium','utmCampaign'].forEach(id=>$('#'+id).addEventListener('input',campaign));
$('#copyCampaign').onclick=()=>copy($('#campaignResult').value,'Campaign URL');$('#clearCampaign').onclick=()=>{['campaignUrl','utmCampaign','campaignResult'].forEach(id=>$('#'+id).value='');campaign()};
let qrCanvas=null;
function qr(){
  const v=esc($('#qrInput').value);
  const box=$('#qrCode');
  box.innerHTML='';
  qrCanvas=null;
  if(!v){box.className='qr-placeholder';box.textContent='Enter content to generate QR';$('#downloadQr').disabled=true;return}
  if(typeof QRCode==='undefined'){box.className='qr-placeholder';box.textContent='QR library could not be loaded.';$('#downloadQr').disabled=true;return}
  new QRCode(box,{text:v,width:220,height:220,colorDark:'#111111',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
  const img=box.querySelector('img'), canvas=box.querySelector('canvas');
  if(canvas)qrCanvas=canvas;
  else if(img){
    const c=document.createElement('canvas'),ctx=c.getContext('2d');
    c.width=220;c.height=220;const draw=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,220,220);ctx.drawImage(img,0,0,220,220);qrCanvas=c};
    if(img.complete)draw();else img.onload=draw;
  }
  box.className='';
  $('#downloadQr').disabled=false;
}
$('#qrInput').addEventListener('input',qr);
$('#downloadQr').onclick=()=>{if(!qrCanvas)return;const a=document.createElement('a');a.href=qrCanvas.toDataURL('image/png');a.download='whatsapp-qr.png';a.click()};
$('#copyQrSource').onclick=()=>copy($('#qrInput').value,'Content');
$('#checkLink').onclick=()=>{const v=esc($('#checkInput').value);const e=$('#checkResult');try{const u=new URL(v);const ok=(['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(u.hostname));e.className='status '+(ok?'good':'bad');e.textContent=ok?'Valid WhatsApp-compatible URL. Phone/message parameters can be inspected in the address.':'This does not look like a WhatsApp URL.'}catch{e.className='status bad';e.textContent='Invalid URL.'}};
$('#sharePage').onclick=async()=>{const data={title:'WhatsApp Toolkit',text:'Build WhatsApp links and marketing URLs with this free browser-based toolkit.',url:location.href};if(navigator.share){try{await navigator.share(data)}catch{}}else copy(location.href,'Toolkit URL')};
refreshWa();
})();