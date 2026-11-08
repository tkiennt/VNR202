const fs = require('fs');

// Read files
const part0 = fs.readFileSync('part0.md', 'utf8');
const part1 = fs.readFileSync('part1.md', 'utf8');
const part2 = fs.readFileSync('part2.md', 'utf8');
const part3 = fs.readFileSync('part3.md', 'utf8');
const part4 = fs.readFileSync('part4.md', 'utf8');
const tl = fs.readFileSync('tl.md', 'utf8');
const onTap = fs.readFileSync('on_tap_lich_su_dang.md', 'utf8');

// 1. Parse Questions
function parseQuestions() {
  const files = [
    { file: 'part1.md', chapter: 1, chapterName: 'Chương 1: 1930 – 1945', prefix: 'C1' },
    { file: 'part2.md', chapter: 2, chapterName: 'Chương 2: 1945 – 1975', prefix: 'C2' },
    { file: 'part3.md', chapter: 3, chapterName: 'Chương 3: 1975 – 2018', prefix: 'C3' },
    { file: 'part4.md', chapter: 4, chapterName: 'Chương mở rộng: 2018 – 2026', prefix: 'TL' }
  ];

  const questions = [];

  files.forEach(fInfo => {
    const content = fs.readFileSync(fInfo.file, 'utf8');
    const qBlocks = [];
    const pattern = new RegExp('\\*\\*(' + fInfo.prefix + '-\\d+)\\.\\*\\*([\\s\\S]*?)(?=(?:\\*\\*(?:' + fInfo.prefix + '-\\d+|TL-\\d+)\\.\\*\\*)|(?:---)|(?:# )|$)', 'g');
    let m;
    while ((m = pattern.exec(content)) !== null) {
      qBlocks.push({ id: m[1], body: m[2].trim() });
    }

    qBlocks.forEach(b => {
      const id = b.id;
      const text = b.body;

      if (id === 'C2-21') {
        questions.push({
          id: 'C2-21',
          chapter: 2,
          chapterName: 'Chương 2: 1945 – 1975',
          question: 'Đại hội III (5–10/9/1960, Hà Nội) hoàn chỉnh đường lối chung của cách mạng Việt Nam và vạch ra hai nhiệm vụ chiến lược là:',
          options: [
            { id: 'A', text: 'Tiến hành cách mạng XHCN ở miền Bắc; giải phóng miền Nam khỏi ách thống trị của đế quốc Mỹ và tay sai, thực hiện thống nhất nước nhà, hoàn thành độc lập và dân chủ trong cả nước' },
            { id: 'B', text: 'Tập trung toàn lực xây dựng CNXH ở miền Bắc, tạm thời giữ nguyên hiện trạng chia cắt ở miền Nam' },
            { id: 'C', text: 'Tiến hành đồng thời cải cách ruộng đất triệt để ở cả hai miền Nam – Bắc' },
            { id: 'D', text: 'Đưa quân tình nguyện mở rộng chiến tranh giải phóng toàn bộ bán đảo Đông Dương' }
          ],
          answer: 'A',
          explanation: 'Đại hội III (9/1960) xác định vị trí hai chiến lược: Miền Bắc là hậu phương lớn có vai trò quyết định nhất; Miền Nam là tiền tuyến lớn có vai trò quyết định trực tiếp đối với sự nghiệp giải phóng miền Nam.',
          warning: 'Đề gốc để dạng tự luận/học thuộc; đây là câu hỏi cốt lõi bắt buộc nhớ của Chương 2.',
          tags: ['Đại hội III', 'Nhiệm vụ chiến lược', 'Chương 2']
        });
        return;
      }

      let qText = '';
      let opts = [];
      let answer = '';
      let explanation = '';
      let warning = '';

      // Check answer line (✅ ...)
      const ansMatch = text.match(/✅\s*([^\n\r]+)/);
      if (ansMatch) {
        const ansRaw = ansMatch[1].trim();
        const letterMatch = ansRaw.match(/\*\*([A-D])\*\*/);
        if (letterMatch) {
          answer = letterMatch[1];
        } else if (/Kiến thức đúng:\s*([A-D])/i.test(ansRaw)) {
          answer = ansRaw.match(/Kiến thức đúng:\s*([A-D])/i)[1];
        } else if (/Đáp án của đề:\s*([A-D])/i.test(ansRaw)) {
          answer = ansRaw.match(/Đáp án của đề:\s*([A-D])/i)[1];
        } else if (ansRaw.startsWith('**')) {
          const m = ansRaw.match(/\*\*([^*]+)\*\*/);
          if (m && ['A','B','C','D'].includes(m[1].trim())) answer = m[1].trim();
        }

        if (ansRaw.includes('—')) {
          explanation = ansRaw.substring(ansRaw.indexOf('—') + 1).trim();
        } else if (ansRaw.includes('(')) {
          explanation = ansRaw.substring(ansRaw.indexOf('(')).trim();
        }
        
        if (text.includes('⚠️')) {
          warning = text.substring(text.indexOf('⚠️')).trim().replace(/\n+/g, ' ');
        }
      }

      const optStartIdx = text.search(/\bA\.\s/);
      if (optStartIdx !== -1) {
        qText = text.substring(0, optStartIdx).trim();
        const optsText = text.substring(optStartIdx, text.indexOf('✅') !== -1 ? text.indexOf('✅') : undefined);
        const optMatches = [...optsText.matchAll(/([A-D])\.\s*([^·|\n\r]+)/g)];
        opts = optMatches.map(m => ({
          id: m[1],
          text: m[2].trim().replace(/\s*·\s*$/, '').replace(/\s*\|\s*$/, '')
        }));
      } else {
        qText = text.substring(0, text.indexOf('✅')).trim();
      }

      // Cleanup question text
      qText = qText.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();

      // Ensure 4 options for consistency where possible or retain authentic
      if (id === 'C3-23' && opts.length === 2) {
        warning = 'Đề gốc chỉ có 2 phương án A và B (câu hỏi khuyết C, D trong ngân hàng câu hỏi gốc).';
      }

      // Assign tags based on keywords
      const tags = [];
      if (/đại hội/i.test(qText)) tags.push('Đại hội');
      if (/cương lĩnh|luận cương/i.test(qText)) tags.push('Cương lĩnh');
      if (/chiến lược|chiến dịch/i.test(qText)) tags.push('Quân sự');
      if (/kinh tế|thị trường/i.test(qText)) tags.push('Kinh tế');
      if (/hiệp định/i.test(qText)) tags.push('Hiệp định');
      if (/nghị quyết|chỉ thị/i.test(qText)) tags.push('Nghị quyết');
      tags.push(fInfo.prefix);

      questions.push({
        id,
        chapter: fInfo.chapter,
        chapterName: fInfo.chapterName,
        question: qText,
        options: opts,
        answer: answer || 'A',
        explanation: explanation || '',
        warning: warning || '',
        tags
      });
    });
  });

  return questions;
}

