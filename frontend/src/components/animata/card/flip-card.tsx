import { FC, ReactNode } from "react";
import { cn } from "@/lib/Utils";

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  flip?: boolean;
  frontContent: ReactNode;
  backContent: ReactNode;
}

const FlipCard: FC<FlipCardProps> = ({ flip = false, frontContent, backContent, className, ...props }) => {
  return (
    <div className={cn("group h-96 md:w-96 [perspective:1000px]", className)} {...props}>
      <div
        className={cn(
          "relative h-full rounded-2xl transition-all duration-500 [transform-style:preserve-3d]",
          flip ? "[transform:rotateY(180deg)]" : ""
        )}
      >
        {/* Front - Google Auth */}
        <div className="absolute h-full rounded-2xl flex flex-col items-center justify-center [backface-visibility:hidden]">
          {frontContent}
        </div>

        {/* Back - Guest Auth */}
        <div
          className={cn(
            "absolute h-full rounded-2xl flex flex-col items-center justify-center [backface-visibility:hidden]",
            "[transform:rotateY(180deg)]"
          )}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
