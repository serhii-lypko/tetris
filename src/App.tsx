import Fragment, { useEffect, useState, useCallback } from "react";
import produce from "immer";

const { log } = console;

/* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

type $fixme = any;

// * fragment touching the stock *
// for each cell in figure check if any of stock rows include cell_y + 1

const config = {
  canvasWidth: 10,
  // canvasHeight: 15,
  canvasHeight: 10,
  // cellSize: 15,
  cellSize: 40,
  updateSpeed: 500,
};

// TODO: refactor
function createCanvas() {
  let canvas = [];

  for (let y = 0; y < config.canvasHeight; y++) {
    let row = [];

    for (let x = 0; x < config.canvasWidth; x++) {
      row.push({ y, x });
    }

    canvas.push(row);
  }

  return canvas;
}

enum ShiftDirection {
  Left,
  Right,
}

type Cell = [number, number];

type Fragment = Cell[];
type Stock = Record<number, number[]>;

type GameState = {
  fragment: Fragment;
  stock: Stock;
  updateSpeed: number;
};

const fragments: Fragment[] = [
  [
    [0, 4],
    [0, 5],
  ],
];

// TODO: debugging
// https://www.youtube.com/watch?v=q3WHdoz2KmE&ab_channel=Profydev

// TODO: refactor
function createInitialStock(config: $fixme): Stock {
  let stock: Stock = {};
  for (let y = 0; y < config.canvasHeight; y++) stock[y] = [];
  return stock;
}

const initialState = {
  fragment: fragments[0],
  stock: createInitialStock(config),
  updateSpeed: config.updateSpeed,
};

function App() {
  const [gameState, updateGameState] = useState<GameState>(initialState);
  const [isPaused, toggleIsPaused] = useState(false);

  // game loop
  useEffect(() => {
    const tick = () => {
      if (!isPaused) {
        updateGameState((prevState) =>
          produce(prevState, (draft) => {
            const willCrossBottomBorder = draft.fragment.some(
              ([y]) => y + 1 === config.canvasHeight
            );

            const willCrossStock = draft.fragment.some(([y, x]) =>
              draft.stock[y + 1]?.includes(x)
            );

            if (willCrossBottomBorder || willCrossStock) {
              draft.fragment.forEach(([y, x]) => draft.stock[y].push(x));
              draft.fragment = fragments[0];
            }

            /* -- -- -- Base move -- -- -- */
            draft.fragment = draft.fragment.map(([y, x]) => [y + 1, x]);
          })
        );
      }
    };

    const gameLoop = setInterval(tick, config.updateSpeed);

    return () => {
      clearInterval(gameLoop);
    };
  }, [isPaused]);

  // key handlers
  useEffect(() => {
    document.addEventListener("keydown", handleXShift);

    return () => {
      document.removeEventListener("keydown", handleXShift);
    };
  }, []);

  // TODO: use callback?
  const togglePause = () => {
    toggleIsPaused((isPaused) => !isPaused);
  };

  // ❗️ TODO: prevent shifting into other pieces
  // TODO: use callback?
  const handleXShift = (event: KeyboardEvent) => {
    const makeShift = (coefficient: number) => {
      const { canvasWidth } = config;

      updateGameState((prevState) =>
        produce(prevState, (draft) => {
          const isValid = draft.fragment.every(
            ([y, x]) => x + coefficient >= 0 && x + coefficient < canvasWidth
          );

          draft.fragment = isValid
            ? draft.fragment.map(([y, x]) => [y, x + coefficient])
            : draft.fragment;
        })
      );
    };

    switch (event.key) {
      case "ArrowLeft":
        makeShift(-1);
        break;
      case "ArrowRight":
        makeShift(1);
        break;
      default:
        break;
    }
  };

  // TODO: use memo?
  const renderCanvas = () => {
    const canvas = createCanvas();
    const { canvasWidth, canvasHeight, cellSize } = config;

    return (
      <div style={{ padding: "4em" }}>
        <div
          style={{
            position: "relative",
            width: canvasWidth * cellSize,
            height: canvasHeight * cellSize,
            border: "1px solid black",
          }}
        >
          {canvas.map((row) => {
            return row.map((cell) => {
              const { fragment, stock } = gameState;

              const isStock = !!stock[cell.y].some((x) => cell.x === x);
              const isFragment = fragment.some(
                ([y, x]) => cell.y === y && cell.x === x
              );
              const isOccupied = isStock || isFragment;

              return (
                <div
                  key={`${cell.y}-${cell.x}`}
                  style={{
                    position: "absolute",
                    top: cell.y * cellSize,
                    left: cell.x * cellSize,
                    width: cellSize,
                    height: cellSize,
                    border: "1px solid grey",
                    background: isOccupied ? "grey" : "#fff",
                  }}
                />
              );
            });
          })}
        </div>
      </div>
    );
  };

  // TODO: use memo?
  const renderControls = () => {
    return (
      <div>
        <button onClick={togglePause}>Toggle pause</button>
        <button onClick={() => console.log(gameState)}>Show state</button>
      </div>
    );
  };

  return (
    <Fragment.Fragment>
      {renderControls()}
      {renderCanvas()}
    </Fragment.Fragment>
  );
}

export default App;
