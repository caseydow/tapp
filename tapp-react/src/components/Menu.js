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
          <h1 style={{fontSize: '4rem', margin: 0}}>CREATE GAME</h1>
          <p style={{fontSize: '2rem'}}>Players: {players}</p>
          <div style={{margin:'20px'}}>
             <button onClick={() => setPlayers(2)}>2</button>
             <button onClick={() => setPlayers(3)}>3</button>
             <button onClick={() => setPlayers(4)}>4</button>
          </div>
          
          <button 
             onClick={() => setIncantations(!incantations)}
             style={{fontSize: '1.5rem', marginBottom: '20px', width: '300px'}}
          >
             Incantations: {incantations ? 'On' : 'Off'}
          </button>
          <br/>

          <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
             <button onClick={() => onCreate(players, incantations)}>Start</button>
             <button onClick={() => setMode('MAIN')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen menu">
      <div className="menu-box">
        <h1 style={{fontSize: '6rem', margin: '0 0 20px 0'}}>TAPP</h1>
        <div style={{margin: '20px 0'}}>
            <label style={{fontSize: '1.5rem'}}>GAME ID:</label><br/>
            <input 
                value={inputId} 
                onChange={(e) => setInputId(e.target.value)} 
                maxLength={4}
            />
        </div>
        <button onClick={() => onJoin(inputId)}>Join Game</button>
        <br/><br/>
        <button onClick={() => setMode('CREATE')} style={{fontSize: '1rem', opacity: 0.8}}>Create New</button>
      </div>
    </div>
  );
};