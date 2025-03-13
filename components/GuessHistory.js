import React from 'react';
import styles from '@/styles/ChatHistory.module.css';
import utilStyles from '@/styles/utils.module.css';

const GuessHistory = ({ guesses }) => {
    if (!guesses || guesses.length === 0) {
        return null;
    }
    
    // Get model image based on model name
    const getModelImage = (model) => {
        switch(model) {
            case 'gpt-4':
                return '/icons/gpt-model.png';
            case 'claude-3':
                return '/icons/claude-model.png';
            case 'llama-3':
                return '/icons/llama-model.png';
            default:
                return '/icons/bot.png';
        }
    };
    
    return (
        <div className={styles.guessHistoryContainer}>
            <h2 className={utilStyles.headingLg}>Previous Guesses</h2>
            
            {guesses.map((guess, index) => {
                const correctModel = guess.responses[guess.correctIndex].model;
                const guessedModel = guess.responses[guess.guessedIndex].model;
                
                return (
                    <div key={`guess-${index}`} className={styles.guessHistoryItem} style={{
                        padding: '15px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        backgroundColor: guess.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: `2px solid ${guess.isCorrect ? '#4caf50' : '#f44336'}`
                    }}>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                            Question: {guess.prompt}
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center'
                        }}>
                            <div style={{ 
                                textAlign: 'center', 
                                margin: '0 20px',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)'
                            }}>
                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Correct Answer</p>
                                <img 
                                    src={getModelImage(correctModel)} 
                                    alt={correctModel} 
                                    style={{ 
                                        width: '36px', 
                                        height: '36px', 
                                        margin: '5px 0',
                                        borderRadius: '50%'
                                    }}
                                />
                                <p style={{ margin: '5px 0' }}>{correctModel}</p>
                            </div>
                            
                            <div style={{ 
                                textAlign: 'center', 
                                margin: '0 20px',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: guess.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                            }}>
                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Your Guess</p>
                                <img 
                                    src={getModelImage(guessedModel)} 
                                    alt={guessedModel} 
                                    style={{ 
                                        width: '36px', 
                                        height: '36px', 
                                        margin: '5px 0',
                                        borderRadius: '50%'
                                    }}
                                />
                                <p style={{ margin: '5px 0' }}>{guessedModel}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GuessHistory;