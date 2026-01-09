import { getDayOfYear } from 'date-fns';
import { Book, Check, ExternalLink, Clock } from 'lucide-react';
import useProgressStore from '../stores/progressStore';
import { getBibleReadingForDay, getEstimatedReadingTime, getWOLLink } from '../utils/bibleData';

function BibleReadingCard() {
  const dayOfYear = getDayOfYear(new Date());
  const { isBibleReadingComplete, markBibleReadingComplete } = useProgressStore();
  const isComplete = isBibleReadingComplete(dayOfYear);

  const reading = getBibleReadingForDay(dayOfYear);
  const estimatedTime = getEstimatedReadingTime(reading.chapters);
  const wolLink = getWOLLink(reading.chapters);

  const handleMarkComplete = () => {
    markBibleReadingComplete(dayOfYear);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-6 h-6 text-secondary" />
            <h2 className="card-title text-lg">Bible Reading</h2>
          </div>
          {isComplete && (
            <div className="badge badge-success gap-2">
              <Check className="w-4 h-4" />
              Complete
            </div>
          )}
        </div>

        <p className="text-sm text-base-content/70">Day {dayOfYear} of 365</p>

        <div className="divider my-2"></div>

        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold text-secondary">{reading.chapters}</p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-base-content/60" />
              <p className="text-sm text-base-content/70">~{estimatedTime} minutes</p>
            </div>
          </div>

          <a
            href={wolLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm w-full"
          >
            <ExternalLink className="w-4 h-4" />
            Open in WOL
          </a>
        </div>

        <div className="card-actions justify-end mt-4">
          {!isComplete && (
            <button
              onClick={handleMarkComplete}
              className="btn btn-secondary btn-sm"
            >
              <Check className="w-4 h-4" />
              Mark Complete
            </button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-base-content/60 mb-1">
            <span>Yearly Progress</span>
            <span>{Math.round((dayOfYear / 365) * 100)}%</span>
          </div>
          <progress
            className="progress progress-secondary w-full"
            value={dayOfYear}
            max="365"
          ></progress>
        </div>
      </div>
    </div>
  );
}

export default BibleReadingCard;
