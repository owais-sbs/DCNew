import { useState } from 'react';
import { X, Home, MessageSquare, HelpCircle, ChevronRight, Plus } from 'lucide-react';

interface MessagesModalProps {
  onClose: () => void;
  onNavigate: (modal: 'messages' | 'help' | 'fin') => void;
  activeModal: 'messages' | 'help' | 'fin' | null;
  onHome: () => void;
}

export default function MessagesModal({ onClose, onNavigate, activeModal, onHome }: MessagesModalProps) {
  const conversations = [
    {
      id: 1,
      name: "Abdullah",
      avatar: "A",
      lastMessage: "Hi Asif, We've made several design update...",
      time: "6d ago",
      isOnline: true
    },
    {
      id: 2,
      name: "Abdullah",
      avatar: "A",
      lastMessage: "I tried to call just now, but didn't get an a...",
      time: "1w ago",
      isOnline: false
    },
    {
      id: 3,
      name: "Fin",
      avatar: "F",
      lastMessage: "Rate your conversation",
      time: "3w ago",
      isOnline: false
    },
    {
      id: 4,
      name: "Abdullah",
      avatar: "A",
      lastMessage: "If you need any more help with importing...",
      time: "10w ago",
      isOnline: false
    },
    {
      id: 5,
      name: "Abdullah",
      avatar: "A",
      lastMessage: "Hi Asif, We've made several design update...",
      time: "13w ago",
      isOnline: false
    },
    {
      id: 6,
      name: "Abdullah",
      avatar: "A",
      lastMessage: "I tried to call just now, but didn't get an a...",
      time: "17w ago",
      isOnline: false
    },
    {
      id: 7,
      name: "Abdullah",
      avatar: "A",
      lastMessage: "If you need any more help with importing...",
      time: "60w ago",
      isOnline: false
    }
  ];

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
          <div className="p-4">
            {/* Ask a question button */}
            <button className="w-full bg-blue-600 text-white rounded-xl p-4 mb-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" />
              Ask a question
            </button>

            {/* Conversations */}
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {conversation.avatar}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 truncate">
                        {conversation.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-around">
            <button 
              onClick={onHome}
              className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-blue-600">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Messages</span>
            </button>
            <button 
              onClick={() => onNavigate('help')}
              className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-xs">Help</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
