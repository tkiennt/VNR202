const fs = require('fs');

// 1. Parse 700 Official Questions for VNR202 (chuẩn đề cương & giáo trình FPT 2021)
function parse700Questions() {
  const filePath = fs.existsSync('docs/ngan_hang_700_cau_trac_nghiem_lsd.md')
    ? 'docs/ngan_hang_700_cau_trac_nghiem_lsd.md'
    : 'ngan_hang_700_cau_trac_nghiem_lsd.md';
  const content = fs.readFileSync(filePath, 'utf8');

  const c1 = content.indexOf('## CHƯƠNG 1:');
  const c2 = content.indexOf('## CHƯƠNG 2:');
  const c3 = content.indexOf('## CHƯƠNG 3:');

  const chapters = [
    {
      num: 1,
      name: 'Chương 1: Đảng Cộng sản Việt Nam ra đời và lãnh đạo đấu tranh giành chính quyền (1930 – 1945)',
      start: c1,
      end: c2,
      prefix: 'C1',
      source: 'Giáo trình Lịch sử Đảng Cộng sản Việt Nam 2021, Chương 1 (tr. 35 – 125)'
    },
    {
      num: 2,
      name: 'Chương 2: Đảng lãnh đạo hai cuộc kháng chiến chống ngoại xâm, hoàn thành giải phóng dân tộc, thống nhất đất nước (1945 – 1975)',
      start: c2,
      end: c3,
      prefix: 'C2',
      source: 'Giáo trình Lịch sử Đảng Cộng sản Việt Nam 2021, Chương 2 (tr. 127 – 235)'
    },
    {
      num: 3,
      name: 'Chương 3: Đảng lãnh đạo cả nước quá độ lên chủ nghĩa xã hội và tiến hành công cuộc đổi mới (1975 đến nay)',
      start: c3,
      end: content.length,
      prefix: 'C3',
      source: 'Giáo trình Lịch sử Đảng Cộng sản Việt Nam 2021, Chương 3 (tr. 237 – 434)'
    }
  ];

  const questions = [];

  chapters.forEach(ch => {
    const chText = content.substring(ch.start, ch.end);
    const dapAnPos = chText.indexOf('### BẢNG TRA CỨU ĐÁP ÁN');
    const questionsText = dapAnPos !== -1 ? chText.substring(0, dapAnPos) : chText;

    const qPattern = /####\s*Câu\s*(\d+)[:.]?\s*([\s\S]*?)(?=####\s*Câu\s*\d+|###|##|$)/g;
    let m;
    while ((m = qPattern.exec(questionsText)) !== null) {
      const qNum = parseInt(m[1], 10);
      const qBody = m[2].trim();

      const lines = qBody.split('\n').map(l => l.trim()).filter(Boolean);
      let qTitle = '';
      const optLines = [];

      lines.forEach(l => {
        if (/^[*-]\s*(\d+\.)?\s*(\*{2})?([A-D])\./i.test(l) || /^[*-]\s*(\*{2})?([A-D])\./i.test(l)) {
          optLines.push(l);
        } else if (!l.startsWith('>') && optLines.length === 0) {
          qTitle += (qTitle ? ' ' : '') + l;
        }
      });

      const options = [];
      optLines.forEach(l => {
        const optMatch = l.match(/^[*-]\s*(\*{2})?([A-D])\.\s*(\*{2})?\s*([\s\S]*)/i);
        if (optMatch) {
          const optId = optMatch[2].toUpperCase();
          let optText = optMatch[4].trim();
          optText = optText.replace(/\(Đáp án đúng\)/i, '').replace(/\(đáp án đúng\)/i, '').replace(/\*{2}/g, '').trim();
          options.push({ id: optId, text: optText });
        }
      });

      let answer = '';
      const ansMatch = qBody.match(/\*\*Đáp án đúng:\*\*\s*\*\*([A-D])\*\*/i) ||
                       qBody.match(/\*\*Đáp án đúng:\*\*\s*([A-D])/i) ||
                       qBody.match(/Đáp án đúng:\s*([A-D])/i);
      if (ansMatch) {
        answer = ansMatch[1].toUpperCase();
      } else {
        const foundInOpt = optLines.find(l => /đáp án đúng/i.test(l));
        if (foundInOpt) {
          const mOpt = foundInOpt.match(/([A-D])\./i);
          if (mOpt) answer = mOpt[1].toUpperCase();
        }
      }

      let explanation = '';
      const expMatch = qBody.match(/>\s*\*\*Đáp án đúng:\*\*[^\n\r]*—\s*\*([^*]+)\*/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }

      const correctOpt = options.find(o => o.id === answer);
      const optText = correctOpt ? correctOpt.text : '';
      const fullExplanation = explanation 
        ? `Đáp án đúng là ${answer}: ${explanation}`
        : (optText ? `Đáp án đúng là ${answer}: ${optText}` : `Đáp án đúng là ${answer}.`);

      // Tags
      const tags = [];
      if (/đại hội/i.test(qTitle)) tags.push('Đại hội');
      if (/cương lĩnh|luận cương/i.test(qTitle)) tags.push('Cương lĩnh');
      if (/chiến lược|chiến dịch|kháng chiến|quân sự/i.test(qTitle)) tags.push('Quân sự');
      if (/kinh tế|thị trường|công nghiệp/i.test(qTitle)) tags.push('Kinh tế');
      if (/hiệp định|ngoại giao/i.test(qTitle)) tags.push('Hiệp định');
      if (/nghị quyết|chỉ thị/i.test(qTitle)) tags.push('Nghị quyết');
      tags.push(ch.prefix);

      questions.push({
        id: `${ch.prefix}-${qNum}`,
        chapter: ch.num,
        chapterName: ch.name,
        question: qTitle,
        options,
        answer,
        explanation: fullExplanation,
        source: ch.source,
        tags
      });
    }
  });

  return questions;
}

const allQuestions = parse700Questions();
console.log('Total official questions loaded:', allQuestions.length);

// 3. Congresses Dataset
const CONGRESSES = [
  {
    number: "Hội nghị thành lập Đảng",
    year: "1930",
    date: "6/1 – 7/2/1930",
    location: "Cửu Long (Hương Cảng, Trung Quốc)",
    generalSecretary: "Nguyễn Ái Quốc (chủ trì)",
    theme: "Hợp nhất ba tổ chức cộng sản, thành lập Đảng Cộng sản Việt Nam",
    keyDecisions: [
      "Hợp nhất Đông Dương CSĐ, An Nam CSĐ và ĐDCS Liên đoàn thành Đảng Cộng sản Việt Nam",
      "Thông qua Chánh cương vắn tắt, Sách lược vắn tắt, Chương trình tóm tắt, Điều lệ vắn tắt (Cương lĩnh chính trị đầu tiên do Nguyễn Ái Quốc khởi thảo)",
      "Bầu Ban Chấp hành Trung ương lâm thời do Trịnh Đình Cửu đứng đầu"
    ],
    significance: "Chấm dứt thời kỳ khủng hoảng sâu sắc về đường lối cứu nước và giai cấp lãnh đạo kéo dài gần một thế kỷ."
  },
  {
    number: "Đại hội I",
    year: "1935",
    date: "27 – 31/3/1935",
    location: "Ma Cao (Trung Quốc)",
    generalSecretary: "Lê Hồng Phong",
    theme: "Phục hồi hệ thống tổ chức của Đảng và phong trào cách mạng",
    keyDecisions: [
      "Đánh giá quá trình khôi phục tổ chức Đảng sau khủng bố trắng 1930–1931",
      "Đề ra ba nhiệm vụ trước mắt: củng cố và phát triển Đảng; thâu phục quảng đại quần chúng lao động; chống đế quốc chiến tranh",
      "Bầu BCH Trung ương do đồng chí Lê Hồng Phong làm Tổng Bí thư"
    ],
    significance: "Đánh dấu sự phục hồi căn bản hệ thống tổ chức của Đảng từ Trung ương đến cơ sở."
  },
  {
    number: "Đại hội II",
    year: "1951",
    date: "11 – 19/2/1951",
    location: "Chiêm Hóa, Tuyên Quang",
    generalSecretary: "Trường Chinh",
    theme: "\"Đại hội kháng chiến thắng lợi\"",
    keyDecisions: [
      "Đưa Đảng ra hoạt động công khai lấy tên là Đảng Lao động Việt Nam",
      "Thông qua Chính cương của Đảng Lao động Việt Nam; xác định con đường đi lên CNXH qua 3 giai đoạn",
      "Bầu Hồ Chí Minh làm Chủ tịch Đảng, Trường Chinh làm Tổng Bí thư"
    ],
    significance: "Đại hội đầu tiên tổ chức trong nước, đánh dấu bước phát triển vượt bậc về tư tưởng đường lối kháng chiến."
  },
  {
    number: "Đại hội III",
    year: "1960",
    date: "5 – 10/9/1960",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Lê Duẩn (Bí thư thứ nhất)",
    theme: "\"Đại hội xây dựng CNXH ở miền Bắc và đấu tranh giải phóng miền Nam\"",
    keyDecisions: [
      "Xác định đồng thời hai chiến lược cách mạng: CM XHCN ở miền Bắc và CM DTDCND ở miền Nam",
      "Miền Bắc là hậu phương lớn có vai trò quyết định nhất; Miền Nam là tiền tuyến lớn có vai trò quyết định trực tiếp",
      "Thông qua Kế hoạch Nhà nước 5 năm lần thứ nhất (1961–1965)"
    ],
    significance: "Hoàn chỉnh đường lối chung cách mạng Việt Nam thời kỳ chống Mỹ cứu nước."
  },
  {
    number: "Đại hội IV",
    year: "1976",
    date: "14 – 20/12/1976",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Lê Duẩn",
    theme: "\"Đại hội toàn thắng của sự nghiệp giải phóng dân tộc, thống nhất Tổ quốc\"",
    keyDecisions: [
      "Quyết định đổi tên Đảng thành Đảng Cộng sản Việt Nam",
      "Tổng kết cuộc kháng chiến chống Mỹ và đề ra đường lối cách mạng XHCN trong cả nước",
      "Thông qua Kế hoạch 5 năm 1976–1980; xác định CNH XHCN là nhiệm vụ trung tâm"
    ],
    significance: "Mở ra thời kỳ cả nước độc lập, thống nhất cùng đi lên chủ nghĩa xã hội."
  },
  {
    number: "Đại hội V",
    year: "1982",
    date: "27 – 31/3/1982",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Lê Duẩn",
    theme: "\"Tất cả vì Tổ quốc XHCN, vì hạnh phúc của nhân dân\"",
    keyDecisions: [
      "Xác định 2 nhiệm vụ chiến lược: Xây dựng CNXH và bảo vệ vững chắc Tổ quốc XHCN",
      "Coi nông nghiệp là mặt trận hàng đầu, kết hợp nông nghiệp, công nghiệp hàng tiêu dùng và công nghiệp nặng",
      "Bước đầu tìm tòi điều chỉnh cơ chế quản lý kinh tế"
    ],
    significance: "Bước chuyển nhận thức quan trọng về chặng đường đầu tiên của thời kỳ quá độ."
  },
  {
    number: "Đại hội VI",
    year: "1986",
    date: "15 – 18/12/1986",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Nguyễn Văn Linh",
    theme: "\"Đại hội Đổi mới toàn diện đất nước\"",
    keyDecisions: [
      "Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật",
      "Khởi xướng đường lối Đổi mới toàn diện: xóa bỏ cơ chế tập trung quan liêu bao cấp, chuyển sang kinh tế hàng hóa nhiều thành phần",
      "Rút ra 4 bài học lớn về quán triệt tư tưởng \"Lấy dân làm gốc\""
    ],
    significance: "Cột mốc lịch sử vĩ đại mở ra thời kỳ đổi mới, phát triển và hội nhập của dân tộc Việt Nam."
  },
  {
    number: "Đại hội VII",
    year: "1991",
    date: "24 – 27/6/1991",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Đỗ Mười",
    theme: "\"Đại hội của trí tuệ, đổi mới, dân chủ, kỷ cương và đoàn kết\"",
    keyDecisions: [
      "Thông qua Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH (Cương lĩnh 1991) nêu 6 đặc trưng",
      "Khẳng định: Chủ nghĩa Mác – Lênin và tư tưởng Hồ Chí Minh là nền tảng tư tưởng, kim chỉ nam cho hành động",
      "Đề ra Chiến lược ổn định và phát triển kinh tế – xã hội đến năm 2000"
    ],
    significance: "Đặt nền móng lý luận vững chắc cho công cuộc đổi mới trong bối cảnh Liên Xô sụp đổ."
  },
  {
    number: "Đại hội VIII",
    year: "1996",
    date: "28/6 – 1/7/1996",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Đỗ Mười",
    theme: "\"Tiếp tục sự nghiệp đổi mới, đẩy mạnh công nghiệp hóa, hiện đại hóa\"",
    keyDecisions: [
      "Khẳng định nước ta đã ra khỏi khủng hoảng kinh tế – xã hội trầm trọng",
      "Đề ra chủ trương đẩy mạnh công nghiệp hóa, hiện đại hóa đất nước",
      "Tăng trưởng kinh tế phải gắn liền với tiến bộ và công bằng xã hội ngay trong từng bước và suốt quá trình phát triển"
    ],
    significance: "Chuyển đất nước sang thời kỳ phát triển mới: đẩy mạnh CNH, HĐH đất nước."
  },
  {
    number: "Đại hội IX",
    year: "2001",
    date: "19 – 22/4/2001",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Nông Đức Mạnh",
    theme: "\"Phát huy sức mạnh toàn dân tộc, đẩy mạnh CNH, HĐH, xây dựng và bảo vệ Tổ quốc\"",
    keyDecisions: [
      "Chính thức khẳng định phát triển nền kinh tế thị trường định hướng XHCN là mô hình kinh tế tổng quát",
      "Định nghĩa đầy đủ về tư tưởng Hồ Chí Minh",
      "Chiến lược phát triển kinh tế – xã hội 10 năm 2001–2010"
    ],
    significance: "Đại hội mở đầu thế kỷ XXI, đột phá lý luận về kinh tế thị trường định hướng XHCN."
  },
  {
    number: "Đại hội X",
    year: "2006",
    date: "18 – 25/4/2006",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Nông Đức Mạnh",
    theme: "\"Nâng cao năng lực lãnh đạo và sức chiến đấu của Đảng, phát huy sức mạnh toàn dân tộc\"",
    keyDecisions: [
      "Đột phá lý luận: Cho phép đảng viên làm kinh tế tư nhân (kể cả tư bản tư nhân)",
      "Xác định xây dựng, chỉnh đốn Đảng là nhiệm vụ then chốt hàng đầu",
      "Chủ động và tích cực hội nhập kinh tế quốc tế (gia nhập WTO 1/2007)"
    ],
    significance: "Giải phóng triệt để các nguồn lực kinh tế xã hội, mở rộng hội nhập quốc tế."
  },
  {
    number: "Đại hội XI",
    year: "2011",
    date: "12 – 19/1/2011",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Nguyễn Phú Trọng",
    theme: "\"Tiếp tục nâng cao năng lực lãnh đạo, đẩy mạnh toàn diện công cuộc đổi mới\"",
    keyDecisions: [
      "Thông qua Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH (bổ sung, phát triển năm 2011) với 8 đặc trưng",
      "Đề ra 3 đột phá chiến lược: thể chế, nguồn nhân lực và hệ thống kết cấu hạ tầng",
      "Chiến lược phát triển kinh tế – xã hội 2011–2020"
    ],
    significance: "Hoàn thiện hệ thống Cương lĩnh cách mạng trong giai đoạn phát triển mới."
  },
  {
    number: "Đại hội XII",
    year: "2016",
    date: "20 – 28/1/2016",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Nguyễn Phú Trọng",
    theme: "\"Tăng cường xây dựng Đảng trong sạch, vững mạnh; phát huy sức mạnh toàn dân tộc\"",
    keyDecisions: [
      "Đẩy mạnh toàn diện, đồng bộ công cuộc đổi mới; bảo vệ vững chắc Tổ quốc",
      "Đặc biệt coi trọng công tác xây dựng, chỉnh đốn Đảng; ban hành NQ TW 4 khóa XII (30/10/2016) chống 27 biểu hiện suy thoái",
      "Kinh tế tư nhân là một động lực quan trọng của nền kinh tế"
    ],
    significance: "Tạo chuyển biến vượt bậc trong đấu tranh phòng, chống tham nhũng, lãng phí, tiêu cực."
  },
  {
    number: "Đại hội XIII",
    year: "2021",
    date: "25/1 – 2/2/2021",
    location: "Thủ đô Hà Nội",
    generalSecretary: "Nguyễn Phú Trọng",
    theme: "\"Tăng cường xây dựng, chỉnh đốn Đảng và hệ thống chính trị trong sạch, vững mạnh; khơi dậy khát vọng phát triển đất nước\"",
    keyDecisions: [
      "Điểm mới nổi bật: Xác định mục tiêu 2025 (vượt TN trung bình thấp), 2030 (công nghiệp hiện đại, TN trung bình cao) và tầm nhìn 2045 (nước phát triển, thu nhập cao)",
      "Khẳng định 12 định hướng phát triển, 6 nhiệm vụ trọng tâm, 3 đột phá chiến lược",
      "Kiên quyết không có vùng cấm, không có ngoại lệ trong công tác PCTN"
    ],
    significance: "Xác lập tầm nhìn chiến lược 25 năm hướng tới dấu mốc 100 năm thành lập Đảng và 100 năm lập nước."
  },
  {
    number: "Đại hội XIV",
    year: "2026",
    date: "19 – 23/1/2026",
    location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    generalSecretary: "Tô Lâm",
    theme: "\"Đoàn kết – Dân chủ – Kỷ cương – Đột phá – Phát triển\"",
    keyDecisions: [
      "Đồng chí Tô Lâm được bầu lại làm Tổng Bí thư khóa XIV (nhiệm kỳ 2026–2031); BCT có 19 đồng chí",
      "Xác định mục tiêu tăng trưởng GDP bình quân 2026–2030 từ 10%/năm trở lên",
      "Lấy khoa học, công nghệ, đổi mới sáng tạo, chuyển đổi số quốc gia là động lực chính; kinh tế tư nhân là một động lực quan trọng nhất",
      "Tổng kết 40 năm Đổi mới và bước vào kỷ nguyên mới – kỷ nguyên vươn mình của dân tộc Việt Nam"
    ],
    significance: "Đại hội lịch sử mở ra kỷ nguyên mới: tự chủ chiến lược, tự cường, tự tin đưa đất nước phát triển vượt bậc."
  }
];

