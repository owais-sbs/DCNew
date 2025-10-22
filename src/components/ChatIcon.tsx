import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import MessagesModal from './MessagesModal';
import FinChatModal from './FinChatModal';

export default function ChatIcon() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isFinChatOpen, setIsFinChatOpen] = useState(false);

  const handleChatClick = () => {
    // Cycle through: Messages -> Help -> Fin Chat -> Close
    if (!isHelpOpen && !isMessagesOpen && !isFinChatOpen) {
      setIsMessagesOpen(true);
    } else if (isMessagesOpen) {
      setIsMessagesOpen(false);
      setIsHelpOpen(true);
    } else if (isHelpOpen) {
      setIsHelpOpen(false);
      setIsFinChatOpen(true);
    } else if (isFinChatOpen) {
      setIsFinChatOpen(false);
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleChatClick}
          className="h-14 w-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </button>
      </div>

      {/* Modals */}
      {isHelpOpen && (
        <HelpModal onClose={() => setIsHelpOpen(false)} />
      )}
      
      {isMessagesOpen && (
        <MessagesModal onClose={() => setIsMessagesOpen(false)} />
      )}
      
      {isFinChatOpen && (
        <FinChatModal onClose={() => setIsFinChatOpen(false)} />
      )}
    </>
  );
}
