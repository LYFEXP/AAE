import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, DollarSign, Sparkles, Send, BarChart3, Settings, Zap } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/offers', icon: DollarSign, label: 'Offers' },
    { path: '/factory', icon: Sparkles, label: 'Factory' },
    { path: '/publisher', icon: Send, label: 'Publisher' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <aside className="w-72 bg-gray-900/40 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Affiliate AI Hub</h1>
              <p className="text-xs text-gray-400">Content Automation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400' : ''}`} />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>

          <div className="mt-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-xs font-semibold text-gray-300">API Status</span>
            </div>
            <p className="text-xs text-gray-500">All systems operational</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
