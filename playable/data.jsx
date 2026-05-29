// ============================================================
// ILUMIYA · 奇幻大富翁 — Game data (gameplay numbers preserved)
// ============================================================

// region groups (gem colors map to CSS vars)
const REGIONS = {
  enchanted:{name:'魔法森林',v:'--enchanted'},
  shadow:{name:'暗影之域',v:'--shadow'},
  fire:{name:'烈焰之地',v:'--fire'},
  crystal:{name:'水晶洞窟',v:'--crystal'},
  giant:{name:'巨人高原',v:'--giant'},
  frost:{name:'冰霜峽谷',v:'--frost'},
  sacred:{name:'神聖殿堂',v:'--sacred'},
  storm:{name:'暴風之境',v:'--storm'},
  ancient:{name:'上古聖域',v:'--ancient'},
};

// 8 archetypes (faithful to the world lore compendium)
const CHARACTERS = [
  {id:0,name:'元素法師',en:'Elemental Mage',img:'images/q_mage.png',hero:'images/hero_mage.png',v:'--crystal',desc:'操控命運之力'},
  {id:1,name:'聖焰騎士',en:'Holy Flame Paladin',img:'images/q_paladin.png',hero:'images/hero_paladin.png',v:'--fire',desc:'以誓言守護秩序'},
  {id:2,name:'翠林德魯伊',en:'Verdant Druid',img:'images/q_druid.png',hero:'images/hero_druid.png',v:'--enchanted',desc:'聆聽自然的回饋'},
  {id:3,name:'蒸汽工匠',en:'Steam Artificer',img:'images/q_engineer.png',hero:'images/hero_engineer.png',v:'--giant',desc:'以齒輪撐起城邦'},
  {id:4,name:'暗夜霸主',en:'Nightfall Overlord',img:'images/q_overlord.png',hero:'images/hero_overlord.png',v:'--storm',desc:'征服與統御之主'},
  {id:5,name:'星海遊俠',en:'Star Sea Ranger',img:'images/q_ranger.png',hero:'images/hero_ranger.png',v:'--crystal',desc:'箭矢指向命運落點'},
  {id:6,name:'暗影刺客',en:'Shadow Assassin',img:'images/q_assassin.png',hero:'images/hero_assassin.png',v:'--shadow',desc:'我即是黑暗本身'},
  {id:7,name:'混沌術士',en:'Chaos Warlock',img:'images/q_warlock.png',hero:'images/hero_warlock.png',v:'--storm',desc:'唯有混沌永恆'},
];

// per-archetype ability flavor for the select screen
const ARCH = {
  0:{q:'「萬物皆有其根本；掌握根本者，掌握一切。」',ab:[['🎲 元素偏轉','每局三次，可重新擲骰一次'],['🔒 地脈封印','使地塊兩名訪客多付 50% 過路費'],['◆ 四象共鳴','依骰子點數觸發火水土風效果']],weak:'金幣低於 100 時，所有能力減弱'},
  1:{q:'「以光芒驅散黑暗，以誓言守護弱者。」',ab:[['🛡 聖盾壁壘','連續三回合不觸發負面機會牌'],['✦ 神聖光環','聖域系過路費享 75 折優惠'],['⚖ 誓言結界','下一次入獄可免費出獄']],weak:'對混沌系效果的抵抗力較低'},
  2:{q:'「自然不欠任何人，但她會回饋懂得聆聽的心。」',ab:[['🌱 種植利息','森林系領地每回合產生被動收益'],['🦌 動物使者','派遣使者代收遠方租金'],['🍃 自然回饋','經過泉源恢復並獲得補給']],weak:'城市核心地塊收益降低 50%'},
  3:{q:'「給我齒輪與蒸汽，我就能撐起一座城。」',ab:[['🔧 快速建造','建造費用享八折，可連續升級'],['⚙ 自動收益','機械工坊每回合自動產金'],['💥 機關陷阱','在領地佈署陷阱懲罰入侵者']],weak:'魔法系效果對其影響加倍'},
  4:{q:'「跪下，或被征服——這是唯一的選擇。」',ab:[['👑 威壓徵稅','對相鄰玩家額外徵收貢金'],['🦇 暗影軍團','召喚軍團佔領無主地塊'],['☄ 霸主之威','降低全場對手的擲骰上限']],weak:'破產時懲罰加重，財產加速流失'},
  5:{q:'「箭矢所指，便是命運落點。」',ab:[['🎯 精準移動','可微調擲骰結果 ±1 步'],['🌌 星圖導航','傳送至任一已擁有的領地'],['🏹 遠程狙擊','跨格收取一次額外過路費']],weak:'停留同一地塊過久會失去增益'},
  6:{q:'「我不在黑暗中——我就是黑暗本身。」',ab:[['👣 潛行踏步','移動時可略過最多 2 格的過路費'],['📜 影契約','出售免過路費通行證並收費'],['🗡 奪命竊取','一局兩次，奪取領先者 500 金幣']],weak:'在開放廣場類地塊效果減半'},
  7:{q:'「秩序是幻覺，唯有混沌永恆。」',ab:[['🌀 混沌詛咒','使目標地塊規則隨機翻轉'],['🪬 靈魂契約','以金幣交換對手一回合行動權'],['🔮 命運扭曲','將機會與命運牌互相轉換']],weak:'自身亦可能被混沌反噬'},
};

