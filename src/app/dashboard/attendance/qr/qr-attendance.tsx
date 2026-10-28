"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, Users, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface QRAttendancePageProps {
  organizationId: string;
}

export function QRAttendancePage({ organizationId }: QRAttendancePageProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("attendance_sessions")
      .select("*, records:attendance_records(count)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(10);
    setSessions(data || []);
    setLoading(false);
  };

  const generateQR = async (session: any) => {
    setActiveSession(session);
    try {
      const QRCode = await import("qrcode");
      const checkInUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkin?session=${session.id}&token=${session.qr_token}`;
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#1e1b4b", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  const handleCreateSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const qrToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert({
        organization_id: organizationId,
        title: `Service - ${formatDate(today)}`,
        session_date: today,
        qr_token: qrToken,
        qr_expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setSessions([data, ...sessions]);
      generateQR(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/attendance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Code Check-In</h1>
          <p className="text-gray-600">Generate QR codes for members to scan and check in</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Display */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-600" />
              Check-In QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSession ? (
              <div className="text-center space-y-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Check-in QR Code" className="mx-auto rounded-lg" />
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{activeSession.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(activeSession.session_date)}</p>
                  {activeSession.qr_expires_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Expires: {new Date(activeSession.qr_expires_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setActiveSession(null);
                    setQrDataUrl("");
                  }}
                >
                  Close QR
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                  <QrCode className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-gray-600">Select a session to generate a QR code</p>
                <Button onClick={handleCreateSession}>
                  <Calendar className="h-4 w-4" />
                  Create New Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sessions yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{session.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.session_date)} • {session.records?.[0]?.count || 0} checked in
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateQR(session)}
                    >
                      <QrCode className="h-4 w-4" />
                      Show QR
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How QR Check-In Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Create Session", desc: "Start a new attendance session for your service" },
              { step: "2", title: "Display QR", desc: "Show the QR code on a screen or projector" },
              { step: "3", title: "Members Scan", desc: "Members scan with their phones to check in" },
              { step: "4", title: "Track Results", desc: "See real-time attendance counts and records" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-2">
                  {item.step}
                </div>
                <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
