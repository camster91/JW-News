import { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Check } from 'lucide-react';
import useProgressStore from '../stores/progressStore';

function DailyTextCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  const { isDailyTextRead, markDailyTextRead } = useProgressStore();
  const isRead = isDailyTextRead(today);

  // Sample daily text data - in production, fetch from API
  const dailyText = {
    date: todayFormatted,
    scripture: 'Zephaniah 2:3',
    theme: 'Keep Seeking Jehovah',
    text: 'Seek Jehovah, all you meek ones of the earth, who observe his righteous decrees. Seek righteousness, seek meekness. Probably you will be concealed on the day of Jehovah's anger.',
    comment: 'In these critical times, it is more important than ever to seek Jehovah through prayer, Bible study, and association with fellow believers. By cultivating meekness and righteousness, we prepare ourselves for Jehovah\'s day.'
  };

  const handleMarkRead = () => {
    markDailyTextRead(today);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="card-title text-lg">Daily Text</h2>
          </div>
          {isRead && (
            <div className="badge badge-success gap-2">
              <Check className="w-4 h-4" />
              Read
            </div>
          )}
        </div>

        <p className="text-sm text-base-content/70">{dailyText.date}</p>

        <div className="divider my-2"></div>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-primary">"{dailyText.theme}"</p>
            <p className="text-sm italic">— {dailyText.scripture}</p>
          </div>

          {isExpanded && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm">{dailyText.text}</p>
              <p className="text-sm text-base-content/80">{dailyText.comment}</p>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-ghost btn-sm w-full"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        </div>

        <div className="card-actions justify-end mt-4">
          {!isRead && (
            <button
              onClick={handleMarkRead}
              className="btn btn-primary btn-sm"
            >
              <Check className="w-4 h-4" />
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyTextCard;