const TOTAL_SPACES = 40;
const BOARD_SPACES = [
  {id:0,type:'start',name:'起始城堡',emoji:'🏰',desc:'經過或停留獲得 2000 金幣'},
  {id:1,type:'property',name:'精靈森林',emoji:'🌿',group:'enchanted',price:600,rent:[30,90,270,400,550],build:500},
  {id:2,type:'chance',name:'機會之門',emoji:'❓',desc:'抽一張機會卡'},
  {id:3,type:'property',name:'矮人礦坑',emoji:'⛏️',group:'enchanted',price:600,rent:[30,90,270,400,550],build:500},
  {id:4,type:'property',name:'荒野草原',emoji:'🌾',group:'enchanted',price:800,rent:[40,120,360,500,650],build:500},
  {id:5,type:'tax',name:'魔法稅',emoji:'💎',desc:'繳納 200 金幣稅金'},
  {id:6,type:'transport',name:'飛龍驛站',emoji:'🐲',price:2000,rent:[250,500,1000,2000]},
  {id:7,type:'property',name:'暗影沼澤',emoji:'🌑',group:'shadow',price:1000,rent:[50,150,450,625,750],build:500},
  {id:8,type:'destiny',name:'命運神殿',emoji:'🔮',desc:'抽一張命運卡'},
  {id:9,type:'property',name:'月光草原',emoji:'🌙',group:'shadow',price:1000,rent:[50,150,450,625,750],build:500},
  {id:10,type:'prison',name:'龍穴',emoji:'🐉',desc:'探訪龍穴（路過無事）'},
  {id:11,type:'curse',name:'詛咒廢墟',emoji:'💀',desc:'觸發詛咒！損失10%財產'},
  {id:12,type:'property',name:'鳳凰塔',emoji:'🗼',group:'fire',price:1400,rent:[70,200,550,750,950],build:1000},
  {id:13,type:'minigame',name:'競技場',emoji:'⚔️',desc:'參加小遊戲贏取獎勵'},
  {id:14,type:'property',name:'天使港灣',emoji:'⚓',group:'fire',price:1400,rent:[70,200,550,750,950],build:1000},
  {id:15,type:'chance',name:'機會之門',emoji:'❓',desc:'抽一張機會卡'},
  {id:16,type:'property',name:'熔岩峽谷',emoji:'🌋',group:'fire',price:1600,rent:[80,240,620,820,1000],build:1000},
  {id:17,type:'stock',name:'股票交易所',emoji:'📈',desc:'買賣奇幻世界股票'},
  {id:18,type:'property',name:'水晶洞穴',emoji:'💎',group:'crystal',price:1800,rent:[90,250,700,875,1050],build:1000},
  {id:19,type:'tavern',name:'冒險者酒館',emoji:'🍺',desc:'休息補給，獲得隨機金幣'},
  {id:20,type:'property',name:'獨角獸牧場',emoji:'🦄',group:'crystal',price:1800,rent:[90,250,700,875,1050],build:1000},
  {id:21,type:'free',name:'魔法泉源',emoji:'⛲',desc:'免費休息，恢復精力'},
  {id:22,type:'property',name:'巨人城堡',emoji:'🏯',group:'giant',price:2200,rent:[110,330,800,975,1150],build:1500},
  {id:23,type:'destiny',name:'命運神殿',emoji:'🔮',desc:'抽一張命運卡'},
  {id:24,type:'property',name:'暗黑森林',emoji:'🌲',group:'giant',price:2200,rent:[110,330,800,975,1150],build:1500},
  {id:25,type:'shop',name:'道具商店',emoji:'🏪',desc:'購買冒險道具'},
  {id:26,type:'auction',name:'拍賣廳',emoji:'🔔',desc:'競標稀有地產！'},
  {id:27,type:'property',name:'冰霜峽谷',emoji:'❄️',group:'frost',price:2600,rent:[130,390,900,1100,1275],build:1500},
  {id:28,type:'transport',name:'飛天掃帚站',emoji:'🧹',price:2000,rent:[250,500,1000,2000]},
  {id:29,type:'property',name:'龍焰烈地',emoji:'🔥',group:'frost',price:2600,rent:[130,390,900,1100,1275],build:1500},
  {id:30,type:'minigame',name:'競技場',emoji:'⚔️',desc:'參加小遊戲贏取獎勵'},
  {id:31,type:'gotoprison',name:'龍捕手',emoji:'🪤',desc:'被捕入龍穴！'},
  {id:32,type:'property',name:'星光神殿',emoji:'⭐',group:'sacred',price:3500,rent:[175,500,1100,1300,1500],build:2000},
  {id:33,type:'chance',name:'機會之門',emoji:'❓',desc:'抽一張機會卡'},
  {id:34,type:'property',name:'魔王城堡',emoji:'👑',group:'sacred',price:4000,rent:[200,600,1400,1700,2000],build:2000},
  {id:35,type:'property',name:'暴風峽谷',emoji:'⚡',group:'storm',price:3200,rent:[160,480,1100,1350,1600],build:2000},
  {id:36,type:'shop',name:'道具商店',emoji:'🏪',desc:'購買冒險道具'},
  {id:37,type:'transport',name:'星際傳送門',emoji:'🌀',price:2000,rent:[250,500,1000,2000]},
  {id:38,type:'property',name:'雷霆高地',emoji:'🌩️',group:'storm',price:3200,rent:[160,480,1100,1350,1600],build:2000},
  {id:39,type:'property',name:'上古龍廟',emoji:'🏛️',group:'ancient',price:5000,rent:[250,750,1750,2100,2500],build:2500},
];

