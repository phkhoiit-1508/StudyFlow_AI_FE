export type AssistantIntent = "PLAN_STUDY" | "MANAGE_TASK" | "START_GUIDED_STUDY" | "REQUEST_EXPLANATION" | "START_QUIZ" | "VIEW_ASSESSMENT" | "REQUEST_REVISION" | "OPEN_MATERIALS" | "CLARIFY_INTENT" | "UNSUPPORTED_REQUEST"

export type AssistantContext = {
  course?: string
  topic?: string
  goal?: string
  durationMinutes?: number
  targetDate?: string
  origin: "assistant"
}

export type AssistantAction = "OPEN_PLANNER" | "OPEN_TASK" | "OPEN_STUDY" | "OPEN_QUIZ" | "OPEN_RESULTS" | "OPEN_MATERIALS" | "PROPOSE_REPLAN" | "NONE"

export type AssistantChoice = {
  label: string
  action: AssistantAction
  context: AssistantContext
}
export type AssistantMessage = {
  id: string
  role: "assistant" | "user"
  text: string
  choices?: AssistantChoice[]
  intent?: AssistantIntent
}
export type AssistantDecision = {
  intent: AssistantIntent
  message: string
  action: AssistantAction
  context: AssistantContext
  choices?: AssistantChoice[]
}
export type AssistantRequest = {
  text: string
  courses: string[]
  hasResult: boolean
  now: Date
}
export interface AssistantService {
  interpret(request: AssistantRequest): AssistantDecision
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const nextWeekday = (now: Date, weekday: number) => {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7))
  return localDate(date)
}

function extractCourse(text: string, courses: string[]): string | undefined {
  const plain = normalize(text)
  const exact = courses.find((course) => plain.includes(normalize(course)))
  if (exact) return exact
  if (/tcp|transport layer|network|mang may tinh/.test(plain))
    return "Mạng máy tính"
  if (/calculus|dao ham|giai tich/.test(plain)) return "Giải tích"
  if (/software engineering|ky thuat phan mem/.test(plain))
    return "Kỹ thuật phần mềm"
  return undefined
}

function extractTopic(text: string): string | undefined {
  const plain = normalize(text)
  if (/tcp congestion control/.test(plain)) return "TCP congestion control"
  if (/transport layer/.test(plain)) return "Transport Layer"
  if (/dao ham rieng/.test(plain)) return "Đạo hàm riêng"
  const chapter = /chuong\s*(\d+)/.exec(plain)
  if (chapter) return `Chương ${chapter[1]}`
  const phrase =
    /(?:giai thich|khong hieu|explain|kiem tra kien thuc(?: cua toi)?(?: ve)?|test my knowledge (?:of|about))\s+(.+)/.exec(
      plain,
    )
  return phrase?.[1]?.trim() || undefined
}

