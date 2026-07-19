import { readdirSync, statSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

// Determine repository root relative to this script (assumed to be in scripts/ folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');

const OUTPUT_FILE = join(REPO_ROOT, 'docs', 'project-map.md');
const IGNORE_FILE = join(REPO_ROOT, '.mapignore');

// Parse .mapignore
let ignoreLines = [];
if (existsSync(IGNORE_FILE)) {
  ignoreLines = readFileSync(IGNORE_FILE, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function shouldIgnore(relPath, isDir) {
  const normPath = relPath.replace(/\\/g, '/');
  const baseName = basename(normPath);

  if (baseName === 'env.ps1' || baseName === '.env' || baseName === '.env.local' || baseName.endsWith('.local')) {
    return true;
  }

  for (const line of ignoreLines) {
    const normLine = line.replace(/\\/g, '/');

    if (normLine.endsWith('/')) {
      const dirPattern = normLine.slice(0, -1);
      const segments = normPath.split('/');
      if (segments.includes(dirPattern)) {
        return true;
      }
      if (normPath === dirPattern || normPath.startsWith(dirPattern + '/')) {
        return true;
      }
    } else {
      if (normPath === normLine) {
        return true;
      }
      const base = basename(normPath);
      if (base === normLine) {
        return true;
      }
    }
  }
  return false;
}

const ALLOWED_EXTENSIONS = new Set([
  '.json', '.js', '.jsx', '.ts', '.tsx', '.cs', '.java', '.xml', '.html', '.css', '.sql', '.md', '.dbml', '.mmd'
]);

const ALLOWED_FILENAMES = new Set([
  '.env', '.env.example', '.env.local', 'pom.xml', '.gitignore', 'README.md'
]);

const SECRET_KEY_PATTERN = /(Password|Secret|ConnectionString|ConnectionStrings|DefaultConnection|Jwt|ApiKey|ClientSecret|ChecksumKey|Token|AccessToken|RefreshToken|PAYOS_CLIENT_ID|PAYOS_API_KEY|PAYOS_CHECKSUM_KEY|SUPABASE_SERVICE_ROLE_KEY|Storage|ServiceRole)/i;
const SECRET_FILE_PATTERN = /(^|\/)(appsettings(?:\.[^.]+)?\.json|\.env(?:\..*)?|launchSettings\.json)$/i;

function maskSecrets(content) {
  return content
    .replace(/("(?:Password|Secret|DefaultConnection|ApiKey|ClientSecret|ChecksumKey|Token|AccessToken|RefreshToken|PAYOS_CLIENT_ID|PAYOS_API_KEY|PAYOS_CHECKSUM_KEY|SUPABASE_SERVICE_ROLE_KEY|ServiceRoleKey)"\s*:\s*)"[^"]*"/gi, '$1"__MASKED__"')
    .replace(/((?:^|\n)\s*(?:Password|Secret|ConnectionString|DefaultConnection|ApiKey|ClientSecret|ChecksumKey|AccessToken|RefreshToken|PAYOS_CLIENT_ID|PAYOS_API_KEY|PAYOS_CHECKSUM_KEY|SUPABASE_SERVICE_ROLE_KEY|ServiceRoleKey)\s*=\s*)[^\s;"']+/gi, '$1__MASKED__')
    .replace(/(Password=)[^;"']+/gi, '$1__MASKED__');
}

const filesToInclude = [];

function buildTree(dir, depth = 0) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (error) {
    return '';
  }

  let result = '';
  const indent = '  '.repeat(depth);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = relative(REPO_ROOT, fullPath);
    let stats;
    try {
      stats = statSync(fullPath);
    } catch (e) {
      continue;
    }

    if (stats.isDirectory()) {
      if (shouldIgnore(relPath, true)) continue;
      result += `${indent}- 📁 **${entry}/**\n`;
      result += buildTree(fullPath, depth + 1);
    } else {
      if (shouldIgnore(relPath, false)) continue;

      const ext = entry.substring(entry.lastIndexOf('.')).toLowerCase();
      const isAllowed = ALLOWED_EXTENSIONS.has(ext) || ALLOWED_FILENAMES.has(entry);
      if (!isAllowed) continue;

      const isWritten = relPath.replace(/\\/g, '/') !== 'docs/project-map.md';
      const marker = isWritten ? ' *' : '';
      result += `${indent}- 📄 ${entry}${marker} (${(stats.size / 1024).toFixed(1)} KB)\n`;
      filesToInclude.push({
        relPath: relPath.replace(/\\/g, '/'),
        fullPath,
        ext,
        entry
      });
    }
  }
  return result;
}

let markdown = `# Project Architecture Map: SWP301\n\n`;
markdown += `This file contains the directory tree and full code contents of the non-ignored files in the SWP301 repository.\n\n`;

markdown += `## 1. Directory Tree\n\n\`\`\`markdown\n`;
markdown += buildTree(REPO_ROOT);
markdown += `\`\`\`\n\n`;

markdown += `## 2. File Contents\n\n`;

let fileCount = 0;
for (const file of filesToInclude) {
  // Avoid including the project-map.md itself
  if (file.relPath === 'docs/project-map.md') {
    continue;
  }

  try {
    let content = readFileSync(file.fullPath, 'utf8');
    if (SECRET_FILE_PATTERN.test(file.relPath) && (SECRET_KEY_PATTERN.test(content) || SECRET_KEY_PATTERN.test(file.relPath))) {
      content = maskSecrets(content);
    }

    // Determine language syntax highlighting
    let lang = 'text';
    const ext = file.ext;
    if (ext === '.json') lang = 'json';
    else if (ext === '.js' || ext === '.jsx') lang = 'javascript';
    else if (ext === '.ts' || ext === '.tsx') lang = 'typescript';
    else if (ext === '.cs') lang = 'csharp';
    else if (ext === '.java') lang = 'java';
    else if (ext === '.xml') lang = 'xml';
    else if (ext === '.html') lang = 'html';
    else if (ext === '.css') lang = 'css';
    else if (ext === '.sql') lang = 'sql';
    else if (ext === '.md') lang = 'markdown';
    else if (file.entry.startsWith('.env')) lang = 'bash';

    markdown += `### File: \`${file.relPath}\`\n\n`;
    markdown += `\`\`\`${lang}\n`;
    markdown += content;
    if (!content.endsWith('\n')) markdown += '\n';
    markdown += `\`\`\`\n\n`;

    fileCount++;
  } catch (e) {
    console.error(`Failed to read ${file.relPath}: ${e.message}`);
  }
}

// Write the output file
const docsDir = join(REPO_ROOT, 'docs');
if (!existsSync(docsDir)) {
  mkdirSync(docsDir, { recursive: true });
}
writeFileSync(OUTPUT_FILE, markdown, 'utf8');

console.log(`Successfully generated project map containing ${fileCount} files at ${OUTPUT_FILE}`);
