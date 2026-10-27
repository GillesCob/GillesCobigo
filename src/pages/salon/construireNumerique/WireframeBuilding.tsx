// Maquette filaire d'un immeuble de bureaux (R+4) qui se dessine, laptop seulement, décor sans contenu.
// Projection isométrique calculée ici : x part vers le bas à droite, y vers le bas à gauche, z vers le haut.
// Faces visibles : x = WIDTH (à droite) et y = DEPTH (à gauche).

export type StrokeKind = "ground" | "back" | "structure" | "glass" | "accent";

export interface IStroke {
  d: string;
  kind: StrokeKind;
}

type Point3 = readonly [number, number, number];

const SCALE = 40;
const ORIGIN_X = 255;
const ORIGIN_Y = 300;
const FLOOR_HEIGHT = 1.15;
const WIDTH = 8;
const DEPTH = 6;
const BAY = 2;
const LEVELS = 5;
const MARGIN = 0.8;
const SLAB = 0.12;
const PARAPET = 0.22;
const WINDOW_INSET = 0.28;
const SILL = 0.28;
const HEAD = 0.78;
const CORE = { x0: 5, x1: 7, y0: 1, y1: 3, height: 0.9 } as const;
const CANOPY = { x0: 3, x1: 5, depth: 1, z: 0.85 } as const;
const RISER = { x: 6, y: 4.5 } as const;
const DUCT_Z = 2.5;
const RING_LEVEL = 3;

const project = ([x, y, z]: Point3): [number, number] => [
  ORIGIN_X + (x - y) * 0.866 * SCALE,
  ORIGIN_Y + (x + y) * 0.5 * SCALE - z * FLOOR_HEIGHT * SCALE,
];

const pt = (p: Point3): string => {
  const [px, py] = project(p);
  return `${px.toFixed(1)} ${py.toFixed(1)}`;
};
const path = (points: Point3[], close = false): string =>
  `M${points.map(pt).join("L")}${close ? "Z" : ""}`;
const range = (from: number, to: number, step: number): number[] => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(v);
  return out;
};

