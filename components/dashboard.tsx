"use client";

import { Mail, Server, Users, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailSender } from "@/components/email/sender";
import { SmtpManager } from "@/components/email/smtp-manager";
import { ListManager } from "@/components/email/list-manager";
import { Analytics } from "@/components/email/analytics";

export function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Email Sending System</h1>
      </div>
      
      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send Emails
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            SMTP Servers
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lists
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="send" className="space-y-4">
          <EmailSender />
        </TabsContent>
        
        <TabsContent value="smtp" className="space-y-4">
          <SmtpManager />
        </TabsContent>
        
        <TabsContent value="lists" className="space-y-4">
          <ListManager />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}