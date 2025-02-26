import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/UseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface PollOption {
  title: string;
  description: string;
}

export default function CreatePoll() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [dateTime, setDateTime] = useState<Date>();
  const [endTime, setEndTime] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { title: "", description: "" },
    { title: "", description: "" },
  ]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You must be an admin to create polls.
        </p>
      </div>
    );
  }

  const handleOptionChange = (
    index: number,
    field: keyof PollOption,
    value: string
  ) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { title: "", description: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("A poll must have at least 2 options");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (options.length < 2) {
      toast.error("A poll must have at least 2 options");
      return;
    }

    if (options.some((option) => !option.title)) {
      toast.error("All options must have a title");
      return;
    }

    toast.success("Poll created successfully");
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Poll</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <DateTimePicker
                  defaultDate={dateTime}
                  onChange={setDateTime}
                  minDate={new Date(2024, 0, 1)} // กำหนดวันที่ต่ำสุด
                  maxDate={new Date(2024, 11, 31)} // กำหนดวันที่สูงสุด
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <DateTimePicker
                  defaultDate={dateTime}
                  onChange={setDateTime}
                  minDate={new Date(2024, 0, 1)} // กำหนดวันที่ต่ำสุด
                  maxDate={new Date(2024, 11, 31)} // กำหนดวันที่สูงสุด
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poll Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex gap-4">
                <Input
                  placeholder="Option title"
                  value={option.title}
                  onChange={(e) =>
                    handleOptionChange(index, "title", e.target.value)
                  }
                  required
                />
                <Input
                  placeholder="Option description (optional)"
                  value={option.description}
                  onChange={(e) =>
                    handleOptionChange(index, "description", e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addOption}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Option
            </Button>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button type="button" asChild>
            <Link to={"/"}>Back</Link>
          </Button>
          <Button type="submit">Create Poll</Button>
        </div>
      </form>
    </div>
  );
}
