"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

interface MemberImportProps {
  organizationId: string;
  branches: { id: string; name: string }[];
  onComplete: (results: { imported: number; errors: string[] }) => void;
  onClose: () => void;
}

interface ParsedRow {
  line: number;
  data: Record<string, string>;
  errors: string[];
}

const EXPECTED_COLUMNS = [
  { key: "first_name", label: "First Name", required: true },
  { key: "last_name", label: "Last Name", required: true },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "gender", label: "Gender", required: false },
  { key: "branch", label: "Branch Name", required: false },
  { key: "status", label: "Status", required: false },
];

export function MemberImport({ organizationId, branches, onComplete, onClose }: MemberImportProps) {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<{ imported: number; errors: string[] }>({ imported: 0, errors: [] });
  const [defaultBranch, setDefaultBranch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
    const parsedRows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const data: Record<string, string> = {};
      const errors: string[] = [];

      headers.forEach((h, idx) => {
        data[h] = values[idx] || "";
      });

      // Validate required fields
      if (!data.first_name) errors.push("Missing first name");
      if (!data.last_name) errors.push("Missing last name");
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Invalid email format");
      }

      parsedRows.push({ line: i + 1, data, errors });
    }

    return parsedRows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setStep("importing");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let imported = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (row.errors.length > 0) {
        errors.push(`Line ${row.line}: ${row.errors.join(", ")}`);
        continue;
      }

      const branchMatch = row.data.branch
        ? branches.find((b) => b.name.toLowerCase() === row.data.branch.toLowerCase())
        : null;

      const { error } = await supabase.from("members").insert({
        organization_id: organizationId,
        first_name: row.data.first_name,
        last_name: row.data.last_name,
        email: row.data.email || null,
        phone: row.data.phone || null,
        gender: row.data.gender || null,
        branch_id: branchMatch?.id || defaultBranch || null,
        status: row.data.status || "active",
        join_date: new Date().toISOString(),
        created_by: user.id,
      });

      if (error) {
        errors.push(`Line ${row.line}: ${error.message}`);
      } else {
        imported++;
      }
    }

    setResults({ imported, errors });
    setStep("done");
  };

  const validRows = rows.filter((r) => r.errors.length === 0).length;
  const invalidRows = rows.filter((r) => r.errors.length > 0).length;

  return (
    <div className="space-y-4">
      {step === "upload" && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">Upload CSV File</p>
            <p className="text-sm text-gray-500 mb-4">
              Expected columns: first_name, last_name, email, phone, gender, branch, status
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          </div>

          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-sm font-medium text-indigo-900 mb-2">CSV Template</p>
            <code className="text-xs text-indigo-700 block bg-white rounded p-2 overflow-x-auto">
              first_name,last_name,email,phone,gender,branch,status{"\n"}
              John,Doe,john@example.com,+233201234567,male,Main Campus,active{"\n"}
              Jane,Smith,jane@example.com,+233207654321,female,Main Campus,active
            </code>
          </div>

          <Select
            label="Default Branch (for rows without branch)"
            options={[{ value: "", label: "No branch" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
          />
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-700 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {validRows} valid
            </span>
            {invalidRows > 0 && (
              <span className="text-red-700 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {invalidRows} errors
              </span>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 20).map((row) => (
                  <tr key={row.line} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                    <td className="px-3 py-2 text-gray-500">{row.line}</td>
                    <td className="px-3 py-2">{row.data.first_name} {row.data.last_name}</td>
                    <td className="px-3 py-2 text-gray-600">{row.data.email || "—"}</td>
                    <td className="px-3 py-2">
                      {row.errors.length > 0 ? (
                        <span className="text-red-600 text-xs">{row.errors[0]}</span>
                      ) : (
                        <span className="text-green-600 text-xs">✓ Valid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="text-xs text-gray-500 text-center py-2">
                Showing first 20 of {rows.length} rows
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={validRows === 0}>
              Import {validRows} Members
            </Button>
          </div>
        </div>
      )}

      {step === "importing" && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Importing members...</p>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900">Import Complete</p>
            <p className="text-gray-600">
              {results.imported} member{results.imported !== 1 ? "s" : ""} imported successfully
            </p>
          </div>

          {results.errors.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 max-h-32 overflow-y-auto">
              <p className="text-sm font-medium text-red-700 mb-1">
                {results.errors.length} error{results.errors.length !== 1 ? "s" : ""}:
              </p>
              {results.errors.slice(0, 10).map((err, i) => (
                <p key={i} className="text-xs text-red-600">{err}</p>
              ))}
              {results.errors.length > 10 && (
                <p className="text-xs text-red-600">...and {results.errors.length - 10} more</p>
              )}
            </div>
          )}

          <Button onClick={() => onComplete(results)} className="w-full">
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
