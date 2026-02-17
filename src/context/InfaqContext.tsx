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
    refreshStatus: () => Promise<boolean>;
    isLoading: boolean;
}

const InfaqContext = createContext<InfaqContextType | undefined>(undefined);

export function InfaqProvider({ children }: { children: React.ReactNode }) {
    const [totalInfaq, setTotalInfaq] = useState(0);
    const [isMuhsininState, setIsMuhsininState] = useState(false);
    const [infaqHistory, setInfaqHistory] = useState<InfaqTransaction[]>([]);

    useEffect(() => {
        const loadFromStorage = () => {
            const [savedTotal, savedHistory, savedIsMuhsinin] = storage.getMany([
                STORAGE_KEYS.USER_TOTAL_DONATION,
                STORAGE_KEYS.USER_DONATION_HISTORY,
                STORAGE_KEYS.IS_MUHSININ as any
            ]).values();

            if (savedTotal) setTotalInfaq(parseInt(savedTotal as string, 10));
            if (savedHistory) setInfaqHistory(typeof savedHistory === 'string' ? JSON.parse(savedHistory) : savedHistory);
            if (savedIsMuhsinin !== undefined) setIsMuhsininState(savedIsMuhsinin === 'true' || savedIsMuhsinin === true);
        };

        // Initial Load
        loadFromStorage();

        // Listen for external updates (e.g., from GuestSyncManager or other tabs)
        const handleUpdates = () => {
            loadFromStorage();
        };

        window.addEventListener("storage", handleUpdates);
        window.addEventListener("infaq_updated", handleUpdates);

        return () => {
            window.removeEventListener("storage", handleUpdates);
            window.removeEventListener("infaq_updated", handleUpdates);
        };
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
        storage.setMany(new Map<string, any>([
            [STORAGE_KEYS.USER_TOTAL_DONATION as any, newTotal.toString()],
            [STORAGE_KEYS.USER_DONATION_HISTORY as any, newHistory]
        ]));

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent("infaq_updated", {
            detail: { isMuhsinin: true, total: newTotal }
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

    const refreshStatus = async (): Promise<boolean> => {
        try {
            const res = await fetch("/api/user/full-data");
            if (res.ok) {
                const data = await res.json();
                if (data.profile) {
                    const serverIsMuhsinin = data.profile.isMuhsinin === true;
                    const newTotal = data.profile.totalInfaq || 0;

                    const changed = (serverIsMuhsinin !== isMuhsininState || newTotal !== totalInfaq);

                    if (changed) {
                        setIsMuhsininState(serverIsMuhsinin);
                        setTotalInfaq(newTotal);
                        storage.set(STORAGE_KEYS.IS_MUHSININ as any, serverIsMuhsinin.toString());
                        storage.set(STORAGE_KEYS.USER_TOTAL_DONATION as any, newTotal.toString());

                        // Dispatch event for other components
                        window.dispatchEvent(new CustomEvent("infaq_updated", {
                            detail: { isMuhsinin: serverIsMuhsinin, total: newTotal }
                        }));
                    }
                    return serverIsMuhsinin;
                }
            }
        } catch (e) {
            console.error("Failed to refresh infaq status", e);
        }
        return isMuhsininState;
    };

    const isMuhsinin = isMuhsininState;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFromStorage = () => {
            const [savedTotal, savedHistory, savedIsMuhsinin] = storage.getMany([
                STORAGE_KEYS.USER_TOTAL_DONATION,
                STORAGE_KEYS.USER_DONATION_HISTORY,
                STORAGE_KEYS.IS_MUHSININ as any
            ]).values();

            if (savedTotal) setTotalInfaq(parseInt(savedTotal as string, 10));
            if (savedHistory) setInfaqHistory(typeof savedHistory === 'string' ? JSON.parse(savedHistory) : savedHistory);
            if (savedIsMuhsinin !== undefined) setIsMuhsininState(savedIsMuhsinin === 'true' || savedIsMuhsinin === true);

            setIsLoading(false);
        };

        // Initial Load
        loadFromStorage();

        // Listen for external updates (e.g., from GuestSyncManager or other tabs)
        const handleUpdates = () => {
            loadFromStorage();
        };

        window.addEventListener("storage", handleUpdates);
        window.addEventListener("infaq_updated", handleUpdates);

        return () => {
            window.removeEventListener("storage", handleUpdates);
            window.removeEventListener("infaq_updated", handleUpdates);
        };
    }, []);

    // ... (rest of methods) ...

    return (
        <InfaqContext.Provider value={{ isMuhsinin, totalInfaq, infaqHistory, submitInfaq, resetInfaq, refreshStatus, isLoading }}>
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
