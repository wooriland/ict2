import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";

/**
 * ✅ Auth 페이지 공통 좌/우 패널 (내집마련 톤 업그레이드)
 *
 * - 좌/우 동일 너비
 * - 왼쪽: 텍스트(안내/공지/도움말/링크)
 * - 오른쪽: 미디어(이미지/동영상)
 *
 * ✅ 동영상 정책
 * - 화면에 들어오면 자동 재생
 * - 무한 반복(loop)
 * - muted + playsInline로 브라우저 자동재생 정책 통과
 * - 화면에서 벗어나면 pause(옵션)
 *
 * ✅ 추가: 영상/이미지 카피(문구) 지원
 * - right.mediaTopText    : 미디어 위(overlay)
 * - right.mediaBottomText : 미디어 아래(caption)
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
    if (!el) return;

    // ✅ 자동재생 정책 안정화
    el.muted = true;
    el.playsInline = true;

    // IntersectionObserver로 "보이면 play"
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!el) return;

        try {
          if (entry.isIntersecting) {
            await el.play();
          } else if (videoOptions.pauseWhenOutOfView) {
            el.pause();
          }
        } catch (e) {
          // 브라우저 정책으로 autoplay가 막힐 수 있음
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
              {/* ✅ 내집마련: 작은 뱃지(집/보안 느낌) */}
              <div className="auth-side-badge" aria-hidden="true">
                🏠 내집마련 가이드
              </div>

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
            {/* 상단 텍스트 영역(패널 기본 텍스트) */}
            <div className="auth-side-panel__body">
              <div className="auth-side-badge" aria-hidden="true">
                🔒 신뢰 & 안전
              </div>

              <h3 className="auth-side-title">{right.title || "미디어"}</h3>
              {right.text && <p className="auth-side-text">{right.text}</p>}
            </div>

            {/* 미디어 영역 */}
            <div className="auth-media">
              {/* 이미지 */}
              {right.imageSrc && (
                <div className="auth-media-box">
                  {/* ✅ 이미지 위 오버레이 문구(옵션) */}
                  {right.mediaTopText && (
                    <div className="auth-media-overlay auth-media-overlay--top">
                      <span style={{ whiteSpace: "pre-line" }}>{right.mediaTopText}</span>
                    </div>
                  )}

                  <img className="auth-media-img" src={right.imageSrc} alt="" />

                  {/* ✅ 이미지 아래 문구(옵션) */}
                  {right.mediaBottomText && (
                    <div className="auth-media-caption">
                      <span style={{ whiteSpace: "pre-line" }}>{right.mediaBottomText}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 동영상 */}
              {right.videoSrc && (
                <div className="auth-media-box">
                  {/* ✅ 영상 위 오버레이 문구(옵션) */}
                  {right.mediaTopText && (
                    <div className="auth-media-overlay auth-media-overlay--top">
                      <span style={{ whiteSpace: "pre-line" }}>{right.mediaTopText}</span>
                    </div>
                  )}

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

                  {/* ✅ 영상 아래 문구(옵션) */}
                  {right.mediaBottomText && (
                    <div className="auth-media-caption">
                      <span style={{ whiteSpace: "pre-line" }}>{right.mediaBottomText}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 아무것도 없을 때 */}
              {!right.imageSrc && !right.videoSrc && (
                <div className="auth-media-box">
                  <div className="auth-media-empty">
                    미디어 영역
                    <br />
                    이미지 또는 영상을
                    <br />
                    여기에 배치할 수 있습니다
                  </div>
                </div>
              )}

              {/* ✅ 하단 작은 안내(선택) */}
              {right.footer && <div className="auth-media-foot">{right.footer}</div>}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
