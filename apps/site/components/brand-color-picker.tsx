'use client';

import { useEffect } from 'react';
import {
  ColorArea,
  EyeDropperButton,
  HueSlider,
  OKLCHInputs,
  useColorState,
} from 'chromakit-react';

/**
 * The brand colour control for the theme builder.
 *
 * Composed from ChromaKit's primitives rather than its packaged ColorPicker,
 * so the surface is ours. ChromaKit is a dependency of the SITE, never of
 * @ir/ui — nobody building a product screen needs a colour picker, and a
 * design system that ships one has widened its public surface for a page that
 * exists to demo itself.
 *
 * OKLCH inputs are the reason this replaced <input type="color">. The ramp is
 * generated in OKLCH and its emphasis step is solved down until white text
 * passes, so picking in the same space makes that solve something you can
 * watch rather than read about. The OS colour dialog could show neither the
 * space nor the consequence, and did not follow the page's own theme — on a
 * page whose whole argument is that Picasso themes.
 */
export function BrandColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const { hsva, colorValue, updateColor, setFromString, startDrag, endDrag } = useColorState(
    value,
    (c) => onChange(c.hex.toUpperCase()),
    undefined,
    value,
  );

  /* Typing a hex in the builder's own field has to reach the canvas. */
  useEffect(() => {
    if (colorValue.hex.toUpperCase() !== value.toUpperCase()) setFromString(value);
    // setFromString is stable; re-running on it would loop.
  }, [value]);

  return (
    <div className="space-y-2.5">
      <ColorArea
        hsva={hsva}
        onChange={updateColor}
        onStart={startDrag}
        onEnd={endDrag}
        height={140}
        className="w-full"
      />
      <HueSlider hsva={hsva} onChange={updateColor} onStart={startDrag} onEnd={endDrag} />

      <div className="flex items-center gap-2">
        <EyeDropperButton onPick={(hex) => onChange(hex.toUpperCase())} label="Pick from screen" />
        <p className="text-xs text-fd-muted-foreground">
          Lightness is solved down until white text passes — watch <span className="font-mono">L</span>.
        </p>
      </div>

      <OKLCHInputs colorValue={colorValue} onChange={(s) => setFromString(s)} />
    </div>
  );
}
