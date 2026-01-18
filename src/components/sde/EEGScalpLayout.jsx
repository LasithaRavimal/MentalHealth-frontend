import scalpImg from "./assets/eeg-scalp-layout.png";


const ELECTRODES = [
  { name: "Fp1", x: "40%", y: "22%" },
  { name: "Fp2", x: "60%", y: "22%" },
  { name: "F3",  x: "45%", y: "32%" },
  { name: "F4",  x: "55%", y: "32%" },
  { name: "C3",  x: "45%", y: "48%" },
  { name: "C4",  x: "55%", y: "48%" },
  { name: "P3",  x: "45%", y: "63%" },
  { name: "P4",  x: "55%", y: "63%" },
  { name: "O1",  x: "50%", y: "78%" },
];

export default function EEGScalpLayout({ activeChannels = [] }) {
  return (
    <div className="bg-bg-tertiary p-4 rounded-xl">
      <h3 className="font-semibold mb-2 text-center">
        EEG Scalp Electrode Placement (10–20 System)
      </h3>

      <div className="relative mx-auto max-w-[260px]">
        <img
          src={scalpImg}
          alt="EEG Scalp Layout"
          className="w-full opacity-90"
        />

        {ELECTRODES.map((el) =>
          activeChannels.includes(el.name) ? (
            <div
              key={el.name}
              className="absolute bg-green-500 text-black text-xs font-bold
                         rounded-full w-6 h-6 flex items-center justify-center
                         shadow-lg"
              style={{
                left: el.x,
                top: el.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              {el.name}
            </div>
          ) : null
        )}
      </div>

      <p className="text-sm text-text-secondary mt-2 text-center">
        Only the selected EEG channel is highlighted
      </p>
    </div>
  );
}
