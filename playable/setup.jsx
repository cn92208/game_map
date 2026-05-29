// ============================================================
// ILUMIYA · 奇幻大富翁 — Setup / cinematic character select
// ============================================================
const {useState:_sS} = React;

function SetupScreen({onStart}){
  const [players,setPlayers]=_sS([
    {name:'玩家一',charId:0},{name:'玩家二',charId:1},{name:'玩家三',charId:2},
  ]);
  const [active,setActive]=_sS(0);
  const [preview,setPreview]=_sS(0);

  const takenBy={}; // charId -> player index
  players.forEach((p,i)=>{takenBy[p.charId]=i});

  const pickChar=(id)=>{
    setPreview(id);
    if(takenBy[id]!==undefined && takenBy[id]!==active) return; // taken by someone else
    setPlayers(ps=>ps.map((p,i)=>i===active?{...p,charId:id}:p));
  };
  const setName=(i,v)=>setPlayers(ps=>ps.map((p,j)=>j===i?{...p,name:v.slice(0,8)}:p));
  const addPlayer=()=>{
    if(players.length>=8) return;
    const used=new Set(players.map(p=>p.charId));
    const free=CHARACTERS.find(c=>!used.has(c.id));
    const ni=players.length;
    setPlayers(ps=>[...ps,{name:`玩家${'一二三四五六七八'[ni]||ni+1}`,charId:free?free.id:0}]);
    setActive(ni);
    if(free) setPreview(free.id);
  };
  const removePlayer=(i,e)=>{
    e.stopPropagation();
    if(players.length<=2) return;
    setPlayers(ps=>ps.filter((_,j)=>j!==i));
    setActive(a=>Math.min(a,players.length-2));
  };

  const pc=CHARACTERS[preview];
  const arch=ARCH[preview];

  return (
    <div className="setup void-bg">
      <div className="stage">
        <img className="hero" src={pc.hero} alt=""/>
        <div className="veil"></div>
        <div className="topfade"></div>
      </div>

      {/* roster */}
      <div className="roster">
        <div className="brand">
          <div className="eyebrow">Fantasy&nbsp;Monopoly&nbsp;·&nbsp;Ilumiya</div>
          <h1 className="title-zh">選擇你的<br/>英雄</h1>
          <div className="tag">Choose&nbsp;Your&nbsp;Champion</div>
        </div>
        <div className="pick-h"><span className="eyebrow">Eight&nbsp;Archetypes</span><hr className="rule-gold"/></div>
        <div className="list">
          {CHARACTERS.map(c=>{
            const owner=takenBy[c.id];
            const takenByOther=owner!==undefined && owner!==active;
            return (
              <div key={c.id}
                className={'row'+(c.id===preview?' preview':'')+(takenByOther?' taken':'')}
                onMouseEnter={()=>setPreview(c.id)} onClick={()=>pickChar(c.id)}>
                <img className="tk" src={c.img} alt=""/>
                <div className="meta"><div className="zh">{c.name}</div><div className="en">{c.en}</div></div>
                {takenByOther
                  ? <span className="takenby">{players[owner].name}</span>
                  : <span className="spec">{owner===active?'✓ 你的選擇':c.desc}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* focus */}
      <div className="focus">
        <div className="ped"></div>
        <div className="big-token">
          <div className="halo" style={{background:`radial-gradient(circle,var(${pc.v}),transparent 62%)`,opacity:.34}}></div>
          <img src={pc.img} alt="" style={{filter:`drop-shadow(0 26px 30px rgba(0,0,0,.7)) drop-shadow(0 0 40px var(${pc.v}))`}}/>
        </div>
        <div className="detail">
          <div className="name-row"><h2>{pc.name}</h2><div className="en2">{pc.en}</div></div>
          <div className="quote">{arch.q}</div>
          <div className="ability-grid">
            {arch.ab.map((a,i)=>(
              <div className="ab panel flourish" key={i}><div className="ah">{a[0]}</div><div className="ad">{a[1]}</div></div>
            ))}
            <div className="ab panel" style={{flex:.9}}><div className="ah weak">⚠ 致命弱點</div><div className="ad">{arch.weak}</div></div>
          </div>

          <div className="slots">
            <div className="slots-label">出戰隊伍 · {players.length} 位英雄（點擊頭像可換角）</div>
            {players.map((p,i)=>{
              const ch=CHARACTERS[p.charId];
              return (
                <div key={i} className={'slot'+(i===active?' active':'')} style={{'--sc':`var(${ch.v})`}} onClick={()=>{setActive(i);setPreview(p.charId);}}>
                  <img src={ch.img} alt=""/>
                  <input value={p.name} onChange={e=>setName(i,e.target.value)} onClick={e=>e.stopPropagation()}/>
                  {players.length>2 && <span className="rm" onClick={(e)=>removePlayer(i,e)}>✕</span>}
                </div>
              );
            })}
            {players.length<8 && <div className="slot add" onClick={addPlayer}>＋</div>}
          </div>

          <div className="startbar">
            <span className="hint">點選名冊指派角色給目前隊伍中高亮的英雄席位</span>
            <button className="btn btn-gold" onClick={()=>onStart(players)}>開始冒險 ⚔</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window,{SetupScreen});
