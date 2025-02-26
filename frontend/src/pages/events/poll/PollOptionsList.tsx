import React from "react";
import PollOption from "./PollOption";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Option } from ".";

interface PollOptionsListProps {
    options: { id: string; text: string; description: string; banner: string }[];
    onAddOption: () => void;
    onChangeOption: (index: number, field: keyof Option, value: string) => void;
    onRemoveOption: (id: string) => void;
    onDuplicateOption: (index: number) => void;
    onBannerUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PollOptionsList({ options, onAddOption, onChangeOption, onRemoveOption, onDuplicateOption, onBannerUpload }: PollOptionsListProps) {
    return (
        <div>
            <h2 className="mb-2 text-lg font-semibold">Poll Options</h2>
            <div className="space-y-4">
                {options.map((option, index) => (
                    <PollOption
                        key={option.id}
                        option={option}
                        index={index}
                        onChange={onChangeOption}
                        onRemove={onRemoveOption}
                        onDuplicate={onDuplicateOption}
                        onBannerUpload={onBannerUpload}
                    />
                ))}
            </div>
            <Button onClick={onAddOption} variant="outline" className="w-full gap-2 mt-4 border-dashed">
                <Plus size={16} /> Add Option
            </Button>
        </div>
    );
}
