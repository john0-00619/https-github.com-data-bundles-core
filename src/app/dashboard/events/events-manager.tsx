"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface EventsManagerProps {
  events: any[];
  branches: { id: string; name: string }[];
  organizationId: string;
}

export function EventsManager({ events, branches, organizationId }: EventsManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "service",
    start_time: "",
    end_time: "",
    location: "",
    branch_id: "",
  });
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("events").insert({
        organization_id: organizationId,
        title: form.title,
        description: form.description || null,
        type: form.type,
        status: "scheduled",
        start_time: form.start_time,
        end_time: form.end_time,
        timezone: "Africa/Accra",
        location: form.location || null,
        branch_id: form.branch_id || null,
        created_by: user.id,
      });

      if (error) throw error;
      setShowNew(false);
      setForm({ title: "", description: "", type: "service", start_time: "", end_time: "", location: "", branch_id: "" });
      window.location.reload();
    } catch {
      alert("Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const upcoming = events.filter((e) => new Date(e.start_time) >= new Date());
  const past = events.filter((e) => new Date(e.start_time) < new Date());

  const typeColors: Record<string, string> = {
    service: "indigo",
    prayer_meeting: "purple",
    fellowship: "green",
    conference: "blue",
    outreach: "orange",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage services, meetings and activities</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title="No events yet"
            description="Create your first event to get started."
            action={
              <Button onClick={() => setShowNew(true)}>
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((event) => (
                  <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={event.type === "service" ? "default" : "secondary"}>
                        {event.type.replace("_", " ")}
                      </Badge>
                      <Badge variant={event.status === "scheduled" ? "success" : "secondary"}>
                        {event.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(event.start_time)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.slice(0, 6).map((event) => (
                  <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-5 opacity-70">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{formatDateTime(event.start_time)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create Event" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Event Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              options={[
                { value: "service", label: "Service" },
                { value: "prayer_meeting", label: "Prayer Meeting" },
                { value: "fellowship", label: "Fellowship" },
                { value: "conference", label: "Conference" },
                { value: "outreach", label: "Outreach" },
                { value: "department_meeting", label: "Department Meeting" },
                { value: "other", label: "Other" },
              ]}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
            <Select
              label="Branch"
              options={[{ value: "", label: "All Branches" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date & Time" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            <Input label="End Date & Time" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
          </div>
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Event"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
