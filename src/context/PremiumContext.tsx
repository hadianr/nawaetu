"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PremiumContextType {
    isPremium: boolean;
    upgradeToPremium: () => void;
    cancelPremium: () => void; // For testing/demo
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        // Load persist state
        const saved = localStorage.getItem("user_is_premium");
        if (saved === "true") {
            setIsPremium(true);
        }
    }, []);

    const upgradeToPremium = () => {
        setIsPremium(true);
        localStorage.setItem("user_is_premium", "true");
        // Dispatch event for instant UI updates if needed
        window.dispatchEvent(new CustomEvent("premium_status_changed", { detail: { isPremium: true } }));
    };

    const cancelPremium = () => {
        setIsPremium(false);
        localStorage.setItem("user_is_premium", "false");
        window.dispatchEvent(new CustomEvent("premium_status_changed", { detail: { isPremium: false } }));
    };

    return (
        <PremiumContext.Provider value={{ isPremium, upgradeToPremium, cancelPremium }}>
            {children}
        </PremiumContext.Provider>
    );
}

export function usePremium() {
    const context = useContext(PremiumContext);
    if (context === undefined) {
        throw new Error("usePremium must be used within a PremiumProvider");
    }
    return context;
}
