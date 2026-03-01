/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

export const statsEN = {
    stats: {
        header: {
            title: "Worship Statistics",
            subtitle: "Your spiritual journey"
        },
        level: {
            rankLabel: "Spiritual Rank",
            totalXp: "Total XP",
            toNextLevel: "to Level",
            xpNeeded: "XP needed",
            nextRankGoal: "Next Goal:",
            currentXp: "Current XP",
            nextLevelXp: "Next Level XP",
            understand: "Understand"
        },
        quick: {
            currentStreak: "Current Streak",
            longestStreak: "Longest: {{days}} days",
            weeklyPrayers: "Prayers (Last 14 Days)",
            outOf35: "out of 70 prayers",
            weeklyXp: "Weekly XP",
            last7Days: "last 14 days",
            consistency: "Consistency",
            last30Days: "last 30 days"
        },
        heatmap: {
            title: "Prayer Consistency (14 Days)",
            today: "today",
            total: "total",
            missed: "Missed",
            completed: "Completed"
        },
        chart: {
            title: "Daily XP",
            subtitle: "XP earned from missions and activities",
            filters: {
                today: "Today",
                last7d: "7D",
                last30d: "30D",
                last90d: "90D",
                last1y: "1Y"
            }
        },
        missions: {
            title: "Completed Worships",
            total: "total",
            categories: {
                prayer: "Fard Prayer",
                sunnah: "Sunnah Prayer",
                worship: "Manners & Worship",
                quran: "Quran",
                dhikr: "Dhikr",
                fasting: "Fasting"
            }
        },
        quote: {
            text: '"Indeed, Allah does not allow to be lost the reward of the doers of good."',
            source: "— Quran, At-Tawbah: 120"
        },
        extra: {
            quran: "Quran",
            ayatRead: "Verses read",
            dhikr: "Dhikr",
            totalTasbih: "Total tasbih"
        },
        insights: {
            close: "Close",
            streak: {
                title: "Consistency Details",
                desc: "Steadfastness (Istiqomah) is the key to change. The 40-day landmark is usually the turning point for habit formation.",
                current: "Current Streak",
                longest: "Longest Record",
                nextMilestone: "Next Milestone",
                status: "Keep up the spirit!",
                successDesc: "Amazing! You have surpassed the critical 40-day mark. This habit is starting to become second nature.",
                progressDesc: "Keep it up! You need {{needed}} more days to reach the 40-day habit formation milestone."
            },
            prayers: {
                title: "Prayer Analysis",
                desc: "The quality of prayer reflects the quality of life. Strive to keep prayers at the beginning of their time.",
                fardu: "Fard Prayer",
                sunnah: "Sunnah Prayer",
                target: "Weekly Target",
                progress: "Worship Progress",
                names: {
                    subuh: "Fajr",
                    dzuhur: "Dhuhr",
                    ashar: "Asr",
                    maghrib: "Maghrib",
                    isya: "Isha"
                },
                insightTitle: "Prayer Insights",
                noData: "Perform at least one prayer to see more detailed insights.",
                mostConsistent: "The most consistent prayer time for you is",
                sunnahDone: "You have also completed {{count}} sunnah prayers, keep it up!",
                sunnahNone: "Try adding Sunnah Rawatib prayers to perfect your worship."
            },
            xp: {
                title: "XP Growth",
                desc: "XP (Experience Points) reflects the effort and dedication you put into every deed.",
                weekly: "Weekly XP",
                avgDaily: "Daily Average",
                source: "Top XP Source",
                insightTitle: "XP Insights",
                noData: "Keep completing daily missions to see your most productive day.",
                levelProgress: "Level Progress",
                powerDayDesc: "Your most productive day is {{day}}. On this day, you tend to be more enthusiastic in completing missions."
            },
            consistency: {
                title: "Discipline Graph",
                desc: "Discipline isn't about perfection, it's about the willingness to return every day.",
                activeDays: "Active Days (30 Days)",
                rate: "Attendance Rate",
                trend: "Trend vs Last Month",
                tip: "Make Nawaetu part of your morning routine.",
                highTitle: "Discipline Tips",
                highDesc: "Your consistency is very high! This is a strong foundation for long-term spiritual growth.",
                lowDesc: "Don't be too hard on yourself. If you miss a day, promptly return to your routine the next day."
            },
            quran: {
                title: "Quran Interaction",
                desc: "Every letter read is ten good deeds. Make the Quran your constant companion.",
                totalRead: "Total Verses Read",
                streak: "Reading Streak",
                lastSurah: "Last Surah",
                target: "Khatam Target",
                insightTitle: "Recitation Insights",
                summary: "You have interacted with {{count}} holy verses.",
                milestoneReach: "Only {{needed}} more verses to reach the {{target}} verses milestone!",
                startTip: "Start by reading one page every day to gain the blessings of the Quran."
            },
            dhikr: {
                title: "Moisten Tongues with Dhikr",
                desc: "Dhikr is nutrition for the heart to remain calm amidst the chaos of the world.",
                total: "Total Tasbih Count",
                favDhikr: "Favorite Dhikr",
                benefit: "Peace of heart experienced.",
                benefitTitle: "Spiritual Benefits",
                summary: "Your daily Dhikr helps maintain clarity of mind amidst busy schedules."
            }
        },
        ranks: {
            mubtadi: {
                icon: "🌱",
                title: "Mubtadi",
                desc: "A term for a beginner (al-mubtadi) who is just taking the first steps in the journey of self-discipline and spiritual refinement.",
                milestone: "Focus on purifying your intention in every action.",
                quote: "Actions are but by intentions.",
                source: "Hadith Bukhari & Muslim"
            },
            seeker: {
                icon: "🔍",
                title: "Seeker of Mercy",
                desc: "Finding peace in the regularity of obligatory worship.",
                milestone: "Prioritize performing prayers exactly on time.",
                quote: "Do not despair of the mercy of Allah.",
                source: "Quran, Az-Zumar: 53"
            },
            warrior: {
                icon: "⚔️",
                title: "Fajr Warrior",
                desc: "Disciplined in the most challenging yet blessed time.",
                milestone: "Maintain consistency in Fajr prayer on time.",
                quote: "Indeed, the recitation of Fajr is witnessed.",
                source: "Quran, Al-Isra: 78"
            },
            abid: {
                icon: "🕌",
                title: "Abid",
                desc: "A servant who begins to taste the sweetness of worship.",
                milestone: "Gradually incorporate Sunnah Rawatib prayers.",
                quote: "My servant draws near with voluntary works until I love him.",
                source: "Hadith Qudsi (Bukhari)"
            },
            salik: {
                icon: "👣",
                title: "Salik",
                desc: "A spiritual wayfarer mindful of every single step.",
                milestone: "Practice presence of heart (khusyuk) in prayer.",
                quote: "If the heart is sound, the whole body is sound.",
                source: "Hadith Bukhari & Muslim"
            },
            mukhlis: {
                icon: "💎",
                title: "Mukhlis",
                desc: "Purifying all deeds solely for the sake of Allah.",
                milestone: "Guard your heart against seeking praise from others.",
                quote: "Worship Allah, being sincere to Him in religion.",
                source: "Quran, Al-Bayyinah: 5"
            },
            muhsin: {
                icon: "✨",
                title: "Muhsin",
                desc: "Worshipping as if you see Him, or knowing He sees you.",
                milestone: "Make every moment a form of remembrance and gratitude.",
                quote: "Worship Allah as if you see Him... He sees you.",
                source: "Hadith Jibril (Muslim)"
            }
        }
    }
};
