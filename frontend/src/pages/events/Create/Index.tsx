import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nanoid } from "nanoid";
import { IGuest } from "@/interfaces/interfaces";
import EventDetails from "./EventDetails";
import Participants from "./Participants";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function CreateEvent() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whitelistInput, setWhitelistInput] = useState("");
  const [initialWhitelistPoints, setInitialWhitelistPoints] = useState(0);

  interface WhitelistEntry {
    email: string;
    point: number;
  }

  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);

  const [guest, setGuest] = useState<IGuest[] | null>(null);
  const [guestNumber, setGuestNumber] = useState(0);
  const [guestPoint, setGuestPoint] = useState(0);

  const [activeTab, setActiveTab] = useState("details");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleAddWhitelist = () => {
    if (!whitelistInput.trim()) {
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
      setDialogMessage(`The email(s) ${invalidEmails.join(", ")} are invalid.`);
      setShowDialog(true);
      return;
    }

    // Filter out duplicates
    const newEntries = emailList
      .filter(email => !whitelist.some(entry => entry.email === email))
      .map(email => ({ email, point: initialWhitelistPoints }));

    if (newEntries.length === 0) {
      setDialogMessage("No new emails to add.");
      setShowDialog(true);
      return;
    }

    setWhitelist([...whitelist, ...newEntries]);
    setWhitelistInput(""); // Clear input after adding
    setDialogMessage(`${newEntries.length} entries added successfully.`);
    setShowDialog(true);
  };

  const handleRemoveWhitelist = (email: string) => {
    setWhitelist(whitelist.filter((entry) => entry.email !== email));
    setDialogMessage(`${email} has been removed from the whitelist.`);
    setShowDialog(true);
  };

  const handleGenerateGuest = () => {
    if (guestNumber <= 0) return;
    
    const newGuests = Array.from({ length: guestNumber }, () => ({
      id: nanoid(),
      name: `GUEST-${nanoid(4).toUpperCase()}`,
      key: nanoid(8).toUpperCase(),
      point: guestPoint,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setGuest(newGuests);
    setDialogMessage(`Generated ${guestNumber} guest codes successfully.`);
    setShowDialog(true);
  };

  const handleUpdateWhitelistPoint = (email: string, point: number) => {
    setWhitelist(whitelist.map(entry =>
      entry.email === email ? { ...entry, point } : entry
    ));
  };

  const handleNextTab = () => {
    if (activeTab === "details") {
      if (!name.trim()) {
        setDialogMessage("Please enter the event name.");
        setShowDialog(true);
        return;
      }
      setActiveTab("participants");
    } else if (activeTab === "participants") {
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

  const handleSubmit = () => {
    const payload = {
      name,
      description,
      whitelist,
      guest,
    };

    console.log("Sending payload:", payload);
    setDialogMessage("Event created successfully.");
    setShowDialog(true);
    // navigate("/events") would go here in real implementation
  };

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-sm">
      <h1 className="mb-6 text-3xl font-bold">Create New Event</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">1</span>
            Event Details
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">2</span>
            Participants
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">3</span>
            Summary
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
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
                <CardDescription>Review your event details before creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-lg font-medium">Event Details</h3>
                    <Card className="border bg-gray-50">
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
                    <Card className="border bg-gray-50">
                      <CardContent className="p-4">
                        <div className="py-2 space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Registered Participants:</p>
                            <p className="font-medium">{whitelist.length} people</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Guest Codes Generated:</p>
                            <p className="font-medium">{guest && guest.length > 0 ? `Generated (${guest.length} codes)` : "Not generated yet"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="w-32"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-32"
                  >
                    Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>
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