// 4. General Secretaries
const GENERAL_SECRETARIES = [
  { name: "Trần Phú", period: "10/1930 – 4/1931", role: "Tổng Bí thư đầu tiên của Đảng", milestone: "Khởi thảo Luận cương chính trị tháng 10/1930; hy sinh anh dũng với câu nói bất hủ: \"Hãy giữ vững chí khí chiến đấu!\"" },
  { name: "Lê Hồng Phong", period: "3/1935 – 1936", role: "Tổng Bí thư tại Đại hội I", milestone: "Chủ trì Đại hội I Ma Cao (1935), phục hồi hệ thống tổ chức Đảng sau thời kỳ thoái trào." },
  { name: "Hà Huy Tập", period: "1936 – 1938", role: "Tổng Bí thư thời kỳ Mặt trận Dân chủ", milestone: "Lãnh đạo phong trào đấu tranh đòi tự do, dân chủ, cơm áo, hòa bình; viết tác phẩm \"Tranh đấu thống nhất\"." },
  { name: "Nguyễn Văn Cừ", period: "1938 – 11/1939", role: "Tổng Bí thư", milestone: "Tác giả cuốn \"Tự chỉ trích\"; chủ trì Hội nghị TW 6 (11/1939) mở đầu chuyển hướng chỉ đạo chiến lược cách mạng." },
  { name: "Trường Chinh", period: "5/1941 – 1956 & 7/1986 – 12/1986", role: "Tổng Bí thư 2 thời kỳ then chốt", milestone: "Chủ trì Hội nghị TW 8 (1941), Đề cương Văn hóa 1943, tác giả \"Kháng chiến nhất định thắng lợi\"; năm 1986 là kiến trúc sư khởi xướng Đổi mới." },
  { name: "Hồ Chí Minh", period: "1956 – 1960", role: "Chủ tịch Đảng kiêm Tổng Bí thư", milestone: "Trực tiếp chỉ đạo củng cố Đảng sau sai lầm cải cách ruộng đất, lãnh đạo sự nghiệp xây dựng miền Bắc và đấu tranh ở miền Nam." },
  { name: "Lê Duẩn", period: "1960 – 1986", role: "Bí thư thứ nhất (1960–1976), Tổng Bí thư (1976–1986)", milestone: "Khởi thảo Đề cương cách mạng miền Nam; lãnh đạo trọn vẹn cuộc kháng chiến chống Mỹ thắng lợi và thời kỳ đầu thống nhất đất nước." },
  { name: "Nguyễn Văn Linh", period: "12/1986 – 6/1991", role: "Tổng Bí thư Đại hội VI Đổi mới", milestone: "Người lãnh đạo kiên quyết thực hiện đường lối Đổi mới, tác giả loạt bài báo nổi tiếng \"Những việc cần làm ngay\"." },
  { name: "Đỗ Mười", period: "6/1991 – 12/1997", role: "Tổng Bí thư Đại hội VII, VIII", milestone: "Cùng BCH TW chèo lái đưa đất nước vượt qua cơn địa chấn sụp đổ của khối XHCN Đông Âu và Liên Xô, đẩy mạnh CNH-HĐH." },
  { name: "Lê Khả Phiêu", period: "12/1997 – 4/2001", role: "Tổng Bí thư", milestone: "Đẩy mạnh phong trào xây dựng chỉnh đốn Đảng theo tinh thần NQ TW 6 (lần 2) khóa VIII." },
  { name: "Nông Đức Mạnh", period: "4/2001 – 1/2011", role: "Tổng Bí thư Đại hội IX, X", milestone: "Chính thức xác lập mô hình kinh tế thị trường định hướng XHCN, gia nhập WTO (2007), cho phép đảng viên làm kinh tế tư nhân." },
  { name: "Nguyễn Phú Trọng", period: "1/2011 – 7/2024", role: "Tổng Bí thư Đại hội XI, XII, XIII", milestone: "Trưởng Ban Chỉ đạo TW về PCTN, tiêu cực; khởi xướng phong trào \"đốt lò\" không có vùng cấm, nâng cao uy tín quốc tế của Việt Nam." },
  { name: "Tô Lâm", period: "8/2024 – nay", role: "Tổng Bí thư (tái cử tại Đại hội XIV)", milestone: "Lãnh đạo đất nước bước vào \"Kỷ nguyên mới – kỷ nguyên vươn mình của dân tộc\", đột phá bộ tứ thể chế NQ 57, 59, 66, 68 và tăng trưởng 2 con số." }
];

