// ============================================================
// ILUMIYA · 奇幻大富翁 — Modals (logic preserved, re-skinned)
// ============================================================
const {useState:_uS,useEffect:_uE,useRef:_uR} = React;

function Modal({children,onClose,maxW,bare}){
  return (
    <div className="overlay" onClick={onClose}>
      <div className={'modal '+(bare?'':'panel flourish')} style={maxW?{maxWidth:maxW}:null} onClick={e=>e.stopPropagation()}>
        {onClose && <button className="modal-close" onClick={onClose}>✕</button>}
        {children}
      </div>
    </div>
  );
}

// ---------- Property deed (buy / own) ----------
function PropertyModal({space,isOwner,prop,player,onClose,onBuy,onBuild}){
  const region=space.group?REGIONS[space.group]:null;
  const rv=region?`var(${region.v})`:'var(--gold-2)';
  const level=prop?prop.level:0;
  const art=tileArt(space);
  const rentRows=(space.rent||[]).map((r,i)=>{
    const lbl=i===0?'空地 · 基本租金':i===4?'城堡 · 滿級':`${i} 級建築`;
    return {i,lbl,r};
  });
  const buyPrice=space.price;
  const canBuy=!prop && onBuy && player.money>=buyPrice;
  const canBuild=isOwner && prop && level<4 && onBuild;
  return (
    <Modal onClose={onClose} maxW={430}>
      <div style={{borderRadius:20,overflow:'hidden'}}>
        <div style={{position:'relative',height:200,overflow:'hidden',borderBottom:'1px solid var(--gold-line)'}}>
          {region && <span style={{position:'absolute',top:0,left:0,right:0,height:6,background:rv,zIndex:2}}></span>}
          {art
            ? <img src={art} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 38%'}}/>
            : <div style={{width:'100%',height:'100%',display:'grid',placeItems:'center',fontSize:72,
                background:'radial-gradient(circle at 50% 38%,#2a2150,#120c2c)'}}>{space.emoji}</div>}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(105deg,rgba(10,7,24,.7),transparent 45%),linear-gradient(to top,rgba(10,7,24,.92),transparent 55%)'}}></div>
          {space.price && <div style={{position:'absolute',top:16,right:16,textAlign:'right',padding:'7px 13px',borderRadius:11,
            background:'rgba(10,7,24,.7)',border:'1px solid var(--gold-line)',backdropFilter:'blur(4px)'}}>
            <div style={{fontFamily:'var(--display)',fontSize:8.5,letterSpacing:'.26em',color:'var(--ink-dim)'}}>PRICE</div>
            <div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:21,color:'var(--gold-2)'}}>{fmt(space.price)} ✦</div>
          </div>}
          <div style={{position:'absolute',left:20,right:20,bottom:13}}>
            <div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--ink-dim)'}}>
              {region && <span className="gem" style={{color:rv,background:rv}}></span>}
              {region?region.name:space.desc}
            </div>
            <h2 style={{fontFamily:'var(--serif)',fontWeight:900,fontSize:30,color:'#fff',textShadow:'0 3px 14px #000',marginTop:2}}>{space.name}</h2>
          </div>
        </div>
        <div style={{background:'linear-gradient(180deg,#191234,#120c2a)',padding:'16px 20px 20px'}}>
          {rentRows.length>0 && <>
            <div style={{fontFamily:'var(--display)',fontSize:10,letterSpacing:'.3em',color:'var(--gold-3)',marginBottom:8}}>RENT · 租金階梯</div>
            <div style={{border:'1px solid var(--gold-line)',borderRadius:12,overflow:'hidden'}}>
              {rentRows.map(row=>(
                <div key={row.i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 13px',
                  borderTop:row.i?'1px solid rgba(231,193,107,.1)':'none',
                  background:row.i===level?'rgba(244,217,133,.1)':'transparent'}}>
                  <span style={{fontSize:13,color:row.i===level?rv:'var(--ink-dim)',fontWeight:row.i===level?700:400}}>
                    {row.i>0 && row.i<4 ? '🏠'.repeat(row.i)+' ' : row.i===4?'🏰 ':''}{row.lbl}{row.i===level?' ◂':''}
                  </span>
                  <span style={{fontFamily:'var(--display)',fontWeight:600,fontSize:14,color:row.i===level?'var(--gold-2)':'var(--ink-dim)'}}>{fmt(row.r)} ✦</span>
                </div>
              ))}
            </div>
          </>}
          {space.build && <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontSize:12.5,color:'var(--ink-dim)'}}>
            <span>每級建造費用</span><span style={{fontFamily:'var(--display)',color:'var(--gold-2)'}}>{fmt(space.build)} ✦</span>
          </div>}
          <div className="actions" style={{display:'flex',gap:10,marginTop:16}}>
            {canBuy && <button className="btn btn-gold" style={{flex:1.5}} onClick={onBuy}>購買領地 · {fmt(buyPrice)} ✦</button>}
            {!prop && onBuy && player.money<buyPrice && <button className="btn btn-ghost" style={{flex:1.5,opacity:.5}} disabled>金幣不足</button>}
            {canBuild && <button className="btn btn-emerald" style={{flex:1}} onClick={onBuild}>🏗 建造 · {fmt(space.build)} ✦</button>}
            <button className="btn btn-ghost" onClick={onClose}>{canBuy||canBuild?'暫不':'關閉'}</button>
          </div>
          <div style={{textAlign:'center',marginTop:11,fontSize:12,color:'var(--ink-dim)'}}>
            你的金庫：<b style={{color:'var(--gold-2)',fontFamily:'var(--display)'}}>{fmt(player.money)} ✦</b>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Card draw (chance / destiny) ----------
