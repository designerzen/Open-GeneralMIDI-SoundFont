const fs = require('fs');
const path = require('path');

// Read the manifest files
const indexData = JSON.parse(fs.readFileSync('./index.json', 'utf8'));
const openGM24List = JSON.parse(fs.readFileSync('./OpenGM24.json', 'utf8'));

// Add available notes for each instrument
indexData.forEach(instrument => {
  if (instrument.folder) {
    const folderPath = `./OpenGM24/${instrument.folder}`;
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.mp3'))
        .map(f => f.replace('.mp3', ''))
        .sort((a, b) => {
          // Custom sort: C1, Db1, D1, ... B7, C8 etc
          const noteOrder = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
          const aNote = a.match(/([A-G]b?)/)[0];
          const aOctave = parseInt(a.match(/\d+/)[0]);
          const bNote = b.match(/([A-G]b?)/)[0];
          const bOctave = parseInt(b.match(/\d+/)[0]);
          
          if (aOctave !== bOctave) return aOctave - bOctave;
          return noteOrder.indexOf(aNote) - noteOrder.indexOf(bNote);
        });
      instrument.notes = files;
    }
  }
});

// Create a map for quick lookup
const instrumentMap = new Map();
indexData.forEach(instrument => {
  instrumentMap.set(instrument.name, instrument);
});

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenGM24 - General MIDI Soundfont Repository</title>
  <link rel="alternate" type="application/feed+json" href="feed.json" title="OpenGM24 JSON Feed">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fafafa;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      background: linear-gradient(180deg, #0f172a 0%, #1a2847 100%);
      color: white;
      padding: 80px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(196, 181, 253, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    header > * {
      position: relative;
      z-index: 1;
    }

    header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 4em;
      font-weight: 900;
      margin-bottom: 12px;
      letter-spacing: -2px;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    }

    header p {
      font-size: 1.25em;
      opacity: 0.85;
      font-weight: 300;
      letter-spacing: 1px;
    }

    .content {
      padding: 60px 40px;
    }

    .section {
      margin-bottom: 80px;
    }

    .section h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2.5em;
      color: #0f172a;
      margin-bottom: 40px;
      font-weight: 700;
      position: relative;
      padding-bottom: 20px;
    }

    .section h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #c4b5fd, #6366f1);
    }

    .controls {
      margin-bottom: 40px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .controls select,
    .controls input {
      padding: 12px 16px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      font-family: 'Inter', sans-serif;
      font-size: 1em;
      cursor: pointer;
      transition: all 0.2s;
    }

    .controls select:hover,
    .controls input:hover {
      border-color: #6366f1;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
    }

    .controls input:focus,
    .controls select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      padding: 32px;
      border-radius: 12px;
      text-align: center;
      border: 1.5px solid #e5e7eb;
      transition: all 0.3s;
    }

    .stat-card:hover {
      border-color: #c4b5fd;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08);
      transform: translateY(-2px);
    }

    .stat-card .number {
      font-family: 'Playfair Display', serif;
      font-size: 3em;
      font-weight: 900;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .stat-card .label {
      color: #6b7280;
      font-size: 0.95em;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .instruments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 28px;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .instrument-card {
      background: white;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      padding: 28px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .instrument-card:hover {
      border-color: #c4b5fd;
      box-shadow: 0 16px 40px rgba(99, 102, 241, 0.12);
      transform: translateY(-4px);
    }

    .instrument-card .program {
      color: #8b5cf6;
      font-size: 0.75em;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .instrument-card .label {
      font-family: 'Playfair Display', serif;
      font-size: 1.5em;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .instrument-card .category {
      color: #7c3aed;
      font-size: 0.85em;
      margin-bottom: 16px;
      display: inline-block;
      background: linear-gradient(135deg, rgba(196, 181, 253, 0.2), rgba(167, 139, 250, 0.2));
      padding: 6px 14px;
      border-radius: 24px;
      border: 1px solid rgba(124, 58, 237, 0.3);
      font-weight: 500;
    }

    .instrument-card .description {
      color: #4b5563;
      font-size: 0.95em;
      margin-bottom: 16px;
      line-height: 1.6;
      flex-grow: 1;
    }

    .instrument-card .folder {
      color: #6366f1;
      font-size: 0.85em;
      word-break: break-all;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(167, 139, 250, 0.08));
      padding: 10px;
      border-radius: 8px;
      border-left: 3px solid #6366f1;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .instrument-card .folder a {
      color: #6366f1;
      text-decoration: none;
      transition: color 0.2s;
    }

    .instrument-card .folder a:hover {
      color: #8b5cf6;
      text-decoration: underline;
    }

    .audio-player {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(167, 139, 250, 0.08));
      padding: 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1.5px solid rgba(99, 102, 241, 0.2);
    }

    .audio-player audio {
      width: 100%;
      height: 32px;
      accent-color: #6366f1;
    }

    .audio-player em {
      display: block;
      font-size: 0.75em;
      color: #6366f1;
      margin-top: 6px;
      font-weight: 500;
    }

    .piano-container {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(167, 139, 250, 0.08));
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      overflow-x: auto;
      border: 1.5px solid rgba(99, 102, 241, 0.2);
    }

    .piano-keyboard {
      display: flex;
      gap: 3px;
      min-width: 100%;
      padding: 8px 0;
    }

    .piano-key {
      flex: 0 0 auto;
      min-width: 32px;
      height: 72px;
      border: 1.5px solid #d1d5db;
      border-radius: 6px 6px 0 0;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      font-size: 0.65em;
      padding-bottom: 4px;
      font-weight: 600;
      color: #6b7280;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .piano-key:hover {
      background: #f8f9fa;
      border-color: #c4b5fd;
      box-shadow: 0 3px 8px rgba(99, 102, 241, 0.1);
      transform: scale(1.05);
    }

    .piano-key.playing {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border-color: #6366f1;
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
      transform: scale(1.08);
    }

    .metadata {
      font-size: 0.85em;
      color: #4b5563;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .metadata p {
      margin-bottom: 6px;
      line-height: 1.5;
    }

    .metadata strong {
      color: #0f172a;
      font-weight: 600;
    }

    .metadata a {
      color: #6366f1;
      text-decoration: none;
      transition: color 0.2s;
    }

    .metadata a:hover {
      color: #8b5cf6;
      text-decoration: underline;
    }

    .manifest-list {
      background: white;
      border-radius: 12px;
      padding: 32px;
      border: 1.5px solid #e5e7eb;
    }

    .manifest-list h3 {
      color: #0f172a;
      margin-bottom: 24px;
      font-family: 'Playfair Display', serif;
      font-size: 1.3em;
      font-weight: 700;
    }

    .manifest-list ul {
      list-style: none;
    }

    .manifest-list li {
      padding: 14px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.95em;
    }

    .manifest-list li:last-child {
      border-bottom: none;
    }

    .manifest-list code {
      background: #f8f9fa;
      padding: 3px 10px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      color: #6366f1;
      font-weight: 500;
    }

    .manifest-list a {
      color: #6366f1;
      text-decoration: none;
      transition: color 0.2s;
      font-weight: 500;
    }

    .manifest-list a:hover {
      color: #8b5cf6;
      text-decoration: underline;
    }

    .loading {
      text-align: center;
      color: #6366f1;
      font-size: 1.1em;
      padding: 60px 20px;
    }

    footer {
      background: linear-gradient(180deg, #0f172a 0%, #1a2847 100%);
      padding: 60px 40px;
      text-align: center;
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.9em;
      border-top: 1.5px solid rgba(196, 181, 253, 0.2);
    }

    footer p {
      margin-bottom: 12px;
      line-height: 1.6;
    }

    footer a {
      color: #c4b5fd;
      text-decoration: none;
      transition: color 0.2s;
      font-weight: 500;
    }

    footer a:hover {
      color: #e9d5ff;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      header {
        padding: 60px 24px;
      }

      header h1 {
        font-size: 2.5em;
      }

      header p {
        font-size: 1.05em;
      }

      .content {
        padding: 40px 24px;
      }

      .section h2 {
        font-size: 2em;
      }

      .instruments-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .controls {
        flex-direction: column;
      }

      .controls select,
      .controls input {
        width: 100%;
      }

      .instrument-card {
        padding: 20px;
      }

      .instrument-card .label {
        font-size: 1.3em;
      }

      .stat-card .number {
        font-size: 2.5em;
      }

      .manifest-list {
        padding: 24px;
      }

      footer {
        padding: 40px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎵 OpenGM24</h1>
      <p>General MIDI Soundfont Repository</p>
    </header>

    <div class="content">
      <!-- Statistics Section -->
      <div class="section">
        <div class="stats" id="stats">
          <div class="loading">Loading statistics...</div>
        </div>
      </div>

      <!-- Instruments Section -->
      <div class="section">
        <h2>Instruments</h2>
        <div class="controls">
          <select id="categoryFilter">
            <option value="">All Categories</option>
          </select>
          <input type="text" id="searchInput" placeholder="Search instruments..." style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; flex: 1;">
        </div>
        <div class="instruments-grid" id="instrumentsGrid">
          <div class="loading">Loading instruments...</div>
        </div>
      </div>

      <!-- Manifest Files Section -->
      <div class="section">
        <h2>Manifest Files</h2>
        <div class="manifest-list">
          <h3>Available JSON Manifests:</h3>
          <ul>
            <li><a href="./index.json"><code>index.json</code></a> - Complete instrument index with metadata (${indexData.length} instruments)</li>
            <li><a href="./OpenGM24.json"><code>OpenGM24.json</code></a> - OpenGM24 soundfont pack instrument names (${openGM24List.length} instruments)</li>
          </ul>
        </div>
      </div>
    </div>

    <footer>
      <p>OpenGM24 - General MIDI Soundfont Repository</p>
      <p>Derived from open-source soundfont sources with Creative Commons licenses</p>
      <p><a href="https://github.com/designerzen/open-generalmidi-soundfont">View on GitHub</a> | <a href="feed.json">📡 JSON Feed</a></p>
    </footer>
  </div>

  <script>
    let allInstruments = [];
    let currentAudio = null;

    function playNote(audioPath, keyElement) {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Remove playing class from all keys
      document.querySelectorAll('.piano-key').forEach(k => k.classList.remove('playing'));

      // Create and play new audio
      currentAudio = new Audio(audioPath);
      currentAudio.play().catch(err => console.error('Error playing audio:', err));

      // Add playing class to this key
      keyElement.classList.add('playing');

      // Remove class when audio ends
      currentAudio.addEventListener('ended', () => {
        keyElement.classList.remove('playing');
      });
    }

    // Load manifest files
    async function loadData() {
      try {
        const response = await fetch('./index.json');
        allInstruments = await response.json();
        
        // Update stats
        const uniqueCategories = new Set(allInstruments.map(i => i.category));
        document.getElementById('stats').innerHTML = \`
          <div class="stat-card">
            <div class="number">\${allInstruments.length}</div>
            <div class="label">Total Instruments</div>
          </div>
          <div class="stat-card">
            <div class="number">\${uniqueCategories.size}</div>
            <div class="label">Categories</div>
          </div>
        \`;

        // Populate category filter
        const categories = Array.from(uniqueCategories).sort();
        const categoryFilter = document.getElementById('categoryFilter');
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categoryFilter.appendChild(option);
        });

        // Initial render
        renderInstruments();

        // Add event listeners
        document.getElementById('categoryFilter').addEventListener('change', renderInstruments);
        document.getElementById('searchInput').addEventListener('input', renderInstruments);
      } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('instrumentsGrid').innerHTML = '<div class="loading">Error loading instruments</div>';
      }
    }

    function renderInstruments() {
      const category = document.getElementById('categoryFilter').value;
      const search = document.getElementById('searchInput').value.toLowerCase();

      let filtered = allInstruments.filter(instrument => {
        const matchesCategory = !category || instrument.category === category;
        const matchesSearch = !search || 
          instrument.label.toLowerCase().includes(search) ||
          instrument.name.toLowerCase().includes(search) ||
          instrument.description.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
      });

      const grid = document.getElementById('instrumentsGrid');
      if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading">No instruments found</div>';
        return;
      }

      grid.innerHTML = filtered.map(instrument => {
        const sampleNote = 'C4'; // Middle C as default sample
        const audioPath = instrument.folder ? \`./OpenGM24/\${instrument.folder}/\${sampleNote}.mp3\` : '';
        const audioHtml = audioPath ? \`<div class="audio-player"><audio controls><source src="\${audioPath}" type="audio/mpeg"></audio><em>Sample: \${sampleNote}</em></div>\` : '';
        
        const pianoHtml = instrument.notes && instrument.notes.length > 0 ? \`
          <div class="piano-container">
            <div class="piano-keyboard" data-instrument="\${instrument.program}">
              \${instrument.notes.map(note => \`<div class="piano-key" data-note="\${note}" data-path="./OpenGM24/\${instrument.folder}/\${note}.mp3">\${note}</div>\`).join('')}
            </div>
          </div>
        \` : '';
        
        return \`
          <div class="instrument-card">
            <div class="program">Program: \${instrument.program}</div>
            <div class="label">\${instrument.label}</div>
            <div class="category">\${instrument.category}</div>
            <div class="description">\${instrument.description}</div>
            <div class="folder">📁 <a href="./OpenGM24/\${instrument.folder}/" target="_blank">\${instrument.folder}</a></div>
            \${audioHtml}
            \${pianoHtml}
            <div class="metadata">
              <p><strong>Name:</strong> \${instrument.name}</p>
              \${instrument.commonUses ? \`<p><strong>Uses:</strong> \${instrument.commonUses.join(', ')}</p>\` : ''}
              \${instrument.alternateNames ? \`<p><strong>Alternates:</strong> \${instrument.alternateNames.join(', ')}</p>\` : ''}
            </div>
          </div>
        \`;
      }).join('');
      
      // Attach event listeners to piano keys
      document.querySelectorAll('.piano-key').forEach(key => {
        key.addEventListener('click', function() {
          playNote(this.dataset.path, this);
        });
      });
    }

    // Load data when page loads
    loadData();
  </script>
</body>
</html>`;

// Ensure gh-pages directory exists
if (!fs.existsSync('./gh-pages')) {
  fs.mkdirSync('./gh-pages', { recursive: true });
}

// Write the HTML file
fs.writeFileSync('./gh-pages/index.html', html, 'utf8');
console.log('✓ Generated index.html successfully');

// Generate JSON RSS feed
const jsonFeed = {
  version: "https://jsonfeed.org/version/1.1",
  title: "OpenGM24 - General MIDI Soundfont",
  description: "Complete General MIDI soundfont repository with 128 instruments",
  home_page_url: "https://designerzen.github.io/open-generalmidi-soundfont/",
  feed_url: "https://designerzen.github.io/open-generalmidi-soundfont/feed.json",
  manifest_url: "https://designerzen.github.io/open-generalmidi-soundfont/index.json",
  documentation: "Browse the complete instrument catalog at https://designerzen.github.io/open-generalmidi-soundfont/ or access the raw JSON manifests at the links above."
};

// Write the JSON feed file
fs.writeFileSync('./gh-pages/feed.json', JSON.stringify(jsonFeed, null, 2), 'utf8');
console.log('✓ Generated feed.json successfully');

// Copy manifest files to gh-pages
fs.copyFileSync('./index.json', './gh-pages/index.json');
console.log('✓ Copied index.json to gh-pages');

fs.copyFileSync('./OpenGM24.json', './gh-pages/OpenGM24.json');
console.log('✓ Copied OpenGM24.json to gh-pages');

// Copy entire OpenGM24 directory with all MP3 files
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyDirRecursive('./OpenGM24', './gh-pages/OpenGM24');
console.log('✓ Copied OpenGM24 directory with all MP3 files to gh-pages');
