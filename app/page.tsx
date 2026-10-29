"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/app/supabase";

const flowerOptions = [
  { id: "daisy", name: "Cúc nhỏ", icon: "🌼", bouquet: "🌼 🌿 🌼" },
  { id: "tulip", name: "Tulip hồng", icon: "🌷", bouquet: "🌷 🌷 🌿" },
  { id: "cherry", name: "Hoa anh đào", icon: "🌸", bouquet: "🌸 🌸 🌸" },
  { id: "sunflower", name: "Hướng dương", icon: "🌻", bouquet: "🌻 🌿 🌻" },
  { id: "rose", name: "Hoa hồng", icon: "🌹", bouquet: "🌹 🌿 🌹" },
  { id: "hibiscus", name: "Dâm bụt", icon: "🌺", bouquet: "🌺 🌿 🌺" },
  { id: "blossom", name: "Cẩm chướng", icon: "🏵️", bouquet: "🏵️ 🌿 🏵️" },
  { id: "lotus", name: "Hoa sen", icon: "🪷", bouquet: "🪷 🌿 🪷" },
  { id: "lavender", name: "Oải hương", icon: "🪻", bouquet: "🪻 🌿 🪻" },
  { id: "rose-bouquet", name: "Bó hồng", icon: "💮", bouquet: "💮 🌿 💮" },
] as const;

const WISH_STORAGE_KEY = "quynh-hoa-graduation-wishes";
type WishEntry = {
  id: string;
  author: string;
  message: string;
  flowerId: (typeof flowerOptions)[number]["id"];
  createdAt: string;
};

type LegacyWishEntry = Omit<WishEntry, "createdAt">;

let legacyMigrationInProgress: Promise<void> | null = null;

function parseSavedWishes(snapshot: string): LegacyWishEntry[] {
  const parsed: unknown = JSON.parse(snapshot);
  if (!Array.isArray(parsed) || !parsed.every(isWishEntry)) {
    throw new Error("Dữ liệu lời chúc đã lưu không đúng định dạng.");
  }
  return parsed;
}

function isFlowerId(value: unknown): value is WishEntry["flowerId"] {
  return flowerOptions.some((option) => option.id === value);
}

function isWishEntry(value: unknown): value is LegacyWishEntry {
  if (typeof value !== "object" || value === null) return false;

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.author === "string" &&
    typeof entry.message === "string" &&
    isFlowerId(entry.flowerId)
  );
}

