import { useState } from 'react';
import { parseQuiz } from '../utils/outputParsers';

export default function QuizOutput({ output }) {
  const questions = parseQuiz(output);
  const [selected, setSelected] = useState({});
  const [checked, setChecked] = useState({});

  if (!questions.length) {
    return (
      <div>
        <p style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          Could not parse quiz format. Showing raw output:
        </p>
        <pre className="output-text">{output}</pre>
      </div>
    );
  }

  return (
    <div className="quiz-output">
      {questions.map((q, idx) => {
        const userAnswer = selected[idx];
        const isChecked = checked[idx];
        const isCorrect = userAnswer === q.answer;

        return (
          <div key={idx} className={`quiz-question ${isChecked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
            <p className="quiz-q-text">
              <span className="quiz-q-num">Q{idx + 1}.</span> {q.question}
            </p>
            <div className="quiz-options">
              {Object.entries(q.options).map(([letter, text]) => {
                const isSelected = userAnswer === letter;
                const showResult = isChecked;
                const isRightAnswer = letter === q.answer;
                let optionClass = 'quiz-option';
                if (showResult && isRightAnswer) optionClass += ' option-correct';
                else if (showResult && isSelected && !isRightAnswer) optionClass += ' option-wrong';
                else if (isSelected) optionClass += ' option-selected';

                return (
                  <button
                    key={letter}
                    className={optionClass}
                    onClick={() => !isChecked && setSelected(prev => ({ ...prev, [idx]: letter }))}
                    disabled={isChecked}
                  >
                    <span className="option-letter">{letter}</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
            {!isChecked ? (
              <button
                className="btn-check"
                onClick={() => setChecked(prev => ({ ...prev, [idx]: true }))}
                disabled={!userAnswer}
              >
                Check Answer
              </button>
            ) : (
              <p className={`quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                {isCorrect ? '✓ Correct!' : `✗ Wrong — correct answer: ${q.answer}`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
