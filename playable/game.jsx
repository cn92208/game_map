// ============================================================
// ILUMIYA · 奇幻大富翁 — Main Game (logic preserved) + layout + App
// ============================================================
const {useState,useEffect,useCallback,useRef,useMemo} = React;

function useResponsive(){
  const [m,setM]=useState(window.innerWidth<=900);
  const [size,setSize]=useState(400);
  useEffect(()=>{
    const fit=()=>{
      const mob=window.innerWidth<=900;setM(mob);
      const railW=mob?0:470, padX=mob?22:64;
      const reserveH=mob?260:60;
      const availW=window.innerWidth-railW-padX;
      const availH=window.innerHeight-reserveH;
      setSize(Math.max(252,Math.min(availW,availH)));
    };
    fit();window.addEventListener('resize',fit);return ()=>window.removeEventListener('resize',fit);
  },[]);
  return {isMobile:m,boardSize:size};
}

function Game({initialPlayers}){
  const [players,setPlayers]=useState(()=>initialPlayers.map((p,i)=>({
    id:i,name:p.name,charId:p.charId,money:15000,position:0,
    inJail:false,jailTurns:0,jailCards:0,bankrupt:false,
    items:[],stocks:{},shields:0,doubleRentNext:false,discountNext:false,doubleDiceNext:false
  })));
  const [currentTurn,setCurrentTurn]=useState(0);
  const [phase,setPhase]=useState('roll');
  const [dice,setDice]=useState([1,1]);
  const [rolling,setRolling]=useState(false);
  const [message,setMessage]=useState('擲骰子，展開你的冒險');
  const [eyebrow,setEyebrow]=useState('READY');
  const [msgLog,setMsgLog]=useState([]);
  const [properties,setProperties]=useState({});
  const [stocks,setStocks]=useState(()=>{const s={};STOCKS.forEach(st=>{s[st.id]={price:st.basePrice,change:0,history:[st.basePrice]};});return s;});
  const [modal,setModal]=useState(null);
  const [round,setRound]=useState(1);
  const [gameOver,setGameOver]=useState(false);
  const [winner,setWinner]=useState(null);
  const [isAnimating,setIsAnimating]=useState(false);
  const [movingId,setMovingId]=useState(null);
  const [flashId,setFlashId]=useState(null);
  const animRef=useRef(null);
  const {isMobile,boardSize}=useResponsive();
  // refs always hold the latest state so setTimeout/animation-deferred handlers don't read stale closures
  const playersRef=useRef(players); playersRef.current=players;
  const propertiesRef=useRef(properties); propertiesRef.current=properties;

  const activePlayers=useMemo(()=>players.filter(p=>!p.bankrupt),[players]);
  const cp=players[currentTurn];
  const addLog=(msg)=>setMsgLog(prev=>[{text:msg,time:Date.now()},...prev].slice(0,40));
  const say=(m,e)=>{setMessage(m);if(e!==undefined)setEyebrow(e);};
  const updatePlayer=(id,updates)=>setPlayers(prev=>prev.map(p=>p.id===id?{...p,...(typeof updates==='function'?updates(p):updates)}:p));

  const updateStocks=useCallback(()=>{
    setStocks(prev=>{const ns={...prev};STOCKS.forEach(st=>{const old=ns[st.id].price;
      const change=Math.round(old*st.volatility*(Math.random()-0.45));const np=Math.max(50,old+change);
      ns[st.id]={price:np,change:np-old,history:[...ns[st.id].history,np].slice(-20)};});return ns;});
  },[]);

  const checkBankrupt=(player)=>{
    if(player.money<0){
      updatePlayer(player.id,{bankrupt:true});addLog(`💀 ${player.name} 破產出局`);
      const remaining=playersRef.current.filter(p=>!p.bankrupt&&p.id!==player.id);
      if(remaining.length<=1){setGameOver(true);setWinner(remaining[0]||null);}
    }
  };
  const movePlayer=(playerId,steps)=>{
    const p=playersRef.current.find(x=>x.id===playerId);let np=p.position+steps;
    if(np>=TOTAL_SPACES){np=np%TOTAL_SPACES;updatePlayer(playerId,prev=>({money:prev.money+2000}));addLog(`🏰 ${p.name} 經過起點，獲得 2,000 ✦`);}
    if(np<0) np=TOTAL_SPACES+np;
    updatePlayer(playerId,{position:np});return np;
  };

  const animateMove=(playerId,steps,startPos,onDone)=>{
    setIsAnimating(true);setPhase('moving');setMovingId(playerId);
    let done=0,cur=startPos;const pName=players.find(x=>x.id===playerId)?.name||'';
    const step=()=>{
      if(done>=steps){setIsAnimating(false);setMovingId(null);setFlashId(null);if(animRef.current)clearTimeout(animRef.current);if(onDone)onDone(cur);return;}
      done++;cur=(cur+1)%TOTAL_SPACES;
      if(cur===0){updatePlayer(playerId,prev=>({money:prev.money+2000}));addLog(`🏰 ${pName} 經過起點，獲得 2,000 ✦`);}
      updatePlayer(playerId,{position:cur});setFlashId(cur);
      say(`${BOARD_SPACES[cur].emoji} ${BOARD_SPACES[cur].name}（${done}/${steps}）`,'前進中');
      setTimeout(()=>setFlashId(null),170);
      animRef.current=setTimeout(step,done===steps?420:250);
    };
    step();
  };

  const handleLanding=(playerId)=>{
    const p=playersRef.current.find(x=>x.id===playerId);const pos=p.position;const space=BOARD_SPACES[pos];
    const properties=propertiesRef.current;const players=playersRef.current;
    switch(space.type){
      case 'property':
      case 'transport':{
        const prop=properties[pos];
        if(!prop){setModal({type:'buy',space,playerId});}
        else if(prop.owner!==playerId){
          const owner=players.find(x=>x.id===prop.owner);
          if(owner&&!owner.bankrupt){
            let rent;
            if(space.type==='transport'){
              const owned=Object.keys(properties).filter(k=>properties[k].owner===prop.owner&&BOARD_SPACES[+k].type==='transport').length;
              rent=space.rent[Math.min(owned-1,3)];
            } else rent=space.rent[prop.level];
            if(p.shields>0){updatePlayer(playerId,prev=>({shields:prev.shields-1}));addLog(`🛡️ ${p.name} 使用護盾，免付租金`);say('魔法護盾生效，免付租金！','SHIELD');}
            else{
              if(owner.doubleRentNext){rent*=2;updatePlayer(prop.owner,{doubleRentNext:false});addLog('💰 收租符咒！租金翻倍');}
              updatePlayer(playerId,prev=>({money:prev.money-rent}));updatePlayer(prop.owner,prev=>({money:prev.money+rent}));
              addLog(`💰 ${p.name} 支付 ${fmt(rent)} ✦ 租金給 ${owner.name}`);say(`支付 ${fmt(rent)} ✦ 租金給 ${owner.name}`,'RENT');
              setTimeout(()=>checkBankrupt({...p,money:p.money-rent}),500);
            }
          }
        } else {say(`你停在自己的 ${space.name}`,'OWNED');setModal({type:'ownprop',space,playerId});}
        break;
      }
      case 'chance':{const card=CHANCE_CARDS[rand(0,CHANCE_CARDS.length-1)];setModal({type:'card',card,cardType:'chance',playerId});break;}
      case 'destiny':{const card=DESTINY_CARDS[rand(0,DESTINY_CARDS.length-1)];setModal({type:'card',card,cardType:'destiny',playerId});break;}
      case 'tax':updatePlayer(playerId,prev=>({money:prev.money-200}));addLog(`💎 ${p.name} 繳納 200 ✦ 魔法稅`);say('繳納 200 ✦ 魔法稅','TAX');setTimeout(()=>checkBankrupt({...p,money:p.money-200}),500);break;
      case 'shop':setModal({type:'shop',playerId});break;
      case 'stock':setModal({type:'stock',playerId});break;
      case 'minigame':setModal({type:'minigame',playerId});break;
      case 'gotoprison':updatePlayer(playerId,{position:10,inJail:true,jailTurns:0});addLog(`🪤 ${p.name} 被龍捕手抓進龍穴`);say('被龍捕手抓住，打入龍穴！','CAPTURED');break;
      case 'start':say('歡迎回到起始城堡','HOME');break;
      case 'prison':if(!p.inJail)say('只是路過龍穴','VISITING');break;
      case 'free':say('在魔法泉源休息恢復','REST');break;
      case 'tavern':{const g=rand(200,600);updatePlayer(playerId,prev=>({money:prev.money+g}));addLog(`🍺 ${p.name} 在酒館獲得 ${fmt(g)} ✦ 補給`);say(`冒險者酒館補給 ${fmt(g)} ✦`,'TAVERN');break;}
      case 'curse':{const t=Math.max(100,Math.round(p.money*0.10));updatePlayer(playerId,prev=>({money:prev.money-t}));addLog(`💀 ${p.name} 觸發詛咒，損失 ${fmt(t)} ✦`);say(`詛咒廢墟！損失 ${fmt(t)} ✦`,'CURSE');setTimeout(()=>checkBankrupt({...p,money:p.money-t}),500);break;}
      case 'auction':{const avail=BOARD_SPACES.filter(sp=>sp.type==='property'&&!properties[sp.id]);if(avail.length){setModal({type:'auction',space:avail[rand(0,Math.min(avail.length-1,2))],playerId});}else say('拍賣廳目前無可拍賣地產','AUCTION');break;}
      default:say(`抵達 ${space.name}`);
    }
  };

  const applyCard=(card,playerId)=>{
    const players=playersRef.current;const properties=propertiesRef.current;
    const activePlayers=players.filter(x=>!x.bankrupt);
    const p=players.find(x=>x.id===playerId);
    switch(card.action){
      case 'gain':updatePlayer(playerId,prev=>({money:prev.money+card.amount}));addLog(`✨ ${p.name} 獲得 ${fmt(card.amount)} ✦`);break;
      case 'lose':updatePlayer(playerId,prev=>({money:prev.money-card.amount}));addLog(`💸 ${p.name} 損失 ${fmt(card.amount)} ✦`);setTimeout(()=>checkBankrupt({...p,money:p.money-card.amount}),500);break;
      case 'goto':{if(card.target<p.position){updatePlayer(playerId,prev=>({money:prev.money+2000}));addLog(`🏰 ${p.name} 經過起點，獲得 2,000 ✦`);}updatePlayer(playerId,{position:card.target});setTimeout(()=>handleLanding(playerId),300);break;}
      case 'move':{movePlayer(playerId,card.amount);setTimeout(()=>handleLanding(playerId),300);break;}
      case 'jailcard':updatePlayer(playerId,prev=>({jailCards:prev.jailCards+1}));addLog(`🗝️ ${p.name} 獲得出龍穴卡`);break;
      case 'gotoprison':updatePlayer(playerId,{position:10,inJail:true,jailTurns:0});addLog(`🪤 ${p.name} 被送入龍穴`);break;
      case 'collect':activePlayers.forEach(ap=>{if(ap.id!==playerId){updatePlayer(ap.id,prev=>({money:prev.money-card.amount}));updatePlayer(playerId,prev=>({money:prev.money+card.amount}));}});addLog(`🐉 每位玩家支付 ${fmt(card.amount)} ✦ 給 ${p.name}`);break;
      case 'shield':updatePlayer(playerId,prev=>({shields:prev.shields+1}));addLog(`🌟 ${p.name} 獲得守護護盾`);break;
      case 'buildtax':{const owned=Object.entries(properties).filter(([k,v])=>v.owner===playerId);const tb=owned.reduce((s,[k,v])=>s+v.level,0);const tax=tb*card.amount;updatePlayer(playerId,prev=>({money:prev.money-tax}));addLog(`☠️ ${p.name} 支付維修費 ${fmt(tax)} ✦`);break;}
      case 'swaprichest':{const r=activePlayers.filter(ap=>ap.id!==playerId).sort((a,b)=>b.money-a.money)[0];if(r){const a=p.money,b=r.money;updatePlayer(playerId,{money:b});updatePlayer(r.id,{money:a});addLog(`🎰 ${p.name} 與 ${r.name} 交換金幣`);}break;}
      case 'swappropest':{const r=activePlayers.filter(ap=>ap.id!==playerId).sort((a,b)=>a.money-b.money)[0];if(r){const a=p.money,b=r.money;updatePlayer(playerId,{money:b});updatePlayer(r.id,{money:a});addLog(`🔄 ${p.name} 與 ${r.name} 命運逆轉`);}break;}
    }
  };

  const doRoll=()=>{
    if(rolling||phase!=='roll'||isAnimating) return;
    setRolling(true);const d1=rollDie(),d2=rollDie();
    setTimeout(()=>{
      setDice([d1,d2]);setRolling(false);const total=d1+d2;const p=players[currentTurn];
      if(p.inJail){
        if(d1===d2){updatePlayer(p.id,{inJail:false,jailTurns:0});addLog(`🔓 ${p.name} 擲出雙數，逃出龍穴`);say(`擲出雙數！逃出龍穴，前進 ${total} 步`,'ESCAPE');
          animateMove(p.id,total,p.position,(fp)=>{say(`抵達 ${BOARD_SPACES[fp].name}`,'ARRIVED');setPhase('landed');setTimeout(()=>handleLanding(p.id),200);});}
        else if(p.jailTurns>=2){updatePlayer(p.id,prev=>({inJail:false,jailTurns:0,money:prev.money-500}));addLog(`💰 ${p.name} 繳 500 ✦ 離開龍穴`);say(`繳 500 ✦ 離開龍穴，前進 ${total} 步`,'BAIL');
          animateMove(p.id,total,p.position,(fp)=>{say(`抵達 ${BOARD_SPACES[fp].name}`,'ARRIVED');setPhase('landed');setTimeout(()=>handleLanding(p.id),200);});}
        else{updatePlayer(p.id,prev=>({jailTurns:prev.jailTurns+1}));say(`仍在龍穴中（${p.jailTurns+1}/3 回合）`,'JAILED');setPhase('landed');}
        return;
      }
      let finalTotal=total;
      if(p.doubleDiceNext){const d3=rollDie(),d4=rollDie();finalTotal=Math.max(total,d3+d4);updatePlayer(p.id,{doubleDiceNext:false});addLog(`🎲 幸運骰子！取較大值 ${finalTotal}`);}
      say(`擲出 ${d1} + ${d2}，前進 ${finalTotal} 步`,`ROLL ${finalTotal}`);
      animateMove(p.id,finalTotal,p.position,(fp)=>{say(`抵達 ${BOARD_SPACES[fp].name}`,'ARRIVED');setPhase('landed');setTimeout(()=>handleLanding(p.id),200);});
    },550);
  };

  const endTurn=()=>{
    let next=(currentTurn+1)%players.length;
    while(players[next].bankrupt&&next!==currentTurn) next=(next+1)%players.length;
    if(next<=currentTurn){setRound(r=>r+1);updateStocks();}
    setCurrentTurn(next);setPhase('roll');say(`${players[next].name} 的回合，擲骰子吧`,'READY');setModal(null);
  };

  const handleBuy=(spaceId,playerId)=>{
    const space=BOARD_SPACES[spaceId];const p=players.find(x=>x.id===playerId);let price=space.price;
    if(p.discountNext){price=Math.round(price*0.8);updatePlayer(playerId,{discountNext:false});addLog('📋 商人證書！八折購入');}
    if(p.money>=price){updatePlayer(playerId,prev=>({money:prev.money-price}));setProperties(prev=>({...prev,[spaceId]:{owner:playerId,level:0}}));addLog(`🏰 ${p.name} 購得 ${space.name}（${fmt(price)} ✦）`);say(`購得 ${space.name}！`,'ACQUIRED');}
    setModal(null);
  };
  const handleBuild=(spaceId,playerId)=>{
    const space=BOARD_SPACES[spaceId];const prop=properties[spaceId];const p=players.find(x=>x.id===playerId);
    if(prop&&prop.owner===playerId&&prop.level<4&&p.money>=space.build){updatePlayer(playerId,prev=>({money:prev.money-space.build}));setProperties(prev=>({...prev,[spaceId]:{...prev[spaceId],level:prev[spaceId].level+1}}));addLog(`🏗️ ${p.name} 在 ${space.name} 建造（等級 ${prop.level+1}）`);}
    setModal(null);
  };
  const handleBuyItem=(item,playerId)=>{const p=players.find(x=>x.id===playerId);if(p.money>=item.price){updatePlayer(playerId,prev=>({money:prev.money-item.price,items:[...prev.items,item.id]}));addLog(`🏪 ${p.name} 購買了 ${item.name}`);}};
  const handleUseItem=(playerIdx,itemIdx,itemId)=>{
    const p=players[playerIdx];const ni=[...p.items];ni.splice(itemIdx,1);updatePlayer(p.id,{items:ni});
    switch(itemId){
      case 'shield':updatePlayer(p.id,prev=>({shields:prev.shields+1}));addLog(`🛡️ ${p.name} 啟動護盾`);break;
      case 'doubleDice':updatePlayer(p.id,{doubleDiceNext:true});addLog(`🎲 ${p.name} 使用幸運骰子`);break;
      case 'steal':{const t=activePlayers.filter(ap=>ap.id!==p.id);if(t.length){const tg=t[rand(0,t.length-1)];const s=Math.min(500,tg.money);updatePlayer(tg.id,prev=>({money:prev.money-s}));updatePlayer(p.id,prev=>({money:prev.money+s}));addLog(`🧪 ${p.name} 從 ${tg.name} 偷取 ${fmt(s)} ✦`);}break;}
      case 'discount':updatePlayer(p.id,{discountNext:true});addLog(`📋 ${p.name} 使用商人證書`);break;
      case 'doubleRent':updatePlayer(p.id,{doubleRentNext:true});addLog(`💰 ${p.name} 使用收租符咒`);break;
      case 'teleport':setModal({type:'teleport',playerId:p.id});addLog(`📜 ${p.name} 使用傳送卷軸`);break;
    }
    if(itemId!=='teleport') setModal(null);
  };
  const handleBuyStock=(id,playerId)=>{const price=stocks[id].price;const p=players.find(x=>x.id===playerId);if(p.money>=price){updatePlayer(playerId,prev=>({money:prev.money-price,stocks:{...prev.stocks,[id]:(prev.stocks[id]||0)+1}}));addLog(`📈 ${p.name} 買入 ${STOCKS.find(s=>s.id===id).name}`);}};
  const handleSellStock=(id,playerId)=>{const price=stocks[id].price;const p=players.find(x=>x.id===playerId);if((p.stocks[id]||0)>=1){updatePlayer(playerId,prev=>({money:prev.money+price,stocks:{...prev.stocks,[id]:prev.stocks[id]-1}}));addLog(`📉 ${p.name} 賣出 ${STOCKS.find(s=>s.id===id).name}`);}};
  const handleJailEscape=()=>{const p=players[currentTurn];if(p.jailCards>0){updatePlayer(p.id,prev=>({inJail:false,jailTurns:0,jailCards:prev.jailCards-1}));addLog(`🗝️ ${p.name} 使用出龍穴卡`);say('使用出龍穴卡，脫離龍穴！','FREED');}};

  const getNetWorth=(p)=>{let w=p.money;Object.entries(properties).forEach(([id,prop])=>{if(prop.owner===p.id){const sp=BOARD_SPACES[+id];w+=(sp.price||0)+prop.level*(sp.build||0);}});if(p.stocks)Object.entries(p.stocks).forEach(([id,c])=>{w+=c*(stocks[id]?.price||0);});return w;};

  const openTile=(idx)=>{if(isAnimating)return;const sp=BOARD_SPACES[idx];if(sp.type==='property'||sp.type==='transport'){const prop=properties[idx];setModal({type:'view',space:sp,prop,playerId:cp.id});}};

  // ---- derived display ----
  const space=BOARD_SPACES[cp.position];
  const prop=properties[cp.position];
  const region=space.group?REGIONS[space.group]:null;
  const owner=prop?players.find(p=>p.id===prop.owner):null;
  const canBuyHere=(space.type==='property'||space.type==='transport')&&!prop&&cp.money>=(space.price||Infinity);
  const canBuildHere=prop&&prop.owner===cp.id&&prop.level<4;

  if(gameOver) return <Victory players={players} round={round} getNetWorth={getNetWorth}/>;

  // ---- reusable bits ----
  const ovChar=CHARACTERS[cp.charId];
  const DiceArea=({small})=>(
    <div className="dice-pair">
      <Dice value={dice[0]} rolling={rolling} small={small}/>
      <Dice value={dice[1]} rolling={rolling} small={small}/>
    </div>
  );
  const ActionButtons=()=>(
    phase==='landed' ? (
      <>
        {canBuyHere && <button className="btn btn-gold btn-sm" onClick={()=>handleBuy(cp.position,cp.id)}>購買領地 · {fmt(space.price)} ✦</button>}
        {canBuildHere && <button className="btn btn-emerald btn-sm" onClick={()=>handleBuild(cp.position,cp.id)}>🏗 建造</button>}
        {cp.items.length>0 && <button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:'playerDetail',player:cp})}>🎒 道具</button>}
        <button className="btn btn-ghost btn-sm" onClick={endTurn}>結束回合 →</button>
      </>
    ) : (
      <>
        <button className="btn btn-gold btn-sm" onClick={doRoll} disabled={rolling||isAnimating} style={isAnimating?{opacity:.5}:null}>
          {isAnimating?'移動中…':cp.inJail?'🎲 擲骰逃脫':'🎲 擲骰子'}
        </button>
        {!isAnimating&&cp.inJail&&cp.jailCards>0 && <button className="btn btn-ghost btn-sm" onClick={handleJailEscape}>🗝 出龍穴卡</button>}
      </>
    )
  );

  return (
    <div className={'shell void-bg'+(isMobile?' mobile':'')}>
      {isMobile && (
        <div className="topbar">
          <div className="tb-head"><div className="brand title-zh">奇幻大富翁</div><div className="round-badge">第 {round} 回合</div></div>
          <div className="pstrip">
            {players.map((p,i)=>{const ch=CHARACTERS[p.charId];return (
              <div key={p.id} className={'pchip'+(i===currentTurn?' active':'')+(p.inJail?' jailed':'')+(p.bankrupt?' bankrupt':'')}
                style={{'--pc':`var(${ch.v})`}} onClick={()=>setModal({type:'playerDetail',player:p})}>
                <img src={ch.img} alt=""/><div style={{minWidth:0}}><div className="n">{p.name}</div><div className="m">{(p.money/1000).toFixed(1)}k ✦</div></div>
              </div>);})}
          </div>
        </div>
      )}

      <div className="board-area">
        <Board mobile={isMobile} size={boardSize} players={players} currentTurn={currentTurn}
          properties={properties} movingId={movingId} flashId={flashId} onTileClick={openTile}/>
      </div>

      {isMobile ? (
        <div className="mdock">
          <div className="tilestrip panel flourish">
            <div className="ic">{tileArt(space)?<><img src={tileArt(space)} alt=""/>{region&&<span className="b" style={{background:`var(${region.v})`}}></span>}</>:<span className="glyph">{space.emoji}</span>}</div>
            <div className="ti">
              <div className="r">{region&&<span className="gem" style={{color:`var(${region.v})`,background:`var(${region.v})`}}></span>}{region?region.name:space.desc}{owner&&` · ${owner.name}`}{!owner&&prop===undefined&&region?' · 無人擁有':''}</div>
              <div className="n">{space.name}</div>
            </div>
            {space.price && <div className="rent"><div className="rl">{prop?'租金':'售價'}</div><div className="rv">{fmt(prop?space.rent[prop.level]:space.price)}</div></div>}
          </div>
          <div className="castrow">
            <DiceArea small/>
            <ActionButtons/>
          </div>
        </div>
      ) : (
        <div className="rail">
          <div className="rail-head panel flourish">
            <div><div className="eyebrow">Fantasy&nbsp;Monopoly</div><div className="title-zh" style={{fontSize:24,lineHeight:1,marginTop:3}}>伊路米雅</div></div>
            <div className="round-badge">第 {round} 回合</div>
          </div>

          <div className="spot panel flourish">
            <div className="ava"><img src={ovChar.img} alt=""/></div>
            <div className="who">
              <div className="nm">{cp.name}</div>
              <div className="arch">{ovChar.name} · {ovChar.desc}</div>
              <div className="money"><span className="amount">{fmt(cp.money)}</span> <Coin/></div>
              <div className="chips">
                <span className="chip" onClick={()=>setModal({type:'playerDetail',player:cp})}>領地 <b>{Object.values(properties).filter(v=>v.owner===cp.id).length}</b></span>
                <span className="chip" onClick={()=>setModal({type:'playerDetail',player:cp})}>道具 <b>{cp.items.length}</b></span>
                {cp.shields>0&&<span className="chip">🛡 <b>{cp.shields}</b></span>}
                {cp.jailCards>0&&<span className="chip">🗝 <b>{cp.jailCards}</b></span>}
              </div>
            </div>
          </div>

          <div className="others">
            {players.filter(p=>p.id!==cp.id).map(p=>{const ch=CHARACTERS[p.charId];return (
              <div key={p.id} className={'pcard panel'+(p.inJail?' jailed':'')+(p.bankrupt?' bankrupt':'')} style={{'--pc':`var(${ch.v})`}} onClick={()=>setModal({type:'playerDetail',player:p})}>
                <img src={ch.img} alt=""/><div className="pn">{p.name}</div><div className="pm">{fmt(p.money)} ✦</div>
              </div>);})}
          </div>

          <div className="landed panel flourish">
            <div className="lh">
              <div className="pic">{tileArt(space)?<><img src={tileArt(space)} alt=""/>{region&&<span className="rb" style={{background:`var(${region.v})`}}></span>}</>:<span className="glyph">{space.emoji}</span>}</div>
              <div className="info">
                <div className="reg">{region&&<span className="gem" style={{color:`var(${region.v})`,background:`var(${region.v})`}}></span>}{region?region.name:'特殊地塊'}{owner?` · ${owner.name} 擁有`:(region&&!prop?' · 無人擁有':'')}</div>
                <div className="nm">{space.name}</div>
                <div className="st">{owner&&owner.id!==cp.id?`需支付租金 ${fmt(space.rent[prop.level])} ✦`:(space.desc||'')}</div>
              </div>
            </div>
            {space.rent && [0,1,4].map(i=>(
              <div key={i} className={'rent-row'+((prop?prop.level:0)===i?' cur':'')}>
                <span className="lbl">{i===0?'空地 · 基本租金':i===4?'🏰 城堡（滿級）':`🏠 ${i} 級建築`}{(prop?prop.level:0)===i?' ◂':''}</span>
                <span className="v">{fmt(space.rent[i])} ✦</span>
              </div>
            ))}
          </div>

          <div className="dock panel flourish">
            <div className="dice-cast">
              <div className="casting-circle"><DiceArea/></div>
              <div className="msg-line"><div className="e">{eyebrow}</div><div className="m">{message}</div></div>
            </div>
            <div className="actions"><ActionButtons/></div>
          </div>

          <div className="log panel">
            <div className="lt">ADVENTURE&nbsp;LOG</div>
            {msgLog.length===0 && <div className="li dim">冒險即將展開…</div>}
            {msgLog.slice(0,7).map((l,i)=>(<div key={l.time+'-'+i} className="li"><span>{l.text}</span></div>))}
          </div>
        </div>
      )}

      {/* ---------- MODALS ---------- */}
      {modal?.type==='card' && <CardModal card={modal.card} type={modal.cardType} onClose={()=>{applyCard(modal.card,modal.playerId);setModal(null);}}/>}
      {modal?.type==='buy' && <PropertyModal space={modal.space} prop={null} isOwner={false} player={players.find(p=>p.id===modal.playerId)} onClose={()=>setModal(null)} onBuy={()=>handleBuy(modal.space.id,modal.playerId)}/>}
      {modal?.type==='ownprop' && <PropertyModal space={modal.space} prop={properties[modal.space.id]} isOwner={true} player={players.find(p=>p.id===modal.playerId)} onClose={()=>setModal(null)} onBuild={()=>handleBuild(modal.space.id,modal.playerId)}/>}
      {modal?.type==='view' && <PropertyModal space={modal.space} prop={modal.prop} isOwner={modal.prop&&modal.prop.owner===cp.id} player={cp} onClose={()=>setModal(null)} onBuild={modal.prop&&modal.prop.owner===cp.id&&phase==='landed'&&modal.space.id===cp.position?()=>handleBuild(modal.space.id,cp.id):null}/>}
      {modal?.type==='shop' && <ShopModal player={cp} onBuy={(it)=>handleBuyItem(it,cp.id)} onClose={()=>setModal(null)}/>}
      {modal?.type==='stock' && <StockModal player={cp} stocks={stocks} onBuy={(id)=>handleBuyStock(id,cp.id)} onSell={(id)=>handleSellStock(id,cp.id)} onClose={()=>setModal(null)}/>}
      {modal?.type==='minigame' && <MiniGameModal onFinish={(rw)=>{updatePlayer(cp.id,prev=>({money:prev.money+rw}));addLog(`🏆 ${cp.name} 小遊戲獲得 ${fmt(rw)} ✦`);say(`小遊戲獎勵 ${fmt(rw)} ✦！`,'REWARD');setModal(null);}}/>}
      {modal?.type==='playerDetail' && <PlayerDetailModal player={modal.player} properties={properties} onClose={()=>setModal(null)} onUseItem={modal.player.id===cp.id&&phase!=='moving'?((idx,itemId)=>handleUseItem(currentTurn,idx,itemId)):null}/>}
      {modal?.type==='auction' && <AuctionModal space={modal.space} player={cp} onBid={(price)=>{updatePlayer(cp.id,prev=>({money:prev.money-price}));setProperties(prev=>({...prev,[modal.space.id]:{owner:cp.id,level:0}}));addLog(`🔔 ${cp.name} 以 ${fmt(price)} ✦ 競標到 ${modal.space.name}`);say(`競標成功：${modal.space.name}！`,'WON');setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==='teleport' && <TeleportModal onPick={(i)=>{updatePlayer(modal.playerId,{position:i});setModal(null);setTimeout(()=>handleLanding(modal.playerId),300);}} onClose={()=>setModal(null)}/>}
    </div>
  );
}

// ---------------- VICTORY ----------------
function Victory({players,round,getNetWorth}){
  const ranked=[...players].sort((a,b)=>getNetWorth(b)-getNetWorth(a));
  const champ=ranked[0];const ch=CHARACTERS[champ.charId];const top=getNetWorth(champ)||1;
  return (
    <div className="shell void-bg" style={{display:'flex',padding:0}}>
      <div style={{position:'absolute',inset:0}}>
        <img src={ch.hero} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 30%',opacity:.5}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(8,5,18,.94) 30%,rgba(8,5,18,.55) 58%,rgba(8,5,18,.9)),radial-gradient(80% 70% at 30% 120%,rgba(244,217,133,.12),transparent 60%)'}}></div>
      </div>
      <div style={{position:'relative',zIndex:3,flex:'0 0 46%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:30,textAlign:'center'}}>
        <div style={{fontSize:38,filter:'drop-shadow(0 4px 10px rgba(244,217,133,.6))',marginBottom:-4}}>👑</div>
        <div className="eyebrow">Victor&nbsp;of&nbsp;Ilumiya</div>
        <div className="title-zh" style={{fontFamily:'var(--serif)',fontWeight:900,fontSize:46,lineHeight:1,marginTop:5}}>王國的勝者</div>
        <div style={{position:'relative',margin:'16px 0 0',width:'min(240px,46vw)',aspectRatio:'1',display:'grid',placeItems:'center'}}>
          <div style={{position:'absolute',width:'100%',height:'100%',borderRadius:'50%',background:`radial-gradient(circle,var(${ch.v}),transparent 62%)`,opacity:.4,zIndex:-1}}></div>
          <img src={ch.img} alt="" style={{width:'90%',height:'90%',objectFit:'contain',filter:`drop-shadow(0 24px 26px rgba(0,0,0,.7)) drop-shadow(0 0 46px var(${ch.v}))`}}/>
        </div>
        <div style={{fontFamily:'var(--serif)',fontWeight:900,fontSize:30,marginTop:4}}>{champ.name}</div>
        <div style={{fontSize:13,color:'var(--ink-dim)',marginTop:2}}>{ch.name} · {ch.desc}</div>
        <div style={{marginTop:14}}><div style={{fontFamily:'var(--display)',fontSize:10,letterSpacing:'.3em',color:'var(--gold-3)'}}>TOTAL&nbsp;NET&nbsp;WORTH</div>
          <div className="title-zh" style={{fontFamily:'var(--display)',fontWeight:700,fontSize:42,marginTop:2}}>{fmt(getNetWorth(champ))} ✦</div></div>
      </div>
      <div style={{position:'relative',zIndex:3,flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'40px 44px',gap:11,overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:4}}><span className="eyebrow" style={{whiteSpace:'nowrap'}}>Final&nbsp;Standings&nbsp;·&nbsp;第&nbsp;{round}&nbsp;回合落幕</span><hr className="rule-gold" style={{flex:1}}/></div>
        {ranked.map((p,i)=>{const c=CHARACTERS[p.charId];const w=getNetWorth(p);const medal=['🥇','🥈','🥉'][i]||String(i+1);
          return (
            <div key={p.id} className={'rrow panel'+(i===0?' r1':'')+(p.bankrupt?' bankrupt':'')} style={{'--pc':`var(${c.v})`,display:'flex',alignItems:'center',gap:14,padding:'13px 17px',position:'relative',overflow:'hidden'}}>
              <span style={{fontFamily:'var(--display)',fontWeight:700,fontSize:i<3?24:20,width:36,textAlign:'center',color:i<3?'inherit':'var(--ink-dim)'}}>{medal}</span>
              <img src={c.img} alt="" style={{width:52,height:52,objectFit:'contain',borderRadius:'50%',border:`2px solid var(${c.v})`,background:'rgba(12,8,26,.6)',flex:'0 0 auto'}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'var(--serif)',fontWeight:900,fontSize:19}}>{p.name}{p.bankrupt&&<span style={{fontSize:11,color:'var(--loss)'}}> · 破產</span>}</div>
                <div style={{fontSize:11,color:'var(--ink-dim)',marginTop:1}}>{c.name}</div>
                <div style={{height:5,borderRadius:3,marginTop:7,width:`${Math.max(8,Math.round(w/top*100))}%`,background:`linear-gradient(90deg,var(${c.v}),transparent)`}}></div>
              </div>
              <div style={{textAlign:'right',flex:'0 0 auto'}}><div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:22,color:p.bankrupt?'var(--ink-faint)':'var(--gold-2)'}}>{fmt(w)} ✦</div></div>
            </div>
          );})}
        <div style={{display:'flex',gap:12,marginTop:12}}>
          <button className="btn btn-gold" style={{flex:1}} onClick={()=>window.location.reload()}>再戰一場 ⚔</button>
        </div>
      </div>
    </div>
  );
}

function App(){
  const [started,setStarted]=useState(false);
  const [ip,setIp]=useState(null);
  if(!started) return <SetupScreen onStart={(p)=>{setIp(p);setStarted(true);}}/>;
  return <Game initialPlayers={ip}/>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
