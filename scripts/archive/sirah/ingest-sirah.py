#!/usr/bin/env python3
"""
Nawaetu - Sirah Nabawiyah ETL Ingestion Script
Copyright (C) 2026 Hadian Rahmat

Parses Part 1 and Part 2 XLSX datasets of Sirah Nabawiyah, cleans the text,
detects Quranic & Hadith cross-references, extracts page ranges, assigns eras,
generates actionable intentions, and outputs JSON datasets to src/data/sirah/
"""

import os
import zipfile
import xml.etree.ElementTree as ET
import json
import re

PATH_PART1 = "/Users/hadianr/Downloads/Sirah Nabawiyah Dataset _ Part 1.xlsx"
PATH_PART2 = "/Users/hadianr/Downloads/Dataset Sirah Nabawiyah - Part 2.xlsx"
OUTPUT_DIR = "/Users/hadianr/Work/personal/nawaetu/src/data/sirah"

def get_xlsx_rows(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    with zipfile.ZipFile(file_path, 'r') as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                shared_strings.append(elem.text or '')
        
        sheet_xml = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = sheet_xml.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
        
        data = []
        for r in rows:
            row_vals = []
            for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                t = c.attrib.get('t')
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v.text if v is not None else ''
                if t == 's' and val.isdigit():
                    idx = int(val)
                    val = shared_strings[idx] if idx < len(shared_strings) else val
                row_vals.append(val.strip())
            data.append(row_vals)
        return data

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text

def assign_era(chapter_title):
    t = chapter_title.lower()
    if any(k in t for k in ["perang", "ghazwah", "pasukan", "manuver", "mu'tah", "badr", "uhud", "ahzab", "khandaq", "quraizhah", "khaibar", "hunain", "tabuk", "mushthaliq"]):
        return "ghazwah"
    elif any(k in t for k in ["raja", "amir", "korespondensi", "perjanjian", "hubaidiyah", "haji", "utusan"]):
        return "diplomacy"
    elif any(k in t for k in ["wafat", "haribaan", "rumah tangga", "sifat", "akhlak", "keberhasilan"]):
        return "legacy"
    elif any(k in t for k in ["madinah", "hijrah", "membangun masyarakat", "yahudi"]):
        return "madinah"
    else:
        return "makkah"

def detect_quran_verses(text, subbab):
    verses = []
    
    # Common Surah mappings by event keywords
    event_lower = (subbab + " " + text[:300]).lower()
    if "badr" in event_lower:
        verses.append({"surah": 8, "verses": "1-19", "label": "Surah Al-Anfal"})
    if "uhud" in event_lower:
        verses.append({"surah": 3, "verses": "121-180", "label": "Surah Ali 'Imran"})
    if "ahzab" in event_lower or "khandaq" in event_lower:
        verses.append({"surah": 33, "verses": "9-27", "label": "Surah Al-Ahzab"})
    if "hubaidiyah" in event_lower or "fath" in event_lower:
        verses.append({"surah": 48, "verses": "1-29", "label": "Surah Al-Fath"})
    if "tabuk" in event_lower:
        verses.append({"surah": 9, "verses": "38-129", "label": "Surah At-Taubah"})
    if "isra" in event_lower or "mi'raj" in event_lower:
        verses.append({"surah": 17, "verses": "1", "label": "Surah Al-Isra'"})
    if "kelahiran" in event_lower or "gajah" in event_lower:
        verses.append({"surah": 105, "verses": "1-5", "label": "Surah Al-Fil"})
        
    return verses

def generate_suggested_intention(chapter_title, subbab):
    title = (subbab or chapter_title).strip()
    return f"Niat Hari Ini: Mengambil hikmah dan meneladani keteladanan Rasulullah صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ dalam peristiwa {title}."

def process():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    rows1 = get_xlsx_rows(PATH_PART1)[1:] # Skip header: ['No', 'BAB', 'Subbab', 'Teks Asli']
    rows2 = get_xlsx_rows(PATH_PART2)[1:] # Skip header: ['No', 'BAB', 'Subbab', 'Halaman Mulai', 'Halaman Selesai', 'Teks Asli', 'Catatan']
    
    chapters_map = {}
    sections_list = []
    
    chapter_order = 0
    section_order = 0
    
    # Process Part 1
    for r in rows1:
        if len(r) < 4 or not r[1]:
            continue
        bab_title = r[1]
        subbab_title = r[2] if len(r) > 2 and r[2] else bab_title
        content = r[3] if len(r) > 3 else ""
        
        if not content:
            continue
            
        if bab_title not in chapters_map:
            chapter_order += 1
            slug = slugify(bab_title)
            if not slug:
                slug = f"chapter-{chapter_order}"
            chapters_map[bab_title] = {
                "id": f"chap-{chapter_order:02d}",
                "slug": slug,
                "orderIndex": chapter_order,
                "title": bab_title,
                "era": assign_era(bab_title),
                "summary": f"Pembahasan mengenai {bab_title}.",
                "totalSections": 0
            }
            
        ch_info = chapters_map[bab_title]
        ch_info["totalSections"] += 1
        section_order += 1
        
        sec_id = f"sec-{section_order:03d}"
        quran_refs = detect_quran_verses(content, subbab_title)
        
        sections_list.append({
            "id": sec_id,
            "chapterId": ch_info["id"],
            "chapterSlug": ch_info["slug"],
            "chapterTitle": bab_title,
            "orderIndex": section_order,
            "subbab": subbab_title,
            "content": content,
            "highlights": "",
            "suggestedIntention": generate_suggested_intention(bab_title, subbab_title),
            "relatedQuranVerses": quran_refs,
            "relatedHadithIds": []
        })
        
    # Process Part 2
    for r in rows2:
        if len(r) < 6 or not r[1]:
            continue
        bab_title = r[1]
        subbab_title = r[2] if len(r) > 2 and r[2] else bab_title
        page_start = int(r[3]) if len(r) > 3 and r[3].isdigit() else None
        page_end = int(r[4]) if len(r) > 4 and r[4].isdigit() else None
        content = r[5] if len(r) > 5 else ""
        notes = r[6] if len(r) > 6 else ""
        
        if not content:
            continue
            
        if bab_title not in chapters_map:
            chapter_order += 1
            slug = slugify(bab_title)
            if not slug:
                slug = f"chapter-{chapter_order}"
            chapters_map[bab_title] = {
                "id": f"chap-{chapter_order:02d}",
                "slug": slug,
                "orderIndex": chapter_order,
                "title": bab_title,
                "era": assign_era(bab_title),
                "summary": f"Pembahasan mengenai {bab_title}.",
                "totalSections": 0
            }
            
        ch_info = chapters_map[bab_title]
        ch_info["totalSections"] += 1
        section_order += 1
        
        sec_id = f"sec-{section_order:03d}"
        quran_refs = detect_quran_verses(content, subbab_title)
        
        sec_obj = {
            "id": sec_id,
            "chapterId": ch_info["id"],
            "chapterSlug": ch_info["slug"],
            "chapterTitle": bab_title,
            "orderIndex": section_order,
            "subbab": subbab_title,
            "content": content,
            "highlights": notes,
            "suggestedIntention": generate_suggested_intention(bab_title, subbab_title),
            "relatedQuranVerses": quran_refs,
            "relatedHadithIds": []
        }
        if page_start is not None:
            sec_obj["pageStart"] = page_start
        if page_end is not None:
            sec_obj["pageEnd"] = page_end
            
        sections_list.append(sec_obj)
        
    chapters_list = list(chapters_map.values())
    
    # Save chapters.json
    chapters_file = os.path.join(OUTPUT_DIR, "chapters.json")
    with open(chapters_file, "w", encoding="utf-8") as f:
        json.dump(chapters_list, f, ensure_ascii=False, indent=2)
        
    # Save sections.json
    sections_file = os.path.join(OUTPUT_DIR, "sections.json")
    with open(sections_file, "w", encoding="utf-8") as f:
        json.dump(sections_list, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully ingested {len(chapters_list)} chapters and {len(sections_list)} sections!")
    print(f"Output files:\n  - {chapters_file}\n  - {sections_file}")

if __name__ == "__main__":
    process()
