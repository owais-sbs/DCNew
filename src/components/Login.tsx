import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Fake login then go to dashboard
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-100 grid place-items-center">
      <div className="w-[380px] max-w-[94vw]">
        {/* Logo */}
        <div className="mb-5 grid place-items-center">
          <div className="h-14 rounded-2xl border border-gray-200 bg-white px-5 grid place-items-center shadow-sm">
            <img src="/src/assets/logo.webp" alt="Teach 'n Go" className="h-9" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-xl font-semibold text-gray-800 text-center">Log into your account</h1>
            <p className="mt-2 text-sm text-gray-600 text-center">Welcome back! Please enter your details.</p>

            <form onSubmit={onLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700">I forgot my password</button>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm"
              >
                Log in
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don’t have an account? <button className="text-indigo-600 hover:text-indigo-700">Sign up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


