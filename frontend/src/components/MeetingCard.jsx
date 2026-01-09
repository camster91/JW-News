import { useState } from 'react';
import { Calendar, Check, Clock, ExternalLink } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import useProgressStore from '../stores/progressStore';

function MeetingCard() {
  const [activeTab, setActiveTab] = useState('midweek');

  // Get current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekOf = format(weekStart, 'yyyy-MM-dd');

  // Get meeting dates
  const midweekDate = format(addDays(weekStart, 2), 'EEEE, MMMM d'); // Wednesday
  const weekendDate = format(addDays(weekStart, 5), 'EEEE, MMMM d'); // Saturday

  const { isMeetingPrepared, markMeetingPrepared } = useProgressStore();
  const isMidweekPrepared = isMeetingPrepared(weekOf, 'midweek');
  const isWeekendPrepared = isMeetingPrepared(weekOf, 'weekend');

  // Sample meeting data - in production, fetch from WOL API
  const meetingData = {
    midweek: {
      date: midweekDate,
      theme: 'Appreciating God\'s Mercy',
      bibleReading: 'Genesis 17-18',
      songs: [1, 25, 103],
      time: '7:00 PM'
    },
    weekend: {
      date: weekendDate,
      publicTalk: 'Why We Can Trust the Bible',
      watchtowerArticle: 'Love Bears All Things',
      paragraphs: 20,
      songs: [45, 72, 133],
      time: '5:00 PM'
    }
  };

  const handleMarkPrepared = (meetingType) => {
    markMeetingPrepared(weekOf, meetingType, 30); // 30 minutes study time
  };

  const getDaysUntilMeeting = (dayIndex) => {
    const today = new Date();
    const meetingDate = addDays(weekStart, dayIndex);
    const diffTime = meetingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const midweekDaysLeft = getDaysUntilMeeting(2);
  const weekendDaysLeft = getDaysUntilMeeting(5);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent" />
          <h2 className="card-title text-lg">This Week's Meetings</h2>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mt-4">
          <button
            className={`tab ${activeTab === 'midweek' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('midweek')}
          >
            📘 Midweek
            {isMidweekPrepared && <Check className="w-4 h-4 ml-1 text-success" />}
          </button>
          <button
            className={`tab ${activeTab === 'weekend' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('weekend')}
          >
            🗼 Weekend
            {isWeekendPrepared && <Check className="w-4 h-4 ml-1 text-success" />}
          </button>
        </div>

        <div className="divider my-2"></div>

        {/* Midweek Meeting */}
        {activeTab === 'midweek' && (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{meetingData.midweek.date}</p>
                <p className="text-sm text-base-content/70">{meetingData.midweek.time}</p>
              </div>
              {isMidweekPrepared ? (
                <div className="badge badge-success gap-2">
                  <Check className="w-4 h-4" />
                  Prepared
                </div>
              ) : midweekDaysLeft >= 0 ? (
                <div className="badge badge-warning">
                  <Clock className="w-3 h-3 mr-1" />
                  {midweekDaysLeft} days left
                </div>
              ) : (
                <div className="badge badge-error">Past</div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-accent">
                {meetingData.midweek.theme}
              </p>
              <p className="text-sm text-base-content/70 mt-1">
                Bible Reading: {meetingData.midweek.bibleReading}
              </p>
              <p className="text-sm text-base-content/70">
                Songs: {meetingData.midweek.songs.join(', ')}
              </p>
            </div>

            <a
              href={`https://wol.jw.org/en/wol/meetings/r1/lp-e/2026/2`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm w-full"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Schedule on WOL
            </a>

            {!isMidweekPrepared && (
              <button
                onClick={() => handleMarkPrepared('midweek')}
                className="btn btn-primary btn-sm w-full"
              >
                <Check className="w-4 h-4" />
                Mark as Prepared
              </button>
            )}
          </div>
        )}

        {/* Weekend Meeting */}
        {activeTab === 'weekend' && (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{meetingData.weekend.date}</p>
                <p className="text-sm text-base-content/70">{meetingData.weekend.time}</p>
              </div>
              {isWeekendPrepared ? (
                <div className="badge badge-success gap-2">
                  <Check className="w-4 h-4" />
                  Prepared
                </div>
              ) : weekendDaysLeft >= 0 ? (
                <div className="badge badge-warning">
                  <Clock className="w-3 h-3 mr-1" />
                  {weekendDaysLeft} days left
                </div>
              ) : (
                <div className="badge badge-error">Past</div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-base-content/60">Public Talk (30 min)</p>
                <p className="text-sm font-medium">{meetingData.weekend.publicTalk}</p>
              </div>

              <div>
                <p className="text-xs text-base-content/60">Watchtower Study (60 min)</p>
                <p className="text-sm font-medium text-accent">
                  {meetingData.weekend.watchtowerArticle}
                </p>
                <p className="text-xs text-base-content/70">
                  {meetingData.weekend.paragraphs} paragraphs
                </p>
              </div>

              <p className="text-sm text-base-content/70">
                Songs: {meetingData.weekend.songs.join(', ')}
              </p>
            </div>

            <a
              href={`https://wol.jw.org/en/wol/meetings/r1/lp-e/2026/2`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm w-full"
            >
              <ExternalLink className="w-4 h-4" />
              Read Watchtower Article
            </a>

            {!isWeekendPrepared && (
              <button
                onClick={() => handleMarkPrepared('weekend')}
                className="btn btn-primary btn-sm w-full"
              >
                <Check className="w-4 h-4" />
                Mark as Prepared
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingCard;
