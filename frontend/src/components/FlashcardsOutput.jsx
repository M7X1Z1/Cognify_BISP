import { useState, useEffect } from 'react';
import { parseFlashcards } from '../utils/outputParsers';

export default function FlashcardsOutput({ output }) {
  const cards = parseFlashcards(output);
  const [flipped, setFlipped] = useState(new Set());

  useEffect(() => {
    setFlipped(new Set());
  }, [output]);

  if (!cards.length) {
    return (
      <div>
        <p style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          Could not parse flashcard format. Showing raw output:
        </p>
        <pre className="output-text">{output}</pre>
      </div>
    );
  }

  const toggle = idx =>
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  return (
    <div className="flashcards-output">
      <p className="flashcards-hint">Click a card to reveal the answer</p>
      <div className="flashcards-grid">
        {cards.map((card, idx) => {
          const isFlipped = flipped.has(idx);
          return (
            <div
              key={idx}
              className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
              onClick={() => toggle(idx)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <span className="card-label">Question</span>
                  <p>{card.question}</p>
                </div>
                <div className="flashcard-back">
                  <span className="card-label">Answer</span>
                  <p>{card.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
