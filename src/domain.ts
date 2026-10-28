export type Priority = "Thấp" | "Trung bình" | "Cao"
export type AcademicTask = {
  id: string
  title: string
  course: string
  deadline: string
  estimatedMinutes: number
  remainingMinutes: number
  priority: Priority
  confirmed: boolean
  preferredDate?: string
}
export type AvailabilitySlot = {
  id: string
  day: number
  startMinute: number
  endMinute: number
}
export type Commitment = {
  id: string
  date: string
  startMinute: number
  endMinute: number
  title: string
}
export type PlannedStudyBlock = {
  id: string
  taskId: string
  date: string
  startMinute: number
  endMinute: number
  status: "proposed" | "confirmed"
}
export type StudyPlan = {
  id: string
  status: "proposed" | "confirmed" | "rejected"
  blocks: PlannedStudyBlock[]
  unscheduled: {
    taskId: string
    minutes: number
    reason: string
  }[]
}
export type SourcePassage = {
  id: string
  title: string
  topic: string
  text: string
  page?: number
  status: "demo" | "manual"
}
export type LearningMaterial = {
  id: string
  name: string
  course: string
  status: "selected" | "manual"
  text?: string
}
export type VerifiedQuestion = {
  id: string
  course: string
  topic: string
  prompt: string
  choices: string[]
  answerIndex: number
  status: "demo" | "draft" | "reviewer-approved"
  sourceId?: string
}
export type QuizAttempt = {
  id: string
  questionIds: string[]
  answers: Record<string, number>
  submittedAt: string
  mode: "demo" | "verified"
}
export type TopicPerformance = {
  topic: string
  correctCount: number
  incorrectCount: number
  gradedCount: number
  errorRate: number | null
}
export type RevisionRecommendation = {
  topic: string
  reason: string
  evidenceCount: number
  status: "proposed" | "insufficient-data"
}
export type AssessmentResult = {
  attempt: QuizAttempt
  correctCount: number
  total: number
  topics: TopicPerformance[]
  recommendations: RevisionRecommendation[]
}
export type StudySession = {
  id: string
  course: string
  topic: string
  goal: string
  sourceId?: string
  origin: "direct" | "planner" | "assistant"
  status: "active" | "awaiting-confirmation" | "completed"
  elapsedSeconds: number
}
export type SessionOutcome = {
  sessionId: string
  reflection: string
  elapsedSeconds: number
  confirmedAt: string
  status: "student-confirmed"
}

export const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
export const fromLocalDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (date: Date, days: number) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}
export const startOfWeek = (date: Date) =>
  addDays(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    -(date.getDay() + 6) % 7,
  )
export const formatDate = (value: string) =>
  fromLocalDate(value).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  })
