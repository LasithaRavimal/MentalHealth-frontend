import { useEffect } from 'react';
import { MdClose, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';

const PredictionModal = ({ isOpen, onClose, prediction, onViewHistory }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen || !prediction) return null;
  
  const stressLevel = prediction.stress_level?.toLowerCase() || 'unknown';
  const depressionLevel = prediction.depression_level?.toLowerCase() || 'unknown';
  
  const getStressColor = () => {
    if (stressLevel === 'high') return 'text-red-400';
    if (stressLevel === 'moderate') return 'text-yellow-400';
    return 'text-green-400';
  };
  
  const getDepressionColor = () => {
    if (depressionLevel === 'high') return 'text-red-400';
    if (depressionLevel === 'moderate') return 'text-yellow-400';
    return 'text-green-400';
  };
  
  const getStressIcon = () => {
    if (stressLevel === 'high') return <MdError className="w-6 h-6 text-red-400" />;
    if (stressLevel === 'moderate') return <MdWarning className="w-6 h-6 text-yellow-400" />;
    return <MdCheckCircle className="w-6 h-6 text-green-400" />;
  };
  
  const getDepressionIcon = () => {
    if (depressionLevel === 'high') return <MdError className="w-6 h-6 text-red-400" />;
    if (depressionLevel === 'moderate') return <MdWarning className="w-6 h-6 text-yellow-400" />;
    return <MdCheckCircle className="w-6 h-6 text-green-400" />;
  };
  
  const formatProbability = (prob) => {
    return `${(prob * 100).toFixed(1)}%`;
  };
  
  return (
    <div className="fixed inset-0 bg-spotify-black/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-spotify-dark-gray rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-spotify-light-gray"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-spotify-dark-gray border-b border-spotify-light-gray p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Session Analysis Results</h2>
          <button
            onClick={onClose}
            className="text-text-gray hover:text-white transition-colors p-2 hover:bg-spotify-light-gray rounded-full"
            aria-label="Close"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stress Level */}
          <div className="bg-spotify-light-gray rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {getStressIcon()}
              <h3 className="text-xl font-bold text-white">Stress Level</h3>
            </div>
            <div className="mb-4">
              <div className={`text-3xl font-bold ${getStressColor()} mb-2`}>
                {prediction.stress_level || 'Unknown'}
              </div>
              <div className="text-sm text-text-gray">Based on your listening patterns</div>
            </div>
            
            {/* Probability Distribution */}
            {prediction.stress_probs && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-text-gray mb-2">Probability Distribution:</div>
                {Object.entries(prediction.stress_probs).map(([level, prob]) => (
                  <div key={level} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-text-gray capitalize">{level}:</div>
                    <div className="flex-1 bg-spotify-gray rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${
                          level.toLowerCase() === 'high' ? 'bg-red-500' :
                          level.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-white text-right">{formatProbability(prob)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Depression Level */}
          <div className="bg-spotify-light-gray rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {getDepressionIcon()}
              <h3 className="text-xl font-bold text-white">Depression Level</h3>
            </div>
            <div className="mb-4">
              <div className={`text-3xl font-bold ${getDepressionColor()} mb-2`}>
                {prediction.depression_level || 'Unknown'}
              </div>
              <div className="text-sm text-text-gray">Based on your listening patterns</div>
            </div>
            
            {/* Probability Distribution */}
            {prediction.depression_probs && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-text-gray mb-2">Probability Distribution:</div>
                {Object.entries(prediction.depression_probs).map(([level, prob]) => (
                  <div key={level} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-text-gray capitalize">{level}:</div>
                    <div className="flex-1 bg-spotify-gray rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${
                          level.toLowerCase() === 'high' ? 'bg-red-500' :
                          level.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-white text-right">{formatProbability(prob)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Explanations */}
          {prediction.explanations && prediction.explanations.length > 0 && (
            <div className="bg-spotify-light-gray rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Session Insights</h3>
              <ul className="space-y-3">
                {prediction.explanations.map((explanation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full mt-2 flex-shrink-0" />
                    <p className="text-text-gray leading-relaxed">{explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Warning for High Levels */}
          {(stressLevel === 'high' || depressionLevel === 'high') && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MdWarning className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-bold text-red-400 mb-2">Important Notice</h4>
                  <p className="text-red-300 text-sm">
                    Your listening patterns indicate elevated {stressLevel === 'high' ? 'stress' : ''}{stressLevel === 'high' && depressionLevel === 'high' ? ' and ' : ''}{depressionLevel === 'high' ? 'depression' : ''} levels.
                    Consider taking a break, listening to calming music, or consulting with a healthcare professional if these feelings persist.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-spotify-dark-gray border-t border-spotify-light-gray p-6 flex items-center justify-between gap-4">
          {onViewHistory && (
            <button
              onClick={() => {
                if (onViewHistory) {
                  onViewHistory();
                }
              }}
              className="text-spotify-green hover:text-spotify-green-hover font-medium transition-colors"
            >
              View Session History →
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-spotify-green hover:bg-spotify-green-hover text-white font-semibold px-6 py-3 rounded-full transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionModal;

