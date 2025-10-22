import { useState } from 'react';
import { X, Search, Home, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
  onNavigate: (modal: 'messages' | 'help' | 'fin') => void;
  activeModal: 'messages' | 'help' | 'fin' | null;
  onHome: () => void;
}

export default function HelpModal({ onClose, onNavigate, activeModal, onHome }: HelpModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      title: "Introduction to Teach 'n Go",
      description: "Get started with Teach 'n Go",
      articles: 7
    },
    {
      title: "Creating your school",
      description: "Set up your school profile and settings",
      articles: 5
    },
    {
      title: "School settings",
      description: "Configure your school preferences",
      articles: 8
    },
    {
      title: "User permissions",
      description: "Learn about setting up permissions for your school members",
      articles: 3
    },
    {
      title: "Managing your school",
      description: "How to manage day-to-day running of your school",
      articles: 16
    },
    {
      title: "Managing classes & lessons",
      description: "Learn how to effectively manage lessons",
      articles: 17
    },
    {
      title: "Fees & payments",
      description: "Learn more about Fees and Payments",
      articles: 17
    },
    {
      title: "Communication",
      description: "Our Group Messaging allows you to always keep in contact with your school members",
      articles: 7
    },
    {
      title: "Teacher, student & parent portals",
      description: "Learn about our engaging student/parent portal",
      articles: 11
    },
    {
      title: "Tools to help You grow",
      articles: 4
    },
    {
      title: "Integrations & APIs",
      articles: 12
    },
    {
      title: "Miscellaneous",
      description: "Various articles",
      articles: 4
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
          <h2 className="text-xl font-semibold text-gray-800">Help</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="text-sm text-gray-500 mb-4">12 collections</div>
            
            <div className="space-y-1">
              {helpCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {category.title}
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-500 mb-1">
                        {category.description}
                      </div>
                    )}
                    <div className="text-sm text-gray-400">
                      {category.articles} articles
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-600" />
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
            <button 
              onClick={() => onNavigate('messages')}
              className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Messages</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-blue-600">
              <HelpCircle className="h-5 w-5" />
              <span className="text-xs">Help</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