// 5. Comparisons (Now 6 comprehensive tables!)
const COMPARISONS = {
  cuongLinhVsLuanCuong: {
    title: "1. So sánh Cương lĩnh chính trị đầu tiên (2/1930) và Luận cương chính trị (10/1930)",
    headers: ["Tiêu chí", "Cương lĩnh chính trị đầu tiên (2/1930)", "Luận cương chính trị (10/1930)"],
    rows: [
      ["Người soạn thảo", "Nguyễn Ái Quốc", "Trần Phú"],
      ["Tính chất cách mạng", "Tư sản dân quyền cách mạng và thổ địa cách mạng để đi tới xã hội cộng sản", "Cách mạng tư sản dân quyền, bỏ qua tư bản chủ nghĩa tiến thẳng lên XHCN"],
      ["Nhiệm vụ hàng đầu", "Chống đế quốc giải phóng dân tộc (đặt lên hàng đầu), sau đó đánh phong kiến", "Đánh đổ phong kiến (thổ địa cách mạng) và đánh đế quốc; hai nhiệm vụ khăng khít"],
      ["Lực lượng cách mạng", "Công - nông là gốc; đồng thời đoàn kết với tiểu tư sản, trí thức, trung nông; lôi kéo hoặc trung lập phú nông, trung tiểu địa chủ, tư sản dân tộc", "Công nhân và nông dân là động lực chính; coi nhẹ hoặc đánh giá khắt khe tầng lớp trí thức, tiểu tư sản, tư sản dân tộc"],
      ["Phạm vi phong trào", "Cách mạng Việt Nam", "Toàn Đông Dương (đổi tên thành Đảng Cộng sản Đông Dương)"],
      ["Đánh giá lịch sử", "Đúng đắn, sáng tạo, thấm đượm tính dân tộc và tính nhân văn sâu sắc", "Mang tính nguyên tắc giai cấp, còn giáo điều, rập khuôn QTCS, nặng về đấu tranh giai cấp"]
    ]
  },
  khoan100VsKhoan10: {
    title: "2. So sánh bước đột phá nông nghiệp: Khoán 100 (1981) vs Khoán 10 (1988)",
    headers: ["Tiêu chí", "Chỉ thị 100-CT/TW (Khoán 100, 1/1981)", "Nghị quyết 10-NQ/TW (Khoán 10, 4/1988)"],
    rows: [
      ["Cấp ban hành", "Ban Bí thư Trung ương Đảng", "Bộ Chính trị"],
      ["Chủ thể nhận khoán", "Nhóm lao động và người lao động trong HTX", "Hộ gia đình được công nhận là đơn vị kinh tế tự chủ"],
      ["Khâu khoán", "Khoán 3 khâu cuối (gieo cấy, chăm sóc, thu hoạch); 5 khâu đầu HTX vẫn quản lý", "Khoán trọn gói đến hộ gia đình"],
      ["Quyền định đoạt sản phẩm", "Giao nộp sản phẩm khoán cho HTX, phần dôi dư được hưởng", "Sau khi nộp thuế và nghĩa vụ, nông dân toàn quyền định đoạt, mua bán sản phẩm trên thị trường"],
      ["Thời hạn giao đất", "Giao đất vụ theo mùa, thời hạn ngắn", "Giao đất ổn định lâu dài (từ 10 đến 15 năm, sau tăng lên)"],
      ["Ý nghĩa lịch sử", "Bước đột phá đầu tiên tháo gỡ khó khăn nông nghiệp", "Cởi trói triệt để sức sản xuất, đưa Việt Nam từ thiếu đói thành nước xuất khẩu gạo hàng đầu thế giới"]
    ]
  },
  baCaoTrao: {
    title: "3. So sánh 3 Cao trào cách mạng (1930–1931, 1936–1939, 1939–1945)",
    headers: ["Tiêu chí", "Cao trào 1930 – 1931", "Cao trào 1936 – 1939", "Cao trào 1939 – 1945"],
    rows: [
      ["Kẻ thù chủ yếu", "Đế quốc Pháp và phong kiến tay sai", "Bọn phản động thuộc địa Pháp và tay sai không chịu thi hành cải cách", "Phát xít Pháp – Nhật"],
      ["Mục tiêu, nhiệm vụ", "Độc lập dân tộc và người cày có ruộng", "Đòi tự do, dân chủ, cơm áo, hòa bình (dân sinh, dân chủ)", "Giải phóng dân tộc lên hàng đầu (tạm gác ruộng đất)"],
      ["Hình thức đấu tranh", "Bí mật, bất hợp pháp, biểu tình bạo lực vũ trang", "Công khai, nửa công khai, hợp pháp, nửa hợp pháp, nghị trường, báo chí", "Bí mật, bất hợp pháp, tiến tới khởi nghĩa vũ trang từng phần và Tổng khởi nghĩa"],
      ["Mặt trận dân tộc", "Bước đầu xây dựng khối liên minh công nông", "Mặt trận Thống nhất Nhân dân Phản đế Đông Dương → Mặt trận Dân chủ Đông Dương", "Mặt trận Việt Minh (thành lập 5/1941)"],
      ["Đỉnh cao sự kiện", "Xô Viết Nghệ Tĩnh (tháng 9/1930)", "Phong trào Đông Dương Đại hội, mít tinh 1/5/1938 tại Nhà Đấu Xảo (Hà Nội)", "Tổng khởi nghĩa tháng Tám 1945 giành độc lập hoàn toàn"],
      ["Ý nghĩa đối với CMT8", "Cuộc tập dượt đầu tiên cho Cách mạng Tháng Tám", "Cuộc tập dượt thứ hai cho Cách mạng Tháng Tám", "Cuộc tổng diễn tập trực tiếp đưa đến thắng lợi của CMT8"]
    ]
  },
  chienLuocChienTranh: {
    title: "4. So sánh 3 chiến lược chiến tranh của đế quốc Mỹ ở miền Nam (1961–1973)",
    headers: ["Tiêu chí", "Chiến tranh đặc biệt (1961 – 1965)", "Chiến tranh cục bộ (1965 – 1968)", "Việt Nam hóa chiến tranh (1969 – 1973)"],
    rows: [
      ["Lực lượng tham chiến", "Quân đội Sài Gòn làm nòng cốt + cố vấn Mỹ, vũ khí Mỹ", "Quân viễn chinh Mỹ và quân đồng minh giữ vai trò chủ lực + quân Sài Gòn", "Quân đội Sài Gòn là lực lượng xung kích + hỏa lực, không quân, hậu cần Mỹ"],
      ["Chiến thuật cơ bản", "\"Trực thăng vận\", \"Thiết xa vận\", dồn dân lập \"Ấp chiến lược\"", "\"Tìm và diệt\", \"Bình định\", lập các vùng trắng và căn cứ hỏa lực", "\"Dùng người Việt đánh người Việt\", mở rộng chiến tranh sang Campuchia, Lào"],
      ["Phạm vi chiến tranh", "Chủ yếu ở miền Nam Việt Nam", "Miền Nam và chiến tranh phá hoại miền Bắc lần thứ nhất (1965–1968)", "Miền Nam, chiến tranh phá hoại miền Bắc lần thứ hai (1972) và toàn Đông Dương"],
      ["Thắng lợi của ta đập tan", "Ấp Bắc (1963), Bình Giã, Ba Gia, Đồng Xoài (1964–1965)", "Núi Thành, Vạn Tường (1965); Tổng tiến công Tết Mậu Thân 1968", "Đường 9 – Nam Lào (1971), Xuân Hè 1972, \"Điện Biên Phủ trên không\" (12/1972)"],
      ["Hệ quả chính trị", "Mỹ phải phế truất Ngô Đình Diệm, chuyển sang Chiến tranh cục bộ", "Mỹ phải tuyên bố phi Mỹ hóa chiến tranh, ngồi vào bàn đàm phán Paris", "Mỹ phải ký Hiệp định Pari (27/1/1973), rút hết quân viễn chinh về nước"]
    ]
  },
  cuongLinh1991vs2011: {
    title: "5. So sánh Cương lĩnh 1991 (6 đặc trưng) và Cương lĩnh bổ sung 2011 (8 đặc trưng)",
    headers: ["Tiêu chí", "Cương lĩnh năm 1991 (Đại hội VII)", "Cương lĩnh bổ sung, phát triển 2011 (Đại hội XI)"],
    rows: [
      ["Số lượng đặc trưng", "6 đặc trưng của xã hội XHCN", "8 đặc trưng của xã hội XHCN (bổ sung và hoàn chỉnh)"],
      ["Mục tiêu tổng quát", "Do nhân dân lao động làm chủ; có một nền kinh tế phát triển cao...", "Dân giàu, nước mạnh, dân chủ, công bằng, văn minh (được đặt lên thành đặc trưng số 1)"],
      ["Vấn đề làm chủ", "Do nhân dân lao động làm chủ", "Do nhân dân làm chủ (mở rộng toàn thể nhân dân)"],
      ["Kinh tế", "Nền kinh tế phát triển cao dựa trên LLSX hiện đại và chế độ công hữu về các TLSX chủ yếu", "Kinh tế phát triển cao với LLSX hiện đại và QHSX tiến bộ phù hợp"],
      ["Văn hóa", "Nền văn hóa tiên tiến, đậm đà bản sắc dân tộc", "Nền văn hóa tiên tiến, đậm đà bản sắc dân tộc"],
      ["Con người", "Con người được giải phóng khỏi áp bức, bóc lột, làm theo năng lực, hưởng theo lao động", "Con người có cuộc sống ấm no, tự do, hạnh phúc, có điều kiện phát triển toàn diện"],
      ["Dân tộc", "Các dân tộc trong nước bình đẳng, đoàn kết và giúp đỡ lẫn nhau cùng tiến bộ", "Các dân tộc trong cộng đồng Việt Nam bình đẳng, đoàn kết, tôn trọng và giúp nhau cùng phát triển (bổ sung từ \"tôn trọng\")"],
      ["Nhà nước (Đặc trưng mới)", "Chưa thành đặc trưng độc lập trong 6 điểm", "Có Nhà nước pháp quyền xã hội chủ nghĩa của nhân dân, do nhân dân, vì nhân dân do Đảng Cộng sản lãnh đạo"],
      ["Hợp tác quốc tế", "Có quan hệ hữu nghị và hợp tác với nhân dân tất cả các nước trên thế giới", "Có quan hệ hữu nghị và hợp tác với các nước trên thế giới"]
    ]
  },
  boTuTruCot: {
    title: "6. \"Bộ tứ trụ cột\" Nghị quyết thời kỳ mới (2024–2025)",
    headers: ["Nghị quyết", "Ngày ban hành", "Nội dung trọng tâm", "Mục tiêu & Tầm nhìn"],
    rows: [
      ["NQ 57-NQ/TW", "22/12/2024", "Đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia", "Xác định KHCN, đổi mới sáng tạo và CĐS là động lực chính của mô hình tăng trưởng mới."],
      ["NQ 59-NQ/TW", "2025", "Định hướng chiến lược hội nhập quốc tế toàn diện, sâu rộng trong giai đoạn mới", "Chủ động hội nhập đa tầng, định vị Việt Nam là mắt xích quan trọng trong chuỗi giá trị toàn cầu."],
      ["NQ 66-NQ/TW", "2025", "Đổi mới mạnh mẽ công tác xây dựng và hoàn thiện thể chế, hệ thống pháp luật", "Xây dựng pháp luật kiến tạo phát triển, dỡ bỏ mọi rào cản hành chính cản trở nguồn lực."],
      ["NQ 68-NQ/TW", "4/5/2025", "Phát triển kinh tế tư nhân thực sự trở thành một động lực quan trọng nhất", "Năm 2030 đạt ít nhất 2 triệu doanh nghiệp hoạt động; năm 2045 đạt ít nhất 3 triệu doanh nghiệp."]
    ]
  }
};

// 6. Source Cross-Reference Matrix (Ma trận đối chiếu tài liệu học tập & đề thi)
const SOURCE_MATRIX = [
  { topic: "Nhập môn & Phương pháp luận", doc: "Giáo trình 2021 (tr. 7-16)", note: "Đối tượng: sự ra đời, phát triển và hoạt động lãnh đạo của Đảng. Chức năng hàng đầu: Nhận thức. Phương pháp chủ yếu: Lịch sử + Logic." },
  { topic: "Cương lĩnh 2/1930 vs Luận cương 10/1930", doc: "Giáo trình 2021 (tr. 40-54); Hồ Chí Minh toàn tập (Tập 3)", note: "Nguyễn Ái Quốc đặt giải phóng dân tộc lên hàng đầu, liên minh rộng rãi; Trần Phú đặt thổ địa và phản đế ngang nhau, nặng về đấu tranh giai cấp." },
  { topic: "Cao trào cách mạng 1930–1945", doc: "Giáo trình 2021 (tr. 55-98)", note: "30-31 bạo lực, 36-39 công khai nghị trường, 39-45 khởi nghĩa vũ trang giành chính quyền. TW 8 (5/1941) thành lập Mặt trận Việt Minh." },
  { topic: "30 năm chiến tranh giải phóng (1945–1975)", doc: "Chiến tranh cách mạng Việt Nam 1945–1975 (NXB CTQG 2008)", note: "Đường lối kháng chiến toàn dân, toàn diện, trường kỳ, tự lực cánh sinh. Điện Biên Phủ 1954; 3 chiến lược của Mỹ; Chiến dịch Hồ Chí Minh 1975." },
  { topic: "Hai nhiệm vụ chiến lược thời kỳ chống Mỹ", doc: "Văn kiện Đại hội III (1960)", note: "Miền Bắc tiến hành CM XHCN (vai trò quyết định nhất); Miền Nam đấu tranh giải phóng (vai trò quyết định trực tiếp)." },
  { topic: "Đột phá tiền Đổi mới (1979–1985)", doc: "Giáo trình 2021 (tr. 245-260)", note: "TW 6 khóa IV (8/1979) 'bung ra'; Chỉ thị 100 (1/1981) Khoán 100; QĐ 25/CP & 26/CP (1/1981); Hội nghị TW 8 khóa V (6/1985) giá - lương - tiền." },
  { topic: "Đổi mới toàn diện và hội nhập quốc tế", doc: "Văn kiện Đại hội VI (1986), VII (1991), IX (2001), X (2006), XI (2011)", note: "VI: Đổi mới; VII: Cương lĩnh 1991; IX: KTTT định hướng XHCN; X: Đảng viên làm KT tư nhân, WTO 2007; XI: Cương lĩnh 2011." },
  { topic: "Xây dựng Đảng & Chống suy thoái", doc: "Văn kiện Đại hội XII (2016), NQ TW 4 khóa XII (10/2016)", note: "27 biểu hiện suy thoái về tư tưởng chính trị, đạo đức, lối sống, 'tự diễn biến', 'tự chuyển hóa' trong nội bộ." },
  { topic: "Phòng, chống tham nhũng, tiêu cực", doc: "Tác phẩm của TBT Nguyễn Phú Trọng (2023); Tài liệu Bộ GD&ĐT (2014)", note: "Nguyên tắc 'không có vùng cấm, không có ngoại lệ'; mô hình '4 không' (không thể, không dám, không muốn, không cần); Ban Chỉ đạo TW thành lập 2013 do Tổng Bí thư đứng đầu." },
  { topic: "Bộ tứ trụ cột & Kỷ nguyên mới (2024–2026)", doc: "NQ 57, NQ 59, NQ 66, NQ 68; Văn kiện Đại hội XIII & XIV", note: "ĐH XIII xác định mốc 2025, 2030, 2045. ĐH XIV xác lập mô hình tăng trưởng dựa trên KHCN và CĐS, mục tiêu GDP tăng trưởng >= 10%/năm." }
];

