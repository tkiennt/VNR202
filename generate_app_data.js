const fs = require('fs');

// Read source files
const part0 = fs.readFileSync('part0.md', 'utf8');
const part1 = fs.readFileSync('part1.md', 'utf8');
const part2 = fs.readFileSync('part2.md', 'utf8');
const part3 = fs.readFileSync('part3.md', 'utf8');
const part4 = fs.readFileSync('part4.md', 'utf8');
const tl = fs.readFileSync('tl.md', 'utf8');
const onTap = fs.readFileSync('on_tap_lich_su_dang.md', 'utf8');

// 1. Parse Existing 100 Questions
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
          source: 'Giáo trình 2021, Chương 2, tr. 182-185',
          tags: ['Đại hội III', 'Nhiệm vụ chiến lược', 'Chương 2']
        });
        return;
      }

      let qText = '';
      let opts = [];
      let answer = '';
      let explanation = '';
      let warning = '';

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

      qText = qText.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();

      if (id === 'C3-23' && opts.length === 2) {
        warning = 'Đề gốc chỉ có 2 phương án A và B (câu hỏi khuyết C, D trong ngân hàng câu hỏi gốc).';
      }

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
        source: `Giáo trình 2021, Chương ${fInfo.chapter}`,
        tags
      });
    });
  });

  return questions;
}

const questions = parseQuestions();

