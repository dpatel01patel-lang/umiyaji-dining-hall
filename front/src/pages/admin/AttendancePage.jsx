import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";
import { attendanceAPI, notificationsAPI, mealsAPI, clientsAPI } from "@/lib/api";
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
  CheckCircle2,
  ArrowLeft,
  FileText,
  Plus,
  Users,
  X,
  UserPlus,
} from "lucide-react";

export default function AttendancePage({ className }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const attendanceRecordsPerPage = 10;
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [showBatchAttendanceDialog, setShowBatchAttendanceDialog] = useState(false);
  const [showSingleAttendanceDialog, setShowSingleAttendanceDialog] = useState(false);

  // Form states
  const [attendanceForm, setAttendanceForm] = useState({
    studentName: "",
    studentPhone: "",
    mealType: "lunch",
    date: new Date().toISOString().split("T")[0],
  });

  const [batchMealType, setBatchMealType] = useState("lunch");
  const [batchDate, setBatchDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedClientPhones, setSelectedClientPhones] = useState(new Set());

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const viewRecords = searchParams.get('view') === 'records';

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [attendanceResponse, clientsResponse, mealsResponse] = await Promise.all([
          attendanceAPI.getAll(),
          clientsAPI.getAll(),
          mealsAPI.getAll()
        ]);
        // Extract arrays from API response structure and ensure they are arrays
        const attendanceData = Array.isArray(attendanceResponse.attendances)
          ? attendanceResponse.attendances
          : Array.isArray(attendanceResponse)
            ? attendanceResponse
            : [];
        const clientsData = Array.isArray(clientsResponse.data)
          ? clientsResponse.data
          : Array.isArray(clientsResponse)
            ? clientsResponse
            : [];
        const mealsData = Array.isArray(mealsResponse.data)
          ? mealsResponse.data
          : Array.isArray(mealsResponse)
            ? mealsResponse
            : [];
        setAttendanceRecords(attendanceData);
        setClients(clientsData);
        setMenuItems(mealsData);
      } catch (err) {
        console.error("Error loading data:", err);
        // Ensure state is set to arrays even on error
        setAttendanceRecords([]);
        setClients([]);
        setMenuItems([]);
      }
    };
    loadData();
  }, []);

  // Calculate pagination
  const attendanceTotalPages = Math.ceil(attendanceRecords.length / attendanceRecordsPerPage);
  const attendanceStartIndex = (currentPage - 1) * attendanceRecordsPerPage;
  const attendanceEndIndex = attendanceStartIndex + attendanceRecordsPerPage;
  const currentPageAttendanceRecords = attendanceRecords.slice(attendanceStartIndex, attendanceEndIndex);

  const handleAttendancePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteAttendance = async (id) => {
    setLoading(true);
    try {
      await attendanceAPI.delete(id);
      setAttendanceRecords(
        attendanceRecords.filter((record) => record._id !== id),
      );
      showSuccess("Attendance record deleted successfully!", 'Delete Attendance');
    } catch (err) {
      showError(err, 'Delete Attendance');
    } finally {
      setLoading(false);
    }
  };

  // Search clients function
  const searchClients = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const clientsResponse = await clientsAPI.getAll();
      const allClients = clientsResponse.data || clientsResponse;
      const filtered = allClients.filter((client) =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.phone.includes(query)
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error searching clients:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setTimeout(() => {
      searchClients(value);
    }, 500);
  };

  // Select client from search results
  const selectClientFromSearch = (client) => {
    setAttendanceForm({
      ...attendanceForm,
      studentName: client.name,
      studentPhone: client.phone,
    });
    setSearchTerm(client.name);
    setShowSearchResults(false);
  };

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!attendanceForm.studentName || !attendanceForm.studentPhone) {
      showError("Please fill all fields", 'Record Attendance');
      setLoading(false);
      return;
    }

    try {
      // Find the meal price from menu
      const mealPrice = menuItems.find(
        (meal) => meal.type === attendanceForm.mealType,
      )?.price;

      if (!mealPrice) {
        showError("No meal found for this type. Please add a meal first.", 'Record Attendance');
        setLoading(false);
        return;
      }

      const newRecord = await attendanceAPI.record({
        studentName: attendanceForm.studentName,
        studentPhone: attendanceForm.studentPhone,
        mealType: attendanceForm.mealType,
        date: attendanceForm.date,
        price: mealPrice,
      });

      setAttendanceRecords([newRecord, ...attendanceRecords]);
      setShowSingleAttendanceDialog(false);
      
      // Reset form
      setAttendanceForm({
        studentName: "",
        studentPhone: "",
        mealType: "lunch",
        date: new Date().toISOString().split("T")[0],
      });
      showSuccess("Attendance recorded successfully!", 'Record Attendance');
    } catch (err) {
      showError(err, 'Record Attendance');
    } finally {
      setLoading(false);
    }
  };

  const toggleClientSelection = (phone) => {
    const newSelection = new Set(selectedClientPhones);
    if (newSelection.has(phone)) {
      newSelection.delete(phone);
    } else {
      newSelection.add(phone);
    }
    setSelectedClientPhones(newSelection);
  };

  const handleBatchAttendanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (selectedClientPhones.size === 0) {
      showError("Please select at least one client", 'Batch Attendance');
      setLoading(false);
      return;
    }

    try {
      const selectedClients = clients.filter((c) =>
        selectedClientPhones.has(c.phone),
      );

      // Get meal price
      const mealPrice = menuItems.find((m) => m.type === batchMealType)?.price;

      if (!mealPrice) {
        showError("No meal found for selected type", 'Batch Attendance');
        setLoading(false);
        return;
      }

      // Record attendance for all selected clients
      const attendancePromises = selectedClients.map((client) =>
        attendanceAPI.record({
          studentName: client.name,
          studentPhone: client.phone,
          mealType: batchMealType,
          date: batchDate,
          price: mealPrice,
        }),
      );

      await Promise.all(attendancePromises);

      // Reload attendance records
      const recordsResponse = await attendanceAPI.getAll();
      const records = Array.isArray(recordsResponse.attendances)
        ? recordsResponse.attendances
        : Array.isArray(recordsResponse)
          ? recordsResponse
          : [];
      setAttendanceRecords(records);

      setShowBatchAttendanceDialog(false);
      setSelectedClientPhones(new Set());
      showSuccess(`Attendance recorded for ${selectedClientPhones.size} clients!`, 'Batch Attendance');
    } catch (err) {
      showError(err, 'Batch Attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {viewRecords ? (
        /* All Attendance Records Page */
        <div>
          {/* Header with Back Button */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/admin/attendance')}
                className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
              >
                <ArrowLeft size={15} className="text-white sm:w-6 sm:h-6" />
              </button>
              <div className="flex-1">
                <h2 className="text-sm sm:text-xl font-bold text-gray-900">All Attendance Records</h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Complete attendance history for all clients</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <FileText size={15} className="text-white sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Compact Records Grid */}
          <div className="space-y-2">
            {currentPageAttendanceRecords.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {currentPageAttendanceRecords.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Compact Header */}
                    <div className={`p-2 border-b border-gray-100 ${record.mealType === "lunch"
                      ? "bg-gradient-to-r from-orange-50 to-red-50"
                      : "bg-gradient-to-r from-purple-50 to-indigo-50"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`p-1 rounded ${record.mealType === "lunch"
                          ? "bg-gradient-to-r from-orange-500 to-red-500"
                          : "bg-gradient-to-r from-purple-500 to-indigo-500"
                          }`}>
                          <CheckCircle2 size={8} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs truncate">{record.studentName}</h4>
                          <p className="text-[10px] text-gray-600 truncate">{record.studentPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Compact Details */}
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        <div className="text-center p-1 bg-blue-50 rounded">
                          <div className="text-[10px] font-bold text-blue-600">₹{record.price}</div>
                          <div className="text-[9px] text-blue-700 font-medium">Price</div>
                        </div>
                        <div className="text-center p-1 bg-green-50 rounded">
                          <div className="text-[9px] font-bold text-green-600">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="text-[9px] text-green-700 font-medium">Date</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${record.mealType === "lunch"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                          }`}>
                          {record.mealType === "lunch" ? "🍽️ L" : "🌙 D"}
                        </span>
                        <button
                          onClick={() => handleDeleteAttendance(record._id)}
                          disabled={loading}
                          className="p-1 hover:bg-red-50 rounded transition-colors group disabled:opacity-50 border border-transparent hover:border-red-200"
                          title="Delete Record"
                        >
                          <X size={8} className="text-red-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] text-emerald-600 font-medium">Recorded</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Attendance Records</h3>
                <p className="text-gray-600 max-w-md mx-auto text-base">
                  Start tracking meal attendance for your clients to see records here
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {attendanceTotalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleAttendancePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⬅️
              </button>

              {Array.from({ length: Math.min(5, attendanceTotalPages) }, (_, i) => {
                let pageNumber;
                if (attendanceTotalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= attendanceTotalPages - 2) {
                  pageNumber = attendanceTotalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handleAttendancePageChange(pageNumber)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      currentPage === pageNumber
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => handleAttendancePageChange(Math.min(attendanceTotalPages, currentPage + 1))}
                disabled={currentPage === attendanceTotalPages}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ➡️
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regular Attendance Tab */
        <>
          {/* Enhanced Header with Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <CheckCircle2 size={15} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-sm sm:text-xl font-bold text-gray-900">Attendance Center</h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Track and manage meal attendance efficiently</p>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xs font-semibold opacity-90">Today's</div>
                <div className="text-lg sm:text-2xl font-bold">
                  {attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
                </div>
                <div className="text-xs opacity-75">Records</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xs font-semibold opacity-90">This Week</div>
                <div className="text-lg sm:text-2xl font-bold">
                  {attendanceRecords.filter(r => {
                    const recordDate = new Date(r.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return recordDate >= weekAgo;
                  }).length}
                </div>
                <div className="text-xs opacity-75">Attendance</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xs font-semibold opacity-90">Lunch</div>
                <div className="text-lg sm:text-2xl font-bold">
                  {attendanceRecords.filter(r => r.mealType === "lunch").length}
                </div>
                <div className="text-xs opacity-75">Records</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xs font-semibold opacity-90">Dinner</div>
                <div className="text-lg sm:text-2xl font-bold">
                  {attendanceRecords.filter(r => r.mealType === "dinner").length}
                </div>
                <div className="text-xs opacity-75">Records</div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowBatchAttendanceDialog(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
                disabled={loading}
              >
                <Users size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Record Batch</span>
                <span className="sm:hidden">Batch</span>
              </button>
              <button
                onClick={() => setShowSingleAttendanceDialog(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
                disabled={loading}
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Record Single</span>
                <span className="sm:hidden">Single</span>
              </button>
            </div>
          </div>

          {/* View All Attendance Records Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/attendance?view=records')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
            >
              <FileText size={16} className="sm:w-5 sm:h-5" />
              <span>View All Attendance Records</span>
            </button>
          </div>
        </>
      )}

      {/* Single Attendance Dialog */}
      <Dialog open={showSingleAttendanceDialog} onOpenChange={setShowSingleAttendanceDialog}>
        <DialogContent className="w-[95vw] max-w-2xl h-[50vh] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <UserPlus size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Single Attendance</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">Search and record attendance for one student</p>
                  </div>
                </div>
                <DialogClose asChild>
                  <button
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={() => {
                      setAttendanceForm({
                        studentName: "",
                        studentPhone: "",
                        mealType: "lunch",
                        date: new Date().toISOString().split("T")[0],
                      });
                      setSearchTerm("");
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              <form onSubmit={handleRecordAttendance} className="space-y-3 sm:space-y-4">
                {/* Search Client */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    🔍 Search Student
                  </label>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by name or phone number..."
                    className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                  />

                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <div
                      className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-36 overflow-y-auto"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {searchLoading ? (
                        <div className="p-2 text-center text-gray-500">
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                          <span className="text-xs">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((client) => (
                          <button
                            key={client._id}
                            type="button"
                            onClick={() => selectClientFromSearch(client)}
                            className="w-full text-left p-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors focus:bg-blue-50 focus:outline-none"
                          >
                            <div className="font-medium text-gray-900 text-xs">{client.name}</div>
                            <div className="text-xs text-gray-600">{client.phone}</div>
                            {client.email && (
                              <div className="text-xs text-gray-500">{client.email}</div>
                            )}
                          </button>
                        ))
                      ) : searchTerm.length >= 2 ? (
                        <div className="p-2 text-center text-gray-500 text-xs">
                          No clients found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Selected Client Info */}
                {attendanceForm.studentName && attendanceForm.studentPhone && (
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <UserPlus size={10} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 text-xs">{attendanceForm.studentName}</p>
                        <p className="text-xs text-blue-700">{attendanceForm.studentPhone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meal Type & Date */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🍽️ Meal Type
                    </label>
                    <select
                      value={attendanceForm.mealType}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          mealType: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium bg-white"
                    >
                      <option value="lunch">🍽️ Lunch</option>
                      <option value="dinner">🌙 Dinner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      📅 Date
                    </label>
                    <Input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Dialog Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <Button
                  onClick={handleRecordAttendance}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-bold h-9 sm:h-10 transition-all duration-300 disabled:opacity-50 shadow-lg text-xs"
                >
                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Recording...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 size={10} className="mr-1 sm:mr-2 sm:w-3 sm:h-3" />
                      <span className="text-xs">Record Attendance</span>
                    </>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="px-3 sm:px-4 h-9 sm:h-10 rounded-lg font-semibold text-xs border-2"
                    onClick={() => {
                      setShowSingleAttendanceDialog(false);
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

      {/* Batch Attendance Dialog */}
      <Dialog open={showBatchAttendanceDialog} onOpenChange={setShowBatchAttendanceDialog}>
        <DialogContent className="w-[95vw] max-w-4xl h-[70vh] p-0 border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 sm:p-4 text-white flex-shrink-0 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-xl">
                    <Users size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-bold">Batch Attendance</h2>
                    <p className="text-emerald-100 text-xs sm:text-sm">Record attendance for multiple clients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 min-h-0">
              <form onSubmit={handleBatchAttendanceSubmit} className="space-y-3 sm:space-y-4">
                {/* Date & Meal Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      📅 Date
                    </label>
                    <Input
                      type="date"
                      value={batchDate}
                      onChange={(e) => setBatchDate(e.target.value)}
                      className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🍽️ Meal Type
                    </label>
                    <select
                      value={batchMealType}
                      onChange={(e) => setBatchMealType(e.target.value)}
                      className="w-full px-2.5 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium bg-white"
                    >
                      <option value="lunch">🍽️ Lunch</option>
                      <option value="dinner">🌙 Dinner</option>
                    </select>
                  </div>
                </div>

                {/* Client Selection */}
                <div className="flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      👥 Select Clients
                    </label>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                      {selectedClientPhones.size} selected
                    </span>
                  </div>
                  <div className="h-60 sm:h-80 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 sm:p-4 space-y-2 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <label
                          key={client._id}
                          className="flex items-center gap-3 p-2.5 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-emerald-200 hover:shadow-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClientPhones.has(client.phone)}
                            onChange={() => toggleClientSelection(client.phone)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm">{client.name}</p>
                            <p className="text-xs text-gray-600">{client.phone}</p>
                          </div>
                          {selectedClientPhones.has(client.phone) && (
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          )}
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No clients available</p>
                        <p className="text-gray-400 text-xs mt-1">Please add clients first</p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Dialog Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-3xl">
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleBatchAttendanceSubmit}
                  disabled={loading || selectedClientPhones.size === 0}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-bold h-9 sm:h-11 transition-all duration-300 disabled:opacity-50 shadow-lg text-xs"
                >
                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Recording...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 size={10} className="mr-1 sm:mr-2 sm:w-3 sm:h-3" />
                      <span className="text-xs">Record Attendance</span>
                    </>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="px-3 sm:px-4 h-9 sm:h-11 rounded-xl font-semibold text-xs border-2"
                    onClick={() => {
                      setSelectedClientPhones(new Set());
                      setShowBatchAttendanceDialog(false);
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
