import dataStore from '@/lib/data_store';
import useGlobalAppStore from '@/lib/timeline_state';
import {
  ChevronsRightLeft,
  ChevronsLeft,
  Pause,
  Play,
  ChevronsRight,
  Square,
  Save,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

type Props = {
  audioUrl: string;
  isSaving: boolean;
  editorRef: React.RefObject<HTMLDivElement>;
  onSaveButtonClicked: () => Promise<void>;
  onCloseButtonClicked: () => void;
};

export default function AudioControlComponent({
  audioUrl,
  editorRef,
  onSaveButtonClicked,
  isSaving,
  onCloseButtonClicked
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNotLoaded, setIsNotLoaded] = useState(true);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const playControlsBarRef = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [playin, setIsPlayin] = useState(false);
  const [widthToForce, setWidthToForce] = useState<number | null>(null);
  const isKeyboardGestureEnabled = useGlobalAppStore(
    (state) => state.appSettings.isKeyboardGestureEnabled
  );
  const updateDuration = useGlobalAppStore((state) => state.updateAudioDuration);
  const timelinePixelFactor = useGlobalAppStore((state) => state.appSettings.timelinePixelFactor);
  const regionsRef = useRef(RegionsPlugin.create());

  useEffect(() => {
    if (containerRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#ddd',
        progressColor: 'red',
        cursorColor: 'transparent',
        barWidth: 2,
        dragToSeek: true,
        url: audioUrl,
        barHeight: 1,
        plugins: [
          Hover.create({
            lineColor: 'red',
            lineWidth: 1,
            labelBackground: 'rgb(21,21,21)',
            labelColor: '#fff',
            labelSize: '12px'
          }),
          TimelinePlugin.create({
            timeInterval: 0.2,
            primaryLabelInterval: 5,
            secondaryLabelInterval: 1,
            style: {
              fontSize: '12px',
              color: '#fff'
            }
          }),
          regionsRef.current
        ]
      });

      waveSurferRef.current.on('pause', () => setIsPlayin(false));
      waveSurferRef.current.on('play', () => setIsPlayin(true));
      waveSurferRef.current.on('ready', () => {
        dataStore.set('isAudioLoaded', true);
        const audioDurationInSecs = waveSurferRef.current!.getDuration();
        setWidthToForce(audioDurationInSecs * timelinePixelFactor);
        dataStore.set('currentAudioDurationInMilis', audioDurationInSecs * 1000);
        updateDuration(audioDurationInSecs * 1000);
        dataStore.set('audioSrc', audioUrl);
        setTimeout(() => setIsNotLoaded(false), 180);
      });
      waveSurferRef.current.on('timeupdate', () => {
        const currentTimeInMilis = waveSurferRef.current!.getCurrentTime() * 1000;
        dataStore.set('currentAudioPositionInMilis', currentTimeInMilis);
        const playingIndicator = document.querySelector('#playing_indicator');
        playingIndicator?.setAttribute(
          'style',
          `margin-left: ${(currentTimeInMilis / 1000) * timelinePixelFactor}px`
        );
        const storePlaybackRate = dataStore.get('playbackSpeed') as number;
        if (storePlaybackRate !== waveSurferRef.current?.getPlaybackRate()) {
          waveSurferRef.current?.setPlaybackRate(storePlaybackRate, true);
        }
      });

      // Loop feature via Regions
      const defaultLoopRegionColor = `rgba(255,255,255,0.4)`;
      const regionActiveColor = `rgba(255,255,255,0.6)`;
      waveSurferRef.current.on('dblclick', (relativeX: number) => {
        const clikedOnPositionInSeconds = relativeX * (waveSurferRef.current?.getDuration() ?? 0);
        regionsRef.current.addRegion({
          start: clikedOnPositionInSeconds,
          end: clikedOnPositionInSeconds + 2,
          content: `Loop ${regionsRef.current.getRegions().length + 1} `,
          color: defaultLoopRegionColor,
          resize: true,
          drag: true
        });
      });
      {
        // @ts-expect-error type not defined but it's a thing chill.
        let activeRegion = null;
        const loop = true;
        regionsRef.current.on('region-in', (region) => {
          activeRegion = region;
        });
        regionsRef.current.on('region-out', (region) => {
          // @ts-expect-error worry not, works
          if (activeRegion === region) {
            if (loop) {
              region.play();
            } else {
              activeRegion = null;
            }
          }
        });
        // Play loop region on click, set to active color
        regionsRef.current.on('region-clicked', (region, e) => {
          e.stopPropagation(); // prevent triggering a click on the waveform
          activeRegion = region;
          region.play();

          region.setOptions({
            color: regionActiveColor
          });
        });
        // Remove region on double click
        regionsRef.current.on('region-double-clicked', (region, e) => {
          e.stopPropagation(); // prevent triggering a click on the waveform
          try {
            // to ignore warning issued by strict mode TODO: Handle it for realz
            region.remove();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // console.log("Info: Loop Removed");
          }
          activeRegion = null;
        });
        // Reset the active region when the user clicks anywhere in the waveform
        waveSurferRef.current.on('interaction', () => {
          activeRegion = null;
        });
      }

      return () => {
        waveSurferRef.current?.destroy();
        waveSurferRef.current?.unAll();
        setIsNotLoaded(true);
      };
    }
  }, [audioUrl]);
  
  useEffect(() => {
    function onSpaceKeyPress(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        waveSurferRef.current?.playPause();
      }
    }
    if (isKeyboardGestureEnabled) {
      window.addEventListener('keypress', onSpaceKeyPress);
    }
    return () => window.removeEventListener('keypress', onSpaceKeyPress);
  }, [isKeyboardGestureEnabled]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <AudioControls />
      {isNotLoaded && (
        <div
          className="flex z-20 space-x-20 top-[16%] dark:invert transition-all duration-300"
          id="loader-debug"
          style={{
            position: 'fixed',
            top:
              window.screen.width >= 1920
                ? ''
                : scrollY > window.innerHeight / 2
                ? `40px`
                : `calc(57% - ${scrollY + 5}px)`,
            left: '50%',
            transform: 'translateX(-50%)',
            transition: 'top 0.3s ease'
          }}
        >
          <span className="sr-only">Loading...</span>
          <div className="h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-8 w-8  bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-8 w-8  bg-white rounded-full animate-bounce"></div>
          <div className="h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        </div>
      )}
      <div
        ref={containerRef}
        className="mt-[60px] bg-black"
        style={{
          width: `${widthToForce != 0 ? `${widthToForce}px` : ''}`,
          height: 'calc(10%)',
          opacity: isNotLoaded ? 0 : 1
        }}
        onClick={() => {
          const currentTime = waveSurferRef.current?.getCurrentTime() ?? 0;
          editorRef.current?.scrollTo({
            left: currentTime * timelinePixelFactor - window.innerWidth / 2,
            behavior: 'smooth'
          });
        }}
      />
    </>
  );

  function AudioControls() {
    const player = waveSurferRef.current;
    if (!player) return <></>;

    function handlePlayPause() {
      player!.playPause();
    }

    function goToStart(): void {
      editorRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      player?.seekTo(0);
    }

    function goToEnd(): void {
      const duration = player?.getDuration() ?? 0;
      editorRef.current?.scrollTo({
        left: duration * timelinePixelFactor,
        behavior: 'smooth'
      });
      player?.seekTo(0.96);
    }

    function goToMiddle(): void {
      const duration = player?.getDuration() ?? 0;
      editorRef.current?.scrollTo({
        left: (duration / 2) * timelinePixelFactor - window.innerWidth / 2,
        behavior: 'smooth'
      });
      player?.seekTo(0.5);
    }

    return (
      <div
        ref={playControlsBarRef}
        className={`w-96 fixed left-3 flex justify-evenly items-center border rounded-lg border-white p-4 bg-[#111111] z-[15] max-w-[2280px] ${
          playin ? 'animate-pulse' : ''
        }  hover:shadow-[0px_0px_10px_1px_#777777]`}
      >
        <button onClick={() => player.stop()} title={'Stop'} aria-label="Stop audio button">
          <Square />
        </button>
        <button onClick={goToMiddle} title="Jump to middle">
          <ChevronsRightLeft />
        </button>
        <button onClick={goToStart} title="Jump to start">
          <ChevronsLeft />
        </button>
        <button
          onClick={handlePlayPause}
          title={'Play / Pause'}
          aria-label="Toggle play or pause button"
        >
          {playin ? <Pause /> : <Play />}
        </button>
        <button onClick={goToEnd} title="Jump to end">
          <ChevronsRight />
        </button>
        <button
          title={'Save audio'}
          aria-label="save audio button"
          className={isSaving ? 'cursor-not-allowed' : ''}
          onClick={onSaveButtonClicked}
        >
          <Save />
        </button>
        <button
          onClick={() => {
            onCloseButtonClicked();
            dataStore.set('audioSrc', undefined);
            player.destroy();
          }}
          title={'Close audio'}
          aria-label="close audio button"
        >
          <X />
        </button>
      </div>
    );
  }
}