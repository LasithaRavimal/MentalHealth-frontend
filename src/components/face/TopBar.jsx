import { MdArrowBack, MdRefresh } from "react-icons/md";

export default function TopBar({ onBack, mirror, onToggleMirror, onRefreshStatus }) {
  return (
    <div className="flex items-center justify-between max-w-6xl px-6 py-6 mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 transition border rounded-full bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray/80 border-spotify-gray"
      >
        <MdArrowBack />
        Back
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMirror}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition ${
            mirror
              ? "bg-spotify-green/20 border-spotify-green text-spotify-green"
              : "bg-spotify-dark-gray/60 border-spotify-gray text-text-gray hover:bg-spotify-dark-gray/80"
          }`}
          title="Toggle mirror view"
        >
          Mirror: {mirror ? "On" : "Off"}
        </button>

        <button
          onClick={onRefreshStatus}
          className="inline-flex items-center gap-2 px-4 py-2 transition border rounded-full bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray/80 border-spotify-gray"
          title="Refresh model status"
        >
          <MdRefresh />
          Status
        </button>
      </div>
    </div>
  );
}