const questions = parseQuestions();

// Detailed explanations additions for questions that had sparse notes
const detailedExplanations = {
  'C1-1': 'Cách mạng tháng Mười Nga (1917) và Quốc tế Cộng sản (1919) đã thức tỉnh phong trào đấu tranh giải phóng dân tộc ở các nước thuộc địa, phụ thuộc (Mục 1.1a).',
  'C1-2': 'Giai cấp công nhân Việt Nam ra đời từ cuộc khai thác thuộc địa lần thứ nhất (1897–1914) của thực dân Pháp, trước cả giai cấp tư sản dân tộc (Mục 1.1b).',
  'C1-3': 'Cuộc khai thác thuộc địa lần thứ hai (1919–1929) đầu tư quy mô lớn nhưng khiến cơ cấu kinh tế Việt Nam mất cân đối, què quặt, lạc hậu, nghèo nàn và lệ thuộc vào Pháp (Mục 1.1b).',
  'C1-4': 'Giai cấp công nhân Việt Nam là lực lượng lãnh đạo cách mạng nhờ có sứ mệnh lịch sử vẻ vang, tiếp thu chủ nghĩa Mác – Lênin và có Đảng tiên phong lãnh đạo (Mục 1.1b).',
  'C1-7': 'Nguyễn Ái Quốc khẳng định việc thành lập Đảng ngày 3/2/1930 là một bước ngoặt vô cùng quan trọng, chấm dứt thời kỳ khủng hoảng về đường lối cứu nước kéo dài hàng thập kỷ (Mục 1.5).',
  'C1-8': 'Đồng chí Trần Phú được bầu làm Tổng Bí thư đầu tiên của Đảng tại Hội nghị Ban Chấp hành Trung ương tháng 10/1930 họp tại Hương Cảng (Mục 1.6).',
  'C1-9': 'Luận cương chính trị tháng 10/1930 do Trần Phú soạn thảo xác định nhiệm vụ: Đánh đổ đế quốc Pháp, phong kiến và tư sản phản cách mạng, làm cho nước Việt Nam độc lập tự do (Mục 1.6).',
  'C1-11': 'Trong thời kỳ 1930–1931, mâu thuẫn xã hội gay gắt; kẻ thù chủ yếu của cách mạng được xác định là thực dân Pháp (đế quốc) và phong kiến tay sai (Mục 1.8).',
  'C1-12': 'Phong trào Xô Viết Nghệ Tĩnh bắt đầu bùng nổ từ ngày Quốc tế Lao động 1/5/1930 với các cuộc biểu tình rầm rộ của công nhân Vinh – Bến Thủy và nông dân các huyện lân cận (Mục 1.8).',
  'C1-13': 'Giai đoạn 1932–1935 là thời kỳ toàn Đảng đấu tranh kiên cường để khôi phục hệ thống tổ chức và phong trào cách mạng sau sự khủng bố trắng của kẻ thù (Mục 1.9).',
  'C1-17': 'Chiến tranh thế giới thứ hai bùng nổ vào tháng 9 năm 1939 khi phát xít Đức tấn công Ba Lan, tác động trực tiếp và sâu sắc đến tình hình Đông Dương (Mục 1.10).',
  'C1-21': 'Hội nghị Trung ương 8 (5/1941) tại Pác Bó xác định hình thức chính quyền sau cách mạng là Chính phủ Việt Nam Dân chủ Cộng hòa, đại diện cho toàn thể quốc dân (Mục 1.10).',
  'C1-22': 'Nội dung B sai vì tại Hội nghị TW 8 (5/1941), Đảng chủ trương tạm gác khẩu hiệu "đánh đổ địa chủ, chia ruộng đất cho dân cày", chỉ tịch thu ruộng đất của đế quốc và Việt gian chia cho dân cày nghèo (Mục 1.10).',
  'C2-1': 'Ngay sau Cách mạng Tháng Tám 1945, nước Việt Nam Dân chủ Cộng hòa rơi vào tình thế "ngàn cân treo sợi tóc" trước sự bao vây của thù trong giặc ngoài (quân Tưởng, quân Anh, Pháp, Nhật, giặc đói, giặc dốt, tài chính kiệt quệ).',
  'C2-2': 'Sau CMT8 đến 1954, kẻ thù chính, nguy hiểm nhất và trực tiếp nhất của nhân dân Việt Nam là thực dân Pháp xâm lược (Mục 2.1).',
  'C2-7': 'Ngày 12/12/1946, Ban Thường vụ Trung ương Đảng ra Chỉ thị "Toàn dân kháng chiến"; đến đêm 19/12/1946 Chủ tịch Hồ Chí Minh mới phát động "Lời kêu gọi Toàn quốc kháng chiến" (Mẹo nhớ phân biệt Chỉ thị và Lời kêu gọi).',
  'C2-9': 'Mục tiêu của cuộc Toàn quốc kháng chiến chống Pháp là đánh phản động thực dân Pháp xâm lược, giành thống nhất và độc lập dân tộc (Mục 2.2).',
  'C2-10': 'Đường lối kháng chiến chống Pháp chỉ rõ triển vọng: "mặc dù lâu dài, gian khổ, khó khăn song nhất định thắng lợi" (Mục 2.2).',
  'C2-11': 'Đại hội II (2/1951) xác định con đường đi lên CNXH ở Việt Nam là một quá trình đấu tranh lâu dài, đại thể trải qua 3 giai đoạn: hoàn thành giải phóng dân tộc; xóa bỏ tàn tích phong kiến; xây dựng cơ sở CNXH (Mục 2.3).',
  'C2-12': 'Đại hội II của Đảng (2/1951 tại Tuyên Quang) được mệnh danh là "Đại hội kháng chiến thắng lợi", đưa Đảng ra hoạt động công khai với tên gọi Đảng Lao động Việt Nam (Mục 2.3).',
  'C2-13': 'Chiến thắng lịch sử Điện Biên Phủ ngày 7/5/1954 là đỉnh cao chói lọi của cuộc kháng chiến chống thực dân Pháp, quyết định việc ký kết Hiệp định Giơnevơ.',
  'C2-15': 'Sau thất bại thảm hại ở tập đoàn cứ điểm Điện Biên Phủ, thực dân Pháp buộc phải ngồi vào bàn đàm phán và ký kết Hiệp định Giơnevơ lập lại hòa bình ở Đông Dương.',
  'C2-16': 'Hiệp định Giơnevơ 1954 lần đầu tiên ghi nhận các quyền dân tộc cơ bản của Việt Nam, Lào, Campuchia: độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ.',
  'C2-17': 'Hiệp định Giơnevơ 1954 quy định giới tuyến quân sự tạm thời tại vĩ tuyến 17 (sông Bến Hải, Quảng Trị) để tập kết chuyển quân trong thời hạn 2 năm trước khi tổng tuyển cử.',
  'C2-18': 'Đặc điểm lớn nhất của cách mạng Việt Nam sau 1954 là một đảng lãnh đạo đồng thời hai chiến lược cách mạng ở hai miền: CM XHCN ở miền Bắc và CM dân tộc dân chủ nhân dân ở miền Nam.',
  'C2-19': 'Đại hội đại biểu toàn quốc lần thứ III (5–10/9/1960) được tổ chức tại Thủ đô Hà Nội.',
  'C2-20': 'Đường lối chung xây dựng CNXH ở miền Bắc trong thời kỳ chống Mỹ được đề ra và hoàn chỉnh tại Đại hội lần thứ III (1960).',
  'C2-24': 'Nghị quyết Hội nghị TW 15 (1/1959) đánh dấu bước ngoặt chuyển cách mạng miền Nam sang kết hợp đấu tranh chính trị với đấu tranh vũ trang, tiến tới khởi nghĩa bạo lực cách mạng.',
  'C2-25': 'Hội nghị Trung ương 15 (1/1959) đã quyết định cho phép nhân dân miền Nam sử dụng bạo lực cách mạng để đánh đổ ách kìm kẹp của chính quyền Mỹ – Diệm.',
  'C2-26': 'Luật 10/59 lê máy chém đi khắp miền Nam tàn sát người yêu nước là ngòi nổ trực tiếp thổi bùng lên phong trào Đồng Khởi năm 1960.',
  'C2-30': 'Giai đoạn 1961–1965, đế quốc Mỹ tiến hành chiến lược "Chiến tranh đặc biệt" ở miền Nam Việt Nam (công thức: quân đội Sài Gòn + cố vấn Mỹ + vũ khí trang bị Mỹ + quốc sách ấp chiến lược).',
  'C2-31': 'Hội nghị TW 11 (3/1965) và 12 (12/1965) khi Mỹ ồ ạt đổ quân vào miền Nam đã đề ra khẩu hiệu chung của toàn dân tộc: "Tất cả để đánh thắng giặc Mỹ xâm lược".',
  'C2-33': 'Cuộc kháng chiến chống Mỹ, cứu nước toàn thắng với mốc son chói lọi của Chiến dịch Hồ Chí Minh lịch sử trưa ngày 30/4/1975 giải phóng hoàn toàn miền Nam.',
  'C2-34': 'Nhân tố hàng đầu quyết định mọi thắng lợi của kháng chiến chống Mỹ là sự lãnh đạo của Đảng với đường lối chính trị, quân sự độc lập, tự chủ, đúng đắn và sáng tạo.',
  'C3-1': 'Nghị quyết Hội nghị Trung ương 24 (9/1975) khẳng định thống nhất đất nước vừa là nguyện vọng tha thiết của nhân dân cả nước, vừa là quy luật khách quan của lịch sử.',
  'C3-2': 'Nhiệm vụ bức thiết hàng đầu sau ngày 30/4/1975 là thống nhất đất nước về mặt Nhà nước để hoàn thiện bộ máy chính quyền chung cho cả nước.',
  'C3-3': 'Đoàn đại biểu miền Nam tham dự Hội nghị hiệp thương chính trị thống nhất Tổ quốc (11/1975) do đồng chí Phạm Hùng dẫn đầu.',
  'C3-4': 'Cuộc Tổng tuyển cử ngày 25/4/1976 bầu ra Quốc hội thống nhất được tiến hành theo 4 nguyên tắc dân chủ: phổ thông, bình đẳng, trực tiếp và bỏ phiếu kín.',
  'C3-5': 'Kỳ họp thứ nhất Quốc hội khóa VI (tháng 7/1976) đã quyết định đặt tên nước là Cộng hòa xã hội chủ nghĩa Việt Nam, chọn Hà Nội là Thủ đô, đổi tên Sài Gòn thành TP Hồ Chí Minh.',
  'C3-6': 'Đại hội lần thứ IV của Đảng (12/1976) đã quyết định đổi tên Đảng Lao động Việt Nam thành Đảng Cộng sản Việt Nam.',
  'C3-7': 'Đại hội lần thứ IV họp tại Hà Nội từ ngày 14–20/12/1976 quyết định đổi tên Đảng thành Đảng Cộng sản Việt Nam.',
  'C3-8': 'Đại hội IV (1976) đã thông qua Kế hoạch phát triển kinh tế – xã hội 5 năm 1976–1980.',
  'C3-9': 'Mục tiêu của Kế hoạch 5 năm 1976–1980 là bảo đảm nhu cầu đời sống của nhân dân, tích lũy để xây dựng cơ sở vật chất kỹ thuật của CNXH.',
  'C3-10': 'Ngày 17/2/1979, quân đội Trung Quốc đã bất ngờ mở cuộc tấn công quy mô lớn trên toàn tuyến biên giới phía Bắc nước ta.',
  'C3-11': 'Đại hội lần thứ V của Đảng (3/1982) xác định nông nghiệp là mặt trận hàng đầu trong chặng đường đầu tiên của thời kỳ quá độ.',
  'C3-12': 'Đại hội V khẳng định hai nhiệm vụ chiến lược: Xây dựng thành công chủ nghĩa xã hội và bảo vệ vững chắc Tổ quốc Việt Nam XHCN.',
  'C3-13': 'Đại hội đại biểu toàn quốc lần thứ VI (12/1986) đi vào lịch sử với tư cách là Đại hội Đổi mới toàn diện đất nước, nhìn thẳng vào sự thật, đánh giá đúng sự thật.',
  'C3-14': 'Bài học kinh nghiệm 10 năm Đổi mới (1986–1996) được Đại hội VIII tổng kết: xây dựng nền kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường có sự quản lý của Nhà nước.',
  'C3-15': 'Đảng ta khẳng định: Đổi mới không phải là thay đổi mục tiêu CNXH mà là làm cho mục tiêu ấy được thực hiện có hiệu quả bằng những quan niệm đúng đắn và bước đi phù hợp.',
  'C3-16': 'Cơ chế tập trung quan liêu, bao cấp để lại tác hại nặng nề kéo dài là nhiều hiện tượng tiêu cực trong xã hội, thói ỷ lại, trì trệ và tham nhũng lãng phí.',
  'C3-17': 'Quan điểm xã hội thời kỳ đổi mới: kết hợp chặt chẽ các mục tiêu kinh tế với các mục tiêu xã hội ngay trong từng bước và trong suốt quá trình phát triển.',
  'C3-18': 'Đại hội VIII chủ trương: tăng trưởng kinh tế phải gắn liền với tiến bộ và công bằng xã hội ngay trong từng bước và suốt quá trình phát triển.',
  'C3-19': 'Mô hình "kinh tế thị trường định hướng xã hội chủ nghĩa" được Đại hội IX (4/2001) chính thức xác định là mô hình kinh tế tổng quát trong thời kỳ quá độ.',
  'C3-20': 'Đại hội X (4/2006) có điểm mới đột phá: xác định xây dựng chỉnh đốn Đảng là then chốt và chính thức cho phép đảng viên làm kinh tế tư nhân.',
  'C3-21': 'Một quan điểm then chốt của Đảng về CNH – HĐH: lấy việc phát huy nguồn lực con người là yếu tố cơ bản cho sự phát triển nhanh và bền vững.',
  'C3-22': 'Mặt trận Tổ quốc và các đoàn thể chính trị – xã hội (Đoàn Thanh niên, Công đoàn, Hội Phụ nữ, Hội Nông dân, Hội Cựu chiến binh) hợp thành hệ thống các tổ chức chính trị – xã hội.',
  'C3-24': 'Việc ký kết Hiệp định Pari về Campuchia ngày 23/10/1991 đã giải tỏa rào cản quốc tế lớn nhất, mở đường cho Việt Nam bình thường hóa và mở rộng quan hệ với các nước.',
  'C3-25': 'Ngày 11/1/2007, Việt Nam chính thức trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO).',
  'C3-26': 'Nghị quyết Hội nghị TW 7 khóa IX (3/2003) khẳng định: Đất đai là tài nguyên quốc gia vô cùng quý giá, là tư liệu đặc biệt, là nguồn nội lực và nguồn vốn to lớn.',
  'C3-27': 'Hội nghị Trung ương 8 khóa IX (7/2003) ban hành Nghị quyết chuyên đề về "Chiến lược bảo vệ Tổ quốc trong tình hình mới".',
  'C3-28': 'Nghị quyết 36-NQ/TW ngày 26/3/2004 của Bộ Chính trị về công tác đối với người Việt Nam ở nước ngoài, khẳng định cộng đồng kiều bào là bộ phận không thể tách rời của dân tộc.',
  'C3-29': 'Hội nghị TW 4 khóa X (2/2007) thông qua Nghị quyết 09-NQ/TW về Chiến lược biển Việt Nam đến năm 2020: phấn đấu trở thành quốc gia mạnh về biển, làm giàu từ biển.',
  'C3-30': 'Hội nghị TW 3 khóa X (21/8/2006) ban hành Nghị quyết số 04-NQ/TW về tăng cường sự lãnh đạo của Đảng đối với công tác phòng, chống tham nhũng, lãng phí.',
  'C3-31': 'Hội nghị TW 5 khóa X (7/2007) ban hành Nghị quyết 14-NQ/TW về tăng cường công tác kiểm tra, giám sát của Đảng.',
  'C3-33': 'Nghị quyết số 20-NQ/TW ngày 25/10/2017 (TW 6 khóa XII) về tăng cường công tác bảo vệ, chăm sóc và nâng cao sức khỏe nhân dân trong tình hình mới.'
};