export function buildStrokes(): IStroke[] {
  const ground: IStroke[] = [];
  const back: IStroke[] = [];
  const structure: IStroke[] = [];
  const glass: IStroke[] = [];
  const accent: IStroke[] = [];
  const add = (list: IStroke[], kind: StrokeKind, d: string) =>
    list.push({ d, kind });

  add(
    ground,
    "ground",
    path(
      [
        [-MARGIN, -MARGIN, 0],
        [WIDTH + MARGIN, -MARGIN, 0],
        [WIDTH + MARGIN, DEPTH + MARGIN, 0],
        [-MARGIN, DEPTH + MARGIN, 0],
      ],
      true,
    ),
  );

  add(
    back,
    "back",
    path([
      [0, 0, 0],
      [0, 0, LEVELS],
    ]),
  );
  add(
    back,
    "back",
    path([
      [0, DEPTH, LEVELS],
      [0, 0, LEVELS],
      [WIDTH, 0, LEVELS],
    ]),
  );

  for (let level = 0; level <= LEVELS; level += 1) {
    add(
      structure,
      "structure",
      path([
        [WIDTH, 0, level],
        [WIDTH, DEPTH, level],
        [0, DEPTH, level],
      ]),
    );
    if (level > 0)
      add(
        structure,
        "structure",
        path([
          [WIDTH, 0, level - SLAB],
          [WIDTH, DEPTH, level - SLAB],
          [0, DEPTH, level - SLAB],
        ]),
      );
  }
  for (const corner of [
    [WIDTH, 0],
    [WIDTH, DEPTH],
    [0, DEPTH],
  ] as const) {
    add(
      structure,
      "structure",
      path([
        [corner[0], corner[1], 0],
        [corner[0], corner[1], LEVELS],
      ]),
    );
  }

  for (const y of range(BAY, DEPTH - BAY, BAY))
    add(
      glass,
      "glass",
      path([
        [WIDTH, y, 0],
        [WIDTH, y, LEVELS],
      ]),
    );
  for (const x of range(BAY, WIDTH - BAY, BAY))
    add(
      glass,
      "glass",
      path([
        [x, DEPTH, 0],
        [x, DEPTH, LEVELS],
      ]),
    );

  for (let floor = 0; floor < LEVELS; floor += 1) {
    const sill = floor === 0 ? 0.12 : SILL;
    const head = floor === 0 ? 0.8 : HEAD;
    for (let y = 0; y < DEPTH; y += BAY) {
      const a = y + WINDOW_INSET;
      const b = y + BAY - WINDOW_INSET;
      add(
        glass,
        "glass",
        path(
          [
            [WIDTH, a, floor + sill],
            [WIDTH, b, floor + sill],
            [WIDTH, b, floor + head],
            [WIDTH, a, floor + head],
          ],
          true,
        ),
      );
    }
    for (let x = 0; x < WIDTH; x += BAY) {
      const a = x + WINDOW_INSET;
      const b = x + BAY - WINDOW_INSET;
      add(
        glass,
        "glass",
        path(
          [
            [a, DEPTH, floor + sill],
            [b, DEPTH, floor + sill],
            [b, DEPTH, floor + head],
            [a, DEPTH, floor + head],
          ],
          true,
        ),
      );
    }
  }

  const roof = LEVELS + PARAPET;
  add(
    structure,
    "structure",
    path([
      [WIDTH, 0, roof],
      [WIDTH, DEPTH, roof],
      [0, DEPTH, roof],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [WIDTH, 0, LEVELS],
      [WIDTH, 0, roof],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [WIDTH, DEPTH, LEVELS],
      [WIDTH, DEPTH, roof],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [0, DEPTH, LEVELS],
      [0, DEPTH, roof],
    ]),
  );

  const { x0, x1, y0, y1, height } = CORE;
  const top = LEVELS + height;
  add(
    structure,
    "structure",
    path(
      [
        [x0, y0, top],
        [x1, y0, top],
        [x1, y1, top],
        [x0, y1, top],
      ],
      true,
    ),
  );
  add(
    structure,
    "structure",
    path([
      [x1, y0, LEVELS],
      [x1, y0, top],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [x1, y1, LEVELS],
      [x1, y1, top],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [x0, y1, LEVELS],
      [x0, y1, top],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [x1, y0, LEVELS],
      [x1, y1, LEVELS],
      [x0, y1, LEVELS],
    ]),
  );

  const { x0: cx0, x1: cx1, depth, z } = CANOPY;
  add(
    structure,
    "structure",
    path(
      [
        [cx0, DEPTH, z],
        [cx0, DEPTH + depth, z],
        [cx1, DEPTH + depth, z],
        [cx1, DEPTH, z],
      ],
      true,
    ),
  );
  add(
    structure,
    "structure",
    path([
      [cx0, DEPTH + depth, 0],
      [cx0, DEPTH + depth, z],
    ]),
  );
  add(
    structure,
    "structure",
    path([
      [cx1, DEPTH + depth, 0],
      [cx1, DEPTH + depth, z],
    ]),
  );

  add(
    accent,
    "accent",
    path([
      [RISER.x, RISER.y, 0],
      [RISER.x, RISER.y, LEVELS],
    ]),
  );
  add(
    accent,
    "accent",
    path([
      [RISER.x, RISER.y, DUCT_Z],
      [WIDTH, RISER.y, DUCT_Z],
    ]),
  );
  return [...ground, ...back, ...structure, ...glass, ...accent];
}

const STROKES = buildStrokes();
const [RING_X, RING_Y] = project([RISER.x, RISER.y, RING_LEVEL]);

export default function WireframeBuilding() {
  return (
    <svg
      className="wire"
      viewBox="0 0 570 640"
      aria-hidden="true"
      focusable="false"
    >
      {STROKES.map((stroke, index) => (
        <path
          key={stroke.d}
          d={stroke.d}
          pathLength={1}
          className={`wire-line wire-${stroke.kind}`}
          style={{ ["--i" as string]: index }}
        />
      ))}
      <ellipse className="wire-ring" cx={RING_X} cy={RING_Y} rx="24" ry="14" />
    </svg>
  );
}
