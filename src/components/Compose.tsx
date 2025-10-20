import { useState } from "react"
import { 
  Mail,
  MessageCircle,
  Megaphone,
  Search,
  Info,
  Calendar,
  Clock,
  Paperclip,
  Link,
  Image,
  Video,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ChevronDown,
  X,
  Check
} from "lucide-react"

type ComposeTab = "email" | "sms" | "announcement"

export default function Compose() {
  const [activeTab, setActiveTab] = useState<ComposeTab>("email")
  const [recipients, setRecipients] = useState(0)
  const [message, setMessage] = useState("Asif (info@dcedu.ie)\nDCE English Language School")
  const [showSmsCreditsModal, setShowSmsCreditsModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(1000)

  return (
    <div className="pl-[72px]">
      <div className="px-6 py-6">
        {/* Header with tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("email")}
              className={`px-4 h-10 rounded-xl text-sm inline-flex items-center gap-2 transition ${
                activeTab === "email"
                  ? "bg-white shadow-sm border border-blue-200 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Mail size={14} className="text-gray-500" />
              <span>New email</span>
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`px-4 h-10 rounded-xl text-sm inline-flex items-center gap-2 transition ${
                activeTab === "sms"
                  ? "bg-white shadow-sm border border-blue-200 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MessageCircle size={14} className="text-gray-500" />
              <span>New SMS</span>
            </button>
            <button
              onClick={() => setActiveTab("announcement")}
              className={`px-4 h-10 rounded-xl text-sm inline-flex items-center gap-2 transition ${
                activeTab === "announcement"
                  ? "bg-white shadow-sm border border-blue-200 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Megaphone size={14} className="text-gray-500" />
              <span>New announcement</span>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6 grid grid-cols-[1fr_300px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {activeTab === "email" && <EmailCompose recipients={recipients} setRecipients={setRecipients} message={message} setMessage={setMessage} />}
            {activeTab === "sms" && <SMSCompose recipients={recipients} setRecipients={setRecipients} />}
            {activeTab === "announcement" && <AnnouncementCompose recipients={recipients} setRecipients={setRecipients} />}
          </div>

          {/* Right sidebar - SMS Credits */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={16} className="text-gray-500" />
              <span className="font-semibold text-gray-800">SMS Credits</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-3">0</div>
            <button 
              onClick={() => setShowSmsCreditsModal(true)}
              className="w-full h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm"
            >
              Add SMS credits
            </button>
          </div>
        </div>
      </div>

      {/* SMS Credits Modal */}
      {showSmsCreditsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Add SMS credits</h3>
              <button 
                onClick={() => setShowSmsCreditsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">Please select your SMS package</p>
              
              {/* SMS Package Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { credits: 1000, price: 70 },
                  { credits: 3000, price: 210 },
                  { credits: 5000, price: 350 },
                  { credits: 10000, price: 700 }
                ].map((pkg) => (
                  <div
                    key={pkg.credits}
                    onClick={() => setSelectedPackage(pkg.credits)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedPackage === pkg.credits
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedPackage === pkg.credits && (
                      <div className="absolute top-2 right-2">
                        <Check size={20} className="text-green-600" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800 mb-2">
                        {pkg.credits.toLocaleString()} credits
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        € {pkg.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="text-center text-sm text-gray-500 mb-6">
                <div>1 credit = 1 SMS to Ireland</div>
                <div>* Prices to other countries may vary</div>
              </div>

              {/* Total Charge */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="text-center text-sm text-gray-800">
                  You will be charged a total amount of € {selectedPackage === 1000 ? 70 : selectedPackage === 3000 ? 210 : selectedPackage === 5000 ? 350 : 700}
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button className="h-12 px-8 rounded-xl bg-indigo-600 text-white text-sm font-medium">
                  Enter card details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmailCompose({ recipients, setRecipients, message, setMessage }: { recipients: number; setRecipients: (n: number) => void; message: string; setMessage: (s: string) => void }) {
  return (
    <>
      {/* Recipients section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recipient(s)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  placeholder="Search" 
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2">
                Quick select
                <ChevronDown size={14} />
              </button>
              <Info size={16} className="text-gray-400" />
            </div>
            <div className="mt-2 text-sm text-blue-600">{recipients} people selected</div>
          </div>
        </div>
      </div>

      {/* Compose email section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compose email</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="flex items-center gap-2">
              <input 
                value="Asif Omer (info@dcedu.ie)" 
                readOnly
                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50"
              />
              <Info size={16} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input 
              placeholder="Enter subject" 
              className="w-full h-10 px-3 rounded-xl border border-gray-200"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Message *</label>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
                  Insert variable
                  <ChevronDown size={12} />
                </button>
                <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
                  Select From Templates
                  <ChevronDown size={12} />
                </button>
                <Info size={16} className="text-gray-400" />
              </div>
            </div>
            
            {/* Rich text editor toolbar */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-2">
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Bold size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Italic size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Underline size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Strikethrough size={14} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignLeft size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignCenter size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignRight size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignJustify size={14} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <span className="text-xs font-bold">A</span>
                  </button>
                  <button className="h-8 px-2 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-1">
                    <span className="text-xs">14</span>
                    <ChevronDown size={12} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <List size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <ListOrdered size={14} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Link size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Video size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Image size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Paperclip size={14} />
                  </button>
                </div>
              </div>
              
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-40 p-3 border-0 resize-none focus:outline-none"
                placeholder="Enter your message..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <label className="text-sm text-gray-700">Schedule send (optional)</label>
            </div>
            <input 
              placeholder="Select date and time" 
              className="flex-1 h-10 px-3 rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <label className="text-sm text-gray-700">Save this email as a template</label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Message will be delivered to <span className="text-blue-600 font-medium">{recipients} people</span>
        </div>
        <button className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-sm">
          Send Email to {recipients} people
        </button>
      </div>
    </>
  )
}

function SMSCompose({ recipients, setRecipients }: { recipients: number; setRecipients: (n: number) => void }) {
  return (
    <>
      {/* Recipients section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recipient(s)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  placeholder="Search" 
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2">
                Quick select
                <ChevronDown size={14} />
              </button>
              <Info size={16} className="text-gray-400" />
            </div>
            <div className="mt-2 text-sm text-blue-600">{recipients} people selected</div>
          </div>
        </div>
      </div>

      {/* Compose SMS section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compose SMS</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="flex items-center gap-2">
              <div className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center">
                <span className="text-sm text-gray-700">InfoSMS</span>
              </div>
              <Info size={16} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Message *</label>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
                  Insert variable
                  <ChevronDown size={12} />
                </button>
                <Info size={16} className="text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <textarea 
                placeholder="Enter your SMS message..."
                className="w-full h-32 p-3 rounded-xl border border-gray-200 resize-none focus:outline-none"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <ChevronDown size={16} className="text-gray-400" />
                <Info size={16} className="text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>You have 459 characters left</span>
              <span>1 message</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Message will be delivered to <span className="text-blue-600 font-medium">{recipients} people</span> and cost <span className="text-blue-600 font-medium">0 credits</span>
        </div>
        <button className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-sm">
          Send SMS to {recipients} people
        </button>
      </div>
    </>
  )
}

function AnnouncementCompose({ recipients, setRecipients }: { recipients: number; setRecipients: (n: number) => void }) {
  return (
    <>
      {/* Recipients section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recipient(s)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  placeholder="Search" 
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-2">
                Quick select
                <ChevronDown size={14} />
              </button>
              <Info size={16} className="text-gray-400" />
            </div>
            <div className="mt-2 text-sm text-blue-600">{recipients} people selected</div>
          </div>
        </div>
      </div>

      {/* Compose announcement section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compose announcement</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="flex items-center gap-2">
              <input 
                value="Asif Omer" 
                readOnly
                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50"
              />
              <Info size={16} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input 
              placeholder="Enter announcement title" 
              className="w-full h-10 px-3 rounded-xl border border-gray-200"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Message *</label>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm inline-flex items-center gap-1">
                  Insert variable
                  <ChevronDown size={12} />
                </button>
                <Info size={16} className="text-gray-400" />
              </div>
            </div>
            
            {/* Rich text editor toolbar */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-2">
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Bold size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Italic size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Underline size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Strikethrough size={14} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignLeft size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignCenter size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignRight size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <AlignJustify size={14} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <span className="text-xs font-bold">A</span>
                  </button>
                  <button className="h-8 px-2 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-1">
                    <span className="text-xs">14</span>
                    <ChevronDown size={12} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <List size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <ListOrdered size={14} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Link size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Video size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Image size={14} />
                  </button>
                  <button className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
                    <Paperclip size={14} />
                  </button>
                </div>
              </div>
              
              <textarea 
                placeholder="Enter your announcement..."
                className="w-full h-40 p-3 border-0 resize-none focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <label className="text-sm text-gray-700">Schedule send (optional)</label>
            </div>
            <input 
              placeholder="Select date and time" 
              className="flex-1 h-10 px-3 rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <label className="text-sm text-gray-700">Expiry date (optional):</label>
            </div>
            <input 
              placeholder="Select expiry date" 
              className="flex-1 h-10 px-3 rounded-xl border border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Message will be delivered to <span className="text-blue-600 font-medium">{recipients} people</span>
        </div>
        <button className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-sm">
          Send announcement to {recipients} people
        </button>
      </div>
    </>
  )
}
