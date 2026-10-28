// KingdomFlow Database Types
// These types represent the core data models

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============ USER & AUTH ============

export interface Profile {
  id: string; // UUID, matches auth.users.id
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_platform_admin: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============ ORGANIZATIONS & TENANCY ============

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
  timezone: string;
  country: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  plan: "free" | "starter" | "growth" | "enterprise";
  status: "active" | "suspended" | "trial";
  settings: Json | null;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  pastor_id: string | null; // member_id of branch pastor
  is_main: boolean;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

// ============ ORGANIZATION MEMBERSHIP (user <-> org) ============

export type OrganizationRole =
  | "owner"
  | "senior_pastor"
  | "pastor"
  | "admin"
  | "secretary"
  | "finance_officer"
  | "department_leader"
  | "follow_up_officer"
  | "viewer";

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  branch_ids: string[] | null; // branches this user has access to, null = all
  is_active: boolean;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  invited_by: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

// ============ CHURCH MEMBERS (non-user people) ============

export type MemberStatus =
  | "active"
  | "inactive"
  | "visitor"
  | "new_believer"
  | "archived";

export type MaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "engaged";

export interface Member {
  id: string;
  organization_id: string;
  branch_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  marital_status: MaritalStatus | null;
  address: string | null;
  city: string | null;
  avatar_url: string | null;
  status: MemberStatus;
  join_date: string | null;
  baptism_date: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  linked_user_id: string | null; // optional link to auth user
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============ DEPARTMENTS & GROUPS ============

export type GroupType =
  | "department"
  | "ministry"
  | "fellowship"
  | "choir"
  | "outreach"
  | "prayer_group"
  | "custom";

export interface Department {
  id: string;
  organization_id: string;
  branch_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  type: GroupType;
  leader_id: string | null; // member_id
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface DepartmentMember {
  id: string;
  department_id: string;
  member_id: string;
  role: "leader" | "member";
  joined_at: string;
}

// ============ EVENTS ============

export type EventType =
  | "service"
  | "prayer_meeting"
  | "fellowship"
  | "conference"
  | "outreach"
  | "department_meeting"
  | "counselling"
  | "other";

export type EventStatus =
  | "draft"
  | "scheduled"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Event {
  id: string;
  organization_id: string;
  branch_id: string | null;
  title: string;
  description: string | null;
  type: EventType;
  status: EventStatus;
  start_time: string;
  end_time: string;
  timezone: string;
  location: string | null;
  is_all_day: boolean;
  organizer_id: string | null; // member_id
  recurrence_rule: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============ ATTENDANCE ============

export interface AttendanceSession {
  id: string;
  organization_id: string;
  event_id: string | null;
  branch_id: string | null;
  title: string;
  session_date: string;
  qr_token: string | null;
  qr_expires_at: string | null;
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  member_id: string;
  checked_in_at: string;
  check_in_method: "manual" | "qr" | "self";
  checked_in_by: string | null;
  notes: string | null;
}

// ============ GIVING & FINANCE ============

export type GivingCategory =
  | "tithe"
  | "offering"
  | "special_offering"
  | "building_fund"
  | "missions"
  | "charity"
  | "project"
  | "other";

export type PaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank_transfer"
  | "card"
  | "check"
  | "online";

export interface GivingRecord {
  id: string;
  organization_id: string;
  branch_id: string | null;
  member_id: string | null; // anonymous giving allowed
  amount: number;
  currency: string;
  category: GivingCategory;
  payment_method: PaymentMethod;
  reference: string | null;
  receipt_number: string | null;
  given_at: string;
  service_or_event_id: string | null;
  notes: string | null;
  recorded_by: string;
  created_at: string;
}

export interface ExpenseRecord {
  id: string;
  organization_id: string;
  branch_id: string | null;
  category: string;
  description: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  reference: string | null;
  incurred_at: string;
  approved_by: string | null;
  recorded_by: string;
  created_at: string;
}

// ============ FOLLOW-UPS ============

export type FollowUpPriority = "low" | "medium" | "high" | "urgent";
export type FollowUpStatus = "open" | "in_progress" | "completed" | "cancelled";
export type FollowUpType =
  | "visitor"
  | "new_believer"
  | "absent_member"
  | "pastoral_care"
  | "prayer_request"
  | "counselling"
  | "other";

export interface FollowUp {
  id: string;
  organization_id: string;
  branch_id: string | null;
  type: FollowUpType;
  title: string;
  description: string | null;
  member_id: string | null;
  assigned_to: string | null; // user_id
  priority: FollowUpPriority;
  status: FollowUpStatus;
  due_date: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUpNote {
  id: string;
  follow_up_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

// ============ PRAYER REQUESTS ============

export interface PrayerRequest {
  id: string;
  organization_id: string;
  branch_id: string | null;
  member_id: string | null;
  title: string;
  content: string;
  is_public: boolean;
  is_answered: boolean;
  answered_at: string | null;
  answered_note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============ ANNOUNCEMENTS ============

export interface Announcement {
  id: string;
  organization_id: string;
  branch_id: string | null;
  title: string;
  content: string;
  audience: "all" | "leaders" | "specific_branch" | "specific_department";
  audience_filter: Json | null;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

// ============ AUDIT LOG ============

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Json | null;
  ip_address: string | null;
  created_at: string;
}

// ============ FORMS ============

export interface Form {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  schema: Json;
  status: "draft" | "published" | "archived";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  organization_id: string;
  member_id: string | null;
  submitted_by: string | null;
  data: Json;
  status: "pending" | "reviewed" | "approved" | "rejected";
  submitted_at: string;
}

// ============ TASKS ============

export interface Task {
  id: string;
  organization_id: string;
  branch_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done" | "cancelled";
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

// ============ PERMISSIONS ============

export type Permission =
  | "members.view"
  | "members.create"
  | "members.edit"
  | "members.archive"
  | "members.import"
  | "members.export"
  | "attendance.view"
  | "attendance.record"
  | "attendance.edit"
  | "events.view"
  | "events.create"
  | "events.edit"
  | "events.delete"
  | "departments.view"
  | "departments.manage"
  | "giving.view"
  | "giving.record"
  | "giving.edit"
  | "giving.export"
  | "expenses.view"
  | "expenses.record"
  | "expenses.approve"
  | "followups.view"
  | "followups.manage"
  | "announcements.view"
  | "announcements.create"
  | "reports.view"
  | "reports.export"
  | "settings.view"
  | "settings.manage"
  | "users.invite"
  | "users.manage"
  | "audit.view";

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  owner: [
    "members.view", "members.create", "members.edit", "members.archive", "members.import", "members.export",
    "attendance.view", "attendance.record", "attendance.edit",
    "events.view", "events.create", "events.edit", "events.delete",
    "departments.view", "departments.manage",
    "giving.view", "giving.record", "giving.edit", "giving.export",
    "expenses.view", "expenses.record", "expenses.approve",
    "followups.view", "followups.manage",
    "announcements.view", "announcements.create",
    "reports.view", "reports.export",
    "settings.view", "settings.manage",
    "users.invite", "users.manage",
    "audit.view",
  ],
  senior_pastor: [
    "members.view", "members.create", "members.edit", "members.export",
    "attendance.view", "attendance.record", "attendance.edit",
    "events.view", "events.create", "events.edit",
    "departments.view", "departments.manage",
    "giving.view", "giving.export",
    "expenses.view",
    "followups.view", "followups.manage",
    "announcements.view", "announcements.create",
    "reports.view", "reports.export",
    "settings.view",
    "users.invite",
  ],
  pastor: [
    "members.view", "members.create", "members.edit",
    "attendance.view", "attendance.record",
    "events.view", "events.create", "events.edit",
    "departments.view",
    "giving.view",
    "followups.view", "followups.manage",
    "announcements.view", "announcements.create",
    "reports.view",
  ],
  admin: [
    "members.view", "members.create", "members.edit", "members.archive", "members.import", "members.export",
    "attendance.view", "attendance.record", "attendance.edit",
    "events.view", "events.create", "events.edit", "events.delete",
    "departments.view", "departments.manage",
    "giving.view", "giving.record", "giving.export",
    "expenses.view", "expenses.record",
    "followups.view", "followups.manage",
    "announcements.view", "announcements.create",
    "reports.view", "reports.export",
    "settings.view",
    "users.invite",
  ],
  secretary: [
    "members.view", "members.create", "members.edit", "members.import", "members.export",
    "attendance.view", "attendance.record", "attendance.edit",
    "events.view", "events.create", "events.edit",
    "departments.view",
    "followups.view", "followups.manage",
    "announcements.view", "announcements.create",
    "reports.view", "reports.export",
  ],
  finance_officer: [
    "members.view",
    "attendance.view",
    "events.view",
    "giving.view", "giving.record", "giving.edit", "giving.export",
    "expenses.view", "expenses.record",
    "reports.view", "reports.export",
  ],
  department_leader: [
    "members.view",
    "attendance.view", "attendance.record",
    "events.view", "events.create",
    "departments.view",
    "followups.view",
    "announcements.view",
    "reports.view",
  ],
  follow_up_officer: [
    "members.view",
    "attendance.view",
    "events.view",
    "followups.view", "followups.manage",
  ],
  viewer: [
    "members.view",
    "attendance.view",
    "events.view",
    "departments.view",
    "announcements.view",
  ],
};

export function hasPermission(role: OrganizationRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
