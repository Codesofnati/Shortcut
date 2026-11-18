import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin-login")) {
    if (user) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    // --- 5 MINUTE TIMEOUT LOGIC ---
    const lastActive = request.cookies.get("admin_last_active")?.value;
    const now = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (lastActive) {
      const timePassed = now - parseInt(lastActive, 10);
      if (timePassed > TIMEOUT_MS) {
        // Session expired
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/admin-login?expired=true", request.url));
      }
    }

    // Refresh the activity cookie on every navigation/API call
    response.cookies.set("admin_last_active", now.toString(), {
      maxAge: 5 * 60, // 5 minutes in seconds
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
};