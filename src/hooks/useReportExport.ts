import { useCallback, useRef } from 'react';
import * as htmlToImage from 'html-to-image';

type ReportType = 'day' | 'week';

interface UseReportExportOptions {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useReportExport({ onSuccess, onError }: UseReportExportOptions) {
  const dayReportRef = useRef<HTMLDivElement>(null);
  const weekReportRef = useRef<HTMLDivElement>(null);

  const generateReportImage = useCallback(
    async (type: ReportType, ref: React.RefObject<HTMLDivElement>) => {
      if (!ref.current) {
        return;
      }

      try {
        const dataUrl = await htmlToImage.toPng(ref.current, { backgroundColor: '#f9fafb' });
        if (window.electron?.writeImage) {
          await window.electron.writeImage(dataUrl);
        }

        const message =
          type === 'day'
            ? 'The daily summary was copied to clipboard.'
            : 'The weekly summary was copied to clipboard.';
        onSuccess(message);
      } catch (error) {
        const message =
          type === 'day'
            ? `Could not generate daily image: ${error}`
            : `Could not generate weekly image: ${error}`;
        onError(message);
      }
    },
    [onError, onSuccess],
  );

  const handleDayReport = useCallback(() => generateReportImage('day', dayReportRef), [generateReportImage]);
  const handleWeekReport = useCallback(() => generateReportImage('week', weekReportRef), [generateReportImage]);

  return {
    dayReportRef,
    weekReportRef,
    handleDayReport,
    handleWeekReport,
  };
}