// tile art mapping
const TILE_ART = {property:'images/tile_property.png',transport:'images/tile_railway.png',
  chance:'images/chance_card_back.png',destiny:'images/destiny_card_back.png',start:'images/tile_special.png'};
function tileArt(sp){
  if(sp.type==='property') return 'images/tile_property.png';
  if(sp.type==='transport') return 'images/tile_railway.png';
  if(sp.type==='chance') return 'images/tile_chance.png';
  if(sp.type==='destiny') return 'images/tile_destiny.png';
  if(sp.type==='start') return 'images/tile_special.png';
  return null; // medallion
}

const CHANCE_CARDS = [
  {text:'魔法學院獎學金！獲得 1500 金幣',action:'gain',amount:1500,emoji:'🎓'},
  {text:'你的坐騎被盜！損失 800 金幣',action:'lose',amount:800,emoji:'🐴'},
  {text:'發現古代寶箱！獲得 1000 金幣',action:'gain',amount:1000,emoji:'📦'},
  {text:'前進到起點，獲得 2000 金幣',action:'goto',target:0,emoji:'🏰'},
  {text:'魔法傳送至股票交易所',action:'goto',target:17,emoji:'📈'},
  {text:'幫助村民修復水井，獲得 500 金幣獎勵',action:'gain',amount:500,emoji:'💧'},
  {text:'被魔法風暴吹走！後退 3 步',action:'move',amount:-3,emoji:'🌪️'},
  {text:'獲得免費出龍穴卡！',action:'jailcard',emoji:'🗝️'},
  {text:'贏得鍊金術比賽！獲得 2000 金幣',action:'gain',amount:2000,emoji:'⚗️'},
  {text:'支付盔甲修理費 600 金幣',action:'lose',amount:600,emoji:'🛡️'},
  {text:'魔法瞬移！前進 5 步',action:'move',amount:5,emoji:'✨'},
  {text:'被詛咒了！每棟建築繳納 200 金幣維修費',action:'buildtax',amount:200,emoji:'☠️'},
  {text:'魔法市集開張！獲得 800 金幣',action:'gain',amount:800,emoji:'🛒'},
  {text:'旅行稅！繳納 300 金幣',action:'lose',amount:300,emoji:'🗺️'},
  {text:'黎明守護！獲得護盾保護',action:'shield',emoji:'🌄'},
  {text:'雷霆神力！前進 4 步',action:'move',amount:4,emoji:'⚡'},
];
const DESTINY_CARDS = [
  {text:'龍族祝福！所有玩家各給你 300 金幣',action:'collect',amount:300,emoji:'🐉'},
  {text:'魔王詛咒！被送入龍穴',action:'gotoprison',emoji:'🪤'},
  {text:'找到傳說神器！獲得 3000 金幣',action:'gain',amount:3000,emoji:'🗡️'},
  {text:'治療瘟疫！支付 1500 金幣',action:'lose',amount:1500,emoji:'💊'},
  {text:'精靈女王賜福！獲得 800 金幣',action:'gain',amount:800,emoji:'👸'},
  {text:'地精偷走了你的金幣！損失 500 金幣',action:'lose',amount:500,emoji:'👺'},
  {text:'魔法風暴！傳送到魔法泉源',action:'goto',target:21,emoji:'⛲'},
  {text:'獲得免費出龍穴卡！',action:'jailcard',emoji:'🗝️'},
  {text:'王國慶典！獲得 1200 金幣',action:'gain',amount:1200,emoji:'🎉'},
  {text:'黑市交易被查獲！罰款 1000 金幣',action:'lose',amount:1000,emoji:'🚔'},
  {text:'星座守護！下一次不用付租金',action:'shield',emoji:'🌟'},
  {text:'命運輪盤！與最富有的玩家交換金幣',action:'swaprichest',emoji:'🎰'},
  {text:'上古遺跡發現！獲得 2500 金幣',action:'gain',amount:2500,emoji:'🏛️'},
  {text:'命運大逆轉！與金幣最少的玩家交換金幣',action:'swappropest',emoji:'🔄'},
  {text:'神龍試煉！支付 2000 金幣',action:'lose',amount:2000,emoji:'🐲'},
  {text:'傳送至拍賣廳！',action:'goto',target:26,emoji:'🔔'},
];
const ITEMS = [
  {id:'shield',name:'魔法護盾',emoji:'🛡️',price:500,desc:'使用後免付一次租金',uses:1},
  {id:'teleport',name:'傳送卷軸',emoji:'📜',price:800,desc:'傳送到任意格子',uses:1},
  {id:'doubleDice',name:'幸運骰子',emoji:'🎲',price:600,desc:'下次擲骰可擲兩次取大',uses:1},
  {id:'steal',name:'盜賊藥水',emoji:'🧪',price:1000,desc:'偷取一位玩家 500 金幣',uses:1},
  {id:'discount',name:'商人證書',emoji:'📋',price:700,desc:'購買房產打八折',uses:1},
  {id:'doubleRent',name:'收租符咒',emoji:'💰',price:1200,desc:'下次收租翻倍',uses:1},
];
const STOCKS = [
  {id:'dragon',name:'龍族礦業',emoji:'🐉',basePrice:500,volatility:0.3},
  {id:'elf',name:'精靈草藥',emoji:'🧝',basePrice:300,volatility:0.2},
  {id:'dwarf',name:'矮人鍛造',emoji:'⛏️',basePrice:400,volatility:0.25},
  {id:'phoenix',name:'鳳凰保險',emoji:'🔥',basePrice:600,volatility:0.15},
];

const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const rollDie=()=>rand(1,6);
const fmt=(n)=>Math.round(n).toLocaleString();
const gpos=(i)=>{ // 11x11 perimeter -> grid {c,r} (1-indexed)
  if(i<=10) return {c:i+1,r:1};
  if(i<=20) return {c:11,r:i-10+1};
  if(i<=30) return {c:30-i+1,r:11};
  return {c:1,r:40-i+1};
};

Object.assign(window,{REGIONS,CHARACTERS,ARCH,TOTAL_SPACES,BOARD_SPACES,tileArt,
  CHANCE_CARDS,DESTINY_CARDS,ITEMS,STOCKS,rand,rollDie,fmt,gpos});
