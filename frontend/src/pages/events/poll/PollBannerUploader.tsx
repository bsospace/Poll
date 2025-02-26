import React from "react";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface PollBannerUploaderProps {
  bannerPoll: {
    key: string;
    url: string;
  } | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PollBannerUploader({ bannerPoll, onUpload }: PollBannerUploaderProps) {
  return (
    <div className="mb-6">
      <label className="block mb-2 text-sm font-medium">Poll Banner</label>
      <div className="relative">
        {bannerPoll ? (
          <div className="relative group">
            <img src={bannerPoll.url} alt="Poll Banner" className="object-cover w-full h-40 rounded-md" />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded-md opacity-0 bg-opacity-40 group-hover:opacity-100">
              <label htmlFor="poll-banner-upload" className="cursor-pointer">
                <Button variant="ghost" className="text-white">Change Banner</Button>
              </label>
            </div>
          </div>
        ) : (
          <label htmlFor="poll-banner-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Image size={24} className="mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Upload Poll Banner</p>
            </div>
          </label>
        )}
        <input id="poll-banner-upload" type="file" accept="image/*" className="hidden" onChange={onUpload} />
      </div>
    </div>
  );
}
