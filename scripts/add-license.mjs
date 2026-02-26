import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LICENSE_HEADER = `/**
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
 */\n\n`;

const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];
const SRC_DIR = path.resolve(__dirname, '../src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function hasLicenseHeader(content) {
    return content.includes('GNU Affero General Public License');
}

let updatedCount = 0;

walkDir(SRC_DIR, (filePath) => {
    const ext = path.extname(filePath);
    if (TARGET_EXTENSIONS.includes(ext)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Skip if it already has the license header
        if (!hasLicenseHeader(content)) {
            let finalContent = content;

            // Handle 'use client' or 'use server' directives
            // These must be at the very top of the file
            const useClientDir = /^(["']use client["'];?\s*)/;
            const useServerDir = /^(["']use server["'];?\s*)/;

            let directive = '';
            if (useClientDir.test(content)) {
                directive = content.match(useClientDir)[1];
                finalContent = content.replace(useClientDir, '');
            } else if (useServerDir.test(content)) {
                directive = content.match(useServerDir)[1];
                finalContent = content.replace(useServerDir, '');
            }

            const newContent = directive + LICENSE_HEADER + finalContent;
            fs.writeFileSync(filePath, newContent, 'utf8');
            updatedCount++;
            console.log(`Added license header to: ${path.relative(SRC_DIR, filePath)}`);
        }
    }
});

console.log(`\nDone! Added license header to ${updatedCount} files.`);