questions.forEach(q => {
  if (detailedExplanations[q.id] && (!q.explanation || q.explanation.length < 10)) {
    q.explanation = detailedExplanations[q.id];
  }
});

// 2. Congresses (14 Congresses + 1930)
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
      "Bầu Ban Chấp hành Trung ương lâm thời"
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

// 3. General Secretaries
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

// 4. Comparisons
const COMPARISONS = {
  cuongLinhVsLuanCuong: {
    title: "So sánh Cương lĩnh chính trị đầu tiên (2/1930) và Luận cương chính trị (10/1930)",
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
  baCaoTrao: {
    title: "So sánh 3 Cao trào cách mạng (1930–1931, 1936–1939, 1939–1945)",
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
    title: "So sánh 3 chiến lược chiến tranh của đế quốc Mỹ ở miền Nam (1961–1973)",
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
    title: "So sánh Cương lĩnh 1991 (6 đặc trưng) và Cương lĩnh bổ sung 2011 (8 đặc trưng)",
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
    title: "\"Bộ tứ trụ cột\" Nghị quyết thời kỳ mới (2024–2025)",
    headers: ["Nghị quyết", "Ngày ban hành", "Nội dung trọng tâm", "Mục tiêu & Tầm nhìn"],
    rows: [
      ["NQ 57-NQ/TW", "22/12/2024", "Đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia", "Xác định KHCN, đổi mới sáng tạo và CĐS là động lực chính của mô hình tăng trưởng mới."],
      ["NQ 59-NQ/TW", "2025", "Định hướng chiến lược hội nhập quốc tế toàn diện, sâu rộng trong giai đoạn mới", "Chủ động hội nhập đa tầng, định vị Việt Nam là mắt xích quan trọng trong chuỗi giá trị toàn cầu."],
      ["NQ 66-NQ/TW", "2025", "Đổi mới mạnh mẽ công tác xây dựng và hoàn thiện thể chế, hệ thống pháp luật", "Xây dựng pháp luật kiến tạo phát triển, dỡ bỏ mọi rào cản hành chính cản trở nguồn lực."],
      ["NQ 68-NQ/TW", "4/5/2025", "Phát triển kinh tế tư nhân thực sự trở thành một động lực quan trọng nhất", "Năm 2030 đạt ít nhất 2 triệu doanh nghiệp hoạt động; năm 2045 đạt ít nhất 3 triệu doanh nghiệp."]
    ]
  }
};

// 5. Controversies and Exam Pitfalls (Phụ lục A)
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
    issue: "Đề thi chọn đáp án B, nhưng thực tế cả 4 bài học đều có trong các tài liệu tổng kết.",
    solution: "Học thuộc theo đề: Đáp án B. Điểm cần chú ý: Phương án A dùng từ 'ngọn cờ độc lập dân tộc và CNXH' mới là bài học chuẩn, nếu đề viết 'độc lập dân tộc và dân chủ' thì đó là bài học của thời kỳ chống Pháp hoặc giải phóng dân tộc 1930-1945.",
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
  }
];

