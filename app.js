/* ==========================================================================
   VNR202 - LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM
   Application Logic & State Management
   ========================================================================== */

(function () {
  'use strict';

  // Global State
  const state = {
    currentTab: 'timeline',
    studyChapter: 'chap-0',
    comparisonKey: 'cuongLinhVsLuanCuong',
    
    // Flashcards state
    fcCategory: 'all',
    fcIndex: 0,
    fcCards: [],
    fcFlipped: false,
    fcMastered: JSON.parse(localStorage.getItem('vnr_fc_mastered') || '[]'),

    // Quiz state
    quizMode: 'practice', // 'practice' | 'exam-pt' | 'exam-fe' | 'wrong' | 'starred'
    quizChapterFilter: 'all', // 'all' | '1' | '2' | '3'
    quizQuestions: [],
    userAnswers: {}, // { [qId]: 'A' }
    starredQuestions: JSON.parse(localStorage.getItem('vnr_starred') || '[]'),
    wrongQuestions: JSON.parse(localStorage.getItem('vnr_wrong') || '[]'),
    examDurationMinutes: 20,
    examTimer: null,
    examTimeRemaining: 1200, // in seconds
    examSubmitted: false,
    examScore: null,

    // Timeline state
    timelineEraFilter: 'all'
  };

  // Safe accessor to global data
  const DATA = window.VNR_DATA || {
    QUESTIONS: [],
    CONGRESSES: [],
    GENERAL_SECRETARIES: [],
    COMPARISONS: {},
    PITFALLS: [],
    FLASHCARDS: [],
    MATERIALS: []
  };

  const CHAPTERS = window.VNR_CHAPTERS || [];

  // DOM Elements
  const elements = {};

  function initElements() {
    elements.navTabs = document.querySelectorAll('.nav-tab-btn');
    elements.viewSections = document.querySelectorAll('.view-section');
    elements.searchTrigger = document.querySelector('.search-trigger-btn');
    elements.searchModalBackdrop = document.querySelector('.search-modal-backdrop');
    elements.searchInput = document.querySelector('#global-search-input');
    elements.searchResultsList = document.querySelector('#search-results-list');
    elements.searchCloseBtn = document.querySelector('#search-close-btn');

    // Timeline
    elements.timelineFilterBtns = document.querySelectorAll('.timeline-filter-btn');
    elements.timelineContainer = document.querySelector('#timeline-events-container');
    elements.congressTableBody = document.querySelector('#congress-table-body');
    elements.milestonesTableBody = document.querySelector('#milestones-table-body');
    elements.genSecContainer = document.querySelector('#gen-sec-container');

    // Study Guide
    elements.studySidebarList = document.querySelector('#study-nav-list');
    elements.studyContentArea = document.querySelector('#study-content-area');

    // Comparisons
    elements.comparisonTabs = document.querySelectorAll('.comparison-tab-btn');
    elements.comparisonDisplayArea = document.querySelector('#comparison-display-area');

    // Flashcards
    elements.fcBoxWrap = document.querySelector('#fc-box-wrap');
    elements.fcFrontText = document.querySelector('#fc-front-text');
    elements.fcBackText = document.querySelector('#fc-back-text');
    elements.fcCategoryBadge = document.querySelector('#fc-category-badge');
    elements.fcHintText = document.querySelector('#fc-hint-text');
    elements.fcCounter = document.querySelector('#fc-counter');
    elements.fcPrevBtn = document.querySelector('#fc-prev-btn');
    elements.fcNextBtn = document.querySelector('#fc-next-btn');
    elements.fcFlipBtn = document.querySelector('#fc-flip-btn');
    elements.fcMasterBtn = document.querySelector('#fc-master-btn');
    elements.fcShuffleBtn = document.querySelector('#fc-shuffle-btn');
    elements.fcFilterBtns = document.querySelectorAll('.fc-filter-btn');

    // Quiz
    elements.quizContainer = document.querySelector('#quiz-questions-list');
    elements.quizPaletteGrid = document.querySelector('#quiz-palette-grid');
    elements.quizModeBtns = document.querySelectorAll('.quiz-mode-btn');
    elements.quizChapterFilterBtns = document.querySelectorAll('.quiz-chap-btn');
    elements.quizTimerWrap = document.querySelector('#quiz-timer-wrap');
    elements.quizTimerDisplay = document.querySelector('#quiz-timer-display');
    elements.quizSubmitBtn = document.querySelector('#quiz-submit-btn');
    elements.quizResetBtn = document.querySelector('#quiz-reset-btn');
    elements.quizScoreResultCard = document.querySelector('#quiz-score-result-card');
    elements.quizExamSpec = document.querySelector('#quiz-exam-spec');
    elements.quizChapFilterBar = document.querySelector('#quiz-chap-filter-bar');

    // Pitfalls
    elements.pitfallsContainer = document.querySelector('#pitfalls-container');

    // Materials & Source Matrix
    elements.materialsContainer = document.querySelector('#materials-container');
    elements.sourceMatrixTableBody = document.querySelector('#source-matrix-table-body');
    elements.verifiedSourcesContainer = document.querySelector('#verified-sources-container');

    // Learning Progress
    elements.progressText = document.querySelector('#progress-text');
    elements.progressQuizCount = document.querySelector('#progress-quiz-count');
    elements.progressFcCount = document.querySelector('#progress-fc-count');
    elements.progressBarFill = document.querySelector('#progress-bar-fill');
  }

  // ==========================================================================
  // GLOBAL NAVIGATION HELPER (FOR INTERACTIVE TOC & LINKS)
  // ==========================================================================
  window.VNR_NAV = {
    switchTab: function (tabId) {
      switchTab(tabId);
    },
    switchChapter: function (chapId) {
      state.studyChapter = chapId;
      switchTab('study');
      renderStudyGuide();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================================================
  function switchTab(tabId) {
    state.currentTab = tabId;

    elements.navTabs.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    elements.viewSections.forEach(sec => {
      if (sec.id === `view-${tabId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Lazy view initializers
    if (tabId === 'timeline') renderTimeline();
    if (tabId === 'study') renderStudyGuide();
    if (tabId === 'comparisons') renderComparisons();
    if (tabId === 'flashcards') renderFlashcard();
    if (tabId === 'quiz') renderQuiz();
    if (tabId === 'pitfalls') renderPitfalls();
    if (tabId === 'materials') renderMaterials();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // VIEW 1: TIMELINE & CONGRESSES
  // ==========================================================================
  const TIMELINE_EVENTS = [
    { year: "1858", date: "1/9/1858", era: "1858-1930", title: "Pháp nổ súng xâm lược Việt Nam", desc: "Thực dân Pháp nổ súng tấn công bán đảo Sơn Trà (Đà Nẵng), mở đầu quá trình xâm lược Việt Nam.", tag: "Xâm lược" },
    { year: "1897–1914", date: "1897", era: "1858-1930", title: "Cuộc khai thác thuộc địa lần 1", desc: "Pháp đầu tư khai thác tài nguyên, hệ thống đồn điền, giao thông. Giai cấp công nhân Việt Nam chính thức ra đời.", tag: "Khai thác 1" },
    { year: "1911", date: "5/6/1911", era: "1858-1930", title: "Nguyễn Ái Quốc ra đi tìm đường cứu nước", desc: "Rời Bến Nhà Rồng (Sài Gòn) trên tàu Amiral Latouche-Tréville, bắt đầu hành trình khảo sát thế giới.", tag: "Cứu nước" },
    { year: "1917", date: "11/1917", era: "1858-1930", title: "Cách mạng Tháng Mười Nga thành công", desc: "Mở ra thời đại mới, thức tỉnh phong trào giải phóng dân tộc ở các nước thuộc địa và phụ thuộc.", tag: "Quốc tế" },
    { year: "1919", date: "1919", era: "1858-1930", title: "Yêu sách của nhân dân An Nam & QTCS", desc: "Gửi tới Hội nghị Véc-xây đòi các quyền tự do dân chủ; Quốc tế Cộng sản (QTCS) thành lập tại Mát-xcơ-va.", tag: "Văn kiện" },
    { year: "1920", date: "7/1920 & 12/1920", era: "1858-1930", title: "Đọc Sơ thảo Luận cương Lênin & Đại hội Tua", desc: "Tìm thấy con đường cứu nước giải phóng dân tộc; bỏ phiếu tán thành QTCS và tham gia sáng lập Đảng Cộng sản Pháp.", tag: "Bước ngoặt" },
    { year: "1919–1929", date: "1919", era: "1858-1930", title: "Cuộc khai thác thuộc địa lần 2", desc: "Đầu tư ồ ạt làm kinh tế Việt Nam mất cân đối, què quặt, phân hóa giai cấp sâu sắc.", tag: "Khai thác 2" },
    { year: "1925", date: "6/1925 & 8/1925", era: "1858-1930", title: "Hội VNCM Thanh niên & Bãi công Ba Son", desc: "Tổ chức tiền thân của Đảng ra đời tại Quảng Châu; bãi công Ba Son do Tôn Đức Thắng lãnh đạo đánh dấu công nhân bước vào tự giác.", tag: "Công nhân" },
    { year: "1927", date: "1927", era: "1858-1930", title: "Tác phẩm \"Đường Kách mệnh\"", desc: "Trang bị lý luận cách mạng giải phóng dân tộc cho cán bộ cách mạng Việt Nam.", tag: "Lý luận" },
    { year: "1929", date: "1929", era: "1858-1930", title: "Ba tổ chức cộng sản ra đời", desc: "Đông Dương CSĐ (6/1929 tại Bắc Kỳ), An Nam CSĐ (11/1929 tại Nam Kỳ), Đông Dương CS Liên đoàn (1/1930 tại Trung Kỳ).", tag: "Tổ chức" },
    { year: "1930", date: "3/2/1930", era: "1930-1945", title: "Đảng Cộng sản Việt Nam thành lập", desc: "Hội nghị hợp nhất tại Cửu Long (Hồng Kông) do NAQ chủ trì; thông qua Cương lĩnh chính trị đầu tiên.", tag: "Lập Đảng" },
    { year: "1930", date: "10/1930", era: "1930-1945", title: "Luận cương chính trị tháng 10/1930", desc: "Đổi tên Đảng thành ĐCS Đông Dương; thông qua Luận cương do Trần Phú khởi thảo; bầu Trần Phú làm TBT đầu tiên.", tag: "Luận cương" },
    { year: "1930–1931", date: "1/5/1930", era: "1930-1945", title: "Cao trào 1930–1931 & Xô Viết Nghệ Tĩnh", desc: "Đỉnh cao Xô Viết Nghệ Tĩnh ra đời chính quyền kiểu mới; cuộc tập dượt đầu tiên cho CMT8.", tag: "Cao trào 1" },
    { year: "1935", date: "3/1935", era: "1930-1945", title: "Đại hội lần thứ I (Ma Cao)", desc: "Phục hồi hệ thống tổ chức Đảng sau khủng bố trắng; đồng chí Lê Hồng Phong được bầu làm Tổng Bí thư.", tag: "Đại hội I" },
    { year: "1936–1939", date: "1936", era: "1930-1945", title: "Cao trào Mặt trận Dân chủ Đông Dương", desc: "Đấu tranh công khai, hợp pháp, nghị trường, báo chí đòi dân sinh, dân chủ; cuộc tập dượt thứ 2 cho CMT8.", tag: "Cao trào 2" },
    { year: "1939", date: "11/1939", era: "1930-1945", title: "Hội nghị Trung ương 6", desc: "Nguyễn Văn Cừ chủ trì tại Bà Điểm; mở đầu chuyển hướng chiến lược, đưa giải phóng dân tộc lên hàng đầu, tạm gác ruộng đất.", tag: "TW 6" },
    { year: "1941", date: "5/1941", era: "1930-1945", title: "Hội nghị Trung ương 8 (Pác Bó)", desc: "Nguyễn Ái Quốc chủ trì; hoàn chỉnh chuyển hướng chỉ đạo chiến lược; thành lập Mặt trận Việt Minh.", tag: "TW 8" },
    { year: "1945", date: "12/3/1945", era: "1930-1945", title: "Chỉ thị \"Nhật – Pháp bắn nhau và hành động của chúng ta\"", desc: "Xác định kẻ thù duy nhất là phát xít Nhật, phát động cao trào kháng Nhật cứu nước.", tag: "Kháng Nhật" },
    { year: "1945", date: "19/8 & 2/9/1945", era: "1930-1945", title: "Cách mạng Tháng Tám toàn thắng & Tuyên ngôn Độc lập", desc: "Giành chính quyền ở Hà Nội (19/8), Huế (23/8), Sài Gòn (25/8). Ngày 2/9/1945 Bác Hồ đọc Tuyên ngôn Độc lập khai sinh nước VNDCCH.", tag: "CMT8" },
    { year: "1945–1946", date: "25/11/1945", era: "1945-1954", title: "Chỉ thị Kháng chiến kiến quốc & Diệt giặc đói, dốt, ngoại xâm", desc: "Xử trí thế \"ngàn cân treo sợi tóc\": Tổng tuyển cử 6/1/1946 bầu Quốc hội I, bình dân học vụ, Tuần lễ vàng.", tag: "Kiến quốc" },
    { year: "1946", date: "6/3 & 14/9/1946", era: "1945-1954", title: "Hiệp định Sơ bộ & Tạm ước (\"Hòa để tiến\")", desc: "Ký kết để đuổi 20 vạn quân Tưởng về nước, tranh thủ thời gian chuẩn bị kháng chiến lâu dài với Pháp.", tag: "Ngoại giao" },
    { year: "1946", date: "12/12 & 19/12/1946", era: "1945-1954", title: "Chỉ thị Toàn dân kháng chiến & Lời kêu gọi Toàn quốc kháng chiến", desc: "12/12 Chỉ thị của TW; 19/12 Lời kêu gọi của Bác Hồ: \"Thà hy sinh tất cả chứ nhất định không chịu mất nước\".", tag: "Toàn quốc KC" },
    { year: "1951", date: "2/1951", era: "1945-1954", title: "Đại hội lần thứ II (Tuyên Quang)", desc: "\"Đại hội kháng chiến thắng lợi\", Đảng ra hoạt động công khai lấy tên Đảng Lao động Việt Nam.", tag: "Đại hội II" },
    { year: "1954", date: "7/5 & 21/7/1954", era: "1945-1954", title: "Điện Biên Phủ & Hiệp định Giơnevơ", desc: "Chiến thắng Điện Biên Phủ lừng lẫy; Pháp ký Hiệp định Giơnevơ công nhận độc lập, chủ quyền, toàn vẹn lãnh thổ; giới tuyến tạm thời vĩ tuyến 17.", tag: "Điện Biên Phủ" },
    { year: "1959", date: "1/1959", era: "1954-1975", title: "Hội nghị Trung ương 15 (khóa II)", desc: "Mở đường cho cách mạng miền Nam sử dụng bạo lực cách mạng đánh đổ ách kìm kẹp Mỹ – Diệm.", tag: "TW 15" },
    { year: "1960", date: "17/1/1960", era: "1954-1975", title: "Phong trào Đồng Khởi bùng nổ", desc: "Khởi đầu ở Mỏ Cày (Bến Tre), chuyển cách mạng miền Nam từ giữ gìn lực lượng sang thế tiến công.", tag: "Đồng Khởi" },
    { year: "1960", date: "9/1960 & 20/12/1960", era: "1954-1975", title: "Đại hội III (Hà Nội) & Thành lập MTDTGPMNVN", desc: "Đại hội III xác định 2 nhiệm vụ chiến lược 2 miền; thành lập Mặt trận Dân tộc giải phóng miền Nam tại Tây Ninh.", tag: "Đại hội III" },
    { year: "1961–1965", date: "1961", era: "1954-1975", title: "Đánh bại \"Chiến tranh đặc biệt\" của Mỹ", desc: "Mỹ dùng quân đội Sài Gòn + cố vấn Mỹ + ấp chiến lược; ta đánh bại với chiến thắng Ấp Bắc, Bình Giã, Ba Gia.", tag: "CT Đặc biệt" },
    { year: "1965–1968", date: "1965", era: "1954-1975", title: "Đánh bại \"Chiến tranh cục bộ\" của Mỹ", desc: "Mỹ ồ ạt đưa quân viễn chinh vào miền Nam; TW 11 & 12 ra khẩu hiệu \"Tất cả để đánh thắng giặc Mỹ\"; Tổng tiến công Tết Mậu Thân 1968.", tag: "CT Cục bộ" },
    { year: "1969–1973", date: "1969", era: "1954-1975", title: "Đánh bại \"Việt Nam hóa chiến tranh\" & Hiệp định Pari", desc: "Chiến thắng \"Điện Biên Phủ trên không\" 12/1972; ký Hiệp định Pari 27/1/1973 buộc quân Mỹ rút khỏi Việt Nam.", tag: "Hiệp định Pari" },
    { year: "1975", date: "30/4/1975", era: "1954-1975", title: "Đại thắng mùa Xuân 1975", desc: "Chiến dịch Hồ Chí Minh lịch sử toàn thắng, giải phóng miền Nam, thống nhất non sông.", tag: "Giải phóng" },
    { year: "1975–1976", date: "25/4/1976", era: "1975-1986", title: "Thống nhất đất nước về mặt Nhà nước", desc: "Hội nghị TW 24; Hiệp thương do Phạm Hùng dẫn đầu; Tổng tuyển cử 25/4/1976 bầu Quốc hội VI; đặt tên nước CHXHCN Việt Nam.", tag: "Thống nhất" },
    { year: "1976", date: "12/1976", era: "1975-1986", title: "Đại hội IV của Đảng", desc: "Đổi tên Đảng thành Đảng Cộng sản Việt Nam; thông qua Kế hoạch 5 năm 1976–1980.", tag: "Đại hội IV" },
    { year: "1979", date: "17/2/1979", era: "1975-1986", title: "Chiến tranh bảo vệ biên giới phía Bắc", desc: "Quân dân ta anh dũng chiến đấu bảo vệ vững chắc biên cương Tổ quốc trước sự tấn công của Trung Quốc.", tag: "Biên giới" },
    { year: "1982", date: "3/1982", era: "1975-1986", title: "Đại hội V của Đảng", desc: "Xác định nông nghiệp là mặt trận hàng đầu; 2 nhiệm vụ chiến lược: xây dựng CNXH và bảo vệ Tổ quốc.", tag: "Đại hội V" },
    { year: "1986", date: "12/1986", era: "1986-2018", title: "Đại hội VI – KHỞI XƯỚNG ĐỔI MỚI", desc: "Nhìn thẳng vào sự thật; xóa bỏ cơ chế tập trung quan liêu bao cấp, phát triển kinh tế hàng hóa nhiều thành phần.", tag: "ĐỔI MỚI" },
    { year: "1991", date: "6/1991", era: "1986-2018", title: "Đại hội VII & Cương lĩnh 1991", desc: "Thông qua Cương lĩnh xây dựng đất nước thời kỳ quá độ (6 đặc trưng); khẳng định CN Mác-Lênin & tư tưởng HCM là kim chỉ nam.", tag: "Cương lĩnh 91" },
    { year: "1996", date: "6/1996", era: "1986-2018", title: "Đại hội VIII – Đẩy mạnh CNH, HĐH", desc: "Đất nước ra khỏi khủng hoảng kinh tế – xã hội; tăng trưởng gắn với tiến bộ, công bằng xã hội.", tag: "CNH HĐH" },
    { year: "2001", date: "4/2001", era: "1986-2018", title: "Đại hội IX – Kinh tế thị trường định hướng XHCN", desc: "Chính thức xác lập mô hình KTTT định hướng XHCN là mô hình kinh tế tổng quát trong thời kỳ quá độ.", tag: "KTTT XHCN" },
    { year: "2006–2007", date: "4/2006 & 1/2007", era: "1986-2018", title: "Đại hội X & Gia nhập WTO", desc: "Cho phép đảng viên làm kinh tế tư nhân; ngày 11/1/2007 Việt Nam chính thức là thành viên thứ 150 của WTO.", tag: "WTO" },
    { year: "2011", date: "1/2011", era: "1986-2018", title: "Đại hội XI & Cương lĩnh bổ sung 2011", desc: "Cương lĩnh bổ sung phát triển năm 2011 xác lập 8 đặc trưng của xã hội XHCN và 3 đột phá chiến lược.", tag: "Cương lĩnh 11" },
    { year: "2016", date: "1/2016 & 10/2016", era: "1986-2018", title: "Đại hội XII & NQ TW 4 về xây dựng Đảng", desc: "Tăng cường xây dựng, chỉnh đốn Đảng; NQ TW 4 ngăn chặn đẩy lùi 27 biểu hiện suy thoái, \"tự diễn biến\", \"tự chuyển hóa\".", tag: "Xây dựng Đảng" },
    { year: "2021", date: "1/2021", era: "2018-2026", title: "Đại hội XIII của Đảng", desc: "Lần đầu tiên đề ra mục tiêu 2025, 2030 (thu nhập trung bình cao) và tầm nhìn 2045 (nước phát triển, thu nhập cao).", tag: "Đại hội XIII" },
    { year: "2024–2025", date: "2024–2025", era: "2018-2026", title: "\"Bộ tứ trụ cột\" thể chế (NQ 57, 59, 66, 68)", desc: "NQ 57 về KHCN, đổi mới sáng tạo, CĐS; NQ 68 phát triển kinh tế tư nhân là động lực quan trọng nhất.", tag: "Bộ tứ trụ cột" },
    { year: "2026", date: "19–23/1/2026", era: "2018-2026", title: "Đại hội XIV – KỶ NGUYÊN MỚI", desc: "TBT Tô Lâm tái cử; mục tiêu tăng trưởng GDP bình quân >= 10%/năm 2026–2030; bước vào kỷ nguyên vươn mình của dân tộc.", tag: "Kỷ nguyên mới" }
  ];

  function renderTimeline() {
    if (!elements.timelineContainer) return;

    // Filter events
    const filtered = TIMELINE_EVENTS.filter(ev => {
      if (state.timelineEraFilter === 'all') return true;
      return ev.era === state.timelineEraFilter;
    });

    elements.timelineContainer.innerHTML = filtered.map(ev => `
      <div class="timeline-item">
        <div class="timeline-bubble">
          <div class="timeline-meta">
            <span class="timeline-year">${ev.year} (${ev.date})</span>
            <span class="timeline-tag">${ev.tag}</span>
          </div>
          <h4 class="timeline-title">${ev.title}</h4>
          <p class="timeline-desc">${ev.desc}</p>
        </div>
      </div>
    `).join('');

    // Core 50 Milestones Table (Phụ lục C.2)
    if (elements.milestonesTableBody && DATA.CORE_50_MILESTONES) {
      elements.milestonesTableBody.innerHTML = DATA.CORE_50_MILESTONES.map((m, idx) => `
        <tr class="${m.highlight ? 'row-highlight' : ''}">
          <td style="text-align:center; font-weight:700; color:var(--text-muted)">${idx + 1}</td>
          <td><strong style="color:var(--brand-crimson)">${m.year}</strong></td>
          <td><strong>${m.title}</strong></td>
          <td style="font-size:0.88rem; color:var(--text-secondary); line-height:1.45">${m.desc}</td>
          <td style="text-align:center"><span class="badge-tag">${m.era}</span></td>
        </tr>
      `).join('');
    }

    // Congresses Table
    if (elements.congressTableBody && DATA.CONGRESSES) {
      elements.congressTableBody.innerHTML = DATA.CONGRESSES.map(c => `
        <tr>
          <td><span class="badge-congress">${c.number}</span></td>
          <td><strong>${c.year}</strong><br><small style="color:var(--text-muted)">${c.date}</small></td>
          <td>${c.location}</td>
          <td><strong>${c.generalSecretary}</strong></td>
          <td>
            <div style="font-weight:600; color:var(--brand-crimson-dark); margin-bottom:0.25rem">${c.theme}</div>
            <ul style="margin-left:1.25rem; font-size:0.84rem; color:var(--text-secondary)">
              ${c.keyDecisions.map(d => `<li>${d}</li>`).join('')}
            </ul>
          </td>
        </tr>
      `).join('');
    }

    // General Secretaries
    if (elements.genSecContainer && DATA.GENERAL_SECRETARIES) {
      elements.genSecContainer.innerHTML = DATA.GENERAL_SECRETARIES.map(s => `
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-bottom:0.75rem">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem">
            <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-primary)">${s.name}</h4>
            <span class="badge-tag">${s.period}</span>
          </div>
          <div style="font-size:0.85rem; font-weight:600; color:var(--brand-crimson); margin-bottom:0.3rem">${s.role}</div>
          <p style="font-size:0.86rem; color:var(--text-secondary)">${s.milestone}</p>
        </div>
      `).join('');
    }
  }

  // ==========================================================================
  // VIEW 2: STUDY GUIDE
  // ==========================================================================
  function renderStudyGuide() {
    if (!elements.studySidebarList || !elements.studyContentArea) return;

    // Render Sidebar Navigation
    elements.studySidebarList.innerHTML = CHAPTERS.map(ch => `
      <li class="study-nav-item ${ch.id === state.studyChapter ? 'active' : ''}" data-chap="${ch.id}">
        <span class="nav-badge">${ch.badge}</span>
        <div style="font-weight:600">${ch.title}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.15rem">${ch.subtitle}</div>
      </li>
    `).join('');

    // Attach click handlers to nav items
    document.querySelectorAll('.study-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        state.studyChapter = item.dataset.chap;
        renderStudyGuide();
        window.scrollTo({ top: elements.studyContentArea.offsetTop - 80, behavior: 'smooth' });
      });
    });

    // Render Selected Chapter Content
    const curChapter = CHAPTERS.find(c => c.id === state.studyChapter) || CHAPTERS[0];
    if (curChapter) {
      elements.studyContentArea.innerHTML = `
        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color)">
          <span class="badge-congress" style="font-size:0.85rem">${curChapter.badge}</span>
          <h2 style="font-size:1.75rem; font-weight:800; color:var(--text-primary); margin:0.4rem 0 0.2rem 0">${curChapter.title}</h2>
          <p style="color:var(--text-muted); font-size:1rem">${curChapter.subtitle}</p>
        </div>
        <div class="study-html-body">
          ${curChapter.html}
        </div>
      `;
    }
  }

  // ==========================================================================
  // VIEW 3: COMPARISONS & SUMMARY
  // ==========================================================================
  function renderComparisons() {
    if (!elements.comparisonDisplayArea) return;

    const comp = DATA.COMPARISONS[state.comparisonKey];
    if (!comp) return;

    let html = `
      <h3 class="comparison-title">${comp.title}</h3>
      <div class="table-container">
        <table class="content-table">
          <thead>
            <tr>
              ${comp.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${comp.rows.map(row => `
              <tr>
                ${row.map((cell, idx) => `
                  <td${idx === 0 ? ' class="col-header"' : ''}>${cell}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    elements.comparisonDisplayArea.innerHTML = html;

    // Update active tab button
    elements.comparisonTabs.forEach(btn => {
      if (btn.dataset.key === state.comparisonKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // VIEW 4: FLASHCARDS
  // ==========================================================================
  function updateFlashcardsList() {
    let list = DATA.FLASHCARDS || [];
    if (state.fcCategory !== 'all') {
      list = list.filter(c => c.category === state.fcCategory);
    }
    state.fcCards = list;
    if (state.fcIndex >= state.fcCards.length) {
      state.fcIndex = 0;
    }
  }

  function renderFlashcard() {
    updateFlashcardsList();
    if (!elements.fcBoxWrap) return;

    if (state.fcCards.length === 0) {
      elements.fcFrontText.textContent = "Không có flashcard nào.";
      elements.fcBackText.textContent = "";
      elements.fcCounter.textContent = "0 / 0";
      return;
    }

    const card = state.fcCards[state.fcIndex];
    const isMastered = state.fcMastered.includes(card.id);

    // Reset flip
    state.fcFlipped = false;
    elements.fcBoxWrap.classList.remove('flipped');

    elements.fcFrontText.textContent = card.front;
    elements.fcBackText.innerHTML = card.back + (isMastered ? '<div style="margin-top:0.75rem; color:var(--status-success); font-weight:700">✓ Đã ghi nhớ thẻ này</div>' : '');
    elements.fcCategoryBadge.textContent = card.category;
    elements.fcHintText.textContent = `Gợi ý: ${card.hint}`;
    elements.fcCounter.textContent = `${state.fcIndex + 1} / ${state.fcCards.length}`;

    // Update Master button label
    if (elements.fcMasterBtn) {
      elements.fcMasterBtn.innerHTML = isMastered ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc';
      if (isMastered) {
        elements.fcMasterBtn.classList.add('memorized');
      } else {
        elements.fcMasterBtn.classList.remove('memorized');
      }
    }

    // Update category filter buttons
    elements.fcFilterBtns.forEach(btn => {
      if (btn.dataset.cat === state.fcCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function flipFlashcard() {
    state.fcFlipped = !state.fcFlipped;
    if (state.fcFlipped) {
      elements.fcBoxWrap.classList.add('flipped');
    } else {
      elements.fcBoxWrap.classList.remove('flipped');
    }
  }

  function nextFlashcard() {
    if (state.fcCards.length <= 1) return;
    state.fcIndex = (state.fcIndex + 1) % state.fcCards.length;
    renderFlashcard();
  }

  function prevFlashcard() {
    if (state.fcCards.length <= 1) return;
    state.fcIndex = (state.fcIndex - 1 + state.fcCards.length) % state.fcCards.length;
    renderFlashcard();
  }

  function toggleMasteredCurrentCard() {
    if (state.fcCards.length === 0) return;
    const card = state.fcCards[state.fcIndex];
    const idx = state.fcMastered.indexOf(card.id);
    if (idx !== -1) {
      state.fcMastered.splice(idx, 1);
    } else {
      state.fcMastered.push(card.id);
    }
    localStorage.setItem('vnr_fc_mastered', JSON.stringify(state.fcMastered));
    renderFlashcard();
    updateProgressUI();
  }

  function shuffleFlashcards() {
    // Fisher-Yates shuffle
    for (let i = state.fcCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.fcCards[i], state.fcCards[j]] = [state.fcCards[j], state.fcCards[i]];
    }
    state.fcIndex = 0;
    renderFlashcard();
  }

  // ==========================================================================
  // VIEW 5: QUIZ ENGINE (700 CÂU HỎI & KHẢO THÍ CHUẨN FPT)
  // ==========================================================================
  function prepareQuizQuestions() {
    let pool = [...DATA.QUESTIONS];

    // Filter by mode
    if (state.quizMode === 'wrong') {
      pool = pool.filter(q => state.wrongQuestions.includes(q.id));
      state.quizQuestions = pool;
      return;
    }
    
    if (state.quizMode === 'starred') {
      pool = pool.filter(q => state.starredQuestions.includes(q.id));
      state.quizQuestions = pool;
      return;
    }

    if (state.quizMode === 'exam-pt') {
      // Progress Test FPT: 25 questions total (Chương 1 & Chương 2: LO1, LO2, LO4, LO5, LO6, LO8, LO9)
      // Tỷ lệ phân bổ: 13 câu Chương 1 + 12 câu Chương 2
      const c1Pool = pool.filter(q => q.chapter === 1).sort(() => 0.5 - Math.random());
      const c2Pool = pool.filter(q => q.chapter === 2).sort(() => 0.5 - Math.random());
      const selected = [...c1Pool.slice(0, 13), ...c2Pool.slice(0, 12)].sort(() => 0.5 - Math.random());
      state.quizQuestions = selected;
      return;
    }

    if (state.quizMode === 'exam-fe') {
      // Final Exam FPT: 60 questions total (Tất cả 3 chương: Chương 1: 20 câu, Chương 2: 20 câu, Chương 3: 20 câu)
      const c1Pool = pool.filter(q => q.chapter === 1).sort(() => 0.5 - Math.random());
      const c2Pool = pool.filter(q => q.chapter === 2).sort(() => 0.5 - Math.random());
      const c3Pool = pool.filter(q => q.chapter === 3).sort(() => 0.5 - Math.random());
      const selected = [...c1Pool.slice(0, 20), ...c2Pool.slice(0, 20), ...c3Pool.slice(0, 20)].sort(() => 0.5 - Math.random());
      state.quizQuestions = selected;
      return;
    }

    // Practice mode - Filter by chapter if chosen
    if (state.quizMode === 'practice' && state.quizChapterFilter !== 'all') {
      const chapNum = parseInt(state.quizChapterFilter, 10);
      pool = pool.filter(q => q.chapter === chapNum);
    }

    state.quizQuestions = pool;
  }

  function renderQuiz() {
    prepareQuizQuestions();

    // Render palette
    renderQuizPalette();

    const isExam = state.quizMode === 'exam-pt' || state.quizMode === 'exam-fe';

    // Handle Exam Spec Banner
    if (elements.quizExamSpec) {
      if (state.quizMode === 'exam-pt') {
        elements.quizExamSpec.style.display = 'block';
        elements.quizExamSpec.innerHTML = `
          <div style="padding:1.25rem">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem">
              <strong style="color:var(--brand-crimson); font-size:1.05rem">CẤU TRÚC ĐỀ THI PROGRESS TEST (PT) — ĐẠI HỌC FPT</strong>
              <span class="badge-tag" style="background:#fee2e2; color:#b91c1c; font-weight:700">Trọng số: 20%</span>
            </div>
            <p style="font-size:0.88rem; color:var(--text-secondary); margin:0 0 0.5rem 0; line-height:1.5">
              <strong>Số lượng:</strong> 25 câu trắc nghiệm (Chương 1: 13 câu • Chương 2: 12 câu) | <strong>Thời gian:</strong> 20 phút | <strong>Chuẩn đầu ra:</strong> LO1, LO2, LO4, LO5, LO6, LO8, LO9.
            </p>
            <p style="font-size:0.82rem; color:var(--text-muted); margin:0">
              Quy chế thi: Sinh viên không được sử dụng tài liệu. Hệ thống sẽ tự động nộp bài khi hết giờ và đối soát chuẩn điểm Pass (&ge; 4.0 / 10.0).
            </p>
          </div>
        `;
      } else if (state.quizMode === 'exam-fe') {
        elements.quizExamSpec.style.display = 'block';
        elements.quizExamSpec.innerHTML = `
          <div style="padding:1.25rem">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem">
              <strong style="color:var(--brand-crimson); font-size:1.05rem">CẤU TRÚC ĐỀ THI FINAL EXAM (FE) — ĐẠI HỌC FPT</strong>
              <span class="badge-tag" style="background:#fee2e2; color:#b91c1c; font-weight:700">Trọng số: 30%</span>
            </div>
            <p style="font-size:0.88rem; color:var(--text-secondary); margin:0 0 0.5rem 0; line-height:1.5">
              <strong>Số lượng:</strong> 60 câu trắc nghiệm (Chương 1: 20 câu • Chương 2: 20 câu • Chương 3: 20 câu) | <strong>Thời gian:</strong> 60 phút | <strong>Chuẩn đầu ra:</strong> Toàn diện LO1 &ndash; LO9.
            </p>
            <p style="font-size:0.82rem; color:var(--text-muted); margin:0">
              Quy chế thi: Phòng Khảo thí tổ chức. Sinh viên không được sử dụng tài liệu. Điểm liệt học phần: &lt; 4.0 / 10.0.
            </p>
          </div>
        `;
      } else {
        elements.quizExamSpec.style.display = 'none';
      }
    }

    // Handle chapter filter bar visibility
    if (elements.quizChapFilterBar) {
      elements.quizChapFilterBar.style.display = (state.quizMode === 'practice') ? 'flex' : 'none';
    }

    // Handle timer display
    if (isExam) {
      elements.quizTimerWrap.style.display = 'inline-flex';
      if (!state.examTimer && !state.examSubmitted) {
        startExamTimer();
      }
    } else {
      elements.quizTimerWrap.style.display = 'none';
      stopExamTimer();
    }

    // Render question list
    if (state.quizQuestions.length === 0) {
      elements.quizContainer.innerHTML = `
        <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:3rem; text-align:center">
          <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem">Chưa có câu hỏi nào trong danh sách này</h3>
          <p style="color:var(--text-muted); font-size:0.95rem">
            ${state.quizMode === 'wrong' ? 'Bạn chưa có câu hỏi nào bị đánh dấu sai.' : 'Hãy chọn lại chế độ hoặc chương học để tiếp tục luyện tập.'}
          </p>
        </div>
      `;
      elements.quizSubmitBtn.style.display = 'none';
      return;
    }

    elements.quizSubmitBtn.style.display = (isExam && !state.examSubmitted) ? 'block' : 'none';

    const isPracticeLike = state.quizMode === 'practice' || state.quizMode === 'wrong' || state.quizMode === 'starred';

    elements.quizContainer.innerHTML = state.quizQuestions.map((q, idx) => {
      const userAnswer = state.userAnswers[q.id];
      const isAnswered = Boolean(userAnswer);
      const isCorrect = userAnswer === q.answer;
      const isStarred = state.starredQuestions.includes(q.id);

      // Card status classes
      let statusClass = '';
      if (isPracticeLike && isAnswered) {
        statusClass = isCorrect ? 'status-correct' : 'status-wrong';
      } else if (state.examSubmitted) {
        statusClass = isCorrect ? 'status-correct' : 'status-wrong';
      }

      return `
        <div class="question-card ${statusClass}" id="q-card-${q.id}" data-qid="${q.id}">
          <div class="q-header">
            <div style="display:flex; align-items:center; gap:0.5rem">
              <span class="q-code-badge">${q.id}</span>
              <span class="badge-tag">${q.chapterName}</span>
            </div>
            <button class="q-star-btn ${isStarred ? 'starred' : ''}" data-qid="${q.id}" title="Đánh dấu câu hỏi cần xem lại">
              ★
            </button>
          </div>

          <div class="q-title">
            <strong>Câu ${idx + 1}:</strong> ${q.question}
          </div>

          <div class="q-options">
            ${q.options.map(opt => {
              const optId = opt.id;
              const isSelected = userAnswer === optId;
              let highlightClass = '';

              if (isPracticeLike && isAnswered) {
                if (optId === q.answer) highlightClass = 'is-correct';
                else if (isSelected && !isCorrect) highlightClass = 'is-wrong';
              } else if (state.examSubmitted) {
                if (optId === q.answer) highlightClass = 'is-correct';
                else if (isSelected && !isCorrect) highlightClass = 'is-wrong';
              }

              return `
                <label class="q-option-label ${highlightClass}">
                  <input type="radio" name="ans_${q.id}" value="${optId}" ${isSelected ? 'checked' : ''} ${state.examSubmitted ? 'disabled' : ''}>
                  <span class="q-option-letter">${optId}.</span>
                  <span class="q-option-text">${opt.text}</span>
                </label>
              `;
            }).join('')}
          </div>

          ${(isPracticeLike && isAnswered) || state.examSubmitted ? `
            <div class="q-explanation-box">
              <strong style="color: ${isCorrect ? 'var(--status-success)' : 'var(--status-danger)'}">
                ${isCorrect ? '✓ Đáp án chính xác: ' : '✗ Chưa chính xác. Đáp án đúng: '} ${q.answer}
              </strong>
              <div style="margin-top:0.35rem; color:var(--text-secondary)">${q.explanation || 'Kiến thức cốt lõi theo Giáo trình Lịch sử Đảng Cộng sản Việt Nam (2021).'}</div>
              ${q.source ? `
                <div class="q-source-badge">
                  <span>Đối chiếu giáo trình: <strong>${q.source}</strong></span>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${q.warning ? `
            <div class="q-warning-box">
              <strong>Lưu ý bẫy thi:</strong> ${q.warning}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach option click listeners
    document.querySelectorAll('.q-option-label input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const qId = e.target.name.replace('ans_', '');
        const selectedVal = e.target.value;
        selectAnswer(qId, selectedVal);
      });
    });

    // Attach star button listeners
    document.querySelectorAll('.q-star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qid;
        toggleStarQuestion(qId);
      });
    });
  }

  function renderQuizPalette() {
    if (!elements.quizPaletteGrid) return;

    const isPracticeLike = state.quizMode === 'practice' || state.quizMode === 'wrong' || state.quizMode === 'starred';

    elements.quizPaletteGrid.innerHTML = state.quizQuestions.map((q, idx) => {
      const userAnswer = state.userAnswers[q.id];
      const isAnswered = Boolean(userAnswer);
      const isCorrect = userAnswer === q.answer;
      const isStarred = state.starredQuestions.includes(q.id);

      let cellClass = '';
      if (isPracticeLike && isAnswered) {
        cellClass = isCorrect ? 'correct' : 'wrong';
      } else if (state.examSubmitted) {
        cellClass = isCorrect ? 'correct' : 'wrong';
      } else if (isAnswered) {
        cellClass = 'answered';
      }

      if (isStarred) {
        cellClass += ' starred';
      }

      return `
        <div class="palette-cell ${cellClass}" data-qid="${q.id}" title="${q.id} (Câu ${idx + 1})">
          ${idx + 1}
        </div>
      `;
    }).join('');

    // Attach click to jump to question
    document.querySelectorAll('.palette-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const qId = cell.dataset.qid;
        const targetCard = document.getElementById(`q-card-${qId}`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.style.outline = '2px solid var(--brand-crimson)';
          setTimeout(() => { targetCard.style.outline = 'none'; }, 1500);
        }
      });
    });
  }

  function selectAnswer(qId, answerLetter) {
    state.userAnswers[qId] = answerLetter;

    const qObj = DATA.QUESTIONS.find(q => q.id === qId);
    if (qObj) {
      if (answerLetter !== qObj.answer) {
        // Record in wrong questions
        if (!state.wrongQuestions.includes(qId)) {
          state.wrongQuestions.push(qId);
          localStorage.setItem('vnr_wrong', JSON.stringify(state.wrongQuestions));
        }
      } else {
        // Remove from wrong if answered correctly
        const wIdx = state.wrongQuestions.indexOf(qId);
        if (wIdx !== -1) {
          state.wrongQuestions.splice(wIdx, 1);
          localStorage.setItem('vnr_wrong', JSON.stringify(state.wrongQuestions));
        }
      }
    }

    const isPracticeLike = state.quizMode === 'practice' || state.quizMode === 'wrong' || state.quizMode === 'starred';

    if (isPracticeLike && qObj) {
      // Instant feedback WITHOUT full re-render (preserves scroll position!)
      const card = document.getElementById(`q-card-${qId}`);
      if (card) {
        const isCorrect = answerLetter === qObj.answer;
        card.classList.remove('status-correct', 'status-wrong');
        card.classList.add(isCorrect ? 'status-correct' : 'status-wrong');

        // Update option labels highlight
        card.querySelectorAll('.q-option-label').forEach(label => {
          const input = label.querySelector('input');
          label.classList.remove('is-correct', 'is-wrong');
          if (input.value === qObj.answer) {
            label.classList.add('is-correct');
          } else if (input.value === answerLetter && !isCorrect) {
            label.classList.add('is-wrong');
          }
        });

        // Update or insert explanation box
        let expBox = card.querySelector('.q-explanation-box');
        const expHtml = `
          <strong style="color: ${isCorrect ? 'var(--status-success)' : 'var(--status-danger)'}">
            ${isCorrect ? '✓ Đáp án chính xác: ' : '✗ Chưa chính xác. Đáp án đúng: '} ${qObj.answer}
          </strong>
          <div style="margin-top:0.35rem; color:var(--text-secondary)">${qObj.explanation || 'Kiến thức cốt lõi theo Giáo trình Lịch sử Đảng Cộng sản Việt Nam (2021).'}</div>
          ${qObj.source ? `
            <div class="q-source-badge">
              <span>Đối chiếu giáo trình: <strong>${qObj.source}</strong></span>
            </div>
          ` : ''}
        `;

        if (expBox) {
          expBox.innerHTML = expHtml;
        } else {
          expBox = document.createElement('div');
          expBox.className = 'q-explanation-box';
          expBox.innerHTML = expHtml;
          const warningBox = card.querySelector('.q-warning-box');
          if (warningBox) {
            card.insertBefore(expBox, warningBox);
          } else {
            card.appendChild(expBox);
          }
        }
      }

      // Update palette cell directly
      if (elements.quizPaletteGrid) {
        const cell = elements.quizPaletteGrid.querySelector(`.palette-cell[data-qid="${qId}"]`);
        if (cell) {
          const isCorrect = answerLetter === qObj.answer;
          cell.className = 'palette-cell ' + (isCorrect ? 'correct' : 'wrong') + (state.starredQuestions.includes(qId) ? ' starred' : '');
        }
      }
    } else {
      // In Exam mode: just mark cell as answered
      if (elements.quizPaletteGrid) {
        const cell = elements.quizPaletteGrid.querySelector(`.palette-cell[data-qid="${qId}"]`);
        if (cell) {
          cell.classList.add('answered');
        }
      }
    }

    updateProgressUI();
  }

  function updateProgressUI() {
    const totalQuestions = DATA.QUESTIONS ? DATA.QUESTIONS.length : 700;
    const totalFlashcards = DATA.FLASHCARDS ? DATA.FLASHCARDS.length : 67;
    const answeredCount = Object.keys(state.userAnswers).length;
    const masteredCount = state.fcMastered ? state.fcMastered.length : 0;
    const totalItems = totalQuestions + totalFlashcards;
    const percent = totalItems > 0 ? Math.round(((answeredCount + masteredCount) / totalItems) * 100) : 0;

    if (elements.progressText) elements.progressText.textContent = `${percent}%`;
    if (elements.progressQuizCount) elements.progressQuizCount.textContent = answeredCount;
    if (elements.progressFcCount) elements.progressFcCount.textContent = masteredCount;
    if (elements.progressBarFill) elements.progressBarFill.style.width = `${percent}%`;
  }

  function toggleStarQuestion(qId) {
    const idx = state.starredQuestions.indexOf(qId);
    if (idx !== -1) {
      state.starredQuestions.splice(idx, 1);
    } else {
      state.starredQuestions.push(qId);
    }
    localStorage.setItem('vnr_starred', JSON.stringify(state.starredQuestions));

    // Update star button UI directly
    const starBtn = document.querySelector(`.q-star-btn[data-qid="${qId}"]`);
    if (starBtn) {
      if (state.starredQuestions.includes(qId)) starBtn.classList.add('starred');
      else starBtn.classList.remove('starred');
    }

    // Update palette cell star
    if (elements.quizPaletteGrid) {
      const cell = elements.quizPaletteGrid.querySelector(`.palette-cell[data-qid="${qId}"]`);
      if (cell) {
        if (state.starredQuestions.includes(qId)) cell.classList.add('starred');
        else cell.classList.remove('starred');
      }
    }
  }

  function startExamTimer() {
    state.examTimeRemaining = state.examDurationMinutes * 60;
    state.examTimer = setInterval(() => {
      state.examTimeRemaining--;
      updateTimerDisplay();

      if (state.examTimeRemaining <= 0) {
        clearInterval(state.examTimer);
        state.examTimer = null;
        alert('Hết giờ làm bài! Hệ thống đang tự động nộp bài.');
        submitExam();
      }
    }, 1000);
    updateTimerDisplay();
  }

  function stopExamTimer() {
    if (state.examTimer) {
      clearInterval(state.examTimer);
      state.examTimer = null;
    }
  }

  function updateTimerDisplay() {
    if (!elements.quizTimerDisplay) return;
    const m = Math.floor(state.examTimeRemaining / 60);
    const s = state.examTimeRemaining % 60;
    elements.quizTimerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function submitExam() {
    stopExamTimer();
    state.examSubmitted = true;

    // Calculate score
    let correctCount = 0;
    let c1Correct = 0, c1Total = 0;
    let c2Correct = 0, c2Total = 0;
    let c3Correct = 0, c3Total = 0;

    state.quizQuestions.forEach(q => {
      const isCorrect = state.userAnswers[q.id] === q.answer;
      if (isCorrect) correctCount++;

      if (q.chapter === 1) {
        c1Total++;
        if (isCorrect) c1Correct++;
      } else if (q.chapter === 2) {
        c2Total++;
        if (isCorrect) c2Correct++;
      } else if (q.chapter === 3) {
        c3Total++;
        if (isCorrect) c3Correct++;
      }
    });

    const total = state.quizQuestions.length;
    const score10 = (correctCount / total * 10).toFixed(1);
    const percentage = Math.round(correctCount / total * 100);
    const isPass = parseFloat(score10) >= 4.0;

    const examTitle = state.quizMode === 'exam-pt' ? 'PROGRESS TEST (PT - 20%)' : 'FINAL EXAM (FE - 30%)';

    // Render result card
    if (elements.quizScoreResultCard) {
      elements.quizScoreResultCard.style.display = 'block';
      elements.quizScoreResultCard.innerHTML = `
        <div style="max-width:760px; margin:0 auto">
          <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem">
            KẾT QUẢ KHẢO THÍ CHUẨN FPT UNIVERSITY
          </div>
          <h3 style="font-size:1.45rem; font-weight:800; color:var(--text-primary); margin-bottom:1rem">
            BÀI THI ${examTitle}
          </h3>

          <div style="display:flex; justify-content:center; align-items:baseline; gap:0.5rem; margin-bottom:0.5rem">
            <span class="score-number" style="font-size:3.5rem; font-weight:900; color:${isPass ? 'var(--brand-crimson)' : 'var(--status-danger)'}">
              ${score10}
            </span>
            <span style="font-size:1.5rem; font-weight:700; color:var(--text-muted)">/ 10.0</span>
          </div>

          <div style="margin-bottom:1.5rem">
            <span class="badge-tag" style="font-size:0.95rem; padding:0.4rem 1.25rem; font-weight:700; background:${isPass ? 'var(--status-success-bg)' : 'var(--status-danger-bg)'}; color:${isPass ? 'var(--status-success)' : 'var(--status-danger)'}; border:1px solid ${isPass ? 'var(--status-success-border)' : 'var(--status-danger-border)'}">
              ${isPass ? 'KẾT QUẢ: ĐẠT (PASS)' : 'KẾT QUẢ: KHÔNG ĐẠT (FAIL - Dưới 4.0)'}
            </span>
            <span style="font-size:0.95rem; font-weight:600; color:var(--text-secondary); margin-left:0.5rem">
              (${correctCount}/${total} câu • ${percentage}%)
            </span>
          </div>

          <!-- Breakdown per chapter -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem; text-align:left">
            <div style="background:var(--bg-surface-alt); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem">
              <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase">Chương 1 (1930 – 1945)</div>
              <div style="font-size:1.25rem; font-weight:800; color:var(--brand-crimson); margin:0.35rem 0">
                ${c1Correct} / ${c1Total} câu
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary)">Tỷ lệ đúng: ${c1Total > 0 ? Math.round(c1Correct / c1Total * 100) : 0}%</div>
            </div>

            <div style="background:var(--bg-surface-alt); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem">
              <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase">Chương 2 (1945 – 1975)</div>
              <div style="font-size:1.25rem; font-weight:800; color:var(--brand-crimson); margin:0.35rem 0">
                ${c2Correct} / ${c2Total} câu
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary)">Tỷ lệ đúng: ${c2Total > 0 ? Math.round(c2Correct / c2Total * 100) : 0}%</div>
            </div>

            ${c3Total > 0 ? `
              <div style="background:var(--bg-surface-alt); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem">
                <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase">Chương 3 (1975 – nay)</div>
                <div style="font-size:1.25rem; font-weight:800; color:var(--brand-crimson); margin:0.35rem 0">
                  ${c3Correct} / ${c3Total} câu
                </div>
                <div style="font-size:0.8rem; color:var(--text-secondary)">Tỷ lệ đúng: ${Math.round(c3Correct / c3Total * 100)}%</div>
              </div>
            ` : ''}
          </div>

          <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1.25rem; line-height:1.5">
            Bạn có thể kéo xuống danh sách câu hỏi để xem chi tiết đáp án đúng, giải thích học thuật và số trang đối chiếu trong Giáo trình Lịch sử Đảng (NXB Chính trị quốc gia Sự thật).
          </p>

          <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap">
            <button class="fc-btn primary" id="btn-re-exam">Thi đề mới</button>
            <button class="fc-btn" id="btn-review-scroll">Xem lại đáp án & Giải thích &darr;</button>
          </div>
        </div>
      `;

      document.getElementById('btn-re-exam').addEventListener('click', resetQuiz);
      document.getElementById('btn-review-scroll').addEventListener('click', () => {
        elements.quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    renderQuiz();
    window.scrollTo({ top: elements.quizScoreResultCard.offsetTop - 80, behavior: 'smooth' });
  }

  function resetQuiz() {
    stopExamTimer();
    state.examSubmitted = false;
    state.userAnswers = {};
    if (elements.quizScoreResultCard) {
      elements.quizScoreResultCard.style.display = 'none';
    }

    if (state.quizMode === 'exam-pt') {
      state.examDurationMinutes = 20;
      state.examTimeRemaining = 20 * 60;
    } else if (state.quizMode === 'exam-fe') {
      state.examDurationMinutes = 60;
      state.examTimeRemaining = 60 * 60;
    }

    renderQuiz();
  }

  // ==========================================================================
  // VIEW 6: PITFALLS & EXAM STRATEGY (Cảnh báo bẫy thi)
  // ==========================================================================
  function renderPitfalls() {
    if (!elements.pitfallsContainer || !DATA.PITFALLS) return;

    elements.pitfallsContainer.innerHTML = DATA.PITFALLS.map(p => `
      <div class="pitfall-card">
        <div class="pitfall-header">
          <span class="pitfall-code">${p.code}</span>
          <span class="badge-tag">${p.chapter}</span>
        </div>
        <h3 class="pitfall-title">${p.title}</h3>
        
        <div class="pitfall-section-box issue">
          <div class="pitfall-label danger">Phân tích sai sót trong đề thi truyền thống:</div>
          <div>${p.issue}</div>
        </div>

        <div class="pitfall-section-box solution">
          <div class="pitfall-label success">Chiến lược xử lý & Chọn đáp án chuẩn khảo thí:</div>
          <div>${p.solution}</div>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // VIEW 7: MATERIALS & COURSERA & SOURCE MATRIX
  // ==========================================================================
  function renderSourceMatrix() {
    if (!elements.sourceMatrixTableBody || !DATA.SOURCE_MATRIX) return;

    elements.sourceMatrixTableBody.innerHTML = DATA.SOURCE_MATRIX.map(item => `
      <tr>
        <td style="font-weight:700; color:var(--brand-crimson); line-height:1.45; vertical-align:top">
          ${item.topic}
        </td>
        <td style="vertical-align:top">
          <div style="font-weight:600; color:var(--text-primary); font-size:0.88rem">${item.doc}</div>
        </td>
        <td style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5; vertical-align:top">
          ${item.note}
        </td>
      </tr>
    `).join('');
  }

  function renderMaterials() {
    renderSourceMatrix();
    if (!elements.materialsContainer || !DATA.MATERIALS) return;

    elements.materialsContainer.innerHTML = DATA.MATERIALS.map(m => `
      <div class="material-card ${m.id === 3 ? 'main-material' : ''} ${m.id === 12 ? 'coursera-card' : ''}">
        <div>
          <div class="material-number">Tài liệu #${m.id} ${m.id === 3 ? '• GIÁO TRÌNH CHÍNH' : ''}</div>
          <h4 class="material-title">${m.title}</h4>
          <div class="material-meta">
            ${m.author} • ${m.publisher} (${m.year})
          </div>
        </div>
        <div>
          <div class="material-note">${m.note}</div>
          ${m.link ? `
            <div style="margin-top:0.75rem">
              <a href="${m.link}" target="_blank" rel="noopener" style="font-size:0.82rem; font-weight:600">
                Tra cứu tài liệu trực tuyến ↗
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    renderVerifiedSources();
  }

  function renderVerifiedSources() {
    if (!elements.verifiedSourcesContainer || !DATA.VERIFIED_SOURCES) return;

    elements.verifiedSourcesContainer.innerHTML = DATA.VERIFIED_SOURCES.map(cat => `
      <div class="verified-source-group" style="margin-bottom:1.5rem">
        <h4 style="font-size:1rem; font-weight:700; color:var(--brand-crimson); margin-bottom:0.75rem">
          ${cat.category}
        </h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1rem">
          ${cat.items.map(item => `
            <div class="verified-source-card" style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; display:flex; flex-direction:column; justify-content:space-between">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.35rem">
                  <span class="badge-tag" style="font-size:0.75rem">${item.tag}</span>
                  <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600">${item.source}</span>
                </div>
                <h5 style="font-size:0.92rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem; line-height:1.4">${item.title}</h5>
                <p style="font-size:0.84rem; color:var(--text-secondary); line-height:1.45; margin-bottom:0.75rem">${item.summary}</p>
              </div>
              <a href="${item.url}" target="_blank" rel="noopener" style="font-size:0.82rem; font-weight:600; color:var(--brand-crimson); display:inline-flex; align-items:center; gap:0.25rem">
                Mở tài liệu kiểm chứng trực tuyến ↗
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // GLOBAL SEARCH (Ctrl + K)
  // ==========================================================================
  function openSearchModal() {
    if (elements.searchModalBackdrop) {
      elements.searchModalBackdrop.classList.add('open');
      elements.searchInput.value = '';
      elements.searchResultsList.innerHTML = '<div class="search-empty">Gõ từ khóa để tra cứu câu hỏi, mốc lịch sử, sự kiện, nghị quyết...</div>';
      setTimeout(() => elements.searchInput.focus(), 50);
    }
  }

  function closeSearchModal() {
    if (elements.searchModalBackdrop) {
      elements.searchModalBackdrop.classList.remove('open');
    }
  }

  function handleSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      elements.searchResultsList.innerHTML = '<div class="search-empty">Gõ từ khóa để tra cứu câu hỏi, mốc lịch sử, sự kiện, nghị quyết...</div>';
      return;
    }

    const results = [];

    // Search in Questions
    DATA.QUESTIONS.forEach(item => {
      const matchQ = item.question.toLowerCase().includes(q);
      const matchOpt = item.options.some(o => o.text.toLowerCase().includes(q));
      const matchExp = item.explanation.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);

      if (matchQ || matchOpt || matchExp || matchId) {
        results.push({
          type: `Câu hỏi [${item.id}]`,
          title: item.question,
          snippet: `Đáp án: ${item.answer}. ${item.explanation}`,
          action: () => {
            closeSearchModal();
            switchTab('quiz');
            setTimeout(() => {
              const el = document.getElementById(`q-card-${item.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        });
      }
    });

    // Search in Timeline
    TIMELINE_EVENTS.forEach(ev => {
      if (ev.title.toLowerCase().includes(q) || ev.desc.toLowerCase().includes(q) || ev.year.includes(q)) {
        results.push({
          type: `Mốc lịch sử (${ev.year})`,
          title: ev.title,
          snippet: ev.desc,
          action: () => {
            closeSearchModal();
            switchTab('timeline');
          }
        });
      }
    });

    // Search in Congresses
    DATA.CONGRESSES.forEach(c => {
      if (c.number.toLowerCase().includes(q) || c.theme.toLowerCase().includes(q) || c.year.includes(q)) {
        results.push({
          type: `Đại hội Đảng (${c.year})`,
          title: `${c.number} (${c.date})`,
          snippet: `${c.theme} - Tổng Bí thư: ${c.generalSecretary}`,
          action: () => {
            closeSearchModal();
            switchTab('timeline');
          }
        });
      }
    });

    // Render Results
    if (results.length === 0) {
      elements.searchResultsList.innerHTML = '<div class="search-empty">Không tìm thấy kết quả nào phù hợp.</div>';
      return;
    }

    elements.searchResultsList.innerHTML = results.slice(0, 15).map((r, i) => `
      <div class="search-result-item" data-idx="${i}">
        <div class="search-result-type">${r.type}</div>
        <div class="search-result-title">${r.title}</div>
        <div class="search-result-snippet">${r.snippet}</div>
      </div>
    `).join('');

    // Attach click handlers
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        if (results[idx] && results[idx].action) {
          results[idx].action();
        }
      });
    });
  }

  // ==========================================================================
  // EVENT LISTENERS & BOOTSTRAP
  // ==========================================================================
  function setupEventListeners() {
    // Navigation tabs
    elements.navTabs.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Search modal triggers
    if (elements.searchTrigger) elements.searchTrigger.addEventListener('click', openSearchModal);
    if (elements.searchCloseBtn) elements.searchCloseBtn.addEventListener('click', closeSearchModal);
    if (elements.searchModalBackdrop) {
      elements.searchModalBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.searchModalBackdrop) closeSearchModal();
      });
    }

    // Keyboard shortcuts (Ctrl+K or / to search, Esc to close)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === 'Escape' && elements.searchModalBackdrop && elements.searchModalBackdrop.classList.contains('open')) {
        closeSearchModal();
      }
    });

    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Timeline Era Filters
    elements.timelineFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.timelineFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.timelineEraFilter = btn.dataset.era;
        renderTimeline();
      });
    });

    // Comparison Tabs
    elements.comparisonTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        state.comparisonKey = btn.dataset.key;
        renderComparisons();
      });
    });

    // Flashcard buttons
    if (elements.fcBoxWrap) elements.fcBoxWrap.addEventListener('click', flipFlashcard);
    if (elements.fcFlipBtn) elements.fcFlipBtn.addEventListener('click', flipFlashcard);
    if (elements.fcNextBtn) elements.fcNextBtn.addEventListener('click', nextFlashcard);
    if (elements.fcPrevBtn) elements.fcPrevBtn.addEventListener('click', prevFlashcard);
    if (elements.fcMasterBtn) elements.fcMasterBtn.addEventListener('click', toggleMasteredCurrentCard);
    if (elements.fcShuffleBtn) elements.fcShuffleBtn.addEventListener('click', shuffleFlashcards);

    elements.fcFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.fcCategory = btn.dataset.cat;
        state.fcIndex = 0;
        renderFlashcard();
      });
    });

    // Quiz Mode Selection
    elements.quizModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.quizModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.quizMode = btn.dataset.mode;
        resetQuiz();
      });
    });

    // Quiz Chapter Filter
    elements.quizChapterFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.quizChapterFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.quizChapterFilter = btn.dataset.chap;
        resetQuiz();
      });
    });

    if (elements.quizSubmitBtn) {
      elements.quizSubmitBtn.addEventListener('click', submitExam);
    }

    if (elements.quizResetBtn) {
      elements.quizResetBtn.addEventListener('click', resetQuiz);
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    setupEventListeners();
    updateProgressUI();
    switchTab('timeline');
  });

})();