// 7. Expanded Flashcards (55 flashcards)
const FLASHCARDS = [
  // Nhập môn
  { id: 1, category: "Nhập môn", front: "Đối tượng nghiên cứu của Lịch sử Đảng", back: "Sự ra đời, phát triển và hoạt động lãnh đạo của Đảng qua các thời kỳ lịch sử.", hint: "Nhập môn" },
  { id: 2, category: "Nhập môn", front: "Chức năng hàng đầu của khoa học Lịch sử Đảng", back: "Chức năng NHẬN THỨC (cung cấp tri thức khoa học, có hệ thống).", hint: "Nhập môn" },
  { id: 3, category: "Nhập môn", front: "Phương pháp cơ bản trong nghiên cứu Lịch sử Đảng", back: "Sự kết hợp chặt chẽ giữa PHƯƠNG PHÁP LỊCH SỬ và PHƯƠNG PHÁP LOGIC.", hint: "Nhập môn" },
  { id: 4, category: "Nhập môn", front: "Điều kiện tiên quyết dự thi VNR202 FPT", back: "Bắt buộc hoàn thành khóa học trực tuyến trên nền tảng Coursera và có chứng chỉ.", hint: "Quy chế thi" },

  // Mốc sự kiện
  { id: 5, category: "Mốc sự kiện", front: "5/6/1911", back: "Nguyễn Ái Quốc ra đi tìm đường cứu nước từ Bến Nhà Rồng trên tàu Amiral Latouche-Tréville.", hint: "Chương 1" },
  { id: 6, category: "Mốc sự kiện", front: "7/1920", back: "Nguyễn Ái Quốc đọc Sơ thảo Luận cương Lênin về vấn đề dân tộc và thuộc địa → Tìm ra con đường giải phóng dân tộc.", hint: "Chương 1" },
  { id: 7, category: "Mốc sự kiện", front: "12/1920", back: "Đại hội Tua: Bỏ phiếu tán thành Quốc tế Cộng sản, tham gia sáng lập Đảng Cộng sản Pháp.", hint: "Chương 1" },
  { id: 8, category: "Mốc sự kiện", front: "6/1925 & 8/1925", back: "6/1925: Thành lập Hội VN Cách mạng Thanh niên (Quảng Châu); 8/1925: Bãi công Ba Son do Tôn Đức Thắng lãnh đạo.", hint: "Chương 1" },
  { id: 9, category: "Mốc sự kiện", front: "3/2/1930", back: "Ngày thành lập Đảng Cộng sản Việt Nam (Hội nghị hợp nhất tại Cửu Long do NAQ chủ trì).", hint: "Chương 1" },
  { id: 10, category: "Mốc sự kiện", front: "10/1930", back: "Hội nghị Trung ương tại Hương Cảng: Đổi tên Đảng thành ĐCS Đông Dương; Luận cương chính trị; Trần Phú làm TBT đầu tiên.", hint: "Chương 1" },
  { id: 11, category: "Mốc sự kiện", front: "1/5/1930 & 9/1930", back: "1/5/1930: Khởi đầu cao trào; 9/1930: Đỉnh cao Xô Viết Nghệ Tĩnh ra đời chính quyền công nông sơ khai.", hint: "Chương 1" },
  { id: 12, category: "Mốc sự kiện", front: "5/1941 (Hội nghị TW 8)", back: "Pác Bó (Cao Bằng), NAQ chủ trì: Hoàn chỉnh chuyển hướng chiến lược, đặt giải phóng dân tộc lên hàng đầu, lập Mặt trận Việt Minh.", hint: "Chương 1" },
  { id: 13, category: "Mốc sự kiện", front: "22/12/1944", back: "Thành lập Đội Việt Nam Tuyên truyền Giải phóng quân tại Cao Bằng gồm 34 chiến sĩ (Võ Nguyên Giáp chỉ huy).", hint: "Chương 1" },
  { id: 14, category: "Mốc sự kiện", front: "12/3/1945", back: "Chỉ thị \"Nhật – Pháp bắn nhau và hành động của chúng ta\" xác định kẻ thù cụ thể trước mắt là phát xít Nhật.", hint: "Chương 1" },
  { id: 15, category: "Mốc sự kiện", front: "18/8/1945", back: "4 tỉnh giành chính quyền sớm nhất cả nước: Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam.", hint: "Chương 1" },
  { id: 16, category: "Mốc sự kiện", front: "19/8 & 2/9/1945", back: "19/8: Khởi nghĩa thắng lợi ở Hà Nội; 2/9: Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Ba Đình, khai sinh nước VNDCCH.", hint: "Chương 1" },
  { id: 17, category: "Mốc sự kiện", front: "6/1/1946", back: "Cuộc Tổng tuyển cử đầu tiên bầu Quốc hội khóa I của nước Việt Nam Dân chủ Cộng hòa.", hint: "Chương 2" },
  { id: 18, category: "Mốc sự kiện", front: "6/3/1946 & 14/9/1946", back: "6/3/1946: Hiệp định Sơ bộ (\"Hòa để tiến\", đuổi quân Tưởng); 14/9/1946: Tạm ước Việt – Pháp nhân nhượng văn hóa, kinh tế.", hint: "Chương 2" },
  { id: 19, category: "Mốc sự kiện", front: "12/12 & 19/12/1946", back: "12/12: Ban Thường vụ TW ra Chỉ thị \"Toàn dân kháng chiến\"; 19/12: Lời kêu gọi Toàn quốc kháng chiến của Bác Hồ.", hint: "Chương 2" },
  { id: 20, category: "Mốc sự kiện", front: "Thu Đông 1950", back: "Chiến dịch Biên giới: Chiến dịch tiến công lớn đầu tiên của chủ lực ta, khai thông biên giới Việt – Trung.", hint: "Chương 2" },
  { id: 21, category: "Mốc sự kiện", front: "7/5/1954 & 21/7/1954", back: "7/5/1954: Chiến thắng Điện Biên Phủ; 21/7/1954: Ký Hiệp định Giơnevơ, lấy vĩ tuyến 17 làm giới tuyến quân sự tạm thời.", hint: "Chương 2" },
  { id: 22, category: "Mốc sự kiện", front: "1/1959 & 17/1/1960", back: "1/1959: NQ 15 mở đường bạo lực cách mạng miền Nam; 17/1/1960: Đồng Khởi nổ ra ở Mỏ Cày (Bến Tre).", hint: "Chương 2" },
  { id: 23, category: "Mốc sự kiện", front: "20/12/1960", back: "Thành lập Mặt trận Dân tộc giải phóng miền Nam Việt Nam (MTDTGPMNVN) tại Tây Ninh.", hint: "Chương 2" },
  { id: 24, category: "Mốc sự kiện", front: "2/1/1963 & 18/8/1965", back: "2/1/1963: Chiến thắng Ấp Bắc (đánh bại CT đặc biệt); 18/8/1965: Chiến thắng Vạn Tường (đánh bại CT cục bộ).", hint: "Chương 2" },
  { id: 25, category: "Mốc sự kiện", front: "Tết Mậu Thân 1968", back: "Tổng tiến công và nổi dậy Mậu Thân buộc Mỹ tuyên bố \"phi Mỹ hóa\" chiến tranh và ngồi vào đàm phán Paris.", hint: "Chương 2" },
  { id: 26, category: "Mốc sự kiện", front: "18–29/12/1972", back: "Trận \"Điện Biên Phủ trên không\" 12 ngày đêm bắn rơi 81 máy bay Mỹ (34 B-52), buộc Mỹ ký Hiệp định Pari.", hint: "Chương 2" },
  { id: 27, category: "Mốc sự kiện", front: "27/1/1973", back: "Ký kết Hiệp định Pari về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam; quân viễn chinh Mỹ rút về nước.", hint: "Chương 2" },
  { id: 28, category: "Mốc sự kiện", front: "30/4/1975", back: "Chiến dịch Hồ Chí Minh toàn thắng lúc 11h30 ngày 30/4/1975, giải phóng hoàn toàn miền Nam, thống nhất Tổ quốc.", hint: "Chương 2" },
  { id: 29, category: "Mốc sự kiện", front: "25/4/1976 & 2/7/1976", back: "25/4/1976: Tổng tuyển cử bầu Quốc hội chung khóa VI; 2/7/1976: Đặt tên nước là Cộng hòa xã hội chủ nghĩa Việt Nam.", hint: "Chương 3" },
  { id: 30, category: "Mốc sự kiện", front: "17/2/1979", back: "Quân dân ta anh dũng chiến đấu bảo vệ biên giới phía Bắc trước sự tấn công xâm lược của Trung Quốc.", hint: "Chương 3" },
  { id: 31, category: "Mốc sự kiện", front: "1/1981 (Khoán 100)", back: "Chỉ thị 100-CT/TW: Khoán sản phẩm đến nhóm và người lao động trong HTX nông nghiệp.", hint: "Chương 3" },
  { id: 32, category: "Mốc sự kiện", front: "5/4/1988 (Khoán 10)", back: "NQ 10 của Bộ Chính trị: Thừa nhận hộ gia đình là đơn vị kinh tế tự chủ, đưa VN trở thành nước xuất khẩu gạo.", hint: "Chương 3" },
  { id: 33, category: "Mốc sự kiện", front: "28/7/1995 & 12/7/1995", back: "28/7/1995: Gia nhập ASEAN; 12/7/1995: Bình thường hóa quan hệ ngoại giao đầy đủ với Hoa Kỳ.", hint: "Chương 3" },
  { id: 34, category: "Mốc sự kiện", front: "11/1/2007", back: "Việt Nam chính thức trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO).", hint: "Chương 3" },

  // Đại hội Đảng
  { id: 35, category: "Đại hội Đảng", front: "Đại hội I (3/1935, Ma Cao)", back: "Phục hồi hệ thống tổ chức Đảng sau thoái trào; Lê Hồng Phong được bầu làm Tổng Bí thư.", hint: "Đại hội Đảng" },
  { id: 36, category: "Đại hội Đảng", front: "Đại hội II (2/1951, Tuyên Quang)", back: "\"Đại hội kháng chiến thắng lợi\", Đảng ra hoạt động công khai lấy tên Đảng Lao động Việt Nam, Trường Chinh làm TBT.", hint: "Đại hội Đảng" },
  { id: 37, category: "Đại hội Đảng", front: "Đại hội III (9/1960, Hà Nội)", back: "Hoàn chỉnh 2 nhiệm vụ chiến lược: Miền Bắc xây dựng CNXH (quyết định nhất), Miền Nam giải phóng (quyết định trực tiếp).", hint: "Đại hội Đảng" },
  { id: 38, category: "Đại hội Đảng", front: "Đại hội IV (12/1976, Hà Nội)", back: "Đổi tên Đảng thành Đảng Cộng sản Việt Nam; Kế hoạch 5 năm 1976–1980.", hint: "Đại hội Đảng" },
  { id: 39, category: "Đại hội Đảng", front: "Đại hội V (3/1982, Hà Nội)", back: "Coi nông nghiệp là mặt trận hàng đầu; 2 nhiệm vụ chiến lược: Xây dựng CNXH và bảo vệ Tổ quốc.", hint: "Đại hội Đảng" },
  { id: 40, category: "Đại hội Đảng", front: "Đại hội VI (12/1986, Hà Nội)", back: "ĐẠI HỘI ĐỔI MỚI TOÀN DIỆN; xóa bỏ bao cấp, chuyển sang kinh tế hàng hóa nhiều thành phần; TBT Nguyễn Văn Linh.", hint: "Đại hội Đảng" },
  { id: 41, category: "Đại hội Đảng", front: "Đại hội VII (6/1991, Hà Nội)", back: "Thông qua Cương lĩnh 1991 (6 đặc trưng); khẳng định CN Mác-Lênin và tư tưởng HCM là kim chỉ nam.", hint: "Đại hội Đảng" },
  { id: 42, category: "Đại hội Đảng", front: "Đại hội VIII (6/1996, Hà Nội)", back: "Đất nước ra khỏi khủng hoảng kinh tế – xã hội; đẩy mạnh CNH, HĐH; tăng trưởng gắn với công bằng xã hội.", hint: "Đại hội Đảng" },
  { id: 43, category: "Đại hội Đảng", front: "Đại hội IX (4/2001, Hà Nội)", back: "Chính thức nêu mô hình \"Kinh tế thị trường định hướng XHCN\" là mô hình kinh tế tổng quát trong thời kỳ quá độ.", hint: "Đại hội Đảng" },
  { id: 44, category: "Đại hội Đảng", front: "Đại hội X (4/2006, Hà Nội)", back: "Cho phép đảng viên làm kinh tế tư nhân; xác định xây dựng chỉnh đốn Đảng là nhiệm vụ then chốt.", hint: "Đại hội Đảng" },
  { id: 45, category: "Đại hội Đảng", front: "Đại hội XI (1/2011, Hà Nội)", back: "Cương lĩnh bổ sung 2011 (8 đặc trưng của xã hội XHCN); 3 đột phá chiến lược (thể chế, nhân lực, hạ tầng).", hint: "Đại hội Đảng" },
  { id: 46, category: "Đại hội Đảng", front: "Đại hội XII (1/2016, Hà Nội)", back: "NQ TW 4 khóa XII (10/2016) ngăn chặn đẩy lùi 27 biểu hiện suy thoái, \"tự diễn biến\", \"tự chuyển hóa\".", hint: "Đại hội Đảng" },
  { id: 47, category: "Đại hội Đảng", front: "Đại hội XIII (1/2021, Hà Nội)", back: "3 mốc mục tiêu: 2025 (vượt TN trung bình thấp), 2030 (công nghiệp hiện đại, TN trung bình cao), 2045 (nước phát triển, thu nhập cao).", hint: "Đại hội Đảng" },
  { id: 48, category: "Đại hội Đảng", front: "Đại hội XIV (1/2026, Hà Nội)", back: "TBT Tô Lâm tái cử; mục tiêu tăng trưởng GDP >= 10%/năm; KHCN & CĐS là động lực chính; Kỷ nguyên mới.", hint: "Đại hội Đảng" },

  // Nghị quyết & Mẹo thi
  { id: 49, category: "Nghị quyết then chốt", front: "Nghị quyết 57-NQ/TW (22/12/2024)", back: "Đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia.", hint: "Bộ tứ trụ cột" },
  { id: 50, category: "Nghị quyết then chốt", front: "Nghị quyết 68-NQ/TW (4/5/2025)", back: "Phát triển kinh tế tư nhân là một động lực quan trọng nhất (2 triệu DN năm 2030, 3 triệu DN năm 2045).", hint: "Bộ tứ trụ cột" },
  { id: 51, category: "Nghị quyết then chốt", front: "Nghị quyết TW 4 khóa XII (2016)", back: "Nhận diện 27 biểu hiện suy thoái (9 tư tưởng chính trị, 9 đạo đức lối sống, 9 tự diễn biến tự chuyển hóa).", hint: "Xây dựng Đảng" },
  { id: 52, category: "Mẹo nhớ cốt lõi", front: "Thần chú Đại hội IV – V – VI – IX – X", back: "IV: Đổi tên Đảng | V: Nông nghiệp hàng đầu | VI: Đổi mới | IX: KTTT định hướng XHCN | X: Đảng viên làm KT tư nhân.", hint: "Mẹo thi" },
  { id: 53, category: "Mẹo nhớ cốt lõi", front: "Mô hình \"4 không\" trong PCTN", back: "Không thể, Không dám, Không muốn, Không cần tham nhũng (TBT Nguyễn Phú Trọng).", hint: "PCTN" },
  { id: 54, category: "Mẹo nhớ cốt lõi", front: "Chuỗi văn bản Học Bác", back: "Chỉ thị 06 (khóa X, 2006) → Chỉ thị 03 (khóa XI, 2011) → Chỉ thị 05 (khóa XII, 2016) → Kết luận 01 (khóa XIII, 2021).", hint: "Mẹo thi" },
  { id: 55, category: "Mẹo nhớ cốt lõi", front: "Trưởng Ban Chỉ đạo TW về PCTN", back: "Từ 2013: Trực thuộc Bộ Chính trị, do TỔNG BÍ THƯ làm Trưởng ban (trước năm 2013 thuộc Chính phủ do Thủ tướng đứng đầu).", hint: "Mẹo thi" },
  // 12 Flashcards Phản xạ cốt lõi (Phụ lục C.3)
  { id: 56, category: "Phản xạ cốt lõi", front: "Hội nghị nào do Nguyễn Ái Quốc chủ trì năm 1941, quyết định thành lập Mặt trận Việt Minh?", back: "Hội nghị Ban Chấp hành Trung ương Đảng lần thứ 8 (họp từ 10 đến 19/5/1941 tại Pác Bó, Cao Bằng).", hint: "Chương 1 • 5/1941" },
  { id: 57, category: "Phản xạ cốt lõi", front: "Hội nghị Ban Chấp hành Trung ương lần thứ 6 (11/1939) họp ở đâu, do ai chủ trì?", back: "Họp tại Bà Điểm, Hóc Môn (Gia Định), do Tổng Bí thư Nguyễn Văn Cừ chủ trì (mở đầu chuyển hướng chiến lược).", hint: "Chương 1 • 11/1939" },
  { id: 58, category: "Phản xạ cốt lõi", front: "Luật 10/59 do chính quyền Ngô Đình Diệm ban hành vào ngày tháng năm nào?", back: "Ngày 06/05/1959. Nội dung: Đặt cộng sản ra ngoài vòng pháp luật, lê máy chém lưu động tàn sát nhân dân miền Nam.", hint: "Chương 2 • 6/5/1959" },
  { id: 59, category: "Phản xạ cốt lõi", front: "Phong trào Đồng Khởi năm 1960 nổ ra đầu tiên ở huyện nào của tỉnh Bến Tre?", back: "Huyện Mỏ Cày (ngày 17/01/1960 tại xã Định Thủy), do đồng chí Nguyễn Thị Định và Tỉnh ủy Bến Tre chỉ đạo.", hint: "Chương 2 • 17/1/1960" },
  { id: 60, category: "Phản xạ cốt lõi", front: "Đại hội lần thứ I Mặt trận Dân tộc giải phóng miền Nam Việt Nam (2/1962) bầu ai làm Chủ tịch?", back: "Luật sư Nguyễn Hữu Thọ (Đại hội họp tại Kà Tum, Tây Ninh).", hint: "Chương 2 • 2/1962" },
  { id: 61, category: "Phản xạ cốt lõi", front: "Hội nghị Trung ương 6 khóa II (tháng 7/1954) xác định kẻ thù chính, nguy hiểm trước mắt là ai?", back: "Đế quốc Mỹ (chuẩn bị thay chân thực dân Pháp xâm lược miền Nam Việt Nam).", hint: "Chương 2 • Sau Điện Biên Phủ" },
  { id: 62, category: "Phản xạ cốt lõi", front: "Nghị quyết nào của Bộ Chính trị đặt KH, CN, đổi mới sáng tạo và chuyển đổi số là đột phá quan trọng hàng đầu?", back: "Nghị quyết số 57-NQ/TW (ban hành ngày 22/12/2024).", hint: "Chương mở rộng • 22/12/2024" },
  { id: 63, category: "Phản xạ cốt lõi", front: "Nghị quyết số 68-NQ/TW (04/05/2025) xác định vị thế của kinh tế tư nhân như thế nào?", back: "Là 'một động lực quan trọng nhất của nền kinh tế quốc gia' (phát triển từ 'động lực quan trọng' trước đây).", hint: "Chương mở rộng • 4/5/2025" },
  { id: 64, category: "Phản xạ cốt lõi", front: "Mục tiêu phát triển năm 2030 và 2045 do Đại hội XIII của Đảng đề ra là gì?", back: "• Năm 2030 (100 năm lập Đảng): Nước đang phát triển, có công nghiệp hiện đại, thu nhập trung bình cao.\n• Năm 2045 (100 năm lập nước): Nước phát triển, thu nhập cao.", hint: "Chương 3 & Mở rộng • Đại hội XIII" },
  { id: 65, category: "Phản xạ cốt lõi", front: "Ba đột phá chiến lược được khẳng định xuyên suốt từ Đại hội XI, XII đến Đại hội XIII là gì?", back: "1. Hoàn thiện thể chế kinh tế thị trường định hướng XHCN.\n2. Phát triển nguồn nhân lực, nhất là nhân lực chất lượng cao.\n3. Xây dựng kết cấu hạ tầng đồng bộ, hiện đại.", hint: "Chương 3 & Mở rộng • 3 Đột phá" },
  { id: 66, category: "Phản xạ cốt lõi", front: "Đại hội XIV của Đảng họp ở đâu, vào thời gian nào và ai được bầu làm Tổng Bí thư?", back: "Họp tại Thủ đô Hà Nội, từ ngày 19 đến 23/01/2026. Đồng chí Tô Lâm được bầu làm Tổng Bí thư Ban Chấp hành Trung ương Đảng.", hint: "Chương mở rộng • 1/2026" },
  { id: 67, category: "Phản xạ cốt lõi", front: "Dãy số hiệu các Chỉ thị của Bộ Chính trị về Học tập và làm theo tấm gương Bác qua các thời kỳ?", back: "Chỉ thị 06-CT/TW (2006) → Chỉ thị 03-CT/TW (2011) → Chỉ thị 05-CT/TW (2016) → Chỉ thị 07-CT/TW (giai đoạn mới).", hint: "Chương 3 • 4 thế hệ Chỉ thị" }
];

