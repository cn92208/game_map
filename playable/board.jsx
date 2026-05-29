// ============================================================
// ILUMIYA · 奇幻大富翁 — Board / Tile / Dice / presentational
// ============================================================
const {useRef:_useRef} = React;

function Coin({size}){
  return <span className="coin" style={size?{fontSize:size}:null}></span>;
}

const PIP={1:[[50,50]],2:[[28,28],[72,72]],3:[[26,26],[50,50],[74,74]],
  4:[[28,28],[72,28],[28,72],[72,72]],5:[[26,26],[74,26],[50,50],[26,74],[74,74]],
  6:[[28,24],[72,24],[28,50],[72,50],[28,76],[72,76]]};
function Dice({value,rolling,small}){
  return (
    <div className={'die'+(small?' sm':'')+(rolling?' rolling':'')}>
      {(PIP[value]||[]).map((p,i)=>(
        <i key={i} style={{left:p[0]+'%',top:p[1]+'%'}}></i>
      ))}
    </div>
  );
}

function Tile({sp,idx,prop,players,currentTurn,movingId,flashId,onClick}){
  const here=players.filter(p=>p.position===idx&&!p.bankrupt);
  const art=tileArt(sp);
  const region=sp.group?REGIONS[sp.group]:null;
  const owner=prop?players.find(p=>p.id===prop.owner):null;
  const ownerColor=owner?CHARACTERS[owner.charId].v:null;
  const cls=['tile'];
  if(sp.type==='start'||sp.type==='prison'||idx===20||idx===30) cls.push('corner');
  if(!art) cls.push('medallion');
  if(prop) cls.push('owned');
  if(idx===flashId) cls.push('flash');
  const style={gridColumn:gpos(idx).c,gridRow:gpos(idx).r};
  if(ownerColor) style['--own']=`var(${ownerColor})`;
  return (
    <div className={cls.join(' ')} style={style} onClick={onClick} title={sp.name}>
      {art
        ? <><img className="art" src={art} alt=""/><div className="veil"></div>
            {region && <span className="top-bar" style={{background:`var(${region.v})`}}></span>}</>
        : <div className="glyph">{sp.emoji}</div>}
      {prop && <span className="owner-gem" style={{background:`var(${ownerColor})`}}></span>}
      {prop && prop.level>0 && <div className="pips">{Array(prop.level).fill(0).map((_,i)=><i key={i}></i>)}</div>}
      {art && <div className="label">{sp.name}{sp.price?<span className="price">{fmt(sp.price)} ✦</span>:null}</div>}
      {here.length>0 && (
        <div className="tokens">
          {here.map(p=>{
            const ch=CHARACTERS[p.charId];
            const moving=p.id===movingId;
            return <img key={p.id} src={ch.img} alt=""
              className={(p.id===currentTurn?'active ':'')+(moving?'hop':'')}/>;
          })}
        </div>
      )}
    </div>
  );
}

function Board({mobile,players,currentTurn,properties,movingId,flashId,size,onTileClick}){
  return (
    <div className="board" style={size?{width:size,height:size}:null}>
      <div className="map">
        <img src="images/background_map.png" alt="Ilumiya"/>
        <div className="map-veil"></div>
        <div className="crest">
          <div className="ring"><h1 className="title-zh">{mobile?<>伊路<br/>米雅</>:<>奇幻<br/>大富翁</>}</h1></div>
          <div className="sub eyebrow">{mobile?'ILUMIYA':'CONTINENT\u00A0OF\u00A0ILUMIYA'}</div>
        </div>
      </div>
      {BOARD_SPACES.map((sp,idx)=>(
        <Tile key={idx} sp={sp} idx={idx} prop={properties[idx]}
          players={players} currentTurn={currentTurn} movingId={movingId} flashId={flashId}
          onClick={()=>onTileClick&&onTileClick(idx)}/>
      ))}
    </div>
  );
}

Object.assign(window,{Coin,Dice,Tile,Board});
