"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import LoginScene from "@/components/three/LoginScene";
import type { Locale } from "@/i18n/translations";

const labels: Record<Locale, {
  welcome: string; subtitle: string;
  createAccount: string; createSubtitle: string;
  email: string; password: string; passwordHint: string;
  signIn: string; signUp: string;
  noAccount: string; hasAccount: string;
  orPhone: string; phonePlaceholder: string; sendCode: string;
  verifyTitle: string; verifySubtitle: string; verify: string; resend: string; back: string;
  privacy: string; confirmEmail: string;
}> = {
  en: {
    welcome: "Welcome back", subtitle: "Sign in to your studio account",
    createAccount: "Create account", createSubtitle: "Join our creative community",
    email: "Email", password: "Password", passwordHint: "Min 6 characters",
    signIn: "Sign In", signUp: "Create Account",
    noAccount: "Don\u2019t have an account? Sign up", hasAccount: "Already have an account? Sign in",
    orPhone: "Or sign in with phone", phonePlaceholder: "+90 555 123 4567", sendCode: "Send Code",
    verifyTitle: "Enter code", verifySubtitle: "We sent a 6-digit code to", verify: "Verify", resend: "Resend code", back: "Back",
    privacy: "Privacy Policy", confirmEmail: "Check your email for a confirmation link!",
  },
  tr: {
    welcome: "Tekrar ho\u015f geldiniz", subtitle: "St\u00fcdyo hesab\u0131n\u0131za giri\u015f yap\u0131n",
    createAccount: "Hesap olu\u015ftur", createSubtitle: "Yarat\u0131c\u0131 toplulu\u011fumuza kat\u0131l\u0131n",
    email: "E-posta", password: "\u015eifre", passwordHint: "En az 6 karakter",
    signIn: "Giri\u015f Yap", signUp: "Hesap Olu\u015ftur",
    noAccount: "Hesab\u0131n\u0131z yok mu? Kay\u0131t olun", hasAccount: "Zaten hesab\u0131n\u0131z var m\u0131? Giri\u015f yap\u0131n",
    orPhone: "Veya telefonla giri\u015f yap\u0131n", phonePlaceholder: "+90 555 123 4567", sendCode: "Kod G\u00f6nder",
    verifyTitle: "Kodu girin", verifySubtitle: "\u015eu numaraya 6 haneli kod g\u00f6nderdik:", verify: "Do\u011frula", resend: "Tekrar g\u00f6nder", back: "Geri",
    privacy: "Gizlilik Politikas\u0131", confirmEmail: "Onay ba\u011flant\u0131s\u0131 i\u00e7in e-postan\u0131z\u0131 kontrol edin!",
  },
  ru: {
    welcome: "\u0421 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435\u043c", subtitle: "\u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0432 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u0441\u0442\u0443\u0434\u0438\u0438",
    createAccount: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442", createSubtitle: "\u041f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0439\u0442\u0435\u0441\u044c \u043a \u043d\u0430\u0448\u0435\u043c\u0443 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0443",
    email: "\u042d\u043b. \u043f\u043e\u0447\u0442\u0430", password: "\u041f\u0430\u0440\u043e\u043b\u044c", passwordHint: "\u041c\u0438\u043d\u0438\u043c\u0443\u043c 6 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432",
    signIn: "\u0412\u043e\u0439\u0442\u0438", signUp: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442",
    noAccount: "\u041d\u0435\u0442 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430? \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044c", hasAccount: "\u0423\u0436\u0435 \u0435\u0441\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442? \u0412\u043e\u0439\u0442\u0438",
    orPhone: "\u0418\u043b\u0438 \u0432\u043e\u0439\u0442\u0438 \u043f\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0443", phonePlaceholder: "+90 555 123 4567", sendCode: "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043a\u043e\u0434",
    verifyTitle: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0434", verifySubtitle: "\u041c\u044b \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u043b\u0438 6-\u0437\u043d\u0430\u0447\u043d\u044b\u0439 \u043a\u043e\u0434 \u043d\u0430", verify: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c", resend: "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043d\u043e\u0432\u0430", back: "\u041d\u0430\u0437\u0430\u0434",
    privacy: "\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438", confirmEmail: "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043f\u043e\u0447\u0442\u0443 \u0434\u043b\u044f \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f!",
  },
};

