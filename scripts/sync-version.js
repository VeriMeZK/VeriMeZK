#!/usr/bin/env node

/**
 * Script to sync package.json version with latest git tag
 * Usage: node scripts/sync-version.js [--tag TAG_NAME]
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = resolve(__dirname, '../package.json');

function getLatestGitTag() {
    try {
        // Get latest tag, removing 'v' prefix if present
        const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
        return tag.replace(/^v/, '');
    } catch (error) {
        // No tags found, return null
        return null;
    }
}

function updatePackageVersion(newVersion) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated package.json version to ${newVersion}`);
}

function main() {
    const args = process.argv.slice(2);
    const tagArg = args.find(arg => arg.startsWith('--tag='));

    let newVersion;

    if (tagArg) {
        // Use provided tag
        newVersion = tagArg.split('=')[1].replace(/^v/, '');
    } else {
        // Get latest git tag
        newVersion = getLatestGitTag();

        if (!newVersion) {
            console.warn('No git tags found. Keeping current version in package.json');
            return;
        }
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.version === newVersion) {
        console.log(`Version already matches: ${newVersion}`);
        return;
    }

    updatePackageVersion(newVersion);
}

main();

