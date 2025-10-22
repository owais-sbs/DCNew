import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import MessagesModal from './MessagesModal';
import FinChatModal from './FinChatModal';
import { useNavigate } from 'react-router-dom';

export default function ChatIcon() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'messages' | 'help' | 'fin' | null>(null);

  const handleChatClick = () => {
    // Cycle through: Messages -> Help -> Fin Chat -> Close
    if (activeModal === null) {
      setActiveModal('messages');
    } else if (activeModal === 'messages') {
      setActiveModal('help');
    } else if (activeModal === 'help') {
      setActiveModal('fin');
    } else if (activeModal === 'fin') {
      setActiveModal(null);
    }
  };

  const handleNavigation = (modal: 'messages' | 'help' | 'fin') => {
    setActiveModal(modal);
  };

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleHome = () => {
    navigate('/dashboard');
    setActiveModal(null);
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
      {activeModal === 'messages' && (
        <MessagesModal 
          onClose={handleClose} 
          onNavigate={handleNavigation}
          activeModal={activeModal}
          onHome={handleHome}
        />
      )}
      
      {activeModal === 'help' && (
        <HelpModal 
          onClose={handleClose} 
          onNavigate={handleNavigation}
          activeModal={activeModal}
          onHome={handleHome}
        />
      )}
      
      {activeModal === 'fin' && (
        <FinChatModal 
          onClose={handleClose} 
          onNavigate={handleNavigation}
          activeModal={activeModal}
          onHome={handleHome}
        />
      )}
    </>
  );
}
