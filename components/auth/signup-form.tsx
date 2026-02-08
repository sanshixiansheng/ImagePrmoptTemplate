"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("sign_modal");
  const locale = useLocale();
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: `/${locale}` });
    } catch (error) {
      toast.error(t("google_login_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error(t("phone_password_required"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("password_mismatch"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("password_too_short"));
      return;
    }

    setIsLoading(true);
    try {
      // Call signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error(result.error || t("login_failed"));
      } else {
        toast.success(t("login_success"));
        // Auto sign in after signup
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error(t("login_failed"));
        } else {
          router.push(`/${locale}`);
        }
      }
    } catch (error) {
      toast.error(t("network_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">{t("sign_up_title")}</h1>
        <p className="text-slate-400">{t("sign_up_description")}</p>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleEmailSignUp} className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">
            {t("name_title") || "Name"}
          </Label>
          <Input
            id="name"
            type="text"
            placeholder={t("name_placeholder") || "Enter your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500"
            disabled={isLoading}
            required
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            {t("email_title")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500"
            disabled={isLoading}
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            {t("password_title")}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500"
            disabled={isLoading}
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-300">
            {t("confirm_password_title")}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("confirm_password_placeholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500"
            disabled={isLoading}
            required
          />
        </div>

        {/* Sign Up Button */}
        <Button
          type="submit"
          className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? t("signing_in") : t("sign_up_title")}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-400">{t("or")}</span>
        </div>
      </div>

      {/* Google Sign Up Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        {t("google_sign_in")}
      </Button>

      {/* Sign In Link */}
      <div className="text-center text-sm text-slate-400">
        {t("already_have_account") || "Already have an account?"}{" "}
        <Link
          href="/auth/signin"
          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          {t("sign_in_title")}
        </Link>
      </div>
    </div>
  );
}