function CardModal({card,type,onClose}){
  const isChance=type==='chance';
  const sign=card.action==='gain'||card.action==='collect'?'g':(card.action==='lose'||card.action==='buildtax'?'l':null);
  return (
    <Modal onClose={null} bare maxW={320}>
      <div className="card" style={{boxShadow:'0 40px 80px -20px #000,0 0 60px rgba(157,107,230,.4)'}}>
        <div className="top" style={{height:210}}>
          <img src={isChance?'images/chance_card_back.png':'images/destiny_card_back.png'} alt=""/>
          <div className="grad"></div>
          <div className="kicker"><div className="k">{isChance?'機會之門':'命運神殿'}</div>
            <div className="ke">{(isChance?'FORTUNE':'DESTINY')+'\u00A0·\u00A0ILUMIYA'}</div></div>
          <div className="seal">{card.emoji}</div>
        </div>
        <div className="body">
          <div className="txt">{card.text}</div>
          {card.amount && sign && <div className={'reward '+sign}>{sign==='g'?'+':'−'} {fmt(card.amount)} <span className="coin" style={{fontSize:20}}></span></div>}
          <hr className="rule-gold"/>
          <button className="btn btn-gold" style={{marginTop:18,padding:'13px 40px'}} onClick={onClose}>
            {isChance?'接受機會':'接受命運的裁奪'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Item shop ----------
function ShopModal({player,onBuy,onClose}){
  return (
    <Modal onClose={onClose} maxW={420}>
      <div className="modal-pad">
        <div className="modal-h"><div className="ttl">🏪 道具商店</div>
          <div className="sub">你的金庫：<b style={{color:'var(--gold-2)'}}>{fmt(player.money)} ✦</b></div></div>
        {ITEMS.map(item=>(
          <div className="list-card" key={item.id}>
            <span className="ico">{item.emoji}</span>
            <div className="lc-body"><div className="t">{item.name}</div><div className="d">{item.desc}</div></div>
            <button className="btn btn-gold btn-sm" disabled={player.money<item.price}
              style={player.money<item.price?{opacity:.4}:null} onClick={()=>onBuy(item)}>{fmt(item.price)} ✦</button>
          </div>
        ))}
        <button className="btn btn-ghost" style={{width:'100%',marginTop:6}} onClick={onClose}>關閉</button>
      </div>
    </Modal>
  );
}

// ---------- Stock market ----------
function StockModal({player,stocks,onBuy,onSell,onClose}){
  return (
    <Modal onClose={onClose} maxW={420}>
      <div className="modal-pad">
        <div className="modal-h"><div className="ttl">📈 股票交易所</div>
          <div className="sub">你的金庫：<b style={{color:'var(--gold-2)'}}>{fmt(player.money)} ✦</b></div></div>
        {STOCKS.map(st=>{
          const price=stocks[st.id]?.price||st.basePrice;
          const change=stocks[st.id]?.change||0;
          const held=player.stocks?.[st.id]||0;
          return (
            <div className="list-card" key={st.id} style={{flexWrap:'wrap'}}>
              <span className="ico">{st.emoji}</span>
              <div className="lc-body">
                <div className="t">{st.name}</div>
                <div className="d"><span style={{color:'var(--gold-2)',fontFamily:'var(--display)'}}>{fmt(price)} ✦</span>
                  <span style={{color:change>=0?'var(--gain)':'var(--loss)',marginLeft:8}}>{change>=0?'▲':'▼'} {fmt(Math.abs(change))}</span>
                  <span style={{marginLeft:10,color:'var(--ink-faint)'}}>持有 {held} 股</span></div>
              </div>
              <div style={{display:'flex',gap:6,flex:'0 0 auto'}}>
                <button className="btn btn-emerald btn-sm" disabled={player.money<price} style={player.money<price?{opacity:.4}:null} onClick={()=>onBuy(st.id)}>買入</button>
                <button className="btn btn-ruby btn-sm" disabled={held<1} style={held<1?{opacity:.4}:null} onClick={()=>onSell(st.id)}>賣出</button>
              </div>
            </div>
          );
        })}
        <button className="btn btn-ghost" style={{width:'100%',marginTop:6}} onClick={onClose}>關閉</button>
      </div>
    </Modal>
  );
}

// ---------- Player detail ----------
function PlayerDetailModal({player,properties,onClose,onUseItem}){
  const ch=CHARACTERS[player.charId];
  const owned=Object.entries(properties).filter(([k,v])=>v.owner===player.id);
  return (
    <Modal onClose={onClose} maxW={420}>
      <div className="modal-pad">
        <div className="modal-h">
          <img src={ch.img} alt="" style={{width:84,height:84,objectFit:'contain',borderRadius:16,
            border:`2px solid var(${ch.v})`,boxShadow:`0 0 22px var(${ch.v})`,background:'rgba(12,8,26,.6)'}}/>
          <div className="ttl" style={{marginTop:6}}>{player.name}</div>
          <div className="sub">{ch.name} · {ch.desc}</div>
        </div>
        <div className="panel" style={{padding:'12px 16px',marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span className="dim">金庫</span><span className="amount">{fmt(player.money)} ✦</span></div>
          <div style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span className="dim">領地</span><span className="gold">{owned.length} 處</span></div>
          {player.shields>0 && <div style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span className="dim">🛡 護盾</span><span className="gold">{player.shields}</span></div>}
          {player.jailCards>0 && <div style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span className="dim">🗝 出龍穴卡</span><span className="gold">{player.jailCards}</span></div>}
        </div>
        {player.items&&player.items.length>0 && <>
          <div style={{fontFamily:'var(--display)',fontSize:10,letterSpacing:'.3em',color:'var(--gold-3)',margin:'4px 0 8px'}}>🎒 道具背包</div>
          {player.items.map((it,i)=>{
            const item=ITEMS.find(x=>x.id===it);
            return item?(
              <div className="list-card" key={i} style={{padding:'9px 12px'}}>
                <span className="ico" style={{fontSize:22}}>{item.emoji}</span>
                <div className="lc-body"><div className="t" style={{fontSize:13}}>{item.name}</div><div className="d">{item.desc}</div></div>
                {onUseItem && <button className="btn btn-gold btn-sm" onClick={()=>onUseItem(i,item.id)}>使用</button>}
              </div>
            ):null;
          })}
        </>}
        {owned.length>0 && <>
          <div style={{fontFamily:'var(--display)',fontSize:10,letterSpacing:'.3em',color:'var(--gold-3)',margin:'10px 0 8px'}}>🏰 領地</div>
          {owned.map(([id,p])=>{
            const sp=BOARD_SPACES[+id];const r=REGIONS[sp.group];
            return (
              <div className="list-card" key={id} style={{padding:'9px 12px'}}>
                <span className="ico" style={{fontSize:22}}>{sp.emoji}</span>
                <div className="lc-body"><div className="t" style={{fontSize:13,color:r?`var(${r.v})`:'#fff'}}>{sp.name}</div>
                  <div className="d">等級 {p.level} · 租金 {fmt(sp.rent[p.level])} ✦</div></div>
              </div>
            );
          })}
        </>}
        <button className="btn btn-ghost" style={{width:'100%',marginTop:10}} onClick={onClose}>關閉</button>
      </div>
    </Modal>
  );
}

// ---------- Auction ----------
function AuctionModal({space,player,onBid,onClose}){
  const region=REGIONS[space.group];const rv=region?`var(${region.v})`:'var(--gold-2)';
  const auctionPrice=Math.round(space.price*0.65);
  const art=tileArt(space);
  return (
    <Modal onClose={onClose} maxW={380}>
      <div className="modal-pad" style={{textAlign:'center'}}>
        <div className="modal-h"><div className="ttl">🔔 拍賣廳</div><div className="sub">稀有領地特價競標！</div></div>
        <div style={{width:120,height:120,margin:'0 auto 10px',borderRadius:14,overflow:'hidden',border:'1px solid var(--gold-line)'}}>
          <img src={art} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <div style={{color:rv,fontFamily:'var(--serif)',fontWeight:900,fontSize:20}}>{space.name}</div>
        <div style={{fontSize:12,color:'var(--ink-dim)',marginTop:2}}>{region?region.name:''}</div>
        <div style={{fontSize:13,margin:'10px 0 2px',color:'var(--ink-dim)'}}>原價 <span style={{textDecoration:'line-through'}}>{fmt(space.price)} ✦</span></div>
        <div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:24,color:'var(--gain)',marginBottom:16}}>拍賣價 {fmt(auctionPrice)} ✦ <span style={{fontSize:13,color:'var(--ink-dim)'}}>（65折）</span></div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-gold" style={{flex:1.4}} disabled={player.money<auctionPrice} onClick={()=>onBid(auctionPrice)}>競標 {fmt(auctionPrice)} ✦</button>
          <button className="btn btn-ghost" onClick={onClose}>放棄</button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Teleport ----------
function TeleportModal({onPick,onClose}){
  return (
    <Modal onClose={onClose} maxW={400}>
      <div className="modal-pad">
        <div className="modal-h"><div className="ttl">📜 傳送卷軸</div><div className="sub">選擇傳送目的地</div></div>
        <div style={{maxHeight:320,overflowY:'auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
          {BOARD_SPACES.map((sp,i)=>{
            const r=sp.group?REGIONS[sp.group]:null;
            return (
              <button key={i} className="list-card" style={{margin:0,padding:'8px 10px',cursor:'pointer',textAlign:'left'}} onClick={()=>onPick(i)}>
                <span className="ico" style={{fontSize:18,width:26}}>{sp.emoji}</span>
                <div className="lc-body"><div className="t" style={{fontSize:12,color:r?`var(${r.v})`:'#fff'}}>{sp.name}</div></div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ---------- Mini game (logic preserved) ----------
function MiniGameModal({onFinish}){
  const [game]=_uS(()=>rand(0,2));
  const [phase,setPhase]=_uS('intro');
  const [result,setResult]=_uS(null);
  const [guessTarget]=_uS(()=>rand(1,10));
  const [guess,setGuess]=_uS(5);
  const [hint,setHint]=_uS('');
  const [tapCount,setTapCount]=_uS(0);
  const [tapTime,setTapTime]=_uS(5);
  const tapTimer=_uR(null);
  const [memCards]=_uS(()=>{
    const vals=[1,2,3,4,5,6,1,2,3,4,5,6];
    for(let i=vals.length-1;i>0;i--){const j=rand(0,i);[vals[i],vals[j]]=[vals[j],vals[i]];}
    return vals.map((v,i)=>({id:i,val:v,flipped:false,matched:false}));
  });
  const [memState,setMemState]=_uS({cards:memCards,first:null,moves:0,matches:0});
  const games=[{name:'猜數字',emoji:'🔢',desc:'猜一個 1-10 之間的數字'},{name:'快速點擊',emoji:'👆',desc:'5秒內盡量點擊！'},{name:'記憶翻牌',emoji:'🃏',desc:'找出所有配對的卡牌'}];
  const startTap=()=>{setPhase('play');setTapCount(0);setTapTime(5);const start=Date.now();
    tapTimer.current=setInterval(()=>{const el=(Date.now()-start)/1000;const rem=Math.max(0,5-el);setTapTime(Math.ceil(rem));if(rem<=0){clearInterval(tapTimer.current);setPhase('result');}},100);};
  _uE(()=>()=>{if(tapTimer.current)clearInterval(tapTimer.current);},[]);
  const calc=(score)=>{if(game===0)return score?1500:0;if(game===1)return score>=20?2000:score>=10?1000:500;return score<=12?2000:score<=18?1000:500;};
  const finish=(score)=>{setResult({score,reward:calc(score)});setPhase('result');};
  const memFlip=(idx)=>{
    const s={...memState,cards:memState.cards.map(c=>({...c}))};
    if(s.cards[idx].flipped||s.cards[idx].matched)return;
    s.cards[idx].flipped=true;
    if(s.first===null){s.first=idx;}
    else{s.moves++;
      if(s.cards[s.first].val===s.cards[idx].val){s.cards[s.first].matched=true;s.cards[idx].matched=true;s.matches++;s.first=null;if(s.matches===6)finish(s.moves);}
      else{const f=s.first;s.first=null;setMemState(s);
        setTimeout(()=>setMemState(prev=>{const ns={...prev,cards:prev.cards.map(c=>({...c}))};ns.cards[f].flipped=false;ns.cards[idx].flipped=false;return ns;}),650);return;}}
    setMemState(s);
  };
  if(phase==='result'||result){
    const reward=result?.reward ?? (game===1?calc(tapCount):0);
    return (
      <Modal onClose={null} maxW={360}>
        <div className="modal-pad" style={{textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:6}}>🏆</div>
          <div className="ttl t-serif" style={{fontSize:22}}>小遊戲結束！</div>
          {game===1&&!result&&<p style={{margin:'6px 0',color:'var(--ink-dim)'}}>你點擊了 {tapCount} 次！</p>}
          <div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:30,color:'var(--gain)',margin:'12px 0 18px'}}>獎勵 {fmt(reward)} ✦</div>
          <button className="btn btn-gold" onClick={()=>onFinish(reward)}>收下獎勵</button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal onClose={null} maxW={360}>
      <div className="modal-pad" style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:6}}>{games[game].emoji}</div>
        <div className="ttl t-serif" style={{fontSize:20}}>{games[game].name}</div>
        <p style={{color:'var(--ink-dim)',margin:'4px 0 16px',fontSize:13}}>{games[game].desc}</p>
        {phase==='intro' && <button className="btn btn-gold" onClick={()=>{game===1?startTap():setPhase('play');}}>開始遊戲</button>}
        {phase==='play'&&game===0 && (
          <div>
            <input type="range" min="1" max="10" value={guess} onChange={e=>setGuess(+e.target.value)} style={{width:'100%',marginBottom:8,accentColor:'var(--gold-3)'}}/>
            <div style={{fontSize:38,color:'var(--gold-2)',fontFamily:'var(--display)',marginBottom:4}}>{guess}</div>
            {hint && <div style={{color:'var(--loss)',fontSize:13,marginBottom:10}}>{hint}</div>}
            <button className="btn btn-gold" onClick={()=>{guess===guessTarget?finish(true):setHint(guess<guessTarget?'太小了！再猜一次 ↑':'太大了！再猜一次 ↓');}}>猜！</button>
          </div>
        )}
        {phase==='play'&&game===1 && (
          <div>
            <div style={{fontSize:32,color:'var(--gold-2)',fontFamily:'var(--display)',marginBottom:6}}>⏱ {tapTime}s</div>
            <div style={{fontSize:48,marginBottom:10,fontFamily:'var(--display)',color:'var(--ink)'}}>{tapCount}</div>
            <button className="btn btn-gold" style={{fontSize:20,padding:'18px 40px'}} onClick={()=>setTapCount(c=>c+1)}>👆 點擊！</button>
          </div>
        )}
        {phase==='play'&&game===2 && (
          <div>
            <div style={{fontSize:12,color:'var(--ink-dim)',marginBottom:8}}>翻牌 {memState.moves} 次 · 配對 {memState.matches}/6</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,maxWidth:280,margin:'0 auto'}}>
              {memState.cards.map((c,i)=>(
                <div key={i} onClick={()=>memFlip(i)} style={{aspectRatio:'1',display:'grid',placeItems:'center',borderRadius:9,cursor:'pointer',fontSize:24,
                  transition:'all .3s',background:c.matched?'rgba(70,217,138,.25)':c.flipped?'rgba(244,217,133,.18)':'rgba(40,30,70,.8)',
                  border:c.matched?'2px solid var(--gain)':c.flipped?'2px solid var(--gold-2)':'2px solid rgba(231,193,107,.12)'}}>
                  {(c.flipped||c.matched)?['','⚔️','🛡️','🧪','📜','💎','👑'][c.val]:'✦'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

Object.assign(window,{Modal,PropertyModal,CardModal,ShopModal,StockModal,PlayerDetailModal,AuctionModal,TeleportModal,MiniGameModal});
