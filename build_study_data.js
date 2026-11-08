const fs = require('fs');

function mdToHtml(md) {
  // Normalize line endings
  let text = md.replace(/\r\n/g, '\n');

  // Convert tables
  // A table block has lines starting and ending with | or containing |
  const lines = text.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];
  let inMermaid = false;
  let mermaidLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Mermaid code block
    if (line.trim().startsWith('```mermaid')) {
      inMermaid = true;
      mermaidLines = [];
      continue;
    }
    if (inMermaid) {
      if (line.trim().startsWith('```')) {
        inMermaid = false;
        result.push(renderMermaidAsHtml(mermaidLines.join('\n')));
      } else {
        mermaidLines.push(line);
      }
      continue;
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      continue; // skip other code fences
    }

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      inTable = false;
      result.push(renderTable(tableRows));
      tableRows = [];
    }

    // Headings
    if (line.startsWith('# ')) {
      const title = line.substring(2).trim();
      const id = slugify(title);
      result.push(`<h1 id="${id}" class="content-h1">${formatInline(title)}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      const title = line.substring(3).trim();
      const id = slugify(title);
      result.push(`<h2 id="${id}" class="content-h2">${formatInline(title)}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      const title = line.substring(4).trim();
      const id = slugify(title);
      result.push(`<h3 id="${id}" class="content-h3">${formatInline(title)}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      const title = line.substring(5).trim();
      result.push(`<h4 class="content-h4">${formatInline(title)}</h4>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteText = line.substring(2).trim();
      result.push(`<blockquote class="content-blockquote">${formatInline(quoteText)}</blockquote>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      result.push('<hr class="content-divider" />');
      continue;
    }

    // Bullet lists
    if (line.trim().startsWith('- ')) {
      const itemText = line.trim().substring(2).trim();
      result.push(`<li class="content-li">${formatInline(itemText)}</li>`);
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s/.test(line.trim())) {
      const itemText = line.trim().replace(/^\d+\.\s*/, '');
      result.push(`<li class="content-ol-li">${formatInline(itemText)}</li>`);
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      continue;
    }

    // Normal paragraph
    result.push(`<p class="content-p">${formatInline(line.trim())}</p>`);
  }

  if (inTable && tableRows.length > 0) {
    result.push(renderTable(tableRows));
  }

  // Wrap adjacent <li> in <ul>
  let html = result.join('\n');
  html = html.replace(/(<li class="content-li">[\s\S]*?<\/li>)+/g, '<ul class="content-ul">$&</ul>');
  html = html.replace(/(<li class="content-ol-li">[\s\S]*?<\/li>)+/g, '<ol class="content-ol">$&</ol>');

  return html;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u1EF9-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function formatInline(str) {
  let s = str;
  // Bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong class="highlight-strong">$1</strong>');
  // Italic
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Mẹo nhớ callout
  s = s.replace(/💡/g, '<span class="icon-badge icon-bulb">💡</span>');
  s = s.replace(/⚠️/g, '<span class="icon-badge icon-warn">⚠️</span>');
  s = s.replace(/✅/g, '<span class="icon-badge icon-check">✅</span>');
  s = s.replace(/📚/g, '<span class="icon-badge icon-book">📚</span>');
  s = s.replace(/🧭/g, '<span class="icon-badge icon-compass">🧭</span>');
  s = s.replace(/🗺️/g, '<span class="icon-badge icon-map">🗺️</span>');
  s = s.replace(/📘|📗|📙|📕/g, '');
  return s;
}

function renderTable(rows) {
  if (rows.length < 2) return '';
  const parseRow = r => r.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
  
  const headers = parseRow(rows[0]);
  let dataStartIndex = 1;
  if (rows[1].includes('---') || rows[1].includes(':---')) {
    dataStartIndex = 2;
  }

  let html = '<div class="table-container"><table class="content-table"><thead><tr>';
  headers.forEach(h => {
    html += `<th>${formatInline(h)}</th>`;
  });
  html += '</tr></thead><tbody>';

  for (let i = dataStartIndex; i < rows.length; i++) {
    const cols = parseRow(rows[i]);
    if (cols.length === 0) continue;
    html += '<tr>';
    cols.forEach((col, idx) => {
      // First column often bold
      const isHeaderCol = (idx === 0);
      html += `<td${isHeaderCol ? ' class="col-header"' : ''}>${formatInline(col)}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function renderMermaidAsHtml(chartText) {
  // Turn mermaid flowcharts / timelines into visual diagram cards
  if (chartText.includes('timeline')) {
    const lines = chartText.split('\n').filter(l => l.includes(':'));
    let html = '<div class="timeline-visual-diagram"><div class="diagram-title">Trục tiến trình sự kiện</div><div class="timeline-nodes-wrap">';
    lines.forEach((l, idx) => {
      const parts = l.split(':');
      const time = parts[0].trim();
      const events = parts.slice(1).map(p => p.trim());
      html += `
        <div class="timeline-node-card">
          <div class="timeline-node-badge">${time}</div>
          <div class="timeline-node-content">
            ${events.map(e => `<div class="timeline-node-item">• ${formatInline(e)}</div>`).join('')}
          </div>
        </div>
      `;
    });
    html += '</div></div>';
    return html;
  }

  if (chartText.includes('flowchart') || chartText.includes('graph')) {
    const lines = chartText.split('\n').filter(l => l.includes('-->') || l.includes('---'));
    let html = '<div class="flowchart-visual-diagram"><div class="diagram-title">Sơ đồ logic chuyển tiếp</div><div class="flow-steps-wrap">';
    lines.forEach((l, idx) => {
      const matches = l.match(/\["([^"]+)"\]|\[([^\]]+)\]/g);
      if (matches && matches.length >= 2) {
        const from = matches[0].replace(/[\[\]"]/g, '').trim();
        const to = matches[1].replace(/[\[\]"]/g, '').trim();
        html += `
          <div class="flow-step-pair">
            <div class="flow-box from">${formatInline(from)}</div>
            <div class="flow-arrow">➔</div>
            <div class="flow-box to">${formatInline(to)}</div>
          </div>
        `;
      }
    });
    html += '</div></div>';
    return html;
  }

  // fallback
  return `<pre class="content-code"><code>${chartText}</code></pre>`;
}

// Extract chapters
const part0 = fs.readFileSync('part0.md', 'utf8');
const part1 = fs.readFileSync('part1.md', 'utf8');
const part2 = fs.readFileSync('part2.md', 'utf8');
const part3 = fs.readFileSync('part3.md', 'utf8');
const part4 = fs.readFileSync('part4.md', 'utf8');

// Slice out question sections
const p0Study = part0;
const p1Study = part1.substring(0, part1.indexOf('### 1.13'));
const p2Study = part2.substring(0, part2.indexOf('### 2.12'));
const p3Study = part3.substring(0, part3.indexOf('### 3.12') !== -1 ? part3.indexOf('### 3.12') : part3.indexOf('#### 🔹 Giai đoạn 1975–1986'));
const p4Study = part4.substring(0, part4.indexOf('## X.6'));

const CHAPTERS = [
  {
    id: "chap-0",
    title: "Nhập môn & Tổng quan toàn môn",
    subtitle: "Đối tượng, phương pháp, bản đồ tư duy, 15 Đại hội & Tổng Bí thư",
    badge: "Tổng quan",
    html: mdToHtml(p0Study)
  },
  {
    id: "chap-1",
    title: "Chương 1: Đảng ra đời & Giành chính quyền (1930 – 1945)",
    subtitle: "Khai thác thuộc địa, Nguyễn Ái Quốc, Cương lĩnh vs Luận cương, 3 cao trào, CMT8",
    badge: "1930 – 1945",
    html: mdToHtml(p1Study)
  },
  {
    id: "chap-2",
    title: "Chương 2: Lãnh đạo 2 cuộc kháng chiến (1945 – 1975)",
    subtitle: "Ngàn cân treo sợi tóc, Kháng chiến chống Pháp, Giơnevơ, Chống Mỹ, Pari, 30/4/1975",
    badge: "1945 – 1975",
    html: mdToHtml(p2Study)
  },
  {
    id: "chap-3",
    title: "Chương 3: Cả nước quá độ lên CNXH & Đổi mới (1975 – 2018)",
    subtitle: "Thống nhất Nhà nước, Đại hội IV–XII, Cương lĩnh 1991 & 2011, WTO, NQ Trung ương",
    badge: "1975 – 2018",
    html: mdToHtml(p3Study)
  },
  {
    id: "chap-4",
    title: "Chương mở rộng: Từ 2018 đến Đại hội XIV (2026)",
    subtitle: "Đại hội XIII & XIV, Kỷ nguyên mới, Bộ tứ trụ cột NQ 57, 59, 66, 68, Sách PCTN",
    badge: "2018 – 2026",
    html: mdToHtml(p4Study)
  }
];

const outContent = '/* Auto-generated compiled HTML for study chapters */\nwindow.VNR_CHAPTERS = ' + JSON.stringify(CHAPTERS, null, 2) + ';\n';
fs.writeFileSync('study_data.js', outContent, 'utf8');
console.log('Successfully generated study_data.js with ' + CHAPTERS.length + ' chapters!');
