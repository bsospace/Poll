import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Image, MoreVertical, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/Utils";
import { IEvent, IOption, IWhitelistUser, IPoll } from "@/interfaces/interfaces";

export default function CreatePoll() {
  const { id } = useParams();
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [bannerPoll, setBannerPoll] = useState<string>("");
  const [options, setOptions] = useState<Partial<IOption>[]>([
    { id: "default", text: "", banner: "", description: "", restricts: undefined },
  ]);
  const [whitelist, setWhitelist] = useState<IWhitelistUser[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);

  const fetchWhitelist = async () => {
    if (id) {
      try {
        const response = await axiosInstance.get<IEvent>(`/events/${id}`);
        setWhitelist(response.data.data.whitelist);
      } catch (error) {
        setEmailError("Failed to fetch event details. Please try again later.");
        console.error("Error fetching event:", error);
      }
    }
  };

  useEffect(() => {
    fetchWhitelist();
  }, [id]);

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

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const email = options[index].restricts;
      if (email && !validateEmail(email)) {
        setEmailError("Email is not in the whitelist.");
      } else {
        setEmailError(null);
        const user = whitelist.find((user) => user.user.email === email);
        if (user) {
          setOptions((prevOptions) => {
            const newOptions = [...prevOptions];
            newOptions[index].userProfile = user.user.avatar; // ใช้ avatar จาก IUser
            return newOptions;
          });
        }
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    return whitelist.some((whitelist) => whitelist.user.email === email && whitelist.eventId === id);
  };

  const handleEmailChange = (index: number, email: string) => {
    const newOptions = [...options];
    newOptions[index].restricts = email;
    setOptions(newOptions);
  };

  const handlePollBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPoll(reader.result as string); // เก็บไฟล์ banner ใน state ของ Poll
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Create Poll</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Poll Banner</label>
        <div className="relative">
          {bannerPoll ? (
            <div className="relative group">
              <img src={bannerPoll} alt="Poll Banner" className="w-full h-40 object-cover rounded-md" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <Button variant="ghost" className="text-white">Change Banner</Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image size={24} className="mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Upload Poll Banner</p>
              </div>
            </label>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handlePollBannerUpload} id="poll-banner-upload" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <Input 
                placeholder="Enter poll question" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                placeholder="Enter poll description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="min-h-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Poll Options</h2>
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-4">
              <Card className="relative flex-1 p-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <label htmlFor={`file-input-${index}`} className="cursor-pointer block">
                      {option.banner ? (
                        <div className="relative group">
                          <img src={option.banner} alt="Option" className="w-24 h-24 object-cover rounded-md" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <Image size={16} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center border border-dashed rounded-md text-gray-400 hover:bg-gray-50">
                          <Image size={20} />
                        </div>
                      )}
                    </label>
                    <input 
                      type="file" 
                      id={`file-input-${index}`} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleBannerUpload(index, e)} 
                    />
                  </div>

                  <div className="flex-1">
                    <Input 
                      placeholder="Option text" 
                      value={option.text} 
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].text = e.target.value;
                        setOptions(newOptions);
                      }} 
                      className="mb-2"
                    />
                    <Textarea 
                      placeholder="Option description (optional)"
                      value={option.description || ""} 
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].description = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="text-sm min-h-16"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicateOption(index)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRestrictOption(index)}>
                          Restrict
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {options.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600" 
                        onClick={() => handleRemoveOption(options.find((o) => o.id === option.id)?.id as string)}
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {option.restricts !== undefined && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      onClick={() => {
                        const newOptions = [...options];
                        newOptions[index].restricts = undefined;
                        setOptions(newOptions);
                      }}
                    >
                      <XCircle size={14} />
                    </Button>

                    <p className="text-xs font-medium mb-2">Email Restriction</p>
                    <Input
                      type="email"
                      placeholder="Enter voter email"
                      value={option.restricts || ""}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].restricts = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="text-sm"
                    />
                    {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}

                    {option.restricts && option.userProfile && (
                      <div className="flex gap-2 items-center mt-2">
                        <img src={option.userProfile} alt="Profile" className="w-6 h-6 rounded-full" />
                        <span className="text-xs text-gray-600">{option.restricts}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleAddOption} 
        variant="outline" 
        className="mb-6 w-full flex items-center justify-center gap-2 py-5 border-dashed"
      >
        <Plus size={16} /> Add Option
      </Button>

      <Button className="w-full py-6 text-base font-medium">Create Poll</Button>
    </div>
  );
};