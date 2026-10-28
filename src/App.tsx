import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  ChartNoAxesCombined,
  FolderOpen,
  Settings,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sparkles,
  Check,
  AlertTriangle,
  Play,
  Pause,
  X,
  Trash2,
  Pencil,
  FileText,
  Send,
  RotateCcw,
  Menu,
  Target,
  CircleHelp,
  Search,
  Bell,
  Home,
} from "lucide-react"
import {
  type AcademicTask,
  type AvailabilitySlot,
  type Commitment,
  type PlannedStudyBlock,
  type StudyPlan,
  type QuizAttempt,
  type StudySession,
  type SessionOutcome,
  type LearningMaterial,
  type AssessmentResult,
  type VerifiedQuestion,
  localDate,
  fromLocalDate,
  addDays,
  startOfWeek,
  formatDate,
  formatTime,
  daysUntil,
  validateTask,
  generatePlan,
  gradeAttempt,
} from "./domain"
import "./app.css"
import Landing from "./Landing"
import AssistantPanel from "./AssistantPanel"
import {
  demoAssistantService,
  type AssistantAction,
  type AssistantChoice,
  type AssistantContext,
  type AssistantMessage,
} from "./assistant"

type Page = "Dashboard" | "Planner" | "Study" | "Quiz" | "Results" | "Materials"
const nav = [
  { id: "Dashboard" as Page, label: "Tổng quan", icon: LayoutDashboard },
  { id: "Planner" as Page, label: "Lập kế hoạch", icon: CalendarDays },
  { id: "Study" as Page, label: "Học tập", icon: BookOpen },
  { id: "Quiz" as Page, label: "Bài ôn tập", icon: ClipboardCheck },
  { id: "Results" as Page, label: "Kết quả", icon: ChartNoAxesCombined },
  { id: "Materials" as Page, label: "Tài liệu", icon: FolderOpen },
]
const today = () => new Date()
const nextDate = (days: number) => localDate(addDays(today(), days))
const demoTasks: AcademicTask[] = [
  {
    id: "task-1",
    title: "Luyện đạo hàm riêng",
    course: "Giải tích",
    deadline: nextDate(3),
    estimatedMinutes: 120,
    remainingMinutes: 120,
    priority: "Cao",
    confirmed: true,
  },
  {
    id: "task-2",
    title: "Hoàn thiện báo cáo nhóm",
    course: "Kỹ thuật phần mềm",
    deadline: nextDate(5),
    estimatedMinutes: 90,
    remainingMinutes: 90,
    priority: "Trung bình",
    confirmed: true,
  },
  {
    id: "task-3",
    title: "Ôn mô hình OSI",
    course: "Mạng máy tính",
    deadline: nextDate(7),
    estimatedMinutes: 60,
    remainingMinutes: 60,
    priority: "Thấp",
    confirmed: true,
  },
]
const demoSlots: AvailabilitySlot[] = [0, 1, 2, 3, 4, 5].map((day) => ({
  id: `slot-${day}`,
  day,
  startMinute: 17 * 60,
  endMinute: 19 * 60,
}))
const questions: VerifiedQuestion[] = [
  {
    id: "q1",
    course: "Giải tích",
    topic: "Đạo hàm riêng",
    prompt: "Với f(x, y) = x²y + 3y, đạo hàm riêng theo x là gì?",
    choices: ["2xy", "x² + 3", "2x + 3y", "x²y"],
    answerIndex: 0,
    status: "demo",
    sourceId: "passage-1",
  },
  {
    id: "q2",
    course: "Giải tích",
    topic: "Đạo hàm riêng",
    prompt: "Khi lấy đạo hàm riêng theo y, biến x được xem như thế nào?",
    choices: ["Là biến phụ thuộc", "Là hằng số", "Bằng 0", "Bằng 1"],
    answerIndex: 1,
    status: "demo",
    sourceId: "passage-1",
  },
  {
    id: "q3",
    course: "Giải tích",
    topic: "Đạo hàm riêng",
    prompt: "Với f(x, y) = x²y + 3y, đạo hàm riêng theo y là gì?",
    choices: ["2xy", "x² + 3", "x²y", "3y"],
    answerIndex: 1,
    status: "demo",
    sourceId: "passage-1",
  },
]
const passage = {
  id: "passage-1",
  title: "Đoạn ví dụ do nhóm biên soạn",
  topic: "Đạo hàm riêng",
  text: "Đạo hàm riêng của hàm nhiều biến được tính theo một biến trong khi giữ các biến còn lại cố định. Ví dụ, với f(x, y) = x²y + 3y, ta có ∂f/∂x = 2xy và ∂f/∂y = x² + 3.",
  status: "demo" as const,
}
const storageKey = "studyflow-demo-v1"
const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}")
  } catch {
    return {}
  }
}
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  type = "button",
  className = "",
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
  title?: string
}) {
  return (
    <button
      type={type}
      className={`sf-button sf-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}
function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`sf-panel ${className}`}>
      {title && (
        <div className="sf-panel-head">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "neutral" | "blue" | "green" | "amber" | "violet" | "red"
}) {
  return <span className={`sf-badge sf-badge-${tone}`}>{children}</span>
}
function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof FolderOpen
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="sf-empty">
      <Icon size={28} />
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  )
}
function Modal({
  title,
  close,
  children,
}: {
  title: string
  close: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.showModal()
    return () => {
      ref.current?.close()
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className="sf-dialog"
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      aria-label={title}
    >
      <div className="sf-dialog-inner">
        <div className="sf-panel-head">
          <h2>{title}</h2>
          <Button variant="ghost" onClick={close} title="Đóng">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

export default function App() {
  const stored = useRef(readStore())
  const [showLanding, setShowLanding] = useState(true)
  const [page, setPage] = useState<Page>("Dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    localDate(today()),
  )
  const [tasks, setTasks] = useState<AcademicTask[]>(
    () => stored.current.tasks || demoTasks,
  )
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    () => stored.current.slots || demoSlots,
  )
  const [commitments, setCommitments] = useState<Commitment[]>(
    () => stored.current.commitments || [],
  )
  const [confirmed, setConfirmed] = useState<PlannedStudyBlock[]>(
    () => stored.current.confirmed || [],
  )
  const [proposal, setProposal] = useState<StudyPlan | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] =
    useState<"task" | "availability" | "commitment" | "reflection" | "submit" | "settings" | "notifications" | null>(
      null,
    )
  const [editing, setEditing] = useState<AcademicTask | null>(null)
  const [notice, setNotice] = useState("")
  const [mobileNav, setMobileNav] = useState(false)
  const [study, setStudy] = useState<StudySession | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantBusy, setAssistantBusy] = useState(false)
  const [assistantMessages, setAssistantMessages] =
    useState<AssistantMessage[]>([
      {
        id: "welcome",
        role: "assistant",
        text: "Chào bạn! Mình có thể giúp tìm đúng bước tiếp theo trong StudyFlow. Hãy nói mục tiêu học tập của bạn hoặc chọn một yêu cầu gợi ý.",
      },
    ])
  const [pendingReplanContext, setPendingReplanContext] =
    useState<AssistantContext | null>(null)
  const [assistantHandoff, setAssistantHandoff] =
    useState<AssistantContext | null>(null)
  const [outcomes, setOutcomes] = useState<SessionOutcome[]>(
    () => stored.current.outcomes || [],
  )
  const [running, setRunning] = useState(false)
  const [reflection, setReflection] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [hintLevel, setHintLevel] = useState(0)
  const [messages, setMessages] = useState<string[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizCourse, setQuizCourse] = useState("Giải tích")
  const [quizTopic, setQuizTopic] = useState("Đạo hàm riêng")
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<AssessmentResult | null>(
    () => stored.current.result || null,
  )
  const [revisionTask, setRevisionTask] = useState<AcademicTask | null>(null)
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [manualTitle, setManualTitle] = useState("")
  const [manualText, setManualText] = useState("")
  const [manualCourse, setManualCourse] = useState("Giải tích")
  const [fileError, setFileError] = useState("")
  const [taskForm, setTaskForm] = useState({
    title: "",
    course: "Giải tích",
    deadline: nextDate(3),
    estimatedMinutes: 60,
    remainingMinutes: 60,
    priority: "Trung bình" as AcademicTask["priority"],
  })
  const [availabilityForm, setAvailabilityForm] = useState({
    day: 0,
    start: "17:00",
    end: "19:00",
  })
  const [commitmentForm, setCommitmentForm] = useState({
    date: nextDate(1),
    start: "14:00",
    end: "15:00",
    title: "",
  })
  const weekStart = addDays(startOfWeek(today()), weekOffset * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const activeTasks = tasks.filter((t) => t.remainingMinutes > 0)
  const deadlineSoon = activeTasks.filter(
    (t) => daysUntil(t.deadline) >= 0 && daysUntil(t.deadline) <= 7,
  )
  const doneCount = tasks.filter((t) => t.remainingMinutes === 0).length
  const courseNames = [...new Set(tasks.map((t) => t.course))]
  const visibleTasks = tasks.filter((t) =>
    `${t.title} ${t.course}`
      .toLocaleLowerCase("vi-VN")
      .includes(searchQuery.toLocaleLowerCase("vi-VN")),
  )
  const availableQuestions = questions.filter(
    (q) =>
      q.course === quizCourse &&
      q.topic.toLocaleLowerCase("vi-VN") ===
        quizTopic.trim().toLocaleLowerCase("vi-VN") &&
      q.status === "demo",
  )
  const currentQuestion = availableQuestions[quizIndex]
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        tasks,
        slots,
        commitments,
        confirmed,
        outcomes,
        result,
      }),
    )
  }, [tasks, slots, commitments, confirmed, outcomes, result])
  useEffect(() => {
    document.documentElement.lang = "vi"
    document.title = showLanding
      ? "StudyFlow AI | Học đúng nhịp"
      : `${nav.find((n) => n.id === page)?.label} | StudyFlow AI`
  }, [page, showLanding])
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(
      () =>
        setStudy((s) =>
          s ? { ...s, elapsedSeconds: s.elapsedSeconds + 1 } : s,
        ),
      1000,
    )
    return () => clearInterval(timer)
  }, [running])
  const goto = (next: Page) => {
    setPage(next)
    setShowLanding(false)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: "instant" })
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".sf-main h1")?.focus(),
    )
  }
  const openLanding = () => {
    setShowLanding(true)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: "instant" })
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".land-hero h1")?.focus(),
    )
  }
  const notify = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice(""), 5000)
  }
  const openTask = (task?: AcademicTask) => {
    setEditing(task || null)
    setTaskForm(
      task
        ? {
            title: task.title,
            course: task.course,
            deadline: task.deadline,
            estimatedMinutes: task.estimatedMinutes,
            remainingMinutes: task.remainingMinutes,
            priority: task.priority,
          }
        : {
            title: "",
            course: "Giải tích",
            deadline: nextDate(3),
            estimatedMinutes: 60,
            remainingMinutes: 60,
            priority: "Trung bình",
          },
    )
    setModal("task")
  }
  const saveTask = (e: FormEvent) => {
    e.preventDefault()
    const task: AcademicTask = {
      id: editing?.id || id(),
      ...taskForm,
      confirmed: true,
    }
    const error = validateTask(task)
    if (error) {
      notify(error)
      return
    }
    setTasks((ts) =>
      editing ? ts.map((t) => (t.id === editing.id ? task : t)) : [...ts, task],
    )
    setProposal(null)
    setModal(null)
    notify("Đã lưu công việc. Hãy tạo lại đề xuất lịch nếu cần.")
  }
  const makePlan = () => {
    const allTasks = revisionTask ? [...tasks, revisionTask] : tasks
    const next = generatePlan(
      allTasks,
      slots,
      commitments,
      confirmed,
      weekStart,
    )
    setProposal(next)
    goto("Planner")
    notify(
      next.blocks.length
        ? "Đề xuất đã sẵn sàng để xem và xác nhận."
        : "Chưa thể xếp buổi học trong tuần này.",
    )
  }
  const approvePlan = () => {
    if (!proposal) return
    setConfirmed((bs) => [
      ...bs,
      ...proposal.blocks.map((b) => ({ ...b, status: "confirmed" as const })),
    ])
    if (revisionTask) {
      setTasks((ts) => [...ts, revisionTask])
      setRevisionTask(null)
    }
    setAssistantHandoff(null)
    setProposal(null)
    notify("Đã xác nhận lịch học trong bản demo.")
  }
  const startStudy = (task?: AcademicTask, context?: AssistantContext) => {
    const course = context
      ? context.course || "Chưa chọn môn"
      : task?.course || "Giải tích"
    const topic = context
      ? context.topic || "Chưa chọn chủ đề"
      : task?.title || "Đạo hàm riêng"
    setStudy({
      id: id(),
      course,
      topic,
      goal:
        context?.goal ||
        (task
          ? `Tập trung vào ${task.title.toLowerCase()}`
          : "Hiểu cách tính đạo hàm riêng"),
      sourceId:
        course === "Giải tích" && /đạo hàm riêng/i.test(topic)
          ? "passage-1"
          : undefined,
      origin: context ? "assistant" : task ? "planner" : "direct",
      status: "active",
      elapsedSeconds: 0,
    })
    setRunning(true)
    setMessages([])
    setHintLevel(0)
    goto("Study")
  }
  const submitQuiz = () => {
    if (availableQuestions.some((q) => answers[q.id] === undefined)) {
      notify(`Hãy trả lời đủ ${availableQuestions.length} câu trước khi gửi.`)
      return
    }
    setModal("submit")
  }
  const confirmQuiz = () => {
    const attempt: QuizAttempt = {
      id: id(),
      questionIds: availableQuestions.map((q) => q.id),
      answers,
      submittedAt: new Date().toISOString(),
      mode: "demo",
    }
    setResult(gradeAttempt(availableQuestions, attempt))
    setModal(null)
    goto("Results")
  }
  const handoffRevision = () => {
    if (!result) return
    const task: AcademicTask = {
      id: id(),
      title: "Ôn tập đạo hàm riêng",
      course: "Giải tích",
      deadline: nextDate(7),
      estimatedMinutes: 60,
      remainingMinutes: 60,
      priority: "Cao",
      confirmed: true,
    }
    setRevisionTask(task)
    setAssistantHandoff(null)
    setProposal(null)
    goto("Planner")
    notify(
      "Đã chuyển đề xuất ôn tập sang Planner. Lịch xác nhận chưa thay đổi.",
    )
  }
  const applyAssistantAction = (
    action: AssistantAction,
    context: AssistantContext,
  ) => {
    setAssistantOpen(false)
    if (action === "OPEN_PLANNER") {
      setSearchQuery(context.course || "")
      setAssistantHandoff(context)
      goto("Planner")
    } else if (action === "OPEN_TASK") {
      goto("Planner")
      setTaskForm((form) => ({
        ...form,
        course: context.course || form.course,
        title: context.topic || form.title,
        deadline: context.targetDate || form.deadline,
      }))
      setEditing(null)
      setModal("task")
    } else if (action === "OPEN_STUDY") {
      startStudy(undefined, context)
    } else if (action === "OPEN_QUIZ") {
      setQuizCourse(
        context.course || (context.topic ? "Chưa chọn môn" : "Giải tích"),
      )
      setQuizTopic(
        context.topic ||
          (context.course === "Giải tích" || !context.course
            ? "Đạo hàm riêng"
            : ""),
      )
      setQuizIndex(0)
      setAnswers({})
      goto("Quiz")
    } else if (action === "OPEN_RESULTS") {
      goto("Results")
    } else if (action === "OPEN_MATERIALS") {
      goto("Materials")
    } else if (
      action === "PROPOSE_REPLAN" &&
      context.course &&
      context.durationMinutes &&
      context.targetDate
    ) {
      const proposedTask: AcademicTask = {
        id: id(),
        title: context.topic
          ? `Ôn ${context.topic}`
          : `Học thêm ${context.course}`,
        course: context.course,
        deadline: context.targetDate,
        preferredDate: context.targetDate,
        estimatedMinutes: context.durationMinutes,
        remainingMinutes: context.durationMinutes,
        priority: "Trung bình",
        confirmed: true,
      }
      setRevisionTask(proposedTask)
      setAssistantHandoff(context)
      const targetWeek = startOfWeek(fromLocalDate(context.targetDate))
      setWeekOffset(
        Math.round(
          (targetWeek.getTime() - startOfWeek(today()).getTime()) / 604800000,
        ),
      )
      setProposal(
        generatePlan(
          [...tasks, proposedTask],
          slots,
          commitments,
          confirmed,
          targetWeek,
        ),
      )
      goto("Planner")
    }
  }
  const sendAssistant = (text: string) => {
    if (assistantBusy || !text.trim()) return
    setAssistantMessages((all) => [...all, { id: id(), role: "user", text }])
    setAssistantBusy(true)
    window.setTimeout(() => {
      const knownCourse =
        pendingReplanContext &&
        [
          ...courseNames,
          "Giải tích",
          "Mạng máy tính",
          "Kỹ thuật phần mềm",
        ].find((name) =>
          text
            .toLocaleLowerCase("vi-VN")
            .includes(name.toLocaleLowerCase("vi-VN")),
        )
      const decision =
        knownCourse && pendingReplanContext
          ? {
              intent: "REQUEST_REVISION" as const,
              message: `Đã tạo đề xuất ${pendingReplanContext.durationMinutes} phút cho ${knownCourse} vào ${pendingReplanContext.targetDate}. Hãy kiểm tra trước khi xác nhận.`,
              action: "PROPOSE_REPLAN" as const,
              context: { ...pendingReplanContext, course: knownCourse },
            }
          : demoAssistantService.interpret({
              text,
              courses: [
                ...new Set([
                  ...courseNames,
                  "Giải tích",
                  "Mạng máy tính",
                  "Kỹ thuật phần mềm",
                ]),
              ],
              hasResult: !!result,
              now: today(),
            })
      setAssistantMessages((all) => [
        ...all,
        {
          id: id(),
          role: "assistant",
          text: decision.message,
          choices: decision.choices,
          intent: decision.intent,
        },
      ])
      setPendingReplanContext(
        decision.action === "NONE" &&
          decision.context.durationMinutes &&
          decision.context.targetDate &&
          !decision.context.course
          ? decision.context
          : null,
      )
      setAssistantBusy(false)
      if (decision.action !== "NONE")
        applyAssistantAction(decision.action, decision.context)
    }, 240)
  }
  const chooseAssistant = (choice: AssistantChoice) => {
    setAssistantMessages((all) => [
      ...all,
      { id: id(), role: "user", text: choice.label },
    ])
    setPendingReplanContext(null)
    applyAssistantAction(choice.action, choice.context)
  }
  const dateLabel = (date: string) => {
    const days = daysUntil(date)
    return days < 0
      ? "Đã quá hạn"
      : days === 0
        ? "Hôm nay"
        : days === 1
          ? "Ngày mai"
          : `Còn ${days} ngày`
  }
  if (showLanding) return <Landing open={goto} />
  return (
    <div className="sf-app">
      <a href="#main" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>
      <aside className={`sf-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="sf-logo">
          <img
            src="/brand/logo-horizontal-light-transparent.png"
            alt="StudyFlow AI"
          />
          <button
            className="sf-mobile-close"
            onClick={() => setMobileNav(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="sf-sidebar-label">KHÔNG GIAN HỌC TẬP</div>
        <nav aria-label="Điều hướng chính">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`sf-nav ${page === n.id ? "active" : ""}`}
              onClick={() => goto(n.id)}
              aria-current={page === n.id ? "page" : undefined}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {page === n.id && <span className="sf-nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sf-sidebar-bottom">
          <button className="sf-loop" onClick={() => startStudy()}>
            <Sparkles size={18} />
            <strong>Học cùng Copilot</strong>
            <p>
              Bắt đầu buổi học và xem gợi ý minh họa theo từng bước{" "}
              <ArrowRight size={13} />
            </p>
          </button>
          <button className="sf-nav" onClick={openLanding}>
            <Home size={18} /> Trang giới thiệu
          </button>
          <button className="sf-nav" onClick={() => setModal("settings")}>
            <Settings size={18} />
            Cài đặt & trợ giúp
          </button>
          <div className="sf-demo-note">
            Bản demo frontend · dữ liệu lưu trên thiết bị
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="sf-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Đóng menu"
        />
      )}
      <div className="sf-body">
        <header className="sf-topbar">
          <button
            className="sf-menu"
            onClick={() => setMobileNav(true)}
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <div className="sf-breadcrumb">
            <span className="sf-breadcrumb-prefix">Không gian học tập</span>{" "}
            <ChevronRight size={15} className="sf-breadcrumb-chevron" />{" "}
            <strong>{nav.find((n) => n.id === page)?.label}</strong>
          </div>
          <form
            className="sf-header-search"
            onSubmit={(e) => {
              e.preventDefault()
              goto("Planner")
            }}
          >
            <Search size={16} />
            <input
              aria-label="Tìm công việc"
              placeholder="Tìm công việc hoặc môn học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="sf-top-right">
            <button
              className="sf-top-icon"
              onClick={() => {
                goto("Planner")
                openTask()
              }}
              aria-label="Thêm công việc"
            >
              <Plus size={18} />
            </button>
            <button
              className="sf-top-icon"
              onClick={() => setModal("notifications")}
              aria-label="Xem hạn chót"
            >
              <Bell size={18} />
              {deadlineSoon.length > 0 && <i />}
            </button>
            <span className="sf-avatar">SV</span>
          </div>
        </header>
        <main id="main" className="sf-main">
          <div className="sf-page-head">
            <div>
              <div className="sf-eyebrow">
                STUDYFLOW AI <span>·</span>{" "}
                {today().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <h1 tabIndex={-1}>
                {page === "Dashboard"
                  ? "Chào bạn, hôm nay mình học gì?"
                  : nav.find((n) => n.id === page)?.label}
              </h1>
              <p>
                {
                  ({
                    Dashboard:
                      "Một góc nhìn rõ ràng về công việc và bước học tiếp theo.",
                    Planner:
                      "Sắp xếp thời gian học khả thi, rồi tự tay xác nhận kế hoạch.",
                    Study:
                      "Không gian tập trung với gợi ý và tài liệu có nguồn rõ ràng.",
                    Quiz: "Luyện tập với bộ câu hỏi mẫu do nhóm biên soạn.",
                    Results: "Xem kết quả và chọn bước ôn tập tiếp theo.",
                    Materials:
                      "Quản lý tài liệu được phép sử dụng và ghi chú của bạn.",
                  } as Record<Page, string>)[page]
                }
              </p>
            </div>
            {page === "Planner" && (
              <Button variant="primary" onClick={() => openTask()}>
                <Plus size={17} /> Thêm công việc
              </Button>
            )}
          </div>
          {page === "Dashboard" && (
            <>
              <div className="sf-welcome">
                <div>
                  <Badge tone="blue">HÀNH TRÌNH HỌC TẬP</Badge>
                  <h2>
                    Kế hoạch rõ ràng.
                    <br />
                    Mỗi ngày tiến một chút.
                  </h2>
                  <p>
                    Bắt đầu từ công việc quan trọng nhất của bạn, rồi để
                    StudyFlow giúp bạn giữ nhịp.
                  </p>
                  <Button variant="primary" onClick={() => goto("Planner")}>
                    Xem kế hoạch <ArrowRight size={17} />
                  </Button>
                </div>
                <div className="sf-welcome-art">
                  <div className="sf-art-orbit">
                    <Sparkles size={34} />
                  </div>
                  <span className="sf-art-card one">
                    01 <b>Lên kế hoạch</b>
                  </span>
                  <span className="sf-art-card two">
                    02 <b>Tập trung học</b>
                  </span>
                  <span className="sf-art-card three">
                    03 <b>Ôn tập</b>
                  </span>
                </div>
              </div>
              <div className="sf-stats">
                <div className="sf-stat">
                  <span className="sf-stat-icon blue">
                    <ClipboardCheck size={21} />
                  </span>
                  <strong>{activeTasks.length}</strong>
                  <p>Công việc còn lại</p>
                </div>
                <div className="sf-stat">
                  <span className="sf-stat-icon amber">
                    <CalendarDays size={21} />
                  </span>
                  <strong>{deadlineSoon.length}</strong>
                  <p>Hạn trong 7 ngày</p>
                </div>
                <div className="sf-stat">
                  <span className="sf-stat-icon violet">
                    <Clock3 size={21} />
                  </span>
                  <strong>{confirmed.length}</strong>
                  <p>Buổi học đã xác nhận</p>
                </div>
                <div className="sf-stat">
                  <span className="sf-stat-icon green">
                    <Check size={21} />
                  </span>
                  <strong>{doneCount}</strong>
                  <p>Công việc hoàn thành</p>
                </div>
              </div>
              <div className="sf-dashboard-showcase">
                <Panel
                  title="Môn học của bạn"
                  action={
                    <span className="sf-dashboard-subtle">
                      Dữ liệu demo theo công việc
                    </span>
                  }
                >
                  {courseNames.length ? (
                    <div className="sf-course-grid">
                      {courseNames.map((course, index) => {
                        const count = tasks.filter(
                          (t) => t.course === course && t.remainingMinutes > 0,
                        ).length
                        const Icon = [BookOpen, Target, CalendarDays][index % 3]
                        return (
                          <button
                            key={course}
                            className={`sf-course-card tone-${index % 3}`}
                            onClick={() => {
                              setSearchQuery(course)
                              goto("Planner")
                            }}
                          >
                            <span className="sf-course-card-icon">
                              <Icon size={23} />
                            </span>
                            <strong>{course}</strong>
                            <small>{count} công việc đang mở</small>
                            <ArrowRight size={17} />
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <Empty
                      icon={BookOpen}
                      title="Chưa có môn học"
                      body="Thêm công việc đầu tiên để môn học xuất hiện ở đây."
                    />
                  )}
                </Panel>
                <Panel
                  title="Lịch trong tuần"
                  action={
                    <div className="sf-mini-calendar-actions">
                      <button
                        onClick={() => setWeekOffset((w) => w - 1)}
                        aria-label="Tuần trước"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => setWeekOffset((w) => w + 1)}
                        aria-label="Tuần sau"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  }
                >
                  <div className="sf-mini-calendar-month">
                    {weekDays[0].toLocaleDateString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="sf-mini-calendar-grid">
                    {weekDays.map((day, index) => {
                      const value = localDate(day)
                      const hasStudy = confirmed.some((b) => b.date === value)
                      const hasDeadline = tasks.some(
                        (t) => t.deadline === value && t.remainingMinutes > 0,
                      )
                      return (
                        <button
                          key={value}
                          className={`${
                            value === localDate(today()) ? "today" : ""
                          } ${
                            value === selectedCalendarDate ? "selected" : ""
                          }`}
                          onClick={() => setSelectedCalendarDate(value)}
                          aria-label={`${["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"][index]}, ${formatDate(value)}`}
                          aria-pressed={value === selectedCalendarDate}
                        >
                          <small>
                            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}
                          </small>
                          <strong>{day.getDate()}</strong>
                          <span>
                            {hasStudy && <i className="study" />}
                            {hasDeadline && <i className="deadline" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="sf-mini-calendar-detail">
                    <strong>{formatDate(selectedCalendarDate)}</strong>
                    <span>
                      {
                        confirmed.filter((b) => b.date === selectedCalendarDate)
                          .length
                      }{" "}
                      buổi học đã xác nhận ·{" "}
                      {
                        tasks.filter(
                          (t) =>
                            t.deadline === selectedCalendarDate &&
                            t.remainingMinutes > 0,
                        ).length
                      }{" "}
                      hạn chót
                    </span>
                  </div>
                </Panel>
              </div>
              <div className="sf-grid-2">
                <Panel
                  title="Lịch học đã xác nhận"
                  action={
                    <Button variant="ghost" onClick={() => goto("Planner")}>
                      Mở lịch <ArrowRight size={16} />
                    </Button>
                  }
                >
                  {confirmed.length ? (
                    <div className="sf-list">
                      {confirmed
                        .slice()
                        .sort((a, b) =>
                          `${a.date}-${a.startMinute}`.localeCompare(
                            `${b.date}-${b.startMinute}`,
                          ),
                        )
                        .slice(0, 4)
                        .map((b) => (
                          <button
                            className="sf-list-row"
                            key={b.id}
                            onClick={() =>
                              startStudy(tasks.find((t) => t.id === b.taskId))
                            }
                          >
                            <span className="sf-date-box">
                              {formatDate(b.date)}
                            </span>
                            <span>
                              <strong>
                                {tasks.find((t) => t.id === b.taskId)?.title ||
                                  "Buổi học"}
                              </strong>
                              <small>
                                {formatTime(b.startMinute)}–
                                {formatTime(b.endMinute)} ·{" "}
                                {tasks.find((t) => t.id === b.taskId)?.course}
                              </small>
                            </span>
                            <Play size={17} />
                          </button>
                        ))}
                    </div>
                  ) : (
                    <Empty
                      icon={CalendarDays}
                      title="Chưa có lịch học được xác nhận"
                      body="Tạo đề xuất trong Planner và xác nhận trước khi buổi học xuất hiện ở đây."
                      action={
                        <Button
                          variant="primary"
                          onClick={() => goto("Planner")}
                        >
                          Mở Planner
                        </Button>
                      }
                    />
                  )}
                </Panel>
                <Panel
                  title="Hạn chót sắp tới"
                  action={
                    <Badge tone="amber">{deadlineSoon.length} công việc</Badge>
                  }
                >
                  {activeTasks.length ? (
                    <div className="sf-list">
                      {[...activeTasks]
                        .sort((a, b) => a.deadline.localeCompare(b.deadline))
                        .slice(0, 4)
                        .map((t) => (
                          <div className="sf-list-row" key={t.id}>
                            <span className="sf-course-mark">
                              {t.course.charAt(0)}
                            </span>
                            <span>
                              <strong>{t.title}</strong>
                              <small>
                                {t.course} · còn {t.remainingMinutes} phút
                              </small>
                            </span>
                            <Badge
                              tone={
                                daysUntil(t.deadline) <= 1 ? "red" : "amber"
                              }
                            >
                              {dateLabel(t.deadline)}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Empty
                      icon={Check}
                      title="Đã xử lý hết công việc"
                      body="Thêm công việc mới khi bạn có học phần hoặc hạn chót tiếp theo."
                    />
                  )}
                </Panel>
              </div>
              <div className="sf-grid-2 sf-dashboard-lower">
                <Panel
                  title="Tiếp tục học"
                  action={
                    <Button
                      variant="ghost"
                      onClick={() => (study ? goto("Study") : startStudy())}
                    >
                      Mở buổi học <ArrowRight size={16} />
                    </Button>
                  }
                >
                  {study ? (
                    <div className="sf-continue-card">
                      <span className="sf-continue-icon">
                        <BookOpen size={22} />
                      </span>
                      <span>
                        <strong>{study.topic}</strong>
                        <small>
                          {study.course} ·{" "}
                          {study.status === "completed"
                            ? "Đã xác nhận kết quả"
                            : study.status === "awaiting-confirmation"
                              ? "Chờ xác nhận tóm tắt"
                              : "Buổi học đang mở"}
                        </small>
                      </span>
                      <Button variant="primary" onClick={() => goto("Study")}>
                        Mở
                      </Button>
                    </div>
                  ) : confirmed.length ? (
                    <div className="sf-continue-card">
                      <span className="sf-continue-icon">
                        <BookOpen size={22} />
                      </span>
                      <span>
                        <strong>
                          {tasks.find((t) => t.id === confirmed[0].taskId)
                            ?.title || "Buổi học đã xác nhận"}
                        </strong>
                        <small>
                          Buổi học trong kế hoạch · sẵn sàng bắt đầu
                        </small>
                      </span>
                      <Button
                        variant="primary"
                        onClick={() =>
                          startStudy(
                            tasks.find((t) => t.id === confirmed[0].taskId),
                          )
                        }
                      >
                        Học ngay
                      </Button>
                    </div>
                  ) : (
                    <Empty
                      icon={BookOpen}
                      title="Chưa có buổi học"
                      body="Bạn có thể bắt đầu trực tiếp hoặc xác nhận một kế hoạch trong Planner."
                      action={
                        <Button onClick={() => startStudy()}>
                          Bắt đầu học
                        </Button>
                      }
                    />
                  )}
                </Panel>
                <Panel
                  title="Góc nhìn ôn tập"
                  action={
                    <Button variant="ghost" onClick={() => goto("Results")}>
                      Xem kết quả <ArrowRight size={16} />
                    </Button>
                  }
                >
                  {result ? (
                    <div className="sf-insight-card">
                      <span className="sf-insight-score">
                        {result.correctCount}/{result.total}
                      </span>
                      <span>
                        <strong>Bài ôn tập mẫu gần nhất</strong>
                        <small>
                          {result.recommendations[0]?.topic} ·{" "}
                          {result.recommendations[0]?.status ===
                          "insufficient-data"
                            ? "Bằng chứng còn ít"
                            : "Có gợi ý ôn tập"}
                        </small>
                      </span>
                      <Badge tone="violet">DEMO</Badge>
                    </div>
                  ) : (
                    <Empty
                      icon={ChartNoAxesCombined}
                      title="Chưa có kết quả ôn tập"
                      body="Làm bài mẫu để xem phản hồi dựa trên chính câu trả lời của bạn."
                      action={
                        <Button onClick={() => goto("Quiz")}>
                          Mở bài ôn tập
                        </Button>
                      }
                    />
                  )}
                </Panel>
              </div>
              <Panel title="Bắt đầu nhanh" className="sf-quick-panel">
                <div className="sf-quick">
                  <button
                    onClick={() => {
                      goto("Planner")
                      openTask()
                    }}
                  >
                    <span className="sf-quick-icon blue">
                      <Plus size={21} />
                    </span>
                    <strong>Thêm công việc</strong>
                    <small>Ghi lại hạn chót</small>
                    <ArrowRight size={16} />
                  </button>
                  <button onClick={makePlan}>
                    <span className="sf-quick-icon violet">
                      <CalendarDays size={21} />
                    </span>
                    <strong>Tạo kế hoạch</strong>
                    <small>Xem đề xuất lịch</small>
                    <ArrowRight size={16} />
                  </button>
                  <button onClick={() => startStudy()}>
                    <span className="sf-quick-icon green">
                      <BookOpen size={21} />
                    </span>
                    <strong>Bắt đầu học</strong>
                    <small>Buổi học trực tiếp</small>
                    <ArrowRight size={16} />
                  </button>
                  <button onClick={() => goto("Quiz")}>
                    <span className="sf-quick-icon amber">
                      <Target size={21} />
                    </span>
                    <strong>Làm bài ôn tập</strong>
                    <small>3 câu hỏi mẫu</small>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </Panel>
            </>
          )}
          {page === "Planner" && (
            <>
              <div className="sf-flow-banner">
                <div>
                  <Sparkles size={20} />
                  <span>
                    <strong>UC-01 · Tạo và xác nhận kế hoạch tuần</strong>
                    <small>
                      Thuật toán xếp lịch theo hạn chót, mức ưu tiên và thời
                      gian rảnh. Chỉ khi bạn xác nhận, lịch mới được lưu.
                    </small>
                  </span>
                </div>
                <Badge tone="violet">MÔ PHỎNG XÁC ĐỊNH</Badge>
              </div>
              {revisionTask && (
                <div className="sf-alert blue">
                  <Sparkles size={20} />
                  <span>
                    <strong>
                      {assistantHandoff
                        ? "Đề xuất từ StudyFlow Assistant"
                        : "Đề xuất ôn tập từ kết quả bài làm"}
                    </strong>
                    <small>
                      {revisionTask.title} · {revisionTask.remainingMinutes}{" "}
                      phút
                      {revisionTask.preferredDate
                        ? ` · ${formatDate(revisionTask.preferredDate)}`
                        : ""}
                      . Chưa thêm vào công việc hoặc lịch đã xác nhận.
                    </small>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRevisionTask(null)
                      setProposal(null)
                      setAssistantHandoff(null)
                    }}
                  >
                    Bỏ đề xuất
                  </Button>
                </div>
              )}
              <div className="sf-planner-actions">
                <Button onClick={() => setModal("availability")}>
                  <Clock3 size={17} /> Thời gian rảnh
                </Button>
                <Button onClick={() => setModal("commitment")}>
                  <Plus size={17} /> Cam kết bận
                </Button>
                <Button variant="primary" onClick={makePlan}>
                  <Sparkles size={17} /> Tạo đề xuất lịch
                </Button>
              </div>
              <div className="sf-planner-layout">
                <div className="sf-planner-side">
                  <Panel
                    title="Công việc học tập"
                    action={
                      <Badge tone="blue">
                        {
                          visibleTasks.filter((t) => t.remainingMinutes > 0)
                            .length
                        }{" "}
                        cần làm
                      </Badge>
                    }
                  >
                    {visibleTasks.length ? (
                      <div className="sf-task-list">
                        {visibleTasks.map((t) => (
                          <div className="sf-task" key={t.id}>
                            <div className="sf-task-top">
                              <Badge
                                tone={
                                  t.priority === "Cao"
                                    ? "red"
                                    : t.priority === "Trung bình"
                                      ? "amber"
                                      : "neutral"
                                }
                              >
                                {t.priority}
                              </Badge>
                              <button
                                onClick={() => openTask(t)}
                                aria-label={`Sửa ${t.title}`}
                              >
                                <Pencil size={16} />
                              </button>
                            </div>
                            <strong>{t.title}</strong>
                            <small>
                              {t.course} · {formatDate(t.deadline)} · còn{" "}
                              {t.remainingMinutes}/{t.estimatedMinutes} phút
                            </small>
                            <div className="sf-progress">
                              <i
                                style={{
                                  width: `${100 * (1 - t.remainingMinutes / t.estimatedMinutes)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        icon={ClipboardCheck}
                        title={
                          searchQuery
                            ? "Không tìm thấy công việc"
                            : "Chưa có công việc"
                        }
                        body={
                          searchQuery
                            ? "Thử tên công việc hoặc môn học khác trong ô tìm kiếm."
                            : "Thêm công việc với hạn chót và thời lượng để tạo kế hoạch."
                        }
                        action={
                          <Button onClick={() => openTask()}>
                            Thêm công việc
                          </Button>
                        }
                      />
                    )}
                  </Panel>
                  <Panel
                    title="Thời gian có thể học"
                    action={
                      <Button
                        variant="ghost"
                        onClick={() => setModal("availability")}
                      >
                        Chỉnh sửa
                      </Button>
                    }
                  >
                    <div className="sf-slot-list">
                      {slots.map((s) => (
                        <div key={s.id}>
                          <span>
                            {
                              [
                                "Thứ 2",
                                "Thứ 3",
                                "Thứ 4",
                                "Thứ 5",
                                "Thứ 6",
                                "Thứ 7",
                                "Chủ nhật",
                              ][s.day]
                            }
                          </span>
                          <strong>
                            {formatTime(s.startMinute)}–
                            {formatTime(s.endMinute)}
                          </strong>
                        </div>
                      ))}
                      {!slots.length && <p>Chưa khai báo thời gian rảnh.</p>}
                    </div>
                    {commitments.length > 0 && (
                      <p className="sf-muted sf-spaced">
                        {commitments.length} cam kết bận đã được loại khỏi đề
                        xuất.
                      </p>
                    )}
                  </Panel>
                </div>
                <div className="sf-planner-main">
                  <Panel
                    title={`Lịch tuần ${formatDate(localDate(weekDays[0]))} – ${formatDate(localDate(weekDays[6]))}`}
                    action={
                      <div className="sf-week-controls">
                        <button
                          onClick={() => setWeekOffset((w) => w - 1)}
                          aria-label="Tuần trước"
                        >
                          <ChevronLeft size={19} />
                        </button>
                        <button onClick={() => setWeekOffset(0)}>
                          Tuần này
                        </button>
                        <button
                          onClick={() => setWeekOffset((w) => w + 1)}
                          aria-label="Tuần sau"
                        >
                          <ChevronRight size={19} />
                        </button>
                      </div>
                    }
                  >
                    <div className="sf-calendar">
                      {weekDays.map((d, i) => {
                        const date = localDate(d)
                        const dayBlocks = [
                          ...confirmed,
                          ...(proposal?.blocks || []),
                        ]
                          .filter((b) => b.date === date)
                          .sort((a, b) => a.startMinute - b.startMinute)
                        return (
                          <div
                            className={`sf-calendar-day ${
                              date === localDate(today()) ? "today" : ""
                            }`}
                            key={date}
                          >
                            <div className="sf-calendar-date">
                              <small>
                                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}
                              </small>
                              <strong>{d.getDate()}</strong>
                            </div>
                            <div className="sf-calendar-events">
                              {dayBlocks.map((b) => (
                                <button
                                  key={b.id}
                                  className={`sf-calendar-event ${b.status}`}
                                  onClick={() =>
                                    b.status === "confirmed" &&
                                    startStudy(
                                      tasks.find((t) => t.id === b.taskId),
                                    )
                                  }
                                >
                                  <span>
                                    {formatTime(b.startMinute)}–
                                    {formatTime(b.endMinute)}
                                  </span>
                                  <strong>
                                    {[...tasks, revisionTask].find(
                                      (t) => t?.id === b.taskId,
                                    )?.title || "Buổi học"}
                                  </strong>
                                  <small>
                                    {b.status === "confirmed"
                                      ? "Đã xác nhận · Bắt đầu học"
                                      : "Đề xuất"}
                                  </small>
                                </button>
                              ))}
                              {commitments
                                .filter((c) => c.date === date)
                                .map((c) => (
                                  <div
                                    className="sf-calendar-event busy"
                                    key={c.id}
                                  >
                                    <span>
                                      {formatTime(c.startMinute)}–
                                      {formatTime(c.endMinute)}
                                    </span>
                                    <strong>{c.title}</strong>
                                    <small>Cam kết bận</small>
                                  </div>
                                ))}
                              {!dayBlocks.length &&
                                !commitments.some((c) => c.date === date) && (
                                  <span className="sf-calendar-empty">—</span>
                                )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="sf-calendar-legend">
                      <span>
                        <i className="confirmed" /> Đã xác nhận
                      </span>
                      <span>
                        <i className="proposed" /> Đề xuất
                      </span>
                      <span>
                        <i className="busy" /> Cam kết bận
                      </span>
                    </div>
                  </Panel>
                  {proposal && (
                    <Panel
                      title="Xem lại đề xuất"
                      action={<Badge tone="violet">CHƯA XÁC NHẬN</Badge>}
                    >
                      <p className="sf-muted">
                        {proposal.blocks.length} buổi học được đề xuất. Lịch
                        hiện tại sẽ chỉ thay đổi khi bạn chọn xác nhận.
                      </p>
                      {proposal.blocks.length > 0 && (
                        <div className="sf-proposal-list">
                          {proposal.blocks.map((b) => (
                            <div key={b.id}>
                              <strong>
                                {
                                  [...tasks, revisionTask].find(
                                    (t) => t?.id === b.taskId,
                                  )?.title
                                }
                              </strong>
                              <span>
                                {formatDate(b.date)} ·{" "}
                                {formatTime(b.startMinute)}–
                                {formatTime(b.endMinute)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {proposal.unscheduled.length > 0 && (
                        <div className="sf-alert amber">
                          <AlertTriangle size={20} />
                          <span>
                            <strong>Chưa xếp được toàn bộ</strong>
                            {proposal.unscheduled.map((u) => (
                              <small key={u.taskId}>
                                {
                                  [...tasks, revisionTask].find(
                                    (t) => t?.id === u.taskId,
                                  )?.title
                                }
                                : còn {u.minutes} phút. {u.reason}
                              </small>
                            ))}
                          </span>
                        </div>
                      )}
                      <div className="sf-actions">
                        <Button
                          onClick={() => {
                            setProposal(null)
                            setRevisionTask(null)
                            setAssistantHandoff(null)
                            notify(
                              "Đã từ chối đề xuất. Lịch xác nhận giữ nguyên.",
                            )
                          }}
                        >
                          Từ chối
                        </Button>
                        <Button
                          variant="primary"
                          disabled={!proposal.blocks.length}
                          onClick={approvePlan}
                        >
                          <Check size={17} /> Xác nhận kế hoạch
                        </Button>
                      </div>
                    </Panel>
                  )}
                </div>
              </div>
              <div className="sf-material-hint">
                <FileText size={18} />
                <span>
                  Đầu vào PDF: bản demo chỉ chọn tên tệp ở Thư viện, chưa trích
                  xuất nội dung. Bạn có thể nhập công việc thủ công ở đây.
                </span>
                <Button variant="ghost" onClick={() => goto("Materials")}>
                  Mở Thư viện
                </Button>
              </div>
            </>
          )}
          {page === "Study" && (
            <>
              {!study ? (
                <Panel>
                  <Empty
                    icon={BookOpen}
                    title="Sẵn sàng cho buổi học tập trung?"
                    body="Bắt đầu trực tiếp, hoặc chọn một buổi đã xác nhận trong Dashboard hay Planner."
                    action={
                      <Button variant="primary" onClick={() => startStudy()}>
                        <Play size={17} /> Bắt đầu học
                      </Button>
                    }
                  />
                </Panel>
              ) : (
                <>
                  <div className="sf-session-bar">
                    <span className="sf-session-icon">
                      <BookOpen size={22} />
                    </span>
                    <span>
                      <strong>{study.topic}</strong>
                      <small>
                        {study.course} ·{" "}
                        {study.origin === "planner"
                          ? "Từ kế hoạch đã xác nhận"
                          : study.origin === "assistant"
                            ? "Từ StudyFlow Assistant"
                            : "Bắt đầu trực tiếp"}
                      </small>
                    </span>
                    <Badge
                      tone={
                        study.status === "completed"
                          ? "green"
                          : study.status === "awaiting-confirmation"
                            ? "amber"
                            : "blue"
                      }
                    >
                      {study.status === "completed"
                        ? "ĐÃ XÁC NHẬN"
                        : study.status === "awaiting-confirmation"
                          ? "CHỜ XÁC NHẬN"
                          : "ĐANG HỌC"}
                    </Badge>
                    <span className="sf-timer">
                      {String(Math.floor(study.elapsedSeconds / 60)).padStart(
                        2,
                        "0",
                      )}
                      :{String(study.elapsedSeconds % 60).padStart(2, "0")}
                    </span>
                    {study.status === "active" && (
                      <>
                        <Button onClick={() => setRunning((r) => !r)}>
                          {running ? <Pause size={16} /> : <Play size={16} />}{" "}
                          {running ? "Tạm dừng" : "Tiếp tục"}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setRunning(false)
                            setStudy((s) =>
                              s ? { ...s, status: "awaiting-confirmation" } : s,
                            )
                            setModal("reflection")
                          }}
                        >
                          Kết thúc
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="sf-study-grid">
                    <div>
                      <Panel title="Mục tiêu buổi học">
                        <p>{study.goal}</p>
                        <div className="sf-source-label">
                          <FileText size={17} />{" "}
                          {study.sourceId
                            ? "Nguồn minh họa do nhóm biên soạn"
                            : "Chưa có nguồn học có thể truy cập"}
                        </div>
                      </Panel>
                      <Panel
                        title="Tài liệu & dẫn nguồn"
                        className="sf-spaced-panel"
                      >
                        {study.sourceId ? (
                          <>
                            <div className="sf-source-title">
                              <Badge tone="violet">ĐOẠN VÍ DỤ · DEMO</Badge>
                              <strong>{passage.title}</strong>
                            </div>
                            <blockquote id="source-passage">
                              {passage.text}
                            </blockquote>
                            <p className="sf-muted">
                              Tham chiếu: đoạn hiển thị ở trên. Không phải trích
                              dẫn từ PDF bài giảng.
                            </p>
                          </>
                        ) : (
                          <Empty
                            icon={FileText}
                            title="Nguồn chưa sẵn có"
                            body="Hãy thêm ghi chú được phép sử dụng trong Thư viện. Trợ lý không thể trích dẫn nội dung chưa được cung cấp."
                            action={
                              <Button onClick={() => goto("Materials")}>
                                Mở Thư viện
                              </Button>
                            }
                          />
                        )}
                      </Panel>
                      <Panel
                        title="Ghi chú học tập"
                        className="sf-spaced-panel"
                      >
                        <textarea
                          className="sf-textarea"
                          placeholder="Ghi lại cách hiểu của bạn... (chỉ lưu trong buổi học hiện tại)"
                          aria-label="Ghi chú học tập"
                        />
                      </Panel>
                    </div>
                    <Panel
                      title="Learning Copilot"
                      action={<Badge tone="violet">KỊCH BẢN DEMO</Badge>}
                      className="sf-copilot"
                    >
                      <div className="sf-chat">
                        <div className="sf-chat-bubble">
                          <Sparkles size={17} />
                          <p>
                            {study.sourceId
                              ? "Mình có thể gợi ý từng bước cho ví dụ đạo hàm riêng đang hiển thị. Nội dung này là kịch bản minh họa, không phải phản hồi AI trực tiếp."
                              : `Chưa có nguồn học cho ${study.topic}. Hãy mở Thư viện để thêm ghi chú được phép sử dụng; hiện mình chưa thể giải thích hoặc trích dẫn chủ đề này.`}
                          </p>
                        </div>
                        {messages.map((m, i) => (
                          <div className="sf-chat-bubble" key={i}>
                            <Sparkles size={17} />
                            <p>
                              {m}{" "}
                              {study.sourceId && (
                                <a href="#source-passage">Xem đoạn nguồn</a>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="sf-hints">
                        <Button
                          onClick={() => {
                            const next = Math.min(hintLevel + 1, 3)
                            setHintLevel(next)
                            setMessages((ms) => [
                              ...ms,
                              study.sourceId
                                ? [
                                    "",
                                    "Gợi ý 1: Chọn biến cần lấy đạo hàm; giữ biến kia cố định.",
                                    "Gợi ý 2: Với ∂/∂x, xem y như một hệ số hằng.",
                                    "Gợi ý 3: ∂(x²y)/∂x = 2xy và ∂(3y)/∂x = 0.",
                                  ][next]
                                : "Chưa có đoạn nguồn cho chủ đề này. Hãy thêm ghi chú thủ công trước khi yêu cầu giải thích.",
                            ])
                          }}
                          disabled={!study.sourceId || hintLevel >= 3}
                        >
                          <Sparkles size={16} /> Gợi ý {hintLevel}/3
                        </Button>
                        <Button
                          onClick={() =>
                            setMessages((ms) => [
                              ...ms,
                              study.sourceId
                                ? "Giải thích mẫu: Đạo hàm riêng xét sự thay đổi của hàm theo một biến, trong khi các biến khác được giữ cố định."
                                : "Không thể giải thích theo nguồn khi chưa có tài liệu được cung cấp.",
                            ])
                          }
                        >
                          Giải thích thêm
                        </Button>
                      </div>
                      <form
                        className="sf-chat-form"
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (!questionText.trim()) return
                          setMessages((ms) => [
                            ...ms,
                            study.sourceId
                              ? `Câu hỏi của bạn: “${questionText.trim()}”. Kịch bản demo gợi ý xem lại định nghĩa và ví dụ trong đoạn nguồn; câu trả lời tùy ý cần dịch vụ AI thật.`
                              : "Chưa có nguồn để trả lời câu hỏi này.",
                          ])
                          setQuestionText("")
                        }}
                      >
                        <input
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="Hỏi về bài học..."
                          aria-label="Hỏi trợ lý học tập"
                        />
                        <Button
                          variant="primary"
                          type="submit"
                          title="Gửi câu hỏi"
                        >
                          <Send size={17} />
                        </Button>
                      </form>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setQuizCourse(study.course)
                          setQuizTopic(study.topic)
                          setQuizIndex(0)
                          setAnswers({})
                          goto("Quiz")
                        }}
                      >
                        Làm bài ôn tập tùy chọn <ArrowRight size={17} />
                      </Button>
                    </Panel>
                  </div>
                  {study.status === "awaiting-confirmation" && (
                    <div className="sf-alert amber">
                      <AlertTriangle size={20} />
                      <span>
                        <strong>Buổi học đang chờ bạn xác nhận kết quả.</strong>
                        <small>
                          Hoạt động học không được xem là bằng chứng thành thạo.
                        </small>
                      </span>
                      <Button onClick={() => setModal("reflection")}>
                        Xem tóm tắt
                      </Button>
                      <Button
                        onClick={() => {
                          setStudy((s) => (s ? { ...s, status: "active" } : s))
                          setRunning(true)
                        }}
                      >
                        Tiếp tục học
                      </Button>
                    </div>
                  )}
                  {study.status === "completed" && (
                    <div className="sf-alert green">
                      <Check size={20} />
                      <span>
                        <strong>Bạn đã xác nhận kết quả buổi học.</strong>
                        <small>
                          Tiếp tục luyện tập nếu muốn kiểm tra mức độ hiểu bài.
                        </small>
                      </span>
                      <Button onClick={() => goto("Quiz")}>
                        Làm bài ôn tập
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {page === "Quiz" && (
            <>
              <div className="sf-flow-banner">
                <div>
                  <ClipboardCheck size={20} />
                  <span>
                    <strong>
                      Bộ câu hỏi mẫu · {quizCourse}{" "}
                      {quizTopic ? `· ${quizTopic}` : ""}
                    </strong>
                    <small>
                      {availableQuestions.length} câu do nhóm biên soạn; chấm
                      điểm xác định cho thử nghiệm giao diện.
                    </small>
                  </span>
                </div>
                <Badge tone="amber">CHƯA XÁC MINH HỌC THUẬT</Badge>
              </div>
              <div className="sf-course-picker">
                <label>
                  Môn học{" "}
                  <select
                    value={quizCourse}
                    onChange={(e) => {
                      setQuizCourse(e.target.value)
                      setQuizTopic(
                        e.target.value === "Giải tích" ? "Đạo hàm riêng" : "",
                      )
                      setQuizIndex(0)
                      setAnswers({})
                    }}
                  >
                    <option>Chưa chọn môn</option>
                    <option>Giải tích</option>
                    <option>Kỹ thuật phần mềm</option>
                    <option>Mạng máy tính</option>
                  </select>
                </label>
                <label>
                  Chủ đề
                  <input
                    value={quizTopic}
                    onChange={(e) => {
                      setQuizTopic(e.target.value)
                      setQuizIndex(0)
                      setAnswers({})
                    }}
                    placeholder="Nhập chủ đề"
                  />
                </label>
                <span>
                  {availableQuestions.length
                    ? "Nguồn ví dụ demo · chưa xác minh học thuật"
                    : `Chưa có câu hỏi được biên soạn cho ${quizTopic || quizCourse}`}
                </span>
              </div>
              {availableQuestions.length ? (
                <div className="sf-quiz-layout">
                  <Panel title="Bài luyện tập">
                    <div className="sf-quiz-progress">
                      <span>
                        Câu {quizIndex + 1} / {availableQuestions.length}
                      </span>
                      <span>{Object.keys(answers).length} đã trả lời</span>
                    </div>
                    <div className="sf-progress">
                      <i
                        style={{
                          width: `${(100 * (quizIndex + 1)) / availableQuestions.length}%`,
                        }}
                      />
                    </div>
                    <div className="sf-question">
                      <Badge tone="blue">CÂU {quizIndex + 1}</Badge>
                      <h2>{currentQuestion.prompt}</h2>
                      <div className="sf-options">
                        {currentQuestion.choices.map((choice, i) => (
                          <label
                            className={
                              answers[currentQuestion.id] === i
                                ? "selected"
                                : ""
                            }
                            key={i}
                          >
                            <input
                              type="radio"
                              name={currentQuestion.id}
                              checked={answers[currentQuestion.id] === i}
                              onChange={() =>
                                setAnswers((a) => ({
                                  ...a,
                                  [currentQuestion.id]: i,
                                }))
                              }
                            />
                            <span>{String.fromCharCode(65 + i)}</span>
                            {choice}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="sf-actions spread">
                      <Button
                        disabled={quizIndex === 0}
                        onClick={() => setQuizIndex((i) => i - 1)}
                      >
                        <ChevronLeft size={17} /> Câu trước
                      </Button>
                      {quizIndex < availableQuestions.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={() => setQuizIndex((i) => i + 1)}
                        >
                          Câu tiếp <ChevronRight size={17} />
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={submitQuiz}>
                          Nộp bài <ArrowRight size={17} />
                        </Button>
                      )}
                    </div>
                  </Panel>
                  <Panel title="Thông tin bài làm">
                    <div className="sf-quiz-info">
                      <div>
                        <span>Môn học</span>
                        <strong>{quizCourse}</strong>
                      </div>
                      <div>
                        <span>Chủ đề</span>
                        <strong>Đạo hàm riêng</strong>
                      </div>
                      <div>
                        <span>Nguồn</span>
                        <strong>Đoạn ví dụ demo do nhóm biên soạn</strong>
                      </div>
                      <div>
                        <span>Trạng thái</span>
                        <strong>Không phải đánh giá xác minh</strong>
                      </div>
                    </div>
                    <p className="sf-muted">
                      Các câu hỏi demo có đáp án cố định. Hệ thống chưa có quy
                      trình duyệt câu hỏi hoặc dữ liệu môn học chính thức.
                    </p>
                    <div className="sf-question-nav">
                      {availableQuestions.map((q, i) => (
                        <button
                          key={q.id}
                          className={quizIndex === i ? "active" : ""}
                          onClick={() => setQuizIndex(i)}
                          aria-label={`Đến câu ${i + 1}`}
                        >
                          {i + 1}
                          {answers[q.id] !== undefined && <i />}
                        </button>
                      ))}
                    </div>
                  </Panel>
                </div>
              ) : (
                <Panel>
                  <Empty
                    icon={ClipboardCheck}
                    title="Chưa có ngân hàng câu hỏi"
                    body="Cần câu hỏi được biên soạn hoặc duyệt trước khi bắt đầu."
                  />
                </Panel>
              )}
            </>
          )}
          {page === "Results" && (
            <>
              {result ? (
                <>
                  <div className="sf-result-hero">
                    <div>
                      <Badge tone="violet">KẾT QUẢ BÀI DEMO</Badge>
                      <h2>
                        {result.correctCount}/{result.total} câu đúng
                      </h2>
                      <p>
                        {result.total
                          ? Math.round(
                              (100 * result.correctCount) / result.total,
                            )
                          : 0}
                        % chính xác · Giải tích · Đạo hàm riêng
                      </p>
                      <small>
                        Đây là bài luyện tập mẫu, chưa phải đánh giá được xác
                        minh.
                      </small>
                    </div>
                    <div
                      className="sf-result-ring"
                      style={
                        {
                          "--score": `${
                            result.total
                              ? (100 * result.correctCount) / result.total
                              : 0
                          }%`,
                        } as React.CSSProperties
                      }
                    >
                      <strong>
                        {result.total
                          ? Math.round(
                              (100 * result.correctCount) / result.total,
                            )
                          : 0}
                        %
                      </strong>
                    </div>
                  </div>
                  <div className="sf-grid-2">
                    <Panel title="Hiệu suất theo chủ đề">
                      {result.topics.map((t) => (
                        <div className="sf-topic" key={t.topic}>
                          <div>
                            <strong>{t.topic}</strong>
                            <span>
                              {t.correctCount}/{t.gradedCount} câu đúng
                            </span>
                          </div>
                          <div className="sf-progress">
                            <i
                              style={{
                                width: `${(100 * t.correctCount) / t.gradedCount}%`,
                              }}
                            />
                          </div>
                          <small>
                            Tỷ lệ lỗi:{" "}
                            {t.errorRate === null
                              ? "Chưa đủ dữ liệu"
                              : `${Math.round(t.errorRate * 100)}%`}{" "}
                            · Cỡ mẫu {t.gradedCount} câu
                          </small>
                        </div>
                      ))}
                    </Panel>
                    <Panel title="Gợi ý ôn tập">
                      <div className="sf-recommend">
                        <Sparkles size={20} />
                        <div>
                          <strong>{result.recommendations[0]?.topic}</strong>
                          <p>{result.recommendations[0]?.reason}</p>
                          <Badge
                            tone={
                              result.recommendations[0]?.status ===
                              "insufficient-data"
                                ? "amber"
                                : "blue"
                            }
                          >
                            {result.recommendations[0]?.status ===
                            "insufficient-data"
                              ? "BẰNG CHỨNG CÒN ÍT"
                              : "ĐỀ XUẤT"}
                          </Badge>
                        </div>
                      </div>
                      <p className="sf-muted">
                        Ngưỡng 3 câu hiện chỉ là cấu hình demo; nhóm cần duyệt
                        trước khi dùng trong đánh giá thật.
                      </p>
                      <Button variant="primary" onClick={handoffRevision}>
                        Đề xuất lịch ôn tập <ArrowRight size={17} />
                      </Button>
                    </Panel>
                  </div>
                  <Panel
                    title="Xem lại câu trả lời"
                    className="sf-spaced-panel"
                  >
                    <div className="sf-review-list">
                      {questions.map((q, i) => {
                        const correct =
                          result.attempt.answers[q.id] === q.answerIndex
                        return (
                          <div key={q.id}>
                            <Badge tone={correct ? "green" : "red"}>
                              {correct ? "ĐÚNG" : "CẦN XEM LẠI"}
                            </Badge>
                            <strong>
                              {i + 1}. {q.prompt}
                            </strong>
                            <p>
                              Bạn chọn:{" "}
                              {q.choices[result.attempt.answers[q.id]]}
                            </p>
                            {!correct && (
                              <p>
                                Đáp án mẫu: <b>{q.choices[q.answerIndex]}</b>
                              </p>
                            )}
                            <small>
                              Nguồn: {passage.title} · đoạn ví dụ ở màn hình Học
                              tập
                            </small>
                          </div>
                        )
                      })}
                    </div>
                  </Panel>
                  <div className="sf-actions">
                    <Button
                      onClick={() => {
                        setAnswers({})
                        setQuizIndex(0)
                        goto("Quiz")
                      }}
                    >
                      <RotateCcw size={17} /> Làm bài mới
                    </Button>
                  </div>
                </>
              ) : (
                <Panel>
                  <Empty
                    icon={ChartNoAxesCombined}
                    title="Chưa có kết quả"
                    body="Hoàn thành bài ôn tập mẫu để xem điểm và gợi ý ôn tập dựa trên câu trả lời của bạn."
                    action={
                      <Button variant="primary" onClick={() => goto("Quiz")}>
                        Mở bài ôn tập
                      </Button>
                    }
                  />
                </Panel>
              )}
            </>
          )}
          {page === "Materials" && (
            <div className="sf-grid-2">
              <Panel title="Thư viện tài liệu">
                <div className="sf-upload">
                  <FolderOpen size={30} />
                  <h3>Chọn tài liệu được phép sử dụng</h3>
                  <p>
                    Bản demo chỉ ghi nhận tên tệp PDF trên thiết bị. Chưa tải
                    lên hoặc trích xuất nội dung.
                  </p>
                  <label className="sf-button sf-primary">
                    Chọn PDF
                    <input
                      hidden
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (
                          file.type !== "application/pdf" &&
                          !file.name.toLowerCase().endsWith(".pdf")
                        ) {
                          setFileError(
                            "Chỉ hỗ trợ PDF dạng văn bản. Hãy dùng ghi chú thủ công nếu cần.",
                          )
                          return
                        }
                        setMaterials((ms) => [
                          ...ms,
                          {
                            id: id(),
                            name: file.name,
                            course: manualCourse,
                            status: "selected",
                          },
                        ])
                        setFileError("")
                        e.target.value = ""
                      }}
                    />
                  </label>
                  {fileError && <p className="sf-error">{fileError}</p>}
                </div>
                <div className="sf-material-list">
                  {materials.map((m) => (
                    <div key={m.id}>
                      <FileText size={19} />
                      <span>
                        <strong>{m.name}</strong>
                        <small>
                          {m.course} ·{" "}
                          {m.status === "selected"
                            ? "Chỉ chọn tên tệp · chưa xử lý"
                            : "Ghi chú thủ công · chưa xác minh"}
                        </small>
                      </span>
                      <button
                        onClick={() =>
                          setMaterials((ms) => ms.filter((x) => x.id !== m.id))
                        }
                        aria-label={`Xóa ${m.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
                {!materials.length && (
                  <p className="sf-muted">Thư viện đang trống.</p>
                )}
              </Panel>
              <Panel title="Thêm ghi chú thủ công">
                <form
                  className="sf-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!manualTitle.trim() || !manualText.trim()) return
                    setMaterials((ms) => [
                      ...ms,
                      {
                        id: id(),
                        name: manualTitle.trim(),
                        course: manualCourse,
                        status: "manual",
                        text: manualText.trim(),
                      },
                    ])
                    setManualTitle("")
                    setManualText("")
                    notify("Đã thêm ghi chú trong phiên làm việc này.")
                  }}
                >
                  <label>
                    Tên ghi chú
                    <input
                      required
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Ví dụ: Chương 3 · Đạo hàm riêng"
                    />
                  </label>
                  <label>
                    Môn học
                    <select
                      value={manualCourse}
                      onChange={(e) => setManualCourse(e.target.value)}
                    >
                      <option>Giải tích</option>
                      <option>Kỹ thuật phần mềm</option>
                      <option>Mạng máy tính</option>
                    </select>
                  </label>
                  <label>
                    Nội dung được phép sử dụng
                    <textarea
                      required
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Dán đoạn tài liệu hoặc ghi chú của bạn..."
                    />
                  </label>
                  <Button variant="primary" type="submit">
                    <Plus size={17} /> Thêm ghi chú
                  </Button>
                </form>
                <p className="sf-muted sf-spaced">
                  Ghi chú chỉ ở bộ nhớ phiên; không có xử lý PDF, OCR, lưu trữ
                  đám mây hoặc AI trực tiếp.
                </p>
              </Panel>
            </div>
          )}
        </main>
      </div>
      {notice && (
        <div className="sf-toast" role="status">
          <Check size={18} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Đóng thông báo">
            <X size={16} />
          </button>
        </div>
      )}
      {modal === "task" && (
        <Modal
          title={editing ? "Chỉnh sửa công việc" : "Thêm công việc"}
          close={() => setModal(null)}
        >
          <form className="sf-form" onSubmit={saveTask}>
            <label>
              Tên công việc
              <input
                required
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Ví dụ: Luyện bài tập chương 3"
              />
            </label>
            <div className="sf-form-grid">
              <label>
                Môn học
                <select
                  value={taskForm.course}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, course: e.target.value }))
                  }
                >
                  <option>Giải tích</option>
                  <option>Kỹ thuật phần mềm</option>
                  <option>Mạng máy tính</option>
                </select>
              </label>
              <label>
                Ưu tiên
                <select
                  value={taskForm.priority}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      priority: e.target.value as AcademicTask["priority"],
                    }))
                  }
                >
                  <option>Thấp</option>
                  <option>Trung bình</option>
                  <option>Cao</option>
                </select>
              </label>
              <label>
                Thời lượng dự kiến (phút)
                <input
                  type="number"
                  min="15"
                  required
                  value={taskForm.estimatedMinutes}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      estimatedMinutes: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label>
                Còn lại (phút)
                <input
                  type="number"
                  min="0"
                  required
                  value={taskForm.remainingMinutes}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      remainingMinutes: Number(e.target.value),
                    }))
                  }
                />
              </label>
            </div>
            <label>
              Hạn chót · ngày địa phương
              <input
                type="date"
                min={localDate(today())}
                required
                value={taskForm.deadline}
                onChange={(e) =>
                  setTaskForm((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </label>
            <div className="sf-actions spread">
              {editing ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    setTasks((ts) => ts.filter((t) => t.id !== editing.id))
                    setConfirmed((bs) =>
                      bs.filter((b) => b.taskId !== editing.id),
                    )
                    setProposal(null)
                    setModal(null)
                    notify("Đã xóa công việc và các buổi học liên quan.")
                  }}
                >
                  <Trash2 size={16} /> Xóa
                </Button>
              ) : (
                <span />
              )}
              <div className="sf-actions">
                <Button onClick={() => setModal(null)}>Hủy</Button>
                <Button variant="primary" type="submit">
                  Lưu công việc
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
      {modal === "availability" && (
        <Modal title="Thời gian có thể học" close={() => setModal(null)}>
          <p className="sf-muted">
            Thêm một khoảng học lặp lại theo thứ trong tuần. Kế hoạch mới sẽ chỉ
            dùng các khoảng này.
          </p>
          <form
            className="sf-form"
            onSubmit={(e) => {
              e.preventDefault()
              const start =
                Number(availabilityForm.start.slice(0, 2)) * 60 +
                Number(availabilityForm.start.slice(3))
              const end =
                Number(availabilityForm.end.slice(0, 2)) * 60 +
                Number(availabilityForm.end.slice(3))
              if (end - start < 15) {
                notify("Khoảng học phải dài ít nhất 15 phút.")
                return
              }
              setSlots((ss) => [
                ...ss,
                {
                  id: id(),
                  day: Number(availabilityForm.day),
                  startMinute: start,
                  endMinute: end,
                },
              ])
              setProposal(null)
              setModal(null)
            }}
          >
            <div className="sf-form-grid">
              <label>
                Thứ
                <select
                  value={availabilityForm.day}
                  onChange={(e) =>
                    setAvailabilityForm((f) => ({
                      ...f,
                      day: Number(e.target.value),
                    }))
                  }
                >
                  {[
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                    "Chủ nhật",
                  ].map((d, i) => (
                    <option value={i} key={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Bắt đầu
                <input
                  type="time"
                  value={availabilityForm.start}
                  onChange={(e) =>
                    setAvailabilityForm((f) => ({
                      ...f,
                      start: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Kết thúc
                <input
                  type="time"
                  value={availabilityForm.end}
                  onChange={(e) =>
                    setAvailabilityForm((f) => ({ ...f, end: e.target.value }))
                  }
                />
              </label>
            </div>
            <Button variant="primary" type="submit">
              Thêm khoảng học
            </Button>
          </form>
          <div className="sf-slot-edit">
            {slots.map((s) => (
              <div key={s.id}>
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][s.day]} ·{" "}
                {formatTime(s.startMinute)}–{formatTime(s.endMinute)}
                <button
                  onClick={() => {
                    setSlots((ss) => ss.filter((x) => x.id !== s.id))
                    setProposal(null)
                  }}
                  aria-label="Xóa khoảng học"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal === "commitment" && (
        <Modal title="Thêm cam kết bận" close={() => setModal(null)}>
          <form
            className="sf-form"
            onSubmit={(e) => {
              e.preventDefault()
              const start =
                Number(commitmentForm.start.slice(0, 2)) * 60 +
                Number(commitmentForm.start.slice(3))
              const end =
                Number(commitmentForm.end.slice(0, 2)) * 60 +
                Number(commitmentForm.end.slice(3))
              if (end <= start) {
                notify("Giờ kết thúc phải sau giờ bắt đầu.")
                return
              }
              setCommitments((cs) => [
                ...cs,
                {
                  id: id(),
                  date: commitmentForm.date,
                  startMinute: start,
                  endMinute: end,
                  title: commitmentForm.title.trim(),
                },
              ])
              setProposal(null)
              setModal(null)
            }}
          >
            <label>
              Tên cam kết
              <input
                required
                value={commitmentForm.title}
                onChange={(e) =>
                  setCommitmentForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Ví dụ: Họp nhóm"
              />
            </label>
            <div className="sf-form-grid">
              <label>
                Ngày
                <input
                  type="date"
                  required
                  value={commitmentForm.date}
                  onChange={(e) =>
                    setCommitmentForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </label>
              <label>
                Bắt đầu
                <input
                  type="time"
                  value={commitmentForm.start}
                  onChange={(e) =>
                    setCommitmentForm((f) => ({ ...f, start: e.target.value }))
                  }
                />
              </label>
              <label>
                Kết thúc
                <input
                  type="time"
                  value={commitmentForm.end}
                  onChange={(e) =>
                    setCommitmentForm((f) => ({ ...f, end: e.target.value }))
                  }
                />
              </label>
            </div>
            <Button variant="primary" type="submit">
              Lưu cam kết
            </Button>
          </form>
          <div className="sf-slot-edit">
            {commitments.map((c) => (
              <div key={c.id}>
                {c.title} · {formatDate(c.date)} · {formatTime(c.startMinute)}–
                {formatTime(c.endMinute)}
                <button
                  onClick={() => {
                    setCommitments((cs) => cs.filter((x) => x.id !== c.id))
                    setProposal(null)
                  }}
                  aria-label="Xóa cam kết"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal === "reflection" && study && (
        <Modal title="Xác nhận kết quả buổi học" close={() => setModal(null)}>
          <p className="sf-muted">
            Tóm tắt do sinh viên xác nhận; không chứng minh mức độ thành thạo.
          </p>
          <div className="sf-reflection-summary">
            <strong>{study.topic}</strong>
            <span>
              {study.course} · {Math.floor(study.elapsedSeconds / 60)} phút hoạt
              động
            </span>
          </div>
          <label className="sf-form">
            Bạn đã học gì?
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Điều đã hiểu và điều muốn ôn tiếp..."
            />
          </label>
          <div className="sf-actions spread">
            <Button
              onClick={() => {
                setModal(null)
                notify("Chưa ghi nhận kết quả buổi học.")
              }}
            >
              Để sau
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setOutcomes((os) => [
                  ...os,
                  {
                    sessionId: study.id,
                    reflection,
                    elapsedSeconds: study.elapsedSeconds,
                    confirmedAt: new Date().toISOString(),
                    status: "student-confirmed",
                  },
                ])
                setStudy((s) => (s ? { ...s, status: "completed" } : s))
                setModal(null)
                notify("Đã xác nhận kết quả buổi học trong bản demo.")
              }}
            >
              Xác nhận kết quả
            </Button>
          </div>
        </Modal>
      )}
      {modal === "submit" && (
        <Modal title="Gửi bài làm mẫu?" close={() => setModal(null)}>
          <p>
            Bạn đã trả lời {Object.keys(answers).length}/
            {availableQuestions.length} câu. Kết quả chỉ phản ánh bộ câu hỏi
            demo, không phải đánh giá học thuật đã xác minh.
          </p>
          <div className="sf-actions">
            <Button onClick={() => setModal(null)}>Xem lại</Button>
            <Button variant="primary" onClick={confirmQuiz}>
              Gửi bài làm
            </Button>
          </div>
        </Modal>
      )}
      {modal === "notifications" && (
        <Modal title="Hạn chót sắp tới" close={() => setModal(null)}>
          {deadlineSoon.length ? (
            <div className="sf-notification-list">
              {[...deadlineSoon]
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .map((task) => (
                  <div key={task.id}>
                    <CalendarDays size={17} />
                    <span>
                      <strong>{task.title}</strong>
                      <small>
                        {task.course} · {formatDate(task.deadline)} · còn{" "}
                        {task.remainingMinutes} phút
                      </small>
                    </span>
                    <Badge
                      tone={daysUntil(task.deadline) <= 1 ? "red" : "amber"}
                    >
                      {dateLabel(task.deadline)}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <Empty
              icon={Check}
              title="Chưa có hạn chót trong 7 ngày"
              body="Khi có công việc sắp đến hạn, bạn sẽ thấy tại đây."
            />
          )}
          <div className="sf-actions">
            <Button
              onClick={() => {
                setModal(null)
                goto("Planner")
              }}
            >
              Mở Planner <ArrowRight size={16} />
            </Button>
          </div>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Cài đặt & trợ giúp" close={() => setModal(null)}>
          <div className="sf-help">
            <CircleHelp size={20} />
            <p>
              StudyFlow AI hiện là bản demo frontend. Công việc, thời gian rảnh,
              lịch đã xác nhận và kết quả mẫu được lưu trong localStorage của
              trình duyệt này. Không có tài khoản hay đồng bộ đám mây.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              localStorage.removeItem(storageKey)
              setTasks([])
              setSlots([])
              setCommitments([])
              setConfirmed([])
              setOutcomes([])
              setResult(null)
              setProposal(null)
              setStudy(null)
              setModal(null)
              goto("Dashboard")
              notify("Đã đặt lại dữ liệu demo trên thiết bị này.")
            }}
          >
            <RotateCcw size={17} /> Đặt lại dữ liệu demo
          </Button>
        </Modal>
      )}
      <AssistantPanel
        open={assistantOpen}
        close={() => setAssistantOpen(false)}
        launch={() => setAssistantOpen(true)}
        messages={assistantMessages}
        busy={assistantBusy}
        send={sendAssistant}
        choose={chooseAssistant}
      />
    </div>
  )
}
