import { MdInfo, MdCheckCircle } from "react-icons/md";

export default function HowToUseCard() {
  return (
    <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MdInfo className="text-xl text-spotify-green" />
        How to use
      </div>

      <div className="mt-4 space-y-3 text-sm text-text-gray">
        <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
          <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
          <div>Start camera and allow access.</div>
        </div>

        <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
          <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
          <div>Start session, then do the student activity (don’t stare at the camera).</div>
        </div>

        <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
          <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
          <div>Keep your face visible while working (front lighting helps a lot).</div>
        </div>
      </div>

      <div className="p-4 mt-5 text-sm border rounded-xl border-spotify-gray bg-spotify-dark-gray/40 text-text-gray">
        If output becomes unstable, use Reset and rerun with better lighting.
      </div>
    </div>
  );
}
