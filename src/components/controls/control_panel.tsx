import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import InstructionComponent from '../timeline/instructions';
import {
  Copy,
  Clipboard,
  Trash,
  SquareDashedMousePointer,
  SquarePlus,
  DiamondPlus,
  CirclePlus,
  UndoDot,
  RedoDot,
  Scissors,
  TextCursorInput
} from 'lucide-react';
import useGlobalAppStore, { useTemporalStore } from '@/lib/timeline_state';
import { kAppName, kAppVersion } from '@/lib/consts';
import { useRef, useState } from 'react';
import SettingsPanel from './settings_panel';
import MoreMenuButton from './more_menu_button';
import dataStore from '@/lib/data_store';

export default function MainTopPanel({
  isSaving,
  isAudioLoaded
}: {
  isSaving: boolean;
  isAudioLoaded: boolean;
}) {
  const copyItems = useGlobalAppStore((state) => state.copyItems);
  const cutItems = useGlobalAppStore((state) => state.cutItems);
  const pasteItems = useGlobalAppStore((state) => state.pasteItems);
  const selectAllItems = useGlobalAppStore((state) => state.selectAll);
  const selectInCurrentPosition = useGlobalAppStore((state) => state.selectInCurrentPosition);
  const removeSelectedItem = useGlobalAppStore((state) => state.removeSelectedItem);
  const currentDevice = useGlobalAppStore((state) => state.phoneModel);
  const fillEntireZone = useGlobalAppStore((state) => state.fillEntireZone);
  const addItem = useGlobalAppStore((state) => state.addItem);
  const { undo, redo, futureStates, pastStates } = useTemporalStore((state) => state);

  function getPosition(): number {
    return dataStore.get('currentAudioPositionInMilis') ?? 0;
  }

  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [showEasterEgg, setShowEasterEgg] = useState<boolean>(false);
  const toggleEasterEgg = () => setShowEasterEgg((v) => !v);

  const deviceControlsToShow = generateDeviceControls();
  return (
    <div className={`rounded-lg p-2 overflow-clip z-30 ${currentDevice === 'NP2' ? 'gap-2' : 'gap-[5%]'}`}>
      <TitleAndControlsPanel />
    </div>
  );

  function TitleAndControlsPanel({ className }: { className?: string }) {
    return (
      <div className={`flex flex-col justify-between bg-[#111111] p-4 rounded-md outline outline-[#212121] hover:shadow-[0px_0px_5px_1px_#ffffff] duration-500 overflow-visible ${className}`}>
        <div className="space-y-2 flex flex-row items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">
            <AppNameComponent playing={showEasterEgg} />
            <span className="animate-pulse duration-700 text-red-600">
              {isSaving ? '[Saving...]' : ''}
            </span>
          </h2>
          <OpenInstructionButton />
        </div>
        {isAudioLoaded && (
          <div className="space-y-3 grid grid-row-2">
            <CommandCenter />
            <div className="grid grid-flow-col border border-white rounded-lg" title="Macro Buttons - Eases New Glyph Block Addition">
              {deviceControlsToShow}
            </div>
          </div>
        )}
      </div>
    );
  }

  function generateDeviceControls() {
    const controls: JSX.Element[] = [];
    const addControl = (label: string, start: number, end?: number) => {
      controls.push(
        <Button
          variant="ghost"
          onClick={() => {
            const startTimeMilis = getPosition();
            end !== undefined ? fillEntireZone(start, end, startTimeMilis) : addItem(start, startTimeMilis);
          }}
        >
          {label}
        </Button>
      );
    };

    switch (currentDevice) {
      case 'NP1':
        for (let i = 0; i < 5; i++) addControl((i + 1).toString(), i);
        break;
      case 'NP1_15':
        for (let i = 0; i < 6; i++) addControl((i + 1).toString(), i);
        addControl('3.1', 4);
        addControl('3.2', 5);
        addControl('3.3', 2);
        addControl('3.4', 3);
        addControl('4', 7, 14);
        addControl('4.1', 7, 8);
        addControl('4.2', 9, 11);
        addControl('4.3', 12, 14);
        addControl('5', 6);
        break;
      case 'NP2':
        for (let i = 0; i < 15; i++) addControl((i + 1).toString(), i);
        addControl('4', 3, 7);
        addControl('5', 8, 14);
        addControl('6', 15, 18);
        addControl('7', 19);
        addControl('8', 20);
        addControl('9', 21);
        addControl('10', 22);
        addControl('11', 23);
        addControl('12', 25, 27);
        addControl('13', 28, 30);
        addControl('14', 31, 32);
        addControl('15', 24);
        break;
      case 'NP2a':
        addControl('1', 0, 23);
        addControl('1.1', 0, 7);
        addControl('1.2', 8, 15);
        addControl('1.3', 16, 23);
        addControl('2', 24);
        addControl('3', 25);
        break;
      default:
        return <></>;
    }
    return controls;
  }

  function CommandCenter() {
    return (
      <div className="border rounded-lg border-white grid grid-flow-col">
        <Button variant="ghost" onClick={copyItems} title={'Copy'} aria-label="copy button">
          <Copy />
        </Button>
        <Button variant="ghost" onClick={cutItems} title={'Cut'} aria-label="cut button">
          <Scissors />
        </Button>
        <Button variant="ghost" onClick={pasteItems} title={'Paste'} aria-label="paste button">
          <Clipboard />
        </Button>
        <Button variant="ghost" onClick={removeSelectedItem} title={'Delete Selected'} aria-label="delete button">
          <Trash />
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            selectAllItems(selectAll);
            setSelectAll((v) => !v);
          }}
          title={'Select / Unselect All'}
          aria-label="select or unselect all button"
        >
          <SquareDashedMousePointer />
        </Button>
        <Button
          variant="ghost"
          onClick={selectInCurrentPosition}
          title={'Select / Unselect All Blocks at Current Audio Position; Shortcut Keys: Ctrl + Alt/Option + A'}
          aria-label="select items in current audio position"
        >
          <TextCursorInput />
        </Button>
        <Button
          variant="ghost"
          title="Undo Changes"
          disabled={pastStates.length <= 0}
          onClick={() => {
            undo();
            undo();
          }}
        >
          <UndoDot />
        </Button>
        <Button
          variant="ghost"
          title="Redo Changes"
          disabled={futureStates.length <= 0}
          onClick={() => {
            redo();
            redo();
          }}
        >
          <RedoDot />
        </Button>
        {currentDevice === 'NP1' && (
          <Button
            variant="ghost"
            title="Add all the Glyphs of NP(1)"
            onClick={() => {
              const startTimeMilis = getPosition();
              fillEntireZone(0, 4, startTimeMilis);
            }}
          >
            <SquarePlus />
          </Button>
        )}
        {currentDevice === 'NP1_15' && (
          <Button
            variant="ghost"
            title="Add all the Glyphs of NP(1) | 15 Zone Mode"
            onClick={() => {
              const startTimeMilis = getPosition();
              fillEntireZone(0, 14, startTimeMilis);
            }}
          >
            <SquarePlus />
          </Button>
        )}
        {currentDevice === 'NP2' && (
          <>
            <Button
              variant="ghost"
              title="Add all the Glyphs of NP(2)"
              onClick={() => {
                const startTimeMilis = getPosition();
                fillEntireZone(0, 32, startTimeMilis);
              }}
            >
              <SquarePlus />
            </Button>
            <Button
              variant="ghost"
              title="Fill the Top Right Glyph Zone of NP(2)"
              onClick={() => {
                const startTimeMilis = getPosition();
                fillEntireZone(3, 18, startTimeMilis);
              }}
            >
              <DiamondPlus />
            </Button>
            <Button
              variant="ghost"
              title="Fill the Battery Glyph Zone of NP(2)"
              onClick={() => {
                const startTimeMilis = getPosition();
                fillEntireZone(25, 32, startTimeMilis);
              }}
            >
              <CirclePlus />
            </Button>
          </>
        )}
        {currentDevice === 'NP2a' && (
          <Button
            variant="ghost"
            title="Add all the Glyphs of NP(1) | 15 Zone Mode"
            onClick={() => {
              const startTimeMilis = getPosition();
              fillEntireZone(0, 25, startTimeMilis);
            }}
          >
            <SquarePlus />
          </Button>
        )}
        <MoreMenuButton />
      </div>
    );
  }
}

