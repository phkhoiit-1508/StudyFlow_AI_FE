import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Play,
  Sparkles,
} from "lucide-react"
import "./landing.css"

type Destination = "Dashboard" | "Planner" | "Study" | "Quiz"

export default function Landing({
  open,
}: {
  open: (page: Destination) => void
}) {
  return (
    <div className="sf-landing">
      <a className="skip-link" href="#landing-main">
        Bỏ qua đến nội dung chính
      </a>
      <header className="land-header">
        <a
          className="land-brand"
          href="#home"
          aria-label="StudyFlow AI · trang chủ"
        >
          <img
            src="/brand/logo-horizontal-light-transparent.png"
            alt="StudyFlow AI"
          />
        </a>
        <nav aria-label="Điều hướng trang giới thiệu">
          <a href="#home">Trang chủ</a>
          <a href="#features">Tính năng</a>
          <a href="#how-it-works">Cách hoạt động</a>
        </nav>
        <button className="land-top-cta" onClick={() => open("Dashboard")}>
          Mở không gian demo <ArrowRight size={16} />
        </button>
      </header>
      <main id="landing-main">
        <section id="home" className="land-hero">
          <div className="land-hero-copy">
            <span className="land-kicker">
              <span className="land-kicker-dot" /> KHÔNG GIAN HỌC TẬP THÔNG MINH
            </span>
            <h1 tabIndex={-1}>
              Học đúng nhịp.
              <br />
              <em>Tiến xa hơn.</em>
            </h1>
            <p>
              StudyFlow AI giúp bạn sắp xếp thời gian, hiểu bài sâu hơn và biết
              nên ôn gì tiếp theo — trong một không gian học tập liền mạch.
            </p>
            <div className="land-hero-actions">
              <button
                className="land-button land-primary"
                onClick={() => open("Dashboard")}
              >
                Khám phá bản demo <ArrowRight size={19} />
              </button>
              <a className="land-button land-outline" href="#features">
                Xem tính năng <ChevronRight size={18} />
              </a>
            </div>
            <div className="land-hero-foot">
              <span>
                <Check size={15} /> Kế hoạch do bạn xác nhận
              </span>
              <span>
                <Check size={15} /> Nội dung demo được ghi rõ
              </span>
            </div>
          </div>
          <div
            className="land-visual"
            role="img"
            aria-label="Minh họa vòng học tập: lên kế hoạch, học tập, ôn tập và cải thiện"
          >
            <div className="land-halo halo-one" />
            <div className="land-halo halo-two" />
            <div className="land-visual-center">
              <div className="land-center-icon">
                <Sparkles size={30} />
              </div>
              <strong>Find your flow</strong>
              <span>Plan · Learn · Improve</span>
            </div>
            <div className="land-float-card planner">
              <span className="land-float-icon">
                <CalendarDays size={19} />
              </span>
              <div>
                <small>01 · LẬP KẾ HOẠCH</small>
                <strong>Tuần học rõ ràng</strong>
                <i>
                  <b />
                </i>
              </div>
            </div>
            <div className="land-float-card study">
              <span className="land-float-icon">
                <BookOpen size={19} />
              </span>
              <div>
                <small>02 · HỌC CÙNG COPILOT</small>
                <strong>Gợi ý từng bước</strong>
                <span className="land-mini-lines">
                  <b />
                  <b />
                </span>
              </div>
            </div>
            <div className="land-float-card assess">
              <span className="land-float-icon">
                <ClipboardCheck size={19} />
              </span>
              <div>
                <small>03 · ÔN TẬP</small>
                <strong>Hiểu mình cần cải thiện gì</strong>
                <span className="land-mini-pills">
                  <b />
                  <b />
                  <b />
                </span>
              </div>
            </div>
            <div className="land-orbit-dot one" />
            <div className="land-orbit-dot two" />
            <div className="land-orbit-dot three" />
          </div>
        </section>
        <section id="features" className="land-section land-features">
          <div className="land-section-head">
            <span className="land-kicker">
              MỘT HỆ THỐNG, BA CÁCH GIÚP BẠN TIẾN BỘ
            </span>
            <h2>
              Tập trung vào việc học.
              <br />
              <em>Phần còn lại, đã có dòng chảy.</em>
            </h2>
            <p>
              Ba trải nghiệm kết nối với nhau, và bạn có thể bắt đầu từ bất kỳ
              đâu.
            </p>
          </div>
          <div className="land-feature-grid">
            <article className="land-feature lime">
              <span className="land-feature-number">01 / PLAN</span>
              <div className="land-feature-icon">
                <CalendarDays size={26} />
              </div>
              <h3>Lập kế hoạch học tập</h3>
              <p>
                Biến hạn chót và thời gian rảnh thành một đề xuất lịch khả thi.
                Bạn xem lại và tự quyết định trước khi xác nhận.
              </p>
              <button onClick={() => open("Planner")}>
                Mở Planner <ArrowRight size={18} />
              </button>
            </article>
            <article className="land-feature lilac">
              <span className="land-feature-number">02 / LEARN</span>
              <div className="land-feature-icon">
                <Sparkles size={26} />
              </div>
              <h3>Học cùng Copilot</h3>
              <p>
                Giữ sự tập trung với mục tiêu rõ ràng, gợi ý theo từng bước và
                nội dung có nguồn được hiển thị minh bạch.
              </p>
              <button onClick={() => open("Study")}>
                Bắt đầu học <ArrowRight size={18} />
              </button>
            </article>
            <article className="land-feature peach">
              <span className="land-feature-number">03 / IMPROVE</span>
              <div className="land-feature-icon">
                <ClipboardCheck size={26} />
              </div>
              <h3>Ôn tập & cải thiện</h3>
              <p>
                Luyện câu hỏi mẫu, xem lại lỗi và chuyển gợi ý ôn tập thành đề
                xuất mới trong kế hoạch của bạn.
              </p>
              <button onClick={() => open("Quiz")}>
                Thử bài ôn tập <ArrowRight size={18} />
              </button>
            </article>
          </div>
        </section>
        <section id="how-it-works" className="land-section land-how">
          <div className="land-how-copy">
            <span className="land-kicker">CÁCH STUDYFLOW HOẠT ĐỘNG</span>
            <h2>
              Một nhịp học
              <br />
              <em>được thiết kế cho bạn.</em>
            </h2>
            <p>
              Lập kế hoạch là điểm khởi đầu. Từ đó, bạn có thể học với nguồn rõ
              ràng, thử bài ôn tập nếu muốn, rồi đưa gợi ý cải thiện trở lại
              Planner.
            </p>
            <button
              className="land-button land-dark"
              onClick={() => open("Dashboard")}
            >
              Mở không gian học tập <ArrowRight size={18} />
            </button>
          </div>
          <div className="land-steps">
            <div>
              <span>01</span>
              <strong>Lên kế hoạch</strong>
              <small>Nhập việc học và thời gian rảnh.</small>
            </div>
            <div>
              <span>02</span>
              <strong>Tập trung học</strong>
              <small>Bắt đầu trực tiếp hoặc từ lịch đã duyệt.</small>
            </div>
            <div>
              <span>03</span>
              <strong>
                Tự đánh giá <i>tùy chọn</i>
              </strong>
              <small>Làm bài demo và xem bằng chứng hiện có.</small>
            </div>
            <div>
              <span>04</span>
              <strong>Điều chỉnh</strong>
              <small>Lịch ôn tập mới luôn cần bạn xác nhận.</small>
            </div>
          </div>
        </section>
        <section className="land-final">
          <div>
            <span className="land-kicker">BẮT ĐẦU THEO CÁCH CỦA BẠN</span>
            <h2>Sẵn sàng học nhẹ đầu hơn?</h2>
            <p>
              Khám phá StudyFlow AI qua không gian demo. Không cần tạo tài
              khoản.
            </p>
          </div>
          <button
            className="land-button land-primary"
            onClick={() => open("Dashboard")}
          >
            Mở bản demo <Play size={17} />
          </button>
        </section>
      </main>
      <footer className="land-footer">
        <img
          src="/brand/logo-horizontal-light-transparent.png"
          alt="StudyFlow AI"
        />
        <span>
          Giao diện minh họa cho dự án học thuật · Chưa kết nối AI hoặc dữ liệu
          khóa học thật.
        </span>
        <button onClick={() => open("Dashboard")}>
          Vào không gian học tập <ArrowRight size={15} />
        </button>
      </footer>
    </div>
  )
}
