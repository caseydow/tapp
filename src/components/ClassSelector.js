import React, { useState } from 'react';
import { CLASSES, ABILITIES, COLORS, CLASS_BUFFS, TOKEN_NAMES } from '../constants';

const TappRect = ({ x, y, w, h, color, children, style }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        backgroundColor: '#000000',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: 'calc(100% - 6px)',
          height: 'calc(100% - 6px)',
          backgroundColor: color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const ClassSelector = ({ onConfirm }) => {
  const [selectedClass, setSelectedClass] = useState(0);
  const [name, setName] = useState('Player');
  const [attackMod, setAttackMod] = useState(0);
  const [abilityChoice, setAbilityChoice] = useState(0);
  const [bonusToken, setBonusToken] = useState(0);

  const getAbilityName = () => {
      if(abilityChoice === 2) return "Empowered Strikes";
      return ABILITIES[selectedClass][abilityChoice].split(":")[0];
  };

  const currentAbility = getAbilityName();

  const baseAttack = CLASS_BUFFS[0][selectedClass];
  let finalAttack = baseAttack + attackMod;
  if (currentAbility === "Overconfidence") finalAttack += 2;
  
  const baseArmor = CLASS_BUFFS[1][selectedClass];
  let finalArmor = 2 - attackMod + baseArmor;
  if (currentAbility === "Castle Armory") finalArmor += 1;
  
  const baseSpeed = CLASS_BUFFS[2][selectedClass];
  const finalSpeed = 30 - Math.abs(attackMod) * 15 + baseSpeed;

  const handleConfirm = () => {
    onConfirm({
        name: name || "Player",
        classIndex: selectedClass,
        armor: finalArmor,
        speed: finalSpeed,
        attack: finalAttack,
        ability: currentAbility,
        bonusToken: (selectedClass === 1 && abilityChoice === 0) ? bonusToken : null
    });
  };

  return (
    <div className="screen class-select" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', left: '20%', top: '16%', width: '20%', height: '14%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>Class</span>
      </div>

      <TappRect x={20} y={52} w={20} h={55} color="#c8f0ff">
        {CLASSES.map((c, i) => (
          <div 
            key={c}
            onClick={() => { setSelectedClass(i); setAbilityChoice(0); }}
            style={{
              width: '83.33%', 
              height: '18%', 
              backgroundColor: COLORS[c],
              border: '3px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: selectedClass === i ? '#ff0000' : '#000000',
              fontSize: 'clamp(0.8rem, 2.5vw, 1.5rem)', 
              textAlign: 'center'
            }}
          >
            {c}
          </div>
        ))}
      </TappRect>

      <div style={{ position: 'absolute', left: '40%', top: '16%', width: '16.66%', height: '14%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>Attack</span>
      </div>

      <TappRect x={40} y={52} w={16.66} h={55} color="#c8f0ff">
         {[2, 1, 0, -1, -2].map((val) => (
             <div
                key={val}
                onClick={() => setAttackMod(val)}
                style={{
                    width: '85.7%', 
                    height: '13%', 
                    backgroundColor: '#ffffff',
                    border: '3px solid #000',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: attackMod === val ? '#ff0000' : '#000000',
                    fontSize: 'clamp(1rem, 3vw, 1.5rem)'
                }}
             >
                 {val}
             </div>
         ))}
      </TappRect>


      <div style={{ position: 'absolute', left: '70%', top: '16%', width: '40%', height: '14%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>Ability</span>
      </div>

      <TappRect x={70} y={52} w={40} h={55} color="#c8f0ff">
          {[ABILITIES[selectedClass][0], ABILITIES[selectedClass][1], ABILITIES[4]].map((txt, i) => (
              <div
                key={i}
                onClick={() => setAbilityChoice(i)}
                style={{
                    width: '92.5%', 
                    height: '28%',
                    backgroundColor: '#ffffff',
                    border: '3px solid #000',
                    padding: '5px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: abilityChoice === i ? '#ff0000' : '#000000',
                    fontSize: 'clamp(0.6rem, 1.4vw, 1.2rem)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.1',
                    overflow: 'hidden'
                }}
              >
                  {txt}
              </div>
          ))}
      </TappRect>

      {selectedClass === 1 && abilityChoice === 0 && (
          <>
            <div style={{ position: 'absolute', left: '95%', top: '19.5%', width: '9%', height: '7%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 'clamp(0.6rem, 1.5vw, 1rem)' }}>
                Bonus
            </div>
            {TOKEN_NAMES.map((t, i) => (
                <div
                    key={t}
                    onClick={() => setBonusToken(i)}
                    style={{
                        position: 'absolute',
                        left: '95%',
                        top: `${27.5 + i * 7}%`,
                        width: '9%',
                        height: '6%',
                        backgroundColor: '#000',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: 'calc(100% - 6px)', height: 'calc(100% - 6px)',
                        backgroundColor: '#fff',
                        color: bonusToken === i ? '#ff0000' : '#000000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'clamp(0.5rem, 1.2vw, 0.8rem)',
                        overflow: 'hidden'
                    }}>
                        {t}
                    </div>
                </div>
            ))}
          </>
      )}


      <TappRect x={20} y={86} w={20} h={10} color="#c8f0ff">
           <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ 
                width: '90%', 
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', 
                borderBottom: '2px solid black', 
                fontFamily: 'inherit',
                margin: 0, 
                background: 'transparent'
              }}
              placeholder="Name"
           />
        </TappRect>
              
      <TappRect x={47.5} y={86} w={34} h={10} color="#c8f0ff">
         <div style={{display:'flex', width:'100%', justifyContent:'space-around', fontSize: 'clamp(0.8rem, 2.2vw, 1.5rem)'}}>
             <span>Dmg: {finalAttack}</span>
             <span>Arm: {finalArmor}</span>
             <span>Spd: {finalSpeed}</span>
         </div>
      </TappRect>

      <div 
        onClick={handleConfirm}
        style={{
            position: 'absolute',
            left: '77.5%', top: '86%', width: '25%', height: '10%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#000',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
          <div style={{
              width: 'calc(100% - 6px)', height: 'calc(100% - 6px)',
              backgroundColor: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)',
              textAlign: 'center'
          }}>
              Continue as {name}
          </div>
      </div>

    </div>
  );
};