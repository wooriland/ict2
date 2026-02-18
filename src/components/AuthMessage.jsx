// src/components/AuthMessage.jsx
// ✅ alert() 대신, 카드 내부에 표시되는 메시지 박스 컴포넌트
// type: "success" | "error" | "info"
export default function AuthMessage({ type = "info", title = "", desc = "" }) {
  // ✅ 아무 내용도 없으면 렌더링하지 않음 (UI 깔끔)
  if (!title && !desc) return null;

  // ✅ 타입별 아이콘/기본 타이틀(없으면 자동)
  const meta = {
    success: { icon: "✅", defaultTitle: "완료" },
    error: { icon: "⚠️", defaultTitle: "확인 필요" },
    info: { icon: "ℹ️", defaultTitle: "안내" },
  };

  const { icon, defaultTitle } = meta[type] || meta.info;
  const finalTitle = title || defaultTitle;

  return (
    <div className={`auth-message ${type}`} role="status" aria-live="polite">
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            width: 28,
            height: 28,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.06)",
            flex: "0 0 auto",
            marginTop: 1,
            fontSize: 16,
          }}
        >
          {icon}
        </span>

        <div style={{ minWidth: 0 }}>
          {finalTitle && <p className="auth-message__title">{finalTitle}</p>}
          {desc && <p className="auth-message__desc">{desc}</p>}
        </div>
      </div>
    </div>
  );
}
