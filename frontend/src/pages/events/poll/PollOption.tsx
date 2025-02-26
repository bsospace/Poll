import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Trash, Image } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Option } from ".";

interface PollOptionProps {
  option: { id: string; text: string; description: string; banner: string; restricts?: string };
  index: number;
  onChange: (index: number, field: keyof Option, value: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (index: number) => void;
  onBannerUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PollOption({
  option, index, onChange, onRemove, onDuplicate, onBannerUpload
}: PollOptionProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <label htmlFor={`file-input-${index}`} className="block cursor-pointer">
          {option.banner ? (
            <img src={option.banner} alt="Option" className="object-cover w-24 h-24 rounded-md" />
          ) : (
            <div className="flex items-center justify-center w-24 h-24 text-gray-400 border border-dashed rounded-md hover:bg-gray-50">
              <Image size={20} />
            </div>
          )}
        </label>
        <input type="file" id={`file-input-${index}`} accept="image/*" className="hidden" onChange={(e) => onBannerUpload(index, e)} />

        <div className="flex-1">
          <Input placeholder="Option text" value={option.text} onChange={(e) => onChange(index, "text", e.target.value)} className="mb-2" />
          <Textarea placeholder="Description (optional)" value={option.description} onChange={(e) => onChange(index, "description", e.target.value)} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate(index)}>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onRemove(option.id)}>
          <Trash size={16} />
        </Button>
      </div>
    </Card>
  );
}
