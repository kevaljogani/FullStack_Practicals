import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
        },
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Online users
      newSocket.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      // Real-time notifications
      newSocket.on('notification', (notification) => {
        toast.success(notification.title, {
          description: notification.message,
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
  }, [user]);

  // Join a room (for forum discussions, event chats, etc.)
  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join-room', roomId);
    }
  };

  // Leave a room
  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
  };

  // Send a message
  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('send-message', {
        roomId,
        message,
        user: {
          id: user.id,
          name: user.name,
          profilePicture: user.profile?.profilePicture,
        },
      });
    }
  };

  // Typing indicators
  const startTyping = (roomId) => {
    if (socket) {
      socket.emit('typing', {
        roomId,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    }
  };

  const stopTyping = (roomId) => {
    if (socket) {
      socket.emit('stop-typing', {
        roomId,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    }
  };

  // Event listeners for real-time messages
  const onMessage = (callback) => {
    if (socket) {
      socket.on('receive-message', callback);
    }
  };

  const onTyping = (callback) => {
    if (socket) {
      socket.on('user-typing', callback);
    }
  };

  const onStopTyping = (callback) => {
    if (socket) {
      socket.on('user-stop-typing', callback);
    }
  };

  // Remove event listeners
  const offMessage = () => {
    if (socket) {
      socket.off('receive-message');
    }
  };

  const offTyping = () => {
    if (socket) {
      socket.off('user-typing');
      socket.off('user-stop-typing');
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    onMessage,
    onTyping,
    onStopTyping,
    offMessage,
    offTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
