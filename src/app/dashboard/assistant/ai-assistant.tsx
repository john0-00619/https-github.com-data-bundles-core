"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AIAssistantProps {
  organization: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  "How do I import members?",
  "Create a follow-up task",
  "Generate attendance report",
  "Set up event registration",
];

export function AIAssistant({ organization }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your KingdomFlow AI assistant. I can help you with:\n\n• Managing members and attendance\n• Creating events and forms\n• Setting up communication campaigns\n• Generating reports and analytics\n• Answering questions about your church data\n\nHow can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in production, this would call an AI API)
    setTimeout(() => {
      const response = generateResponse(content, organization);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (query: string, org: any): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("import") && lowerQuery.includes("member")) {
      return "To import members:\n\n1. Go to Members page\n2. Click 'Import CSV'\n3. Download the template\n4. Fill in member data (name, phone, email, department)\n5. Upload the CSV file\n\nThe system will validate and create member records. Duplicates are detected by email/phone.";
    }

    if (lowerQuery.includes("follow-up") || lowerQuery.includes("followup")) {
      return "To create a follow-up:\n\n1. Go to Follow-Ups page\n2. Click '+ New Follow-Up'\n3. Select the person (member or visitor)\n4. Choose type (visit, call, prayer)\n5. Set due date and assign to someone\n6. Add notes\n\nFollow-ups help track pastoral care and visitor engagement.";
    }

    if (lowerQuery.includes("attendance") && lowerQuery.includes("report")) {
      return "To generate attendance reports:\n\n1. Go to Reports page\n2. Select 'Attendance Report'\n3. Choose date range\n4. Filter by service/event if needed\n5. Click 'Generate Report'\n\nYou can export as CSV or view charts showing trends over time.";
    }

    if (lowerQuery.includes("event") && lowerQuery.includes("registration")) {
      return "To set up event registration:\n\n1. Create the event (Events page)\n2. Go to Forms page\n3. Create a new form with 'Event Registration' template\n4. Add fields (name, contact, dietary needs, etc.)\n5. Publish the form\n6. Share the form link in event announcements\n\nSubmissions are tracked and can be exported.";
    }

    if (lowerQuery.includes("communication") || lowerQuery.includes("email") || lowerQuery.includes("sms")) {
      return "Communication Centre features:\n\n• **WhatsApp**: Send messages to individuals or groups\n• **SMS**: Bulk SMS via TextBee (requires API key)\n• **Email**: Gmail integration for newsletters\n\nGo to Communication page to start a campaign. You can target by department, status, or custom filters.";
    }

    if (lowerQuery.includes("plan") || lowerQuery.includes("subscription") || lowerQuery.includes("upgrade")) {
      return `Your current plan: **${org?.plan?.name || "Free"}**\n\nPlan limits:\n• ${org?.plan?.max_contacts?.toLocaleString() || 500} contacts\n• ${org?.plan?.max_branches || 1} branches\n• ${org?.plan?.max_users || 3} team members\n\nCurrent usage: ${org?.contact_count || 0} contacts\n\nTo upgrade, go to Plans page. Pro plan includes SMS/email campaigns and advanced reports.`;
    }

    if (lowerQuery.includes("role") || lowerQuery.includes("permission")) {
      return "KingdomFlow has 10 roles:\n\n• **Owner**: Full access, billing\n• **Senior Pastor**: Pastoral oversight\n• **Pastor**: Member care, preaching\n• **Admin**: System management\n• **Secretary**: Records, scheduling\n• **Finance Officer**: Giving, reports\n• **Department Leader**: Own department\n• **Follow-Up Officer**: Visitor care\n• **Viewer**: Read-only access\n\nRoles are managed in Settings > Team.";
    }

    if (lowerQuery.includes("help") || lowerQuery.includes("what can you do")) {
      return "I can help you with:\n\n✓ **Member Management**: Import, search, update records\n✓ **Attendance**: QR check-ins, reports\n✓ **Events**: Create, registration, attendance\n✓ **Communication**: WhatsApp, SMS, Email campaigns\n✓ **Forms**: Custom forms for registrations\n✓ **Reports**: Attendance, giving, member stats\n✓ **Follow-ups**: Track pastoral care tasks\n✓ **Departments**: Organize teams and leaders\n✓ **Giving**: Record donations, generate receipts\n\nJust ask me anything about these features!";
    }

    // Default response
    return "I understand you're asking about: \"" + query + "\"\n\nWhile I'm a demo assistant with predefined responses, the full AI assistant (available on Premium plan) can:\n\n• Analyze your church data\n• Generate custom reports\n• Suggest engagement strategies\n• Answer complex questions\n• Provide pastoral insights\n\nFor now, try asking about:\n- Importing members\n- Creating follow-ups\n- Setting up events\n- Communication campaigns\n- Generating reports";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-600">Your intelligent church management helper</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about KingdomFlow..."
              className="flex-1 h-10 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI Assistant provides guidance based on KingdomFlow features. For complex queries, contact support.
          </p>
        </div>
      </Card>
    </div>
  );
}
