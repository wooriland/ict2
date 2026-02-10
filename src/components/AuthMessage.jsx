// src/components/AuthMessage.jsx
// ✅ alert() 대신, 카드 내부에 표시되는 메시지 박스 컴포넌트
// type: "success" | "error" | "info"
export default function AuthMessage({ type = "info", title = "", desc = "" }) {
  // ✅ 아무 내용도 없으면 렌더링하지 않음 (UI 깔끔)
  if (!title && !desc) return null;

  return (
    <div className={`auth-message ${type}`}>
      {title && <p className="auth-message__title">{title}</p>}
      {desc && <p className="auth-message__desc">{desc}</p>}
    </div>
  );
}