type AuthMode = "login" | "signup";
type Step = "form" | "phone" | "verify";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FEFCFD] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#DCA8B2] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<Step>("form");
  const [locale, setLocale] = useState<Locale>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/my";
  const t = labels[locale];

  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
            data: { preferred_language: locale },
          },
        });
        if (error) throw error;
        setSuccess(t.confirmEmail);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Role-based redirect: admin/trainer → /admin, else → /my
        // Use replace so "back" doesn't return to login
        const role = data.user?.user_metadata?.role;
        if (role === "admin" || role === "trainer") {
          router.replace("/admin");
        } else {
          router.replace(redirect);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      const role = data.user?.user_metadata?.role;
      if (role === "admin" || role === "trainer") {
        router.replace("/admin");
      } else {
        router.replace(redirect);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <LoginScene />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Language selector — top right */}
        <div className="absolute top-5 right-5 flex gap-1">
          {(["en", "tr", "ru"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                locale === l
                  ? "bg-white/90 text-[#2D2327] shadow-sm"
                  : "text-[#9B8A8F]/80 hover:text-[#2D2327] hover:bg-white/40"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          {/* Logo */}
          <Link href="/" className="block text-center mb-8">
            <Logo size={48} variant="full" className="mx-auto" />
          </Link>

          {/* Card */}
          <div className="backdrop-blur-xl bg-white/85 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white/70 p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {/* OTP Verify Step */}
              {step === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                >
                  <button
                    onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                    className="flex items-center gap-1 text-sm text-[#9B8A8F] hover:text-[#2D2327] mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
                  </button>
                  <h1 className="text-lg font-semibold text-[#2D2327] mb-1">{t.verifyTitle}</h1>
                  <p className="text-sm text-[#9B8A8F] mb-5">{t.verifySubtitle} <span className="font-medium text-[#2D2327]">{phone}</span></p>
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E0E3] bg-white text-center text-xl tracking-[0.4em] text-[#2D2327] placeholder-[#D0C5C8] focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/40 transition-all"
                      autoFocus
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full py-3 rounded-xl bg-[#2D2327] text-white text-sm font-medium hover:bg-[#3D3337] disabled:opacity-40 transition-all"
                    >
                      {loading ? "..." : t.verify}
                    </button>
                    <button type="button" onClick={handlePhoneOtp} className="w-full text-xs text-[#9B8A8F] hover:text-[#2D2327] transition-colors">
                      {t.resend}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Phone Step */}
              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                >
                  <button
                    onClick={() => { setStep("form"); setError(""); }}
                    className="flex items-center gap-1 text-sm text-[#9B8A8F] hover:text-[#2D2327] mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
                  </button>
                  <h1 className="text-lg font-semibold text-[#2D2327] mb-4">{t.orPhone}</h1>
                  <form onSubmit={handlePhoneOtp} className="space-y-4">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E0E3] bg-white text-[#2D2327] placeholder-[#D0C5C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/40 transition-all"
                      required
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading || !phone}
                      className="w-full py-3 rounded-xl bg-[#2D2327] text-white text-sm font-medium hover:bg-[#3D3337] disabled:opacity-40 transition-all"
                    >
                      {loading ? "..." : t.sendCode}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Main Form */}
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                >
                  <h1 className="text-lg font-semibold text-[#2D2327] mb-0.5">
                    {mode === "signup" ? t.createAccount : t.welcome}
                  </h1>
                  <p className="text-sm text-[#9B8A8F] mb-5">
                    {mode === "signup" ? t.createSubtitle : t.subtitle}
                  </p>

                  <form onSubmit={handleEmailAuth} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[#6B5E63] mb-1.5">{t.email}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#E8E0E3] bg-white text-[#2D2327] placeholder-[#D0C5C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/40 transition-all"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#6B5E63]">{t.password}</label>
                        {mode === "login" && (
                          <a href="/auth/forgot-password" className="text-[10px] text-[#DCA8B2] hover:text-[#B87A88] font-medium transition-colors">
                            Forgot password?
                          </a>
                        )}
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "signup" ? t.passwordHint : "••••••••"}
                        className="w-full px-4 py-3 rounded-xl border border-[#E8E0E3] bg-white text-[#2D2327] placeholder-[#D0C5C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/40 transition-all"
                        required
                        minLength={6}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-emerald-600">{success}</p>}

                    <button
                      type="submit"
                      disabled={loading || !email || !password}
                      className="w-full py-3 rounded-xl bg-[#2D2327] text-white text-sm font-medium hover:bg-[#3D3337] disabled:opacity-40 transition-all"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </span>
                      ) : mode === "signup" ? t.signUp : t.signIn}
                    </button>
                  </form>

                  {/* Toggle mode */}
                  <p className="text-center text-xs text-[#9B8A8F] mt-4">
                    <button
                      onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
                      className="hover:text-[#2D2327] transition-colors"
                    >
                      {mode === "login" ? t.noAccount : t.hasAccount}
                    </button>
                  </p>

                  {/* Phone alt */}
                  <div className="mt-4 pt-4 border-t border-[#F0E8EB]">
                    <button
                      onClick={() => { setStep("phone"); setError(""); }}
                      className="w-full text-xs text-[#9B8A8F] hover:text-[#2D2327] transition-colors"
                    >
                      {t.orPhone} →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-[#9B8A8F]/70 mt-5">
            <Link href="/privacy" className="hover:text-[#9B8A8F] transition-colors">
              {t.privacy}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
