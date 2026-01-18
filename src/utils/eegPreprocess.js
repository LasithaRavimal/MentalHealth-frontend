import Papa from "papaparse";

/**
 * Backend constants (must match backend)
 */
const TRIAL_LENGTH = 9216;
const N_AVERAGED = 16;
const ELECTRODE_COL_INDEX = [4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Frontend safety limit (visualization only)
 * Backend still uses full 576 points
 */
const MAX_POINTS = 200;

/**
 * Average EEG rows by N (same as backend)
 */
function averagedByNRows(data, n) {
  const usableLen = Math.floor(data.length / n) * n;
  const trimmed = data.slice(0, usableLen);

  const averaged = [];
  for (let i = 0; i < trimmed.length; i += n) {
    const chunk = trimmed.slice(i, i + n);
    const mean = chunk[0].map((_, col) =>
      chunk.reduce((sum, row) => sum + row[col], 0) / n
    );
    averaged.push(mean);
  }
  return averaged;
}

/**
 * Normalize (max norm) – same as backend
 */
function normalizeMax(data) {
  const maxVal = Math.max(
    ...data.flat().map((v) => Math.abs(v))
  );
  return data.map((row) => row.map((v) => v / maxVal));
}

/**
 * MAIN FUNCTION
 * Parses CSV and returns EEG channels for visualization
 */
export function preprocessEEGForVisualization(file, onComplete) {
  Papa.parse(file, {
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data.map((r) =>
        r.map((v) => Number(v))
      );

      if (rows.length < TRIAL_LENGTH) {
        throw new Error("EEG file too short");
      }

      /**
       * Take ONLY ONE trial (same as backend loop start)
       */
      const trial = rows.slice(0, TRIAL_LENGTH);

      /**
       * Select electrode columns 4–12
       */
      const eeg = trial.map((row) =>
        ELECTRODE_COL_INDEX.map((idx) => row[idx])
      );

      /**
       * Average by N rows
       */
      const averaged = averagedByNRows(eeg, N_AVERAGED);

      /**
       * Normalize
       */
      const normalized = normalizeMax(averaged);

      /**
       * Transpose → channels
       * Limit points for visualization
       */
      const channels = ELECTRODE_COL_INDEX.map((_, ch) =>
        normalized
          .slice(0, MAX_POINTS)
          .map((row) => row[ch])
      );

      onComplete(channels);
    },
  });
}