// 8. Pitfalls & Strategy
const PITFALLS = [
  {
    code: "C1-10",
    title: "Nội dung nào KHÔNG thuộc Luận cương chính trị tháng 10/1930?",
    issue: "Đề thi chọn đáp án D là nội dung không thuộc Luận cương. Tuy nhiên, trong văn bản Luận cương của Trần Phú thực tế có cụm từ liên minh công nông và kéo các tầng lớp về phe vô sản.",
    solution: "Khi làm bài thi trắc nghiệm, nếu gặp lại nguyên văn câu C1-10 thì CHỌN D. Lý do: Người ra đề coi việc liên minh với tiểu tư sản, trí thức, trung nông là luận điểm đặc trưng của Cương lĩnh chính trị đầu tiên của Nguyễn Ái Quốc (2/1930) chứ không phải điểm nhấn của Luận cương 10/1930 (vốn bị phê phán vì cô lập giai cấp).",
    chapter: "Chương 1"
  },
  {
    code: "C1-20",
    title: "Luận điểm: \"Trong lúc này nếu không giải quyết được vấn đề dân tộc giải phóng...\"",
    issue: "Đề gốc trong ngân hàng đề thi bị khuyết mất nội dung phương án B.",
    solution: "Đáp án chuẩn xác 100% là C: Hội nghị Ban Chấp hành Trung ương tháng 5/1941 (Hội nghị TW 8 họp tại Pác Bó do Nguyễn Ái Quốc chủ trì). Đây là trích đoạn bất hủ trong Nghị quyết Hội nghị TW 8 hoàn chỉnh chuyển hướng chỉ đạo chiến lược cách mạng.",
    chapter: "Chương 1"
  },
  {
    code: "C2-21",
    title: "Hai nhiệm vụ chiến lược tại Đại hội III (1960)",
    issue: "Trong ngân hàng câu hỏi gốc, câu này bị mất các phương án A, B, C, D mà chỉ in sẵn đáp án học thuộc.",
    solution: "Cần nhớ nằm lòng hai nhiệm vụ: (1) Tiến hành cách mạng XHCN ở miền Bắc; (2) Giải phóng miền Nam khỏi ách thống trị của đế quốc Mỹ và tay sai, thống nhất đất nước. Miền Bắc quyết định nhất, Miền Nam quyết định trực tiếp.",
    chapter: "Chương 2"
  },
  {
    code: "C2-23",
    title: "Mỹ – Ngụy không thực thi Hiệp định Giơnevơ bằng cách nào?",
    issue: "Các phương án gồm A (ngăn cản hiệp thương, tổng tuyển cử), B (Luật 10/59), C (Ấp chiến lược), D (Tất cả đều đúng). Trong thực tế lịch sử cả 3 hành động đều phá hoại Hiệp định Giơnevơ, nhưng đáp án đề thi lại là A.",
    solution: "Khi thi: Chọn A. Vì xét về điều khoản pháp lý trực tiếp của Hiệp định Giơnevơ quy định tổng tuyển cử tự do sau 2 năm (7/1956) để thống nhất đất nước, nên hành vi vi phạm trắng trợn trực diện nhất là 'ngăn cản hiệp thương, tổng tuyển cử'.",
    chapter: "Chương 2"
  },
  {
    code: "C2-27",
    title: "Ý nghĩa quan trọng nhất của phong trào Đồng Khởi 1960",
    issue: "Đề gốc ghi đáp án là B (Lật đổ chính quyền Mỹ – Diệm), nhưng kiến thức chuẩn giáo trình bắt buộc là A (Chuyển cách mạng miền Nam từ thế giữ gìn lực lượng sang thế tiến công).",
    solution: "Năm 1960 chính quyền Diệm chưa hề bị lật đổ (mãi tới đảo chính 11/1963 Diệm mới bị giết). Do đó ý nghĩa lịch sử chân chính của Đồng Khởi là: Giáng đòn nặng nề làm phá sản chiến lược Chiến tranh đơn phương của Mỹ, đưa cách mạng miền Nam từ 'thế giữ gìn lực lượng sang thế tiến công'. Chú ý xem giảng viên hướng dẫn chọn A hay B để lấy điểm tối đa.",
    chapter: "Chương 2"
  },
  {
    code: "C2-35",
    title: "Bài học kinh nghiệm nào KHÔNG phù hợp với cuộc kháng chiến chống Mỹ?",
    issue: "Đề thi chọn đáp án B ('Kiên định tư tưởng chiến lược tiến công quyết đánh và quyết thắng đế quốc Mỹ'), nhưng thực tế trong tài liệu tổng kết chiến tranh cách mạng 1945–1975, tư tưởng chiến lược tiến công là một bài học hoàn toàn đúng của Đảng.",
    solution: "Khi làm bài thi trắc nghiệm: HÃY CHỌN B theo ngân hàng đề (do lỗi câu chữ biên tập trong đề thi gốc). Khi làm bài tự luận hoặc phỏng vấn, bạn vẫn phải khẳng định tư tưởng chiến lược tiến công là bài học đúng của Đảng.",
    chapter: "Chương 2"
  },
  {
    code: "C3-23",
    title: "Điểm bổ sung đặc trưng XHCN trong Cương lĩnh 2011",
    issue: "Đề gốc chỉ có 2 phương án A và B.",
    solution: "Đáp án đúng là B: 'Các dân tộc trong cộng đồng Việt Nam bình đẳng, đoàn kết, tôn trọng và giúp nhau cùng phát triển'. Điểm mới so với Cương lĩnh 1991 là bổ sung chữ 'tôn trọng'.",
    chapter: "Chương 3"
  },
  {
    code: "C3-32",
    title: "Chỉ thị về Cuộc vận động Học tập và làm theo tấm gương đạo đức Hồ Chí Minh",
    issue: "Đề ghi 'Chỉ thị số 3 - NQ/TW tháng 11/2006'.",
    solution: "Tháng 11/2006, Bộ Chính trị khóa X thực tế ban hành Chỉ thị 06-CT/TW (ngày 7/11/2006). Số '3' trong đề thi là sự nhầm lẫn với Chỉ thị 03-CT/TW ban hành năm 2011 của khóa XI. Dù đề ghi sai số hiệu, nội dung đúng vẫn là: Học tập và làm theo tấm gương đạo đức Hồ Chí Minh.",
    chapter: "Chương 3"
  },
  {
    code: "C2-28",
    title: "Hình thức khởi nghĩa chống Mỹ – Diệm diễn ra đầu tiên ở đâu?",
    issue: "Đáp án trong ngân hàng câu hỏi thi của trường chọn: B. Bình Định. Tuy nhiên, sách giáo khoa và tài liệu nghiên cứu lịch sử Đảng ghi nhận các cuộc khởi nghĩa vũ trang tiêu biểu nổ ra trước Đồng Khởi Bến Tre là Khởi nghĩa Bác Ái (Ninh Thuận, 2/1959) và Khởi nghĩa Trà Bồng (Quảng Ngãi, 8/1959).",
    solution: "Khi thi trắc nghiệm: Nếu gặp lại câu hỏi C2-28 với 4 phương án (A. Bến Tre | B. Bình Định | C. Quảng Ngãi | D. Tây Ninh), HÃY CHỌN B. BÌNH ĐỊNH theo barem chấm của ngân hàng câu hỏi để đảm bảo an toàn tuyệt đối.",
    chapter: "Chương 2"
  },
  {
    code: "C2-3",
    title: "Sau khi giành chính quyền (sau CMT8 1945), Đảng chủ trương mở rộng mặt trận nào?",
    issue: "Đề thi chọn đáp án A: Mặt trận Việt Minh. Nhiều sinh viên phân vân với Mặt trận Liên Việt vì biết sau 1945 có Hội Liên hiệp Quốc dân Việt Nam (Liên Việt).",
    solution: "Khi làm bài thi trắc nghiệm: CHỌN A (Mặt trận Việt Minh) theo đáp án đề. Lưu ý rằng Mặt trận Liên hiệp Quốc dân Việt Nam chỉ chính thức hợp nhất với Việt Minh thành Mặt trận Liên Việt vào tháng 3/1951 (thời kỳ Đại hội II).",
    chapter: "Chương 2"
  },
  {
    code: "C2-24 / C2-25",
    title: "Hội nghị TW 15 (1/1959) – Phân biệt 2 dạng câu hỏi về thay đổi chiến lược và bạo lực cách mạng",
    issue: "Ngân hàng đề có 2 câu hỏi tiếp cận Hội nghị TW 15: Câu C2-24 hỏi về 'thay đổi chiến lược ở điểm nào?' và câu C2-25 hỏi 'Hội nghị nào quyết định dùng bạo lực cách mạng đánh đổ Mỹ – Diệm?'.",
    solution: "Cả 2 câu hỏi đều gắn chặt với mốc Hội nghị TW 15 (1/1959): (1) Về chiến lược: Kết hợp đấu tranh chính trị với quân sự, tiến tới khởi nghĩa vũ trang; (2) Về phương pháp: Quyết định để nhân dân miền Nam sử dụng bạo lực cách mạng đánh đổ chính quyền Mỹ – Diệm.",
    chapter: "Chương 2"
  }
];

