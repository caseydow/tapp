import React from 'react';
import './App.css';
import { useGameEngine } from './hooks/useGameEngine';
import { Menu } from './components/Menu';
import { ClassSelector } from './components/ClassSelector';
import GameCanvas from './components/GameCanvas';
import { InfoSection } from './components/InfoSection';

function App() {
  const { 
    gameState,      
    gameStateObj, 
    gameId, 
    myHandIndex, 
    logMessages, 
    joinGame, 
    createGame, 
    sendAction 
  } = useGameEngine();

  const handleClassConfirm = (stats) => {
    let msg = `User${myHandIndex};${stats.name};${stats.classIndex};${stats.armor};${stats.speed};${stats.attack};${stats.ability}`;
    
    if (stats.classIndex === 2) {
         msg += ";" + Math.floor(Math.random() * 8);
    }
    if (stats.ability === "Hoarding") {
         msg += ";" + Math.floor(Math.random() * 4) + ";" + (Math.floor(Math.random() * 4) + 4);
    }
    if (stats.ability === "Magical Quiver") {
         msg += ";2;" + (stats.bonusToken !== null ? stats.bonusToken : 0);
    }
    
    sendAction(msg);
  };

  return (
    <div className="App">
      {/* Navigation (Mimicking universal/nav.html placeholder) */}
      <nav style={{padding: '10px 20px', background: '#333', color: '#fff', fontSize: '1.2rem'}}>
         {/* In original this was an external file. We keep a simple header. */}
         GAME DESIGN CLUB {gameId ? `| Game ID: ${gameId}` : ''}
      </nav>

      {/* Game Section */}
      <section className="game-section">
        {/* Canvas Area (3/4 width) */}
        <article className="threefourth" id="canvasWrap">
          <GameCanvas 
            gameStateObj={gameStateObj} 
            myHandIndex={myHandIndex} 
            sendAction={sendAction}
          />
          
          {/* Overlays (Menu / Class Selector) */}
          {gameState !== 'GAME' && (
            <div className="overlay-container">
              {gameState === 'MENU' && <Menu onJoin={joinGame} onCreate={createGame} />}
              {gameState === 'LOBBY' && <ClassSelector onConfirm={handleClassConfirm} />}
            </div>
          )}
        </article>

        {/* Log Area (1/4 width) */}
        <article className="fourth">
          <log id="log">
            {logMessages.map((msg) => (
              <div key={msg.key}>
                  <span dangerouslySetInnerHTML={{__html: msg.raw.replace(/>/g, '&gt;').replace(/#[0-9a-f]{6}/g, '')}} />
              </div>
            ))}
          </log>
        </article>
      </section>

      {/* Introduction Section */}
      <section style={{ maxWidth: '600px', margin: 'auto', textAlign: 'center', padding: '0 20px' }}>
        <article>
          <h1>TAPP</h1>
          <h4>TAPP is a game of strategy which focuses on building a unique character and battling opponents over a series of rounds. The wide variety of builds and cards means that every game will always be unique!</h4>
          <p style={{ opacity: '60%' }}>
            <a href="./downloads/cards.zip" download="TAPP Cards" style={{color: 'inherit'}}>Click to Download the Card Designs</a><br/>
            <a href="https://docs.google.com/spreadsheets/d/1Ut25LnsZv1SjcmGxaavKhANNh-YHvjs9GYHRkQPpD0U/edit?usp=sharing" target="_blank" rel="noreferrer" style={{color: 'inherit'}}>Click to View the Game Sheet</a>
          </p>
        </article>
      </section>

      {/* How to Play Section */}
      <section style={{ marginTop: '20px' }}>
        <article style={{ width: '100%', padding: '0 40px', boxSizing: 'border-box' }}>
          <InfoSection />
        </article>
      </section>

      {/* Development Section */}
      <section style={{ padding: '0 40px' }}>
        <article style={{ width: '100%' }}>
          <h1>Development</h1>
          <h3>Initial Idea</h3>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In early October of 2020, we decided to begin on our first real club game, after going through a few ideas and play testing a few games. The main goal of the game was to increase your own character's power level in order to eliminate your opponents' health. There were originally two phases: Team Building and Combat Phase. Team Building would be where players choose their character's attributes, and gain their weapons. Combat Phase would be where players fight each other, dealing damage, which would eventually result in Life Point damage.
          <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Four classes were developed: Knight, Archer, Mage, Berserker. Each had preset attributes, and each had limitations to certain abilities. There was a deck of 52 cards, comprised of 4 rarities of weapons from each class, some with special abilities. Each weapon could be used a certain amount of times before being destroyed.</p>
          
          <h3>Overhauling the Game</h3>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;After around a month of play testing, a new idea was proposed which would completely change the game: instead of each weapon having multiple uses, they could only be used once. This may not at first seem like much, but it turned the game from playing the same weapon over and over to a much more interactive and engaging card game. This also resulted in many weapons with abilities based on usage being completely redesigned. Classes were then changed to have lower attribute increases and decreases, but each class had a choice of abilities to distinguish it from the others. Additionally, Berserker was renamed to Warlock, gaining the Soul type, a distinguished type focusing on high damage.
          <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tokens were added to the game, giving either a permenant stat increase or a temperary boost. Attacks became structured to reduce targetting which made the game unplayable in some cases and an Intermision phase was added to upgrade characters after each round. Additionally, Incantations were added, which was a card which changed based on the class of the user. All of this resulted in a much more fun game which could be played repeatedly, and be different each time.</p>
          
          <h3>Finalizing</h3>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A few months later, after a lot of playtesting, weapon changes, and abilitiy changes the game finally reached a finalized state. Additionally, by this point, a set of three face up cards were included with the draw pile, allowing for further specialization, and an online version was developed to aid playing during the pandemic. Cards images were developed for every weapon, and the game was finally finished in March of 2021.</p>
        </article>
      </section>

      {/* Footer (Mimicking universal/footer.html) */}
      <footer style={{ padding: '20px', textAlign: 'center', background: '#eee', marginTop: '40px' }}>
          &copy; Game Design Club
      </footer>
    </div>
  );
}

export default App;