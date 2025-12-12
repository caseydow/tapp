import React, { useState } from 'react';
import { CLASSES, ABILITIES, COLORS, CLASS_BUFFS, TOKEN_NAMES } from '../constants';

// Helper for exact tapp.js rect styling: Black bg with slightly smaller colored inner rect
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
        transform: 'translate(-50%, -50%)', // Center based coordinates
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
          justifyContent: 'space-evenly', // Distribute items vertically
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
  const [attackMod, setAttackMod] = useState(0); // -2 to 2
  const [abilityChoice, setAbilityChoice] = useState(0); // 0, 1, or 2 (Empowered)
  const [bonusToken, setBonusToken] = useState(0);

  // Stats Logic from tapp.js
  const baseAttack = CLASS_BUFFS[0][selectedClass];
  const finalAttack = baseAttack + attackMod;
  
  const baseArmor = CLASS_BUFFS[1][selectedClass];
  const finalArmor = 2 - attackMod + baseArmor;
  
  const baseSpeed = CLASS_BUFFS[2][selectedClass];
  const finalSpeed = 30 - Math.abs(attackMod) * 15 + baseSpeed;

  const getAbilityName = () => {
      if(abilityChoice === 2) return "Empowered Strikes";
      return ABILITIES[selectedClass][abilityChoice].split(":")[0];
  };

  const handleConfirm = () => {
    let abilityStr = getAbilityName();
    onConfirm({
        name: name || "Player",
        classIndex: selectedClass,
        armor: finalArmor,
        speed: finalSpeed,
        attack: finalAttack,
        ability: abilityStr,
        bonusToken: (selectedClass === 1 && abilityChoice === 0) ? bonusToken : null
    });
  };

  return (
    <div className="screen class-select" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* --- CLASS COLUMN --- */}
      {/* Rect(width/5, height*0.52, width/5, height*0.55) -> Center(20%, 52%), Size(20%, 55%) */}
      {/* Header at width*0.2, height*0.16 -> 20%, 16% */}
      <div style={{ position: 'absolute', left: '20%', top: '16%', width: '20%', height: '14%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: '2rem' }}>Class</span>
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
              fontSize: '1.5rem'
            }}
          >
            {c}
          </div>
        ))}
      </TappRect>

      {/* --- ATTACK COLUMN --- */}
      {/* Rect(width*0.4, height*0.52, width/6, height*0.55) -> Center(40%, 52%), Size(16.66%, 55%) */}
      {/* Header at 40%, 16% */}
      <div style={{ position: 'absolute', left: '40%', top: '16%', width: '16.66%', height: '14%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: '2rem' }}>Attack</span>
      </div>

      <TappRect x={40} y={52} w={16.66} h={55} color="#c8f0ff">
         {/* In tapp.js: loop i from 2 down to -2. rect(width*0.4, height*(0.52 - i*8/75), width/7, height*0.09) */}
         {[2, 1, 0, -1, -2].map((val) => (
             <div
                key={val}
                onClick={() => setAttackMod(val)}
                style={{
                    width: '85.7%', // 1/7 relative to 1/6 is ~85%
                    height: '13%', 
                    backgroundColor: '#ffffff',
                    border: '3px solid #000',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: attackMod === val ? '#ff0000' : '#000000',
                    fontSize: '1.5rem'
                }}
             >
                 {val}
             </div>
         ))}
      </TappRect>


      {/* --- ABILITY COLUMN --- */}
      {/* Rect(width*0.7, height*0.52, width/2.5, height*0.55) -> Center(70%, 52%), Size(40%, 55%) */}
      {/* Header at 70%, 16% */}
      <div style={{ position: 'absolute', left: '70%', top: '16%', width: '40%', height: '14%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: '2rem' }}>Ability</span>
      </div>

      <TappRect x={70} y={52} w={40} h={55} color="#c8f0ff">
          {/* Abilities are 0, 1, and 4 (Empowered) */}
          {[ABILITIES[selectedClass][0], ABILITIES[selectedClass][1], ABILITIES[4]].map((txt, i) => (
              <div
                key={i}
                onClick={() => setAbilityChoice(i)}
                style={{
                    width: '92.5%', 
                    height: '28%',
                    backgroundColor: '#ffffff',
                    border: '3px solid #000',
                    padding: '10px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: abilityChoice === i ? '#ff0000' : '#000000',
                    fontSize: '1.2rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.1'
                }}
              >
                  {txt}
              </div>
          ))}
      </TappRect>

      {/* --- MAGICAL QUIVER BONUS (Archer only) --- */}
      {selectedClass === 1 && abilityChoice === 0 && (
          <>
            <div style={{ position: 'absolute', left: '95%', top: '19.5%', width: '9%', height: '7%', backgroundColor: '#c8f0ff', border: '3px solid #000', transform: 'translate(-50%, -50%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '1rem' }}>
                Bonus
            </div>
            {/* 8 Tokens: rect(width*0.95, height*(0.275 + i*0.07), width*0.09, height*0.06) */}
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
                        backgroundColor: '#000', // Border hack
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
                        fontSize: '0.8rem'
                    }}>
                        {t}
                    </div>
                </div>
            ))}
          </>
      )}


      {/* --- BOTTOM SECTION --- */}
      
      {/* NAME INPUT (Left Bottom) */}
      <TappRect x={20} y={86} w={20} h={10} color="#c8f0ff">
           <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ 
                width: '90%', 
                fontSize: '1.5rem', 
                borderBottom: '2px solid black', 
                fontFamily: 'inherit',
                margin: 0, // FIXED: Remove global margin to center vertically in TappRect
                background: 'transparent'
              }}
              placeholder="Name"
           />
        </TappRect>
              
      {/* STATS DISPLAY (Middle Bottom) */}
      <TappRect x={47.5} y={86} w={34} h={10} color="#c8f0ff">
         <div style={{display:'flex', width:'100%', justifyContent:'space-around', fontSize: '1.5rem'}}>
             <span>Damage: {finalAttack}</span>
             <span>Armor: {finalArmor}</span>
             <span>Speed: {finalSpeed}</span>
         </div>
      </TappRect>

      {/* CONTINUE BUTTON (Right Bottom) */}
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
              fontSize: '1.5rem'
          }}>
              Continue as {name}
          </div>
      </div>

    </div>
  );
};