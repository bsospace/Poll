import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/Utils";
import { IEvent, IGuest, IWhitelistUser } from "@/interfaces/interfaces";
import PollBannerUploader from "./PollBannerUploader";
import PollOptionsList from "./PollOptionsList";
import { CalendarClock, Loader2, Save, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { preUploadImage } from "@/lib/R2";

export interface Option {
  id: string;
  text: string;
  description: string;
  banner: string;
}

export default function CreatePoll() {
  const { id } = useParams();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [bannerPoll, setBannerPoll] = useState<string>("");
  const [event, setEvent] = useState<IEvent | null>(null);
  const [whitelist, setWhitelist] = useState<IWhitelistUser[]>([]);
  const [guests, setGuests] = useState<IGuest[]>([]);
  const [startVoteAt, setStartVoteAt] = useState<string>("");
  const [endVoteAt, setEndVoteAt] = useState<string>("");

  const [bannerPollImage, setBannerPollImage] = useState<{
    key: string;
    url: string;
  } | null>(null);

  const [options, setOptions] = useState<{ id: string; text: string; description: string; banner: string, url: string }[]>([
    { id: uuidv4(), text: "", banner: "", description: "", url: "" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<{ question?: string; options?: string; startVoteAt?: string; endVoteAt?: string }>({});

  const navigate = useNavigate();

  // Prevent accidental page refresh or navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (question || description || bannerPoll || options.some(opt => opt.text || opt.description || opt.banner)) {
        event.preventDefault();
        event.returnValue = ""; // Browser-required return value
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [question, description, bannerPoll, options]);

  // Fetch event data (would need to be implemented)
  useEffect(() => {
    if (id) {

      const fetchEvent = async () => {
        try {
          const response = await axiosInstance.get(`/events/${id}`);
          setEvent(response.data.data);
          setWhitelist(response.data.data.whitelist);
          setGuests(response.data.data.guests);
        } catch {
          toast.error("Failed to fetch event data");
        }
      }

      fetchEvent();
    }
  }, [id]);

  /** 🎨 Handle Poll Banner Upload */
  const handlePollBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerPoll(URL.createObjectURL(file));
      const preUpload = await preUploadImage(file);

      if (preUpload) {
        setBannerPollImage((prev) => {
          return {
            ...prev,
            key: preUpload.key,
            url: preUpload.url
          }
        });

      }
    }
  }

  /** 🎨 Handle Option Banner Upload */
  const handleOptionBannerUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadedKey = await preUploadImage(file);
      if (uploadedKey) {
        setOptions((prevOptions) => {
          const newOptions = [...prevOptions];
          newOptions[index].banner = uploadedKey.key;
          newOptions[index].url = uploadedKey.url;
          return newOptions;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: { question?: string; options?: string } = {};

    if (!question.trim()) newErrors.question = "Poll question is required.";
    if (options.length === 0) {
      newErrors.options = "At least one option is required.";
    } else if (options.some(option => !option.text?.trim())) {
      newErrors.options = "Each option must have text.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOption = () => {
    setOptions([...options, { id: uuidv4(), text: "", banner: "", url: "", description: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter(option => option.id !== id));
    } else {
      toast.error("At least one option is required.");
    }
  };

  const handleDuplicateOption = (index: number) => {
    const optionToDuplicate = options[index];
    const newOption = {
      ...optionToDuplicate,
      id: uuidv4(),
      text: `${optionToDuplicate.text} (copy)`
    };
    setOptions([...options.slice(0, index + 1), newOption, ...options.slice(index + 1)]);
  };

  const handleOptionChange = (idx: number, field: keyof Option, value: string) => {
    setOptions((prevOptions) => {
      const newOptions = [...prevOptions];
      newOptions[idx][field] = value;
      return newOptions;
    });
  };


  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      // **จัดรูปแบบข้อมูลให้ตรงกับ Backend**
      const pollData = {
        question,
        description,
        startVoteAt,
        banner: bannerPollImage?.key,
        endVoteAt,
        publishedAt: null,
        options,
      };

      const payload = {
        polls: [pollData], // **Backend คาดหวัง `polls` เป็น array**
      };

      const response = await axiosInstance.post(`/events/${id}/polls/create`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        navigate(`/event/${id}`);

        toast.success("Poll published successfully!");
      } else {
        toast.error("Failed to publish poll. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Error publishing poll:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data?: { message?: string; error?: string } } };

        const errorMessage = err.response?.data?.message ?? "An unexpected error occurred.";
        const errorDescription = err.response?.data?.error ?? "";

        toast.error(errorMessage, { description: errorDescription });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsPublishing(false);
    }

  };
  const handlePublish = async () => {
    if (!validateForm()) return;
    setIsPublishing(true);

    try {
      // **จัดรูปแบบข้อมูลให้ตรงกับ Backend**
      const pollData = {
        question,
        description,
        startVoteAt,
        banner: bannerPollImage?.key,
        endVoteAt,
        publishedAt: new Date().toISOString(),
        options,
      };

      const payload = {
        polls: [pollData], // **Backend คาดหวัง `polls` เป็น array**
      };

      const response = await axiosInstance.post(`/events/${id}/polls/create`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        navigate(`/event/${id}`);

        toast.success("Poll published successfully!");
      } else {
        toast.error("Failed to publish poll. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Error publishing poll:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data?: { message?: string; error?: string } } };

        const errorMessage = err.response?.data?.message ?? "An unexpected error occurred.";
        const errorDescription = err.response?.data?.error ?? "";

        toast.error(errorMessage, { description: errorDescription });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-2xl font-bold">Create Poll</h1>

      {/*  Event Details Section */}
      {event && (
        <Card className="mb-6 bg-gray-50">
          <CardHeader>
            <p className="text-sm font-semibold">📌 {event.name}</p>
            <p className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Users size={16} /> Whitelisted Users: {whitelist.length + (guests && guests.length || 0)}
            </p>
          </CardHeader>
        </Card>
      )}

      {/* Poll Banner Upload */}
      <PollBannerUploader
        bannerPoll={bannerPollImage}
        onUpload={handlePollBannerUpload}
      />

      {/* Poll Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Question <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter poll question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={errors.question ? "border-red-500" : ""}
              />
              {errors.question && (
                <p className="mt-1 text-xs text-red-500">{errors.question}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter poll description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
              />
            </div>
            {/* 🕘 Start Vote Time */}
            <div>
              <label className="flex items-center gap-2 mb-1 text-sm font-medium">
                <CalendarClock size={16} /> Start Vote Time *
              </label>
              <Input type="datetime-local" value={startVoteAt} onChange={(e) => setStartVoteAt(e.target.value)} />
              {errors.startVoteAt && <p className="mt-1 text-xs text-red-500">{errors.startVoteAt}</p>}
            </div>

            {/* 🕛 End Vote Time */}
            <div>
              <label className="flex items-center gap-2 mb-1 text-sm font-medium">
                <CalendarClock size={16} /> End Vote Time *
              </label>
              <Input type="datetime-local" value={endVoteAt} onChange={(e) => setEndVoteAt(e.target.value)} />
              {errors.endVoteAt && <p className="mt-1 text-xs text-red-500">{errors.endVoteAt}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Poll Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Poll Options</CardTitle>
        </CardHeader>
        <CardContent>
          <PollOptionsList
            options={options}
            onAddOption={handleAddOption}
            onChangeOption={handleOptionChange}
            onRemoveOption={handleRemoveOption}
            onDuplicateOption={handleDuplicateOption}
            onBannerUpload={handleOptionBannerUpload}
          />
          {errors.options && (
            <p className="mt-2 text-xs text-red-500">{errors.options}</p>
          )}
        </CardContent>
      </Card>

      {/* Save Draft & Publish Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={handleSaveDraft}
          disabled={isSaving || isPublishing}
          variant="outline"
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" /> Save Draft
            </>
          )}
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isSaving || isPublishing}
          className="w-full"
        >
          {isPublishing ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" /> Publishing...
            </>
          ) : (
            "Publish Poll"
          )}
        </Button>
      </div>
    </div>
  );
}