export function OpenInstructionButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="left-0 w-[120px]" variant="link" title="Open instructions">
          Read Instructions
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[400px] sm:min-w-[400px] md:min-w-[900px] h-[450px] md:h-fit">
        <InstructionComponent />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit">Ok</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AppNameComponent({ playing }: { playing: boolean }) {
  const kAppNameParts = kAppName.split(' ');
  const spanRef = useRef<HTMLSpanElement>(null);
  return (
    <span
      className={`${playing ? 'neon' : ''} font-[ndot] tracking-wider uppercase`}
      ref={spanRef}
      onMouseLeave={() => {
        if (spanRef.current) {
          spanRef.current.style.textShadow = '';
        }
      }}
      onMouseEnter={() => {
        if (spanRef.current) {
          spanRef.current.style.textShadow = '#fff 4px 0 20px';
        }
      }}
    >
      <span className={`${playing ? 'flicker-vslow' : ''}`}>{kAppNameParts[0]} </span>
      {kAppNameParts[1]}{' '}
      <span className={`${playing ? 'flicker-slow' : ''}`}> {kAppNameParts[2]} </span>
      {kAppNameParts[3]}{' '}
      <span className={`${playing ? 'flicker-fast' : ''}`}>{kAppNameParts[4]}</span>
    </span>
  );
}