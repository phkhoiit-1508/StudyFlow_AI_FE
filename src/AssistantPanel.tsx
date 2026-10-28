import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  ArrowUp,
  Bot,
  ChevronRight,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react"
import type { AssistantChoice, AssistantMessage } from "./assistant"
import "./assistant.css"

const suggestions = [
  "Lập lịch học tuần này",
  "Tôi muốn ôn bài",
  "Giải thích TCP congestion control",
  "Kiểm tra kiến thức Transport Layer",
  "Tôi nên ôn gì?",
]

export default function AssistantPanel({
  open,
  close,
  launch,
  messages,
  busy,
  send,
  choose,
}: {
  open: boolean
  close: () => void
  launch: () => void
  messages: AssistantMessage[]
  busy: boolean
  send: (text: string) => void
  choose: (choice: AssistantChoice) => void
}) {
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      endRef.current?.scrollIntoView({ block: "end" })
    } else if (wasOpen.current) launcherRef.current?.focus()
    wasOpen.current = open
  }, [open, messages.length])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim() || busy) return
    send(draft.trim())
    setDraft("")
  }
  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          className="as-launcher"
          onClick={launch}
          aria-label="Mở StudyFlow Assistant"
        >
          <Sparkles size={21} />
          <span>Trợ lý học tập</span>
        </button>
      )}
      {open && (
        <section
          className="as-panel"
          role="dialog"
          aria-modal="false"
          aria-label="StudyFlow Assistant"
        >
          <header className="as-header">
            <div className="as-header-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <strong>StudyFlow Assistant</strong>
              <small>Điều hướng thông minh · bản demo</small>
            </div>
            <button onClick={close} aria-label="Đóng StudyFlow Assistant">
              <X size={20} />
            </button>
          </header>
          <div className="as-intro">
            <span>
              <Bot size={16} /> TRỢ LÝ CỦA BẠN
            </span>
            <p>
              Mình giúp bạn bắt đầu đúng chỗ: lập kế hoạch, học có hướng dẫn, ôn
              tập hoặc xem kết quả. Yêu cầu thay đổi lịch luôn cần bạn xác nhận.
            </p>
          </div>
          <div
            className="as-messages"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((message) => (
              <div key={message.id} className={`as-message ${message.role}`}>
                <span className="as-message-icon">
                  {message.role === "assistant" ? (
                    <Sparkles size={15} />
                  ) : (
                    "Bạn"
                  )}
                </span>
                <div>
                  <p>{message.text}</p>
                  {message.choices && (
                    <div className="as-choices">
                      {message.choices.map((choice, index) => (
                        <button
                          key={`${choice.action}-${index}`}
                          onClick={() => choose(choice)}
                          disabled={busy}
                        >
                          {choice.label}
                          <ChevronRight size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="as-processing" role="status">
                <span />
                <span />
                <span /> Đang phân loại yêu cầu trong bản demo...
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="as-suggest">
            <small>THỬ MỘT YÊU CẦU</small>
            <div>
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  disabled={busy}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <form className="as-composer" onSubmit={submit}>
            <label htmlFor="assistant-message">Nhập yêu cầu của bạn</label>
            <div>
              <textarea
                id="assistant-message"
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    if (draft.trim() && !busy) {
                      send(draft.trim())
                      setDraft("")
                    }
                  }
                }}
                placeholder="Ví dụ: Tôi muốn ôn chương 3 Mạng máy tính"
                rows={2}
              />
              <button
                type="submit"
                disabled={!draft.trim() || busy}
                aria-label="Gửi yêu cầu"
              >
                <ArrowUp size={19} />
              </button>
            </div>
            <span>
              <MessageCircle size={13} /> Quy tắc demo, chưa kết nối AI trực
              tiếp
            </span>
          </form>
        </section>
      )}
    </>
  )
}
