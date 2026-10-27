// Maquette filaire d'un bâtiment qui se dessine (laptop seulement, décor : aucun contenu).
// Projection isométrique calculée ici pour ne pas figer des dizaines de coordonnées à la main.

interface IStroke {
  d: string;
  accent?: boolean;
}

const SCALE = 50;
const ORIGIN_X = 230;
const ORIGIN_Y = 300;
const WIDTH = 6;
const DEPTH = 4;
const FLOORS = 4;
const FLOOR_HEIGHT = 1.1;
const COLUMNS_X = [0, 2, 4, 6] as const;
const COLUMNS_Y = [0, 4] as const;
const RISER = { x: 3, y: 2 } as const;
const RING_FLOOR = 2;

const project = (x: number, y: number, z: number): [number, number] => [
  ORIGIN_X + (x - y) * 0.866 * SCALE,
  ORIGIN_Y + (x + y) * 0.5 * SCALE - z * FLOOR_HEIGHT * SCALE,
];

const point = ([px, py]: [number, number]): string =>
  `${px.toFixed(1)} ${py.toFixed(1)}`;
const line = (a: [number, number], b: [number, number]): string =>
  `M${point(a)}L${point(b)}`;

export function buildStrokes(): IStroke[] {
  const strokes: IStroke[] = [];

  for (let level = 0; level <= FLOORS; level += 1) {
    const corners = [
      project(0, 0, level),
      project(WIDTH, 0, level),
      project(WIDTH, DEPTH, level),
      project(0, DEPTH, level),
    ];
    strokes.push({ d: `M${corners.map(point).join("L")}Z` });
    for (const x of COLUMNS_X.slice(1, -1)) {
      strokes.push({ d: line(project(x, 0, level), project(x, DEPTH, level)) });
    }
  }

  for (const x of COLUMNS_X) {
    for (const y of COLUMNS_Y) {
      strokes.push({ d: line(project(x, y, 0), project(x, y, FLOORS)) });
    }
  }

  strokes.push({
    d: line(project(RISER.x, RISER.y, 0), project(RISER.x, RISER.y, FLOORS)),
    accent: true,
  });
  strokes.push({
    d: line(
      project(RISER.x, RISER.y, RING_FLOOR - 0.5),
      project(WIDTH, RISER.y, RING_FLOOR - 0.5),
    ),
    accent: true,
  });
  return strokes;
}

const STROKES = buildStrokes();
const [RING_X, RING_Y] = project(RISER.x, RISER.y, RING_FLOOR);

export default function WireframeBuilding() {
  return (
    <svg
      className="wire"
      viewBox="0 0 540 600"
      aria-hidden="true"
      focusable="false"
    >
      {STROKES.map((stroke, index) => (
        <path
          key={stroke.d}
          d={stroke.d}
          pathLength={1}
          className={stroke.accent ? "wire-line wire-accent" : "wire-line"}
          style={{ ["--i" as string]: index }}
        />
      ))}
      <ellipse className="wire-ring" cx={RING_X} cy={RING_Y} rx="26" ry="15" />
    </svg>
  );
}
