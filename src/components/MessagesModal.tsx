import { useState } from 'react';
import { X, Home, MessageSquare, HelpCircle, ChevronRight, Plus } from 'lucide-react';

interface MessagesModalProps {
  onClose: () => void;
  onNavigate: (modal: 'messages' | 'help' | 'fin' | 'home') => void;
  activeModal: 'messages' | 'help' | 'fin' | 'home' | null;
  onHome: () => void;
}

export default function MessagesModal({ onClose, onNavigate, activeModal, onHome }: MessagesModalProps) {
  const conversations = [
    {
      id: 1,
      name: "Abdullah",
      avatar: "https://i.pravatar.cc/40?img=68",
      lastMessage: "Salam Asif The payments are still due. Th...",
      time: "1d",
      isUnread: true
    },
    {
      id: 2,
      name: "Abdullah",
      avatar: "https://i.pravatar.cc/40?img=68",
      lastMessage: "Hi Asif, how can I help?",
      time: "1w",
      isUnread: false
    },
    {
      id: 3,
      name: "Fin",
      avatar: null, // Fin has a special icon
      lastMessage: "If you still need help fixing the course title...",
      time: "1w",
      isUnread: false,
      isFin: true
    },
    {
      id: 4,
      name: "Abdullah",
      avatar: "https://i.pravatar.cc/40?img=68",
      lastMessage: "I tried to call just now, but didn't get an a...",
      time: "3w",
      isUnread: false
    },
    {
      id: 5,
      name: "Abdullah",
      avatar: "https://i.pravatar.cc/40?img=68",
      lastMessage: "I can see that the exit letter is there in you...",
      time: "1mo",
      isUnread: false
    },
    {
      id: 6,
      name: "Abdullah",
      avatar: "https://i.pravatar.cc/40?img=68",
      lastMessage: "Rate your conversation",
      time: "2mo",
      isUnread: false
    },
    {
      id: 7,
      name: "Fin",
      avatar: null,
      lastMessage: "If you need any more help with importing ...",
      time: "3mo",
      isUnread: false,
      isFin: true
    }
  ];

  const FinIcon = () => (
    <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17" />
        <path d="M2 12L12 17L22 12" />
      </svg>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-96 h-[80vh] bg-white rounded-2xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {conversation.isFin ? (
                    <FinIcon />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                      <img 
                        src={conversation.avatar || "https://i.pravatar.cc/40?img=68"} 
                        alt={conversation.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                {/* Message details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      {conversation.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {conversation.time}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                
                {/* Unread indicator or chevron */}
                <div className="flex-shrink-0">
                  {conversation.isUnread ? (
                    <div className="h-2 w-2 bg-red-500 rounded-full mt-2"></div>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => onNavigate('fin')}
            className="w-full bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <span>Ask a question</span>
            <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs">?</span>
            </div>
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-around">
            <button 
              onClick={() => onNavigate('home')}
              className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <div className="relative">
                <div className="h-6 w-6 bg-gray-400 rounded flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="absolute text-white text-[8px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">😊</span>
              </div>
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-blue-600 relative">
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-semibold">1</span>
              </span>
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
