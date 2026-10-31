import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Building2, 
  Globe, 
  DollarSign, 
  Filter, 
  Clock, 
  Tag, 
  X,
  Lightbulb
} from 'lucide-react';
import { FinanceNewsItem, MarketTicker } from '../types';

export const UpdatesSection: React.FC = () => {
  const [news, setNews] = useState<FinanceNewsItem[]>([]);
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<FinanceNewsItem | null>(null);

  const fetchFinanceUpdates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/finance-news');
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setTickers(data.tickers || []);
        setLastUpdated(data.lastUpdated || new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn('Finance news fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceUpdates();
    const interval = setInterval(fetchFinanceUpdates, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const categories = ['All', 'Venture Capital', 'Macro Economy', 'Startups', 'Supply Chain', 'Tech Infrastructure', 'Retail & Commerce'];

  const filteredNews = news.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Finance & Global Business Intelligence
              </h1>
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md border border-slate-200 uppercase">
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Stay ahead with real-time financial markets, venture capital inflows, interest rates, and macro trade shifts designed specifically for entrepreneurs and ambitious teenagers.
            </p>
          </div>

          <button
            onClick={fetchFinanceUpdates}
            disabled={isLoading}
            className="flex items-center justify-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Feed'}</span>
          </button>
        </div>

        {/* Live Market Tickers Bar */}
        {tickers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Key Global Indicators
              </span>
              <span className="text-[10px] text-slate-400">
                Updated: {lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {tickers.map(ticker => (
                <div
                  key={ticker.symbol}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-2xs"
                >
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{ticker.symbol}</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{ticker.value}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${ticker.positive ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {ticker.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Category Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search markets, seed rounds, AI compute, tariffs..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <Globe className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching updates</p>
            <p className="text-xs text-slate-500 mt-1">Try another category or search term.</p>
          </div>
        ) : (
          filteredNews.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {item.category}
                  </span>
                  <div className="flex items-center text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug hover:text-slate-700 cursor-pointer"
                    onClick={() => setSelectedNewsDetail(item)}>
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* Entrepreneur Impact Highlight */}
                {item.impact && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-700 font-medium leading-tight">
                      <span className="font-bold text-slate-900">Founder Takeaway: </span>
                      {item.impact}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Source & Link Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Source: {item.source}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedNewsDetail(item)}
                    className="text-xs font-semibold text-slate-900 hover:underline"
                  >
                    Analysis
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Open original publication"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expanded News Detail Modal */}
      {selectedNewsDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700 uppercase">
                {selectedNewsDetail.category} Report
              </span>
              <button
                onClick={() => setSelectedNewsDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {selectedNewsDetail.title}
              </h2>

              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>{selectedNewsDetail.source}</span>
                <span>•</span>
                <span>{selectedNewsDetail.timestamp}</span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>{selectedNewsDetail.summary}</p>
                {selectedNewsDetail.impact && (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">Strategic Significance for VLITS Founders:</h4>
                    <p className="text-slate-700">{selectedNewsDetail.impact}</p>
                  </div>
                )}
              </div>

              {selectedNewsDetail.tags && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedNewsDetail.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <a
                  href={selectedNewsDetail.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-slate-900 hover:underline"
                >
                  Read Full Financial Report <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
                <button
                  onClick={() => setSelectedNewsDetail(null)}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
