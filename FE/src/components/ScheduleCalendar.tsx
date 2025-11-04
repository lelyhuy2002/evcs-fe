'use client';

import { useState } from 'react';
import { Schedule } from '@/lib/api';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
  onDateClick?: (date: Date) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export default function ScheduleCalendar({ 
  schedules, 
  onScheduleClick,
  onDateClick 
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'approved': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'in_progress': return 'bg-green-100 border-green-300 text-green-800';
      case 'completed': return 'bg-gray-100 border-gray-300 text-gray-600';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-600';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  // Render week view
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
          <div key={day} className="text-center font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
        
        {/* Day cells */}
        {weekDates.map((date, index) => {
          const daySchedules = getSchedulesForDate(date);
          const today = isToday(date);
          
          return (
            <div
              key={index}
              onClick={() => onDateClick?.(date)}
              className={`min-h-[120px] border-2 rounded-xl p-2 cursor-pointer transition-all hover:shadow-md ${
                today 
                  ? 'bg-emerald-50 border-emerald-400' 
                  : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className={`text-sm font-semibold mb-2 ${today ? 'text-emerald-700' : 'text-gray-700'}`}>
                {date.getDate()}
              </div>
              
              {/* Schedules */}
              <div className="space-y-1">
                {daySchedules.slice(0, 3).map((schedule) => (
                  <div
                    key={schedule.scheduleId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleClick?.(schedule);
                    }}
                    className={`text-xs p-1.5 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-all ${getStatusColor(schedule.status)}`}
                    style={{ borderLeftColor: schedule.userColor || '#3b82f6' }}
                  >
                    <div className="font-semibold truncate">{schedule.userName}</div>
                    <div className="text-[10px] opacity-75">
                      {formatTime(schedule.startTime)}
                    </div>
                  </div>
                ))}
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{daySchedules.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const daySchedules = getSchedulesForDate(currentDate).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return (
      <div className="space-y-3">
        {daySchedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Không có lịch đặt xe</p>
            <p className="text-sm">Nhấn "Đặt lịch mới" để tạo lịch</p>
          </div>
        ) : (
          daySchedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              onClick={() => onScheduleClick?.(schedule)}
              className={`p-4 rounded-xl border-2 cursor-pointer hover:shadow-lg transition-all ${getStatusColor(schedule.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-1 h-16 rounded-full"
                    style={{ backgroundColor: schedule.userColor || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      <span className="font-bold text-lg">{schedule.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  {schedule.status}
                </span>
              </div>
              
              {schedule.purpose && (
                <p className="text-sm opacity-75 ml-5">{schedule.purpose}</p>
              )}
              
              <div className="mt-3 ml-5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-75">Nhóm: </span>
                  <span className="font-semibold">{schedule.groupName}</span>
                </div>
                <div>
                  <span className="opacity-75">Sở hữu: </span>
                  <span className="font-semibold">{schedule.ownershipPercentage}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {viewMode === 'week' && `Tuần ${Math.ceil(currentDate.getDate() / 7)} - ${currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`}
            {viewMode === 'day' && currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {viewMode === 'month' && currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day' 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tuần
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar content */}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
}
