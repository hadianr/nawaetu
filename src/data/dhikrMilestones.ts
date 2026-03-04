export type DhikrMilestone = {
    id: string;
    target: number;
    title: string;
    reward: number; // Hasanah reward
    description: string;
};

export const dhikrMilestones: DhikrMilestone[] = [
    { id: "m1", target: 100, title: "Biji Tasbih Pertama", reward: 50, description: "Mencapai 100 dzikir pertama." },
    { id: "m2", target: 1000, title: "Konsisten Berdzikir", reward: 200, description: "Mencapai 1,000 dzikir." },
    { id: "m3", target: 5000, title: "Ahli Zikir", reward: 500, description: "Mencapai 5,000 dzikir." },
    { id: "m4", target: 10000, title: "Pecinta Zikir", reward: 1000, description: "Mencapai 10,000 dzikir." },
    { id: "m5", target: 50000, title: "Lisan yang Basah", reward: 2500, description: "Mencapai 50,000 dzikir." },
    { id: "m6", target: 100000, title: "Sinar Zikir", reward: 5000, description: "Mencapai 100,000 dzikir." },
];
