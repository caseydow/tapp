import * as C from '../constants';

export function between(point, middle, length) {
  return middle - length / 2 < point && point < middle + length / 2;
}

export class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.uuid = null;
    this.joined = false;
    this.online = false;
    this.ingame = false;
    this.class = 0; 
    this.ability = "Empowered Strikes";
    this.health = 100;
    this.attack = 0;
    this.armor = 0;
    this.speed = 0;
    this.life = 10;
    this.hand = [];
    this.tokens = [0, 0, 0, 0, 0, 0, 0, 0]; 
    this.protections = [];
    this.pos = 0;
  }
}

export class Card {
  constructor(suit, num) {
    this.card = [suit, num];
    this.x = 0;
    this.y = 0;
    this.side = 0;
    this.dupe = false;
    this.skip = false;
    this.image = new Image();

    const basePath = process.env.PUBLIC_URL || '';
    if (suit && num) {
      this.image.src = `${basePath}/images/tapp/${suit}${num}.webp`;
    } else {
      this.image.src = `${basePath}/images/back.webp`;
    }

    this.backImage = new Image();
    this.backImage.src = `${basePath}/images/back.webp`;
  }

  grab(newHand, gameState) {
    const playerCount = gameState.players.length;
    const myHand = gameState.hand;
    
    const refHand = myHand > -1 ? myHand : 0;
    
    let relIndex = newHand - refHand + 1;
    if (newHand - refHand < 0) relIndex += playerCount;

    let cardPos = [[1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 2, 2], [1, 0, 1, 2, 1, 2], [0, 1, 1, 1, 2, 2]];
    
    let x = 0;
    let s = 0;
    while (x < relIndex) {
       let inc = cardPos[s][playerCount - 2];
       if (x + inc >= relIndex) break;
       x += inc;
       s++;
    }
    this.side = s + 1;
  }
}

export class GameState {
  constructor(updateCallback) {
    this.players = [];
    this.deck = [];
    this.played = [[], []];
    this.hand = -1;
    this.recycle = [-1, 0, 0];
    this.logs = [];
    this.updateCallback = updateCallback;
    this.target = 0; 
    this.screen = 0; 
    this.tempTokens = null;
    
    this.clickToken = null;
    this.selectedCard = null;
    this.clickBig = false;
    this.clickedPlayer = null;
  }

  log(text) {
    this.logs.push(text);
    if(this.updateCallback) this.updateCallback();
  }

