import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Image, MoreVertical, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IOption } from "@/interfaces/interfaces"; // ✅ ใช้ IOption แทนการสร้างใหม่

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Partial<IOption>[]>([
  { id: "default", text: "", banner: "", description: "", restricts: undefined }
]);

  const handleAddOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: "", banner: "", description: "", restricts: undefined }]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleBannerUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newOptions = [...options];
        newOptions[index].banner = reader.result as string;
        setOptions(newOptions);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDuplicateOption = (index: number) => {
    const optionToDuplicate = options[index];
    const duplicatedOption: Partial<IOption> = {
      ...optionToDuplicate,
      id: crypto.randomUUID(),
    };
    const newOptions = [...options];
    newOptions.splice(index + 1, 0, duplicatedOption);
    setOptions(newOptions);
  };

  const handleRestrictOption = (index: number) => {
    const newOptions = [...options];
    newOptions[index].restricts = newOptions[index].restricts ? undefined : "";
    setOptions(newOptions);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Create Poll</h1>
      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Enter poll question" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <Textarea placeholder="Enter poll description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {options.map((option, index) => (
          <div key={option.id} className="flex gap-4">
            {/* Option Card */}
            <Card className="relative flex-1 p-4 flex items-center gap-4">
              {/* Banner */}
              <div className="cursor-pointer" onClick={() => document.getElementById(`file-input-${index}`)?.click()}>
                {option.banner ? (
                  <img src={option.banner} alt="Option Banner" className="w-40 h-30 object-cover rounded-md aspect-square" />
                ) : (
                  <Button variant="outline" size="icon">
                    <Image size={16} />
                  </Button>
                )}
              </div>

              <input type="file" id={`file-input-${index}`} accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(index, e)} />

              {/* Option Text */}
              <Input placeholder="Option text" value={option.text} onChange={(e) => {
                const newOptions = [...options];
                newOptions[index].text = e.target.value;
                setOptions(newOptions);
              }} />

              {/* Dropdown Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDuplicateOption(index)}>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRestrictOption(index)}>
                    {option.restricts !== undefined ? "Remove Restriction" : "Restrict"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Remove Option */}
              {options.length > 1 && (
                <Button variant="destructive" size="icon" onClick={() => handleRemoveOption(options.find((o) => o.id === option.id)?.id as string)}>
                  <Trash size={16} />
                </Button>
              )}
            </Card>

            {/* Restriction Card (แสดงเฉพาะ Option ที่ถูกเลือก) */}
            {option.restricts !== undefined && (
              <Card className="w-64 p-4 flex flex-col gap-2 items-center">
                <CardTitle className="text-sm font-bold">Email Restriction</CardTitle>
                <Input
                  type="email"
                  placeholder="Enter email restriction"
                  value={option.restricts}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index].restricts = e.target.value;
                    setOptions(newOptions);
                  }}
                />
                <Button variant="destructive" size="icon" onClick={() => handleRestrictOption(index)}>
                  <XCircle size={18} />
                </Button>
              </Card>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleAddOption} className="mt-4 w-full flex items-center gap-2">
        <Plus size={16} /> Add Option
      </Button>

      <Button className="mt-6 w-full">Create Poll</Button>
    </div>
  );
}
