import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { clientsAPI } from "@/lib/api";
import { showError, showSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  X,
  User,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";

export default function ClientsPage({ className }) {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState([]);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;
  const [clientSearchTimer, setClientSearchTimer] = useState(null);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load clients
  const loadClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      // Ensure data is always an array
      const clientsData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setClients(clientsData);
    } catch (err) {
      console.error("Error loading clients:", err);
      setClients([]); // Ensure clients is always an array
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Handle client search with debouncing
  const handleClientSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);

    if (clientSearchTimer) {
      clearTimeout(clientSearchTimer);
    }

    const timer = setTimeout(() => {
      setClientSearchLoading(true);
      // Simulate search loading state
      setTimeout(() => {
        setClientSearchLoading(false);
      }, 300);
    }, 500);

    setClientSearchTimer(timer);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!clientForm.name || !clientForm.phone) {
      showError("Please fill all required fields", 'Add Client');
      setLoading(false);
      return;
    }

    try {
      const newClient = await clientsAPI.create({
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email || "",
      });

      setClients([newClient, ...clients]);
      setClientForm({ name: "", phone: "", email: "" });
      setClientDialogOpen(false);

      showSuccess(`Client added successfully!`, 'Add Client');
    } catch (err) {
      showError(err, 'Add Client');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!clientForm.name) {
      showError("Please fill all required fields", 'Update Client');
      setLoading(false);
      return;
    }

    try {
      const updatedClient = await clientsAPI.update(editingClientId, {
        name: clientForm.name,
        email: clientForm.email || "",
      });

      setClients(
        clients.map((client) =>
          client._id === editingClientId ? updatedClient : client
        )
      );

      setClientForm({ name: "", phone: "", email: "" });
      setEditingClientId(null);
      setClientDialogOpen(false);

      showSuccess("Client updated successfully!", 'Update Client');
    } catch (err) {
      showError(err, 'Update Client');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    setLoading(true);
    try {
      await clientsAPI.delete(id);
      setClients(clients.filter((client) => client._id !== id));
    } catch (err) {
      showError(err, 'Delete Client');
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search
  const filteredClients = clients.filter((client) =>
    clientSearch === "" ||
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone.includes(clientSearch)
  );

  // Calculate pagination
  const clientsTotalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const clientsStartIndex = (currentPage - 1) * clientsPerPage;
  const clientsEndIndex = clientsStartIndex + clientsPerPage;
  const currentPageClients = filteredClients.slice(clientsStartIndex, clientsEndIndex);

  const handleClientsPageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Client Management
          </h2>
        </div>
        <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setEditingClientId(null);
                setClientForm({ name: "", phone: "", email: "" });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              disabled={loading}
            >
              <Plus size={18} />
              Add Client
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] border-0 shadow-2xl rounded-3xl overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -m-6 mb-6 p-4">
              <DialogHeader className="text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-2xl">
                    {editingClientId ? <Edit2 size={20} /> : <UserCheck size={20} />}
                  </div>
                  <DialogTitle className="text-[15px] font-semibold">
                    {editingClientId ? "Edit Client Information" : "Add New Client"}
                  </DialogTitle>
                </div>
              </DialogHeader>
            </div>

            <form onSubmit={editingClientId ? handleEditClient : handleAddClient} className="space-y-4 p-2 pt-0">
              <div className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-600" />
                      Full Name *
                    </div>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={clientForm.name}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, name: e.target.value })
                      }
                      placeholder="Enter client's full name"
                      className="pl-4 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 placeholder:text-gray-400 text-sm font-normal"
                      required
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-600" />
                      Phone Number *
                    </div>
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, phone: e.target.value })
                      }
                      placeholder="10-digit mobile number"
                      className="pl-4 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 placeholder:text-gray-400 text-sm font-normal"
                      disabled={!!editingClientId}
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-600" />
                      Email Address
                    </div>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, email: e.target.value })
                      }
                      placeholder="client@example.com (optional)"
                      className="pl-4 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 placeholder:text-gray-400 text-sm font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingClientId ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {editingClientId ? <Edit2 size={16} /> : <Plus size={16} />}
                      {editingClientId ? "Update Client" : "Add Client"}
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setClientDialogOpen(false);
                    setEditingClientId(null);
                    setClientForm({ name: "", phone: "", email: "" });
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client Statistics */}
      <div className="flex gap-4 mb-6 min-w-0">
        <div className="flex-1 min-w-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4">
          <div className="text-xs font-medium opacity-90">Total Clients</div>
          <div className="text-2xl font-semibold">{clients.length}</div>
          <div className="text-xs opacity-75 font-normal">Registered</div>
        </div>

        <div className="flex-1 min-w-0 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-4">
          <div className="text-xs font-medium opacity-90">Active Clients</div>
          <div className="text-2xl font-semibold">
            {clients.filter((c) => c.status === "active").length}
          </div>
          <div className="text-xs opacity-75 font-normal">Currently Active</div>
        </div>

        <div className="flex-1 min-w-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4">
          <div className="text-xs font-medium opacity-90">Search Results</div>
          <div className="text-2xl font-semibold">
            {clientSearch ? filteredClients.length : clients.length}
          </div>
          <div className="text-xs opacity-75 font-normal">
            {clientSearch ? "Matching" : "Displaying"}
          </div>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />
          <Input
            type="text"
            value={clientSearch}
            onChange={handleClientSearchChange}
            placeholder="Search clients by name or phone..."
            className="pl-10 rounded-2xl"
          />
          {clientSearch && (
            <div className="absolute right-3 top-3">
              {clientSearchLoading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <button
                  onClick={() => setClientSearch("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        {currentPageClients.length > 0 ? (
          currentPageClients.map((client) => (
            <div
              key={client._id}
              className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {client.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 mt-1 flex-wrap">
                  <span className="text-xs">{client.phone}</span>
                  {client.email && <span className="text-xs">{client.email}</span>}
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-xl",
                      client.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingClientId(client._id);
                    setClientForm({
                      name: client.name,
                      phone: client.phone,
                      email: client.email || "",
                    });
                    setClientDialogOpen(true);
                  }}
                  className="p-2 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Edit2 size={18} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteClient(client._id)}
                  disabled={loading}
                  className="p-2 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {clientSearch ? "No Clients Found" : "No Clients Added Yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              {clientSearch
                ? `No clients match your search for "${clientSearch}". Try a different search term.`
                : "Start building your client database by adding your first client."
              }
            </p>
            {!clientSearch && (
              <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => {
                      setEditingClientId(null);
                      setClientForm({ name: "", phone: "", email: "" });
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                  >
                    Add Your First Client
                  </button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {clientsTotalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleClientsPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ⬅️ Previous
          </button>

          {Array.from({ length: Math.min(5, clientsTotalPages) }, (_, i) => {
            let pageNumber;
            if (clientsTotalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= clientsTotalPages - 2) {
              pageNumber = clientsTotalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => handleClientsPageChange(pageNumber)}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  currentPage === pageNumber
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => handleClientsPageChange(Math.min(clientsTotalPages, currentPage + 1))}
            disabled={currentPage === clientsTotalPages}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}
