"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export const EditFileUploadModal = ({ user }: any) => {
  const { isOpen, data, onClose, type } = useModal();
  const [checked, setChecked] = useState(false);
  const isModalOpen = isOpen && type === "editFile";
  const router = useRouter();

  const formSchema = z.object({
    files: z.any(),
    chatbotName: z.string().min(1, {
      message: "Chatbot Name is required"
    }),
    chatbotInstructions: z.string().min(1, {
      message: "Chatbot Instructions is required"
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      chatbotName: "",
      chatbotInstructions: ""
    }
  });

  useEffect(() => {
    if (data) {
      form.setValue("chatbotName", data.name);
      form.setValue("chatbotInstructions", data.instructions);
    }
  }, [data, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (hide) return;
    try {
      const { files, chatbotName, chatbotInstructions } = values;

      if (files.length === 0) {
        toast.error("At least one file is required");
        return;
      }

      const formData = new FormData();
      for (let file of files) {
        formData.append("files", file);
      }

      if (!checked && data?.file_ids) {
        for (let file_id of data?.file_ids) {
          formData.append("file_ids", file_id);
        }
      }

      formData.append("chatbotName", chatbotName);
      formData.append("chatbotInstructions", chatbotInstructions || "");
      formData.append("assistantId", data?.id);

      const response = await axios.post(
        "/api/updateAssistantWithFiles",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      console.log(response);
      if (response.status === 200) {
        toast(() => (
          <div>
            <div className="flex items-center space-x-2">
              <Info width={20} height={20} className="text-indigo-500" />
              Your Bot is Updated
            </div>
            <br />
            <p>Give the Bot few minutes to be trained!</p>
          </div>
        ));
        handleClose();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const hide =
    form.getValues().files.length === 0 ||
    !form.getValues().files ||
    form.getValues().chatbotName === "" ||
    !form.getValues().chatbotName ||
    form.getValues().chatbotInstructions === "" ||
    !form.getValues().chatbotInstructions;

  return (
    <Dialog open={isModalOpen} onOpenChange={() => !isLoading && handleClose()}>
      <DialogContent className="bg-white text-black p-0 max-h-screen overflow-hidden flex flex-col">
        <DialogHeader className="pt-2 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Attach a file for training bot
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 max-h-full overflow-hidden flex flex-col"
          >
            <div className="space-y-2 px-6 overflow-y-scroll scrollbar-hide max-h-full flex flex-col">
              <div className="flex items-center justify-start w-full">
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        PDF Files
                      </FormLabel>
                      <span className="text-red-600 text-lg">*</span>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          multiple
                          disabled={isLoading}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="attach your files"
                          onChange={(e: any) => {
                            form.setValue("files", e.target.files);
                          }}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="chatbotName"
                render={({ field }) => {
                  delete field.disabled;
                  return (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Chatbot Name
                      </FormLabel>
                      <span className="text-red-600 text-lg">*</span>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Chatbot Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="chatbotInstructions"
                render={({ field }) => {
                  delete field.disabled;
                  return (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Chatbot Instructions
                      </FormLabel>
                      <span className="text-red-600 text-lg">*</span>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Chatbot Instructions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormItem className="flex flex-col">
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                  On - If want to replace with existing data
                </FormLabel>
                <Switch onCheckedChange={setChecked} checked={checked} />
              </FormItem>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-2">
              <Button
                className={cn(hide && "hidden")}
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? "Training Bot..." : "Train bot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
