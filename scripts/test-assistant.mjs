import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import ts from "typescript"

const source = readFileSync(
  new URL("../src/assistant.ts", import.meta.url),
  "utf8",
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const { demoAssistantService } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
)
const now = new Date(2026, 9, 29)
const courses = ["Giải tích", "Mạng máy tính", "Kỹ thuật phần mềm"]
const ask = (text, hasResult = false) =>
  demoAssistantService.interpret({ text, courses, hasResult, now })

test("weekly planning opens Planner without changing a calendar", () => {
  const result = ask("Lập lịch học tuần này")
  assert.equal(result.intent, "PLAN_STUDY")
  assert.equal(result.action, "OPEN_PLANNER")
})
test("network explanation preserves course and topic for guided study", () => {
  const result = ask("Giải thích TCP congestion control")
  assert.equal(result.action, "OPEN_STUDY")
  assert.equal(result.context.course, "Mạng máy tính")
  assert.equal(result.context.topic, "TCP congestion control")
  assert.match(result.message, /chưa có AI giải thích trực tiếp/)
})
test("ambiguous chapter review offers guided study and quiz with context", () => {
  const result = ask("Tôi muốn ôn chương 3 Mạng máy tính")
  assert.equal(result.action, "NONE")
  assert.equal(result.context.topic, "Chương 3")
  assert.deepEqual(
    result.choices.map((choice) => choice.action),
    ["OPEN_STUDY", "OPEN_QUIZ"],
  )
  assert(
    result.choices.every((choice) => choice.context.course === "Mạng máy tính"),
  )
})
test("Transport Layer quiz never routes to the calculus bank", () => {
  const result = ask("Kiểm tra kiến thức Transport Layer")
  assert.equal(result.action, "OPEN_QUIZ")
  assert.equal(result.context.course, "Mạng máy tính")
  assert.equal(result.context.topic, "Transport Layer")
})
test("revision request handles both available and missing results", () => {
  assert.equal(ask("Tôi nên ôn gì?", true).action, "OPEN_RESULTS")
  const missing = ask("Tôi nên ôn gì?")
  assert.equal(missing.action, "NONE")
  assert.match(missing.message, /Chưa có kết quả/)
})
test("Friday duration asks for course and offers an unconfirmed proposal", () => {
  const result = ask("Dành thêm 30 phút học thứ Sáu")
  assert.equal(result.action, "NONE")
  assert.equal(result.context.durationMinutes, 30)
  assert.equal(result.context.targetDate, "2026-10-30")
  assert(result.choices.every((choice) => choice.action === "PROPOSE_REPLAN"))
})
test("unsupported request gets a useful fallback", () => {
  const result = ask("Đặt vé máy bay")
  assert.equal(result.intent, "UNSUPPORTED_REQUEST")
  assert.equal(result.action, "NONE")
})
