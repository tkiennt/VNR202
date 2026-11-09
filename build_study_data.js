const fs = require('fs');
const path = require('path');

function mdToHtml(md) {
  // Normalize line endings
  let text = md.replace(/\r\n/g, '\n');

  // Convert tables, code blocks, lists
  const lines = text.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];
  let inMermaid = false;
  let mermaidLines = [];
  let inToc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Table of Contents header
    if (line.includes('MỤC LỤC') || line.includes('M?C L?C')) {
      result.push('<h2 id="muc-luc" class="content-h2"><span class="icon-badge icon-compass">🧭</span> MỤC LỤC ĐIỀU HƯỚNG ÔN TẬP TOÀN MÔN</h2>');
      result.push(renderInteractiveTOC());
      inToc = true;
      continue;
    }

    // Skip the raw ordered list lines belonging to the TOC
    if (inToc) {
      if (/^\d+\.\s*\[/.test(line.trim()) || line.trim() === '') {
        continue; // skip raw TOC markdown lines
      } else {
        inToc = false; // exit TOC block
      }
    }

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
      continue;
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
  // Markdown links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="content-link">$1</a>');
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

function renderInteractiveTOC() {
  return `
    <div class="toc-interactive-grid">
      <div class="toc-card" onclick="window.VNR_NAV.switchTab('timeline')" title="Mở Trục thời gian & 15 Đại hội">
        <div class="toc-badge">0</div>
        <div class="toc-body">
          <div class="toc-title">🗺️ Bản đồ tổng quan toàn môn</div>
          <div class="toc-desc">Trục thời gian 1858 – 2026 & Bảng 15 Đại hội Đảng</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="document.getElementById('nhap-mon').scrollIntoView({behavior:'smooth'})" title="Đọc phần Nhập môn">
        <div class="toc-badge">1</div>
        <div class="toc-body">
          <div class="toc-title">📖 Nhập môn Lịch sử Đảng</div>
          <div class="toc-desc">Đối tượng, chức năng, nhiệm vụ & phương pháp nghiên cứu</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchChapter('chap-1')" title="Mở nội dung Chương 1">
        <div class="toc-badge">2</div>
        <div class="toc-body">
          <div class="toc-title">📗 Chương 1: Đảng ra đời & Giành chính quyền (1930–1945)</div>
          <div class="toc-desc">Khai thác thuộc địa, Nguyễn Ái Quốc, Cương lĩnh vs Luận cương, CMT8</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchChapter('chap-2')" title="Mở nội dung Chương 2">
        <div class="toc-badge">3</div>
        <div class="toc-body">
          <div class="toc-title">📘 Chương 2: Hai cuộc kháng chiến (1945–1975)</div>
          <div class="toc-desc">Kháng chiến chống Pháp, Giơnevơ, Chống Mỹ cứu nước, 30/4/1975</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchChapter('chap-3')" title="Mở nội dung Chương 3">
        <div class="toc-badge">4</div>
        <div class="toc-body">
          <div class="toc-title">📙 Chương 3: Quá độ lên CNXH & Đổi mới (1975–2018)</div>
          <div class="toc-desc">Thống nhất Nhà nước, Đại hội IV–XII, Cương lĩnh 1991 & 2011, WTO</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchChapter('chap-4')" title="Mở nội dung Chương mở rộng">
        <div class="toc-badge">5</div>
        <div class="toc-body">
          <div class="toc-title">📕 Chương mở rộng: Từ 2018 đến Đại hội XIV (2026)</div>
          <div class="toc-desc">Đại hội XIII, XIV, Kỷ nguyên mới, Bộ tứ trụ cột NQ 57, 59, 66, 68, PCTN</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card highlight-warn" onclick="window.VNR_NAV.switchTab('pitfalls')" title="Xem phân tích 8 câu hỏi bẫy thi">
        <div class="toc-badge warn">6</div>
        <div class="toc-body">
          <div class="toc-title">⚠️ Phụ lục A – Giải quyết các câu bẫy thi & cần đối chiếu</div>
          <div class="toc-desc">Phân tích chuyên sâu 8 câu hỏi dễ nhầm lẫn trong ngân hàng đề gốc</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card highlight-quiz" onclick="window.VNR_NAV.switchTab('quiz')" title="Luyện trắc nghiệm 100 câu">
        <div class="toc-badge quiz">7</div>
        <div class="toc-body">
          <div class="toc-title">✍️ Phụ lục B – Bảng đáp án & Ngân hàng 100 câu trắc nghiệm</div>
          <div class="toc-desc">Luyện thi trắc nghiệm có giải thích chi tiết và hẹn giờ thi thử</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchTab('materials')" title="Xem danh mục tài liệu">
        <div class="toc-badge">8</div>
        <div class="toc-body">
          <div class="toc-title">📚 Phụ lục C – Ma trận liên kết nguồn tài liệu giáo trình</div>
          <div class="toc-desc">12 tài liệu chính thức theo syllabus & link đọc trực tuyến</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchTab('pitfalls')" title="Xem Checklist & chiến lược thi">
        <div class="toc-badge">9</div>
        <div class="toc-body">
          <div class="toc-title">✅ Phụ lục D – Checklist & chiến lược làm bài thi</div>
          <div class="toc-desc">Bí quyết đạt điểm cao và các kiến thức nhất định phải thuộc</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>

      <div class="toc-card" onclick="window.VNR_NAV.switchTab('materials')" title="Tra cứu nguồn văn kiện & Coursera">
        <div class="toc-badge">10</div>
        <div class="toc-body">
          <div class="toc-title">🔗 Nguồn tra cứu văn kiện & Điều kiện Coursera</div>
          <div class="toc-desc">Lưu ý bắt buộc về chứng chỉ Coursera để đủ điều kiện dự thi</div>
        </div>
        <div class="toc-arrow">➔</div>
      </div>
    </div>
  `;
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
      const isHeaderCol = (idx === 0);
      html += `<td${isHeaderCol ? ' class="col-header"' : ''}>${formatInline(col)}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function renderMermaidAsHtml(chartText) {
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

  return `<pre class="content-code"><code>${chartText}</code></pre>`;
}

// Helper to read markdown file from docs/ or root
function readDoc(fileName) {
  const p = fs.existsSync(path.join('docs', fileName))
    ? path.join('docs', fileName)
    : fileName;
  return fs.readFileSync(p, 'utf8');
}

// Extract chapters
const part0 = readDoc('part0.md');
const part1 = readDoc('part1.md');
const part2 = readDoc('part2.md');
const part3 = readDoc('part3.md');
const part4 = readDoc('part4.md');

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
console.log('Successfully updated study_data.js with interactive TOC grid!');
