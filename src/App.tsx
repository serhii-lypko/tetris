import Fragment, { useEffect, useState, useCallback } from "react";

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

  // log(gameState);

  useEffect(() => {
    const tick = () => {
      // TODO: implement state update logic with immer?
      updateGameState((prevState) => {
        const isCrossingBorder = prevState.fragment.some(
          ([y]) => y + 1 === config.canvasHeight
        );

        // const isCrossingStock =

        /* -- -- Crossing border -- -- */
        if (isCrossingBorder) {
          let updatedStock = prevState.stock;

          prevState.fragment.forEach(([y, x]) => {
            updatedStock[y].push(x);
          });

          return {
            ...prevState,
            stock: updatedStock,
            fragment: fragments[0],
          };
        }

        /* -- -- Crossing stock -- -- */
        // if (isCrossingStock) {}

        /* -- -- General dropping update -- -- */
        return {
          ...prevState,
          fragment: prevState.fragment.map(([cellY, cellX]) => {
            return [cellY + 1, cellX];
          }),
        };
      });
    };

    const gameLoop = setInterval(tick, config.updateSpeed);

    return () => {
      clearInterval(gameLoop);
    };
  }, []);

  // TODO: use callback?
  const handleShift = (direction: ShiftDirection) => {
    const move = (factor: number) => {
      updateGameState((prevState) => {
        const isValid = prevState.fragment.every(
          ([y, x]) => x + factor >= 0 && x + factor < config.canvasWidth
        );

        return {
          ...prevState,
          fragment: isValid
            ? prevState.fragment.map(([y, x]) => [y, x + factor])
            : prevState.fragment,
        };
      });
    };

    switch (direction) {
      case ShiftDirection.Left:
        move(-1);
        break;
      case ShiftDirection.Right:
        move(1);
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
        <button onClick={() => handleShift(ShiftDirection.Left)}>Left</button>
        <button onClick={() => handleShift(ShiftDirection.Right)}>Right</button>
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
