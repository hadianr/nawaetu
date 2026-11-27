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
        journey: {
            stageOf: "Stage {{n}} of {{total}}",
            level: "Level {{level}}",
            toNextLevel: "{{n}} Hasanah to Level {{level}}",
            focus: "Suggested focus",
            nextStage: "Next: {{name}} at Level {{level}}",
            lastStage: "This is the last stage. Keep going, little but constant.",
            howItWorks: "How levels work",
            guideTitle: "Your journey in Nawaetu",
            guideIntro: "Levels and stages show you where you are heading. They do not judge you.",
            rule1: "Every act of worship you log, such as prayer, dhikr, Quran reading and intentions, adds Hasanah.",
            rule2: "Hasanah raises your level. Every few levels you enter a new stage.",
            rule3: "A stage describes what you are practising. Its focus is a suggestion, not a requirement.",
            stagesTitle: "Seven stages",
            levels: "Level {{from}}–{{to}}",
            levelsFrom: "Level {{from}}+",
            youAreHere: "You are here",
            disclaimerTitle: "About Hasanah",
            disclaimer: "Hasanah is a record of your effort in Nawaetu, not a count of reward. Only Allah knows a person's reward and rank.",
            disclaimerQuote: "“…So do not claim yourselves to be pure; He knows best who fears Him.” Quran, An-Najm 53:32",
            close: "Close",
            streakRestart: "Start today",
            streakRecord: "Record: {{days}} days",
        },
        quick: {
            currentStreak: "Current Streak",
            longestStreak: "Longest: {{days}} days",
            weeklyPrayers: "Prayers (Last 14 Days)",
            outOfDue: "of {{due}} obligatory prayers",
            weeklyHasanah: "Weekly Hasanah",
            last7Days: "last 14 days",
            consistency: "Consistency",
            last30Days: "last 30 days",
            lastDays: "last"
        },
        heatmap: {
            title: "Prayer Consistency (14 Days)",
            today: "today",
            total: "total",
            missed: "Missed",
            completed: "Completed",
            activityTrend: "Activity trend",
            days7: "7D",
            days14: "14D"
        },
        chart: {
            title: "Daily Hasanah",
            subtitle: "Hasanah earned from missions and activities",
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
            allTime: "all time",
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
        message: {
            title: "A note for you",
            udzur: "Your days of udzur are not counted as missed. Menstruation is decreed by Allah, not a lapse; your dhikr, du'a and good intentions still count.",
            udzurSource: "\u201cThis is something Allah has decreed for the daughters of Adam.\u201d Bukhari No. 294",
            start: "This journey starts with one step. Log one prayer today, then keep it gently.",
            return: "No prayers logged in the last 14 days. The way back is always open; start with the next prayer.",
            grow: "{{prayed}} of {{due}} obligatory prayers kept in 14 days. No need to be perfect at once: start with {{prayer}}, the one missed most.",
            strong: "{{prayed}} of {{due}} obligatory prayers kept in 14 days. That is a strong foundation; keep it up, little but constant.",
            consistencySource: "\u201cThe most beloved deed to Allah is the most constant, even if it is little.\u201d Bukhari No. 6464",
            returnSource: "\u201cDo not despair of the mercy of Allah.\u201d Quran, Az-Zumar 39:53"
        },
        quote: {
            text: '"Indeed, Allah does not allow to be lost the reward of the doers of good."',
            source: "Quran, At-Tawbah: 120"
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
            hasanah: {
                title: "Hasanah Growth",
                desc: "Hasanah reflects the effort and dedication you put into every deed.",
                weekly: "Weekly Hasanah",
                avgDaily: "Daily Average",
                source: "Top Hasanah Source",
                insightTitle: "Hasanah Insights",
                noData: "Keep completing daily missions to see your most productive day.",
                levelProgress: "Fase Progress",
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
                tipTitle: "Discipline Tips",
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
        stages: {
            start: { name: "Starting", about: "Setting your intention and starting to log daily worship.", focus: "Log a morning intention and the prayers you pray today.", reminder: "“Actions are judged by intentions.” Bukhari No. 1" },
            habit: { name: "Building the habit", about: "Logging every day, little but constant.", focus: "Aim to log all five prayers every day, even if not perfect yet.", reminder: "“The most beloved deed to Allah is the most constant, even if it is little.” Bukhari No. 6464" },
            onTime: { name: "Keeping the time", about: "The habit is forming. Now keep its timing.", focus: "Pray early in the time, Fajr included.", reminder: "Asked which deed Allah loves most, Prophet Muhammad SAW said: “Prayer at its time.” Bukhari No. 527" },
            add: { name: "Adding more", about: "The obligatory is kept. Start adding sunnah.", focus: "Add one rawatib or Duha prayer, gently.", reminder: "“My servant keeps drawing near to Me with voluntary deeds until I love him.” Bukhari No. 6502" },
            deepen: { name: "Going deeper", about: "Not only more, but deeper in meaning.", focus: "Practise focus in prayer, read Quran regularly, and keep the morning and evening dhikr.", reminder: "“Successful indeed are the believers, those who are humble in their prayer.” Quran, Al-Mu'minun 23:1–2" },
            steady: { name: "Holding steady", about: "Keeping it all going, also when busy and tired.", focus: "Make a small plan for packed days so worship still happens.", reminder: "“Those who say, ‘Our Lord is Allah,’ and then remain steadfast, the angels descend upon them.” Quran, Fussilat 41:30" },
            share: { name: "Spreading benefit", about: "Your good starts to reach others.", focus: "Invite family or friends, and share beneficial knowledge.", reminder: "“Whoever guides someone to goodness will have a reward like the one who does it.” Muslim No. 1893" },
        }
    }
};
