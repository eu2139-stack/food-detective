const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

const CASES = [
 {id:'case1',number:'案件 01',title:'深夜的爆肝宵夜場',description:'深夜宵夜看似方便，卻可能藏著高鈉與隱形脂肪。找出最能說明風險的食品與線索。',tags:['高鈉','隱形脂肪'],acceptable:['foodB','foodF','foodI','foodH'],topics:['sodium','fat']},
 {id:'case2',number:'案件 02',title:'午後的少女手搖派對',description:'甜甜的飲料與點心讓人心情愉快，但添加糖可能不知不覺累積。',tags:['添加糖','液體糖'],acceptable:['foodA','foodC','foodG','foodE'],topics:['sugar']},
 {id:'case3',number:'案件 03',title:'便利商店的健身健康餐？',description:'「健康」字眼不代表所有營養數值都理想，別忘記確認鈉含量與整包份數。',tags:['高鈉','份數陷阱'],acceptable:['foodD','foodI','foodB','foodF'],topics:['sodium','servings']},
 {id:'case4',number:'案件 04',title:'追劇必備的追劇零食包',description:'酥脆口感可能伴隨飽和脂肪或反式脂肪，別只看包裝正面。',tags:['反式脂肪','飽和脂肪'],acceptable:['foodH','foodE','foodF','foodD'],topics:['fat']}
];
const FOODS=[
 {id:'foodA',type:'food',title:'食品 A｜特調黑糖珍珠鮮奶',summary:'總糖量 65 g／500 mL。',topics:['sugar'],detail:'一杯總糖量 65 g，飲用前可留意整杯容量與糖量。'},
 {id:'foodB',type:'food',title:'食品 B｜濃郁起司麻辣泡麵',summary:'鈉含量 1,950 mg／包。',topics:['sodium'],detail:'單包鈉含量 1,950 mg，接近成人每日建議上限 2,400 mg。'},
 {id:'foodC',type:'food',title:'食品 C｜標榜「無糖」濃縮果汁飲料',summary:'情境標示：濃縮果汁糖 25 g，成分含果糖。',topics:['sugar'],detail:'「無糖」有法規定義；須核對營養標示、糖含量與成分，果汁中的糖不一定等同添加糖。'},
 {id:'foodD',type:'food',title:'食品 D｜全麥健康夾心餅乾',summary:'每份 20 g：100 大卡、脂肪 5 g；全包 10 份。',topics:['servings','fat'],detail:'若吃完整包，總量約 1,000 大卡、脂肪 50 g。'},
 {id:'foodE',type:'food',title:'食品 E｜精選高纖燕麥棒',summary:'脂肪 8 g（飽和脂肪 6 g），添加糖 18 g。',topics:['fat','sugar'],detail:'高纖不代表糖或飽和脂肪一定低，需一起判讀。'},
 {id:'foodF',type:'food',title:'食品 F｜卡滋香酥炸雞排',summary:'飽和脂肪 12 g；鈉 850 mg。',topics:['fat','sodium'],detail:'油炸食品可能含較多脂肪，調味也會增加鈉攝取。'},
 {id:'foodG',type:'food',title:'食品 G｜低脂零脂肪優格',summary:'脂肪 0 g；添加糖 28 g。',topics:['sugar'],detail:'低脂不代表低糖，應查看添加糖與每份食用量。'},
 {id:'foodH',type:'food',title:'食品 H｜美式雙脆薯條',summary:'反式脂肪 0.5 g；鈉 600 mg。',topics:['fat','sodium'],detail:'留意反式脂肪與鈉含量；營養標示的四捨五入與標示規範也值得注意。'},
 {id:'foodI',type:'food',title:'食品 I｜增肌蛋白餐',summary:'脂肪 16.4 g；鈉 937 mg。',topics:['sodium','fat'],detail:'「增肌」名稱不代表適合所有人，仍要查看整份餐點營養數據。'}
];
const CLUES=[
 {id:'clue1',type:'clue',title:'隱形糖陷阱',summary:'微糖或濃縮果汁不等於沒有糖。',topics:['sugar'],detail:'看總糖、添加糖與成分表，並確認實際飲用份量。'},
 {id:'clue2',type:'clue',title:'每日糖上限',summary:'添加糖宜低於每日總熱量 10%。',topics:['sugar'],detail:'以每日 2,000 大卡為例，10% 約為 50 g 糖；個人需求可能不同。'},
 {id:'clue3',type:'clue',title:'液體糖危害',summary:'含糖飲料容易快速攝取較多糖與熱量。',topics:['sugar'],detail:'液體飽足感可能較低，常喝含糖飲料容易增加總熱量攝取。'},
 {id:'clue4',type:'clue',title:'名不符實',summary:'低脂食品也可能添加較多糖。',topics:['sugar','fat'],detail:'不要只看「低脂」等宣稱，請同時比較糖、脂肪與總熱量。'},
 {id:'clue5',type:'clue',title:'高鈉警戒線',summary:'成人每日鈉攝取上限常以 2,400 mg 為參考。',topics:['sodium'],detail:'一包高鈉泡麵就可能占掉大部分每日鈉上限。'},
 {id:'clue6',type:'clue',title:'隱形鈉離子',summary:'醬汁、起司與加工食品可能含較多鈉。',topics:['sodium'],detail:'味道不特別鹹，也不代表鈉含量低。'},
 {id:'clue7',type:'clue',title:'水分滯留與血壓',summary:'長期高鈉飲食可能增加血壓相關風險。',topics:['sodium'],detail:'鈉會影響體液平衡，長期攝取過多可能增加高血壓風險。'},
 {id:'clue8',type:'clue',title:'份數魔術',summary:'確認標示是每份、每 100 g 還是整包。',topics:['servings','sodium'],detail:'每份數值要乘上實際吃下的份數，才是總攝取量。'},
 {id:'clue9',type:'clue',title:'飽和脂肪危機',summary:'攝取過多飽和脂肪可能提高 LDL 膽固醇。',topics:['fat'],detail:'可用不飽和脂肪來源取代部分飽和脂肪。'},
 {id:'clue10',type:'clue',title:'反式脂肪陷阱',summary:'部分氫化油可能含反式脂肪；標示需正確解讀。',topics:['fat'],detail:'閱讀成分與營養標示，避免經常食用含工業反式脂肪的食品。'},
 {id:'clue11',type:'clue',title:'偽裝健康油',summary:'酥脆加工食品可能伴隨較高油脂。',topics:['fat'],detail:'口感與包裝宣稱不能取代營養標示判讀。'},
 {id:'clue12',type:'clue',title:'熱量密度高',summary:'1 g 脂肪約提供 9 大卡。',topics:['fat'],detail:'脂肪每克提供的熱量高於碳水化合物與蛋白質（各約 4 大卡）。'}
];
const ALL=[...FOODS,...CLUES];
const rooms=new Map();
const shuffled=a=>[...a].sort(()=>Math.random()-.5);
const code=()=>crypto.randomBytes(3).toString('hex').toUpperCase();
const safeCard=c=>({id:c.id,type:c.type,title:c.title,summary:c.summary});
function pubState(room,pid){
 const p=room.players.find(x=>x.id===pid);
 return {code:room.code,status:room.status,players:room.players.map(x=>({id:x.id,name:x.name,score:x.score})),currentPlayerId:room.currentPlayerId,currentCase:room.cases[room.caseIndex]||null,deckCount:room.deck.length,logs:room.logs.slice(-30),myHand:p?(p.hand||[]).map(safeCard):[]};
}
function emitState(room){room.players.forEach(p=>io.to(p.socketId).emit('roomState',pubState(room,p.id)));}
function log(room,text){room.logs.push({text,time:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})});}
function findRoom(code){return rooms.get(String(code||'').toUpperCase())}
function err(cb,message){if(cb)cb({ok:false,error:message})}
function activePlayer(room,pid){return room.players.find(p=>p.id===pid)}
function requireTurn(room,pid,cb){if(room.status!=='playing')return err(cb,'遊戲尚未進行。');if(room.currentPlayerId!==pid)return err(cb,'現在不是你的回合。');const p=activePlayer(room,pid);if(!p)return err(cb,'找不到玩家。');return p}
io.on('connection',socket=>{
 socket.on('createRoom',({name},cb={})=>{if(rooms.size>500){err(cb,'目前房間較多，請稍後再試。');return}let c=code();while(rooms.has(c))c=code();const pid=crypto.randomUUID();const room={code:c,hostId:pid,status:'lobby',players:[{id:pid,name:String(name||'房主').slice(0,16),score:0,hand:[],socketId:socket.id}],cases:[],caseIndex:0,deck:[],discard:[],currentPlayerId:null,drawnThisTurn:false,logs:[]};rooms.set(c,room);socket.join(c);cb({ok:true,code:c,playerId:pid});emitState(room)});
 socket.on('joinRoom',({code:c,name},cb={})=>{const room=findRoom(c);if(!room)return err(cb,'找不到這個房間，請確認代碼。');if(room.status!=='lobby')return err(cb,'遊戲已開始，無法加入。');if(room.players.length>=5)return err(cb,'房間已滿，最多 5 人。');const pid=crypto.randomUUID();room.players.push({id:pid,name:String(name||'偵探').slice(0,16),score:0,hand:[],socketId:socket.id});socket.join(room.code);log(room,`${String(name||'偵探').slice(0,16)} 加入房間。`);cb({ok:true,playerId:pid});emitState(room)});
 socket.on('getRoomState',({code:c,playerId:pid},cb)=>{const r=findRoom(c);if(r){const p=activePlayer(r,pid);if(p)p.socketId=socket.id;socket.join(r.code);emitState(r)}});
 socket.on('startGame',({code:c,playerId:pid},cb)=>{const r=findRoom(c);if(!r)return;if(r.hostId!==pid)return socket.emit('errorMessage','只有房主可以開始遊戲。');if(r.players.length<3)return socket.emit('errorMessage','至少需要 3 位玩家才能開始。');if(r.status!=='lobby')return; r.status='playing';r.cases=shuffled(CASES);r.caseIndex=0;r.deck=shuffled(ALL.map(c=>({...c})));r.discard=[];r.players.forEach(p=>{p.score=0;p.hand=[];for(let i=0;i<4;i++){const c=r.deck.pop();if(c)p.hand.push(c)}});r.currentPlayerId=r.players[0].id;r.drawnThisTurn=false;log(r,'案件開始，第一位偵探開始調查。');emitState(r)});
 socket.on('drawCards',({code:c,playerId:pid},cb)=>{const r=findRoom(c);if(!r)return err(cb,'房間不存在。');const p=requireTurn(r,pid,cb);if(!p)return;if(r.drawnThisTurn)return err(cb,'本回合已經抽過牌。');if(r.deck.length===0){finishIfNeeded(r);return err(cb,'牌堆已用盡。')}for(let i=0;i<2;i++){const card=r.deck.pop();if(card)p.hand.push(card)}r.drawnThisTurn=true;log(r,`${p.name} 抽取 2 張牌。`);emitState(r);if(cb)cb({ok:true})});
 socket.on('exchangeCard',({code:c,playerId:pid,discardId},cb)=>{const r=findRoom(c);if(!r)return err(cb,'房間不存在。');const p=requireTurn(r,pid,cb);if(!p)return;if(!r.drawnThisTurn)return err(cb,'請先抽 2 張牌。');const ix=p.hand.findIndex(x=>x.id===discardId);if(ix<0)return err(cb,'找不到要棄置的卡牌。');r.discard.push(p.hand.splice(ix,1)[0]);const draw=r.deck.pop();if(draw)p.hand.push(draw);r.drawnThisTurn=false;log(r,`${p.name} 交換情報，棄 1 張並補 1 張。`);emitState(r);if(cb)cb({ok:true})});
 socket.on('accuse',({code:c,playerId:pid,foodId,clueIds,explanation},cb)=>{const r=findRoom(c);if(!r)return err(cb,'房間不存在。');const p=requireTurn(r,pid,cb);if(!p)return;if(!r.drawnThisTurn)return err(cb,'請先抽 2 張牌。');if(!Array.isArray(clueIds)||clueIds.length<1||clueIds.length>2)return err(cb,'需選 1–2 張線索卡。');const food=p.hand.find(x=>x.id===foodId&&x.type==='food');const clues=clueIds.map(id=>p.hand.find(x=>x.id===id&&x.type==='clue'));if(!food||clues.some(x=>!x))return err(cb,'請選擇手牌中的 1 張食品卡與 1–2 張線索卡。');const cs=r.cases[r.caseIndex];if(!cs)return err(cb,'目前沒有待破解案件。');
 const topicMatch=food.topics.some(t=>cs.topics.includes(t))&&clues.some(cl=>cl.topics.some(t=>cs.topics.includes(t)));
 const foodMatch=cs.acceptable.includes(food.id);const success=foodMatch&&topicMatch&&String(explanation||'').trim().length>=8;
 const played=[food,...clues];played.forEach(c=>{const i=p.hand.findIndex(h=>h.id===c.id);if(i>=0)p.hand.splice(i,1);r.discard.push(c)});
 if(success){p.score+=3+2+clues.length;log(r,`成功破案！${p.name} 破解「${cs.title}」，獲得 ${3+2+clues.length} 分。說明：${String(explanation).slice(0,120)}`);r.caseIndex++;if(r.caseIndex>=r.cases.length){log(r,'四起案件全數破解，遊戲結束。')}}else{log(r,`${p.name} 指控失敗，素材已棄置。${String(explanation||'').slice(0,100)}`)}
 r.drawnThisTurn=false;if(r.status==='playing'&&r.players.length){const idx=r.players.findIndex(x=>x.id===pid);r.currentPlayerId=r.players[(idx+1)%r.players.length].id}finishIfNeeded(r);emitState(r);if(cb)cb({ok:true,success,message:success?'指控成功！案件破解。':'指控失敗，請重新檢視食品數據與線索。'})});
 socket.on('endTurn',({code:c,playerId:pid},cb)=>{const r=findRoom(c);if(!r)return err(cb,'房間不存在。');const p=requireTurn(r,pid,cb);if(!p)return;if(p.hand.length>6){return err(cb,'手牌超過 6 張，請先使用交換情報或其他行動，並在此版本中避免超過上限。')}r.drawnThisTurn=false;const idx=r.players.findIndex(x=>x.id===pid);r.currentPlayerId=r.players[(idx+1)%r.players.length].id;log(r,`${p.name} 結束回合。`);finishIfNeeded(r);emitState(r);if(cb)cb({ok:true})});
 socket.on('leaveRoom',({code:c,playerId:pid})=>{const r=findRoom(c);if(!r)return;const p=activePlayer(r,pid);if(p){r.players=r.players.filter(x=>x.id!==pid);log(r,`${p.name} 離開房間。`)}socket.leave(r.code);if(r.players.length===0)rooms.delete(r.code);else{if(r.hostId===pid)r.hostId=r.players[0].id;if(r.currentPlayerId===pid&&r.players.length)r.currentPlayerId=r.players[0].id;emitState(r)}});
 socket.on('disconnect',()=>{for(const r of rooms.values()){const p=r.players.find(x=>x.socketId===socket.id);if(p){p.connected=false;log(r,`${p.name} 連線中斷，可重新整理後嘗試恢復。`);emitState(r)}}});
});
function finishIfNeeded(r){if(r.status==='playing'&&(r.caseIndex>=r.cases.length||r.deck.length===0)){r.status='finished';log(r,'案件結束或抽牌堆用盡，開始計算最終健康積分。');for(const p of r.players){const unusedClues=p.hand.filter(c=>c.type==='clue').length;p.score-=unusedClues;}}}
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Food Detective running on http://localhost:${PORT}`));
