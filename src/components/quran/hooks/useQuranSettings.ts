import { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DEFAULT_SETTINGS } from "@/data/settings-data";

export type ScriptType = 'tajweed' | 'indopak';
export type ViewMode = 'list' | 'mushaf';
export type FontSize = 'small' | 'medium' | 'large';

export function useQuranSettings(currentLocale: string) {
    const router = useRouter();
    const [fontSize, setFontSize] = useState<FontSize>('medium');
    const [showTransliteration, setShowTransliteration] = useState(true);
    const [scriptType, setScriptType] = useState<ScriptType>('indopak');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [perPage, setPerPage] = useState<number>(DEFAULT_SETTINGS.versesPerPage);
    const [locale, setLocale] = useState<string>(currentLocale);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const cookies = document.cookie.split(';');
        const perPageCookie = cookies.find(c => c.trim().startsWith('settings_verses_per_page='));
        if (perPageCookie) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPerPage(parseInt(perPageCookie.split('=')[1]));
        }
    }, []);

    const handlePerPageChange = useCallback((value: number) => {
        setPerPage(value);
        document.cookie = `settings_verses_per_page=${value}; path=/; max-age=31536000`;
        startTransition(() => router.refresh());
    }, [router]);

    const handleReciterChange = useCallback((value: string) => {
        document.cookie = `settings_reciter=${value}; path=/; max-age=31536000`;
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.SETTINGS_RECITER, value);
        startTransition(() => router.refresh());
    }, [router]);

    const handleLocaleChange = useCallback((value: string) => {
        setLocale(value);
        document.cookie = `settings_locale=${value}; path=/; max-age=31536000`;
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.SETTINGS_LOCALE, value);
        startTransition(() => router.refresh());
    }, [router]);

    return {
        fontSize,
        setFontSize,
        showTransliteration,
        setShowTransliteration,
        scriptType,
        setScriptType,
        viewMode,
        setViewMode,
        perPage,
        locale,
        isPending,
        handlePerPageChange,
        handleReciterChange,
        handleLocaleChange
    };
}
