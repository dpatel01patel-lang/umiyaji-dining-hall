import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { attendanceAPI } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export default function StudentAttendancePage() {
  const { userProfile } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load attendance records
  useEffect(() => {
    const loadAttendance = async () => {
      if (!userProfile?.phone) return;

      setLoading(true);
      try {
        const attendanceDataResponse = await attendanceAPI.getByStudent(userProfile.phone);
        // Ensure attendanceData is always an array
        const attendanceData = Array.isArray(attendanceDataResponse.data)
          ? attendanceDataResponse.data
          : Array.isArray(attendanceDataResponse.attendances)
            ? attendanceDataResponse.attendances
            : Array.isArray(attendanceDataResponse)
              ? attendanceDataResponse
              : [];
        setAttendanceRecords(attendanceData);
      } catch (err) {
        console.error("Error loading attendance:", err);
        setAttendanceRecords([]); // Ensure attendanceRecords is always an array
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [userProfile?.phone]);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-2xl shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className=" bg-white bg-opacity-20 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold">Attendance History</h1>
            <p className="text-green-100">Track your meal attendance records</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {attendanceRecords.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Summary</h2>
          <div className="flex items-center justify-between text-center">
            <div>
              <p className="text-xs text-gray-500">Total Meals</p>
              <p className="text-xl font-bold text-green-600">{attendanceRecords.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-green-600">
                ₹{attendanceRecords.reduce((sum, record) => sum + record.price, 0)}
              </p>
            </div>
          </div>
        </div>

      )}

      {/* Attendance Records */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance Records</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2">Loading attendance records...</p>
            </div>
          ) : attendanceRecords.length > 0 ? (
            attendanceRecords.map((record) => (
              <div
                key={record._id}
                className="bg-white rounded-xl p-4 border border-green-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={18} className="text-green-600" />
                      <p className="font-semibold text-gray-900">
                        {record.mealType.charAt(0).toUpperCase() +
                          record.mealType.slice(1)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ₹{record.price}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <CheckCircle2 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Records</h3>
              <p className="text-gray-600">Your attendance records will appear here once you start ordering meals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
