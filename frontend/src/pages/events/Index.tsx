import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Search, Plus } from "lucide-react";
import { axiosInstance } from "@/lib/Utils";
import { IEvent } from "@/interfaces/interfaces";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function EventsList() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/events");
      setEvents(response.data.data.events);
    } catch (error) {
      setError("Failed to fetch events. Please try again later.");
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Manage Events</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
          </div>
          <Link to="/event/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          {searchTerm ? "No events found matching your search." : "No events available."}
        </p>
      ) : (
        <>
          <ul className="space-y-4">
            {paginatedEvents.map((event) => (
              <li
                key={event.id}
                className="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-md"
              >
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <p className="mt-2 text-gray-600">{event.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                  <p>
                    Created: {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(page => page - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(page => page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}