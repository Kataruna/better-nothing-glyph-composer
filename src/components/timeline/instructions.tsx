export default function InstructionComponent() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary font-[ndot] uppercase tracking-wide">
        Instructions
      </h2>
      <br />
      <pre className="text-muted-foreground text-wrap overflow-auto max-h-[40dvh] sm:max-h-[60dvh]">
        1. Double press to add a glyph block, or choose Glyph Zone numbers from top left panel to
        add to that zone. Choose the add all button to add all glyph blocks to the current time in audio.
        <br />
        2. Right-click and press delete to remove, or select a glyph block and then click the delete
        icon. Backspace or delete key press can also trigger delete for selected blocks!
        <br />
        3. Select a glyph block and press the handle on the right to adjust the length.
        <br />
        4. Drag a glyph block to change its position on the track.
        <br />
        5. Click on the white/red colored audio waveform bar to seek audio. Double click to add a
        loop. To resize, drag the left or right edge. Double click on it again to remove.
        <br />
        6. Right-click a glyph block to choose from one of many available effects.
        <br />
        7. Audio speed can be controlled from the settings panel on the top right, along with many
        other helpful settings.
        <br />
        8. Keyboard shortcuts are supported: press Spacebar to play/pause audio, Ctrl/Cmd + A to
        select all, Shift key can be used for multi-select, etc.
        <br /> <br />
        Extra Info:
        <br />- Don't miss out on watermarking your track. This option is available on the top left panel's 3 dot button on the right.
        <br />- To use generated audio on your phone, save the file, transfer it to your phone, then:
        <br />
        {'--->'} Open Glyph Composer
        <br />
        {'--->'} Select the 3 dash icon on the top left (if this isn't there, record a random song, it'll
        then appear)
        <br />
        {'--->'} Click the 3 dot icon on the top right
        <br />
        {'--->'} Select import and load the transferred audio file (If the file is long, it'll take
        time to import, be patient and try scrolling up, sometimes files get hidden up top on
        imports!)
        <br />
        {'>'} NOTE: Glyph brightness is also dependent on the Glyph brightness set from Phone settings,
        the phone won't allow going past this limit.
        <br />- Glyph Block - Indicates that the glyph light will be on for that amount of time
        <br />- Start by loading the audio file {'>.<'}
      </pre>
    </div>
  );
}