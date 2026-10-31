// KingdomFlow Auth — CRITICAL: No Zite redirects.
// All URLs are derived from current origin (Arena deployment). No hardcoded zite.so in auth flow.
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'pastor' | 'admin' | 'member';
  avatar: string;
  churchId: string;
  verified: boolean;
  createdAt: string;
};

export type AuthSession = {
  user: User;
  token: string;
  expiresAt: string;
};

const STORAGE_KEY = "kf_session_v2";
const USERS_KEY = "kf_users_v2";
const PENDING_VERIFY_KEY = "kf_pending_verify";

export function getAppUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Never return zite domain
export function getCanonicalRedirect(path: string = "/dashboard") {
  const base = getAppUrl();
  if (base.includes("zite.so")) {
    // Safety: if somehow base is zite, fallback to relative
    return path;
  }
  return path; // relative ensures we stay on same origin
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s: AuthSession = JSON.parse(raw);
    if (new Date(s.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}
export function setSession(user: User) {
  const session: AuthSession = {
    user,
    token: `kf_${Math.random().toString(36).slice(2)}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 7*24*3600*1000).toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}
export function clearSession() { localStorage.removeItem(STORAGE_KEY); }

export function register(data: { name: string; email: string; password: string }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user: User = {
    id: `u_${Date.now()}`,
    email: data.email.toLowerCase(),
    name: data.name,
    role: users.length === 0 ? 'super_admin' : 'admin',
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(data.email)}`,
    churchId: "church_grace_01",
    verified: false,
    createdAt: new Date().toISOString(),
  };
  // Store password securely (demo: plain in separate key for verification)
  const pwKey = `kf_pw_${user.id}`;
  localStorage.setItem(pwKey, data.password);
  // Also store by email for login lookup
  localStorage.setItem(`kf_pw_email_${user.email.toLowerCase()}`, data.password);

  users.push(user);
  saveUsers(users);

  // Create verification token that points to Arena app, NOT zite
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expires = Date.now() + 24*3600*1000;
  const pending = JSON.parse(localStorage.getItem(PENDING_VERIFY_KEY) || "{}");
  pending[token] = { email: user.email, expires, userId: user.id };
  localStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(pending));

  // Build verification URL using current origin
  const verifyUrl = `${getAppUrl()}/verify?token=${token}&email=${encodeURIComponent(user.email)}`;

  return { user, verifyUrl, token };
}

export function login(email: string, password: string) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("No account found with this email.");
  const stored = localStorage.getItem(`kf_pw_email_${email.toLowerCase()}`);
  // Demo: allow any password if not set, but check if exists
  if (stored && stored !== password) throw new Error("Incorrect password.");
  setSession(user);
  return user;
}

export function googleSignIn() {
  // Mock Google OAuth - in production would use OAuth redirect to this app's callback
  // Critical: callback is `${getAppUrl()}/api/auth/google/callback`, never zite.so
  const email = `google.user.${Math.floor(Math.random()*1000)}@gmail.com`;
  const users = getUsers();
  let user = users.find(u => u.email === email);
  if (!user) {
    user = {
      id: `u_${Date.now()}`,
      email,
      name: "Google User",
      role: 'admin',
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      churchId: "church_grace_01",
      verified: true,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
  }
  setSession(user);
  return user;
}

export function verifyEmail(token: string, email: string) {
  const pending = JSON.parse(localStorage.getItem(PENDING_VERIFY_KEY) || "{}");
  const record = pending[token];
  if (!record) throw new Error("Invalid verification link. Please request a new one.");
  if (record.expires < Date.now()) {
    delete pending[token];
    localStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(pending));
    throw new Error("EXPIRED");
  }
  if (record.email.toLowerCase() !== email.toLowerCase()) throw new Error("Email mismatch.");

  const users = getUsers();
  const idx = users.findIndex(u => u.id === record.userId);
  if (idx >= 0) {
    users[idx].verified = true;
    saveUsers(users);
    setSession(users[idx]);
    delete pending[token];
    localStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(pending));
    return users[idx];
  }
  throw new Error("User not found.");
}

export function resendVerification(email: string) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("No account found.");
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expires = Date.now() + 24*3600*1000;
  const pending = JSON.parse(localStorage.getItem(PENDING_VERIFY_KEY) || "{}");
  pending[token] = { email: user.email, expires, userId: user.id };
  localStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(pending));
  const verifyUrl = `${getAppUrl()}/verify?token=${token}&email=${encodeURIComponent(user.email)}`;
  return { verifyUrl, token };
}

export function logout() { clearSession(); }

// Seed demo data
export function ensureSeedData() {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  if (users.length === 0) {
    const demo: User = {
      id: "u_demo_admin",
      email: "admin@kingdomflow.church",
      name: "Pastor Michael Agyeman",
      role: "super_admin",
      avatar: "https://i.pravatar.cc/150?u=admin",
      churchId: "church_grace_01",
      verified: true,
      createdAt: new Date().toISOString(),
    };
    saveUsers([demo]);
    localStorage.setItem(`kf_pw_email_${demo.email}`, "admin123");
    localStorage.setItem(`kf_pw_${demo.id}`, "admin123");
  }
}
