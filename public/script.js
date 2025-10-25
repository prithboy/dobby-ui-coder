// Client-side logic for Dobby UI Coder
const enterBtn = document.getElementById('enterBtn');
const splash = document.getElementById('splash');
const app = document.getElementById('app');
const generateBtn = document.getElementById('generateBtn');
const codeOut = document.getElementById('codeOut');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

enterBtn.addEventListener('click', () => {
  splash.classList.add('slide-up-enter');
  setTimeout(() => {
    splash.classList.add('hidden');
    app.classList.remove('hidden');
  }, 650);
});

generateBtn.addEventListener('click', async () => {
  const prompt = document.getElementById('designDesc').value.trim();
  if (!prompt) return alert('Please describe your UI first.');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    codeOut.textContent = data.code || '// No code returned';
    const blob = new Blob([codeOut.textContent], { type: 'text/html' });
    downloadBtn.href = URL.createObjectURL(blob);
  } catch (e) {
    codeOut.textContent = '// Error: ' + e.message;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Done — Generate Code';
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(codeOut.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  } catch {
    alert('Copy failed');
  }
});
