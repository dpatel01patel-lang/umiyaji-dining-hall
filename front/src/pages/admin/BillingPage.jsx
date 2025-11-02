import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { billsAPI, clientsAPI } from "@/lib/api";
import { showError, showSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  Download,
  X,
  Users,
} from "lucide-react";

export default function BillingPage({ className }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);
  const [billingForm, setBillingForm] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingSearchTerm, setBillingSearchTerm] = useState("");
  const [billingSearchResults, setBillingSearchResults] = useState([]);
  const [billingSearchLoading, setBillingSearchLoading] = useState(false);
  const [showBillingSearchResults, setShowBillingSearchResults] = useState(false);
  const [selectedBillingClients, setSelectedBillingClients] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load bills
  useEffect(() => {
    const loadBills = async () => {
      try {
        const data = await billsAPI.getAll();
        setBills(data);
      } catch (err) {
        console.error("Error loading bills:", err);
      }
    };
    loadBills();
  }, []);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsAPI.getAll();
        setClients(data);
      } catch (err) {
        console.error("Error loading clients:", err);
      }
    };
    loadClients();
  }, []);

  // Download bill handler
  const handleDownloadBill = async (bill) => {
    try {
      setLoading(true);

      // Get current attendance records to check for deleted entries
      const currentAttendance = await fetch('http://localhost:8000/api/attendance').then(res => res.json());
      const currentAttendanceMap = new Map();

      // Create a map of current attendance records by date and meal type
      currentAttendance.forEach((record) => {
        const key = `${new Date(record.date).toDateString()}-${record.mealType}`;
        currentAttendanceMap.set(key, record);
      });

      // Separate active and potentially deleted meals
      const activeMeals = [];
      const deletedMeals = [];

      if (bill.meals) {
        bill.meals.forEach((meal) => {
          const key = `${new Date(meal.date).toDateString()}-${meal.type}`;
          if (currentAttendanceMap.has(key)) {
            activeMeals.push(meal);
          } else {
            deletedMeals.push(meal);
          }
        });
      }

      // Calculate totals based only on active meals
      const activeTotalMeals = activeMeals.length;
      const activeTotalAmount = activeMeals.reduce((sum, meal) => sum + meal.price, 0);

      // Generate PDF content as HTML
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Tiffin Service Bill</h1>
            <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
          </div>
          <div class="bill-details">
            <p><strong>Student Name:</strong> ${bill.studentName}</p>
            <p><strong>Phone:</strong> ${bill.studentPhone}</p>
            <p><strong>Period:</strong> ${new Date(bill.startDate).toLocaleDateString()} - ${new Date(bill.endDate).toLocaleDateString()}</p>
            <p><strong>Total Meals:</strong> ${activeTotalMeals}</p>
            <p><strong>Status:</strong> ${bill.status}</p>
          </div>
          
          <h3>Attendance Records</h3>
          <table class="table">
            <tr>
              <th>Date</th>
              <th>Meal Type</th>
              <th>Price (₹)</th>
            </tr>
            ${activeMeals.map((meal) => `
              <tr>
                <td>${new Date(meal.date).toLocaleDateString()}</td>
                <td>${meal.type}</td>
                <td>₹${meal.price}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="total">
            Total Amount: ₹${activeTotalAmount}
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Thank you for choosing our tiffin service!</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill-${bill.billNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`Bill downloaded successfully!`, 'Download Bill');
    } catch (err) {
      showError(err.message || 'Failed to download bill', 'Download Bill');
    } finally {
      setLoading(false);
    }
  };

  // Client search functions
  const searchBillingClients = async (query) => {
    if (query.length < 2) {
      setBillingSearchResults([]);
      setShowBillingSearchResults(false);
      return;
    }

    setBillingSearchLoading(true);
    try {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.phone.includes(query)
      );
      setBillingSearchResults(filtered);
      setShowBillingSearchResults(true);
    } catch (err) {
      console.error("Error searching clients:", err);
    } finally {
      setBillingSearchLoading(false);
    }
  };

  const handleBillingSearchChange = (e) => {
    const value = e.target.value;
    setBillingSearchTerm(value);

    // Set new timer to debounce search
    setTimeout(() => {
      searchBillingClients(value);
    }, 500);
  };

  const selectBillingClient = (client) => {
    setSelectedBillingClients(new Set([client._id]));
    setBillingSearchTerm(client.name);
    setShowBillingSearchResults(false);
  };

  const handleSingleBillGenerate = async () => {
    if (selectedBillingClients.size === 0) {
      showError("Please select a client first", 'Generate Bill');
      return;
    }

    // Validate date range
    const startDate = new Date(billingForm.startDate);
    const endDate = new Date(billingForm.endDate);
    const today = new Date();

    if (startDate > endDate) {
      showError("Start date must be before end date", 'Generate Bill');
      return;
    }

    if (startDate > today) {
      showError("Start date cannot be in the future", 'Generate Bill');
      return;
    }

    setLoading(true);
    try {
      const selectedClientId = Array.from(selectedBillingClients)[0];
      const selectedClient = clients.find(c => c._id === selectedClientId);

      if (!selectedClient) {
        showError("Selected client not found. Please search and select again.", 'Generate Bill');
        setLoading(false);
        return;
      }

      const newBill = await billsAPI.generate({
        studentName: selectedClient.name,
        studentPhone: selectedClient.phone,
        startDate: billingForm.startDate,
        endDate: billingForm.endDate,
      });

      setBills([newBill, ...bills]);
      setShowBillingForm(false);

      // Reset search state
      setBillingSearchTerm("");
      setSelectedBillingClients(new Set());
      setShowBillingSearchResults(false);

      showSuccess(`Bill generated successfully for ${selectedClient.name}!`, 'Generate Bill');
    } catch (err) {
      if (err.message.includes("No attendance records found")) {
        showError(`No attendance records found in the selected date range. Please select a different date range or record attendance first.`, 'Generate Bill');
      } else {
        showError(err.message, 'Generate Bill');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Bill Management</h2>
            <p className="text-xs text-gray-600 font-medium">Generate bills efficiently</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowBillingForm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <Plus size={12} />
            Add Bill
          </button>
        </div>
      </div>

      {/* Compact Billing Cards - Show only first 3 */}
      <div className="space-y-2 mb-4">
        {bills.length > 0 ? (
          bills.slice(0, 3).map((bill) => (
            <div
              key={bill._id}
              className="bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-between hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-500 truncate">
                      {new Date(bill.createdAt || bill.billDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                    <span className="text-gray-900 truncate font-medium">
                      {bill.studentName}
                    </span>
                    <span className="text-gray-900 font-bold">
                      ₹{bill.totalAmount}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium px-1 py-0.5 rounded-full capitalize flex-shrink-0",
                        bill.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : bill.status === "generated"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700",
                      )}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownloadBill(bill)}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors flex-shrink-0"
              >
                <Download size={10} />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium">No bills generated yet</p>
          </div>
        )}
      </div>

      {/* Single Bill Form Dialog */}
      <Dialog open={showBillingForm} onOpenChange={setShowBillingForm}>
        <DialogContent className="w-[95vw] max-w-2xl h-[50vh] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Generate Single Bill</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">Search and select a client for billing</p>
                  </div>
                </div>
                <DialogClose asChild>
                  <button
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={() => {
                      setBillingSearchTerm("");
                      setSelectedBillingClients(new Set());
                      setShowBillingSearchResults(false);
                    }}
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Client Search */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  🔍 Search Client
                </label>
                <Input
                  type="text"
                  value={billingSearchTerm}
                  onChange={handleBillingSearchChange}
                  placeholder="Search by name or phone number..."
                  className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                />

                {/* Search Results Dropdown */}
                {showBillingSearchResults && (
                  <div
                    className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-36 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {billingSearchLoading ? (
                      <div className="p-2 text-center text-gray-500">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                        <span className="text-xs">Searching...</span>
                      </div>
                    ) : billingSearchResults.length > 0 ? (
                      billingSearchResults.map((client) => (
                        <button
                          key={client._id}
                          type="button"
                          onClick={() => selectBillingClient(client)}
                          className="w-full text-left p-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors focus:bg-blue-50 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900 text-xs">{client.name}</div>
                          <div className="text-xs text-gray-600">{client.phone}</div>
                          {client.email && (
                            <div className="text-xs text-gray-500">{client.email}</div>
                          )}
                        </button>
                      ))
                    ) : billingSearchTerm.length >= 2 ? (
                      <div className="p-2 text-center text-gray-500 text-xs">
                        No clients found
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Selected Client Info */}
              {selectedBillingClients.size > 0 && (
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded-lg">
                      <Users size={10} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 text-xs">
                        {clients.find(c => c._id === Array.from(selectedBillingClients)[0])?.name}
                      </p>
                      <p className="text-xs text-blue-700">
                        {clients.find(c => c._id === Array.from(selectedBillingClients)[0])?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    📅 Start Date
                  </label>
                  <Input
                    type="date"
                    value={billingForm.startDate}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    📅 End Date
                  </label>
                  <Input
                    type="date"
                    value={billingForm.endDate}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Dialog Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <Button
                  onClick={handleSingleBillGenerate}
                  disabled={loading || selectedBillingClients.size === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-bold h-9 sm:h-10 transition-all duration-300 disabled:opacity-50 shadow-lg text-xs"
                >
                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Generating...</span>
                    </div>
                  ) : (
                    <>
                      <FileText size={10} className="mr-1 sm:mr-2 sm:w-3 sm:h-3" />
                      <span className="text-xs">Generate Bill</span>
                    </>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="px-3 sm:px-4 h-9 sm:h-10 rounded-lg font-semibold text-xs border-2"
                    onClick={() => {
                      setBillingSearchTerm("");
                      setSelectedBillingClients(new Set());
                      setShowBillingSearchResults(false);
                      setShowBillingForm(false);
                    }}
                  >
                    <X size={10} className="sm:w-3 sm:h-3 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Cancel</span>
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
