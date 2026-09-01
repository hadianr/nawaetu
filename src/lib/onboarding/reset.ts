import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

type OnboardingStorage = Pick<Storage, "removeItem">;

/** QA-only reset: removes the marker and nothing else. */
export function resetOnboardingForDevelopment(storage: OnboardingStorage): boolean {
    if (process.env.NODE_ENV !== "development") return false;
    storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return true;
}
