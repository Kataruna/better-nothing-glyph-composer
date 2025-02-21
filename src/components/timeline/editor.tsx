import useGlobalAppStore from '@/lib/timeline_state';
import TimelineBlockComponent from './timelineBlocks';
import PlayingIndicator from './playingIndicator';
import dataStore from '@/lib/data_store';
import { GlyphBlock } from '@/lib/glyph_model';
import BPMSnapGridLinesComponent from './bpmGridLines';
import HeavyTimelineBlock from '@/logic/hc_tb';
import { useAreaSelection } from '@/lib/area_selection_helper';
import { useRef } from 'react';
import { SelectionContext } from '@/lib/area_select_context';

type Props = {
  timelineData: {
    [key: number]: GlyphBlock[];
  };
  editorRef: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
};

export function EditorComponent({
  timelineData,
  children,
  editorRef
}: Props) {
  const addItem = useGlobalAppStore((state) => state.addItem);
  const bpmValue = useGlobalAppStore((state) => state.appSettings.bpmValue);
  const snapToBpmActive = useGlobalAppStore((state) => state.appSettings.snapToBpmActive);
  const isZoneVisible = useGlobalAppStore((state) => state.appSettings.isZoneVisible);
  const durationInMilis = useGlobalAppStore((state) => state.audioInformation.durationInMilis);
  const itemsSchema = useGlobalAppStore((state) => state.items);
  const numberOfRowsToGenerate = Object.keys(itemsSchema).length;
  const timelinePixelFactor = useGlobalAppStore((state) => state.appSettings.timelinePixelFactor);
  const showHeavyUi = useGlobalAppStore((state) => state.appSettings.showHeavyUi);
  const updateHoveredGlyphZone = useGlobalAppStore((state) => state.updateHoveredGlyphZone);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollX = e.currentTarget.scrollLeft;
    dataStore.set('editorScrollX', scrollX);
    if (!isZoneVisible) return;
    const labels = document.querySelectorAll<HTMLDivElement>('.glyph_label');
    labels.forEach((label) => {
      label.style.left = `${scrollX}px`;
      label.style.borderRadius = `12px 0 0 12px`;
    });
  };

  const selectContainerRef = useRef<HTMLDivElement | null>(null);
  const selection = useAreaSelection({ container: selectContainerRef });

  return (
    <div className="overflow-auto" ref={editorRef} onScroll={handleScroll}>
      <div className="flex flex-col overflow-y-hidden flex-grow min-w-max relative bg-black">
        {children}
        <PlayingIndicator />
        {snapToBpmActive && (
          <BPMSnapGridLinesComponent
            bpmValue={bpmValue}
            durationInMilis={durationInMilis}
            timelinePixelFactor={timelinePixelFactor}
          />
        )}
        <SelectionContext.Provider value={selection}>
          <div ref={selectContainerRef} className="h-[25rem] overflow-auto">
            {TimelineRows()}
          </div>
        </SelectionContext.Provider>
      </div>
    </div>
  );

  function TimelineRows() {
    const timelineRows: React.ReactNode[] = [];

    for (let i = 0; i < numberOfRowsToGenerate; i++) {
      timelineRows.push(
        <div
          key={i}
          title="Double tap to add a new glyph block"
          className="relative select-none min-h-[40px] border-dotted border-[#333] border-t-2 hover:border-[#939393] hover:border-y-2"
          onMouseEnter={() => updateHoveredGlyphZone(i)}
          onMouseLeave={() => updateHoveredGlyphZone(null)}
          onDoubleClick={(e) => {
            e.preventDefault();
            const scrollValue: number = dataStore.get('editorScrollX') ?? 0;
            addItem(
              i,
              ((e.clientX + scrollValue) / timelinePixelFactor) * 1000
            );
          }}
        >
          {isZoneVisible && (
            <div
              className="z-10 w-[10px] h-[15px] text-white text-xl rounded-l-[12px] pl-6 font-[ndot] mt-1 glyph_label duration-75 select-none pointer-events-none"
              style={{
                mixBlendMode: 'difference',
                position: 'absolute',
                left: 0
              }}
            >
              <div>{i + 1}</div>
            </div>
          )}
          <TimelineBlocks
            showHeavyUi={showHeavyUi}
            rowTimelineData={timelineData[i]}
            timelinePixelFactor={timelinePixelFactor}
          />
        </div>
      );
    }

    return timelineRows;
  }
}

const TimelineBlocks = ({
  rowTimelineData,
  timelinePixelFactor,
  showHeavyUi
}: {
  rowTimelineData: GlyphBlock[];
  timelinePixelFactor: number;
  showHeavyUi: boolean;
}) => {
  return (
    <>
      {rowTimelineData.map((block) => (
        <div
          key={block.id}
          className="h-full w-[50px] absolute inset-0 py-[4px]"
          style={{
            marginLeft: `${(block.startTimeMilis / 1000) * timelinePixelFactor}px`
          }}
        >
          {!showHeavyUi ? (
            <TimelineBlockComponent glyphItem={block} />
          ) : (
            <HeavyTimelineBlock glyphItem={block} />
          )}
        </div>
      ))}
    </>
  );
};