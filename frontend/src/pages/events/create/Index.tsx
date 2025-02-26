import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { customAlphabet } from "nanoid";
import { IGuest } from "@/interfaces/interfaces";
import EventDetails from "./EventDetails";
import Participants from "./Participants";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/lib/Utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, Save } from "lucide-react";

export default function CreateEvent() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whitelistInput, setWhitelistInput] = useState("");
  const [initialWhitelistPoints, setInitialWhitelistPoints] = useState(1);
  const navigate = useNavigate();

  interface WhitelistEntry {
    email: string;
    point: number;
  }

  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);

  const [guest, setGuest] = useState<IGuest[] | null>(null);
  const [guestNumber, setGuestNumber] = useState(0);
  const [guestPoint, setGuestPoint] = useState(1);

  const [activeTab, setActiveTab] = useState("details");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate progress based on completed steps
  const getProgress = () => {
    switch (activeTab) {
      case "details":
        return 33;
      case "participants":
        return 66;
      case "summary":
        return 100;
      default:
        return 33;
    }
  };

  const handleAddWhitelist = () => {
    if (!whitelistInput.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    // Split input by comma, trim spaces, and remove empty entries
    const emailList = whitelistInput
      .split(",")
      .map(email => email.trim())
      .filter(email => email);

    // Validate each email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email(s): ${invalidEmails.join(", ")}`);
      return;
    }

    // Filter out duplicates
    const newEntries = emailList
      .filter(email => !whitelist.some(entry => entry.email === email))
      .map(email => ({ email, point: initialWhitelistPoints }));

    if (newEntries.length === 0) {
      toast("No new emails to add");
      return;
    }

    setWhitelist([...whitelist, ...newEntries]);
    setWhitelistInput(""); // Clear input after adding
    toast.success(`${newEntries.length} email${newEntries.length > 1 ? 's' : ''} added`);
  };

  const handleRemoveWhitelist = (email: string) => {
    setWhitelist(whitelist.filter((entry) => entry.email !== email));
    toast.success(`${email} removed from whitelist`);
  };


  const nanoidAlphaNum = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 8);

  const handleGenerateGuest = () => {
    if (guestNumber <= 0) {
      toast.error("Please enter a valid number of guests");
      return;
    }

    const newGuests = Array.from({ length: guestNumber }, () => ({
      id: nanoidAlphaNum(21),
      name: `GUEST-${nanoidAlphaNum(4)}`,
      key: nanoidAlphaNum(8),
      point: guestPoint,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setGuest([...(guest || []), ...newGuests]);
    toast.success(`Generated ${guestNumber} guest key${guestNumber > 1 ? 's' : ''}`);
  };

  const handleUpdateWhitelistPoint = (email: string, point: number) => {
    setWhitelist(whitelist.map(entry =>
      entry.email === email ? { ...entry, point } : entry
    ));
  };

  const handleNextTab = () => {
    if (activeTab === "details") {
      if (!name.trim()) {
        toast.error("Please enter the event name");
        return;
      }
      setActiveTab("participants");
    } else if (activeTab === "participants") {
      if (whitelist.length === 0 && (!guest || guest.length === 0)) {
        toast.error("Please add at least one participant or generate guest codes");
        return;
      }
      setActiveTab("summary");
    }
  };

  const handlePrevTab = () => {
    if (activeTab === "participants") {
      setActiveTab("details");
    } else if (activeTab === "summary") {
      setActiveTab("participants");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!name.trim()) {
      toast.error("Please enter the event name");
      setIsSubmitting(false);
      return;
    }

    if (!guest && whitelist.length === 0) {
      toast.error("Please add at least one participant or generate guest codes");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name,
      description,
      whitelist,
      guest,
    };

    try {
      const response = await axiosInstance.post("/events/create", payload);

      if (response.status !== 201) {
        throw new Error("Failed to create event");
      }

      toast.success("Event created successfully");
      navigate(`/event/${response.data.data.id}`);
    } catch (error) {
      console.error("[ERROR] createEvent:", error);
      setDialogMessage("Something went wrong. Please try again.");
      setShowDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidating = useRef(false);

  const handleTab = (tab: string) => {
    // Prevent duplicate validations
    if (isValidating.current) return;
    
    try {
      isValidating.current = true;
      
      if (activeTab === "details" && (tab === "participants" || tab === "summary")) {
        if (!name.trim()) {
          toast.error("Please enter the event name");
          return;
        }
      }
  
      if (activeTab === "participants" && tab === "summary") {
        if (whitelist.length === 0 && (!guest || guest.length === 0)) {
          toast.error("Please add at least one participant or generate guest codes");
          return;
        }
      }
  
      setActiveTab(tab);
    } finally {
      // Use setTimeout to prevent rapid successive calls
      setTimeout(() => {
        isValidating.current = false;
      }, 100);
    }
  };

  return (
    <div className="max-w-4xl md:p-6 mx-auto md:bg-white md:rounded-lg md:shadow-md">
      <h1 className="mb-2 text-3xl font-bold">Create New Event</h1>
      <p className="mb-6 text-gray-500">Complete all steps to create your event</p>

      <Progress value={getProgress()} className="h-2 mb-6" />

      <Tabs value={activeTab} onValueChange={(value) => handleTab(value)} className="w-full">
        <TabsList className="grid w-full md:grid-cols-3 mb-8 h-fit grid-cols-1 gap-2">
          <TabsTrigger value="details" className="flex justify-start md:justify-center gap-2" disabled={isSubmitting}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full ${activeTab === "details" ? "bg-primary text-white" : "bg-primary/10"
              }`}>1</span>
            Event Details
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex justify-start md:justify-center gap-2" disabled={isSubmitting}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full ${activeTab === "participants" ? "bg-primary text-white" : "bg-primary/10"
              }`}>2</span>
            Participants
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex justify-start md:justify-center gap-2" disabled={isSubmitting}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full ${activeTab === "summary" ? "bg-primary text-white" : "bg-primary/10"
              }`}>3</span>
            Review & Create
          </TabsTrigger>
        </TabsList>

        <div>
          <TabsContent value="details" className="mt-0">
            <EventDetails
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              handleNextTab={handleNextTab}
            />
          </TabsContent>

          <TabsContent value="participants" className="mt-0">
            <Participants
              whitelist={whitelist}
              setWhitelistInput={setWhitelistInput}
              initialWhitelistPoints={initialWhitelistPoints}
              setInitialWhitelistPoints={setInitialWhitelistPoints}
              handleUpdateWhitelistPoint={handleUpdateWhitelistPoint}
              guest={guest}
              setGuest={setGuest}
              guestNumber={guestNumber}
              setGuestNumber={setGuestNumber}
              guestPoint={guestPoint}
              setGuestPoint={setGuestPoint}
              handleAddWhitelist={handleAddWhitelist}
              handleRemoveWhitelist={handleRemoveWhitelist}
              handleGenerateGuest={handleGenerateGuest}
              handleNextTab={handleNextTab}
              handlePrevTab={handlePrevTab}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
                <CardDescription>Review your event details before creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-lg font-medium">Event Details</h3>
                    <Card className="border bg-gray-50/50">
                      <CardContent className="p-4">
                        <div className="py-2 space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Event Name:</p>
                            <p className="font-medium">{name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Description:</p>
                            <p className="whitespace-pre-line">{description || "-"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-medium">Participants Information</h3>
                    <Card className="border bg-gray-50/50">
                      <CardContent className="p-4">
                        <div className="py-2 space-y-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className={whitelist.length > 0 ? "text-green-500" : "text-gray-300"} />
                            <div>
                              <p className="text-sm text-gray-500">Registered Participants:</p>
                              <p className="font-medium">{whitelist.length} people</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className={guest && guest.length > 0 ? "text-green-500" : "text-gray-300"} />
                            <div>
                              <p className="text-sm text-gray-500">Guest Codes:</p>
                              <p className="font-medium">{guest && guest.length > 0 ? `${guest.length} codes generated` : "Not generated yet"}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </CardContent>
            </Card>
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="gap-2"
                disabled={isSubmitting}
              >
                <ChevronLeft size={16} /> Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Event"} <Save size={16} />
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Notification Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}