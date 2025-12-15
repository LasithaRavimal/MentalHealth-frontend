/**
 * Premium Toast notification utility for in-app alerts
 */

let toastContainer = null;

// Initialize toast container
const initToastContainer = () => {
  if (toastContainer) return;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3';
  document.body.appendChild(toastContainer);
};

// Get icon SVG based on type
const getIcon = (type) => {
  switch (type) {
    case 'success':
      return `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
    case 'error':
      return `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
    case 'warning':
      return `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      `;
    default:
      return `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
  }
};

// Show toast notification
export const showToast = (message, type = 'info', duration = 5000) => {
  initToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type} min-w-[320px] max-w-[420px] overflow-hidden`;
  
  // Determine colors based on type
  const colors = {
    success: {
      bg: 'bg-spotify-green',
      border: 'border-spotify-green',
      icon: 'text-white',
      text: 'text-white',
      progress: 'bg-white'
    },
    error: {
      bg: 'bg-red-600',
      border: 'border-red-600',
      icon: 'text-white',
      text: 'text-white',
      progress: 'bg-white'
    },
    warning: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      icon: 'text-white',
      text: 'text-white',
      progress: 'bg-white'
    },
    info: {
      bg: 'bg-spotify-light-gray',
      border: 'border-spotify-gray',
      icon: 'text-spotify-green',
      text: 'text-white',
      progress: 'bg-spotify-green'
    }
  };
  
  const colorScheme = colors[type] || colors.info;
  
  toast.innerHTML = `
    <div class="relative ${colorScheme.bg} ${colorScheme.border} border-l-4 rounded-lg shadow-2xl backdrop-blur-sm">
      <div class="p-4 flex items-start gap-3">
        <div class="flex-shrink-0 ${colorScheme.icon} mt-0.5">
          ${getIcon(type)}
        </div>
        <div class="flex-1 ${colorScheme.text}">
          <p class="text-sm font-semibold leading-tight">${message}</p>
        </div>
        <button class="toast-close flex-shrink-0 ${colorScheme.text} hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-black/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="toast-progress absolute bottom-0 left-0 h-1 ${colorScheme.progress} opacity-30" style="width: 100%; animation: shrink ${duration}ms linear forwards;"></div>
    </div>
  `;
  
  // Add click handler for close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.onclick = () => removeToast(toast);
  
  // Add click handler for entire toast (optional - allows clicking anywhere to dismiss)
  // toast.onclick = () => removeToast(toast);
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);
  
  // Auto-remove after duration
  const autoRemove = setTimeout(() => {
    removeToast(toast);
  }, duration);
  
  // Store timeout ID for potential clearing
  toast._timeout = autoRemove;
  
  // Browser notification if permission granted
  if (Notification.permission === 'granted') {
    new Notification('M_Track', {
      body: message,
      icon: '/favicon.ico'
    });
  }
};

// Remove toast
const removeToast = (toast) => {
  if (!toast || !toast.parentNode) return;
  
  // Clear timeout if exists
  if (toast._timeout) {
    clearTimeout(toast._timeout);
  }
  
  toast.classList.add('toast-hide');
  toast.classList.remove('toast-show');
  
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Convenience functions
export const showSuccessToast = (message, duration = 4000) => {
  showToast(message, 'success', duration);
};

export const showErrorToast = (message, duration = 5000) => {
  showToast(message, 'error', duration);
};

export const showWarningToast = (message, duration = 5000) => {
  showToast(message, 'warning', duration);
};

export const showInfoToast = (message, duration = 4000) => {
  showToast(message, 'info', duration);
};

// Show high stress alert
export const showStressAlert = (stressLevel, depressionLevel) => {
  showWarningToast(
    `High stress detected from last session. Stress: ${stressLevel}, Depression: ${depressionLevel}`,
    8000
  );
};

// Show high depression alert
export const showDepressionAlert = (stressLevel, depressionLevel) => {
  showErrorToast(
    `High depression detected from last session. Stress: ${stressLevel}, Depression: ${depressionLevel}`,
    8000
  );
};

// Add CSS for animations
if (typeof document !== 'undefined') {
  const styleId = 'toast-notification-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .toast-notification {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: none;
      }
      
      .toast-notification.toast-show {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }
      
      .toast-notification.toast-hide {
        opacity: 0;
        transform: translateX(100%);
        pointer-events: none;
      }
      
      .toast-progress {
        animation: shrink linear forwards;
      }
      
      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
      
      .toast-notification:hover .toast-progress {
        animation-play-state: paused;
      }
      
      .toast-notification:hover {
        transform: translateX(0) scale(1.02);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);
  }
}

