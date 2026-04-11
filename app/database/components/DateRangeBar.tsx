type DateRangeBarProps = {
  minPeakDate: string | null;
  maxPeakDate: string | null;
  rangeStartDate: string | null;
  rangeEndDate: string | null;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
};

export default function DateRangeBar({
  minPeakDate,
  maxPeakDate,
  rangeStartDate,
  rangeEndDate,
  setStartDate,
  setEndDate,
}: DateRangeBarProps) {
  if (!minPeakDate || !maxPeakDate) {
    return null;
  }

  return (
    <div
      className={
        'mt-[0.3rem] mb-[0.6rem] flex w-full flex-wrap items-center justify-between rounded-[10px] border border-black/8 bg-[#4288c9] px-[0.55rem] py-[0.28rem] text-[0.82rem] text-white shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
      }
    >
      <span>Select range within</span>
      <div className="flex flex-wrap items-center">
        <label
          htmlFor="peak-start-date"
          className="mx-[0.22rem] flex items-center"
        >
          <input
            id="peak-start-date"
            className={
              'w-[5.5rem] max-w-full appearance-none rounded-lg border-0 bg-transparent px-[0.25rem] py-[0.25rem] text-[0.82rem] font-semibold text-white outline-none focus:ring-0 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden'
            }
            type="date"
            min={minPeakDate ?? undefined}
            max={maxPeakDate ?? undefined}
            value={rangeStartDate ?? ''}
            aria-label="Peak start date"
            onChange={(event) => {
              setStartDate(event.target.value);
            }}
          />
        </label>
        <span className="text-white/80">-</span>
        <label
          htmlFor="peak-end-date"
          className="mx-[0.22rem] flex items-center"
        >
          <input
            id="peak-end-date"
            className={
              'w-[5.5rem] max-w-full appearance-none rounded-lg border-0 bg-transparent px-[0.25rem] py-[0.25rem] text-[0.82rem] font-semibold text-white outline-none focus:ring-0 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden'
            }
            type="date"
            min={minPeakDate ?? undefined}
            max={maxPeakDate ?? undefined}
            value={rangeEndDate ?? ''}
            aria-label="Peak end date"
            onChange={(event) => {
              setEndDate(event.target.value);
            }}
          />
        </label>
      </div>
    </div>
  );
}
