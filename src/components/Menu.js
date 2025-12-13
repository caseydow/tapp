import React, { useState } from 'react';

export const Menu = ({ onJoin, onCreate }) => {
  const [mode, setMode] = useState('MAIN');
  const [inputId, setInputId] = useState('');
  const [incantations, setIncantations] = useState(true);
  const [players, setPlayers] = useState(2);

  if (mode === 'CREATE') {
    return (
      <div className="screen menu">
        <div className="menu-box">
          <h1 style={{fontSize: 'clamp(2.5rem, 10vw, 4rem)', margin: 0}}>CREATE GAME</h1>
          <p style={{fontSize: 'clamp(1.2rem, 5vw, 2rem)'}}>Players: {players}</p>
          
          <div style={{margin:'20px', display: 'flex', gap: '20px', justifyContent: 'center'}}>
             <button onClick={() => setPlayers(2)} style={{minWidth: '60px', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>2</button>
             <button onClick={() => setPlayers(3)} style={{minWidth: '60px', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>3</button>
             <button onClick={() => setPlayers(4)} style={{minWidth: '60px', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>4</button>
          </div>
          
          <button 
             onClick={() => setIncantations(!incantations)}
             style={{
               fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
               marginBottom: '20px', 
               width: '100%', 
               maxWidth: '300px',
               padding: '10px'
             }}
          >
             Incantations: {incantations ? 'On' : 'Off'}
          </button>
          <br/>

          <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
             <button onClick={() => onCreate(players, incantations)} style={{fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>Start</button>
             <button onClick={() => setMode('MAIN')} style={{fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen menu">
      <div className="menu-box">
        <h1 style={{fontSize: 'clamp(4rem, 15vw, 6rem)', margin: '0 0 20px 0'}}>TAPP</h1>
        <div style={{margin: '20px 0'}}>
            <label style={{fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>GAME ID:</label><br/>
            <input 
                value={inputId} 
                onChange={(e) => setInputId(e.target.value)} 
                maxLength={4}
                style={{fontSize: 'clamp(1.5rem, 5vw, 2rem)', width: '80%'}}
            />
        </div>
        <button onClick={() => onJoin(inputId)} style={{fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'}}>Join Game</button>
        <br/><br/>
        <button onClick={() => setMode('CREATE')} style={{fontSize: 'clamp(0.8rem, 3vw, 1rem)', opacity: 0.8}}>Create New</button>
      </div>
    </div>
  );
};