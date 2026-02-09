import NextAuth, { Account, Profile, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { getClientIp } from "@/lib/ip";
import { findUserByEmail, insertUser, syncOauthUserByEmail } from "@/models/user";
import { createUserCredits } from "@/models/credit";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
const GOOGLE_ONE_TAP_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true";
const CREDENTIALS_ENABLED = process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google One Tap Provider
    ...(GOOGLE_ONE_TAP_ENABLED
      ? [
          Credentials({
            id: "google-one-tap",
            name: "Google One Tap",
            credentials: {
              credential: { label: "Credential", type: "text" },
            },
            async authorize(credentials) {
              const token = credentials.credential as string;

              if (!token) {
                console.error("[Google One Tap] No credential provided");
                return null;
              }

              try {
                console.log("[Google One Tap] Verifying token...");
                // Verify the Google ID token
                const response = await fetch(
                  `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
                );

                if (!response.ok) {
                  console.error("[Google One Tap] Failed to verify token, status:", response.status);
                  return null;
                }

                const payload = await response.json();
                console.log("[Google One Tap] Token verified for user:", payload.email);

                if (!payload || !payload.email) {
                  console.error("[Google One Tap] Invalid token payload");
                  return null;
                }

                // Return user object (will be processed in jwt callback)
                return {
                  id: payload.sub,
                  email: payload.email,
                  name: payload.name,
                  image: payload.picture,
                  emailVerified: payload.email_verified,
                } as User;
              } catch (error) {
                console.error("[Google One Tap] Error verifying token:", error);
                return null;
              }
            },
          }),
        ]
      : []),

    // Standard Google OAuth Provider
    ...(GOOGLE_ENABLED && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),

    // Email/Password Credentials Provider
    ...(CREDENTIALS_ENABLED
      ? [
          Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              const email = credentials.email as string;
              const password = credentials.password as string;

              if (!email || !password) {
                console.error("[Credentials] Missing email or password");
                return null;
              }

              try {
                // 浣跨敤鏈嶅姟绔獙璇佸嚱鏁?
                const { verifyUserCredentials } = await import("@/lib/auth-credentials");
                const user = await verifyUserCredentials(email, password);

                if (!user) {
                  console.error("[Credentials] Invalid credentials for:", email);
                  return null;
                }

                console.log("[Credentials] User authenticated:", email);

                // Return user object
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  image: user.avatar_url,
                  emailVerified: true,
                } as User;
              } catch (error) {
                console.error("[Credentials] Authentication error:", error);
                return null;
              }
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({
      token,
      user,
      account,
      profile,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
    }) {
      if (account && user) {
        console.log("[NextAuth JWT] Processing login for:", user.email);

        // Get client IP
        let signin_ip = "127.0.0.1";
        try {
          signin_ip = await getClientIp();
          console.log("[NextAuth JWT] Client IP:", signin_ip);
        } catch (error) {
          console.error("[NextAuth JWT] Failed to get client IP:", error);
        }

        // Construct user object for database
        const dbUser = {
          uuid: getUuid(),
          email: user.email!,
          nickname: user.name || user.email?.split("@")[0] || "User",
          avatar_url: user.image || "",
          signin_type: account.type,
          signin_provider: account.provider,
          signin_openid: account.providerAccountId,
          signin_ip: signin_ip,
          created_at: getIsoTimestr(),
          locale: "en",
        };

        try {
          console.log("[NextAuth JWT] Creating user session...");
          console.log("[NextAuth JWT] User data to save:", {
            email: user.email,
            nickname: dbUser.nickname,
            provider: account.provider,
            signin_ip: signin_ip
          });

          // Check if user exists in database
          console.log("[NextAuth JWT] Checking if user exists in database...");
          let dbUserRecord = await findUserByEmail(user.email!);

          if (!dbUserRecord) {
            console.log("[NextAuth JWT] User not found, creating new user in database...");
            console.log("[NextAuth JWT] New user details:", {
              uuid: dbUser.uuid,
              email: dbUser.email,
              nickname: dbUser.nickname,
              avatar_url: dbUser.avatar_url,
              signin_provider: dbUser.signin_provider,
              signin_ip: dbUser.signin_ip,
              created_at: dbUser.created_at
            });

            try {
              // Create new user in database
              dbUserRecord = await insertUser(dbUser as any);
              console.log("[NextAuth JWT] 鉁?New user created successfully!");
              console.log("[NextAuth JWT] Saved user UUID:", dbUserRecord.uuid);
              console.log("[NextAuth JWT] Saved user email:", dbUserRecord.email);

              // Create initial credits for new user (e.g., 100 free credits)
              const initialCredits = parseInt(process.env.INITIAL_USER_CREDITS || "100");
              console.log("[NextAuth JWT] Creating initial credits:", initialCredits);

              const userUuid = dbUserRecord.uuid || dbUser.uuid;
              const creditRecord = await createUserCredits(userUuid, initialCredits);
              if (creditRecord) {
                console.log("[NextAuth JWT] 鉁?Initial credits created successfully!");
                console.log("[NextAuth JWT] Credits balance:", creditRecord.balance);
              } else {
                console.error("[NextAuth JWT] 鉂?Failed to create initial credits");
              }
            } catch (insertErr) {
              console.error("[NextAuth JWT] Insert user failed, fallback to sync flow:", insertErr);
            }
          } else {
            console.log("[NextAuth JWT] 鉁?Existing user found in database");
            console.log("[NextAuth JWT] User UUID:", dbUserRecord.uuid);
            console.log("[NextAuth JWT] User email:", dbUserRecord.email);
            console.log("[NextAuth JWT] User created at:", dbUserRecord.created_at);
          }

          if (account.provider !== "credentials") {
            await syncOauthUserByEmail({
              email: user.email!,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              name: user.name || undefined,
              avatarUrl: user.image || undefined,
              signinIp: signin_ip,
            });

            // Reload after sync so session token always picks the latest row shape.
            const latestUser = await findUserByEmail(user.email!);
            if (latestUser) {
              dbUserRecord = latestUser;
            }
          }

          if (!dbUserRecord) {
            dbUserRecord = dbUser as any;
          }

          const safeUser = (dbUserRecord || dbUser) as any;

          // Store user info in token (use database UUID for existing users)
          token.user = {
            uuid: safeUser.uuid || dbUser.uuid,
            email: safeUser.email,
            nickname: safeUser.nickname || dbUser.nickname,
            avatar_url: safeUser.avatar_url || dbUser.avatar_url,
            signin_provider: safeUser.signin_provider || dbUser.signin_provider,
            created_at: safeUser.created_at || dbUser.created_at,
            // 淇濈暀鍘熷鐨?name 鍜?image 鐢ㄤ簬澶村儚鏄剧ず
            name: user.name,
            image: user.image,
          };

          console.log("[NextAuth JWT] 鉁?Session token created with user info");
        } catch (error) {
          console.error("[NextAuth JWT] 鉂?Error saving user to database:", error);
          if (error instanceof Error) {
            console.error("[NextAuth JWT] Error message:", error.message);
            console.error("[NextAuth JWT] Error stack:", error.stack);
          }
        }
      }

      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      // Add user info from token to session
      if (token.user) {
        session.user = {
          ...token.user,
          // 纭繚 image 瀛楁瀛樺湪锛岀敤浜庢樉绀哄ご鍍?
          image: (token.user as any).avatar_url || (token.user as any).image,
          name: (token.user as any).nickname || (token.user as any).name || 'User',
        };
        console.log("[NextAuth Session] User loaded:", session.user.email);
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,
});




