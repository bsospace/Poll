import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { axiosInstance } from "@/lib/Utils";
import { IPoll } from "@/interfaces/interfaces";
import { Polls } from "@/components/Polls";

export default function Home() {
  const [myPolls, setMyPolls] = useState<IPoll[]>([]);
  const [publicPolls, setPublicPolls] = useState<IPoll[]>([]);
  const [myVotedPolls, setMyVotedPolls] = useState<IPoll[]>([]);

  const [isLoadingMyPolls, setIsLoadingMyPolls] = useState(false);
  const [isLoadingPublicPolls, setIsLoadingPublicPolls] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setIsLoadingMyPolls(true);
    setIsLoadingPublicPolls(true);

    try {
      const [myPollsRes, publicPollsRes, myVotedPolls] = await Promise.all([
        axiosInstance.get("/polls/my-polls"),
        axiosInstance.get("/polls/public-polls"),
        axiosInstance.get("/polls/my-voted-polls"),
      ]);

      setMyPolls(myPollsRes.data.data.polls);
      setPublicPolls(publicPollsRes.data.data.polls);
      setMyVotedPolls(myVotedPolls.data.data.polls);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setIsLoadingMyPolls(false);
      setIsLoadingPublicPolls(false);
    }
  };

  return (
    <div>
      <Accordion type="multiple" defaultValue={["item-1"]}>
        {/* My Polls Section */}
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h2 className="text-3xl font-bold">Poll สำหรับคุณ</h2>
          </AccordionTrigger>
          <AccordionContent>
            {isLoadingMyPolls ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : myPolls && myPolls.length === 0 ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold">ไม่มี Poll สำหรับคุณ</h2>
              </div>
            ) : (
              <Polls polls={myPolls} />
            )}
          </AccordionContent>
        </AccordionItem>

        {/* My voted polls */}

        <AccordionItem value="item-3">
          <AccordionTrigger>
            <h2 className="text-3xl font-bold">Poll ที่คุณเคยโหวต</h2>
          </AccordionTrigger>
          <AccordionContent>
            {myVotedPolls && myVotedPolls?.length === 0 ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold">ไม่มี Poll ที่คุณเคยโหวต</h2>
              </div>
            ) : (
              <Polls polls={myVotedPolls} />
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Public Polls Section */}
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <h2 className="text-3xl font-bold">Poll สาธารณะ</h2>
          </AccordionTrigger>
          <AccordionContent>
            {isLoadingPublicPolls ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : publicPolls && publicPolls?.length === 0 ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold">ไม่มี Poll สาธารณะ</h2>
              </div>
            ) : (
              <Polls polls={publicPolls} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
