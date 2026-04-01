import { io } from 'socket.io-client';

class SocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = new Map();
    }

    connect(token, serverUrl = 'http://localhost:5000') {
        if (this.socket && this.connected) {
            return this.socket;
        }

        this.socket = io(serverUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            maxReconnectionAttempts: 5
        });

        this.setupEventListeners();
        return this.socket;
    }

    notifyListeners(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(...args));
        }
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully');
            console.log('🔗 Socket ID:', this.socket.id);
            this.connected = true;
            this.notifyListeners('connectionChange', true);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.connected = false;
            this.notifyListeners('connectionChange', false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            console.error('🔍 Error details:', error.message, error.code);
            this.connected = false;
            this.notifyListeners('connectionChange', false);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Socket reconnection attempt:', attemptNumber);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Socket reconnection failed');
            this.connected = false;
            this.notifyListeners('connectionChange', false);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }

        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event, ...args) {
        if (this.socket && this.connected) {
            this.socket.emit(event, ...args);
        }
    }

    isConnected() {
        return this.connected;
    }

    getSocket() {
        return this.socket;
    }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;
