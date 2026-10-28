import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import ts from "typescript"
const source = readFileSync(
  new URL("../src/domain.ts", import.meta.url),
  "utf8",
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const {
  generatePlan,
  validateTask,
  overlap,
  gradeAttempt,
  localDate,
  startOfWeek,
  addDays,
} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
)
const monday = startOfWeek(new Date(2026, 9, 28))
const task = (extra = {}) => ({
  id: "a",
  title: "Luyện tập",
  course: "Giải tích",
  deadline: localDate(addDays(monday, 4)),
  estimatedMinutes: 90,
  remainingMinutes: 90,
  priority: "Cao",
  confirmed: true,
  ...extra,
})
const slots = [{ id: "s", day: 2, startMinute: 1020, endMinute: 1140 }]
test("valid task schedules within availability and before deadline", () => {
  const plan = generatePlan(
    [task()],
    slots,
    [],
    [],
    monday,
    new Date(2026, 9, 28),
  )
  assert.equal(
    plan.blocks.reduce((n, b) => n + b.endMinute - b.startMinute, 0),
    90,
  )
  assert.equal(plan.unscheduled.length, 0)
  assert(
    plan.blocks.every(
      (b) =>
        b.startMinute >= 1020 &&
        b.endMinute <= 1140 &&
        b.date <= task().deadline,
    ),
  )
})
test("commitment prevents overlap", () => {
  const date = localDate(addDays(monday, 2))
  const plan = generatePlan(
    [task()],
    slots,
    [{ id: "c", date, startMinute: 1020, endMinute: 1080, title: "Họp" }],
    [],
    monday,
    new Date(2026, 9, 28),
  )
  assert(
    plan.blocks.every((b) => !overlap(b.startMinute, b.endMinute, 1020, 1080)),
  )
  assert.equal(plan.unscheduled[0]?.minutes, 30)
})
test("insufficient capacity is reported", () => {
  const plan = generatePlan(
    [task()],
    [{ id: "s", day: 2, startMinute: 1020, endMinute: 1050 }],
    [],
    [],
    monday,
    new Date(2026, 9, 28),
  )
  assert.equal(plan.unscheduled[0]?.minutes, 60)
})
test("expired and impossible remaining effort are rejected", () => {
  assert.match(
    validateTask(task({ deadline: "2020-01-01" }), new Date(2026, 9, 28)),
    /đã qua/,
  )
  assert.match(
    validateTask(task({ remainingMinutes: 100 }), new Date(2026, 9, 28)),
    /còn lại/,
  )
})
test("proposal is pure and does not mutate confirmed blocks", () => {
  const confirmed = []
  const plan = generatePlan(
    [task()],
    slots,
    [],
    confirmed,
    monday,
    new Date(2026, 9, 28),
  )
  assert.equal(confirmed.length, 0)
  assert.equal(plan.status, "proposed")
})
test("a preferred Friday revision stays on Friday or reports missing capacity", () => {
  const friday = localDate(addDays(monday, 4))
  const proposed = task({
    preferredDate: friday,
    deadline: friday,
    remainingMinutes: 30,
    estimatedMinutes: 30,
  })
  const withFriday = generatePlan(
    [proposed],
    [{ id: "f", day: 4, startMinute: 1020, endMinute: 1080 }],
    [],
    [],
    monday,
    new Date(2026, 9, 28),
  )
  assert.equal(withFriday.blocks[0]?.date, friday)
  const withoutFriday = generatePlan(
    [proposed],
    slots,
    [],
    [],
    monday,
    new Date(2026, 9, 28),
  )
  assert.equal(withoutFriday.blocks.length, 0)
  assert.equal(withoutFriday.unscheduled[0]?.minutes, 30)
})
test("demo grading is deterministic and cannot grade unreviewed questions as verified", () => {
  const q = [
    {
      id: "q",
      topic: "Đạo hàm riêng",
      course: "Giải tích",
      prompt: "?",
      choices: ["a", "b"],
      answerIndex: 1,
      status: "demo",
    },
  ]
  const attempt = {
    id: "x",
    questionIds: ["q"],
    answers: { q: 0 },
    submittedAt: "",
    mode: "demo",
  }
  const result = gradeAttempt(q, attempt)
  assert.equal(result.correctCount, 0)
  assert.equal(result.topics[0].errorRate, 1)
  assert.equal(result.recommendations[0].status, "insufficient-data")
  assert.equal(gradeAttempt(q, { ...attempt, mode: "verified" }).total, 0)
})
