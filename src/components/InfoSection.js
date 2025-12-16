import React, { useState } from 'react';

export const InfoSection = () => {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <>
      <h1>
        How to Play
        <button 
          type="button" 
          onClick={() => setExpanded(!isExpanded)} 
          style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '10px' }}
          aria-label="How to Play"
        >
          <i className={`arrow ${isExpanded ? 'rotate-down' : 'rotate-right'}`} id="arrow"></i>
        </button>
      </h1>
      <div 
        id="content" 
        className={isExpanded ? 'expand' : 'contract'}
        style={{ maxHeight: isExpanded ? '100em' : '0', display: 'block', overflow: 'hidden' }}
      >
        <h3>Controls:</h3>
        <p>
          - Click "Create Game" or enter a game code to begin.<br/>
          - On the character building screen, build a character and type a name.<br/>
          - Click the deck or one of three cards to draw a card.<br/>
          - Click a card in your hand to select it and use the controls on the side to play.<br/>
          - Right click a card to enlarge it.<br/>
          - Click on an opponent's hand or name to view their stats.<br/>
        </p>
        <h3>Building Phase:</h3>
        <p>
          - Start by choosing your class, bonus attack, and ability. Then, perform all actions relating to your class and ability.<br/>
          - After this is done, each player may draw five cards and discard one, leaving them with four to begin the game.
        </p>
        <h3>Combat Phase:</h3>
        <p>
          - Each player begins with 100 hitpoints, and loses them as they are damaged.<br/>
          - In order of speed, players begin their turn by discarding as desired, then drawing once if they have less than five cards.<br/>
          - Players attack the player with the next lowest speed, looping around and skipping themself.<br/>
          - After attacking, the weapon's ability activates, and the card is discarded. Numbers always round down.<br/>
          - This phase ends when the deck runs out or a player loses all their hitpoints.
        </p>
        <h3>Intermission Phase:</h3>
        <p>
          - The player with the most hitpoints loses 0 Life Points. Each next place loses 2 more. Ties go to the faster player.<br/>
          - All players discard until they have 3 cards.<br/>
          - The winner draws cards equal to the amount of players, keeps one, and passes the rest to second place. Repeat.<br/>
          - Each player draws three tokens, and keeps one. Mages gain an extra random token as well.<br/>
          - The deck is reshuffled (players keep cards in their hand) and another combat phase begins.
        </p>
      </div>
    </>
  );
};