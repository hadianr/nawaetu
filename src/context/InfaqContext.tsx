"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface InfaqTransaction {
    id: string;
    amount: number;
    date: string;
}

interface InfaqContextType {
    isMuhsinin: boolean;
    totalInfaq: number;
    infaqHistory: InfaqTransaction[];
    submitInfaq: (amount: number) => void;
    resetInfaq: () => void; // For testing/debug if needed
}

const InfaqContext = createContext<InfaqContextType | undefined>(undefined);

export function InfaqProvider({ children }: { children: React.ReactNode }) {
    const [totalInfaq, setTotalInfaq] = useState(0);
    const [infaqHistory, setInfaqHistory] = useState<InfaqTransaction[]>([]);

    useEffect(() => {
        // Load persist state
        const savedTotal = localStorage.getItem("user_total_infaq");
        const savedHistory = localStorage.getItem("user_infaq_history");

        if (savedTotal) setTotalInfaq(parseInt(savedTotal, 10));
        if (savedHistory) setInfaqHistory(JSON.parse(savedHistory));
    }, []);

    const submitInfaq = (amount: number) => {
        const newTotal = totalInfaq + amount;
        const newTransaction: InfaqTransaction = {
            id: Date.now().toString(),
            amount,
            date: new Date().toISOString()
        };
        const newHistory = [...infaqHistory, newTransaction];

        setTotalInfaq(newTotal);
        setInfaqHistory(newHistory);

        // Persist
        localStorage.setItem("user_total_infaq", newTotal.toString());
        localStorage.setItem("user_infaq_history", JSON.stringify(newHistory));

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent("infaq_updated", {
            detail: { isMuhsinin: newTotal > 0, total: newTotal }
        }));
    };

    const resetInfaq = () => {
        setTotalInfaq(0);
        setInfaqHistory([]);
        localStorage.removeItem("user_total_infaq");
        localStorage.removeItem("user_infaq_history");
        window.dispatchEvent(new CustomEvent("infaq_updated", {
            detail: { isMuhsinin: false, total: 0 }
        }));
    };

    const isMuhsinin = totalInfaq > 0;

    return (
        <InfaqContext.Provider value={{ isMuhsinin, totalInfaq, infaqHistory, submitInfaq, resetInfaq }}>
            {children}
        </InfaqContext.Provider>
    );
}

export function useInfaq() {
    const context = useContext(InfaqContext);
    if (context === undefined) {
        throw new Error("useInfaq must be used within an InfaqProvider");
    }
    return context;
}
