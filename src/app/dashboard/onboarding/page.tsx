"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { Church, Loader2, ArrowRight, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { slugify } from "@/lib/utils";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgType, setOrgType] = useState("church");
  const [country, setCountry] = useState("GH");
  const [city, setCity] = useState("");
  const [branchName, setBranchName] = useState("Main Campus");

  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    setOrgSlug(slugify(name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: orgName,
          slug: orgSlug,
          country,
          city: city || null,
          currency: country === "GH" ? "GHS" : "USD",
          timezone: "Africa/Accra",
          plan: "free",
          status: "active",
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create owner membership
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
          is_active: true,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Create main branch
      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .insert({
          organization_id: org.id,
          name: branchName || "Main Campus",
          slug: slugify(branchName || "main-campus"),
          is_main: true,
          status: "active",
        })
        .select()
        .single();

      if (branchError) throw branchError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (profileError) throw profileError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to set up your organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Church className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">KingdomFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set up your church</h1>
          <p className="text-gray-600 mt-1">Let&apos;s get your organization ready</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${
                s <= step ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  s < step
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : s === step
                    ? "border-indigo-600 text-indigo-600"
                    : "border-gray-300"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              <span className="text-sm font-medium">
                {s === 1 ? "Organization" : "Branch"}
              </span>
              {s < 2 && <div className="w-8 h-0.5 bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Church / Ministry Name"
                  placeholder="e.g., Grace Community Church"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  required
                />

                <Input
                  label="Organization URL Slug"
                  placeholder="grace-community-church"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  required
                />

                <Select
                  label="Organization Type"
                  options={[
                    { value: "church", label: "Church" },
                    { value: "fellowship", label: "Campus Fellowship" },
                    { value: "ministry", label: "Ministry" },
                    { value: "network", label: "Church Network" },
                  ]}
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Country"
                    options={[
                      { value: "GH", label: "Ghana" },
                      { value: "NG", label: "Nigeria" },
                      { value: "KE", label: "Kenya" },
                      { value: "ZA", label: "South Africa" },
                      { value: "US", label: "United States" },
                      { value: "GB", label: "United Kingdom" },
                      { value: "OTHER", label: "Other" },
                    ]}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    label="City"
                    placeholder="Accra"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!orgName || !orgSlug}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Input
                  label="Main Branch Name"
                  placeholder="Main Campus"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  required
                />

                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                  <h3 className="text-sm font-medium text-indigo-900 mb-2">
                    What&apos;s included
                  </h3>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>✓ Member management</li>
                    <li>✓ Attendance tracking</li>
                    <li>✓ Event management</li>
                    <li>✓ Department & group management</li>
                    <li>✓ Giving & finance tracking</li>
                    <li>✓ Follow-up system</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4" />
                        Create Organization
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