export const formatTime = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`
export const overlap = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) => aStart < bEnd && bStart < aEnd
export const daysUntil = (value: string, today = new Date()) =>
  Math.round(
    (fromLocalDate(value).getTime() -
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime()) /
      86400000,
  )

export function validateTask(
  task: AcademicTask,
  today = new Date(),
): string | null {
  if (!task.title.trim() || !task.course.trim())
    return "Cần nhập tên công việc và môn học."
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(task.deadline) ||
    Number.isNaN(fromLocalDate(task.deadline).getTime())
  )
    return "Hạn chót không hợp lệ."
  if (daysUntil(task.deadline, today) < 0) return "Hạn chót đã qua."
  if (
    task.preferredDate &&
    (daysUntil(task.preferredDate, today) < 0 ||
      task.preferredDate > task.deadline)
  )
    return "Ngày học mong muốn đã qua hoặc sau hạn chót."
  if (!Number.isFinite(task.estimatedMinutes) || task.estimatedMinutes < 15)
    return "Thời lượng dự kiến tối thiểu 15 phút."
  if (
    !Number.isFinite(task.remainingMinutes) ||
    task.remainingMinutes < 0 ||
    task.remainingMinutes > task.estimatedMinutes
  )
    return "Thời lượng còn lại phải từ 0 đến thời lượng dự kiến."
  return null
}

export function generatePlan(
  tasks: AcademicTask[],
  slots: AvailabilitySlot[],
  commitments: Commitment[],
  confirmed: PlannedStudyBlock[],
  weekStart: Date,
  today = new Date(),
): StudyPlan {
  const blocks: PlannedStudyBlock[] = []
  const unscheduled: StudyPlan["unscheduled"] = []
  const monday = startOfWeek(weekStart)
  const eligible = [...tasks]
    .filter((t) => t.confirmed && t.remainingMinutes > 0)
    .sort(
      (a, b) =>
        a.deadline.localeCompare(b.deadline) ||
        priorityRank(b.priority) - priorityRank(a.priority),
    )
  for (const task of eligible) {
    const invalid = validateTask(task, today)
    if (invalid) {
      unscheduled.push({
        taskId: task.id,
        minutes: task.remainingMinutes,
        reason: invalid,
      })
      continue
    }
    let left = Math.max(
      0,
      task.remainingMinutes -
        confirmed
          .filter((b) => b.taskId === task.id)
          .reduce((n, b) => n + b.endMinute - b.startMinute, 0),
    )
    for (let day = 0; day < 7 && left > 0; day++) {
      const date = localDate(addDays(monday, day))
      if (
        date < localDate(today) ||
        date > task.deadline ||
        (task.preferredDate && date !== task.preferredDate)
      )
        continue
      for (const slot of slots
        .filter((s) => s.day === day)
        .sort((a, b) => a.startMinute - b.startMinute)) {
        let cursor = slot.startMinute
        while (cursor + 15 <= slot.endMinute && left > 0) {
          const duration = Math.min(60, left, slot.endMinute - cursor)
          if (duration < 15) break
          const occupied = [...confirmed, ...blocks]
            .filter((b) => b.date === date)
            .map((b) => [b.startMinute, b.endMinute] as const)
            .concat(
              commitments
                .filter((c) => c.date === date)
                .map((c) => [c.startMinute, c.endMinute] as const),
            )
          const conflict = occupied.find(([s, e]) =>
            overlap(cursor, cursor + duration, s, e),
          )
          if (conflict) {
            cursor = Math.max(cursor + 15, conflict[1])
            continue
          }
          blocks.push({
            id: `${task.id}-${date}-${cursor}`,
            taskId: task.id,
            date,
            startMinute: cursor,
            endMinute: cursor + duration,
            status: "proposed",
          })
          left -= duration
          cursor += duration
        }
      }
    }
    if (left > 0)
      unscheduled.push({
        taskId: task.id,
        minutes: left,
        reason: task.preferredDate
          ? `Không đủ thời gian trống vào ${formatDate(task.preferredDate)}.`
          : "Không đủ thời gian trống trước hạn chót trong tuần này.",
      })
  }
  return { id: String(Date.now()), status: "proposed", blocks, unscheduled }
}
const priorityRank = (p: Priority) =>
  p === "Cao" ? 3 : p === "Trung bình" ? 2 : 1

export function gradeAttempt(
  questions: VerifiedQuestion[],
  attempt: QuizAttempt,
): AssessmentResult {
  const graded = questions.filter(
    (q) =>
      attempt.questionIds.includes(q.id) &&
      (attempt.mode === "demo"
        ? q.status === "demo"
        : q.status === "reviewer-approved") &&
      Number.isInteger(q.answerIndex),
  )
  const topics = [...new Set(graded.map((q) => q.topic))].map((topic) => {
    const group = graded.filter((q) => q.topic === topic)
    const correctCount = group.filter(
      (q) => attempt.answers[q.id] === q.answerIndex,
    ).length
    const gradedCount = group.length
    return {
      topic,
      correctCount,
      incorrectCount: gradedCount - correctCount,
      gradedCount,
      errorRate: gradedCount
        ? (gradedCount - correctCount) / gradedCount
        : null,
    }
  })
  return {
    attempt,
    correctCount: topics.reduce((n, t) => n + t.correctCount, 0),
    total: graded.length,
    topics,
    recommendations: topics.map((t) => ({
      topic: t.topic,
      reason:
        t.gradedCount < 3
          ? "Ít hơn 3 câu hỏi; cần thêm dữ liệu trước khi kết luận."
          : t.incorrectCount
            ? "Có câu trả lời chưa đúng; nên xem lại nội dung liên quan."
            : "Chưa có lỗi trong mẫu hiện tại; tiếp tục luyện tập.",
      evidenceCount: t.gradedCount,
      status: t.gradedCount < 3 ? "insufficient-data" : "proposed",
    })),
  }
}
