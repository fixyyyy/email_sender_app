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
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useListStore } from "@/lib/store/list-store";

const formSchema = z.object({
  listName: z.string().min(1, "List name is required"),
  emails: z.string().min(1, "Email list is required"),
});

export function ListManager() {
  const { lists, addList, updateList, removeList } = useListStore();
  const [editingList, setEditingList] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listName: "",
      emails: "",
    },
  });

  const editForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listName: "",
      emails: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const emailList = data.emails
      .split("\n")
      .map(email => email.trim())
      .filter(email => email.length > 0);
      
    addList(data.listName, emailList);
    form.reset();
    toast.success("Email list added successfully!");
  };

  const onEdit = (data: z.infer<typeof formSchema>) => {
    if (!editingList) return;
    
    const emailList = data.emails
      .split("\n")
      .map(email => email.trim())
      .filter(email => email.length > 0);
      
    updateList(editingList, data.listName, emailList);
    setEditingList(null);
    toast.success("List updated successfully!");
  };

  const startEdit = (list: { id: string; name: string; emails: string[] }) => {
    setEditingList(list.id);
    editForm.reset({
      listName: list.name,
      emails: list.emails.join("\n"),
    });
  };

  const deleteList = (id: string) => {
    removeList(id);
    toast.success("List deleted successfully!");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add Email List</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listName">List Name</Label>
            <Input
              id="listName"
              placeholder="My Email List"
              {...form.register("listName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses (one per line)</Label>
            <Textarea
              id="emails"
              placeholder="email1@example.com&#10;email2@example.com"
              className="h-32 font-mono"
              {...form.register("emails")}
            />
          </div>
          <Button type="submit" className="w-full">Add List</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Lists</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>List Name</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lists.map((list) => (
              <TableRow key={list.id}>
                <TableCell>{list.name}</TableCell>
                <TableCell>{list.emails.length} contacts</TableCell>
                <TableCell>{list.created}</TableCell>
                <TableCell className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEdit(list)}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit List</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-listName">List Name</Label>
                          <Input
                            id="edit-listName"
                            {...editForm.register("listName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-emails">Email Addresses</Label>
                          <Textarea
                            id="edit-emails"
                            className="h-32 font-mono"
                            {...editForm.register("emails")}
                          />
                        </div>
                        <Button type="submit" className="w-full">Save Changes</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteList(list.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {lists.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No email lists yet. Add one above to get started.
          </p>
        )}
      </Card>
    </div>
  );
}