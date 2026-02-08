"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { authEventBus } from "@/lib/auth-event";

export default function SignModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("sign_modal");
  const locale = useLocale();
  const router = useRouter();

  // 监听登录事件
  useEffect(() => {
    const unsubscribe = authEventBus.subscribe((event) => {
      if (event.type === 'login-expired' || event.type === 'unauthorized') {
        setOpen(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 监听全局登录触发事件
  useEffect(() => {
    const handleOpenModal = () => setOpen(true);
    window.addEventListener("open-sign-modal", handleOpenModal);
    return () => window.removeEventListener("open-sign-modal", handleOpenModal);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: `/${locale}` });
    } catch (error) {
      toast.error(t("google_login_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("phone_password_required"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("login_failed"));
      } else {
        toast.success(t("login_success"));
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(t("network_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setOpen(false);
    router.push(`/${locale}/auth/forgot-password`);
  };

  const handleSignUp = () => {
    setOpen(false);
    router.push(`/${locale}/auth/signup`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white" showClose={false}>
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {t("sign_in_title")}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-center">
            {t("sign_in_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEmailSignIn} className="space-y-4 mt-4">
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
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">
                {t("password_title")}
              </Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t("forgot_password")}
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500"
              disabled={isLoading}
            />
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? t("signing_in") : t("sign_in")}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-400">{t("or")}</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          {t("google_sign_in")}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-slate-400 mt-4">
          {t("no_account")}{" "}
          <button
            type="button"
            onClick={handleSignUp}
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            {t("sign_up_title")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
