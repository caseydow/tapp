import React, { useRef, useEffect } from 'react';
import { COLORS, COLORS_DARK, TOKEN_COLORS, TOKEN_NAMES } from '../constants';
import { Card } from '../game/Core'; 

const GameCanvas = ({ gameStateObj, myHandIndex, sendAction }) => {
  const canvasRef = useRef(null);

  // --- Drawing Helpers ---
  const drawRect = (ctx, x, y, across, up, color="#ffffff") => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x - across / 2, y - up / 2, across, up);
    ctx.fillStyle = color;
    ctx.fillRect(x - across / 2 + 3, y - up / 2 + 3, across - 6, up - 6);
  };

  const drawText = (ctx, textStr, x, y, fontSize, color="#000000") => {
    ctx.font = `${fontSize}px 'Big Shoulders Display'`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = (textStr + "").split("\n");
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i - (lines.length - 1) / 2) * fontSize);
    }
  };

  const between = (point, middle, length) => {
    return middle - length / 2 < point && point < middle + length / 2;
  };

  // --- Logic Helpers ---
  const getVars = (card, playerIdx, aimIdx) => {
    let vars = "";
    let cardID = card.card[0] + card.card[1];
    const players = gameStateObj.players;

    if (cardID === "MR2") {
      const discard = gameStateObj.played[0];
      for (let i = 0; i < discard.length; i++) {
        const c = discard[i];
        if (c.card[0] + c.card[1] !== "MR2" && !c.skip) {
          cardID = c.card[0] + c.card[1];
          break;
        }
      }
    }

    if (cardID === "MM1") {
      if(players[aimIdx].hand.length > 0) {
          vars = Math.floor(Math.random() * (players[aimIdx].hand.length));
      }
    } 
    else if (cardID === "ME1") {
      let cHands = [];
      for (let i = 0; i < players.length; i++) {
        cHands.push([...players[i].hand]);
      }
      
      const pHand = cHands[playerIdx];
      const meIndex = pHand.findIndex(c => c.card[0] === card.card[0] && c.card[1] === card.card[1]);
      if(meIndex > -1) pHand.splice(meIndex, 1);

      for (let i = 0; i < cHands.length; i++) {
        cHands[i] = cHands[i].filter(c => (c.card[0] + c.card[1]) !== "JJ1");
      }

      let orbs = [playerIdx];
      
      for (let t = 0; t < orbs.length; t++) {
        for (let i = 0; i < players.length; i++) {
          if (cHands[i].length > 0 && i !== orbs[t]) {
            const rIdx = Math.floor(Math.random() * cHands[i].length);
            const nCard = cHands[i][rIdx];
            const nCardID = nCard.card[0] + nCard.card[1];

            if (["ME1", "MR2"].includes(nCardID)) {
              vars += i + "," + nCardID + ",;";
              orbs.push(i);
            } else {
              let cVars = getVars(new Card(nCard.card[0], nCard.card[1]), i, i);
              if (nCardID === "MC2") cVars = "E"; 
              else if (nCardID === "SE1") cVars = orbs[t]; 

              vars += i + "," + nCardID + "," + cVars + ";";
            }
            cHands[i].splice(rIdx, 1);
          }
        }
      }
    } 
    else if (cardID === "JJ1") {
      if (players[playerIdx].class === "Mage") {
        vars = Math.floor(Math.random() * 4) + ";" + (4 + Math.floor(Math.random() * 4));
      }
    }
    return vars;
  };

  // --- Interaction Logic ---
  const processInteraction = (e, isRightClick) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Use Full Resolution Dimensions
    const width = rect.width;
    const height = rect.height;
    const x = rawX;
    const y = rawY;
    
    const me = gameStateObj.players[myHandIndex];
    if(!me) return;

    if (!isRightClick && gameStateObj.clickBig) gameStateObj.clickBig = false;
    if(gameStateObj.clickedPlayer) gameStateObj.clickedPlayer = null;

    // Screen 1: Tokens (Selection on Shuffle)
    if (gameStateObj.screen === 1 && gameStateObj.tempTokens) {
        for(let i=0; i<3; i++) {
           if (between(x, width * 0.45, width * 0.3) && 
               between(y, height * (0.35 + 0.15 * i), height * 0.125)) {
               sendAction(`ToknG;${myHandIndex};${gameStateObj.tempTokens[i]}`);
           }
        }
        return;
    }

    // Screen 2: Bounty
    if (gameStateObj.screen === 2) {
        let nullCount = 0;
        gameStateObj.deck.forEach(c => { if(c===null) nullCount++; });
        gameStateObj.players.forEach((p, i) => {
           const bx = width * ((2 * i - gameStateObj.players.length + 6.625) / 15);
           if (between(x, bx, width / 8) && between(y, height / 2, height / 4)) {
               if (nullCount === me.pos) sendAction(`Bnty${myHandIndex};${i};${me.pos}`);
           }
        });
        return;
    }

    // Screen 0: Main Game
    
    // 1. Click Tokens to Toggle Selection
    if (between(x, 59 * width / 64, 3 * width / 32)) {
      for (let i = 0; i < 3; i++) {
        if (between(y, height * (7 + i) / 15 + height/320, height / 20)) {
          if (me.tokens[i] > 0) {
             gameStateObj.clickToken = (gameStateObj.clickToken === i) ? null : i;
             return; 
          }
        }
      }
    }

    // 2. Click Hand Cards
    let checkList = [];
    if (gameStateObj.selectedCard) checkList.push(gameStateObj.selectedCard);
    checkList = checkList.concat([...me.hand].reverse());

    const clickedCard = checkList.some(card => {
        if (!card) return false;
        if (between(x, card.x, width / 8) && between(y, card.y, height / 4)) {
            if (gameStateObj.selectedCard !== card) {
                gameStateObj.selectedCard = card;
                if (isRightClick) gameStateObj.clickBig = true;
                else gameStateObj.clickBig = false;
            } else {
                gameStateObj.selectedCard = null;
                gameStateObj.clickBig = false;
            }
            return true;
        }
        return false;
    });

    if (clickedCard) return;

    // 3. Click Opponent Hands / Stats
    if (!isRightClick) {
        gameStateObj.players.forEach((p, i) => {
            if (between(x, 7 * width / 8, width / 4) && between(y, height / 15 * (i + 2), height / 15)) {
                const selCard = gameStateObj.selectedCard;
                if (selCard && (selCard.card[0]+selCard.card[1] === "SE1") && gameStateObj.recycle[0] === -1) {
                    sendAction(`Play${myHandIndex};SE1;${gameStateObj.targetId()};${i}`);
                    gameStateObj.nextTarget();
                    gameStateObj.selectedCard = null;
                } else {
                    gameStateObj.clickedPlayer = p;
                }
            }
            if (i !== myHandIndex && p.hand.length > 0) {
                const isVisibleOpponent = (gameStateObj.players.length === 2 || (i - myHandIndex + gameStateObj.players.length) % gameStateObj.players.length === 1);
                if (isVisibleOpponent) {
                    const handCenterX = 3 * width / 8;
                    const handCenterY = height / 8;
                    const pHand = p.hand;
                    let cW = (pHand.length > 8) ? (pHand.length - 1) * width / 2 / pHand.length + width / 9 : (pHand.length - 1) * width / 16 + width / 9;
                    if (between(x, handCenterX, cW) && between(y, handCenterY, height / 4.5)) {
                        const selCard = gameStateObj.selectedCard;
                        if (selCard && (selCard.card[0]+selCard.card[1] === "SE1") && gameStateObj.recycle[0] === -1) {
                            sendAction(`Play${myHandIndex};SE1;${gameStateObj.targetId()};${i}`);
                            gameStateObj.nextTarget();
                            gameStateObj.selectedCard = null;
                        } else {
                            gameStateObj.clickedPlayer = p;
                        }
                    }
                }
            }
        });
    }

    if (isRightClick) return; 

    // 4. Buttons
    if (between(x, width * 0.875, width / 6)) {
        // Play/Use Button
        if (between(y, height / 1.2, height / 12)) {
             if (gameStateObj.recycle[0] > -1) {
                 gameStateObj.log("#000000You may not play while using a Recycle Token!");
             } 
             // Token Usage
             else if (gameStateObj.clickToken === 1 || gameStateObj.clickToken === 2) {
                 sendAction(`ToknP;${myHandIndex};${gameStateObj.clickToken}`);
                 gameStateObj.clickToken = null;
             } else if (gameStateObj.clickToken === 0) {
                 if (gameStateObj.selectedCard) {
                     const c = gameStateObj.selectedCard;
                     if(c.card[0]+c.card[1] !== "JJ1") {
                        sendAction(`ToknP;${myHandIndex};0;${c.card[0]};${c.card[1]}`);
                        gameStateObj.clickToken = null;
                     }
                 }
             } 
             else if (gameStateObj.selectedCard === null && me.ability === "Nimble Feet" && me.protections[0] > 0) {
                 sendAction(`ToknP;${myHandIndex};3;${me.protections[0]}`);
             }
             else if (gameStateObj.selectedCard) {
                 const card = gameStateObj.selectedCard;
                 const targetId = gameStateObj.targetId();
                 let vars = getVars(card, myHandIndex, targetId);
                 const cardID = card.card[0] + card.card[1];
                 if(cardID === "MC2" && between(x, 551 * width / 600, width * 0.08)) {
                     vars = "E";
                 }
                 sendAction(`Play${myHandIndex};${cardID};${targetId};${vars}`);
                 gameStateObj.nextTarget();
                 gameStateObj.selectedCard = null;
             }
        }
        // Discard/Reshuffle Button
        if (between(y, height / 1.4, height / 12)) {
            if (gameStateObj.selectedCard) {
                if (gameStateObj.recycle[0] > -1 && gameStateObj.recycle[1] >= 3) {
                    gameStateObj.log("#000000You may only discard up to three with a Recycle Token!");
                } else if (gameStateObj.recycle[0] > -1 && gameStateObj.recycle[2] > 0) {
                    gameStateObj.log("#000000You may not discard after drawing while using a Recycle Token!");
                } else {
                    const card = gameStateObj.selectedCard;
                    sendAction(`Play${myHandIndex};${card.card[0]}${card.card[1]};D;`);
                    gameStateObj.selectedCard = null;
                }
            } else {
                for (let i = 0; i < gameStateObj.players.length; i++) {
                    if (gameStateObj.players[i].hand.length > 3) {
                        gameStateObj.log("#000000All players must have three cards to reshuffle!");
                        return;
                    }
                }
                const allCards = [...gameStateObj.played[0], ...gameStateObj.played[1], ...gameStateObj.deck].filter(c => c !== null && c !== undefined);
                for (let i = allCards.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
                }
                let msg = "Shfl";
                for (let i = 0; i < allCards.length; i++) {
                    if (!allCards[i].dupe) msg += allCards[i].card[0] + "," + allCards[i].card[1] + ";";
                }
                // REMOVED EXTRA SEMICOLON HERE to match tapp.js protocol
                // msg += ";"; 
                for (let i = 0; i < gameStateObj.players.length; i++) {
                    let randTokens = [];
                    while (randTokens.length < 3) {
                        let r = Math.floor(Math.random() * 8);
                        if (randTokens.indexOf(r) === -1) randTokens.push(r);
                    }
                    msg += ";" + randTokens[0] + "," + randTokens[1] + "," + randTokens[2];
                }
                sendAction(msg);
            }
        }
    }
    
    // 5. Shop & Deck
    for(let i=0; i<3; i++) {
        const cx = (14 + i * 9) * width / 72;
        if(between(x, cx, width/9) && between(y, 31*height/64, height/4.5)) {
            if(me.hand.length < 5) sendAction(`Grab${myHandIndex};${i+1}`);
            else gameStateObj.log("#000000Your hand is full!");
        }
    }
    if(between(x, 11*width/36, width/9) && between(y, 13*height/36, 2*height/9)) {
        if(me.hand.length < 5) sendAction(`Grab${myHandIndex};0`);
        else gameStateObj.log("#000000Your hand is full!");
    }
  };

  const handleClick = (e) => processInteraction(e, false);
  const handleContextMenu = (e) => {
      e.preventDefault();
      processInteraction(e, true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const deckImg = new Image(); deckImg.src = process.env.PUBLIC_URL + "/images/deck.webp";
    const blankImg = new Image(); blankImg.src = process.env.PUBLIC_URL + "/images/blank.webp";
    const selectedImg = new Image(); selectedImg.src = process.env.PUBLIC_URL + "/images/selected.webp";

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Set Actual Pixel Dimensions
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Normalize Coordinate System
      ctx.scale(dpr, dpr);
      
      // Ensure Sharp Images
      ctx.imageSmoothingEnabled = false;

      // Use Full Width/Height for logic
      const width = rect.width;
      const height = rect.height;
      
      const fontSize = (width / 2 < height) ? width / 2 : height;

      drawRect(ctx, width/2, height/2, width, height, "#dcdcdc");

      // --- INFO PANEL ---
      drawRect(ctx, 7 * width / 8, height / 2, width / 4, height);
      drawText(ctx, gameStateObj.gameId ? gameStateObj.gameId : "ID: ???", 7 * width / 8, height * 15 / 16, fontSize / 15);
      drawText(ctx, `Deck: ${gameStateObj.deck.length}`, 7 * width / 8, height / 15, fontSize / 20);

      gameStateObj.players.forEach((p, i) => {
        let color = "#000000";
        if (i === myHandIndex) color = "#2d7d07";
        else if (i === gameStateObj.targetId()) color = "#ff4242"; 
        else if (!p.ingame) color = "#848484";
        drawText(ctx, `${p.name}: ${p.health} HP`, 7 * width / 8, height / 15 * (i + 2), fontSize / 20, color);
      });

      if (myHandIndex > -1) {
        const me = gameStateObj.players[myHandIndex];
        drawText(ctx, `Atk: ${me.attack}`, 13 * width / 16, height * 7 / 15 + fontSize/80, fontSize/20);
        drawText(ctx, `Arm: ${me.armor}`, 13 * width / 16, height * 8 / 15 + fontSize/80, fontSize/20);
        drawText(ctx, `Spd: ${me.speed}`, 13 * width / 16, height * 3 / 5 + fontSize/80, fontSize/20);
        
        // Render Tokens
        ["Arcane: ", "Mush: ", "Recyc: "].forEach((name, i) => {
           let color = (gameStateObj.clickToken === i) ? "#ff0000" : "#000000"; 
           drawText(ctx, name + me.tokens[i], 59 * width / 64, height * (7 + i) / 15, fontSize/20, color);
        });
        
        const selCard = gameStateObj.selectedCard;
        const selCid = selCard ? selCard.card[0] + selCard.card[1] : null;
        const isDodgePossible = (!selCard && !gameStateObj.clickToken && me.ability === "Nimble Feet" && me.protections[0] > 0);

        if (selCid === "MC2" && gameStateObj.clickToken === null) {
            drawRect(ctx, 499 * width / 600, height / 1.2, width * 0.08, height / 12, "#ff2020");
            drawRect(ctx, 551 * width / 600, height / 1.2, width * 0.08, height / 12, "#50ff50");
            drawText(ctx, "Play", 499 * width / 600, height / 1.2, fontSize/20);
            drawText(ctx, "Eat", 551 * width / 600, height / 1.2, fontSize/20);
        } else {
            let btnColor = "#ff2020";
            if(!selCard && gameStateObj.clickToken === null && !isDodgePossible) btnColor = "#ffc0c0";
            drawRect(ctx, width * 0.875, height / 1.2, width / 6, height / 12, btnColor);
            
            let btnText = "Play";
            if (gameStateObj.clickToken !== null) btnText = "Use";
            else if (isDodgePossible) btnText = `Dodge (${me.protections[0]})`;
            else if (selCid === "SE1") btnText = "Select Hand";
            
            drawText(ctx, btnText, width * 0.875, height / 1.2, fontSize/20);
        }
        
        drawRect(ctx, width * 0.875, height / 1.4, width / 6, height / 12, "#2020ff");
        drawText(ctx, gameStateObj.selectedCard ? "Discard" : "Reshuffle", width * 0.875, height / 1.4, fontSize/20, "#ffffff");
      }

      // --- SCREEN SPECIFIC ---
      if (gameStateObj.screen === 1) { // Tokens
          drawRect(ctx, 3 * width / 8, height / 2, width / 2, height / 2, "#f0f0f0");
          drawText(ctx, "Select Token", width * 0.2125, height / 2, fontSize / 8);
          if(gameStateObj.tempTokens) {
              gameStateObj.tempTokens.forEach((t, i) => {
                 const tIdx = parseInt(t);
                 drawRect(ctx, width * 0.45, height * (0.35 + 0.15 * i), width * 0.3, height / 8, TOKEN_COLORS[tIdx]);
                 drawText(ctx, TOKEN_NAMES[tIdx], width * 0.45, height * (0.35 + 0.15 * i), fontSize / 12);
              });
          }
      } 
      else if (gameStateObj.screen === 2) { // Bounty
          let nullCount = 0;
          gameStateObj.deck.forEach(c => { if(c===null) nullCount++; });
          const me = gameStateObj.players[myHandIndex];
          const isMyTurn = me && me.pos === nullCount;

          drawRect(ctx, 3 * width / 8, 5 * height / 12, width * (2 * gameStateObj.players.length + 1) / 15, height / 1.5, "#f0f0f0");
          drawText(ctx, "Bounty", 3 * width / 8, 11 * height / 48, fontSize / 8);
          gameStateObj.players.forEach((p, i) => {
              const bx = width * (5 / 16 + (2 * i + 1 - gameStateObj.players.length) / 15);
              const by = 3 * height / 8;
              const card = gameStateObj.deck[i];
              if (card === null || card === undefined) {
                  ctx.drawImage(blankImg, bx, by, width / 8, height / 4);
              } else {
                  if (isMyTurn) ctx.drawImage(card.image, bx, by, width / 8, height / 4);
                  else ctx.drawImage(card.backImage, bx, by, width / 8, height / 4);
              }
          });
      }
      else { // Game Board
          if(gameStateObj.deck.length > 0) ctx.drawImage(deckImg, width / 4, height / 4, width / 9, height / 4.5);
          if (gameStateObj.played[0].length > 0) ctx.drawImage(gameStateObj.played[0][0].image, 7 * width / 18, height / 4, width / 9, height / 4.5);
          else ctx.drawImage(blankImg, 7 * width / 18, height / 4, width / 9, height / 4.5);
          
          for (let i = 0; i < 3; i++) {
             const card = gameStateObj.played[1][i];
             const cx = (14 + i * 9) * width / 72;
             if (card) ctx.drawImage(card.image, cx, 31 * height / 64, width / 9, height / 4.5);
             else ctx.drawImage(blankImg, cx, 31 * height / 64, width / 9, height / 4.5);
          }

          gameStateObj.players.forEach((p, i) => {
             const hand = p.hand;
             if (i === myHandIndex) {
                 hand.forEach((card, cIdx) => {
                    const num = cIdx + 1;
                    const total = hand.length;
                    card.x = (3 * width / 8) + ((total + 1) / 2 - num) * (width / 16);
                    card.y = 27 * height / 32;
                    ctx.drawImage(card.image, card.x - width/16, card.y - height/8, width / 8, height / 4);
                 });
             } else {
                 if(gameStateObj.players.length === 2 || (i - myHandIndex + gameStateObj.players.length) % gameStateObj.players.length === 1) {
                     hand.forEach((card, cIdx) => {
                        const num = cIdx + 1;
                        const total = hand.length;
                        const cx = (3 * width / 8) + ((total + 1) / 2 - num) * (width / 16);
                        const cy = height / 8;
                        ctx.drawImage(card.backImage, cx - width/18, cy - height/9, width / 9, height / 4.5);
                     });
                 }
             }
          });

          if(gameStateObj.selectedCard) {
              const card = gameStateObj.selectedCard;
              ctx.drawImage(selectedImg, card.x - width/16 - 4, card.y - height/8 - 4, width/8 + 8, height/4 + 8);
              ctx.drawImage(card.image, card.x - width/16, card.y - height/8, width / 8, height / 4);
              if (gameStateObj.clickBig) {
                ctx.drawImage(card.image, 3 * width / 16, height / 32, 3 * width / 8, 3 * height / 4);
              }
          }
      }

      if (gameStateObj.clickedPlayer) {
          const cp = gameStateObj.clickedPlayer;
          let color = "#ffffff";
          if (cp.class === "Knight") color = "#ffd966";
          else if (cp.class === "Archer") color = "#b6d7a8";
          else if (cp.class === "Mage") color = "#6fa8dc";
          else if (cp.class === "Warlock") color = "#c27ba0";

          drawRect(ctx, 3 * width / 8, height / 2, width / 2, height / 2, color);
          drawText(ctx, cp.name, 3 * width / 8, height * 0.31, fontSize / 12);
          drawText(ctx, "Class: " + cp.class, width / 4, height * 0.6, fontSize / 18);
          drawText(ctx, "Life Points: " + cp.life, width / 2, height * 0.6, fontSize/20);
          drawText(ctx, "Ability: " + cp.ability, 3 * width / 8, height * 0.68, fontSize/20);
          drawText(ctx, "Health: " + cp.health, 7 * width / 24, height * 0.4, fontSize/20);
          drawText(ctx, "Attack: " + cp.attack, 7 * width / 24, height * 0.48, fontSize/20);
          drawText(ctx, "Armor: " + cp.armor, 11 * width / 24, height * 0.4, fontSize/20);
          drawText(ctx, "Speed: " + cp.speed, 11 * width / 24, height * 0.48, fontSize/20);
      }

      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [gameStateObj, myHandIndex]);

  return <canvas ref={canvasRef} onClick={handleClick} onContextMenu={handleContextMenu} style={{width:'100%', height:'100%', display:'block'}} />;
};

export default GameCanvas;