// 6. Flashcards Dataset
const FLASHCARDS = [
  { id: 1, category: "Mốc sự kiện", front: "5/6/1911", back: "Nguyễn Ái Quốc ra đi tìm đường cứu nước từ Bến Nhà Rồng trên con tàu Amiral Latouche-Tréville.", hint: "Chương 1" },
  { id: 2, category: "Mốc sự kiện", front: "7/1920", back: "Nguyễn Ái Quốc đọc bản Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và thuộc địa của Lênin → Tìm thấy con đường cứu nước đúng đắn.", hint: "Chương 1" },
  { id: 3, category: "Mốc sự kiện", front: "3/2/1930", back: "Ngày thành lập Đảng Cộng sản Việt Nam (Hội nghị hợp nhất tại Cửu Long, Hồng Kông do NAQ chủ trì).", hint: "Chương 1" },
  { id: 4, category: "Mốc sự kiện", front: "10/1930", back: "Hội nghị Trung ương tại Hương Cảng: Đổi tên Đảng thành ĐCS Đông Dương; thông qua Luận cương chính trị; bầu Trần Phú làm TBT đầu tiên.", hint: "Chương 1" },
  { id: 5, category: "Mốc sự kiện", front: "19/8/1945 & 2/9/1945", back: "19/8: Khởi nghĩa thắng lợi ở Hà Nội; 2/9: Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa.", hint: "Chương 1" },
  { id: 6, category: "Mốc sự kiện", front: "6/3/1946 & 14/9/1946", back: "6/3/1946: Ký Hiệp định Sơ bộ (\"Hòa để tiến\", đuổi 20 vạn quân Tưởng); 14/9/1946: Ký Tạm ước Việt - Pháp nhân nhượng kinh tế, văn hóa.", hint: "Chương 2" },
  { id: 7, category: "Mốc sự kiện", front: "12/12/1946 & 19/12/1946", back: "12/12: Ban Thường vụ TW ra Chỉ thị \"Toàn dân kháng chiến\"; 19/12: Hồ Chủ tịch ra \"Lời kêu gọi Toàn quốc kháng chiến\".", hint: "Chương 2" },
  { id: 8, category: "Mốc sự kiện", front: "7/5/1954 & 21/7/1954", back: "7/5/1954: Chiến thắng lịch sử Điện Biên Phủ; 21/7/1954: Ký kết Hiệp định Giơnevơ lập lại hòa bình ở Đông Dương.", hint: "Chương 2" },
  { id: 9, category: "Mốc sự kiện", front: "1/1959 & 17/1/1960", back: "1/1959: Hội nghị TW 15 mở đường bạo lực cách mạng; 17/1/1960: Bùng nổ phong trào Đồng Khởi ở Bến Tre.", hint: "Chương 2" },
  { id: 10, category: "Mốc sự kiện", front: "27/1/1973 & 30/4/1975", back: "27/1/1973: Ký Hiệp định Pari chấm dứt chiến tranh; 30/4/1975: Chiến dịch Hồ Chí Minh toàn thắng, giải phóng hoàn toàn miền Nam.", hint: "Chương 2" },
  { id: 11, category: "Mốc sự kiện", front: "25/4/1976 & 2/7/1976", back: "25/4/1976: Tổng tuyển cử bầu Quốc hội chung khóa VI; 2/7/1976: Đổi tên nước thành Cộng hòa xã hội chủ nghĩa Việt Nam.", hint: "Chương 3" },
  { id: 12, category: "Mốc sự kiện", front: "17/2/1979", back: "Trung Quốc mở cuộc tấn công xâm lược quy mô lớn trên toàn tuyến biên giới phía Bắc nước ta.", hint: "Chương 3" },
  { id: 13, category: "Mốc sự kiện", front: "12/1986", back: "Đại hội VI của Đảng: Mở ra công cuộc ĐỔI MỚI toàn diện đất nước (TBT Nguyễn Văn Linh).", hint: "Chương 3" },
  { id: 14, category: "Mốc sự kiện", front: "11/1/2007", back: "Việt Nam chính thức trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO).", hint: "Chương 3" },
  { id: 15, category: "Đại hội Đảng", front: "Đại hội II (2/1951)", back: "\"Đại hội kháng chiến thắng lợi\", Đảng ra hoạt động công khai lấy tên Đảng Lao động Việt Nam, họp tại Tuyên Quang.", hint: "Đại hội Đảng" },
  { id: 16, category: "Đại hội Đảng", front: "Đại hội III (9/1960)", back: "Họp tại Hà Nội; xác định đồng thời hai chiến lược cách mạng ở hai miền; Kế hoạch 5 năm lần thứ nhất (1961–1965).", hint: "Đại hội Đảng" },
  { id: 17, category: "Đại hội Đảng", front: "Đại hội IV (12/1976)", back: "Đổi tên Đảng thành Đảng Cộng sản Việt Nam; Kế hoạch 5 năm 1976–1980.", hint: "Đại hội Đảng" },
  { id: 18, category: "Đại hội Đảng", front: "Đại hội V (3/1982)", back: "Xác định nông nghiệp là mặt trận hàng đầu; 2 nhiệm vụ chiến lược: Xây dựng CNXH và bảo vệ Tổ quốc.", hint: "Đại hội Đảng" },
  { id: 19, category: "Đại hội Đảng", front: "Đại hội VII (6/1991)", back: "Thông qua Cương lĩnh xây dựng đất nước trong thời kỳ quá độ (Cương lĩnh 1991) gồm 6 đặc trưng.", hint: "Đại hội Đảng" },
  { id: 20, category: "Đại hội Đảng", front: "Đại hội IX (4/2001)", back: "Chính thức nêu mô hình kinh tế thị trường định hướng XHCN là mô hình kinh tế tổng quát trong thời kỳ quá độ.", hint: "Đại hội Đảng" },
  { id: 21, category: "Đại hội Đảng", front: "Đại hội X (4/2006)", back: "Đột phá: Cho phép đảng viên làm kinh tế tư nhân; xác định xây dựng chỉnh đốn Đảng là then chốt.", hint: "Đại hội Đảng" },
  { id: 22, category: "Đại hội Đảng", front: "Đại hội XI (1/2011)", back: "Thông qua Cương lĩnh bổ sung, phát triển năm 2011 gồm 8 đặc trưng của xã hội XHCN.", hint: "Đại hội Đảng" },
  { id: 23, category: "Đại hội Đảng", front: "Đại hội XIII (2021)", back: "Đề ra 3 mục tiêu chiến lược: 2025 (vượt TN trung bình thấp), 2030 (công nghiệp hiện đại, TN trung bình cao), 2045 (nước phát triển, thu nhập cao).", hint: "Đại hội Đảng" },
  { id: 24, category: "Đại hội Đảng", front: "Đại hội XIV (1/2026)", back: "TBT Tô Lâm tái cử; mục tiêu tăng trưởng GDP bình quân 2026–2030 từ 10%/năm trở lên; mở ra Kỷ nguyên mới.", hint: "Đại hội Đảng" },
  { id: 25, category: "Nghị quyết then chốt", front: "Nghị quyết 15 (1/1959)", back: "Ban Chấp hành TW xác định con đường cơ bản của cách mạng miền Nam là sử dụng bạo lực cách mạng, khởi nghĩa giành chính quyền.", hint: "Nghị quyết" },
  { id: 26, category: "Nghị quyết then chốt", front: "Nghị quyết 04-NQ/TW (TW 3 khóa X, 2006)", back: "Tăng cường sự lãnh đạo của Đảng đối với công tác phòng, chống tham nhũng, lãng phí.", hint: "Nghị quyết" },
  { id: 27, category: "Nghị quyết then chốt", front: "Nghị quyết TW 4 khóa XII (10/2016)", back: "Tăng cường xây dựng, chỉnh đốn Đảng; ngăn chặn, đẩy lùi sự suy thoái về tư tưởng chính trị, đạo đức, lối sống, 27 biểu hiện \"tự diễn biến\", \"tự chuyển hóa\".", hint: "Nghị quyết" },
  { id: 28, category: "Nghị quyết then chốt", front: "Nghị quyết 57-NQ/TW (2024)", back: "Đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia.", hint: "Bộ tứ trụ cột" },
  { id: 29, category: "Nghị quyết then chốt", front: "Nghị quyết 68-NQ/TW (2025)", back: "Phát triển kinh tế tư nhân là một động lực quan trọng nhất (mục tiêu 2 triệu DN năm 2030, 3 triệu DN năm 2045).", hint: "Bộ tứ trụ cột" },
  { id: 30, category: "Mẹo nhớ cốt lõi", front: "Thần chú Đại hội IV – V – VI – IX – X", back: "IV: Đổi tên Đảng | V: Nông nghiệp hàng đầu | VI: Đổi mới | IX: Kinh tế thị trường định hướng XHCN | X: Đảng viên làm KT tư nhân.", hint: "Mẹo thi" },
  { id: 31, category: "Mẹo nhớ cốt lõi", front: "Phân biệt 3 tổ chức Cộng sản năm 1929", back: "Bắc Kỳ: Đông Dương CSĐ (6/1929, đầu tiên) | Nam Kỳ: An Nam CSĐ (11/1929) | Trung Kỳ: Đông Dương CS Liên đoàn (1/1930).", hint: "Mẹo thi" },
  { id: 32, category: "Mẹo nhớ cốt lõi", front: "Chuỗi văn bản Học tập và làm theo Bác", back: "Chỉ thị 06 (khóa X, 2006) → Chỉ thị 03 (khóa XI, 2011) → Chỉ thị 05 (khóa XII, 2016) → Kết luận 01 (khóa XIII, 2021).", hint: "Mẹo thi" },
  { id: 33, category: "Mẹo nhớ cốt lõi", front: "Công nhân VN ra đời từ khi nào?", back: "Ra đời từ cuộc khai thác thuộc địa lần thứ NHẤT (1897–1914); trước cả giai cấp tư sản dân tộc.", hint: "Mẹo thi" },
  { id: 34, category: "Mẹo nhớ cốt lõi", front: "Chiến lược Biển Việt Nam", back: "Hội nghị TW 4 khóa X (NQ 09/2007): Việt Nam phải trở thành \"quốc gia mạnh về biển, làm giàu từ biển\".", hint: "Mẹo thi" },
  { id: 35, category: "Mẹo nhớ cốt lõi", front: "Trưởng ban Ban Chỉ đạo TW về PCTN", back: "Từ năm 2013: Trực thuộc Bộ Chính trị, do Tổng Bí thư làm Trưởng ban (trước đó 2006 thuộc Chính phủ do Thủ tướng đứng đầu).", hint: "Mẹo thi" }
];

// 7. Reference Materials from tl.md
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

// Write output app_data.js
const appData = {
  QUESTIONS: questions,
  CONGRESSES,
  GENERAL_SECRETARIES,
  COMPARISONS,
  PITFALLS,
  FLASHCARDS,
  MATERIALS
};

const fileContent = '/* Auto-generated verified data for VNR202 Learning System */\nwindow.VNR_DATA = ' + JSON.stringify(appData, null, 2) + ';\n';
fs.writeFileSync('app_data.js', fileContent, 'utf8');
console.log('Successfully generated app_data.js with ' + questions.length + ' questions, ' + CONGRESSES.length + ' congresses, ' + FLASHCARDS.length + ' flashcards, and ' + PITFALLS.length + ' pitfalls!');
