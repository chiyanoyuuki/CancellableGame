import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { Txt } from './ui';
import { colors, fontSize } from '../theme/theme';

export interface RadarAxis {
  /** Étiquette courte (ex. emoji du thème). */
  label: string;
  /** Valeur du joueur A, 0..1. */
  a: number;
  /** Valeur du joueur B, 0..1 (facultatif, pour la comparaison). */
  b?: number;
}

/**
 * Petit radar (toile d'araignée) rendu en SVG. Une ou deux séries (0..1) sur des
 * axes étiquetés. Sert au « radar de connaissances » par thème et à la
 * comparaison face-à-face.
 */
export function ThemeRadar(props: {
  axes: RadarAxis[];
  size?: number;
  colorA?: string;
  colorB?: string;
}) {
  const axes = props.axes;
  const size = props.size ?? 240;
  const colorA = props.colorA ?? colors.primary;
  const colorB = props.colorB ?? colors.accent;
  const n = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 26; // marge pour les étiquettes

  if (n < 3) {
    return (
      <Txt faint center size={fontSize.xs}>
        {/* moins de 3 axes : un radar n'a pas de sens */}
        —
      </Txt>
    );
  }

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, value: number) => {
    const v = Math.max(0, Math.min(1, value));
    return { x: cx + r * v * Math.cos(angle(i)), y: cy + r * v * Math.sin(angle(i)) };
  };
  const poly = (key: 'a' | 'b') =>
    axes
      .map((ax, i) => {
        const p = point(i, (ax[key] ?? 0) as number);
        return `${p.x},${p.y}`;
      })
      .join(' ');

  const hasB = axes.some((ax) => ax.b !== undefined);
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Toile de fond : anneaux + rayons */}
        {rings.map((rr) => (
          <Circle key={rr} cx={cx} cy={cy} r={r * rr} stroke={colors.border} strokeWidth={1} fill="none" />
        ))}
        {axes.map((_ax, i) => {
          const edge = point(i, 1);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={edge.x}
              y2={edge.y}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}
        {/* Série A */}
        <Polygon points={poly('a')} fill={colorA} fillOpacity={0.28} stroke={colorA} strokeWidth={2} />
        {/* Série B (comparaison) */}
        {hasB && <Polygon points={poly('b')} fill={colorB} fillOpacity={0.22} stroke={colorB} strokeWidth={2} />}
        {/* Étiquettes des axes */}
        {axes.map((ax, i) => {
          const lp = { x: cx + (r + 14) * Math.cos(angle(i)), y: cy + (r + 14) * Math.sin(angle(i)) };
          return (
            <SvgText
              key={`lbl-${i}`}
              x={lp.x}
              y={lp.y + 4}
              fontSize={13}
              fill={colors.textDim}
              textAnchor="middle"
            >
              {ax.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