// 9. Reference Materials
const MATERIALS = [
  { id: 1, title: "Chiến tranh cách mạng Việt Nam 1945–1975, thắng lợi và bài học", author: "Ban chỉ đạo tổng kết chiến tranh trực thuộc Bộ Chính trị", publisher: "NXB Chính trị quốc gia", year: 2008, note: "Sách tham khảo sâu về 30 năm chiến tranh giải phóng" },
  { id: 2, title: "Giáo trình Lịch sử Đảng Cộng sản Việt Nam (khối chuyên Mác - Lênin)", author: "Bộ Giáo dục và Đào tạo", publisher: "NXB Chính trị quốc gia Sự thật", year: 2021, note: "Dành cho sinh viên chuyên ngành" },
  { id: 3, title: "Giáo trình Lịch sử Đảng Cộng sản Việt Nam (khối không chuyên)", author: "Bộ Giáo dục và Đào tạo", publisher: "NXB Chính trị quốc gia Sự thật", year: 2021, note: "GIÁO TRÌNH CHÍNH của môn học VNR202 tại trường" },
  { id: 4, title: "Hồ Chí Minh toàn tập, tập 1 đến tập 15", author: "Hồ Chí Minh", publisher: "NXB Chính trị quốc gia", year: 2011, link: "https://hochiminh.vn/tac-pham-cua-ho-chi-minh/ho-chi-minh-toan-tap?categoryId=102001160", note: "Tra cứu các văn kiện, thư, lời kêu gọi của Bác" },
  { id: 5, title: "Kiên quyết, kiên trì đấu tranh phòng, chống tham nhũng, tiêu cực...", author: "Tổng Bí thư Nguyễn Phú Trọng", publisher: "NXB Chính trị quốc gia Sự thật", year: 2023, link: "https://tulieuvankien.dangcongsan.vn", note: "Cuốn sách cẩm nang hơn 600 trang về công tác PCTN" },
  { id: 6, title: "Nghị quyết số 57-NQ/TW về phát triển KH, CN, Đổi mới sáng tạo và CĐS quốc gia", author: "Bộ Chính trị", publisher: "BCH Trung ương Đảng", year: 2024, link: "https://tulieuvankien.dangcongsan.vn/Uploads/2025/1/7/2/NQ-57-TW-BCT.pdf", note: "Trụ cột KHCN & Chuyển đổi số" },
  { id: 7, title: "Nghị quyết số 68-NQ/TW về phát triển kinh tế tư nhân", author: "Bộ Chính trị", publisher: "BCH Trung ương Đảng", year: 2025, link: "https://tulieuvankien.dangcongsan.vn/Uploads/2025/5/7/5/NQ-68-TW.pdf", note: "Trụ cột phát triển kinh tế tư nhân" },
  { id: 8, title: "Tài liệu giảng dạy về phòng, chống tham nhũng (QĐ 3468/QĐ-BGDĐT)", author: "Bộ Giáo dục và Đào tạo", publisher: "Bộ GD&ĐT", year: 2014, note: "Tài liệu giảng dạy PCTN bậc đại học" },
  { id: 9, title: "Văn kiện Đại hội đại biểu toàn quốc lần thứ XII", author: "Đảng Cộng sản Việt Nam", publisher: "NXB Chính trị quốc gia", year: 2016, note: "Đại hội XII: Xây dựng chỉnh đốn Đảng, NQ TW 4" },
  { id: 10, title: "Văn kiện Đại hội đại biểu toàn quốc lần thứ XIII", author: "Đảng Cộng sản Việt Nam", publisher: "NXB Chính trị quốc gia", year: 2021, note: "Đại hội XIII: Tầm nhìn 2025, 2030, 2045" },
  { id: 11, title: "Văn kiện Đại hội đại biểu toàn quốc lần thứ XIV", author: "Đảng Cộng sản Việt Nam", publisher: "NXB Chính trị quốc gia", year: 2026, note: "Đại hội XIV: Kỷ nguyên vươn mình của dân tộc" },
  { id: 12, title: "Khóa học ôn tập trực tuyến môn Lịch sử ĐCSVN trên nền tảng Coursera", author: "FPT University / Coursera", publisher: "Coursera", year: 2026, note: "ĐIỀU KIỆN TIÊN QUYẾT: Sinh viên bắt buộc hoàn thành khóa học & có chứng chỉ để đủ điều kiện dự thi cuối kỳ." }
];

