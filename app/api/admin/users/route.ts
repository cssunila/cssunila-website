/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdmin } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data: rolesData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roleError || !rolesData) return null;
    const roles = rolesData.map((r) => r.role);
    if (roles.includes("admin")) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

export const GET = async () => {
  const adminUser = await verifyAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const adminClient = createAdmin();

    const { data: profiles, error: profErr } = await adminClient
      .from("profiles")
      .select("id, full_name, whatsapp, institution, avatar_url, suspended, created_at");
    if (profErr) throw profErr;

    const { data: roles, error: rolesErr } = await adminClient
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw rolesErr;
    const { data: userComps, error: compsErr } = await adminClient
      .from("user_competitions")
      .select("user_id, competition_id");
    if (compsErr) throw compsErr;
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const authMap = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email]));

    const usersList = (profiles ?? []).map((p) => {
      const userRoles = (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role);
      const allowedComps = (userComps ?? [])
        .filter((c) => c.user_id === p.id)
        .map((c) => c.competition_id);

      return {
        id: p.id,
        full_name: p.full_name,
        email: authMap.get(p.id) || null,
        whatsapp: p.whatsapp,
        institution: p.institution,
        avatar_url: p.avatar_url,
        suspended: p.suspended ?? false,
        created_at: p.created_at,
        role: userRoles.includes("admin")
          ? "admin"
          : userRoles.includes("lomba")
          ? "lomba"
          : userRoles.includes("petugas")
          ? "petugas"
          : "user",
        allowed_competitions: allowedComps,
      };
    });

    return NextResponse.json(usersList);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminUser = await verifyAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, role, suspended, competitionIds } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = createAdmin();

    const { error: profErr } = await adminClient
      .from("profiles")
      .update({ suspended: !!suspended })
      .eq("id", userId);
    if (profErr) throw profErr;

    const { error: delRoleErr } = await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (delRoleErr) throw delRoleErr;

    const { error: insRoleErr } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (insRoleErr) throw insRoleErr;

    const { error: delCompsErr } = await adminClient
      .from("user_competitions")
      .delete()
      .eq("user_id", userId);
    if (delCompsErr) throw delCompsErr;

    if (role === "lomba" && Array.isArray(competitionIds) && competitionIds.length > 0) {
      const compRows = competitionIds.map((cid) => ({
        user_id: userId,
        competition_id: cid,
      }));
      const { error: insCompsErr } = await adminClient
        .from("user_competitions")
        .insert(compRows);
      if (insCompsErr) throw insCompsErr;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const adminUser = await verifyAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (userId === adminUser.id) {
      return NextResponse.json({ error: "Anda tidak bisa menghapus diri sendiri" }, { status: 400 });
    }

    const adminClient = createAdmin();

    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