function extractDate(text: string, now: Date): string | undefined {
  const plain = normalize(text)
  const weekdays: [RegExp, number][] = [
    [/thu\s*(?:2|hai)|monday/, 1],
    [/thu\s*(?:3|ba)|tuesday/, 2],
    [/thu\s*(?:4|tu)|wednesday/, 3],
    [/thu\s*(?:5|nam)|thursday/, 4],
    [/thu\s*(?:6|sau)|friday/, 5],
    [/thu\s*(?:7|bay)|saturday/, 6],
    [/chu nhat|sunday/, 0],
  ]
  const found = weekdays.find(([pattern]) => pattern.test(plain))
  if (found) return nextWeekday(now, found[1])
  const match = /(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?/.exec(plain)
  if (match) {
    const year = match[3] ? Number(match[3]) : now.getFullYear()
    const month = Number(match[2])
    const day = Number(match[1])
    const date = new Date(year, month - 1, day)
    if (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    )
      return localDate(date)
  }
  return undefined
}

function decision(
  intent: AssistantIntent,
  message: string,
  action: AssistantAction,
  context: AssistantContext,
  choices?: AssistantChoice[],
): AssistantDecision {
  return { intent, message, action, context, choices }
}

export const demoAssistantService: AssistantService = {
  interpret({ text, courses, hasResult, now }) {
    const plain = normalize(text)
    const course = extractCourse(text, courses)
    const topic = extractTopic(text)
    const duration = /(?:them|danh|for)?\s*(\d{1,3})\s*(?:phut|minutes?)/.exec(
      plain,
    )
    const durationMinutes = duration ? Number(duration[1]) : undefined
    const targetDate = extractDate(text, now)
    const context: AssistantContext = {
      course,
      topic,
      durationMinutes,
      targetDate,
      origin: "assistant",
    }
    if (!plain)
      return decision(
        "CLARIFY_INTENT",
        "Bạn muốn bắt đầu với kế hoạch, học có hướng dẫn hay bài ôn tập?",
        "NONE",
        context,
      )

    if (
      /toi nen on gi|nen on lai phan nao|what should i review|weak topics|revision priorit/.test(
        plain,
      )
    ) {
      return hasResult
        ? decision(
            "VIEW_ASSESSMENT",
            "Mình sẽ mở kết quả bài làm gần nhất. Đây là dữ liệu demo; hãy xem số câu và nguồn trước khi quyết định ôn tập.",
            "OPEN_RESULTS",
            context,
          )
        : decision(
            "VIEW_ASSESSMENT",
            "Chưa có kết quả bài làm để xác định ưu tiên ôn tập. Bạn có thể làm bộ câu hỏi mẫu trước.",
            "NONE",
            context,
            [
              {
                label: "Mở bài ôn tập",
                action: "OPEN_QUIZ",
                context: {
                  ...context,
                  course: "Giải tích",
                  topic: "Đạo hàm riêng",
                },
              },
            ],
          )
    }

    if (
      durationMinutes &&
      /(?:danh|them|hoc them|on them|schedule|add|spend)/.test(plain)
    ) {
      if (durationMinutes < 15 || durationMinutes > 480)
        return decision(
          "CLARIFY_INTENT",
          "Thời lượng cần từ 15 đến 480 phút. Bạn muốn dành bao nhiêu phút?",
          "NONE",
          context,
        )
      if (!targetDate)
        return decision(
          "CLARIFY_INTENT",
          "Bạn muốn dành thời gian này vào ngày nào? Hãy ghi thứ hoặc ngày/tháng.",
          "NONE",
          context,
        )
      if (!course)
        return decision(
          "CLARIFY_INTENT",
          `Mình đã ghi nhận ${durationMinutes} phút vào ${targetDate}. Bạn muốn học môn nào?`,
          "NONE",
          context,
          courses.map((name) => ({
            label: name,
            action: "PROPOSE_REPLAN",
            context: { ...context, course: name },
          })),
        )
      return decision(
        "REQUEST_REVISION",
        `Mình đã chuẩn bị đề xuất ${durationMinutes} phút cho ${course} vào ${targetDate}. Hãy xem tính khả thi trong Planner và chỉ xác nhận nếu phù hợp.`,
        "PROPOSE_REPLAN",
        context,
      )
    }

    if (
      /kiem tra|quiz|test my knowledge|assessment|practice test/.test(plain)
    ) {
      if (!topic && !course)
        return decision(
          "CLARIFY_INTENT",
          "Bạn muốn kiểm tra môn hoặc chủ đề nào?",
          "NONE",
          context,
        )
      return decision(
        "START_QUIZ",
        `Mình sẽ mở bài ôn tập${
          topic ? ` về ${topic}` : ""
        }. Nếu chưa có câu hỏi đúng chủ đề, màn hình sẽ báo rõ thay vì dùng bộ câu hỏi khác.`,
        "OPEN_QUIZ",
        context,
      )
    }

    if (/giai thich|khong hieu|explain|what is/.test(plain)) {
      if (!topic)
        return decision(
          "CLARIFY_INTENT",
          "Bạn muốn mình giúp hiểu khái niệm nào?",
          "NONE",
          context,
        )
      return decision(
        "REQUEST_EXPLANATION",
        `Mình sẽ mở buổi học về ${topic}. Nếu chưa có nguồn được phép sử dụng, StudyFlow sẽ hiển thị trạng thái thiếu nguồn; hiện chưa có AI giải thích trực tiếp.`,
        "OPEN_STUDY",
        { ...context, goal: `Tìm hiểu ${topic}` },
      )
    }

    if (/lap lich|lap ke hoach|plan|schedule/.test(plain)) {
      return decision(
        "PLAN_STUDY",
        `Mình sẽ mở Planner${
          course ? ` và giữ ngữ cảnh môn ${course}` : ""
        }. Hãy kiểm tra công việc, hạn chót và thời gian rảnh trước khi tạo đề xuất. Lịch chỉ thay đổi sau khi bạn xác nhận.`,
        "OPEN_PLANNER",
        context,
      )
    }

    if (/cong viec|bai tap|deadline|task/.test(plain)) {
      return decision(
        "MANAGE_TASK",
        "Mình sẽ mở biểu mẫu công việc trong Planner. Bạn kiểm tra thông tin trước khi lưu.",
        "OPEN_TASK",
        context,
      )
    }

    if (/tai lieu|materials|pdf|document/.test(plain)) {
      return decision(
        "OPEN_MATERIALS",
        "Mình sẽ mở Thư viện. PDF trong bản demo chỉ được chọn tên tệp, chưa tải lên hoặc trích xuất; bạn có thể thêm ghi chú thủ công.",
        "OPEN_MATERIALS",
        context,
      )
    }

    if (/on|review|revise/.test(plain)) {
      return decision(
        "CLARIFY_INTENT",
        "Bạn muốn học lại với hướng dẫn hay làm bài kiểm tra nhanh?",
        "NONE",
        context,
        [
          { label: "Học có hướng dẫn", action: "OPEN_STUDY", context },
          { label: "Làm quiz", action: "OPEN_QUIZ", context },
        ],
      )
    }

    if (/hoc|study|learn/.test(plain)) {
      if (!topic && !course)
        return decision(
          "CLARIFY_INTENT",
          "Bạn muốn học môn hoặc chủ đề nào?",
          "NONE",
          context,
        )
      return decision(
        "START_GUIDED_STUDY",
        `Mình sẽ mở buổi học${topic ? ` về ${topic}` : ""}.`,
        "OPEN_STUDY",
        context,
      )
    }

    return decision(
      "UNSUPPORTED_REQUEST",
      "Mình chưa xử lý được yêu cầu này trong bản demo. Mình có thể giúp bạn lập kế hoạch, mở buổi học, làm quiz hoặc xem kết quả. Bạn có thể diễn đạt lại theo một trong các cách đó.",
      "NONE",
      context,
    )
  },
}
