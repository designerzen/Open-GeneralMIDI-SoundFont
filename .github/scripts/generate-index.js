const fs = require('fs');
const path = require('path');

// Read the manifest files
const indexData = JSON.parse(fs.readFileSync('./index.json', 'utf8'));
const openGM24List = JSON.parse(fs.readFileSync('./OpenGM24.json', 'utf8'));

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
  <title>OpenGM24 - General MIDI Soundfont Index</title>
  <link rel="alternate" type="application/feed+json" href="feed.json" title="OpenGM24 JSON Feed">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    header p {
      font-size: 1.1em;
      opacity: 0.95;
    }

    .content {
      padding: 40px 20px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section h2 {
      font-size: 1.8em;
      color: #667eea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #667eea;
    }

    .stat-card .number {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }

    .stat-card .label {
      color: #666;
      margin-top: 5px;
    }

    .instruments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .instrument-card {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .instrument-card:hover {
      border-color: #667eea;
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);
      transform: translateY(-4px);
    }

    .instrument-card .program {
      color: #667eea;
      font-size: 0.85em;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .instrument-card .label {
      font-size: 1.2em;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }

    .instrument-card .category {
      color: #764ba2;
      font-size: 0.9em;
      margin-bottom: 10px;
      display: inline-block;
      background: #f0e6ff;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .instrument-card .description {
      color: #666;
      font-size: 0.95em;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .instrument-card .folder {
      color: #667eea;
      font-size: 0.85em;
      word-break: break-all;
      background: #f0f7ff;
      padding: 8px;
      border-radius: 4px;
      border-left: 3px solid #667eea;
    }

    .manifest-list {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
    }

    .manifest-list h3 {
      color: #667eea;
      margin-bottom: 15px;
    }

    .manifest-list ul {
      list-style: none;
    }

    .manifest-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .manifest-list li:last-child {
      border-bottom: none;
    }

    .manifest-list code {
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #333;
    }

    footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 1.8em;
      }

      .instruments-grid {
        grid-template-columns: 1fr;
      }

      .stats {
        grid-template-columns: repeat(2, 1fr);
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
        <div class="stats">
          <div class="stat-card">
            <div class="number">${indexData.length}</div>
            <div class="label">Total Instruments</div>
          </div>
          <div class="stat-card">
            <div class="number">${openGM24List.length}</div>
            <div class="label">OpenGM24 Pack</div>
          </div>
          <div class="stat-card">
            <div class="number">${new Set(indexData.map(i => i.category)).size}</div>
            <div class="label">Categories</div>
          </div>
        </div>
      </div>

      <!-- Instruments Section -->
      <div class="section">
        <h2>Instruments</h2>
        <div class="instruments-grid">
          ${indexData.map(instrument => `
            <div class="instrument-card">
              <div class="program">Program: ${instrument.program}</div>
              <div class="label">${instrument.label}</div>
              <div class="category">${instrument.category}</div>
              <div class="description">${instrument.description}</div>
              <div class="folder">📁 ${instrument.folder || 'N/A'}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Manifest Files Section -->
      <div class="section">
        <h2>Manifest Files</h2>
        <div class="manifest-list">
          <h3>Available JSON Manifests:</h3>
          <ul>
            <li><code>index.json</code> - Complete instrument index with metadata (${indexData.length} instruments)</li>
            <li><code>OpenGM24.json</code> - OpenGM24 soundfont pack instrument names (${openGM24List.length} instruments)</li>
          </ul>
        </div>
      </div>

      <!-- Category Overview -->
      <div class="section">
        <h2>Categories Overview</h2>
        <div class="manifest-list">
          <h3>Instrument Categories:</h3>
          <ul>
            ${Array.from(new Set(indexData.map(i => i.category)))
                .sort()
                .map(category => {
                  const count = indexData.filter(i => i.category === category).length;
                  return `<li><strong>${category}</strong> (${count} instruments)</li>`;
                })
                .join('')}
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
  icon: "https://raw.githubusercontent.com/designerzen/open-generalmidi-soundfont/main/README.md",
  items: indexData.map(instrument => ({
    id: `instrument-${instrument.program}`,
    title: `${instrument.program}: ${instrument.label}`,
    content_html: `
      <h3>${instrument.label}</h3>
      <p><strong>Program:</strong> ${instrument.program}</p>
      <p><strong>Name:</strong> ${instrument.name}</p>
      <p><strong>Category:</strong> ${instrument.category}</p>
      <p><strong>Description:</strong> ${instrument.description}</p>
      ${instrument.commonUses ? `<p><strong>Common Uses:</strong> ${instrument.commonUses.join(', ')}</p>` : ''}
      ${instrument.alternateNames ? `<p><strong>Alternate Names:</strong> ${instrument.alternateNames.join(', ')}</p>` : ''}
      ${instrument.folder ? `<p><strong>Folder:</strong> ${instrument.folder}</p>` : ''}
    `.trim(),
    tags: [instrument.category, ...(instrument.commonUses || []), ...(instrument.alternateNames || [])],
    date_published: new Date().toISOString()
  }))
};

// Write the JSON feed file
fs.writeFileSync('./gh-pages/feed.json', JSON.stringify(jsonFeed, null, 2), 'utf8');
console.log('✓ Generated feed.json successfully');
