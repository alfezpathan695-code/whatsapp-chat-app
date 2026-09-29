import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect('https://sour-pets-strive.loca.lt');

function App() {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const joinRoom = () => {
    if (room !== '') {
      socket.emit('join_room', room);
      setJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== '') {
      const messageData = {
        room: room,
        author: socket.id,
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage('');
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  // Agar room join nahi kiya toh WhatsApp Jaisa Login/Room Screen dikhega
  if (!joined) {
    return (
      <div style={styles.joinContainer}>
        <div style={styles.joinCard}>
          <h2 style={{ color: '#075e54', marginBottom: '10px' }}>WhatsApp Web Clone</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Apna Room ID daalein ya dost ke sath share kiya gaya code yahan enter karein:
          </p>
          <input
            type="text"
            placeholder="Room ID (jaise: dost123)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={styles.joinInput}
          />
          <br />
          <button onClick={joinRoom} style={styles.joinBtn}>
            Chat Start Karein
          </button>
        </div>
      </div>
    );
  }

  // Room join hone ke baad WhatsApp ki chat screen dikhegi
  return (
    <div style={styles.whatsappContainer}>
      {/* WhatsApp Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>TP</div>
          <div>
            <h3 style={styles.headerTitle}>Room: {room}</h3>
            <span style={styles.headerStatus}>online</span>
          </div>
        </div>
        <div style={styles.shareBox}>
          <span style={{ fontSize: '12px' }}>Link Share: </span>
          <button 
            onClick={() => alert(`Room ID: ${room} apne dost ko do taaki wo bhi join kar sake!`)}
            style={styles.shareBtn}
          >
            Info
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div style={styles.chatBody}>
        {messageList.map((content, index) => {
          const isMe = content.author === socket.id;
          return (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  backgroundColor: isMe ? '#dcf8c6' : '#ffffff',
                }}
              >
                <p style={styles.msgText}>{content.message}</p>
                <span style={styles.msgTime}>{content.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Footer / Input Box */}
      <form onSubmit={sendMessage} style={styles.footer}>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.msgInput}
        />
        <button type="submit" style={styles.sendBtn}>
          ➤
        </button>
      </form>
    </div>
  );
}

// WhatsApp Styling Object
const styles = {
  joinContainer: {
    height: '100vh',
    backgroundColor: '#dadbd4',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
  },
  joinCard: {
    backgroundColor: '#white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    textAlign: 'center',
    background: '#fff',
    width: '350px',
  },
  joinInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '15px',
    fontSize: '16px',
    outline: 'none',
  },
  joinBtn: {
    backgroundColor: '#075e54',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold',
  },
  whatsappContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#efeae2',
    fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  header: {
    backgroundColor: '#075e54',
    color: 'white',
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#25d366',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
  },
  headerStatus: {
    fontSize: '12px',
    color: '#e0e0e0',
  },
  shareBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#fff',
  },
  shareBtn: {
    backgroundColor: '#25d366',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  chatBody: {
    flex: 1,
    padding: '20px',
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '8px 12px',
    borderRadius: '7.5px',
    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
    position: 'relative',
    wordBreak: 'break-word',
  },
  msgText: {
    margin: 0,
    fontSize: '14.5px',
    color: '#303030',
    paddingRight: '45px',
  },
  msgTime: {
    fontSize: '10px',
    color: '#999',
    position: 'absolute',
    bottom: '4px',
    right: '8px',
  },
  footer: {
    backgroundColor: '#f0f2f5',
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  msgInput: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '20px',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    backgroundColor: '#white',
  },
  sendBtn: {
    backgroundColor: '#00a884',
    color: 'white',
    border: 'none',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default App;