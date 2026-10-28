"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Church } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface MemberDetailProps {
  member: any;
}

export function MemberDetail({ member }: MemberDetailProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {member.first_name} {member.last_name}
          </h1>
          <p className="text-gray-600">Member Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={member.avatar_url}
                fallback={`${member.first_name} ${member.last_name}`}
                size="xl"
              />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {member.first_name} {member.last_name}
              </h2>
              <Badge variant={member.status === "active" ? "success" : "secondary"} className="mt-2">
                {member.status?.replace("_", " ")}
              </Badge>

              <div className="mt-6 w-full space-y-3 text-left">
                {member.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.phone}</span>
                  </div>
                )}
                {member.branch?.name && (
                  <div className="flex items-center gap-3 text-sm">
                    <Church className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.branch.name}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.address}{member.city ? `, ${member.city}` : ""}</span>
                  </div>
                )}
                {member.join_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">Joined {formatDate(member.join_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{member.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900">{member.date_of_birth ? formatDate(member.date_of_birth) : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marital Status</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{member.marital_status?.replace("_", " ") || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Baptism Date</p>
                  <p className="text-sm font-medium text-gray-900">{member.baptism_date ? formatDate(member.baptism_date) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {member.emergency_contact_name && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-900">{member.emergency_contact_name}</p>
                {member.emergency_contact_phone && (
                  <p className="text-sm text-gray-600">{member.emergency_contact_phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {member.departments && member.departments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Departments & Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {member.departments.map((d: any) => (
                    <Badge key={d.department?.id} variant="default">
                      {d.department?.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {member.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
