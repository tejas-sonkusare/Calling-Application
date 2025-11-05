import { useState, useEffect, useRef } from 'react';
import './MessageOptions.css';

function MessageOptions({ message, onReply, onReact, onEdit, onDelete, isOwn }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef(null);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const handleReaction = (emoji) => {
    onReact(message.id, emoji);
    setShowReactions(false);
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowReactions(false);
      }
    };

    if (showMenu || showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showReactions]);

  return (
    <div className="message-options" ref={menuRef}>
      <button
        className="message-options-btn"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
          setShowReactions(false);
        }}
      >
        ⋮
      </button>

      {showMenu && (
        <div className="message-options-menu">
          {!isOwn && (
            <button onClick={(e) => { 
              e.stopPropagation();
              onReply(); 
              setShowMenu(false); 
            }}>
              💬 Reply
            </button>
          )}
          <button onClick={(e) => { 
            e.stopPropagation();
            setShowReactions(true); 
            setShowMenu(false);
          }}>
            😊 React
          </button>
          {isOwn && (
            <>
              <button onClick={(e) => { 
                e.stopPropagation();
                onEdit(); 
                setShowMenu(false); 
              }}>
                ✏️ Edit
              </button>
              <button onClick={(e) => { 
                e.stopPropagation();
                onDelete(); 
                setShowMenu(false); 
              }}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      )}

      {showReactions && (
        <div className="reactions-picker">
          {reactions.map(emoji => (
            <button
              key={emoji}
              className="reaction-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction(emoji);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageOptions;

