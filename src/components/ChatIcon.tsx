import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import HomeModal from './HomeModal';
import HelpTopicsModal from './HelpTopicsModal';
import MessagesModal from './MessagesModal';
import FinChatModal from './FinChatModal';
import { useNavigate } from 'react-router-dom';

export default function ChatIcon() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'messages' | 'help' | 'fin' | 'home' | null>(null);

  const handleChatClick = () => {
    // Cycle through: Home -> Messages -> Fin Chat -> Close
    if (activeModal === null) {
      setActiveModal('home');
    } else if (activeModal === 'home') {
      setActiveModal('messages');
    } else if (activeModal === 'messages') {
      setActiveModal('fin');
    } else if (activeModal === 'fin') {
      setActiveModal(null);
    }
  };

  const handleNavigation = (modal: 'messages' | 'help' | 'fin' | 'home') => {
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
      {activeModal === 'home' && (
        <HomeModal 
          onClose={handleClose} 
          onNavigate={handleNavigation}
          activeModal={activeModal}
          onHome={handleHome}
        />
      )}

      {activeModal === 'messages' && (
        <MessagesModal 
          onClose={handleClose} 
          onNavigate={handleNavigation}
          activeModal={activeModal}
          onHome={handleHome}
        />
      )}
      
      {activeModal === 'help' && (
        <HelpTopicsModal 
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
