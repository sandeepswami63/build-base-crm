import Link from 'next/link';

export default function Home() {
  const typebotUrl = "https://bot.buildbasedigitally.com/new-o2j4kl8";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="font-extrabold text-2xl tracking-tight text-gray-900">
                Build<span className="text-finexy-orange">Base</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                CRM Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Split View */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-[calc(100vh-140px)]">
          
          {/* Hero Section (Left) */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Automate your sales with our <span className="text-finexy-orange">AI Agent.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-md">
              Chat with our intelligent assistant to see how Base Digitally can qualify leads, answer FAQs, and grow your pipeline 24/7.
            </p>
            <div className="pt-4 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Bot is online
              </span>
            </div>
          </div>

          {/* Typebot Chat Interface (Right) */}
          <div className="h-full max-h-[700px] w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hidden lg:block">
            <iframe
              src={typebotUrl}
              className="w-full h-full border-none"
              title="Base Digitally AI Agent"
            ></iframe>
          </div>
          
          {/* Mobile Chat Interface (Visible only on small screens) */}
          <div className="h-[600px] w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 lg:hidden mt-8">
             <iframe
              src={typebotUrl}
              className="w-full h-full border-none"
              title="Base Digitally AI Agent"
            ></iframe>
          </div>

        </div>
      </main>
    </div>
  );
}
