import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const Polls = ({ polls }) => {
  const [activeTab, setActiveTab] = useState("polls");
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [newPoll, setNewPoll] = useState({ question: "", description: "" });

  const closeModal = () => setSelectedPoll(null);

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-sm">
      <h1 className="mb-6 text-3xl font-bold">Create Poll</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="polls" aria-selected={activeTab === "polls"}>Polls</TabsTrigger>
          <TabsTrigger value="create" aria-selected={activeTab === "create"}>Create Poll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="polls">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.map((poll) => (
              <Card key={poll.question} onClick={() => setSelectedPoll(poll)} className="cursor-pointer">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold">{poll.question}</h2>
                  <p className="text-sm text-gray-500">{poll.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Poll</CardTitle>
              <CardDescription>Fill in the details to create a poll</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Poll Question" 
                className="w-full" 
                value={newPoll.question} 
                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })} 
              />
              <Input 
                placeholder="Description" 
                className="w-full" 
                value={newPoll.description} 
                onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })} 
              />
              <Button className="w-full" disabled={!newPoll.question.trim()}>Create Poll</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AnimatePresence>
        {selectedPoll && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-lg w-96"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold">{selectedPoll.question}</h2>
              <p className="text-sm text-gray-500">{selectedPoll.description}</p>
              <div className="mt-4">
                {selectedPoll.options.map((option, index) => (
                  <Button key={index} variant="outline" className="w-full mb-2">
                    {option.text}
                  </Button>
                ))}
              </div>
              <Button onClick={closeModal} className="mt-4 w-full">Close</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Polls;