// Detailed explanations for existing questions
const detailedExplanations = {
  'C1-1': 'Cách mạng tháng Mười Nga (1917) và Quốc tế Cộng sản (1919) đã thức tỉnh phong trào đấu tranh giải phóng dân tộc ở các nước thuộc địa, phụ thuộc (Mục 1.1a, tr. 15 Giáo trình 2021).',
  'C1-2': 'Giai cấp công nhân Việt Nam ra đời từ cuộc khai thác thuộc địa lần thứ nhất (1897–1914) của thực dân Pháp, trước cả giai cấp tư sản dân tộc (Mục 1.1b, tr. 22).',
  'C1-3': 'Cuộc khai thác thuộc địa lần thứ hai (1919–1929) đầu tư quy mô lớn nhưng khiến cơ cấu kinh tế Việt Nam mất cân đối, què quặt, lạc hậu, nghèo nàn và lệ thuộc vào Pháp (Mục 1.1b, tr. 25).',
  'C1-4': 'Giai cấp công nhân Việt Nam là lực lượng lãnh đạo cách mạng nhờ có sứ mệnh lịch sử vẻ vang, tiếp thu chủ nghĩa Mác – Lênin và có Đảng tiên phong lãnh đạo (Mục 1.1b, tr. 27).',
  'C1-7': 'Nguyễn Ái Quốc khẳng định việc thành lập Đảng ngày 3/2/1930 là một bước ngoặt vô cùng quan trọng, chấm dứt thời kỳ khủng hoảng về đường lối cứu nước kéo dài hàng thập kỷ (tr. 42).',
  'C1-8': 'Đồng chí Trần Phú được bầu làm Tổng Bí thư đầu tiên của Đảng tại Hội nghị Ban Chấp hành Trung ương tháng 10/1930 họp tại Hương Cảng (tr. 50).',
  'C1-9': 'Luận cương chính trị tháng 10/1930 do Trần Phú soạn thảo xác định nhiệm vụ: Đánh đổ đế quốc Pháp, phong kiến và tư sản phản cách mạng, làm cho nước Việt Nam độc lập tự do (tr. 52).',
  'C1-11': 'Trong thời kỳ 1930–1931, mâu thuẫn xã hội gay gắt; kẻ thù chủ yếu của cách mạng được xác định là thực dân Pháp (đế quốc) và phong kiến tay sai (tr. 56).',
  'C1-12': 'Phong trào Xô Viết Nghệ Tĩnh bắt đầu bùng nổ từ ngày Quốc tế Lao động 1/5/1930 với các cuộc biểu tình rầm rộ của công nhân Vinh – Bến Thủy và nông dân các huyện lân cận (tr. 58).',
  'C1-13': 'Giai đoạn 1932–1935 là thời kỳ toàn Đảng đấu tranh kiên cường để khôi phục hệ thống tổ chức và phong trào cách mạng sau sự khủng bố trắng của kẻ thù (tr. 64).',
  'C1-17': 'Chiến tranh thế giới thứ hai bùng nổ vào tháng 9 năm 1939 khi phát xít Đức tấn công Ba Lan, tác động trực tiếp và sâu sắc đến tình hình Đông Dương (tr. 75).',
  'C1-21': 'Hội nghị Trung ương 8 (5/1941) tại Pác Bó xác định hình thức chính quyền sau cách mạng là Chính phủ Việt Nam Dân chủ Cộng hòa, đại diện cho toàn thể quốc dân (tr. 88).',
  'C1-22': 'Nội dung B sai vì tại Hội nghị TW 8 (5/1941), Đảng chủ trương tạm gác khẩu hiệu "đánh đổ địa chủ, chia ruộng đất cho dân cày", chỉ tịch thu ruộng đất của đế quốc và Việt gian chia cho dân cày nghèo (tr. 89).',
  'C2-1': 'Ngay sau Cách mạng Tháng Tám 1945, nước Việt Nam Dân chủ Cộng hòa rơi vào tình thế "ngàn cân treo sợi tóc" trước sự bao vây của thù trong giặc ngoài (quân Tưởng, quân Anh, Pháp, Nhật, giặc đói, giặc dốt, tài chính kiệt quệ).',
  'C2-2': 'Sau CMT8 đến 1954, kẻ thù chính, nguy hiểm nhất và trực tiếp nhất của nhân dân Việt Nam là thực dân Pháp xâm lược (tr. 102).',
  'C2-7': 'Ngày 12/12/1946, Ban Thường vụ Trung ương Đảng ra Chỉ thị "Toàn dân kháng chiến"; đến đêm 19/12/1946 Chủ tịch Hồ Chí Minh mới phát động "Lời kêu gọi Toàn quốc kháng chiến" (tr. 115).',
  'C2-9': 'Mục tiêu của cuộc Toàn quốc kháng chiến chống Pháp là đánh phản động thực dân Pháp xâm lược, giành thống nhất và độc lập dân tộc (tr. 117).',
  'C2-10': 'Đường lối kháng chiến chống Pháp chỉ rõ triển vọng: "mặc dù lâu dài, gian khổ, khó khăn song nhất định thắng lợi" (tr. 118).',
  'C2-11': 'Đại hội II (2/1951) xác định con đường đi lên CNXH ở Việt Nam là một quá trình đấu tranh lâu dài, đại thể trải qua 3 giai đoạn: hoàn thành giải phóng dân tộc; xóa bỏ tàn tích phong kiến; xây dựng cơ sở CNXH (tr. 135).',
  'C2-12': 'Đại hội II của Đảng (2/1951 tại Tuyên Quang) được mệnh danh là "Đại hội kháng chiến thắng lợi", đưa Đảng ra hoạt động công khai với tên gọi Đảng Lao động Việt Nam (tr. 136).',
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

// 2. 50 NEW HIGH-YIELD QUESTIONS FOR EXPANDED QUESTION BANK
const EXTRA_QUESTIONS = [
  // Nhập môn (C0-1 đến C0-6)
  {
    id: 'C0-1',
    chapter: 0,
    chapterName: 'Nhập môn Lịch sử Đảng',
    question: 'Đối tượng nghiên cứu của môn học Lịch sử Đảng Cộng sản Việt Nam là gì?',
    options: [
      { id: 'A', text: 'Toàn bộ tiến trình lịch sử dựng nước và giữ nước của dân tộc Việt Nam từ thời Hùng Vương' },
      { id: 'B', text: 'Sự ra đời, phát triển và hoạt động lãnh đạo của Đảng qua các thời kỳ lịch sử' },
      { id: 'C', text: 'Chỉ nghiên cứu hệ thống văn kiện và các kỳ Đại hội toàn quốc của Đảng' },
      { id: 'D', text: 'Quá trình hoạt động quốc tế của các đảng cộng sản và công nhân trên thế giới' }
    ],
    answer: 'B',
    explanation: 'Đối tượng nghiên cứu của Lịch sử Đảng là sự ra đời, phát triển và hoạt động lãnh đạo của Đảng qua các thời kỳ lịch sử, làm sáng tỏ các quy luật và bài học kinh nghiệm.',
    source: 'Giáo trình 2021, Nhập môn, tr. 7-10',
    tags: ['Nhập môn', 'Đối tượng']
  },
  {
    id: 'C0-2',
    chapter: 0,
    chapterName: 'Nhập môn Lịch sử Đảng',
    question: 'Chức năng nào được coi là chức năng hàng đầu của khoa học Lịch sử Đảng Cộng sản Việt Nam?',
    options: [
      { id: 'A', text: 'Chức năng nhận thức' },
      { id: 'B', text: 'Chức năng phê phán' },
      { id: 'C', text: 'Chức năng dự báo' },
      { id: 'D', text: 'Chức năng giải trí' }
    ],
    answer: 'A',
    explanation: 'Chức năng nhận thức là chức năng hàng đầu, cung cấp tri thức khoa học, đầy đủ, có hệ thống về sự ra đời và quá trình lãnh đạo cách mạng của Đảng.',
    source: 'Giáo trình 2021, Nhập môn, tr. 11',
    tags: ['Nhập môn', 'Chức năng']
  },
  {
    id: 'C0-3',
    chapter: 0,
    chapterName: 'Nhập môn Lịch sử Đảng',
    question: 'Phương pháp nghiên cứu cơ bản, chủ yếu và đặc thù của khoa học Lịch sử Đảng là sự kết hợp giữa:',
    options: [
      { id: 'A', text: 'Phương pháp diễn dịch và phương pháp quy nạp' },
      { id: 'B', text: 'Phương pháp lịch sử và phương pháp logic' },
      { id: 'C', text: 'Phương pháp thống kê và phương pháp phỏng vấn sâu' },
      { id: 'D', text: 'Phương pháp phân tích định lượng và thực nghiệm mô hình' }
    ],
    answer: 'B',
    explanation: 'Phương pháp lịch sử (tái hiện sự kiện theo trình tự thời gian) kết hợp chặt chẽ với phương pháp logic (khái quát bản chất, quy luật) là phương pháp cơ bản của môn học.',
    source: 'Giáo trình 2021, Nhập môn, tr. 12-14',
    tags: ['Nhập môn', 'Phương pháp']
  },
  {
    id: 'C0-4',
    chapter: 0,
    chapterName: 'Nhập môn Lịch sử Đảng',
    question: 'Khoa học Lịch sử Đảng Cộng sản Việt Nam có bao nhiêu chức năng cơ bản?',
    options: [
      { id: 'A', text: '2 chức năng (Nhận thức, Giáo dục)' },
      { id: 'B', text: '3 chức năng (Nhận thức, Giáo dục, Dự báo)' },
      { id: 'C', text: '4 chức năng (Nhận thức, Giáo dục, Dự báo, Phê phán)' },
      { id: 'D', text: '5 chức năng' }
    ],
    answer: 'C',
    explanation: 'Khoa học Lịch sử Đảng có 4 chức năng cơ bản: Chức năng nhận thức, Chức năng giáo dục, Chức năng dự báo, và Chức năng phê phán.',
    source: 'Giáo trình 2021, Nhập môn, tr. 11-12',
    tags: ['Nhập môn', 'Chức năng']
  },
  {
    id: 'C0-5',
    chapter: 0,
    chapterName: 'Nhập môn Lịch sử Đảng',
    question: 'Để đủ điều kiện dự thi kết thúc học phần VNR202 tại Đại học FPT, sinh viên bắt buộc phải hoàn thành điều kiện tiên quyết nào?',
    options: [
      { id: 'A', text: 'Tham gia đầy đủ 100% các buổi sinh hoạt chuyên đề ngoại khóa' },
      { id: 'B', text: 'Hoàn thành khóa học trực tuyến môn Lịch sử ĐCSVN trên nền tảng Coursera và có chứng chỉ' },
      { id: 'C', text: 'Xuất bản một bài nghiên cứu khoa học về đề tài lịch sử' },
      { id: 'D', text: 'Đạt điểm tối đa trong bài kiểm tra giữa kỳ tại lớp' }
    ],
    answer: 'B',
    explanation: 'Theo đề cương môn học VNR202 của Đại học FPT (tl.md mục 12), sinh viên bắt buộc phải hoàn thành khóa học trực tuyến trên nền tảng Coursera và có chứng chỉ để đủ điều kiện dự thi cuối kỳ.',
    source: 'Đề cương môn học VNR202, Đại học FPT (tl.md)',
    tags: ['Nhập môn', 'FPT', 'Coursera']
  },
  {
    id: 'C0-6',
    chapter: 0,
    chapterName: 'Nhập môn Lịch sử Đảng',
    question: 'Nguyên tắc phương pháp luận hàng đầu khi nghiên cứu, học tập Lịch sử Đảng là bảo đảm sự thống nhất giữa:',
    options: [
      { id: 'A', text: 'Tính lý luận và tính cảm tính' },
      { id: 'B', text: 'Tính đảng và tính khoa học' },
      { id: 'C', text: 'Tính dân tộc và tính giai cấp' },
      { id: 'D', text: 'Tính truyền thống và tính hiện đại' }
    ],
    answer: 'B',
    explanation: 'Tính đảng và tính khoa học thống nhất hữu cơ với nhau: Đứng vững trên lập trường của giai cấp công nhân để tôn trọng sự thật lịch sử khách quan.',
    source: 'Giáo trình 2021, Nhập môn, tr. 13',
    tags: ['Nhập môn', 'Phương pháp luận']
  },

  // Bổ sung Chương 1 (C1-23 đến C1-36)
  {
    id: 'C1-23',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Hiệp ước nào triều đình nhà Nguyễn ký với thực dân Pháp chính thức thừa nhận quyền bảo hộ của Pháp trên toàn bộ đất nước Việt Nam?',
    options: [
      { id: 'A', text: 'Hiệp ước Nhâm Tuất (1862)' },
      { id: 'B', text: 'Hiệp ước Giáp Tuất (1874)' },
      { id: 'C', text: 'Hiệp ước Hác-măng (1883) và Pa-tơ-nốt (1884)' },
      { id: 'D', text: 'Hiệp ước Thiên Tân (1885)' }
    ],
    answer: 'C',
    explanation: 'Hiệp ước Hác-măng (1883) và Pa-tơ-nốt (1884) đánh dấu sự đầu hàng hoàn toàn của triều Nguyễn, biến nước ta thành thuộc địa nửa phong kiến.',
    source: 'Giáo trình 2021, Chương 1, tr. 19',
    tags: ['Chương 1', 'Bối cảnh']
  },
  {
    id: 'C1-24',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Khởi nghĩa Hương Khê (1885–1896) do ai lãnh đạo, là đỉnh cao tiêu biểu nhất của phong trào Cần Vương?',
    options: [
      { id: 'A', text: 'Phan Đình Phùng và Cao Thắng' },
      { id: 'B', text: 'Đinh Công Tráng và Phạm Bành' },
      { id: 'C', text: 'Nguyễn Thiện Thuật' },
      { id: 'D', text: 'Hoàng Hoa Thám' }
    ],
    answer: 'A',
    explanation: 'Khởi nghĩa Hương Khê (1885–1896) do Phan Đình Phùng và Cao Thắng lãnh đạo tại Hà Tĩnh, là cuộc khởi nghĩa có quy mô lớn nhất và tiêu biểu nhất của phong trào Cần Vương.',
    source: 'Giáo trình 2021, Chương 1, tr. 20',
    tags: ['Chương 1', 'Phong trào yêu nước']
  },
  {
    id: 'C1-25',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Khác biệt căn bản trong con đường cứu nước của Phan Bội Châu so với Phan Châu Trinh đầu thế kỷ XX là gì?',
    options: [
      { id: 'A', text: 'Phan Bội Châu chủ trương bạo động vũ trang và dựa vào Nhật; Phan Châu Trinh chủ trương cải cách "Khai dân trí, chấn dân khí, hậu dân sinh"' },
      { id: 'B', text: 'Phan Bội Châu chủ trương dựa vào Pháp; Phan Châu Trinh chủ trương dựa vào Nga' },
      { id: 'C', text: 'Phan Bội Châu theo khuynh hướng vô sản; Phan Châu Trinh theo khuynh hướng phong kiến' },
      { id: 'D', text: 'Cả hai đều chủ trương chỉ đấu tranh trên lĩnh vực văn hóa' }
    ],
    answer: 'A',
    explanation: 'Phan Bội Châu chủ trương bạo động vũ trang đánh Pháp (phong trào Đông Du); trong khi Phan Châu Trinh chủ trương cải cách duy tân hòa bình dựa vào Pháp để đánh đổ phong kiến hủ bại.',
    source: 'Giáo trình 2021, Chương 1, tr. 21-22',
    tags: ['Chương 1', 'Nhân vật']
  },
  {
    id: 'C1-26',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Cuộc khởi nghĩa Yên Bái (2/1930) do tổ chức chính trị nào lãnh đạo với khẩu hiệu nổi tiếng "Không thành công cũng thành nhân"?',
    options: [
      { id: 'A', text: 'Tân Việt Cách mạng Đảng' },
      { id: 'B', text: 'Việt Nam Quốc dân Đảng (Nguyễn Thái Học)' },
      { id: 'C', text: 'Hội Việt Nam Cách mạng Thanh niên' },
      { id: 'D', text: 'Đông Dương Cộng sản Đảng' }
    ],
    answer: 'B',
    explanation: 'Việt Nam Quốc dân Đảng do Nguyễn Thái Học lãnh đạo đã phát động khởi nghĩa Yên Bái (9/2/1930). Thất bại của khởi nghĩa này đánh dấu sự phá sản hoàn toàn của khuynh hướng dân chủ tư sản.',
    source: 'Giáo trình 2021, Chương 1, tr. 23',
    tags: ['Chương 1', 'Việt Nam Quốc dân Đảng']
  },
  {
    id: 'C1-27',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Năm 1925, Nguyễn Ái Quốc đã xuất bản tác phẩm nào tại Pháp vạch trần tội ác dã man của thực dân Pháp đối với các dân tộc thuộc địa?',
    options: [
      { id: 'A', text: 'Bản án chế độ thực dân Pháp' },
      { id: 'B', text: 'Đường Kách mệnh' },
      { id: 'C', text: 'Con rồng tre' },
      { id: 'D', text: 'Yêu sách của nhân dân An Nam' }
    ],
    answer: 'A',
    explanation: 'Năm 1925, tác phẩm "Bản án chế độ thực dân Pháp" (Le Procès de la colonisation française) của Nguyễn Ái Quốc được xuất bản tại Paris, gây tiếng vang lớn trên thế giới.',
    source: 'Giáo trình 2021, Chương 1, tr. 28',
    tags: ['Chương 1', 'Hồ Chí Minh', 'Tác phẩm']
  },
  {
    id: 'C1-28',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Chủ trương "Vô sản hóa" (1928) của Hội Việt Nam Cách mạng Thanh niên nhằm mục đích chính là gì?',
    options: [
      { id: 'A', text: 'Đưa hội viên vào các nhà máy, hầm mỏ cùng lao động để truyền bá chủ nghĩa Mác – Lênin và rèn luyện lập trường giai cấp' },
      { id: 'B', text: 'Tịch thu toàn bộ tài sản của tư sản để lập quỹ cách mạng' },
      { id: 'C', text: 'Buộc mọi hội viên phải gia nhập công đoàn quốc tế' },
      { id: 'D', text: 'Kêu gọi công nhân tổng bãi công trên toàn quốc ngay lập tức' }
    ],
    answer: 'A',
    explanation: 'Phong trào Vô sản hóa (1928) đưa cán bộ cách mạng thâm nhập sâu vào các trung tâm công nghiệp để tuyên truyền giác ngộ giai cấp công nhân và thúc đẩy phong trào công nhân phát triển tự giác.',
    source: 'Giáo trình 2021, Chương 1, tr. 32',
    tags: ['Chương 1', 'Thanh niên', 'Vô sản hóa']
  },
  {
    id: 'C1-29',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Tại Hội nghị hợp nhất thành lập Đảng (đầu năm 1930), Nguyễn Ái Quốc tham dự với tư cách gì?',
    options: [
      { id: 'A', text: 'Đại biểu đại diện cho An Nam Cộng sản Đảng' },
      { id: 'B', text: 'Đại biểu đại diện cho Đông Dương Cộng sản Đảng' },
      { id: 'C', text: 'Phái viên của Quốc tế Cộng sản có đầy đủ quyền quyết định việc hợp nhất' },
      { id: 'D', text: 'Quan sát viên danh dự của Đảng Cộng sản Pháp' }
    ],
    answer: 'C',
    explanation: 'Nguyễn Ái Quốc chủ trì Hội nghị với tư cách là phái viên của Quốc tế Cộng sản, có uy tín tuyệt đối và quyền hạn cao nhất để thống nhất các tổ chức cộng sản đang chia rẽ.',
    source: 'Giáo trình 2021, Chương 1, tr. 38',
    tags: ['Chương 1', 'Hội nghị thành lập Đảng']
  },
  {
    id: 'C1-30',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Những tổ chức cộng sản nào đã trực tiếp cử đại biểu tham dự Hội nghị hợp nhất thành lập Đảng vào đầu năm 1930?',
    options: [
      { id: 'A', text: 'Đông Dương Cộng sản Đảng và An Nam Cộng sản Đảng' },
      { id: 'B', text: 'Đông Dương Cộng sản Đảng và Đông Dương Cộng sản Liên đoàn' },
      { id: 'C', text: 'An Nam Cộng sản Đảng và Đông Dương Cộng sản Liên đoàn' },
      { id: 'D', text: 'Cả ba tổ chức cộng sản đều có đại biểu dự họp ngay từ đầu' }
    ],
    answer: 'A',
    explanation: 'Hội nghị ban đầu chỉ gồm đại biểu của Đông Dương CSĐ (Trịnh Đình Cửu, Nguyễn Đức Cảnh) và An Nam CSĐ (Châu Văn Liêm, Nguyễn Thiệu). Đông Dương CS Liên đoàn gia nhập sau đó vào ngày 24/2/1930.',
    source: 'Giáo trình 2021, Chương 1, tr. 38-39',
    tags: ['Chương 1', 'Hội nghị thành lập Đảng']
  },
  {
    id: 'C1-31',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Tác phẩm "Vấn đề dân cày" (1938) xuất bản công khai trong thời kỳ Mặt trận Dân chủ do hai đồng chí nào biên soạn dưới bút danh Qua Ninh và Vân Đình?',
    options: [
      { id: 'A', text: 'Trường Chinh và Võ Nguyên Giáp' },
      { id: 'B', text: 'Nguyễn Văn Cừ và Hà Huy Tập' },
      { id: 'C', text: 'Trần Phú và Lê Hồng Phong' },
      { id: 'D', text: 'Phạm Văn Đồng và Hoàng Văn Thụ' }
    ],
    answer: 'A',
    explanation: 'Tác phẩm "Vấn đề dân cày" do Qua Ninh (Trường Chinh) và Vân Đình (Võ Nguyên Giáp) biên soạn, phân tích sâu sắc thực trạng bóc lột nông dân ở Đông Dương.',
    source: 'Giáo trình 2021, Chương 1, tr. 71',
    tags: ['Chương 1', 'Tác phẩm', 'Mặt trận Dân chủ']
  },
  {
    id: 'C1-32',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Tác phẩm "Tự chỉ trích" (7/1939) nhằm uốn nắn các lệch lạc tư tưởng và củng cố sự đoàn kết thống nhất trong nội bộ Đảng do ai viết?',
    options: [
      { id: 'A', text: 'Trần Phú' },
      { id: 'B', text: 'Hà Huy Tập' },
      { id: 'C', text: 'Nguyễn Văn Cừ' },
      { id: 'D', text: 'Lê Hồng Phong' }
    ],
    answer: 'C',
    explanation: 'Tổng Bí thư Nguyễn Văn Cừ là tác giả cuốn "Tự chỉ trích" (7/1939), nêu cao tinh thần tự phê bình và phê bình trong Đảng.',
    source: 'Giáo trình 2021, Chương 1, tr. 73',
    tags: ['Chương 1', 'Nguyễn Văn Cừ', 'Tác phẩm']
  },
  {
    id: 'C1-33',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Đề cương về văn hóa Việt Nam (1943) do đồng chí Trường Chinh khởi thảo xác định ba nguyên tắc vận động của nền văn hóa mới là:',
    options: [
      { id: 'A', text: 'Dân tộc hóa, Đại chúng hóa, Khoa học hóa' },
      { id: 'B', text: 'Cách mạng hóa, Hiện đại hóa, Quốc tế hóa' },
      { id: 'C', text: 'Tiên tiến, Đậm đà bản sắc, Đại chúng' },
      { id: 'D', text: 'Yêu nước, Đoàn kết, Nhân đạo' }
    ],
    answer: 'A',
    explanation: 'Đề cương về văn hóa Việt Nam năm 1943 khẳng định 3 nguyên tắc nền tảng xây dựng nền văn hóa mới: Dân tộc hóa, Đại chúng hóa và Khoa học hóa.',
    source: 'Giáo trình 2021, Chương 1, tr. 82',
    tags: ['Chương 1', 'Văn hóa', 'Trường Chinh']
  },
  {
    id: 'C1-34',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Đội Việt Nam Tuyên truyền Giải phóng quân được thành lập vào ngày tháng năm nào, gồm bao nhiêu chiến sĩ ban đầu?',
    options: [
      { id: 'A', text: '22/12/1944, gồm 34 chiến sĩ (do Võ Nguyên Giáp chỉ huy)' },
      { id: 'B', text: '19/8/1945, gồm 100 chiến sĩ' },
      { id: 'C', text: '15/5/1945, gồm 50 chiến sĩ' },
      { id: 'D', text: '2/9/1945, gồm 34 chiến sĩ' }
    ],
    answer: 'A',
    explanation: 'Ngày 22/12/1944, tại khu rừng Sam Cao (Nguyên Bình, Cao Bằng), Đội Việt Nam Tuyên truyền Giải phóng quân gồm 34 chiến sĩ được thành lập theo chỉ thị của Hồ Chí Minh.',
    source: 'Giáo trình 2021, Chương 1, tr. 85',
    tags: ['Chương 1', 'Quân sự', 'Võ Nguyên Giáp']
  },
  {
    id: 'C1-35',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Bốn tỉnh giành được chính quyền sớm nhất cả nước trong Cách mạng Tháng Tám năm 1945 (vào ngày 18/8/1945) là:',
    options: [
      { id: 'A', text: 'Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam' },
      { id: 'B', text: 'Hà Nội, Huế, Sài Gòn, Hải Phòng' },
      { id: 'C', text: 'Cao Bằng, Bắc Kạn, Lạng Sơn, Thái Nguyên' },
      { id: 'D', text: 'Tuyên Quang, Phú Thọ, Quảng Ngãi, Mỹ Tho' }
    ],
    answer: 'A',
    explanation: 'Bắc Giang, Hải Dương, Hà Tĩnh và Quảng Nam là 4 tỉnh giành chính quyền ở tỉnh lỵ sớm nhất cả nước vào ngày 18/8/1945.',
    source: 'Giáo trình 2021, Chương 1, tr. 94',
    tags: ['Chương 1', 'Cách mạng Tháng Tám']
  },
  {
    id: 'C1-36',
    chapter: 1,
    chapterName: 'Chương 1: 1930 – 1945',
    question: 'Vua Bảo Đại tuyên bố thoái vị tại Ngọ Môn (Huế) vào ngày 30/8/1945 với câu nói nổi tiếng nào?',
    options: [
      { id: 'A', text: '"Thà làm dân một nước độc lập hơn làm vua một nước nô lệ"' },
      { id: 'B', text: '"Nước Việt Nam là một, dân tộc Việt Nam là một"' },
      { id: 'C', text: '"Không có gì quý hơn độc lập tự do"' },
      { id: 'D', text: '"Giang sơn gấm vóc xin trao lại cho nhân dân"' }
    ],
    answer: 'A',
    explanation: 'Chiều 30/8/1945, tại cửa Ngọ Môn, vua Bảo Đại đọc Chiếu thoái vị và tuyên bố: "Trẫm thà làm dân một nước độc lập hơn làm vua một nước nô lệ", chấm dứt chế độ phong kiến ngàn năm.',
    source: 'Giáo trình 2021, Chương 1, tr. 95',
    tags: ['Chương 1', 'Bảo Đại', 'Cách mạng Tháng Tám']
  },

  // Bổ sung Chương 2 (C2-36 đến C2-50)
  {
    id: 'C2-36',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Để giải quyết nạn mù chữ cấp bách sau Cách mạng Tháng Tám 1945, Chủ tịch Hồ Chí Minh đã ký sắc lệnh thành lập cơ quan nào vào ngày 8/9/1945?',
    options: [
      { id: 'A', text: 'Hội Truyền bá Quốc ngữ' },
      { id: 'B', text: 'Nha Bình dân học vụ (Sắc lệnh số 17-SL)' },
      { id: 'C', text: 'Bộ Giáo dục Quốc dân' },
      { id: 'D', text: 'Ủy ban Chống mù chữ toàn quốc' }
    ],
    answer: 'B',
    explanation: 'Ngày 8/9/1945, Chủ tịch Hồ Chí Minh ký Sắc lệnh số 17-SL thành lập Nha Bình dân học vụ, phát động phong trào xóa mù chữ quy mô lớn trên toàn quốc.',
    source: 'Giáo trình 2021, Chương 2, tr. 104',
    tags: ['Chương 2', 'Bình dân học vụ']
  },
  {
    id: 'C2-37',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Cuộc Tổng tuyển cử đầu tiên bầu Quốc hội khóa I của nước Việt Nam Dân chủ Cộng hòa diễn ra vào ngày tháng năm nào?',
    options: [
      { id: 'A', text: '2/9/1945' },
      { id: 'B', text: '6/1/1946' },
      { id: 'C', text: '25/4/1976' },
      { id: 'D', text: '19/12/1946' }
    ],
    answer: 'B',
    explanation: 'Ngày 6/1/1946, nhân dân cả nước hăng hái đi bỏ phiếu bầu ra 333 đại biểu Quốc hội khóa I, khẳng định tính hợp pháp, chính thống của Nhà nước VNDCCH.',
    source: 'Giáo trình 2021, Chương 2, tr. 106',
    tags: ['Chương 2', 'Tổng tuyển cử 1946']
  },
  {
    id: 'C2-38',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Tác phẩm "Kháng chiến nhất định thắng lợi" (1947) giải thích đường lối kháng chiến toàn dân, toàn diện, trường kỳ của Đảng do ai soạn thảo?',
    options: [
      { id: 'A', text: 'Hồ Chí Minh' },
      { id: 'B', text: 'Trường Chinh' },
      { id: 'C', text: 'Võ Nguyên Giáp' },
      { id: 'D', text: 'Phạm Văn Đồng' }
    ],
    answer: 'B',
    explanation: 'Đồng chí Trường Chinh là tác giả tác phẩm "Kháng chiến nhất định thắng lợi" (xuất bản 9/1947), luận giải đầy đủ đường lối kháng chiến chống thực dân Pháp.',
    source: 'Giáo trình 2021, Chương 2, tr. 120',
    tags: ['Chương 2', 'Trường Chinh', 'Tác phẩm']
  },
  {
    id: 'C2-39',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Chiến dịch nào trong kháng chiến chống Pháp là chiến dịch tiến công lớn đầu tiên của bộ đội chủ lực ta, khai thông biên giới Việt – Trung?',
    options: [
      { id: 'A', text: 'Chiến dịch Việt Bắc Thu Đông (1947)' },
      { id: 'B', text: 'Chiến dịch Biên giới Thu Đông (1950)' },
      { id: 'C', text: 'Chiến dịch Hòa Bình (1951)' },
      { id: 'D', text: 'Chiến dịch Tây Bắc (1952)' }
    ],
    answer: 'B',
    explanation: 'Chiến dịch Biên giới Thu Đông 1950 là chiến dịch tiến công lớn đầu tiên do ta chủ động mở, đập tan hành lang Đông – Tây của Pháp, khai thông biên giới với các nước XHCN.',
    source: 'Giáo trình 2021, Chương 2, tr. 126',
    tags: ['Chương 2', 'Chiến dịch Biên giới']
  },
  {
    id: 'C2-40',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Đại hội đại biểu toàn quốc lần thứ II của Đảng (2/1951 tại Tuyên Quang) đã quyết định đổi tên Đảng thành gì?',
    options: [
      { id: 'A', text: 'Đảng Cộng sản Đông Dương' },
      { id: 'B', text: 'Đảng Lao động Việt Nam' },
      { id: 'C', text: 'Đảng Cộng sản Việt Nam' },
      { id: 'D', text: 'Mặt trận Liên Việt' }
    ],
    answer: 'B',
    explanation: 'Đại hội II (2/1951) quyết định tách Đảng Cộng sản Đông Dương để thành lập ở mỗi nước một đảng riêng; ở Việt Nam Đảng ra hoạt động công khai lấy tên là Đảng Lao động Việt Nam.',
    source: 'Giáo trình 2021, Chương 2, tr. 132',
    tags: ['Chương 2', 'Đại hội II', 'Đổi tên Đảng']
  },
  {
    id: 'C2-41',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Kế hoạch quân sự Nava do thực dân Pháp và can thiệp Mỹ đề ra năm 1953 nhằm mục đích chính là gì?',
    options: [
      { id: 'A', text: 'Xoay chuyển cục diện chiến tranh, hy vọng trong 18 tháng giành lấy thắng lợi quyết định để kết thúc chiến tranh trong danh dự' },
      { id: 'B', text: 'Rút quân Pháp về nước ngay lập tức để bảo toàn lực lượng' },
      { id: 'C', text: 'Mở rộng chiến tranh xâm lược sang toàn bộ khu vực Đông Nam Á' },
      { id: 'D', text: 'Tập trung toàn bộ binh lực đánh chiếm vùng đồng bằng sông Cửu Long' }
    ],
    answer: 'A',
    explanation: 'Kế hoạch Nava (5/1953) là nỗ lực cao nhất của Pháp và Mỹ nhằm xoay chuyển cục diện chiến tranh Đông Dương trong vòng 18 tháng để tìm một lối thoát danh dự.',
    source: 'Giáo trình 2021, Chương 2, tr. 142',
    tags: ['Chương 2', 'Kế hoạch Nava']
  },
  {
    id: 'C2-42',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Chiến dịch Điện Biên Phủ lịch sử (1954) diễn ra qua bao nhiêu đợt tiến công của quân ta?',
    options: [
      { id: 'A', text: '2 đợt' },
      { id: 'B', text: '3 đợt tiến công (Đợt 1: 13-17/3; Đợt 2: 30/3-30/4; Đợt 3: 1-7/5/1954)' },
      { id: 'C', text: '4 đợt' },
      { id: 'D', text: '5 đợt' }
    ],
    answer: 'B',
    explanation: 'Chiến dịch Điện Biên Phủ diễn ra qua 3 đợt tiến công liên tục suốt 56 ngày đêm (từ 13/3 đến 7/5/1954) tiêu diệt hoàn toàn tập đoàn cứ điểm mạnh nhất Đông Dương.',
    source: 'Giáo trình 2021, Chương 2, tr. 146',
    tags: ['Chương 2', 'Điện Biên Phủ']
  },
  {
    id: 'C2-43',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Tướng chỉ huy tập đoàn cứ điểm Điện Biên Phủ của thực dân Pháp đã bị bắt sống và đầu hàng vào lúc 17h30 ngày 7/5/1954 là ai?',
    options: [
      { id: 'A', text: 'Tướng Đờ Cát-xtơ-ri (De Castries)' },
      { id: 'B', text: 'Tướng Na-va (Navarre)' },
      { id: 'C', text: 'Tướng Xa-lăng (Salan)' },
      { id: 'D', text: 'Tướng Lơ-cléc (Leclerc)' }
    ],
    answer: 'A',
    explanation: 'Đúng 17h30 ngày 7/5/1954, toàn bộ cơ quan chỉ huy của tập đoàn cứ điểm Điện Biên Phủ do tướng Đờ Cát-xtơ-ri đứng đầu bị quân ta bắt sống.',
    source: 'Giáo trình 2021, Chương 2, tr. 148',
    tags: ['Chương 2', 'Điện Biên Phủ']
  },
  {
    id: 'C2-44',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Tác phẩm "Đề cương cách mạng miền Nam" (8/1956) đặt nền móng lý luận cho phong trào cách mạng giải phóng miền Nam do đồng chí nào khởi thảo?',
    options: [
      { id: 'A', text: 'Lê Duẩn' },
      { id: 'B', text: 'Nguyễn Văn Linh' },
      { id: 'C', text: 'Phạm Hùng' },
      { id: 'D', text: 'Võ Văn Kiệt' }
    ],
    answer: 'A',
    explanation: 'Bí thư Xứ ủy Nam Bộ Lê Duẩn đã khởi thảo tác phẩm "Đề cương cách mạng miền Nam" (8/1956) tại Sài Gòn, định hướng con đường bạo lực cách mạng giải phóng miền Nam.',
    source: 'Giáo trình 2021, Chương 2, tr. 165',
    tags: ['Chương 2', 'Lê Duẩn', 'Đề cương miền Nam']
  },
  {
    id: 'C2-45',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Chiến thắng quân sự nào của quân dân ta ở Quảng Ngãi (8/1965) mở đầu cao trào "Tìm Mỹ mà đánh, lùng ngụy mà diệt", được coi là trận "Ấp Bắc đối với quân Mỹ"?',
    options: [
      { id: 'A', text: 'Chiến thắng Núi Thành' },
      { id: 'B', text: 'Chiến thắng Vạn Tường' },
      { id: 'C', text: 'Chiến thắng Ba Gia' },
      { id: 'D', text: 'Chiến thắng Đồng Xoài' }
    ],
    answer: 'B',
    explanation: 'Trận Vạn Tường (18/8/1965) chứng minh quân dân miền Nam có đầy đủ khả năng đánh thắng quân viễn chinh Mỹ trong Chiến tranh cục bộ.',
    source: 'Giáo trình 2021, Chương 2, tr. 195',
    tags: ['Chương 2', 'Vạn Tường', 'Chiến tranh cục bộ']
  },
  {
    id: 'C2-46',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Cuộc Tổng tiến công và nổi dậy Tết Mậu Thân 1968 có ý nghĩa chiến lược quan trọng nhất là gì?',
    options: [
      { id: 'A', text: 'Giải phóng hoàn toàn các đô thị lớn ở miền Nam' },
      { id: 'B', text: 'Làm phá sản chiến lược "Chiến tranh cục bộ", buộc Mỹ phải tuyên bố "phi Mỹ hóa" chiến tranh và chấp nhận ngồi vào bàn đàm phán Paris' },
      { id: 'C', text: 'Lật đổ chính quyền Việt Nam Cộng hòa của Nguyễn Văn Thiệu' },
      { id: 'D', text: 'Buộc toàn bộ lính Mỹ rút khỏi miền Nam ngay trong năm 1968' }
    ],
    answer: 'B',
    explanation: 'Tết Mậu Thân 1968 giáng đòn bất ngờ vào trung tâm sào huyệt của đối phương, làm lung lay ý chí xâm lược của chính quyền Washington, mở ra cục diện vừa đánh vừa đàm.',
    source: 'Giáo trình 2021, Chương 2, tr. 199',
    tags: ['Chương 2', 'Tết Mậu Thân 1968']
  },
  {
    id: 'C2-47',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Trận quyết chiến trên không 12 ngày đêm cuối tháng 12 năm 1972 đập tan cuộc tập kích chiến lược B-52 của Mỹ vào Hà Nội, Hải Phòng được mệnh danh là:',
    options: [
      { id: 'A', text: '"Chiến dịch Đường 9 – Nam Lào"' },
      { id: 'B', text: '"Điện Biên Phủ trên không"' },
      { id: 'C', text: '"Sấm rền trên bầu trời"' },
      { id: 'D', text: '"Chiến dịch Linebacker II thất bại"' }
    ],
    answer: 'B',
    explanation: 'Thắng lợi "Điện Biên Phủ trên không" (18–29/12/1972) bắn rơi 81 máy bay Mỹ (trong đó có 34 B-52), đập tan tối hậu thư của Ních-xơn, buộc Mỹ phải ký Hiệp định Pari.',
    source: 'Giáo trình 2021, Chương 2, tr. 210',
    tags: ['Chương 2', 'Điện Biên Phủ trên không']
  },
  {
    id: 'C2-48',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Trong cuộc Tổng tiến công và nổi dậy mùa Xuân 1975, ba chiến dịch tiến công đòn bẩy chiến lược lần lượt diễn ra là:',
    options: [
      { id: 'A', text: 'Chiến dịch Tây Nguyên → Chiến dịch Huế – Đà Nẵng → Chiến dịch Hồ Chí Minh' },
      { id: 'B', text: 'Chiến dịch Trị Thiên → Chiến dịch Tây Nguyên → Chiến dịch Sài Gòn' },
      { id: 'C', text: 'Chiến dịch Buôn Ma Thuột → Chiến dịch Phước Long → Chiến dịch Hồ Chí Minh' },
      { id: 'D', text: 'Chiến dịch Tây Nguyên → Chiến dịch Xuân Lộc → Chiến dịch Hồ Chí Minh' }
    ],
    answer: 'A',
    explanation: 'Cuộc Tổng tiến công và nổi dậy mùa Xuân 1975 diễn ra theo chuỗi 3 chiến dịch chiến lược: Chiến dịch Tây Nguyên (4-24/3), Chiến dịch Huế - Đà Nẵng (21-29/3) và đỉnh cao Chiến dịch Hồ Chí Minh (26-30/4).',
    source: 'Giáo trình 2021, Chương 2, tr. 222-226',
    tags: ['Chương 2', 'Đại thắng 1975']
  },
  {
    id: 'C2-49',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Đòn "điểm huyệt" mở màn thắng lợi rực rỡ cho Chiến dịch Tây Nguyên (tháng 3/1975) là trận đánh then chốt vào thị xã nào?',
    options: [
      { id: 'A', text: 'Thị xã Buôn Ma Thuột (ngày 10/3/1975)' },
      { id: 'B', text: 'Thị xã Pleiku' },
      { id: 'C', text: 'Thị xã Kon Tum' },
      { id: 'D', text: 'Thị xã An Lộc' }
    ],
    answer: 'A',
    explanation: 'Đòn tiến công giải phóng Buôn Ma Thuột ngày 10/3/1975 đánh trúng mắt xích hiểm yếu nhất, làm sụp đổ toàn bộ hệ thống phòng thủ của quân ngụy ở Tây Nguyên.',
    source: 'Giáo trình 2021, Chương 2, tr. 223',
    tags: ['Chương 2', 'Buôn Ma Thuột', 'Tây Nguyên']
  },
  {
    id: 'C2-50',
    chapter: 2,
    chapterName: 'Chương 2: 1945 – 1975',
    question: 'Chiến dịch giải phóng Sài Gòn – Gia Định được Bộ Chính trị Trung ương Đảng quyết định mang tên "Chiến dịch Hồ Chí Minh" vào ngày nào?',
    options: [
      { id: 'A', text: '14/4/1975' },
      { id: 'B', text: '26/4/1975' },
      { id: 'C', text: '30/4/1975' },
      { id: 'D', text: '1/5/1975' }
    ],
    answer: 'A',
    explanation: 'Ngày 14/4/1975, Bộ Chính trị gửi bức điện lịch sử đồng ý chiến dịch giải phóng Sài Gòn mang tên "Chiến dịch Hồ Chí Minh".',
    source: 'Giáo trình 2021, Chương 2, tr. 226',
    tags: ['Chương 2', 'Chiến dịch Hồ Chí Minh']
  },

  // Bổ sung Chương 3 (C3-34 đến C3-43)
  {
    id: 'C3-34',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Hội nghị Trung ương 6 khóa IV (tháng 8/1979) đánh dấu bước đột phá đầu tiên tìm tòi đường lối đổi mới kinh tế của Đảng với chủ trương nổi bật nào?',
    options: [
      { id: 'A', text: 'Xóa bỏ ngay lập tức toàn bộ các hợp tác xã nông nghiệp' },
      { id: 'B', text: '"Làm cho sản xuất bung ra", tận dụng năng lực sản xuất của các thành phần kinh tế' },
      { id: 'C', text: 'Tư nhân hóa toàn bộ doanh nghiệp nhà nước' },
      { id: 'D', text: 'Mở cửa hoàn toàn cho các nhà đầu tư nước ngoài' }
    ],
    answer: 'B',
    explanation: 'Hội nghị TW 6 khóa IV (8/1979) là bước đột phá mở đầu quá trình tìm tòi đổi mới, cho phép khắc phục tình trạng ngăn sông cấm chợ, "làm cho sản xuất bung ra".',
    source: 'Giáo trình 2021, Chương 3, tr. 248',
    tags: ['Chương 3', 'Tiền Đổi mới']
  },
  {
    id: 'C3-35',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Chỉ thị số 100-CT/TW (tháng 1/1981) của Ban Bí thư Trung ương Đảng (Khoán 100) đưa ra chủ trương đột phá gì trong nông nghiệp?',
    options: [
      { id: 'A', text: 'Khoán sản phẩm đến nhóm lao động và người lao động trong hợp tác xã nông nghiệp' },
      { id: 'B', text: 'Giao toàn bộ ruộng đất thành sở hữu tư nhân' },
      { id: 'C', text: 'Chuyển đổi toàn bộ đất lúa sang nuôi trồng thủy sản' },
      { id: 'D', text: 'Xóa bỏ các hình thức khoán việc truyền thống' }
    ],
    answer: 'A',
    explanation: 'Chỉ thị 100-CT/TW (Khoán 100, 13/1/1981) gắn trách nhiệm và lợi ích của người lao động trực tiếp với sản phẩm cuối cùng, tạo động lực sản xuất lớn trong nông nghiệp.',
    source: 'Giáo trình 2021, Chương 3, tr. 250',
    tags: ['Chương 3', 'Khoán 100', 'Nông nghiệp']
  },
  {
    id: 'C3-36',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Ba chương trình kinh tế lớn được Đại hội lần thứ VI của Đảng (12/1986) đề ra cho chặng đường đầu tiên của thời kỳ quá độ là:',
    options: [
      { id: 'A', text: 'Lương thực – thực phẩm, Hàng tiêu dùng, Hàng xuất khẩu' },
      { id: 'B', text: 'Công nghiệp nặng, Giao thông vận tải, Năng lượng' },
      { id: 'C', text: 'Cải cách hành chính, Đổi mới giáo dục, Y tế' },
      { id: 'D', text: 'Xóa đói giảm nghèo, Đô thị hóa, Xây dựng nông thôn mới' }
    ],
    answer: 'A',
    explanation: 'Đại hội VI (12/1986) điều chỉnh chiến lược kinh tế, tập trung nguồn lực thực hiện bằng được ba chương trình kinh tế lớn: Lương thực - thực phẩm, Hàng tiêu dùng và Hàng xuất khẩu.',
    source: 'Giáo trình 2021, Chương 3, tr. 268',
    tags: ['Chương 3', 'Đại hội VI', 'Đổi mới']
  },
  {
    id: 'C3-37',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Nghị quyết số 10-NQ/TW (Khoán 10) ngày 5/4/1988 của Bộ Chính trị có nội dung đột phá nào về kinh tế nông nghiệp?',
    options: [
      { id: 'A', text: 'Thừa nhận hộ gia đình là đơn vị kinh tế tự chủ, giao khoán đất ổn định lâu dài' },
      { id: 'B', text: 'Thành lập các nông trường quốc doanh quy mô tập trung' },
      { id: 'C', text: 'Tập trung hóa công tác phân phối lương thực về Nhà nước' },
      { id: 'D', text: 'Cấm chuyển nhượng quyền sử dụng đất nông nghiệp' }
    ],
    answer: 'A',
    explanation: 'Nghị quyết 10 của Bộ Chính trị (Khoán 10, 5/4/1988) khẳng định hộ gia đình là đơn vị kinh tế tự chủ, cởi trói sức sản xuất, đưa Việt Nam từ thiếu đói trở thành nước xuất khẩu gạo.',
    source: 'Giáo trình 2021, Chương 3, tr. 272',
    tags: ['Chương 3', 'Khoán 10', 'Nông nghiệp']
  },
  {
    id: 'C3-38',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Trong Cương lĩnh xây dựng đất nước năm 1991, Đảng xác định con đường đi lên CNXH ở nước ta là quá độ bỏ qua chế độ tư bản chủ nghĩa, nghĩa là:',
    options: [
      { id: 'A', text: 'Bỏ qua việc xác lập vị trí thống trị của quan hệ sản xuất và kiến trúc thượng tầng TBCN' },
      { id: 'B', text: 'Bỏ qua hoàn toàn nền văn minh công nghiệp và thành tựu nhân loại' },
      { id: 'C', text: 'Xóa bỏ ngay lập tức mọi hình thức tư hữu và kinh tế thị trường' },
      { id: 'D', text: 'Đóng cửa nền kinh tế, không giao thương với các nước tư bản' }
    ],
    answer: 'A',
    explanation: 'Quá độ bỏ qua chế độ tư bản chủ nghĩa là bỏ qua việc xác lập vị trí thống trị của QHSX và KTTT TBCN, nhưng tiếp thu, kế thừa những thành tựu mà nhân loại đã đạt được dưới CNTB.',
    source: 'Giáo trình 2021, Chương 3, tr. 288',
    tags: ['Chương 3', 'Cương lĩnh 1991', 'Quá độ']
  },
  {
    id: 'C3-39',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Việt Nam chính thức thiết lập quan hệ ngoại giao và bình thường hóa quan hệ với Hợp chúng quốc Hoa Kỳ vào thời gian nào?',
    options: [
      { id: 'A', text: 'Tháng 7 năm 1995 (ngày 11/7 và 12/7/1995)' },
      { id: 'B', text: 'Tháng 1 năm 2000' },
      { id: 'C', text: 'Tháng 12 năm 1991' },
      { id: 'D', text: 'Tháng 11 năm 2007' }
    ],
    answer: 'A',
    explanation: 'Ngày 11/7/1995 (giờ Mỹ), Tổng thống Bill Clinton tuyên bố bình thường hóa quan hệ; ngày 12/7/1995 (giờ VN), Thủ tướng Võ Văn Kiệt tuyên bố thiết lập quan hệ ngoại giao đầy đủ với Hoa Kỳ.',
    source: 'Giáo trình 2021, Chương 3, tr. 302',
    tags: ['Chương 3', 'Đối ngoại', 'Bình thường hóa']
  },
  {
    id: 'C3-40',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Việt Nam chính thức trở thành thành viên thứ 7 của Hiệp hội các quốc gia Đông Nam Á (ASEAN) vào ngày tháng năm nào?',
    options: [
      { id: 'A', text: '28/7/1995 (tại Hội nghị Bộ trưởng Ngoại giao ASEAN ở Brunei)' },
      { id: 'B', text: '8/8/1995' },
      { id: 'C', text: '11/1/2007' },
      { id: 'D', text: '23/10/1991' }
    ],
    answer: 'A',
    explanation: 'Ngày 28/7/1995, tại Brunei, Việt Nam chính thức gia nhập ASEAN, mở ra kỷ nguyên hội nhập khu vực toàn diện.',
    source: 'Giáo trình 2021, Chương 3, tr. 303',
    tags: ['Chương 3', 'ASEAN', 'Hội nhập']
  },
  {
    id: 'C3-41',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Nghị quyết Trung ương 4 khóa XII (30/10/2016) đã nhận diện và kiên quyết ngăn chặn, đẩy lùi bao nhiêu biểu hiện suy thoái và "tự diễn biến", "tự chuyển hóa"?',
    options: [
      { id: 'A', text: '10 biểu hiện' },
      { id: 'B', text: '18 biểu hiện' },
      { id: 'C', text: '27 biểu hiện (9 tư tưởng chính trị, 9 đạo đức lối sống, 9 tự diễn biến tự chuyển hóa)' },
      { id: 'D', text: '36 biểu hiện' }
    ],
    answer: 'C',
    explanation: 'NQ TW 4 khóa XII chỉ rõ 27 biểu hiện cụ thể suy thoái về tư tưởng chính trị, đạo đức, lối sống và các biểu hiện "tự diễn biến", "tự chuyển hóa" trong nội bộ.',
    source: 'Giáo trình 2021, Chương 3, tr. 352',
    tags: ['Chương 3', 'Xây dựng Đảng', 'NQ TW 4']
  },
  {
    id: 'C3-42',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Cương lĩnh xây dựng đất nước trong thời kỳ quá độ (bổ sung, phát triển năm 2011) xác định xã hội XHCN mà nhân dân ta xây dựng có bao nhiêu đặc trưng cơ bản?',
    options: [
      { id: 'A', text: '6 đặc trưng' },
      { id: 'B', text: '7 đặc trưng' },
      { id: 'C', text: '8 đặc trưng cơ bản' },
      { id: 'D', text: '10 đặc trưng' }
    ],
    answer: 'C',
    explanation: 'Cương lĩnh 2011 xác lập hệ thống 8 đặc trưng của xã hội XHCN ở Việt Nam (so với 6 đặc trưng của Cương lĩnh 1991).',
    source: 'Giáo trình 2021, Chương 3, tr. 338',
    tags: ['Chương 3', 'Cương lĩnh 2011', 'Đặc trưng']
  },
  {
    id: 'C3-43',
    chapter: 3,
    chapterName: 'Chương 3: 1975 – 2018',
    question: 'Cương lĩnh 2011 xác định Nhà nước pháp quyền xã hội chủ nghĩa của nhân dân, do nhân dân, vì nhân dân đặt dưới sự lãnh đạo của ai?',
    options: [
      { id: 'A', text: 'Quốc hội nước CHXHCN Việt Nam' },
      { id: 'B', text: 'Đảng Cộng sản Việt Nam' },
      { id: 'C', text: 'Mặt trận Tổ quốc Việt Nam' },
      { id: 'D', text: 'Tòa án nhân dân tối cao' }
    ],
    answer: 'B',
    explanation: 'Đặc trưng thứ 7 của Cương lĩnh 2011 khẳng định: Có Nhà nước pháp quyền XHCN của nhân dân, do nhân dân, vì nhân dân do Đảng Cộng sản lãnh đạo.',
    source: 'Giáo trình 2021, Chương 3, tr. 339',
    tags: ['Chương 3', 'Nhà nước pháp quyền']
  },

  // Bổ sung Chương Mở rộng (TL-11 đến TL-15)
  {
    id: 'TL-11',
    chapter: 4,
    chapterName: 'Chương mở rộng: 2018 – 2026',
    question: 'Trong công tác đấu tranh phòng, chống tham nhũng, tiêu cực, mục tiêu "4 không" được Tổng Bí thư Nguyễn Phú Trọng nhấn mạnh là:',
    options: [
      { id: 'A', text: 'Không thể, không dám, không muốn, không cần tham nhũng' },
      { id: 'B', text: 'Không vùng cấm, không ngoại lệ, không nể nang, không can thiệp' },
      { id: 'C', text: 'Không chậm trễ, không bao che, không khoan nhượng, không dung thứ' },
      { id: 'D', text: 'Không tố giác, không xử phạt, không thanh tra, không kiểm tra' }
    ],
    answer: 'A',
    explanation: 'Xây dựng cơ chế phòng ngừa chặt chẽ để "không thể tham nhũng", cơ chế răn đe nghiêm khắc để "không dám tham nhũng", giáo dục đạo đức để "không muốn tham nhũng" và chính sách đãi ngộ thỏa đáng để "không cần tham nhũng".',
    source: 'Tác phẩm của TBT Nguyễn Phú Trọng về PCTN, tr. 45-48',
    tags: ['Chương mở rộng', 'PCTN', 'Nguyễn Phú Trọng']
  },
  {
    id: 'TL-12',
    chapter: 4,
    chapterName: 'Chương mở rộng: 2018 – 2026',
    question: 'Đại hội XIII của Đảng (2021) xác định mốc năm 2045 là năm kỷ niệm sự kiện lịch sử trọng đại nào của đất nước?',
    options: [
      { id: 'A', text: 'Kỷ niệm 100 năm thành lập Đảng Cộng sản Việt Nam (1930 – 2030)' },
      { id: 'B', text: 'Kỷ niệm 100 năm thành lập nước Việt Nam Dân chủ Cộng hòa, nay là nước CHXHCN Việt Nam (1945 – 2045)' },
      { id: 'C', text: 'Kỷ niệm 70 năm Chiến thắng Điện Biên Phủ' },
      { id: 'D', text: 'Kỷ niệm 70 năm ngày giải phóng hoàn toàn miền Nam' }
    ],
    answer: 'B',
    explanation: 'Năm 2045 là dấu mốc kỷ niệm 100 năm thành lập nước, với mục tiêu trở thành nước phát triển, thu nhập cao.',
    source: 'Văn kiện Đại hội XIII, Tập 1, tr. 112',
    tags: ['Chương mở rộng', 'Đại hội XIII', 'Tầm nhìn 2045']
  },
  {
    id: 'TL-13',
    chapter: 4,
    chapterName: 'Chương mở rộng: 2018 – 2026',
    question: 'Nghị quyết số 59-NQ/TW của Bộ Chính trị trong "bộ tứ trụ cột" tập trung vào nội dung chiến lược nào?',
    options: [
      { id: 'A', text: 'Định hướng chiến lược hội nhập quốc tế toàn diện, sâu rộng trong giai đoạn mới' },
      { id: 'B', text: 'Đột phá phát triển khoa học công nghệ' },
      { id: 'C', text: 'Phát triển kinh tế tư nhân' },
      { id: 'D', text: 'Đổi mới công tác lập pháp' }
    ],
    answer: 'A',
    explanation: 'NQ 59-NQ/TW của Bộ Chính trị xác định định hướng chiến lược tham gia hội nhập quốc tế toàn diện, sâu rộng trong giai đoạn phát triển mới.',
    source: 'Văn kiện Nghị quyết Bộ Chính trị (2025)',
    tags: ['Chương mở rộng', 'Bộ tứ trụ cột', 'Hội nhập']
  },
  {
    id: 'TL-14',
    chapter: 4,
    chapterName: 'Chương mở rộng: 2018 – 2026',
    question: 'Nghị quyết số 66-NQ/TW của Bộ Chính trị trong "bộ tứ trụ cột" tập trung vào đột phá nào sau đây?',
    options: [
      { id: 'A', text: 'Đổi mới mạnh mẽ công tác xây dựng, hoàn thiện thể chế và hệ thống pháp luật kiến tạo phát triển' },
      { id: 'B', text: 'Xây dựng kết cấu hạ tầng giao thông tốc độ cao' },
      { id: 'C', text: 'Chuyển đổi số trong ngành giáo dục đại học' },
      { id: 'D', text: 'Hiện đại hóa lực lượng vũ trang nhân dân' }
    ],
    answer: 'A',
    explanation: 'NQ 66-NQ/TW nhấn mạnh đột phá đổi mới tư duy lập pháp: xây dựng pháp luật kiến tạo phát triển, dỡ bỏ mọi rào cản thể chế kìm hãm nguồn lực.',
    source: 'Văn kiện Nghị quyết Bộ Chính trị (2025)',
    tags: ['Chương mở rộng', 'Bộ tứ trụ cột', 'Thể chế pháp luật']
  },
  {
    id: 'TL-15',
    chapter: 4,
    chapterName: 'Chương mở rộng: 2018 – 2026',
    question: 'Đại hội XIV của Đảng (1/2026) xác định yếu tố nào là động lực chính của mô hình tăng trưởng mới?',
    options: [
      { id: 'A', text: 'Khai thác tài nguyên thiên nhiên và tăng trưởng dựa vào xuất khẩu thô' },
      { id: 'B', text: 'Khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia' },
      { id: 'C', text: 'Dựa chủ yếu vào nguồn vốn vay ODA nước ngoài' },
      { id: 'D', text: 'Gia tăng nguồn lao động phổ thông giá rẻ' }
    ],
    answer: 'B',
    explanation: 'Đại hội XIV xác định chuyển mạnh mô hình tăng trưởng sang năng suất, chất lượng và hiệu quả, lấy khoa học công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia là động lực chính.',
    source: 'Văn kiện Đại hội XIV (1/2026)',
    tags: ['Chương mở rộng', 'Đại hội XIV', 'Động lực phát triển']
  }
];

// Combine questions
const allQuestions = [...questions, ...EXTRA_QUESTIONS];
console.log('Total questions combined:', allQuestions.length);

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
