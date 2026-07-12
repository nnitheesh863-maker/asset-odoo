import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/formatters';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS = {
  pending: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
  approved: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  active: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  completed: 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400',
  cancelled: 'bg-red-50 border-red-200 text-red-400 dark:bg-red-900/10 dark:border-red-800 dark:text-red-500',
  rejected: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
};

export default function BookingCalendarView() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

        const res = await bookingService.getAll({
          startDate,
          endDate,
          limit: 100,
        });
        setBookings(res.data?.bookings || res.data || res.bookings || []);
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();

    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        isToday:
          today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === i,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const dateStr = date.toDateString();
      return start.toDateString() === dateStr || end.toDateString() === dateStr ||
        (start <= date && end >= date);
    });
  };

  const navigatePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else {
        d.setDate(d.getDate() - 7);
      }
      return d;
    });
  };

  const navigateNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else {
        d.setDate(d.getDate() + 7);
      }
      return d;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) return <LoadingSpinner centered />;

  return (
    <div>
      <PageHeader
        title="Booking Calendar"
        subtitle="View all bookings in calendar format"
        icon={Calendar}
      >
        <button onClick={() => navigate('/bookings')} className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={navigatePrev} className="btn btn-ghost btn-sm">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
              {viewMode === 'month'
                ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `Week of ${formatDate(weekDays[0], 'MMM dd, yyyy')}`}
            </h2>
            <button onClick={navigateNext} className="btn btn-ghost btn-sm">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={goToToday} className="btn btn-secondary btn-sm">
              Today
            </button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <div>
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayBookings = getBookingsForDate(day.date);
                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-800 ${
                      !day.isCurrentMonth
                        ? 'bg-gray-50/50 dark:bg-gray-900/30'
                        : 'bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          day.isToday
                            ? 'bg-primary-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                            : day.isCurrentMonth
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {day.date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          className={`w-full text-left px-2 py-1 text-[10px] font-medium rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${
                            STATUS_COLORS[booking.status] || STATUS_COLORS.pending
                          }`}
                          title={`${booking.resourceName || booking.asset?.name || 'Booking'} - ${booking.purpose || ''}`}
                        >
                          {booking.resourceName || booking.asset?.name || 'Booking'}
                        </button>
                      ))}
                      {dayBookings.length > 3 && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 px-2">
                          +{dayBookings.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    className={`px-2 py-3 text-center border-r border-gray-100 dark:border-gray-800 last:border-r-0 ${
                      isToday ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {DAYS[day.getDay()]}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        isToday
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((day, idx) => {
                const dayBookings = getBookingsForDate(day.date);
                return (
                  <div
                    key={idx}
                    className="p-2 border-r border-gray-100 dark:border-gray-800 last:border-r-0"
                  >
                    <div className="space-y-1">
                      {dayBookings.map((booking) => {
                        const start = new Date(booking.startDate);
                        const end = new Date(booking.endDate);
                        const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                        const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                        return (
                          <button
                            key={booking.id}
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            className={`w-full text-left px-2 py-2 text-xs rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                              STATUS_COLORS[booking.status] || STATUS_COLORS.pending
                            }`}
                          >
                            <p className="font-semibold truncate">
                              {booking.resourceName || booking.asset?.name || 'Booking'}
                            </p>
                            <p className="flex items-center gap-1 mt-0.5 opacity-75">
                              <Clock className="h-3 w-3" />
                              {startTime} - {endTime}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Legend:</span>
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm border ${colors}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 w-80 card p-4 shadow-xl z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {selectedBooking.resourceName || selectedBooking.asset?.name}
            </h4>
            <button
              onClick={() => setSelectedBooking(null)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              &times;
            </button>
          </div>
          <StatusBadge status={selectedBooking.status} />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {selectedBooking.purpose}
          </p>
          <button
            onClick={() => navigate(`/bookings/${selectedBooking.id}`)}
            className="btn btn-primary btn-sm w-full mt-3"
          >
            View Details
          </button>
        </motion.div>
      )}
    </div>
  );
}
