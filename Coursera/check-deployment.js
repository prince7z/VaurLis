#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to Render to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Pre-Deployment Checks...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: .env file should not be committed
console.log('✓ Checking .env file...');
if (!fs.existsSync('.gitignore')) {
    console.error('❌ .gitignore file not found!');
    hasErrors = true;
} else {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env')) {
        console.error('❌ .env is not in .gitignore! This is a security risk!');
        hasErrors = true;
    } else {
        console.log('  ✓ .env is properly ignored');
    }
}

// Check 2: .env.example exists
console.log('\n✓ Checking .env.example...');
if (!fs.existsSync('.env.example')) {
    console.warn('⚠️  .env.example not found. Create one for team reference.');
    hasWarnings = true;
} else {
    console.log('  ✓ .env.example exists');
}

// Check 3: render.yaml exists
console.log('\n✓ Checking render.yaml...');
if (!fs.existsSync('render.yaml')) {
    console.error('❌ render.yaml not found!');
    hasErrors = true;
} else {
    console.log('  ✓ render.yaml exists');
}

// Check 4: package.json scripts
console.log('\n✓ Checking package.json scripts...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!packageJson.scripts.build) {
        console.error('❌ No "build" script in package.json!');
        hasErrors = true;
    } else {
        console.log('  ✓ Build script found:', packageJson.scripts.build);
    }
    
    if (!packageJson.scripts.start) {
        console.error('❌ No "start" script in package.json!');
        hasErrors = true;
    } else {
        console.log('  ✓ Start script found:', packageJson.scripts.start);
    }
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    hasErrors = true;
}

// Check 5: Frontend package.json
console.log('\n✓ Checking frontend/package.json...');
try {
    const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    
    if (!frontendPackage.scripts.build) {
        console.error('❌ No "build" script in frontend/package.json!');
        hasErrors = true;
    } else {
        console.log('  ✓ Frontend build script found');
    }
} catch (error) {
    console.error('❌ Error reading frontend/package.json:', error.message);
    hasErrors = true;
}

// Check 6: TypeScript configuration
console.log('\n✓ Checking TypeScript configuration...');
if (!fs.existsSync('tsconfig.json')) {
    console.warn('⚠️  tsconfig.json not found');
    hasWarnings = true;
} else {
    console.log('  ✓ tsconfig.json exists');
}

// Check 7: Node modules
console.log('\n✓ Checking dependencies...');
if (!fs.existsSync('node_modules')) {
    console.warn('⚠️  node_modules not found. Run "npm install" first.');
    hasWarnings = true;
} else {
    console.log('  ✓ Dependencies installed');
}

// Check 8: Frontend dist folder (should not be committed)
console.log('\n✓ Checking build artifacts...');
if (fs.existsSync('frontend/dist')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('dist')) {
        console.warn('⚠️  frontend/dist exists but not in .gitignore');
        hasWarnings = true;
    }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('\n❌ FAILED: Fix errors before deploying!\n');
    process.exit(1);
} else if (hasWarnings) {
    console.warn('\n⚠️  WARNINGS: Review warnings before deploying\n');
    console.log('Run: npm run build && cd frontend && npm run build');
    console.log('Then: git add . && git commit -m "Deploy to Render" && git push\n');
} else {
    console.log('\n✅ ALL CHECKS PASSED! Ready to deploy to Render!\n');
    console.log('Next steps:');
    console.log('1. git add .');
    console.log('2. git commit -m "Deploy to Render"');
    console.log('3. git push origin main');
    console.log('4. Go to https://dashboard.render.com');
    console.log('5. Create new Blueprint from your repository\n');
}
