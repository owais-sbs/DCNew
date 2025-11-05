import { useState } from 'react';
import { X, Search, Home, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface HomeModalProps {
  onClose: () => void;
  onNavigate: (modal: 'messages' | 'help' | 'fin' | 'home') => void;
  activeModal: 'messages' | 'help' | 'fin' | 'home' | null;
  onHome: () => void;
}

export default function HomeModal({ onClose, onNavigate, activeModal, onHome }: HomeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const helpTopics = [
    "New student and class registration API",
    "Teach 'n Go user roles",
    "Teacher payroll",
    "Automatic Reminders"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-96 h-[80vh] bg-white rounded-2xl shadow-2xl m-4 flex flex-col overflow-hidden">
        {/* Blue Header Section */}
        <div className="bg-blue-600 px-6 pt-6 pb-12 relative">
          {/* Top bar with logo and close */}
          <div className="flex items-center justify-between mb-8">
            <div className="h-6 w-6 bg-white rounded flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">V</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src="https://i.pravatar.cc/32?img=68" 
                  alt="User" 
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-blue-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Welcome text */}
          <div className="text-white">
            <h1 className="text-3xl font-semibold mb-2">
              Hi Asif <span className="text-yellow-300">👋</span>
            </h1>
            <p className="text-lg">How can we help?</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white -mt-6 rounded-t-2xl">
          <div className="p-6 space-y-4">
            {/* Recent message card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent message</h3>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  <img 
                    src="https://i.pravatar.cc/40?img=68" 
                    alt="Abdullah" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 mb-1">
                    Salam Asif The payments are still du...
                  </p>
                  <p className="text-xs text-gray-500">Abdullah • 1d</p>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
              </div>
            </div>

            {/* Ask a question card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                 onClick={() => onNavigate('fin')}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Ask a question</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">AI Agent and team can help</p>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 flex items-center justify-center">
                    <svg className="h-4 w-4 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                      <path d="M2 17L12 22L22 17" />
                      <path d="M2 12L12 17L22 12" />
                    </svg>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Search for help section */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Search for help</h3>
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                {helpTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 cursor-pointer transition-colors"
                  >
                    <span className="text-sm text-gray-700">{topic}</span>
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-around">
            <button 
              onClick={() => onNavigate('home')}
              className="flex flex-col items-center gap-1 p-2 text-blue-600"
            >
              <div className="relative">
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="absolute text-white text-[8px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">😊</span>
              </div>
              <span className="text-xs text-blue-600">Home</span>
            </button>
            <button 
              onClick={() => onNavigate('messages')}
              className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs">Messages</span>
            </button>
            <button 
              onClick={() => onNavigate('help')}
              className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="h-6 w-6" />
              <span className="text-xs">Help</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