  targetId() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].pos === this.target) {
        return i;
      }
    }
    return -1;
  }

  nextTarget() {
    this.target += 1;
    if (this.target === this.players.length) this.target -= this.players.length;
    if (this.hand > -1 && this.players[this.hand] && this.target === this.players[this.hand].pos) {
      this.target += 1;
    }
    if (this.target === this.players.length) this.target -= this.players.length;
  }

  token(player, num, msg = true) {
    const p = player;
    const n = String(num);
    switch (n) {
      case "0": p.attack += 1; break;
      case "1": p.armor += 1; break;
      case "2": p.speed += 20; break;
      case "3": p.health += 10; p.tokens[3] += 1; break;
      case "4": p.tokens[0] += 1; break; 
      case "5": p.tokens[1] += 1; break;
      case "6": p.tokens[2] += 1; break;
      case "7": p.life += 1; break;
      default: break;
    }
    if (msg) {
        const tName = C.TOKEN_NAMES[parseInt(n)];
        if(tName) this.log(`> ${C.COLORS_DARK[p.class]}${p.name}#000000 gained a ${tName} token`);
    }
  }

  checkBarrier(aim) {
    if (aim.protections.includes("SC3")) {
      aim.protections.splice(aim.protections.indexOf("SC3"), 1);
      this.log(`> ${C.COLORS_DARK[aim.class]}${aim.name}'s #000000 Soul Barrier blocked the ability!`);
      return true;
    }
    return false;
  }

  checkBlock(aim) {
    if (aim.protections.includes("WR1")) {
      aim.protections.splice(aim.protections.indexOf("WR1"), 1);
      this.log(`> ${C.COLORS_DARK[aim.class]}${aim.name}'s #000000 Thick Cleaver blocked the attack!`);
    } else if (aim.protections.includes("EL") && !aim.protections.includes("ELD")) {
      this.log(`> ${C.COLORS_DARK[aim.class]}${aim.name}'s #000000 Enchanted Lifeline protected them!`);
    } else if (aim.protections.includes("JA1")) {
      aim.protections.splice(aim.protections.indexOf("JA1"), 1);
      this.log(`> ${C.COLORS_DARK[aim.class]}${aim.name}'s #000000 Super Speed dodged the attack!`);
    } else {
      return false;
    }
    return true;
  }
  
  dmg(amt, player, aim, card, isTrueDmg = false) {
      if (!this.checkBlock(aim)) {
          if (aim.ability === "Royal Aura" && card[0] === "M") isTrueDmg = false;
          let total = amt - (isTrueDmg ? 0 : aim.armor) + player.attack;
          total += C.CLASS_TYPES[player.class] === card[0] ? 2 : 0;
          
          if (aim.protections.includes("RR1") && aim.speed > player.speed) {
            total = Math.floor(total / 2 - (isTrueDmg ? 0 : aim.armor) / 2);
          }
          
          aim.health -= Math.max(total, 0);

          while (player.protections.includes("ES")) {
            player.attack -= 5;
            player.protections.splice(player.protections.indexOf("ES"), 1);
          }
          
          if (card[0] === "S" && player.ability === "Demonic Essence") {
            let healAmt = amt + player.attack + 2;
            player.health += Math.floor(healAmt / 3);
          }
          
          if (aim.ability === "Nimble Feet" && aim.protections[0] > -1) {
            aim.protections[0] = Math.max(total, 0);
          }
      }
      
      if (player.protections.includes("MC3")) {
          player.attack -= 1; player.armor -= 1; player.speed -= 20;
          player.protections.splice(player.protections.indexOf("MC3"), 1);
      }
      
      while (aim.protections.includes("MR1")) {
          if(!this.checkBarrier(player) && !this.checkBlock(player)) {
              let mCount = 0;
              aim.hand.forEach(c => { if(c.card[0] === 'M') mCount++; });
              if(mCount > 0) player.health -= 3;
          }
          aim.protections.splice(aim.protections.indexOf("MR1"), 1);
      }
      
      if (player.protections.includes("WC1")) {
          player.armor -= 4;
          player.protections.splice(player.protections.indexOf("WC1"), 1);
      }
      
      const toRemove = [];
      player.protections.forEach((item, idx) => {
          if (typeof item === 'string') {
             if(item.includes("WC2")) {
                 player.armor += parseInt(item.slice(3));
                 toRemove.push(idx);
             } else if(item.includes("RR2")) {
                 player.armor -= parseInt(item.slice(3));
                 toRemove.push(idx);
             } else if(item.includes("SC1")) {
                 if(!this.checkBarrier(player) && !this.checkBlock(player)) {
                     player.health -= 4;
                     toRemove.push(idx);
                 }
             }
          }
      });
      for(let i=toRemove.length-1; i>=0; i--) player.protections.splice(toRemove[i], 1);
      
      if (player.protections.includes("EL")) player.protections.push("ELD");
      if (player.protections.includes("WR1")) player.protections.splice(player.protections.indexOf("WR1"), 1);
      if (player.protections.includes("RR1")) player.protections.splice(player.protections.indexOf("RR1"), 1);
  }

  ability(card, player, aim, vars = "", silent = false) {
    const cardId = card[0] + card[1];
    
    if (!silent) {
      const pColor = C.COLORS_DARK[player.class];
      const aimColor = C.COLORS_DARK[aim.class];
      if (player === aim) {
        this.log(`> ${pColor}${player.name}#000000 hit themself with ${C.CARDS[cardId]}`);
      } else if (cardId === "MC2" && vars === "E") {
        this.log(`${pColor}${player.name}#000000 ate their Mushroom on a Stick`);
      } else if (cardId === "JJ1") {
        this.log(`${pColor}${player.name}#000000 used ${C.INCANTATION_NAMES[C.CLASSES.indexOf(player.class)]}`);
      } else {
        this.log(`${pColor}${player.name}#000000 hit ${aimColor}${aim.name}#000000 with ${C.CARDS[cardId]}`);
      }
    }

    if (card[0] === "M") {
      if (card[1] === "C1") this.dmg(9 + (this.checkBarrier(aim) ? 0 : aim.armor), player, aim, card, true);
      else if (card[1] === "C2") {
        if (vars === "E") player.health += 10;
        else this.dmg(12, player, aim, card, true);
      }
      else if (card[1] === "C3") {
        this.dmg(9, player, aim, card, true);
        player.attack += 1; player.armor += 1; player.speed += 20;
        player.protections.push("MC3");
      }
      else if (card[1] === "R1") {
        this.dmg(12, player, aim, card, true);
        player.protections.push("MR1");
      }
      else if (card[1] === "R2") {
        let last = null;
        for (let i = 1; i < this.played[0].length; i++) {
          let c = this.played[0][i];
          let cid = c.card[0] + c.card[1];
          if (cid !== "MR2" && !c.skip) { last = c; break; }
        }
        if (!last) { this.dmg(11, player, aim, card, true); return; }

        if (vars !== "E") this.dmg(11, player, aim, card, true);
        
        const lid = last.card[0] + last.card[1];
        if (lid === "MC1") { if (!this.checkBarrier(aim)) aim.health -= aim.armor; }
        else if (lid === "ME1") this.ability(last.card, player, aim, vars, true);
        else if (lid === "WC2") {
             if(!this.checkBarrier(aim)) { aim.protections.push("WC2"+aim.armor); aim.armor = 0; if(aim.ability==="Royal Aura") aim.health -= aim.armor; }
        }
        else if (lid === "WR2") { if(!this.checkBarrier(aim)) aim.health -= 2 * Math.floor(player.armor/2); }
        else if (lid === "WE1") { 
            this.players.forEach(p => { if(p!==player && !this.checkBarrier(p)) p.health -= (5 + Math.floor(player.armor/2)); });
        }
        else if (lid === "RC1") {
             this.players.forEach(p => { if(p!==aim && p.speed<player.speed && !this.checkBarrier(p)) this.dmg(11, player, p, card, true); });
        }
        else if (lid === "RC2") { if(!this.checkBarrier(aim)) aim.health -= Math.floor(player.speed/15); }
        else if (lid === "RC3") { if(!this.checkBarrier(aim)) aim.health -= (11 + player.attack + (player.class === "Mage" ? 2 : 0)); }
        else if (lid === "RE1") {
            if(!this.checkBarrier(aim)) {
                if(aim.ability==="Royal Aura") aim.health -= aim.armor;
                for(let i=0; i < Math.floor(player.speed/30)+1; i++) aim.health -= (11 + player.attack + (player.class === "Mage" ? 2 : 0));
            }
        }
        else if (lid === "RM1") { 
             this.players.forEach(p => { if(p!==player && !this.checkBarrier(p)) p.health -= (2 + Math.floor(player.speed/10)); });
        }
        else if (lid === "SC2") {
             this.players.forEach(p => { if(p!==player && !this.checkBarrier(p)) this.dmg(3, player, p, card, true); });
        }
        else if (lid === "SR1") { player.health += Math.floor((11 + player.attack + (player.class==="Mage"?2:0))/2); }
        else if (lid === "SR2") {
             if((11 + player.attack + (player.class==="Mage"?2:0)) > 14) {
                 this.players.forEach(p => { if(p!==player && !this.checkBarrier(p)) this.dmg(4, player, p, card, true); });
             }
        }
        else if (lid === "SE1") { if(!this.checkBarrier(aim)) this.dmg(11, player, this.players[parseInt(vars)], card, true); }
        else {
          let targetHP = aim.health;
          this.ability(last.card, player, aim, vars, true);
          aim.health = targetHP;
        }
      }
      else if (card[1] === "E1") {
        const actions = vars.split(";").slice(0, -1);
        this.players.forEach(p => { 
            if(p.protections.includes("SC1")) {
                if(!(this.checkBarrier(aim) || this.checkBlock(aim))) {
                    aim.health -= 4;
                    p.protections.splice(p.protections.indexOf("SC1"), 1);
                }
            }
        });
        actions.forEach(act => {
           const parts = act.split(",");
           const targetIdx = parseInt(parts[0]);
           if(isNaN(targetIdx)) return;
           const targetP = this.players[targetIdx];
           
           if(this.checkBarrier(targetP)) return;

           const subCardId = parts[1];
           const cardIdx = targetP.hand.findIndex(c => c.card[0]+c.card[1] === subCardId);
           
           if(cardIdx > -1) {
              const stolen = targetP.hand[cardIdx];
              stolen.x = 0; stolen.y = 0; stolen.image.src = `${process.env.PUBLIC_URL}/images/tapp/${stolen.card[0]}${stolen.card[1]}.webp`;
              this.played[0].push(stolen); 
              this.ability(stolen.card, targetP, targetP, parts[2]); 
              targetP.hand.splice(cardIdx, 1);
           }
        });
      }
      else if (card[1] === "M1") {
        this.dmg(17, player, aim, card, true);
        if (aim !== player && aim.hand.length > 0 && !this.checkBarrier(aim)) {
          const stealIdx = parseInt(vars) || 0;
          if (aim.hand[stealIdx]) {
            const stolen = aim.hand.splice(stealIdx, 1)[0];
            stolen.grab(player.id, this);
            player.hand.push(stolen);
          }
        }
      }
    }
    else if (card[0] === "W") {
      if (card[1] === "C1") { this.dmg(11, player, aim, card); player.armor += 4; player.protections.push("WC1"); }
      else if (card[1] === "C2") {
        if (!this.checkBarrier(aim)) { aim.protections.push("WC2" + aim.armor); aim.armor = 0; }
        this.dmg(12, player, aim, card);
      }
      else if (card[1] === "C3") { this.dmg(11, player, aim, card); player.health += player.armor; }
      else if (card[1] === "R1") { this.dmg(12, player, aim, card); player.protections.push("WR1"); }
      else if (card[1] === "R2") {
        let extra = this.checkBarrier(aim) ? 0 : 2 * Math.floor(player.armor / 2);
        this.dmg(13 + extra, player, aim, card);
      }
      else if (card[1] === "E1") {
        this.dmg(7, player, aim, card);
        this.players.forEach(p => {
          if (p !== player && !this.checkBarrier(p) && !this.checkBlock(p)) {
            p.health -= (5 + Math.floor(p.armor / 2));
            while(p.protections.includes("MR1")) {
                 if(!(this.checkBarrier(player) || this.checkBlock(player))) {
                      let mCount=0; p.hand.forEach(c => { if(c.card[0]==="M") mCount++; });
                      if(mCount > 0) player.health -= 3;
                 }
                 p.protections.splice(p.protections.indexOf("MR1"), 1);
            }
          }
        });
      }
      else if (card[1] === "M1") { this.dmg(18, player, aim, card); player.health += (10 + player.armor); }
    }
    else if (card[0] === "R") {
      if (card[1] === "C1") {
        this.dmg(10, player, aim, card);
        this.players.forEach(p => {
          if (p !== aim && p.speed < player.speed && !this.checkBarrier(p)) {
            this.dmg(10, player, p, card);
          }
        });
      }
      else if (card[1] === "C2") {
        let extra = this.checkBarrier(aim) ? 0 : Math.floor(player.speed / 15);
        this.dmg(11 + extra, player, aim, card);
      }
      else if (card[1] === "C3") {
        let total = player.attack + (player.class === "Archer" ? 8 : 6);
        this.dmg(6 + (this.checkBarrier(aim) ? 0 : total), player, aim, card);
      }
      else if (card[1] === "R1") { this.dmg(12, player, aim, card); player.protections.push("RR1"); }
      else if (card[1] === "R2") {
        let bonus = Math.floor(player.speed / 10);
        this.dmg(12, player, aim, card);
        player.armor += bonus;
        player.protections.push("RR2" + bonus);
      }
      else if (card[1] === "E1") {
        if (this.checkBarrier(aim)) this.dmg(6, player, aim, card);
        else {
          for (let i = 0; i < Math.floor(Math.max(player.speed, 0) / 30) + 2; i++) this.dmg(6, player, aim, card, true);
        }
      }
      else if (card[1] === "M1") {
        this.dmg(19, player, aim, card);
        this.players.forEach(p => {
          if (p !== player && !this.checkBarrier(p) && !this.checkBlock(p)) {
            p.health -= (2 + Math.floor(player.speed / 10));
            while(p.protections.includes("MR1")) {
                 if(!(this.checkBarrier(player) || this.checkBlock(player))) {
                      let mCount=0; p.hand.forEach(c => { if(c.card[0]==="M") mCount++; });
                      if(mCount > 0) player.health -= 3;
                 }
                 p.protections.splice(p.protections.indexOf("MR1"), 1);
            }
          }
        });
      }
    }
    else if (card[0] === "S") {
      if (card[1] === "C1") { this.dmg(12, player, aim, card); player.protections.push("SC1"); }
      else if (card[1] === "C2") {
        this.dmg(11, player, aim, card);
        this.players.forEach(p => {
          if (p !== player && !this.checkBarrier(p) && !this.checkBlock(p)) {
              p.health -= 3;
              while(p.protections.includes("MR1")) {
                 if(!(this.checkBarrier(player) || this.checkBlock(player))) {
                      let mCount=0; p.hand.forEach(c => { if(c.card[0]==="M") mCount++; });
                      if(mCount > 0) player.health -= 3;
                 }
                 p.protections.splice(p.protections.indexOf("MR1"), 1);
            }
          }
        });
      }
      else if (card[1] === "C3") { this.dmg(12, player, aim, card); player.protections.push("SC3"); }
      else if (card[1] === "R1") {
        let total = 15 + player.attack + (player.class === "Warlock" ? 2 : 0);
        player.health += Math.floor(total / 2);
        this.dmg(15, player, aim, card);
      }
      else if (card[1] === "R2") {
        if (14 + player.attack + (player.class === "Warlock" ? 2 : 0) > 14) {
          this.players.forEach(p => { if (p !== player && !this.checkBarrier(p) && !this.checkBlock(p)) p.health -= 4; });
        }
        this.dmg(14, player, aim, card);
      }
      else if (card[1] === "E1") {
        this.dmg(8, player, aim, card, true);
        const p2 = this.players[parseInt(vars)];
        if (p2 && !this.checkBarrier(p2)) {
          this.dmg(8, player, p2, card, true);
          this.log(`> ${C.COLORS_DARK[player.class]}${player.name}#000000 hit ${C.COLORS_DARK[p2.class]}${p2.name}#000000 with Dual Scythes`);
        }
      }
      else if (card[1] === "M1") {
        this.dmg(22, player, aim, card);
        this.players.forEach(p => {
          if (p !== player && !this.checkBarrier(p)) {
              p.life -= 1;
              if (p.ability === "Overconfidence") {
                  if (p.life < 5 && p.life + 1 > 4) {
                    p.attack -= 2;
                    p.armor += 2;
                  }
              }
          }
        });
      }
    }
    
    if (card[0] === "J") {
      if (player.class === "Knight") { player.health += 15; player.attack += 2; player.protections.push("JK1"); }
      else if (player.class === "Archer") { player.protections.push("JA1"); player.protections.push("JA1"); }
      else if (player.class === "Mage") {
        const parts = vars.split(";");
        this.token(player, parseInt(parts[0])); this.token(player, parseInt(parts[1]));
      }
      else if (player.class === "Warlock") {
        this.players.forEach(p => p.health = 50);
        player.attack += 1;
      }
    }

    player.health = Math.min(100 + player.tokens[3] * 10, player.health);
    if (C.CLASS_TYPES[player.class] === card[0] && player.ability === "Empowered Strikes") {
      player.attack += 5;
      player.protections.push("ES");
    }
    if (aim.ability === "Enchanted Lifeline" && aim.health <= 0 && !aim.protections.includes("EL")) {
      aim.health = 15;
      aim.protections.push("EL");
      this.log(`${C.COLORS_DARK[aim.class]}${aim.name}#000000 Enchanted Lifeline saved them!`);
    }
  }

  processMessage(msg) {
    if (!msg) return;

    if (msg.startsWith("User")) {
      const data = msg.slice(4).split(";");
      const idx = parseInt(data.shift());
      const p = this.players[idx];
      if (!p) return;

      p.ingame = true;
      p.name = data.shift();
      const classIdx = parseInt(data.shift());
      p.class = C.CLASSES[classIdx];
      p.armor = parseInt(data.shift());
      p.speed = parseInt(data.shift());
      p.attack = parseInt(data.shift());
      p.ability = data.shift();
      p.health = 100;

      if (p.ability === "Nimble Feet") p.protections.push(0);

      while (data.length > 0) {
        let t = data.shift();
        if (t !== undefined && t !== "") this.token(p, t, false);
      }

      const active = this.players.filter(pl => pl.ingame);
      active.sort((a, b) => b.speed - a.speed);
      active.forEach((pl, i) => pl.pos = i);

      if (this.hand > -1) {
        this.target = this.players[this.hand].pos;
        this.nextTarget();
      }
    }
    else if (msg.startsWith("Grab")) {
      const data = msg.slice(4).split(";");
      const pNum = parseInt(data[0]);
      const cardNum = parseInt(data[1]);
      const p = this.players[pNum];

      if (cardNum === 0) { 
        if (this.deck.length > 0) {
          const card = this.deck.pop();
          card.grab(pNum, this);
          p.hand.push(card);
        }
      } else { 
        if (this.played[1].length > cardNum - 1) {
          const card = this.played[1][cardNum - 1];
          if (card) {
            card.grab(pNum, this);
            p.hand.push(card);

            if (this.deck.length > 0) {
              const newCard = this.deck.pop();
              newCard.image.src = `${process.env.PUBLIC_URL}/images/tapp/${newCard.card[0]}${newCard.card[1]}.webp`;
              this.played[1][cardNum - 1] = newCard;
            } else {
              this.played[1][cardNum - 1] = null;
            }
          }
        }
      }
      if (this.recycle[0] > -1) {
        this.recycle[2] += 1;
        if (this.recycle[1] <= this.recycle[2]) {
          this.recycle = [-1, 0, 0];
          this.log(`> ${C.COLORS_DARK[p.class]}${p.name} #000000finished using their Recycle Token.`);
        }
      }
    }
    else if (msg.startsWith("Play")) {
      const splitData = msg.slice(4).split(";");
      const pIdx = parseInt(splitData[0]);
      const cardId = splitData[1];
      const aimIdx = splitData[2]; 
      const vars = splitData.slice(3).join(";");

      const player = this.players[pIdx];
      const cardIndex = player.hand.findIndex(c => c.card[0] + c.card[1] === cardId);

      if (cardIndex > -1) {
        const card = player.hand[cardIndex];
        card.x = 0; card.y = 0;
        card.image.src = `${process.env.PUBLIC_URL}/images/tapp/${card.card[0]}${card.card[1]}.webp`;

        if (aimIdx === "D") {
          card.skip = true;
          this.played[0].unshift(card);
          this.log(`${C.COLORS_DARK[player.class]}${player.name}#000000 discarded a ${C.CARDS[cardId]}`);
          if (this.recycle[0] > -1) this.recycle[1] += 1;
        } else {
          this.played[0].unshift(card);
          const aim = this.players[parseInt(aimIdx)];
          if (aim) this.ability(card.card, player, aim, vars);
        }

        player.hand.splice(cardIndex, 1);
      }
    }
    else if (msg.startsWith("Tokn")) {
      const data = msg.slice(4).split(";");
      const type = data[0];
      const pNum = parseInt(data[1]);
      const p = this.players[pNum];

      if (type === "P") { 
        const tNum = parseInt(data[2]);
        if (tNum === 0) { 
          const suit = data[3]; const num = data[4];
          const newCard = new Card(suit, num);
          newCard.dupe = true;
          newCard.grab(pNum, this);
          p.hand.push(newCard);
          p.tokens[0] -= 1;
        } else if (tNum === 1) { 
          p.health += 20; p.tokens[1] -= 1;
          p.health = Math.min(100 + p.tokens[3] * 10, p.health);
        } else if (tNum === 2) { 
          p.tokens[2] -= 1;
          this.recycle = [pNum, 0, 0];
        } else if (tNum === 3) { 
          p.health += parseInt(data[3]); 
          p.protections[0] = -1;
        }
        if (tNum < 3) this.log(`> ${C.COLORS_DARK[p.class]}${p.name}#000000 used a ${C.TOKEN_NAMES[tNum + 4]} token`);
      } else if (type === "G") { 
        if (pNum === this.hand && this.screen === 1) this.screen = 2; 
        this.token(p, data[2]);
      }
    }
    else if (msg.startsWith("Shfl")) {
      this.deck = [];
      const parts = msg.split(";;");
      const lisDeck = parts[0].slice(4).split(";").filter(x => x).map(x => x.split(","));

      lisDeck.forEach(c => this.deck.push(new Card(c[0], c[1])));
      this.played = [[], []]; 

      for (let i = 0; i < 3; i++) {
        const c = this.deck.pop();
        if (c) {
          c.image.src = `${process.env.PUBLIC_URL}/images/tapp/${c.card[0]}${c.card[1]}.webp`;
          this.played[1].push(c);
        }
      }

      const speeds = [...this.players];
      speeds.sort((a, b) => (a.health === b.health ? b.speed - a.speed : b.health - a.health));
      speeds.forEach((p, i) => p.pos = i);

      this.players.forEach(p => {
        p.health = 100 + p.tokens[3] * 10;
        p.life -= p.pos * 2;

        if (p.ability === "Overconfidence") {
          if (p.life < 5 && p.life + p.pos * 2 > 4) { p.attack -= 2; p.armor += 2; }
        }
        if (p.protections.includes("JK1")) p.attack -= 2;
        if (p.ability === "Castle Armory") p.armor += 1;
        if (p.protections.includes("MC3")) { p.attack -= 1; p.armor -= 1; p.speed -= 20; }
        if (p.protections.includes("WC1")) p.armor -= 4;
        while (p.protections.includes("ES")) { p.attack -= 5; p.protections.splice(p.protections.indexOf("ES"), 1); }

        p.protections.forEach(item => {
          if (typeof item === 'string' && item.includes("WC2")) p.armor += parseInt(item.slice(3));
          if (typeof item === 'string' && item.includes("RR2")) p.armor -= parseInt(item.slice(3));
        });
        p.protections = [];
        if (p.ability === "Nimble Feet") p.protections.push(0);
      });

      this.log("The deck was reshuffled!");

      if (this.players[this.hand] && this.players[this.hand].class !== "Knight") {
        const tokenStr = parts[1].split(";")[this.hand];
        this.screen = 1;
        this.tempTokens = tokenStr.split(",");
      } else {
        this.screen = 2; 
      }
      
      this.players.forEach((p, i) => {
        if (p.class === "Knight") {
          const t = parts[1].split(";")[i].split(",")[0];
          this.token(p, t);
        }
      });
    }
    else if (msg.startsWith("Bnty")) {
      const data = msg.slice(4).split(";");
      const pNum = parseInt(data[0]);
      const bCardIdx = parseInt(data[1]);
      const pos = parseInt(data[2]);

      if (this.deck[bCardIdx]) {
        const card = this.deck[bCardIdx];
        card.grab(pNum, this);
        this.players[pNum].hand.push(card);
        this.deck[bCardIdx] = null; 
      }

      if (pos === this.players.length - 1) {
        const speeds = [...this.players];
        speeds.sort((a, b) => b.speed - a.speed);
        speeds.forEach((p, i) => p.pos = i);

        if (this.hand > -1) {
          this.target = this.players[this.hand].pos;
          this.nextTarget();
        }
        this.deck = this.deck.filter(c => c !== null);
        this.screen = 0; 
      }
    }

    if(this.updateCallback) this.updateCallback();
  }
}