// 10. 50 Core Milestones (Phụ lục C.2)
const CORE_50_MILESTONES = [
  { id: 1, year: "1911", title: "Ra đi tìm đường cứu nước", desc: "Nguyễn Tất Thành rời Bến Nhà Rồng trên tàu Amiral Latouche-Tréville.", era: "1858-1930" },
  { id: 2, year: "1920", title: "Tìm thấy con đường cứu nước", desc: "Đọc Sơ thảo Luận cương Lênin (7/1920) và tham gia sáng lập ĐCS Pháp tại ĐH Tours (12/1920).", era: "1858-1930" },
  { id: 3, year: "1925", title: "Hội VN Cách mạng Thanh niên", desc: "Nguyễn Ái Quốc thành lập Hội tại Quảng Châu; xuất bản tuần báo Thanh Niên.", era: "1858-1930" },
  { id: 4, year: "1927", title: "Xuất bản Đường Kách mệnh", desc: "Tác phẩm lý luận cách mạng giải phóng dân tộc kim chỉ nam của Nguyễn Ái Quốc.", era: "1858-1930" },
  { id: 5, year: "1929", title: "Ba tổ chức cộng sản ra đời", desc: "Đông Dương CS Đảng (6/1929), An Nam CS Đảng (8/1929), Đông Dương CS Liên đoàn (9/1929).", era: "1858-1930" },
  { id: 6, year: "03/02/1930", title: "Thành lập Đảng Cộng sản Việt Nam", desc: "Hội nghị hợp nhất (6/1–7/2/1930) do Nguyễn Ái Quốc chủ trì tại Cửu Long, Hương Cảng.", era: "1930-1945", highlight: true },
  { id: 7, year: "10/1930", title: "Luận cương chính trị tháng 10", desc: "Hội nghị TW 1 đổi tên thành ĐCS Đông Dương; Trần Phú làm Tổng Bí thư đầu tiên.", era: "1930-1945" },
  { id: 8, year: "1930–1931", title: "Phong trào Xô Viết Nghệ Tĩnh", desc: "Đỉnh cao phong trào cách mạng 1930–1931; cuộc tập dượt đầu tiên cho Cách mạng Tháng Tám.", era: "1930-1945" },
  { id: 9, year: "06/1932", title: "Chương trình hành động của Đảng", desc: "Đảng CS Đông Dương đề ra yêu cầu tự do ngôn luận, hội họp, bãi công, cải thiện đời sống.", era: "1930-1945" },
  { id: 10, year: "03/1935", title: "Đại hội đại biểu lần thứ I", desc: "Họp tại Ma Cao (Trung Quốc); bầu Lê Hồng Phong làm Tổng Bí thư; phục hồi tổ chức.", era: "1930-1945" },
  { id: 11, year: "1936–1939", title: "Mặt trận Dân chủ Đông Dương", desc: "Cuộc tập dượt thứ hai; kết hợp đấu tranh công khai, hợp pháp, nghị trường, báo chí.", era: "1930-1945" },
  { id: 12, year: "01/09/1939", title: "Chiến tranh thế giới II bùng nổ", desc: "Bối cảnh quốc tế thay đổi sâu sắc, Đảng rút vào hoạt động bí mật, chuẩn bị vũ trang.", era: "1930-1945" },
  { id: 13, year: "11/1939", title: "Hội nghị Ban Chấp hành TW 6", desc: "Họp tại Bà Điểm (Hóc Môn), mở đầu chuyển hướng chiến lược: giải phóng dân tộc lên hàng đầu.", era: "1930-1945" },
  { id: 14, year: "11/1940", title: "Hội nghị Ban Chấp hành TW 7", desc: "Họp tại Đình Bảng (Bắc Ninh), hoãn khởi nghĩa Nam Kỳ, duy trì du kích Bắc Sơn.", era: "1930-1945" },
  { id: 15, year: "05/1941", title: "Hội nghị Ban Chấp hành TW 8", desc: "Họp tại Pác Bó (Cao Bằng) do Nguyễn Ái Quốc chủ trì; hoàn chỉnh chuyển hướng; lập Việt Minh.", era: "1930-1945", highlight: true },
  { id: 16, year: "1943", title: "Đề cương về văn hóa Việt Nam", desc: "Văn kiện xác lập 3 nguyên tắc vận động văn hóa: Dân tộc hóa, Đại chúng hóa, Khoa học hóa.", era: "1930-1945" },
  { id: 17, year: "22/12/1944", title: "Việt Nam Tuyên truyền Giải phóng quân", desc: "Thành lập tại Cao Bằng do Võ Nguyên Giáp chỉ huy; tiền thân của Quân đội nhân dân Việt Nam.", era: "1930-1945" },
  { id: 18, year: "09/03/1945", title: "Nhật đảo chính Pháp", desc: "Ban Thường vụ TW ra Chỉ thị 'Nhật - Pháp bắn nhau và hành động của chúng ta' (12/3/1945).", era: "1930-1945" },
  { id: 19, year: "16–17/08/1945", title: "Quốc dân Đại hội Tân Trào", desc: "Thông qua 10 chính sách lớn của Việt Minh, bầu Ủy ban Dân tộc Giải phóng do Hồ Chí Minh làm Chủ tịch.", era: "1930-1945" },
  { id: 20, year: "19–25/08/1945", title: "Tổng khởi nghĩa tháng Tám", desc: "Giành chính quyền thắng lợi ở Hà Nội (19/8), Huế (23/8), Sài Gòn (25/8).", era: "1930-1945" },
  { id: 21, year: "02/09/1945", title: "Tuyên ngôn Độc lập", desc: "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn tại Quảng trường Ba Đình, khai sinh nước VNDCCH.", era: "1945-1954", highlight: true },
  { id: 22, year: "25/11/1945", title: "Chỉ thị Kháng chiến kiến quốc", desc: "Xác định kẻ thù chính là thực dân Pháp; khẩu hiệu 'Dân tộc trên hết, Tổ quốc trên hết'.", era: "1945-1954" },
  { id: 23, year: "06/01/1946", title: "Tổng tuyển cử toàn quốc", desc: "Bầu Quốc hội đầu tiên của nước Việt Nam Dân chủ Cộng hòa theo nguyên tắc phổ thông đầu phiếu.", era: "1945-1954" },
  { id: 24, year: "06/03/1946", title: "Hiệp định Sơ bộ Việt – Pháp", desc: "Chủ trương 'Hòa để tiến'; Pháp công nhận VN là quốc gia tự do trong khối Liên hiệp Pháp.", era: "1945-1954" },
  { id: 25, year: "19/12/1946", title: "Toàn quốc kháng chiến bùng nổ", desc: "Chủ tịch Hồ Chí Minh ra Lời kêu gọi Toàn quốc kháng chiến: 'Chúng ta thà hy sinh tất cả...'", era: "1945-1954", highlight: true },
  { id: 26, year: "Thu – Đông 1947", title: "Chiến dịch Việt Bắc Thu – Đông", desc: "Đánh bại cuộc hành quân của Pháp lên Việt Bắc, bảo vệ vững chắc cơ quan đầu não kháng chiến.", era: "1945-1954" },
  { id: 27, year: "Thu – Đông 1950", title: "Chiến dịch Biên giới Thu – Đông", desc: "Khai thông biên giới Việt – Trung, giành quyền chủ động chiến lược trên chiến trường chính Bắc Bộ.", era: "1945-1954" },
  { id: 28, year: "02/1951", title: "Đại hội đại biểu lần thứ II", desc: "Họp tại Tuyên Quang; Đảng ra công khai (Đảng Lao động VN); 'Đại hội kháng chiến thắng lợi'.", era: "1945-1954" },
  { id: 29, year: "07/05/1954", title: "Chiến thắng Điện Biên Phủ", desc: "Đỉnh cao kháng chiến chống Pháp; đánh bại kế hoạch Nava, 'lừng lẫy năm châu, chấn động địa cầu'.", era: "1945-1954", highlight: true },
  { id: 30, year: "21/07/1954", title: "Ký kết Hiệp định Giơnevơ", desc: "Công nhận độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ; vĩ tuyến 17 làm giới tuyến quân sự tạm thời.", era: "1945-1954" },
  { id: 31, year: "01/1959", title: "Nghị quyết Trung ương 15", desc: "Mở đường sử dụng bạo lực cách mạng, kết hợp đấu tranh chính trị với đấu tranh vũ trang ở miền Nam.", era: "1954-1975", highlight: true },
  { id: 32, year: "06/05/1959", title: "Mỹ – Diệm ban hành Luật 10/59", desc: "Đặt cộng sản ra ngoài vòng pháp luật, lê máy chém khắp miền Nam, kích hoạt phong trào quật khởi.", era: "1954-1975" },
  { id: 33, year: "17/01/1960", title: "Phong trào Đồng Khởi bùng nổ", desc: "Khởi đầu tại Mỏ Cày (Bến Tre); chuyển cách mạng miền Nam từ thế giữ gìn lực lượng sang thế tiến công.", era: "1954-1975", highlight: true },
  { id: 34, year: "09/1960", title: "Đại hội đại biểu lần thứ III", desc: "Họp tại Hà Nội; hoàn chỉnh đường lối chung: 2 nhiệm vụ chiến lược đồng thời ở hai miền.", era: "1954-1975" },
  { id: 35, year: "20/12/1960", title: "Thành lập Mặt trận DTGP miền Nam", desc: "Thành lập tại Tây Ninh; đoàn kết toàn thể các tầng lớp nhân dân miền Nam chống Mỹ – Diệm.", era: "1954-1975" },
  { id: 36, year: "1961–1965", title: "Đánh bại Chiến tranh đặc biệt", desc: "Quân ngụy + cố vấn Mỹ + ấp chiến lược; bị bẻ gãy qua các trận Ấp Bắc, Bình Giã, Ba Gia, Đồng Xoài.", era: "1954-1975" },
  { id: 37, year: "1965–1968", title: "Đánh bại Chiến tranh cục bộ", desc: "Quân viễn chinh Mỹ trực tiếp tham chiến; thất bại sau Vạn Tường, 2 mùa khô và Tổng tiến công Mậu Thân 1968.", era: "1954-1975" },
  { id: 38, year: "1969–1973", title: "Đánh bại Việt Nam hóa chiến tranh", desc: "Dùng người Việt đánh người Việt; đập tan cuộc tập kích B-52 ('Điện Biên Phủ trên không' 12/1972).", era: "1954-1975" },
  { id: 39, year: "27/01/1973", title: "Ký kết Hiệp định Pari", desc: "Buộc Mỹ phải rút hết quân đội về nước, tôn trọng các quyền dân tộc cơ bản của Việt Nam.", era: "1954-1975" },
  { id: 40, year: "30/04/1975", title: "Đại thắng mùa Xuân 1975", desc: "Chiến dịch Hồ Chí Minh toàn thắng; giải phóng hoàn toàn miền Nam, thống nhất non sông.", era: "1954-1975", highlight: true },
  { id: 41, year: "25/04/1976", title: "Tổng tuyển cử Quốc hội khóa VI", desc: "Bầu Quốc hội thống nhất chung; đặt tên nước là Cộng hòa xã hội chủ nghĩa Việt Nam (2/7/1976).", era: "1975-1986" },
  { id: 42, year: "12/1976", title: "Đại hội đại biểu lần thứ IV", desc: "Đổi tên Đảng thành Đảng Cộng sản Việt Nam; thông qua Kế hoạch 5 năm 1976–1980.", era: "1975-1986" },
  { id: 43, year: "17/02/1979", title: "Chiến tranh bảo vệ biên giới phía Bắc", desc: "Quân và dân 6 tỉnh biên giới kiên cường chiến đấu bảo vệ toàn vẹn lãnh thổ Tổ quốc.", era: "1975-1986" },
  { id: 44, year: "03/1982", title: "Đại hội đại biểu lần thứ V", desc: "Khẳng định 2 nhiệm vụ chiến lược; xác định nông nghiệp là mặt trận hàng đầu.", era: "1975-1986" },
  { id: 45, year: "12/1986", title: "Đại hội VI – Đại hội Đổi mới", desc: "Đổi mới tư duy trước hết là tư duy kinh tế; chuyển sang kinh tế hàng hóa nhiều thành phần.", era: "1986-2018", highlight: true },
  { id: 46, year: "06/1991", title: "Đại hội VII – Cương lĩnh 1991", desc: "Cương lĩnh xây dựng đất nước trong thời kỳ quá độ (6 đặc trưng); khẳng định CN Mác-Lênin & tư tưởng HCM.", era: "1986-2018" },
  { id: 47, year: "04/2001", title: "Đại hội IX – KTTT định hướng XHCN", desc: "Chính thức xác định kinh tế thị trường định hướng XHCN là mô hình kinh tế tổng quát thời kỳ quá độ.", era: "1986-2018" },
  { id: 48, year: "11/01/2007", title: "Việt Nam gia nhập WTO", desc: "Chính thức là thành viên thứ 150 của Tổ chức Thương mại Thế giới, hội nhập kinh tế quốc tế sâu rộng.", era: "1986-2018", highlight: true },
  { id: 49, year: "01/2011", title: "Đại hội XI – Cương lĩnh bổ sung 2011", desc: "Cương lĩnh bổ sung phát triển 2011 (8 đặc trưng, 3 đột phá chiến lược thể chế, nhân lực, hạ tầng).", era: "1986-2018" },
  { id: 50, year: "2021–2026", title: "Đại hội XIII, XIV & NQ 57, 68", desc: "ĐH XIII (tầm nhìn 2030–2045); NQ 57 (KH-CN, CĐS); NQ 68 (Kinh tế tư nhân); ĐH XIV (Kỷ nguyên vươn mình).", era: "2018-2026", highlight: true }
];

