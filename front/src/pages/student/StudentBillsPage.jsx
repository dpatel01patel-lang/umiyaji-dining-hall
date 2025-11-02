import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { billsAPI } from "@/lib/api";
import { FileText, Download } from "lucide-react";
import { showError, showSuccess } from "@/lib/error-handler";

export default function StudentBillsPage() {
  const { userProfile } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  // Load bills
  useEffect(() => {
    const loadBills = async () => {
      if (!userProfile?.phone) return;

      setLoading(true);
      try {
        const billsData = await billsAPI.getByStudent(userProfile.phone);
        setBills(billsData);
      } catch (err) {
        console.error("Error loading bills:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [userProfile?.phone]);

  // Download bill as text file
  const downloadBill = async (billId, billNumber) => {
    try {
      setDownloading(billId);
      
      const response = await fetch(`http://localhost:8000/api/bills/${billId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download bill');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bill-${billNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('Bill downloaded successfully!', 'Download Bill');
    } catch (error) {
      console.error('Error downloading bill:', error);
      showError('Failed to download bill. Please try again.', 'Download Bill');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-xl">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold">My Bills</h1>
            <p className="text-blue-100">View and download your billing history</p>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading bills...</p>
            </div>
          ) : bills.length > 0 ? (
            bills.map((bill) => (
              <div
                key={bill._id}
                className="bg-white rounded-xl p-4 border border-blue-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={18} className="text-blue-600" />
                      <p className="font-semibold text-gray-900">
                        {bill.billNumber}
                      </p>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full capitalize",
                          bill.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : bill.status === "generated"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800",
                        )}
                      >
                        {bill.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(bill.startDate).toLocaleDateString()} -{" "}
                      {new Date(bill.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{bill.totalAmount}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {bill.totalMeals} meals
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Attendance Days:</span>{" "}
                    {bill.totalMeals}
                  </p>
                  <button 
                    onClick={() => downloadBill(bill._id, bill.billNumber)}
                    disabled={downloading === bill._id}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors",
                      downloading === bill._id
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    )}
                  >
                    {downloading === bill._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bills Generated</h3>
              <p className="text-gray-600">Your billing history will appear here once you start using our services.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
