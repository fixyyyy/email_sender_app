"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useEmailStore } from "@/lib/store/email-store";
import { useListStore } from "@/lib/store/list-store";
import { useSmtpStore } from "@/lib/store/smtp-store";
import { useAnalyticsStore } from "@/lib/store/analytics-store";
import { EmailService } from "@/lib/email/sender";
import { createEmailTemplate } from "@/lib/email/template";

const formSchema = z.object({
  senderNames: z.string().min(1, "At least one sender name is required"),
  fromEmail: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  selectedList: z.string().min(1, "Please select a recipient list"),
});

export function EmailSender() {
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);
  const lists = useListStore((state) => state.lists);
  const emailStore = useEmailStore();
  const { getActiveServer } = useSmtpStore();
  const addStats = useAnalyticsStore((state) => state.addStats);
  const activeServer = getActiveServer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderNames: emailStore.senderNames,
      fromEmail: emailStore.fromEmail,
      subject: emailStore.subject,
      content: emailStore.content,
      selectedList: emailStore.selectedList,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const server = getActiveServer();
    if (!server) {
      toast.error("Please configure an email server first");
      return;
    }

    const selectedList = lists.find(list => list.id === data.selectedList);
    if (!selectedList) {
      toast.error("Selected list not found");
      return;
    }

    setSending(true);
    setProgress(0);

    try {
      // Save form data
      emailStore.setSenderNames(data.senderNames);
      emailStore.setFromEmail(data.fromEmail);
      emailStore.setSubject(data.subject);
      emailStore.setContent(data.content);
      emailStore.setSelectedList(data.selectedList);

      const emailService = new EmailService(server);
      const senderNames = data.senderNames.split(',').map(name => name.trim());

      const results = await emailService.sendBulkEmails(
        {
          from: data.fromEmail,
          senderNames,
          to: selectedList.emails,
          subject: data.subject,
          content: createEmailTemplate(data.content),
        },
        (progress) => setProgress(progress)
      );

      // Add stats to analytics
      addStats({
        sent: results.sent,
        delivered: results.delivered,
        failed: results.failed,
      });

      toast.success(
        `Emails sent successfully! Delivered: ${results.delivered}, Failed: ${results.failed}`
      );
    } catch (error) {
      toast.error("Failed to send emails: " + (error as Error).message);
    } finally {
      setSending(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="senderNames">Sender Names (comma-separated)</Label>
          <Input
            id="senderNames"
            placeholder="John Doe, Jane Smith, Alex Johnson"
            {...form.register("senderNames")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromEmail">From Email</Label>
          <Input
            id="fromEmail"
            type="email"
            placeholder="sender@yourdomain.com"
            {...form.register("fromEmail")}
          />
          {activeServer?.type === 'sendgrid' && (
            <p className="text-sm text-muted-foreground">
              Must be a verified sender in your SendGrid account
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            placeholder="Your email subject"
            {...form.register("subject")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Email Content (HTML supported)</Label>
          <Textarea
            id="content"
            placeholder="Enter your email content here..."
            className="h-32 font-mono"
            {...form.register("content")}
          />
        </div>

        <div className="space-y-2">
          <Label>Select Recipient List</Label>
          <Select 
            onValueChange={(value) => form.setValue("selectedList", value)}
            value={form.watch("selectedList")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.emails.length} recipients)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sending && (
          <div className="space-y-2">
            <Label>Sending Progress</Label>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              {Math.round(progress)}% Complete
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={sending || lists.length === 0} 
          className="w-full"
        >
          {sending ? "Sending..." : "Send Emails"}
        </Button>

        {lists.length === 0 && (
          <p className="text-sm text-red-500 text-center">
            Please create at least one email list first
          </p>
        )}
      </form>
    </Card>
  );
}