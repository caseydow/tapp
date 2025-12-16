import { useState, useEffect, useRef } from 'react';
import PubNub from 'pubnub';
import { v4 as uuidv4 } from 'uuid';
import { GameState, Player, Card } from '../game/Core';
import { TYPES, RARTS } from '../constants';

const getUUID = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        let id = window.sessionStorage.getItem('tapp_uuid');
        if (!id) {
            id = uuidv4();
            window.sessionStorage.setItem('tapp_uuid', id);
        }
        return id;
    }
    return uuidv4();
};

const myUUID = getUUID();

const pubnub = new PubNub({
  publishKey: "pub-c-6d5bcb69-9b5e-4028-8d71-16d663175bc2",
  subscribeKey: "sub-c-0253bc9a-906b-11ec-918e-02d5075437d9",
  uuid: myUUID
});

export const useGameEngine = () => {
  const [renderTrigger, setRenderTrigger] = useState(0); 
  const [gameId, setGameId] = useState(null);
  const [viewState, setViewState] = useState('MENU'); 
  
  const gameRef = useRef(new GameState(() => setRenderTrigger(t => t + 1)));

  useEffect(() => {
    const listener = {
      message: (event) => {
        const msg = event.message;

        if (typeof msg !== 'string') return;

        if (msg.startsWith("TP")) {
           if (msg.startsWith("TP-JL")) return; 
           if (gameRef.current.deck.length === 0) {
              setUpGame(msg.slice(2));
           }
        } else if (msg.startsWith("Join")) {
           const parts = msg.slice(4).split(";");
           const idx = parseInt(parts[0]);
           const uuid = parts[1]?.trim();
           
           if (gameRef.current.players[idx]) {
             gameRef.current.players[idx].online = true;
             gameRef.current.players[idx].joined = true; 
             gameRef.current.players[idx].uuid = uuid;
             
             const count = gameRef.current.players.filter(p => p.online).length;
             gameRef.current.log(`Player ${idx+1} joined the game. (${count}/${gameRef.current.players.length})`);
             
             if (uuid === myUUID) {
                gameRef.current.hand = idx;
                if (gameRef.current.players[idx].ingame) {
                    setViewState('GAME');
                } else {
                    setViewState('LOBBY');
                }
             }
           }
        } else if (msg.startsWith("User")) {
             gameRef.current.processMessage(msg);
             const data = msg.slice(4).split(";");
             const pIdx = parseInt(data[0]);
             if (pIdx === gameRef.current.hand) {
                 setViewState('GAME');
             }
        } else if (msg.startsWith("Leve")) {
            const uuid = msg.slice(4);
            const p = gameRef.current.players.find(pl => pl.uuid === uuid);
            if (p) {
                p.online = false;
                p.uuid = null;
                const count = gameRef.current.players.filter(pl => pl.online).length;
                gameRef.current.log(`${p.name} left the game. (${count}/${gameRef.current.players.length})`);
            }
        } else {
           gameRef.current.processMessage(msg);
        }
      },
      presence: (event) => {
        if (event.action === "leave" && event.subscribedChannel.includes("-JL")) {
           const id = gameRef.current.gameId;
           if(id) {
               pubnub.publish({
                   channel: "TP-JL" + id,
                   message: "Leve" + event.uuid
               }, (status) => {
                   if (status.error) console.log(status);
               });
           }
        }
      }
    };

    pubnub.addListener(listener);
    return () => { pubnub.removeListener(listener); };
  }, []);

  const setUpGame = (dataStr) => {
     try {
       const parts = dataStr.split(";;");
       const cardList = parts[0].split(";").filter(x => x).map(x => x.split(","));
       let playerCount = parts[1] ? parseInt(parts[1].trim()) : 2; 

       const newState = gameRef.current;
       newState.players = [];
       for(let i=0; i<playerCount; i++) {
          newState.players.push(new Player(i, `Player ${i+1}`));
       }
       
       newState.deck = [];
       cardList.forEach(c => {
           if(c[0] && c[1]) newState.deck.push(new Card(c[0], c[1]));
       });
       
       newState.played = [[], []];
       for(let i=0; i<3; i++) {
           if(newState.deck.length > 0) {
               const c = newState.deck.pop();
               c.image.src = `${process.env.PUBLIC_URL}/images/tapp/${c.card[0]}${c.card[1]}.webp`;
               newState.played[1].push(c);
           }
       }
       
       for (let i = 0; i < newState.players.length; i++) {
          for (let n = 0; n < 5; n++) {
            if (newState.deck.length > 0) {
                let card = newState.deck.pop();
                card.grab(i, newState); 
                newState.players[i].hand.push(card);
            }
          }
       }

       setRenderTrigger(t => t+1);
     } catch (err) { console.error(err); }
  };

  const checkHistory = async (channel, id) => {
      try {
          const history = await pubnub.history({
              channel: channel,
              count: 100,
              reverse: true 
          });
          
          const msgs = history.messages;

          for (let i = 0; i < msgs.length; i++) {
              const entry = msgs[i].entry;
              if (entry.startsWith("TP") && !entry.startsWith("TP-JL")) {
                  if (gameRef.current.deck.length === 0) {
                      setUpGame(entry.slice(2));
                  }
              }
          }

          for (let i = 0; i < msgs.length; i++) {
              const entry = msgs[i].entry;
              if (entry.startsWith("Join")) {
                  const parts = entry.slice(4).split(";");
                  const idx = parseInt(parts[0]);
                  const uuid = parts[1]?.trim();
                  if (gameRef.current.players[idx]) {
                      const p = gameRef.current.players[idx];
                      p.online = true;
                      p.joined = true;
                      p.uuid = uuid;

                      const count = gameRef.current.players.filter(pl => pl.online).length;
                      gameRef.current.log(`Player ${idx + 1} joined the game. (${count}/${gameRef.current.players.length})`);
                  }
              } else if (entry.startsWith("Leve")) {
                  const uuid = entry.slice(4);
                  const p = gameRef.current.players.find(pl => pl.uuid === uuid);
                  if (p) {
                      p.online = false;
                      p.uuid = null;
                      
                      const count = gameRef.current.players.filter(pl => pl.online).length;
                      gameRef.current.log(`${p.name} left the game. (${count}/${gameRef.current.players.length})`);
                  }
              } else if (entry.startsWith("User")) {
                  gameRef.current.processMessage(entry);
              }
          }

          let hand = -1;
          const players = gameRef.current.players;

          for (let i = 0; i < players.length; i++) {
             if (players[i].uuid === myUUID) {
                 hand = i;
                 break;
             }
          }

          if (hand === -1) {
              hand = 0;
              for (let i = 0; i < players.length; i++) {
                 if (players[i].joined) hand++;
              }
              
              if (hand === players.length) {
                  hand = -1;
                  for (let i = 0; i < players.length; i++) {
                      if (!players[i].online) {
                          hand = i;
                          break;
                      }
                  }
                  if (hand === -1) {
                      alert("Game is full!");
                      return;
                  }
              }
          }

          await pubnub.history({ channel: "TP" + id, count: 100, reverse: true }).then(h => {
               h.messages.forEach(m => gameRef.current.processMessage(m.entry));
          });

          setRenderTrigger(t => t + 1);

          pubnub.publish({
              channel: "TP-JL" + id,
              message: `Join${hand};${myUUID}`
          });

      } catch (err) {
          console.error("History fetch failed", err);
      }
  };

  const joinGame = (id) => {
    setGameId(id);
    gameRef.current.gameId = id;
    pubnub.subscribe({ channels: ["TP"+id, "TP-JL"+id], withPresence: true });
    checkHistory("TP-JL"+id, id);
  };

  const createGame = (numPlayers, incantations) => {
     const newId = Math.floor(Math.random() * 8999 + 1000);
     setGameId(newId);
     gameRef.current.gameId = newId;

     let cardStrings = [];
     TYPES.forEach(t => {
        RARTS.forEach(r => {
           const count = parseInt(r.slice(0,1));
           const type = r.slice(1);
           for(let k=0; k<count; k++) cardStrings.push(`${t},${type}`);
        });
     });
     if(incantations) { cardStrings.push("J,J1"); cardStrings.push("J,J1"); }

     cardStrings.sort(() => Math.random() - 0.5);
     const deckStr = cardStrings.join(";");
     const initMsg = `TP${deckStr};;${numPlayers}`;
     
     setUpGame(initMsg.slice(2)); 
     
     pubnub.subscribe({ channels: ["TP"+newId, "TP-JL"+newId] });
     
     setTimeout(() => {
        pubnub.publish({ channel: "TP-JL"+newId, message: initMsg });
       checkHistory("TP-JL"+newId, newId);
     }, 500);
  };

  const sendAction = (msg) => {
      if(gameId) pubnub.publish({ channel: "TP"+gameId, message: msg });
  };

  return {
      gameState: viewState,
      gameStateObj: gameRef.current,
      gameId,
      players: gameRef.current.players,
      myHandIndex: gameRef.current.hand,
      logMessages: gameRef.current.logs.map((l,i) => ({ raw: l, key:i })),
      joinGame,
      createGame,
      sendAction
  };
};