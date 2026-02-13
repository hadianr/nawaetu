"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();

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
        const [savedTotal, savedHistory] = storage.getMany([
            STORAGE_KEYS.USER_TOTAL_DONATION,
            STORAGE_KEYS.USER_DONATION_HISTORY
        ]).values();

        if (savedTotal) setTotalInfaq(parseInt(savedTotal as string, 10));
        if (savedHistory) setInfaqHistory(typeof savedHistory === 'string' ? JSON.parse(savedHistory) : savedHistory);
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
        storage.setMany(new Map([
            [STORAGE_KEYS.USER_TOTAL_DONATION as any, newTotal.toString()],
            [STORAGE_KEYS.USER_DONATION_HISTORY as any, JSON.stringify(newHistory)]
        ]));

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent("infaq_updated", {
            detail: { isMuhsinin: newTotal > 0, total: newTotal }
        }));
    };

    const resetInfaq = () => {
        setTotalInfaq(0);
        setInfaqHistory([]);
        storage.remove(STORAGE_KEYS.USER_TOTAL_DONATION as any);
        storage.remove(STORAGE_KEYS.USER_DONATION_HISTORY as any);
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
