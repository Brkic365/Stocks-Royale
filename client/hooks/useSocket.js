"use client";
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
let socket;

export default function useSocket() {
    useEffect(() => {
        if (!socket) {
            socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        return () => {
            // Do not disconnect on unmount, keep singleton alive
        };
    }, []);

    return socket;
}
