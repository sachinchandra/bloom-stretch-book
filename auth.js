/* BloomMom: sign-in (Google or email code) + per-user cloud sync via Supabase */
(function(){
  const C=window.BLOOM_CONFIG||{};
  const configured=!!(C.supabaseUrl&&C.supabaseAnonKey&&window.supabase);
  const css=`.acct{border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);border-radius:999px;padding:6px 12px 6px 6px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-weight:700;font-size:.88rem}
.acct .av{width:26px;height:26px;border-radius:50%;background:var(--plum);color:var(--surface);display:grid;place-items:center;font-family:var(--display);font-size:.85rem}
.acct .st{font-weight:400;color:var(--muted);font-size:.78rem}
.appnav-in{flex-wrap:wrap}
dialog.auth{max-width:420px!important;width:calc(100vw - 32px)!important;padding:26px 24px;border-radius:18px!important;height:fit-content!important;max-height:calc(100dvh - 32px)!important;margin:auto!important}
.auth h2{font-size:1.5rem;margin:0 0 6px}.auth p{margin:0 0 14px;color:var(--muted);font-size:.93rem}
.auth label{display:block;font-weight:700;font-size:.85rem;margin-bottom:6px}
.auth input{width:100%;font:inherit;padding:11px 12px;border:1px solid var(--line-strong);border-radius:10px;background:var(--bg);color:var(--ink);margin-bottom:10px}
.auth #aCode{letter-spacing:.4em;font-size:1.3rem;text-align:center;font-variant-numeric:tabular-nums}
.auth .btn{width:100%;padding:11px 14px;font-weight:700;display:flex;justify-content:center;align-items:center;gap:10px}
.auth .gbtn{background:var(--surface);border:1px solid var(--line-strong)}
.auth .or{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.8rem;margin:16px 0}
.auth .or::before,.auth .or::after{content:"";flex:1;height:1px;background:var(--line)}
.auth .linkbtn{background:none;border:0;color:var(--teal);cursor:pointer;padding:8px 0;font-weight:700}
.auth .amsg{min-height:1.3em;margin:10px 0 0;font-size:.88rem}.auth .amsg.err{color:var(--crit)}
.auth .x{position:absolute;top:12px;right:12px}
.auth .who{background:var(--bg);border-radius:12px;padding:12px 14px;margin-bottom:14px}
.auth .who b{display:block;color:var(--ink);word-break:break-all}
.auth .danger{background:none;border:1px solid var(--crit);color:var(--crit)}
.auth .stack{display:flex;flex-direction:column;gap:8px}
.auth .delbox{border:1px solid var(--crit);border-radius:12px;padding:12px 14px;margin-top:6px}.auth .delbox b{color:var(--crit)}.auth .delbox p{margin:6px 0 10px}
.auth .danger.solid{background:var(--crit);color:#fff}.auth .danger.solid:disabled{opacity:.45}
@media (max-width:520px){.acct>span:last-child{display:none}.acct{padding:4px}}
.gate{display:none}
.gated .appnav,.gated .wrap{display:none!important}
.gated dialog.auth::backdrop{background:var(--bg)}
.gated dialog.auth{margin-top:110px!important;box-shadow:0 20px 50px -24px rgba(40,20,40,.4)}
.gated .gate{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:12px;min-height:100dvh;padding:28px 20px;background:var(--bg)}
.gate-brand{font-family:var(--display);font-weight:800;font-size:1.5rem;color:var(--plum);text-decoration:none;display:flex;gap:10px;align-items:center}
.gate-brand img{width:34px;height:34px;border-radius:9px}
.gate p{color:var(--muted);margin:0}
.gate-home{display:none;text-align:center;margin:14px 0 0!important;font-size:.88rem}.gate-home a{color:var(--muted)}
.gated .gate-home{display:block}
.gate a.home{color:var(--muted);font-size:.9rem}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  if(configured)document.documentElement.classList.add('gated');
  const gate=document.createElement('div');gate.className='gate';
  gate.innerHTML='<a class="gate-brand" href="/"><img src="/icon-192.png" alt="">BloomMom</a><p id="gateMsg">Loading…</p><a class="home" href="/">← Back to home</a>';
  document.body.prepend(gate);
  const nav=document.querySelector('.appnav-in');
  const btn=document.createElement('button');btn.className='acct';btn.type='button';
  btn.innerHTML='<span class="av">↗</span><span>Sign in <span class="st">to sync</span></span>';
  nav.appendChild(btn);
  if(!configured){btn.hidden=true;return}
  let gated=true;

  const G='<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  const dlg=document.createElement('dialog');dlg.className='auth';dlg.setAttribute('aria-labelledby','aTitle');
  dlg.innerHTML=`<button class="x" id="aClose" aria-label="Close">✕</button>
  <div id="aOut"><h2 id="aTitle">Sign in to BloomMom</h2><p>Your stretch plan, baby's details and checklists are saved to your account and stay in sync on every phone you use.</p>
   <button class="btn gbtn" id="aGoogle" type="button">${G}Continue with Google</button>
   <div class="or" id="aOr">or use your email</div>
   <div id="aStepEmail"><label for="aEmail">Email</label><input id="aEmail" type="email" autocomplete="email" placeholder="you@example.com"><button class="btn pri" id="aSend" type="button">Email me a code</button></div>
   <div id="aStepCode" hidden><p style="margin:0 0 10px">We emailed <b id="aSentTo"></b>. Type the 6-digit code from that email below, or tap the link in the email on this phone. Can't find it? Check your spam or promotions folder.</p><label for="aCode">6-digit code</label><input id="aCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"><button class="btn pri" id="aVerify" type="button">Verify and sign in</button><button class="linkbtn" id="aBack" type="button">Use a different email</button></div></div>
  <div id="aIn" hidden><h2>Your account</h2><div class="who"><span>Signed in as</span><b id="aWho"></b><span id="aSync"></span></div>
   <div class="stack"><button class="btn" id="aOutBtn" type="button">Sign out</button><button class="btn danger" id="aDel" type="button">Delete my account</button>
   <div id="aDelConfirm" hidden class="delbox"><b>Delete your account for good?</b><p>This permanently deletes your BloomMom account and everything saved in it: your plan, ticks, readings, baby's details and checklists. It can't be undone.</p><label for="aDelType">Type DELETE to confirm</label><input id="aDelType" autocomplete="off" autocapitalize="characters" placeholder="DELETE"><button class="btn danger solid" id="aDelYes" type="button" disabled>Permanently delete my account</button><button class="linkbtn" id="aDelNo" type="button">Keep my account</button></div></div></div>
  <p class="amsg" id="aMsg" role="status"></p><p class="gate-home"><a href="/">← Back to the BloomMom home page</a></p>`;
  document.body.appendChild(dlg);
  const $=id=>document.getElementById(id);
  const msg=(t,err)=>{$('aMsg').textContent=t||'';$('aMsg').className='amsg'+(err?' err':'')};

  const sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
  let user=null,ready=false,timer=null,syncText='',pulledFor=null;
  /* local app data belongs to one account: clear it on sign-out, and when a different account signs in on this phone */
  const OWNER='bloom-owner';
  function wipeLocal(){try{Object.keys(localStorage).filter(k=>k.startsWith('bloom-')).forEach(k=>localStorage.removeItem(k))}catch(e){}try{indexedDB.deleteDatabase('bloom-bump')}catch(e){}}
  function markReady(){window.bloomReady=true;document.dispatchEvent(new Event('bloom-ready'))}

  function setSync(t){syncText=t;paint()}
  function paint(){
    if(user){const name=(user.user_metadata&&(user.user_metadata.full_name||user.user_metadata.name))||user.email||'You';
      btn.innerHTML=`<span class="av">${(name[0]||'U').toUpperCase()}</span><span>${name.split(' ')[0].split('@')[0]} <span class="st">${syncText||''}</span></span>`;
      $('aWho').textContent=user.email||name;$('aSync').textContent=syncText==='Synced'?'All changes saved to your account.':syncText;
      $('aOut').hidden=true;$('aIn').hidden=false}
    else{btn.innerHTML='<span class="av">↗</span><span>Sign in <span class="st">to sync</span></span>';$('aOut').hidden=false;$('aIn').hidden=true}
  }
  const unionMap=(a,b)=>Object.assign({},a||{},b||{});
  const unionLog=(a,b)=>{const o={...(a||{})};for(const k in (b||{}))o[k]=[...new Set([...(o[k]||[]),...b[k]])];return o};
  async function push(){
    if(!user)return;setSync('Saving…');
    const s=window.bloomState();
    const {error}=await sb.from('user_state').upsert({user_id:user.id,baby:s.baby,mom:s.mom,updated_at:new Date().toISOString()});
    setSync(error?'Not saved: offline?':'Synced');
  }
  async function pull(){
    if(!user)return;setSync('Loading…');ready=false;
    let owner=null;try{owner=localStorage.getItem(OWNER)}catch(e){}
    if(owner&&owner!==user.id){wipeLocal();try{localStorage.setItem(OWNER,user.id)}catch(e){}location.reload();return}
    try{localStorage.setItem(OWNER,user.id)}catch(e){}
    const {data,error}=await sb.from('user_state').select('baby,mom').eq('user_id',user.id).maybeSingle();
    if(error){setSync('Sync unavailable');ready=true;markReady();return}
    const local=window.bloomState();let key='bloom-synced-'+user.id,first=true;try{first=!localStorage.getItem(key)}catch(e){}
    let merged=local;
    if(data){const rb=data.baby||{},rm=data.mom||{};
      merged=first?{baby:{...local.baby,...rb,dob:rb.dob||local.baby.dob||'',done:unionMap(rb.done,local.baby.done),ec:{...(local.baby.ec||{}),...(rb.ec||{})},shop:unionMap(rb.shop,local.baby.shop)},mom:{...local.mom,...rm,log:unionLog(rm.log,local.mom.log),tasks:(rm.tasks&&rm.tasks.length?rm.tasks:local.mom.tasks),plan:(rm.plan&&Object.keys(rm.plan).length?rm.plan:local.mom.plan)}}
                  :{baby:{dob:'',done:{},ec:{},shop:{},...rb},mom:{log:{},plan:{},tasks:[],daily:{},...rm}};
      window.bloomApply(merged)}
    try{localStorage.setItem(key,'1')}catch(e){}
    ready=true;markReady();
    if(!data||first)await push();else setSync('Synced');
  }
  window.bloomOnSave=()=>{if(!user||!ready)return;clearTimeout(timer);setSync('Saving…');timer=setTimeout(push,700)};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user&&ready&&!timer)pull()});
  function lock(){gated=true;document.documentElement.classList.add('gated');$('aClose').hidden=true;$('gateMsg').textContent='Please sign in to continue.';if(!dlg.open){msg('');dlg.showModal()}}
  function unlock(){const was=gated;gated=false;document.documentElement.classList.remove('gated');$('aClose').hidden=false;if(was&&dlg.open)dlg.close()}
  dlg.addEventListener('cancel',e=>{if(gated)e.preventDefault()});
  sb.auth.onAuthStateChange((ev,session)=>{
    user=session?session.user:null;paint();
    if(user)unlock();else lock();
    if(user&&pulledFor!==user.id){pulledFor=user.id;setTimeout(pull,0);if(dlg.open&&ev==='SIGNED_IN')dlg.close()}
    if(!user){pulledFor=null;ready=false}
  });
  const _push=push;push=async()=>{timer=null;return _push()};

  fetch(C.supabaseUrl+'/auth/v1/settings',{headers:{apikey:C.supabaseAnonKey}}).then(r=>r.json()).then(st=>{if(!(st.external&&st.external.google)){$('aGoogle').hidden=true;$('aOr').hidden=true}}).catch(()=>{});
  btn.onclick=()=>{msg('');$('aDelConfirm').hidden=true;$('aDel').hidden=false;dlg.showModal()};
  window.bloomAccount=()=>btn.click();
  $('aClose').onclick=()=>dlg.close();
  dlg.addEventListener('click',e=>{if(e.target===dlg&&!gated)dlg.close()});
  $('aGoogle').onclick=async()=>{msg('Opening Google…');const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/app/'}});if(error)msg(error.message,true)};
  let sentTo='';
  $('aSend').onclick=async()=>{const email=$('aEmail').value.trim();if(!/^\S+@\S+\.\S+$/.test(email))return msg('Enter a valid email address.',true);
    $('aSend').disabled=true;msg('Sending code…');const {error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true}});$('aSend').disabled=false;
    if(error)return msg(error.status===429?'Too many requests. Wait a minute and try again.':error.message,true);
    sentTo=email;$('aSentTo').textContent=email;$('aStepEmail').hidden=true;$('aStepCode').hidden=false;msg('Check your inbox and spam folder.');$('aCode').focus()};
  $('aVerify').onclick=async()=>{const token=$('aCode').value.replace(/\D/g,'');if(token.length<6)return msg('Enter the 6-digit code from the email.',true);
    $('aVerify').disabled=true;msg('Checking…');const {error}=await sb.auth.verifyOtp({email:sentTo,token,type:'email'});$('aVerify').disabled=false;
    if(error)return msg('That code didn\'t work. Check it, or request a new one.',true);msg('')};
  $('aCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('aVerify').click()});
  $('aEmail').addEventListener('keydown',e=>{if(e.key==='Enter')$('aSend').click()});
  $('aBack').onclick=()=>{$('aStepEmail').hidden=false;$('aStepCode').hidden=true;msg('')};
  $('aOutBtn').onclick=async()=>{clearTimeout(timer);if(timer)await _push();await sb.auth.signOut();wipeLocal();location.replace('/app/')};
  $('aDel').onclick=()=>{$('aDelConfirm').hidden=false;$('aDel').hidden=true;$('aDelType').value='';$('aDelYes').disabled=true;$('aDelType').focus()};
  $('aDelNo').onclick=()=>{$('aDelConfirm').hidden=true;$('aDel').hidden=false;msg('')};
  $('aDelType').oninput=()=>{$('aDelYes').disabled=$('aDelType').value.trim().toUpperCase()!=='DELETE'};
  $('aDelYes').onclick=async()=>{$('aDelYes').disabled=true;msg('Deleting your account…');clearTimeout(timer);ready=false;
    const {error}=await sb.rpc('delete_my_account');if(error){$('aDelYes').disabled=false;return msg('Could not delete your account. Check your connection and try again.',true)}
    try{await sb.auth.signOut({scope:'local'})}catch(e){}wipeLocal();location.replace('/?deleted=1')};
})();
