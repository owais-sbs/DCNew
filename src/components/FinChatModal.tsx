import { useState } from 'react';
import { X, ArrowLeft, MoreHorizontal, Paperclip, Smile, Mic, Send, ChevronDown, Home, MessageSquare, HelpCircle } from 'lucide-react';

interface FinChatModalProps {
  onClose: () => void;
  onNavigate: (modal: 'messages' | 'help' | 'fin') => void;
  activeModal: 'messages' | 'help' | 'fin' | null;
  onHome: () => void;
}

export default function FinChatModal({ onClose, onNavigate, activeModal, onHome }: FinChatModalProps) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      console.log('Sending message:', message);
      setMessage('');
    }
  };

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Fin</div>
                <div className="text-xs text-gray-500">The team can also help.</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Fin's messages */}
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hi! I'm Fin, your AI onboarding and support agent here to help you get the most out of Teach 'n Go. I can instantly answer your questions, guide you through features, and help you find what you need. And if there's ever something I can't solve, you'll always have the option to connect with our team for further support.
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-3 max-w-xs mt-2">
                <p className="text-sm text-gray-800">
                  How can I help you today?
                </p>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Fin • Just now
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Paperclip className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Smile className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-gray-500 text-sm font-semibold">GIF</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Mic className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask a question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Send className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Powered by</span>
              <div className="h-4 w-4 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">F</span>
              </div>
              <span>Fin</span>
            </div>
          </div>
          
          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 p-4 mt-4">
            <div className="flex items-center justify-around">
              <button 
                onClick={onHome}
                className="flex flex-col items-center gap-1 p-2 text-blue-600"
              >
                <div className="relative h-5 w-5 bg-blue-600 rounded flex items-center justify-center">
                  <Home className="h-3 w-3 text-white" />
                  <span className="absolute text-white text-[6px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">😊</span>
                </div>
                <span className="text-xs text-blue-600">Home</span>
              </button>
              <button 
                onClick={() => onNavigate('messages')}
                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
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
    </div>
  );
}
