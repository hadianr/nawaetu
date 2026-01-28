"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Shield, Zap, BarChart2, MessageSquare, Palette, Lock, Crown, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { usePremium } from "@/context/PremiumContext";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type PlanType = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface PricingPlan {
    id: PlanType;
    label: string;
    price: number;
    originalPrice?: number;
    priceUnit: string;
    badge?: string;
    badgeColor?: string;
    savings?: string;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { upgradeToPremium } = usePremium();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('weekly');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = () => {
        setIsLoading(true);
        setTimeout(() => {
            upgradeToPremium();
            setIsLoading(false);
            onClose();
        }, 1500);
    };

    const pricingPlans: PricingPlan[] = [
        {
            id: 'daily',
            label: 'Harian',
            price: 990,
            priceUnit: '/hari',
            badge: 'COBA DULU',
            badgeColor: 'bg-red-500'
        },
        {
            id: 'weekly',
            label: 'Mingguan',
            price: 4900,
            originalPrice: 6930,
            priceUnit: '/minggu',
            badge: 'TERLARIS',
            badgeColor: 'bg-[rgb(var(--color-primary))]',
            savings: 'Hemat 29%'
        },
        {
            id: 'monthly',
            label: 'Bulanan',
            price: 14900,
            originalPrice: 29700,
            priceUnit: '/bulan',
            savings: 'Hemat 50%'
        },
        {
            id: 'yearly',
            label: 'Tahunan',
            price: 99000,
            originalPrice: 361350,
            priceUnit: '/tahun',
            badge: 'BEST VALUE',
            badgeColor: 'bg-amber-500',
            savings: 'Hemat 72%'
        }
    ];

    const benefits = [
        {
            icon: Palette,
            title: "6 Tema Premium",
            desc: "Midnight, Sunset, Lavender, Ocean, Royal.",
            color: "text-[rgb(var(--color-primary-light))]",
            bg: "bg-[rgb(var(--color-primary))]/10"
        },
        {
            icon: BarChart2,
            title: "Deep Analytics",
            desc: "Grafik ibadah bulanan & tahunan.",
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            icon: MessageSquare,
            title: "AI Spiritual Mentor",
            desc: "Chat personal saran ibadah.",
            color: "text-violet-400",
            bg: "bg-violet-500/10"
        },
        {
            icon: Zap,
            title: "Streak Saver",
            desc: "Lindungi streak ibadahmu.",
            color: "text-amber-400",
            bg: "bg-amber-500/10"
        }
    ];

    const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-[#0F172A] backdrop-blur-xl border-white/10 text-white p-0 rounded-3xl max-h-[92vh] overflow-y-auto">
                {/* Header with Crown Icon - No overflow-hidden to allow crown to overlap */}
                <div className="relative h-24 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-accent))]/10 to-transparent w-full">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 rounded-t-3xl"></div>

                    {/* Launch Promo Badge - Fixed positioning */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>PROMO PELUNCURAN</span>
                    </div>

                    {/* Crown Icon - Overlapping design */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-600 p-[2px] shadow-2xl shadow-amber-500/30">
                            <div className="w-full h-full bg-slate-900 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Crown className="w-8 h-8 text-amber-400" fill="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content with space for overlapping crown */}
                <div className="px-6 pt-10 pb-6">
                    <DialogTitle className="text-center text-xl font-bold mb-1">
                        Nawaetu Premium 🚀
                    </DialogTitle>
                    <p className="text-center text-xs text-white/60 mb-5">
                        Harga spesial 1000 pengguna pertama! ✨
                    </p>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 gap-2.5 mb-5">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", benefit.bg)}>
                                    <benefit.icon className={cn("w-4.5 h-4.5", benefit.color)} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-white leading-tight">{benefit.title}</h4>
                                    <p className="text-[10px] text-white/50 leading-tight mt-0.5">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Plans - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {pricingPlans.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            return (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={cn(
                                        "p-3 rounded-xl border-2 text-center transition-all relative overflow-hidden group",
                                        isSelected
                                            ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))] shadow-lg shadow-[rgb(var(--color-primary))]/20"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    )}>
                                    {/* Badge */}
                                    {plan.badge && (
                                        <div className={cn(
                                            "absolute -top-1 -right-1 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl shadow-md",
                                            plan.badgeColor || "bg-[rgb(var(--color-primary))]"
                                        )}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    <p className="text-xs text-white/70 font-medium mb-1">{plan.label}</p>

                                    {/* Original Price Strikethrough */}
                                    {plan.originalPrice && (
                                        <p className="text-[9px] text-white/30 line-through h-3">
                                            Rp {(plan.originalPrice / 1000).toFixed(0)}rb
                                        </p>
                                    )}

                                    {/* Current Price */}
                                    <div className="my-1">
                                        <span className="text-xl font-black text-white tracking-tight">
                                            {plan.price < 1000
                                                ? `${plan.price}`
                                                : `${(plan.price / 1000).toFixed(plan.price % 1000 === 0 ? 0 : 1)}rb`
                                            }
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-white/50 mb-1">{plan.priceUnit}</p>

                                    {/* Savings Badge */}
                                    {plan.savings && (
                                        <div className="text-[9px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">
                                            {plan.savings}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Price Summary */}
                    {selectedPlanData && (
                        <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-4 mb-5 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/60">Paket:</span>
                                <span className="font-semibold text-white">{selectedPlanData.label}</span>
                            </div>
                            {selectedPlanData.originalPrice && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/60">Harga normal:</span>
                                    <span className="text-white/40 line-through">
                                        Rp {selectedPlanData.originalPrice.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <span className="text-sm font-bold text-white">Total:</span>
                                <span className="text-2xl font-black text-[rgb(var(--color-primary-light))]">
                                    Rp {selectedPlanData.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <Button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] hover:from-[rgb(var(--color-primary-light))] hover:to-[rgb(var(--color-primary))] text-white font-bold shadow-xl shadow-[rgb(var(--color-primary))]/30 text-base"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Memproses...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Crown className="w-5 h-5" />
                                Mulai Trial Gratis 3 Hari
                            </div>
                        )}
                    </Button>

                    <p className="text-[10px] text-center text-white/40 mt-3 leading-relaxed">
                        Trial gratis 3 hari. Bisa dibatalkan kapan saja.<br />
                        Pembayaran dimulai setelah trial berakhir.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