// 11. Verified Sources (20+ Online Citations)
const VERIFIED_SOURCES = [
  {
    category: "Phong trào Đồng Khởi & Phong trào miền Nam (1954–1960)",
    items: [
      {
        title: "Tài liệu tuyên truyền kỷ niệm phong trào Đồng Khởi",
        source: "Cổng TTĐT Tỉnh Khánh Hòa",
        url: "https://khanhhoa.gov.vn/Resources/Docs/SubDomain/HomePage/Tuyentruyen/2021/KT-878.pdf",
        tag: "Đồng Khởi 1960",
        summary: "Phân tích nguyên nhân, ý nghĩa bước ngoặt lịch sử của phong trào Đồng Khởi 1960 làm lung lay chính quyền Ngô Đình Diệm."
      },
      {
        title: "Nhân tố quyết định thắng lợi phong trào Đồng Khởi Bến Tre 1960",
        source: "Tạp chí Luật sư Việt Nam",
        url: "https://lsvn.vn/nhan-to-quyet-dinh-thang-loi-phong-trao-dong-khoi-ben-tre-1960-a1771.html",
        tag: "Bến Tre • Mỏ Cày",
        summary: "Làm rõ vai trò lãnh đạo của Đảng bộ tỉnh Bến Tre và nữ tướng Nguyễn Thị Định tại Mỏ Cày trong ngày 17/1/1960."
      },
      {
        title: "Nghiên cứu về phong trào Đồng Khởi ở Nam Bộ (ĐH Đồng Tháp)",
        source: "Tạp chí Khoa học Đại học Đồng Tháp",
        url: "https://dthujs.vn/index.php/dthujs/article/download/3127/2038/18348",
        tag: "Nghiên cứu khoa học",
        summary: "Tổng kết đánh giá lý luận: Đồng Khởi đánh dấu bước nhảy vọt, chuyển cách mạng miền Nam từ giữ gìn lực lượng sang thế tiến công."
      }
    ]
  },
  {
    category: "Hiệp định Giơnevơ & Chính sách tàn bạo của Mỹ – Diệm",
    items: [
      {
        title: "Giai đoạn 1955–1975: Nhân dân miền Nam chống Mỹ và tay sai",
        source: "Cổng Thông tin điện tử Chính phủ",
        url: "https://chinhphu.vn/giai-doan-1955-1975-xay-dung-cnxh-va-dau-tranh-thong-nhat-dat-nuoc/ii-nhan-dan-mien-nam-truc-tiep-chong-xam-luoc-my-va-tay-sai-lam-pha-san-nhieu-chien-luoc-chien-t-10000630",
        tag: "Giơnevơ & Luật 10/59",
        summary: "Tư liệu lịch sử về việc chính quyền Diệm cự tuyệt hiệp thương tổng tuyển cử, ban hành Luật 10/59 lê máy chém đàn áp cách mạng."
      },
      {
        title: "Đánh thắng chiến lược Chiến tranh đặc biệt của Mỹ (1961–1965)",
        source: "Cổng Thông tin điện tử Chính phủ",
        url: "https://chinhphu.vn/giai-doan-1955-1975-xay-dung-cnxh-va-dau-tranh-thong-nhat-dat-nuoc/2-danh-thang-chien-luoc-chien-tranh-dac-biet-cua-my-1961-1965-10001594",
        tag: "Chiến tranh đặc biệt",
        summary: "Hệ thống hóa tiến trình đập tan quốc sách ấp chiến lược và đánh đổ chế độ độc tài Ngô Đình Diệm (11/1963)."
      },
      {
        title: "Đại tướng Võ Nguyên Giáp: 'We Open the File' về Luật 10/59",
        source: "Marxists Internet Archive (Kho tư liệu Mác-xít)",
        url: "https://www.marxists.org/archive/giap/works/1961/we-open-the-file/ch02-part2-3.htm",
        tag: "Tư liệu quốc tế",
        summary: "Tài liệu lên án tính chất phản động của đạo luật 10/59 ban hành ngày 6/5/1959 đặt những người yêu nước ra ngoài vòng pháp luật."
      }
    ]
  },
  {
    category: "Hội nghị Trung ương 6, 7, 8 & Cách mạng Tháng Tám (1939–1945)",
    items: [
      {
        title: "Hội nghị Trung ương 8 – Bước chuyển căn bản dẫn đến thành công CMT8",
        source: "Tạp chí Thương hiệu & Công luận",
        url: "https://thuonghieucongluan.com.vn/hoi-nghi-trung-uong-8-buoc-chuyen-can-ban-dan-den-thanh-cong-cua-cach-mang-thang-tam-a275080.html",
        tag: "Hội nghị TW 8 (5/1941)",
        summary: "Phân tích hoàn chỉnh chuyển hướng chỉ đạo chiến lược, đặt giải phóng dân tộc lên trên hết tại Pác Bó tháng 5/1941."
      },
      {
        title: "Hội nghị TW 8 (5/1941) và sự sáng tạo trong phát triển đường lối cách mạng",
        source: "Tạp chí Chính trị & Phát triển",
        url: "https://vjol.info.vn/tcchinhtrivaphattrien/article/download/139628/114160/",
        tag: "Tạp chí lý luận",
        summary: "Đối chiếu văn kiện: 'Trong lúc này nếu không giải quyết được vấn đề dân tộc giải phóng... thì quyền lợi giai cấp vạn năm cũng không đòi lại được'."
      },
      {
        title: "Nhân tố quyết định thành công của Cách mạng Tháng Tám 1945",
        source: "Báo Nhân Dân",
        url: "https://nhandan.vn/special/nhan-to-quyet-dinh-thanh-cong-cua-Cach-mang-Thang-Tam/index.html",
        tag: "Báo Nhân Dân",
        summary: "Chuyên đề kỷ niệm 80 năm CMT8 làm rõ vai trò quyết định của Mặt trận Việt Minh và nghệ thuật chớp thời cơ."
      }
    ]
  },
  {
    category: "Cương lĩnh chính trị đầu tiên & Luận cương chính trị (1930)",
    items: [
      {
        title: "So sánh Cương lĩnh chính trị đầu tiên và Luận cương chính trị 10/1930",
        source: "Hệ thống Pháp luật Việt Nam (Luật Minh Khuê)",
        url: "https://luatminhkhue.vn/so-sanh-cuong-linh-chinh-tri-va-luan-cuong-chinh-tri.aspx",
        tag: "So sánh văn kiện",
        summary: "Bảng so sánh chuẩn học thuật về mục tiêu, lực lượng, mối quan hệ dân tộc - giai cấp giữa Nguyễn Ái Quốc và Trần Phú."
      },
      {
        title: "Tư duy lý luận về cách mạng dân tộc dân chủ nhân dân qua các văn kiện Đảng",
        source: "Tạp chí Lịch sử Đảng",
        url: "https://vjol.info.vn/tclichsuDang/article/download/141060/115297/",
        tag: "Tạp chí Lịch sử Đảng",
        summary: "Nghiên cứu quá trình Đảng ta khắc phục hạn chế tả khuynh của Luận cương 10/1930 qua các hội nghị TW 6, 7, 8 (1939–1941)."
      }
    ]
  },
  {
    category: "Chỉ thị Học tập theo Bác & Đấu tranh phòng chống tham nhũng",
    items: [
      {
        title: "Toàn văn Chỉ thị 06-CT/TW ngày 07/11/2006 của Bộ Chính trị khóa X",
        source: "Thư viện Văn bản Pháp luật",
        url: "https://luatminhkhue.vn/van-ban/chi-thi-06-ct-tw-nam-2006.aspx",
        tag: "Chỉ thị 06-CT/TW",
        summary: "Văn bản gốc phát động Cuộc vận động Học tập và làm theo tấm gương đạo đức Hồ Chí Minh (giải mã câu hỏi bẫy C3-32)."
      },
      {
        title: "Chỉ thị 03-CT/TW (14/5/2011) và Chỉ thị 05-CT/TW (15/5/2016)",
        source: "Cổng TTĐT Bộ Tư pháp & Báo Mới",
        url: "https://vbpl.moj.gov.vn/TW/Lists/vbpq/Attachments/54805/1973.CT.TTg.doc",
        tag: "06 → 03 → 05 → 07",
        summary: "Hệ thống các chỉ thị kế tiếp nhau qua các nhiệm kỳ Đại hội X, XI, XII về tư tưởng, đạo đức, phong cách Hồ Chí Minh."
      },
      {
        title: "Nghị quyết 04-NQ/TW ngày 21/8/2006 về phòng, chống tham nhũng, lãng phí",
        source: "Cơ sở dữ liệu Quốc gia Văn bản Pháp luật",
        url: "https://vbpl.vn/TW/Lists/vbpq/Attachments/25140/04.NQ.TW.doc",
        tag: "NQ 04 (TW 3 khóa X)",
        summary: "Nghị quyết mang tính bước ngoặt của Trung ương về tăng cường sự lãnh đạo của Đảng đối với công tác phòng chống tham nhũng."
      }
    ]
  },
  {
    category: "Văn kiện Đại hội XIV & Nghị quyết 57, 68 đột phá",
    items: [
      {
        title: "Tư liệu Văn kiện Đại hội XIV của Đảng Cộng sản Việt Nam",
        source: "Báo Điện tử Đảng Cộng sản Việt Nam",
        url: "https://tulieuvankien.dangcongsan.vn/bo-chinh-tri-ban-bi-thu-ban-chap-hanh-trung-uong/dai-hoi-dang/lan-thu-xiv",
        tag: "Đại hội XIV (2026)",
        summary: "Toàn bộ văn kiện, nghị quyết, báo cáo chính trị tổng kết 40 năm đổi mới và định hướng bước vào kỷ nguyên vươn mình của dân tộc."
      },
      {
        title: "Một số vấn đề mới, cốt lõi trong văn kiện Đại hội XIV của Đảng",
        source: "Báo Nhân Dân (Chuyên đề đặc biệt)",
        url: "https://nhandan.vn/special/Motsovandemoi_cotloi_va_kinhnghiem_40namdoimoi_trong_vankien_DaihoiXIV_cua_Dang/index.html",
        tag: "Báo Nhân Dân",
        summary: "Làm rõ thông điệp 4 kiên định, tăng trưởng 2 con số, tháo gỡ điểm nghẽn thể chế và đột phá KH-CN, đổi mới sáng tạo."
      },
      {
        title: "Nghị quyết 57-NQ/TW: Đột phá phát triển KH, CN, ĐMST và CĐS quốc gia",
        source: "Tạp chí Tòa án nhân dân",
        url: "https://www.tapchitoaan.vn/index.php/toan-van-nghi-quyet-57-nqtw-ve-dot-pha-phat-trien-khoa-hoc-cong-nghe-doi-moi-sang-tao-va-chuyen-doi-so-quoc-gia16401.html",
        tag: "NQ 57-NQ/TW",
        summary: "Nâng tầm khoa học công nghệ và chuyển đổi số lên thành 'đột phá quan trọng hàng đầu', người dân và doanh nghiệp là trung tâm."
      },
      {
        title: "Nghị quyết 68-NQ/TW: Kinh tế tư nhân là động lực quan trọng nhất",
        source: "Báo Nhân Dân & Tạp chí Quản lý nhà nước",
        url: "https://nhandan.vn/special/nghi-quyet-68-phat-trien-kinh-te-tu-nhan/index.html",
        tag: "NQ 68-NQ/TW",
        summary: "Khẳng định kinh tế tư nhân là động lực quan trọng nhất của nền kinh tế quốc gia, mục tiêu 2 triệu doanh nghiệp vào năm 2030."
      }
    ]
  }
];

// Write output app_data.js
const appData = {
  QUESTIONS: allQuestions,
  CONGRESSES,
  GENERAL_SECRETARIES,
  COMPARISONS,
  SOURCE_MATRIX,
  PITFALLS,
  FLASHCARDS,
  MATERIALS,
  CORE_50_MILESTONES,
  VERIFIED_SOURCES
};

const fileContent = '/* Auto-generated verified data for VNR202 Learning System */\nwindow.VNR_DATA = ' + JSON.stringify(appData, null, 2) + ';\n';
fs.writeFileSync('app_data.js', fileContent, 'utf8');
console.log('Successfully generated app_data.js with ' + allQuestions.length + ' questions, ' + CONGRESSES.length + ' congresses, ' + FLASHCARDS.length + ' flashcards, and ' + SOURCE_MATRIX.length + ' source matrix entries!');
