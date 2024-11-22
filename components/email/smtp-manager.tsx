"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSmtpStore } from "@/lib/store/smtp-store";

const smtpFormSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  username: z.string().optional(),
  password: z.string().optional(),
  isRootServer: z.boolean().default(false),
});

const sendgridFormSchema = z.object({
  apiKey: z.string().min(1, "SendGrid API key is required"),
});

export function SmtpManager() {
  const { servers, addSmtpServer, addSendGridServer, removeServer } = useSmtpStore();

  const smtpForm = useForm({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      host: "",
      port: "",
      username: "",
      password: "",
      isRootServer: false,
    },
  });

  const sendgridForm = useForm({
    resolver: zodResolver(sendgridFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const onSubmitSmtp = (data: z.infer<typeof smtpFormSchema>) => {
    addSmtpServer(data);
    smtpForm.reset();
    toast.success("SMTP server added successfully!");
  };

  const onSubmitSendGrid = (data: z.infer<typeof sendgridFormSchema>) => {
    addSendGridServer(data.apiKey);
    sendgridForm.reset();
    toast.success("SendGrid API key added successfully!");
  };

  const deleteServer = (id: string) => {
    removeServer(id);
    toast.success("Server removed successfully!");
  };

  const handleRootServerToggle = (checked: boolean) => {
    smtpForm.setValue("isRootServer", checked);
    if (checked) {
      smtpForm.setValue("port", "25");
      smtpForm.setValue("username", "");
      smtpForm.setValue("password", "");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList>
          <TabsTrigger value="smtp">SMTP Server</TabsTrigger>
          <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add SMTP Server</h3>
            <form onSubmit={smtpForm.handleSubmit(onSubmitSmtp)} className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="root-server"
                  checked={smtpForm.watch("isRootServer")}
                  onCheckedChange={handleRootServerToggle}
                />
                <Label htmlFor="root-server">Root Server (Port 25)</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="smtp.example.com"
                    {...smtpForm.register("host")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    placeholder="587"
                    disabled={smtpForm.watch("isRootServer")}
                    value={smtpForm.watch("isRootServer") ? "25" : smtpForm.watch("port")}
                    {...smtpForm.register("port")}
                  />
                </div>
                {!smtpForm.watch("isRootServer") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="username@example.com"
                        {...smtpForm.register("username")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...smtpForm.register("password")}
                      />
                    </div>
                  </>
                )}
              </div>
              <Button type="submit" className="w-full">Add SMTP Server</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="sendgrid">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add SendGrid API Key</h3>
            <form onSubmit={sendgridForm.handleSubmit(onSubmitSendGrid)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">SendGrid API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="SG.xxxxxx..."
                  {...sendgridForm.register("apiKey")}
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from the SendGrid dashboard
                </p>
              </div>
              <Button type="submit" className="w-full">Add API Key</Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Servers</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell>{server.type === 'smtp' ? 'SMTP' : 'SendGrid'}</TableCell>
                <TableCell>
                  {server.type === 'smtp' ? (
                    <span>{server.host}:{server.port}</span>
                  ) : (
                    <span>•••• {server.apiKey?.slice(-4)}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    {server.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteServer(server.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {servers.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No email servers configured. Add one above to get started.
          </p>
        )}
      </Card>
    </div>
  );
}