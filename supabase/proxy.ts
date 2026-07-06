import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  let isAdmin = false;

  if (user) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.sub)
      .maybeSingle();

    if (data) isAdmin = data.role == "admin";
  }

  const { data: maintenance } = await supabase
    .from("site_settings")
    .select("id, value")
    .eq("id", "site_maintenance")
    .maybeSingle();

  if (maintenance && (maintenance.value == 'true') && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  if (maintenance && !(maintenance.value == 'true') && ["/maintenance"].includes(request.nextUrl.pathname) && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const isLogin = ["/auth"].includes(request.nextUrl.pathname);
  const isLogout = ["/history", "/admin", "/api/midtrans/snap"].includes(
    request.nextUrl.pathname,
  );

  if ((isLogout || request.nextUrl.pathname.startsWith("/daftar")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (["/admin"].includes(request.nextUrl.pathname) && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
