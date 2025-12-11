"use client";
import React, { createContext, useContext, useState } from 'react';
import ErrorModal from '@/components/ErrorModal';

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
    const [error, setError] = useState(null); // { message: string, title?: string }

    const showError = (message, title = "Error") => {
        setError({ message, title });
    };

    const hideError = () => {
        setError(null);
    };

    return (
        <ErrorContext.Provider value={{ showError }}>
            {children}
            {error && <ErrorModal message={error.message} title={error.title} onClose={hideError} />}
        </ErrorContext.Provider>
    );
}

export function useError() {
    return useContext(ErrorContext);
}
