import { useState, useEffect, useRef } from 'react';
import styles from './Chatbot.module.css';
import RecommendationEngine from './RecommendationEngine';

const Chatbot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { 
      text: "Hi! I'm your Vortax assistant. Ask me for recommendations like 'funny movies' or 'exciting shows'!", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const engine = new RecommendationEngine(userId);
      const response = { text: "", sender: 'bot' };
      
      // Process all queries
      const recs = await engine.getRecommendations(input);
      
      if (recs.length > 0) {
        // Split into Vortax (local) and other platforms (TMDB)
        const vortaxRecs = recs.filter(item => item.source === 'local');
        const otherRecs = recs.filter(item => item.source === 'tmdb');
        
        response.text = "Here are recommendations based on your request:";
        
        // Only include sections that have content
        response.recommendations = {
          vortax: vortaxRecs.length > 0 ? vortaxRecs : null,
          other: otherRecs.length > 0 ? otherRecs : null
        };
      } else {
        response.text = "I couldn't find recommendations for that. Try something like 'comedy movies' or 'thriller shows'.";
      }
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatHeader}>
        <h3>Vortax Assistant</h3>
        
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`${styles.message} ${msg.sender === 'user' 
              ? styles.userMessage 
              : styles.botMessage} ${msg.isError ? styles.errorMessage : ''}`}
          >
            <p>{msg.text}</p>
            
            {msg.recommendations && (
              <div className={styles.recommendations}>
                {/* Vortax Recommendations */}
                {msg.recommendations.vortax && (
                  <div className={styles.recommendationSection}>
                    <h4>Available on Vortax:</h4>
                    <ul className={styles.recommendationList}>
                      {msg.recommendations.vortax.map(rec => (
                        <li key={rec.id} className={styles.recommendationItem}>
                          {rec.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Other Platforms Recommendations */}
                {msg.recommendations.other && (
                  <div className={styles.recommendationSection}>
                    <h4>Available on other platforms:</h4>
                    <ul className={styles.recommendationList}>
                      {msg.recommendations.other.map(rec => (
                        <li key={rec.id} className={styles.recommendationItem}>
                          {rec.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for recommendations..."
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;