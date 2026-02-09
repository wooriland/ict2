import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";

/**
 * ✅ Auth 페이지 공통 좌/우 패널 (최종 + video auto play)
 *
 * - 좌/우 동일 너비
 * - 상/하 분리 없이 "통짜 패널"
 * - 왼쪽: 텍스트(안내/공지/도움말/링크)
 * - 오른쪽: 미디어(이미지/동영상)
 *
 * ✅ 동영상 정책
 * - 화면에 들어오면 자동 재생
 * - 무한 반복(loop)
 * - muted + playsInline로 브라우저 자동재생 정책 통과
 * - 화면에서 벗어나면 pause(원하면 제거 가능)
 *
 * 사용 예:
 * <AuthSidePanels
 *   left={{
 *     title: "도움말",
 *     text: "아래 메뉴를 이용하세요.",
 *     links: [{ to: "/help", label: "고객센터" }],
 *     notices: ["공지 1"],
 *     tips: ["팁 1"]
 *   }}
 *   right={{
 *     title: "가이드 영상",
 *     text: "아이디 찾기 과정을 영상으로 안내합니다.",
 *     videoSrc: "/video/story.mp4",
 *     // videoControls: true, // 필요하면 켜기
 *   }}
 * />
 */
export default function AuthSidePanels({ left = {}, right = {} }) {
  const videoRef = useRef(null);

  // ✅ video 옵션 기본값(원하면 right에서 덮어쓰기)
  const videoOptions = useMemo(() => {
    return {
      controls: Boolean(right.videoControls), // 기본 false
      pauseWhenOutOfView: right.pauseWhenOutOfView !== false, // 기본 true
      threshold: typeof right.videoThreshold === "number" ? right.videoThreshold : 0.25,
    };
  }, [right.videoControls, right.pauseWhenOutOfView, right.videoThreshold]);

  // ✅ 화면 진입시 재생 / 이탈시 정지
  useEffect(() => {
    const el = videoRef.current;

    // video 없으면 종료
    if (!el) return;

    // 자동재생 정책 안정화
    el.muted = true;
    el.playsInline = true;

    // IntersectionObserver로 "보이면 play"
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!el) return;

        try {
          if (entry.isIntersecting) {
            // ✅ 화면에 들어오면 재생
            await el.play();
          } else if (videoOptions.pauseWhenOutOfView) {
            // ✅ 화면에서 나가면 정지(원하면 옵션으로 끌 수 있음)
            el.pause();
          }
        } catch (e) {
          // 브라우저 정책으로 autoplay가 막힐 수 있음
          // (이 경우 muted/playsInline은 이미 켜져 있으니 대부분 통과)
          console.log("video autoplay blocked:", e);
        }
      },
      { threshold: videoOptions.threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [right.videoSrc, videoOptions.pauseWhenOutOfView, videoOptions.threshold]);

  return (
    <>
      {/* =========================
          ✅ LEFT : 텍스트 패널
         ========================= */}
      <aside className="auth-left" aria-label="left side panel">
        <div className="auth-side">
          <div className="auth-side-panel">
            <div className="auth-side-panel__body">
              {/* 제목 */}
              <h3 className="auth-side-title">{left.title || "안내"}</h3>

              {/* 설명 텍스트 */}
              {left.text && <p className="auth-side-text">{left.text}</p>}

              {/* 주요 링크 */}
              {Array.isArray(left.links) && left.links.length > 0 && (
                <>
                  <div className="auth-side-divider" />
                  <div className="auth-side-links">
                    {left.links.map((l, idx) => (
                      <Link key={idx} to={l.to}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* 공지 */}
              {Array.isArray(left.notices) && left.notices.length > 0 && (
                <>
                  <div className="auth-side-divider" />
                  <h4 className="auth-side-subtitle">공지</h4>
                  <ul className="auth-side-list">
                    {left.notices.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* 도움말 */}
              {Array.isArray(left.tips) && left.tips.length > 0 && (
                <>
                  <div className="auth-side-divider" />
                  <h4 className="auth-side-subtitle">도움말</h4>
                  <ul className="auth-side-list">
                    {left.tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* =========================
          ✅ RIGHT : 미디어 패널
         ========================= */}
      <aside className="auth-right" aria-label="right side panel">
        <div className="auth-side">
          <div className="auth-side-panel">
            {/* 상단 텍스트 영역 */}
            <div className="auth-side-panel__body">
              <h3 className="auth-side-title">{right.title || "미디어"}</h3>
              {right.text && <p className="auth-side-text">{right.text}</p>}
            </div>

            {/* 미디어 영역 (통짜) */}
            <div className="auth-media">
              {/* 이미지 */}
              {right.imageSrc && (
                <div className="auth-media-box">
                  <img className="auth-media-img" src={right.imageSrc} alt="" />
                </div>
              )}

              {/* 동영상 */}
              {right.videoSrc && (
                <div className="auth-media-box">
                  <video
                    ref={videoRef}
                    className="auth-media-video"
                    src={right.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    controls={videoOptions.controls}
                  />
                </div>
              )}

              {/* 아무것도 없을 때 */}
              {!right.imageSrc && !right.videoSrc && (
                <div className="auth-media-box">
                  <div
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#64748b",
                      fontWeight: 800,
                      lineHeight: 1.5,
                    }}
                  >
                    미디어 영역
                    <br />
                    이미지 또는 영상을
                    <br />
                    여기에 배치할 수 있습니다
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
