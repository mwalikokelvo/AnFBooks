/* KOReader progress sync requests, made for the library page. Only to the https server the owner
   entered; sends the account name, KOReader's MD5 key and one book's position. No cookies, no redirects. */
'use strict';
const HEX32=/^[a-f0-9]{32}$/,LIMIT=64*1024,TIMEOUT=15000;
function server(value){
 try{const u=new URL(String(value||'').trim());if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.href.length>500)return null;return u.href.replace(/\/+$/,'');}catch{return null;}
}
const text=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\u0000-\u001f]/.test(value);
// Turns the page's request into {url, method, headers, body}; throws a plain message when it is not valid.
function build(value){
 const base=server(value?.server);
 if(!base)throw new Error('Enter the server\'s https address.');
 if(!text(value.user,100)||!HEX32.test(value.key||''))throw new Error('Enter the username and password of your sync account.');
 const headers={'Accept':'application/vnd.koreader.v1+json','x-auth-user':value.user,'x-auth-key':value.key};
 if(value.action==='auth')return {url:base+'/users/auth',method:'GET',headers};
 if(!HEX32.test(value.document||''))throw new Error('Invalid book ID.');
 if(value.action==='get')return {url:base+'/syncs/progress/'+value.document,method:'GET',headers};
 if(value.action!=='put')throw new Error('Invalid sync request.');
 const percentage=Number(value.percentage);
 if(!text(value.progress,200)||!Number.isFinite(percentage)||percentage<0||percentage>1||!text(value.device,100)||!/^[A-Za-z0-9-]{1,64}$/.test(value.device_id||''))throw new Error('Invalid reading position.');
 return {url:base+'/syncs/progress',method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({document:value.document,progress:value.progress,percentage,device:value.device,device_id:value.device_id})};
}
const MESSAGES={401:'The sync server did not accept this username and password.',403:'The sync server did not accept this username and password.'};
async function request(value,fetcher=fetch){
 let call;try{call=build(value);}catch(e){return {error:e.message};}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),TIMEOUT);
 try{
  const response=await fetcher(call.url,{method:call.method,headers:call.headers,body:call.body,redirect:'error',credentials:'omit',cache:'no-store',signal:controller.signal});
  // Read at most LIMIT bytes: a chunked reply without a length is cut off, not buffered whole.
  if(Number(response.headers?.get?.('content-length'))>LIMIT){controller.abort();return {error:'The sync server sent too much data.'};}
  const parts=[];let size=0;
  if(response.body){const reader=response.body.getReader();for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>LIMIT){controller.abort();return {error:'The sync server sent too much data.'};}parts.push(value);}}
  const reply=Buffer.concat(parts.map(p=>Buffer.from(p.buffer,p.byteOffset,p.byteLength))).toString('utf8');
  if(!response.ok)return {error:MESSAGES[response.status]||'The sync server could not save or read this position.'};
  let parsed={};try{parsed=reply?JSON.parse(reply):{};}catch{return {error:'The sync server sent something that is not KOReader sync data.'};}
  return {value:parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}};
 }catch{return {error:'Could not reach the sync server.'};}
 finally{clearTimeout(timer);}
}
module.exports={server,build,request};
