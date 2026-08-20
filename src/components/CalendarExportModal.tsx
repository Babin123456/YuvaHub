import React, { useState } from 'react';
import { Calendar, Download, ExternalLink, X, Check, Clock, Globe } from 'lucide-react';
import {
  CalendarEventPayload,
  downloadIcsFile,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildYahooCalendarUrl,
} from '../utils/calendarExport';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  deadline: string;
  category?: string;
  sourceUrl?: string;
  location?: string;
  description?: string;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  title,
  deadline,
  category,
  sourceUrl,
  location,
  description,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  // Attempt to parse deadline date
  const parsedDate = new Date(deadline);
  const isValidDate = !isNaN(parsedDate.getTime());
  const eventDate = isValidDate ? parsedDate : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const eventPayload: CalendarEventPayload = {
    title: `[YuvaHub Deadline] ${title}`,
    description: description || `Application deadline for ${title} (${category || 'Opportunity'}).\n\nApply via YuvaHub or direct link: ${sourceUrl || window.location.href}`,
    location: location || 'Online / Remote',
    url: sourceUrl || window.location.href,
    startDate: eventDate,
    endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour event
    allDay: false,
  };

  const handleIcsDownload = () => {
    downloadIcsFile(eventPayload);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Add to Calendar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opportunity Context */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50 mb-5">
          <h4 className="text-sm font-medium text-slate-200 line-clamp-1">{title}</h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {isValidDate ? eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : deadline}
            </span>
            {category && (
              <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Native iCal / Apple / Outlook file download */}
          <button
            onClick={handleIcsDownload}
            className="w-full flex items-center justify-between px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20 group"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-indigo-200 group-hover:-translate-y-0.5 transition-transform" />
              <span>{downloaded ? 'Downloaded .ics File!' : 'Download iCal / Apple (.ics)'}</span>
            </div>
            {downloaded && <Check className="w-4 h-4 text-emerald-300" />}
          </button>

          {/* Google Calendar */}
          <a
            href={buildGoogleCalendarUrl(eventPayload)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-medium text-slate-200 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Google Calendar</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Microsoft Outlook 365 */}
          <a
            href={buildOutlookCalendarUrl(eventPayload)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-medium text-slate-200 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Microsoft Outlook / 365</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Yahoo Calendar */}
          <a
            href={buildYahooCalendarUrl(eventPayload)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-medium text-slate-200 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Yahoo Calendar</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </a>
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-400 text-center mt-5">
          Exports include automated 1-day and 2-hour reminder alerts.
        </p>
      </div>
    </div>
  );
};