async function migrateSavedWishes(supabase: ReturnType<typeof getSupabaseClient>) {
  const saved = window.localStorage.getItem(WISH_STORAGE_KEY);
  if (!saved) return;

  const legacyWishes = parseSavedWishes(saved);
  if (legacyWishes.length > 0) {
    const { error } = await supabase.from("wishes").upsert(
      legacyWishes.map((wish) => ({
        id: wish.id,
        author: wish.author,
        message: wish.message,
        flower_id: wish.flowerId,
      })),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  window.localStorage.removeItem(WISH_STORAGE_KEY);
}

function migrateSavedWishesOnce(supabase: ReturnType<typeof getSupabaseClient>) {
  if (!legacyMigrationInProgress) {
    legacyMigrationInProgress = migrateSavedWishes(supabase).finally(() => {
      legacyMigrationInProgress = null;
    });
  }
  return legacyMigrationInProgress;
}

function formatWishDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
}

function GraduateIllustration() {
  return (
    <svg
      className="graduate-illustration"
      viewBox="0 0 360 380"
      role="img"
      aria-labelledby="graduate-picture-title"
    >
      <title id="graduate-picture-title">Minh họa ngày tốt nghiệp</title>
      <defs>
        <linearGradient id="portrait-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4eafa" />
          <stop offset="1" stopColor="#ffe8dc" />
        </linearGradient>
        <linearGradient id="gown" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#302c35" />
          <stop offset="1" stopColor="#17151b" />
        </linearGradient>
        <linearGradient id="hair" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#a96943" />
          <stop offset="1" stopColor="#643923" />
        </linearGradient>
      </defs>
      <circle cx="180" cy="188" r="165" fill="url(#portrait-bg)" />
      <circle cx="180" cy="188" r="143" fill="none" stroke="#fff" strokeOpacity=".8" />
      <path d="M37 291c32-21 51-18 75 5m175-22c22-13 34-10 48 2" fill="none" stroke="#b8c5a5" strokeLinecap="round" strokeWidth="7" />
      <path d="M91 343c7-79 35-118 89-118s82 39 89 118" fill="url(#gown)" />
      <path d="M126 238c-15 9-22 21-23 39l30 25 25-32-14-35z" fill="#242129" />
      <path d="M234 238c15 9 22 21 23 39l-30 25-25-32 14-35z" fill="#242129" />
      <path d="m151 235 29 38 29-38 17 108h-92z" fill="#fff8f1" />
      <path d="m151 235 29 38-19 20-30-43zm58 0-29 38 19 20 30-43z" fill="#f08c35" />
      <path d="M164 272h32l-7 16h-18z" fill="#e2ae66" />
      <rect x="174" y="283" width="12" height="22" rx="5" fill="#e2ae66" />
      <path d="M120 159c-5-39 4-79 60-80 56 1 65 41 60 80l12 74c2 18-3 36-15 50-8-20-11-46-10-73l-1-45H134l-1 45c1 27-2 53-10 73-12-14-17-32-15-50z" fill="url(#hair)" />
      <path d="M126 147c0-38 24-64 55-64s55 26 55 64v28c0 38-25 64-55 64s-55-26-55-64z" fill="#f3c7a8" transform="translate(18 17) scale(.9)" />
      <path d="M127 138c9-29 28-43 53-43 25 0 44 14 53 43-12-8-21-12-31-16-13 12-34 18-75 16z" fill="url(#hair)" />
      <path d="M143 119c-2 10-2 17 0 24m15-30c-2 12-2 20 0 29m17-33c-1 11 0 21 2 31m17-30c1 11 3 19 6 27" fill="none" stroke="#bd8059" strokeLinecap="round" strokeWidth="3" />
      <g transform="translate(18 17) scale(.9)">
        <path d="M124 147c-12 0-15 12-10 25 3 8 8 11 14 10m108-35c12 0 15 12 10 25-3 8-8 11-14 10" fill="#f3c7a8" />
        <path d="M151 161h9" stroke="#493d4f" strokeLinecap="round" strokeWidth="5" />
        <path className="graduate-blink-eye" d="M199 161h9" stroke="#493d4f" strokeLinecap="round" strokeWidth="5" />
        <path d="M140 183c4-3 8-3 12 0m56 0c4-3 8-3 12 0" fill="#e99c96" opacity=".42" />
        <path d="M161 188c10 14 28 14 38 0-10 5-28 5-38 0z" fill="#c87976" />
      </g>
      <path d="m101 99 79-43 79 43-79 42z" fill="#443950" />
      <path d="M139 111v22c18 15 64 15 82 0v-22l-41 22z" fill="#625078" />
      <path d="M258 99v50" stroke="#d7a24f" strokeLinecap="round" strokeWidth="4" />
      <path d="M253 149h10l-2 12c-1 6-7 6-8 0z" fill="#e4b761" />
      <g transform="rotate(-4 180 285)">
        <rect x="126" y="249" width="108" height="75" rx="8" fill="#bd2638" />
        <rect x="132" y="255" width="96" height="63" rx="4" fill="none" stroke="#f8d9c4" strokeWidth="1.5" />
        <path d="M180 260v53" stroke="#f8d9c4" strokeOpacity=".6" />
        <text x="155" y="291" fill="#fff8f1" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="700" letterSpacing="1">FPT</text>
        <text x="180" y="306" fill="#f8d9c4" fontFamily="Arial, sans-serif" fontSize="5.5" letterSpacing=".8" textAnchor="middle">GRADUATION</text>
      </g>
      <path d="M127 269c-5 1-8 5-7 10l5 8c2 3 7 3 9 0l5-8-4-8c-2-3-5-3-8-2zm106 0c5 1 8 5 7 10l-5 8c-2 3-7 3-9 0l-5-8 4-8c2-3 5-3 8-2z" fill="#f3c7a8" />
      <path d="m125 277 8 4m102-4-8 4" stroke="#dfaa8b" strokeLinecap="round" strokeWidth="2" />
      <path d="M74 241c-10-12-9-26 1-37m201 43c10-11 11-23 4-34" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="4" />
      <path d="m65 104 4 11 11 4-11 4-4 11-4-11-11-4 11-4zm227 75 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#dfa77c" />
      <circle cx="91" cy="174" r="5" fill="#a88bc2" />
      <circle cx="274" cy="126" r="4" fill="#e4aa78" />
      <path d="M77 332c2-20 1-34-4-45m-10 45c0-12-5-22-12-28m27 28c6-11 13-16 21-18" fill="none" stroke="#879d76" strokeLinecap="round" strokeWidth="4" />
      <circle cx="73" cy="281" r="10" fill="#f4a8aa" />
      <circle cx="59" cy="301" r="8" fill="#f6c879" />
      <circle cx="97" cy="304" r="9" fill="#d6b7e5" />
      <path d="M285 331c-1-18 2-31 8-42m7 42c0-12 5-21 12-27m-26 27c-5-10-11-15-19-17" fill="none" stroke="#879d76" strokeLinecap="round" strokeWidth="4" />
      <circle cx="293" cy="282" r="10" fill="#f6c879" />
      <circle cx="309" cy="302" r="8" fill="#d6b7e5" />
      <circle cx="277" cy="305" r="9" fill="#f4a8aa" />
    </svg>
  );
}

export default function Home() {
  const [guestName, setGuestName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isEnvelopeOpening, setIsEnvelopeOpening] = useState(false);
  const [selectedFlower, setSelectedFlower] =
    useState<(typeof flowerOptions)[number]["id"]>("daisy");
  const [wish, setWish] = useState("");
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [isWishesLoading, setIsWishesLoading] = useState(true);
  const [isWishSubmitting, setIsWishSubmitting] = useState(false);
  const [wishError, setWishError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let latestRequest = 0;
    let supabaseClient: ReturnType<typeof getSupabaseClient> | undefined;
    let channel: RealtimeChannel | undefined;

    void Promise.resolve()
      .then(() => {
        const supabase = getSupabaseClient();
        if (!isMounted) return;
        supabaseClient = supabase;

        const loadWishes = async () => {
          const request = ++latestRequest;
          const { data, error } = await supabase
            .from("wishes")
            .select("id, author, message, flower_id, created_at")
            .order("created_at", { ascending: false });

          if (request !== latestRequest || !isMounted) return;
          if (error) throw error;

          const nextWishes = data.map((entry) => {
            if (
              typeof entry.id !== "string" ||
              typeof entry.author !== "string" ||
              typeof entry.message !== "string" ||
              !isFlowerId(entry.flower_id) ||
              typeof entry.created_at !== "string" ||
              !Number.isFinite(Date.parse(entry.created_at))
            ) {
              throw new Error("Một lời chúc trên hệ thống không đúng định dạng.");
            }
            return {
              id: entry.id,
              author: entry.author,
              message: entry.message,
              flowerId: entry.flower_id,
              createdAt: entry.created_at,
            };
          });
          setWishes(nextWishes);
          setIsWishesLoading(false);
          setWishError("");
        };

        const reportLoadError = (error: unknown) => {
          console.error("Không thể tải danh sách lời chúc từ Supabase.", error);
          if (isMounted) {
            setIsWishesLoading(false);
            setWishError(`Không thể tải lời chúc: ${getErrorMessage(error)}`);
          }
        };

        channel = supabase
          .channel("public-wishes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "wishes" },
            () => {
              void loadWishes().catch(reportLoadError);
            },
          )
          .subscribe((status, error) => {
            if (
              isMounted &&
              (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
            ) {
              console.error("Kênh realtime Supabase gặp lỗi.", error);
              setWishError(
                `Kết nối cập nhật lời chúc realtime gặp lỗi (${status}).`,
              );
            }
          });

        void loadWishes().catch(reportLoadError);
        void migrateSavedWishesOnce(supabase).catch((error: unknown) => {
          console.error("Không thể chuyển lời chúc cũ lên Supabase.", error);
          if (isMounted) {
            setWishError(`Không thể đồng bộ lời chúc đã lưu trước đây: ${getErrorMessage(error)}`);
          }
        });
      })
      .catch((error: unknown) => {
        console.error("Không thể khởi tạo Supabase.", error);
        if (isMounted) {
          setIsWishesLoading(false);
          setWishError(`Không thể kết nối Supabase: ${getErrorMessage(error)}`);
        }
      });

    return () => {
      isMounted = false;
      if (supabaseClient && channel) {
        void supabaseClient.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEnvelopeOpening) return;

    const timeout = window.setTimeout(() => setIsLetterOpen(true), 700);
    return () => window.clearTimeout(timeout);
  }, [isEnvelopeOpening]);

  const flower =
    flowerOptions.find((option) => option.id === selectedFlower) ??
    flowerOptions[0];

  function openInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = guestName.trim();
    if (name) setSubmittedName(name);
  }

  async function addWish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = wish.trim();
    if (!message || !submittedName) return;

    setIsWishSubmitting(true);
    setWishError("");
    try {
      const { error } = await getSupabaseClient().from("wishes").insert({
        author: submittedName,
        message,
        flower_id: selectedFlower,
      });
      if (error) throw error;
      setWish("");
    } catch (error) {
      console.error("Không thể lưu lời chúc lên Supabase.", error);
      setWishError(`Không thể gửi lời chúc: ${getErrorMessage(error)}`);
    } finally {
      setIsWishSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-left" aria-hidden="true">✳</div>
      <div className="ambient ambient-right" aria-hidden="true">✿</div>

      <header className="topbar">
        <a className="brand" href="#" aria-label="FPT · Trương Phạm Quỳnh Hoa">
          <Image
            className="fpt-logo"
            src="/fpt-university-logo.png"
            alt="FPT University"
            width={1280}
            height={500}
            priority
          />
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-name">Trương Phạm Quỳnh Hoa</span>
        </a>
        <span className="topbar-note">một ngày thật đặc biệt đang chờ ✨</span>
      </header>

      {!submittedName ? (
        <section className="landing-stage" aria-labelledby="welcome-title">
          <div className="landing-copy">
            <span className="eyebrow"><span /> THIỆP MỜI TỐT NGHIỆP <span /></span>
            <h1 id="welcome-title">
              Ngày vui
              <br />
              <span>có bạn thêm</span>
              <br />
              trọn vẹn.
            </h1>
            <p className="landing-description">
              Một lời mời nhỏ, dành riêng cho bạn. Để lại tên bên dưới để nhận
              thư mời mừng ngày tốt nghiệp cùng tụi mình nhé!
            </p>
            <form className="name-form" onSubmit={openInvitation}>
              <label htmlFor="guest-name">Tên thân thương của bạn</label>
              <div className="input-wrap">
                <span aria-hidden="true">♡</span>
                <input
                  id="guest-name"
                  name="guestName"
                  autoComplete="name"
                  maxLength={60}
                  placeholder="Ví dụ: Minh Anh"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                />
              </div>
              <button className="primary-button" type="submit">
                Xem thư mời <span aria-hidden="true">↗</span>
              </button>
            </form>
            <div className="landing-note">
              <span aria-hidden="true">✦</span>
              <span>Ngày vui: <strong>07 tháng 11</strong></span>
              <span className="landing-note-divider" aria-hidden="true" />
              <span>13:00 – 17:00</span>
            </div>
          </div>

          <div className="landing-visual" aria-label="Minh họa ngày tốt nghiệp">
            <div className="visual-orbit orbit-outer" />
            <div className="visual-orbit orbit-inner" />
            <span className="visual-sparkle sparkle-top" aria-hidden="true">✦</span>
            <span className="visual-sparkle sparkle-side" aria-hidden="true">✧</span>
            <span className="bloom-drift bloom-one" aria-hidden="true">🌸</span>
            <div className="portrait-frame">
              <GraduateIllustration />
            </div>
            <div className="date-sticker">
              <span>07</span>
              <small>THÁNG 11</small>
            </div>
            <div className="visual-caption">
              <span className="caption-dot" />
              <span>một chương mới bắt đầu</span>
            </div>
          </div>
          <div className="landing-scroll-hint" aria-hidden="true">
            <span />
            một lời mời đang chờ bạn
            <span />
          </div>
        </section>
      ) : !isLetterOpen ? (
        <section className="letter-stage" aria-labelledby="letter-title">
          <div className="letter-intro">
            <span className="eyebrow"><span /> MỘT LÁ THƯ DÀNH RIÊNG CHO BẠN <span /></span>
            <h1 id="letter-title">Bạn có thư nhé, <span>{submittedName}</span></h1>
            <p>
              Có một lời mời nhỏ đang chờ được mở. Nhấn nhận thư để xem lời
              nhắn và thông tin ngày vui cùng mình.
            </p>
          </div>
          <div className="envelope-wrap">
            <div
              className={`envelope${isEnvelopeOpening ? " is-opening" : ""}`}
              aria-hidden="true"
            >
              <div className="envelope-paper">
                <span>THƯ MỜI</span>
                <strong>Gửi {submittedName}</strong>
                <span>07 · THÁNG 11</span>
              </div>
              <div className="envelope-back" />
              <div className="envelope-flap" />
              <div className="envelope-pocket" />
              <div className="envelope-seal">✿</div>
            </div>
          </div>
          <button
            className="primary-button receive-letter-button"
            type="button"
            disabled={isEnvelopeOpening}
            onClick={() => setIsEnvelopeOpening(true)}
          >
            {isEnvelopeOpening ? "Đang mở thư..." : "Nhận thư"}
            <span aria-hidden="true">{isEnvelopeOpening ? "✦" : "♡"}</span>
          </button>
          <button
            className="back-button"
            type="button"
            onClick={() => {
              setSubmittedName("");
              setIsLetterOpen(false);
            }}
          >
            <span aria-hidden="true">←</span> Đổi tên người nhận
          </button>
        </section>
      ) : (
        <div className="invitation-page">
          <section className="invitation-hero" aria-labelledby="invite-title">
            <div className="invitation-copy">
              <span className="eyebrow"><span /> BẠN ĐƯỢC MỜI ĐẾN CHUNG VUI <span /></span>
              <p className="invite-greeting">Thân mời bạn,</p>
              <h1 id="invite-title" className="guest-title">{submittedName}</h1>
              <p className="invite-description">
                Mình trân trọng mời bạn đến chung vui trong ngày tốt nghiệp —
                dịp để cùng khép lại một hành trình thật đẹp và chào đón những
                điều mới mẻ phía trước. Sự hiện diện của bạn sẽ khiến ngày vui
                này thêm trọn vẹn. Mình mong được gặp bạn để cùng trò chuyện,
                chụp vài tấm hình kỷ niệm và lưu giữ khoảnh khắc đáng nhớ này.
              </p>
              <div className="graduate-signature">
                <span className="signature-line" />
                <span>Thân mến, <strong>Quỳnh Hoa</strong></span>
              </div>
            </div>
            <div className="invitation-portrait">
              <span className="portrait-sparkle portrait-sparkle-one" aria-hidden="true">✦</span>
              <span className="portrait-sparkle portrait-sparkle-two" aria-hidden="true">✧</span>
              <div className="portrait-frame">
                <Image
                  className="graduate-portrait-photo"
                  src="/09971967465bc6059f4a.jpg"
                  alt="Quỳnh Hoa trong lễ tốt nghiệp"
                  fill
                  sizes="(max-width: 700px) 85vw, 280px"
                  priority
                />
              </div>
              <div className="selected-bouquet" aria-label={`Bó hoa ${flower.name}`}>
                <span aria-hidden="true">{flower.bouquet}</span>
              </div>
              <div className="portrait-label">
                <span aria-hidden="true">🎓</span>
                <span>ngày của Quỳnh Hoa</span>
              </div>
            </div>

            <div className="event-details">
              <div className="detail-item">
                <span className="detail-icon" aria-hidden="true">♡</span>
                <span className="detail-label">NGÀY VUI</span>
                <strong>07 tháng 11</strong>
              </div>
              <span className="detail-divider" aria-hidden="true" />
              <div className="detail-item">
                <span className="detail-icon" aria-hidden="true">◷</span>
                <span className="detail-label">THỜI GIAN</span>
                <strong>13:00 – 17:00</strong>
              </div>
              <span className="detail-divider" aria-hidden="true" />
              <div className="detail-item location-detail">
                <span className="detail-icon" aria-hidden="true">⌖</span>
                <span className="detail-label">ĐỊA ĐIỂM</span>
                <strong>Trường Đại học FPT TP.HCM: Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh.</strong>
              </div>
            </div>
          </section>

          <section className="wishes-section" aria-labelledby="wishes-title">
            <div className="wishes-heading">
              <div>
                <span className="section-kicker">GỬI MỘT ĐIỀU DỄ THƯƠNG</span>
                <h2 id="wishes-title">Góc lời chúc <span aria-hidden="true">💌</span></h2>
              </div>
              <div className="wish-summary" aria-label={`Loại hoa đang chọn ${flower.name}`}>
                <span className="wish-summary-icon" aria-hidden="true">{flower.icon}</span>
                <span>{flower.name}</span>
              </div>
            </div>

            <p className="wish-intro">
              Một câu chúc ngắn gọn hay một lời động viên dài hơn đều sẽ làm ngày vui của Quỳnh Hoa thêm ấm áp.
            </p>

            <form className="wish-form" onSubmit={addWish}>
              <label htmlFor="wish-message">Lời chúc của bạn</label>
              <textarea
                id="wish-message"
                maxLength={280}
                placeholder="Viết lời chúc của bạn ở đây..."
                value={wish}
                onChange={(event) => setWish(event.target.value)}
                required
                rows={3}
              />
              <div className="wish-form-footer">
                <span>{wish.length}/280 ký tự</span>
                <button
                  className="primary-button wish-submit"
                  type="submit"
                  disabled={isWishSubmitting}
                >
                  {isWishSubmitting ? "Đang gửi..." : "Gửi lời chúc"}
                  <span aria-hidden="true">{isWishSubmitting ? "✦" : "♡"}</span>
                </button>
              </div>
            </form>

            {wishError && (
              <p className="wish-error" role="alert">
                {wishError}
              </p>
            )}

            {wishes.length > 0 ? (
              <ul className="wish-list" aria-live="polite">
                {wishes.map((entry) => {
                  const flowerOption = flowerOptions.find(
                    (option) => option.id === entry.flowerId,
                  );

                  return (
                    <li className="wish-note" key={entry.id}>
                      <span className="wish-note-flower" aria-hidden="true">
                        {flowerOption?.icon}
                      </span>
                      <div className="wish-note-content">
                        <strong>{entry.author}</strong>
                        <p>{entry.message}</p>
                        <time dateTime={entry.createdAt}>
                          {formatWishDate(entry.createdAt)}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : isWishesLoading ? (
              <p className="empty-wishes" role="status">
                <span aria-hidden="true">✦</span> Đang tải lời chúc...
              </p>
            ) : (
              <p className="empty-wishes">
                <span aria-hidden="true">🌱</span> Chưa có lời chúc nào mới.
              </p>
            )}
          </section>

          <button
            className="back-button"
            type="button"
            onClick={() => {
              setSubmittedName("");
              setIsLetterOpen(false);
              setIsEnvelopeOpening(false);
              setWish("");
            }}
          >
            <span aria-hidden="true">←</span> Tạo thiệp mới
          </button>
        </div>
      )}

      <footer className="site-footer">
        <span>được làm bằng thật nhiều niềm vui</span>
        <span aria-hidden="true">✿</span>
        <span>hẹn gặp bạn ngày 07.11</span>

        <span>SĐT liên lạc : 0357788401</span>
      </footer>
    </main>
  );
}
