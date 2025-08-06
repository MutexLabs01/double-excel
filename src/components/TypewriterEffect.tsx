import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorClassName?: string;
  repeat?: boolean;
  repeatDelay?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  speed = 100,
  delay = 500,
  className = '',
  cursorClassName = '',
  repeat = false,
  repeatDelay = 2000
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      setIsComplete(true);
      
      // Handle repeat if enabled
      if (repeat) {
        const repeatTimer = setTimeout(() => {
          setDisplayText('');
          setCurrentIndex(0);
          setIsTyping(false);
          setIsComplete(false);
        }, repeatDelay);
        return () => clearTimeout(repeatTimer);
      }
    }
  }, [currentIndex, text, speed, repeat, repeatDelay]);

  useEffect(() => {
    // Reset animation when text changes
    setDisplayText('');
    setCurrentIndex(0);
    setIsTyping(false);
    setIsComplete(false);
    
    const timer = setTimeout(() => {
      setCurrentIndex(0);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <div className={`inline-block ${className}`}>
      <span className="font-mono font-bold tracking-wider">
        {displayText}
      </span>
      <span 
        className={`inline-block w-1 h-8 bg-green-500 ml-1 rounded-sm ${
          isTyping || isComplete ? 'animate-pulse' : 'opacity-0'
        } ${cursorClassName}`}
      />
    </div>
  );
};

export default TypewriterEffect; 