import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanEnforcementStatus, canAddContact, canAddBranch, canAddUser, isFeatureEnabled } from "@/lib/plan-enforcement";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const status = await getPlanEnforcementStatus(membership.organization_id);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    let result;
    switch (action) {
      case "add_contact":
        result = await canAddContact(membership.organization_id);
        break;
      case "add_branch":
        result = await canAddBranch(membership.organization_id);
        break;
      case "add_user":
        result = await canAddUser(membership.organization_id);
        break;
      case "check_feature":
        const { feature } = body;
        result = await isFeatureEnabled(membership.organization_id, feature);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
