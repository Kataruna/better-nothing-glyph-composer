import { calculateBeatDurationInMilis } from '@/lib/helpers';
import { useMemo } from 'react';

export default function BPMSnapGridLinesComponent({
  bpmValue,
  durationInMilis,
  timelinePixelFactor
}: {
  bpmValue: number;
  durationInMilis: number;
  timelinePixelFactor: number;
}) {
  const bpmSnapGridLines = useMemo(() => {
    const beatDurationInMilis = calculateBeatDurationInMilis(bpmValue);
    const gridWidth = (beatDurationInMilis / 1000) * timelinePixelFactor;
    const lines = [];

    for (let i = 0; i < durationInMilis; i += beatDurationInMilis) {
      lines.push(
        <div
          key={i}
          className="absolute h-full outline-dashed outline-[#333333] z-[10] pointer-events-none"
          style={{
            width: `${gridWidth}px`,
            left: `${(i / 1000) * timelinePixelFactor}px`
          }}
        ></div>
      );
    }

    return lines;
  }, [bpmValue, durationInMilis, timelinePixelFactor]);

  return <>{bpmSnapGridLines}</>;
}