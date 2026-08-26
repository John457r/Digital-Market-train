import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency, cn } from "../../lib/utils";
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  LayoutGrid,
  History,
  FileBox,
  Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function Trading() {
  const { profile } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Open Positions");
  const [orderType, setOrderType] = useState("Market");
  const [leverage, setLeverage] = useState(20);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current) {
        new window.TradingView.widget({
          container_id: "tradingview_widget",
          auto_size: true,
          symbol: "BINANCE:BTCUSDT",
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#000000",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          details: false,
          hotlist: false,
          calendar: false,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          backgroundColor: "#000000",
          gridColor: "rgba(255, 255, 255, 0.05)",
          save_image: false,
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  // Mock Order Book Data Generator
  const generateOrders = (count: number, startPrice: number, step: number, isAsk: boolean) => {
    return Array.from({ length: count }).map((_, i) => {
      const price = isAsk ? startPrice + (i * step) : startPrice - (i * step);
      return {
        price: price.toFixed(1),
        amount: (Math.random() * 2).toFixed(4),
        total: (Math.random() * 100000).toFixed(2),
        width: Math.floor(Math.random() * 100)
      };
    });
  };

  const asks = generateOrders(12, 64280.5, 0.5, true).reverse();
  const bids = generateOrders(12, 64278.2, 0.5, false);

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Ticker Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3 px-6 overflow-hidden">
        <div className="flex items-center gap-3 pr-6 border-r border-[#1a1a1a]">
          <h3 className="text-sm font-black text-white px-2 py-0.5 bg-[#ffd700] text-black rounded text-[10px]">BTC/USDT</h3>
          <span className="text-sm font-black text-[#00ff66]">$64,279.40</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase">+2.45%</span>
        </div>
        <div className="flex flex-1 gap-8 overflow-x-auto scrollbar-hide">
           {[
            { label: "24h High", val: "65,120.00" },
            { label: "24h Low", val: "62,840.45" },
            { label: "24h Vol(BTC)", val: "42,109.12" },
            { label: "24h Vol(USDT)", val: "2.7B" },
           ].map((s, i) => (
             <div key={i} className="shrink-0">
               <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">{s.label}</div>
               <div className="text-xs font-bold text-white/80">{s.val}</div>
             </div>
           ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 border-l border-[#1a1a1a] pl-6 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></div>
          Live Exchange // Latency: 4ms
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 min-h-[850px]">
        {/* Main Chart Area & Position Manager */}
        <div className="lg:col-span-9 flex flex-col gap-6 h-full">
          <div className="flex-1 min-h-[600px] bg-black border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold text-white uppercase tracking-widest">Standard Mode</div>
                <div className="px-3 py-1 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded text-[10px] font-black text-[#ffd700] uppercase tracking-widest">Isolated Leverage</div>
             </div>
             <div id="tradingview_widget" ref={containerRef} className="w-full h-full" />
          </div>

          {/* Position Manager */}
          <div className="h-[250px] bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden flex flex-col shadow-xl">
             <div className="bg-black/50 border-b border-[#1a1a1a] flex items-center justify-between px-6">
                <div className="flex gap-8">
                   {["Open Positions", "Order History", "Transaction Logs"].map(tab => (
                     <button 
                       key={tab} 
                       onClick={() => setActiveTab(tab)}
                       className={cn(
                         "py-4 text-[10px] font-black uppercase tracking-widest relative transition-colors",
                         activeTab === tab ? "text-[#00ff66]" : "text-gray-500 hover:text-gray-300"
                       )}
                     >
                       {tab}
                       {activeTab === tab && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00ff66]" />}
                     </button>
                   ))}
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black text-gray-600 uppercase">
                  <span className="flex items-center gap-1"><Settings2 size={10} /> Auto-Deleverage: Off</span>
                  <span className="flex items-center gap-1"><FileBox size={10} /> Export History</span>
                </div>
             </div>
             
             <div className="flex-1 overflow-auto p-4 scrollbar-hide">
                {activeTab === "Open Positions" ? (
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="text-gray-600 uppercase font-black border-b border-[#1a1a1a]">
                        <th className="pb-3 px-2">Symbol</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3 text-right">Size</th>
                        <th className="pb-3 text-right">Entry Price</th>
                        <th className="pb-3 text-right">Mark Price</th>
                        <th className="pb-3 text-right">Liquidation Price</th>
                        <th className="pb-3 text-right">Unrealized PnL</th>
                        <th className="pb-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {[
                        { symbol: "BTC/USDT", type: "Long 20x", size: "0.245 BTC", entry: "63,842.12", mark: "64,279.40", liq: "60,942.00", pnl: "$107.13 (+12.4%)" }
                      ].map((pos, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-2 font-black text-white">{pos.symbol}</td>
                          <td className="py-4"><span className="text-[#00ff66] font-black px-1.5 py-0.5 bg-[#00ff66]/10 rounded">{pos.type}</span></td>
                          <td className="py-4 text-right font-medium">{pos.size}</td>
                          <td className="py-4 text-right text-gray-400">{pos.entry}</td>
                          <td className="py-4 text-right text-gray-400">{pos.mark}</td>
                          <td className="py-4 text-right text-[#ffd700]">{pos.liq}</td>
                          <td className="py-4 text-right">
                             <div className="text-[#00ff66] font-black">{pos.pnl.split(' ')[0]}</div>
                             <div className="text-[9px] text-[#00ff66]/60 font-bold">{pos.pnl.split(' ')[1]}</div>
                          </td>
                          <td className="py-4 text-center">
                             <button className="px-3 py-1 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded text-[9px] font-black transition-all">CLOSE</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-700 italic text-[10px] uppercase font-black tracking-widest gap-2">
                    <History size={14} /> Synchronizing ledger history...
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar: Order Book & Execution Card */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           {/* Order Book */}
           <div className="flex-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl flex flex-col overflow-hidden shadow-xl">
             <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <LayoutGrid size={12} className="text-[#ffd700]" /> Order Book
                </h4>
                <div className="flex gap-1">
                   <div className="w-4 h-4 bg-[#00ff66]/20 rounded-sm"></div>
                   <div className="w-4 h-4 bg-red-500/20 rounded-sm"></div>
                </div>
             </div>

             <div className="flex-1 overflow-hidden flex flex-col p-2">
                <div className="grid grid-cols-2 text-[9px] px-2 text-gray-600 font-black uppercase tracking-tighter mb-2">
                  <div>Price (USDT)</div>
                  <div className="text-right">Amount (BTC)</div>
                </div>

                {/* Asks (Sells) */}
                <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-0.5">
                   {asks.map((ord, i) => (
                     <div key={i} className="relative group cursor-pointer h-5 flex items-center">
                        <div className="absolute right-0 top-0 h-full bg-red-500/5 transition-all group-hover:bg-red-500/20" style={{ width: `${ord.width}%` }} />
                        <div className="relative z-10 w-full grid grid-cols-2 px-2 text-[10px]">
                           <div className="text-red-500 font-bold">{ord.price}</div>
                           <div className="text-right text-gray-400 font-medium">{ord.amount}</div>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Current Price spread */}
                <div className="my-3 flex items-center flex-col justify-center border-y border-[#1a1a1a] py-3 bg-black/40">
                   <div className="text-lg font-black text-[#00ff66] flex items-center gap-2">
                      64,279.40 <ArrowUpRight size={18} />
                   </div>
                   <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Index: 64,281.02 // Mark: 64,279.11</div>
                </div>

                {/* Bids (Buys) */}
                <div className="flex-1 overflow-hidden space-y-0.5">
                   {bids.map((ord, i) => (
                     <div key={i} className="relative group cursor-pointer h-5 flex items-center">
                        <div className="absolute right-0 top-0 h-full bg-[#00ff66]/5 transition-all group-hover:bg-[#00ff66]/20" style={{ width: `${ord.width}%` }} />
                        <div className="relative z-10 w-full grid grid-cols-2 px-2 text-[10px]">
                           <div className="text-[#00ff66] font-bold">{ord.price}</div>
                           <div className="text-right text-gray-400 font-medium">{ord.amount}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>

           {/* Execution Card */}
           <div className="p-6 bg-[#0d0d0d] border border-[#ffd700]/20 rounded-2xl flex flex-col shadow-xl">
             <div className="flex gap-4 mb-6">
                {["Limit", "Market"].map(type => (
                  <button 
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all",
                      orderType === type ? "bg-[#ffd700] text-black" : "bg-[#111] text-gray-500 border border-[#1a1a1a]"
                    )}
                  >
                    {type}
                  </button>
                ))}
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                   <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                     <span>Price</span>
                     <span className="text-[#ffd700]">USDT</span>
                   </div>
                   <input disabled={orderType === "Market"} placeholder={orderType === "Market" ? "Market Price" : "64,279.40"} className="w-full bg-black border border-[#1a1a1a] rounded p-2.5 text-xs text-white font-black outline-none focus:border-[#ffd700] transition-colors" />
                </div>

                <div className="space-y-1.5">
                   <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                     <span>Size</span>
                     <span className="text-[#ffd700]">BTC</span>
                   </div>
                   <input placeholder="0.00" className="w-full bg-black border border-[#1a1a1a] rounded p-2.5 text-xs text-white font-black outline-none focus:border-[#ffd700] transition-colors" />
                </div>

                {/* Leverage Slider */}
                <div className="space-y-3 pt-2">
                   <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                     <span>Leverage</span>
                     <span className="text-[#ffd700]">{leverage}x Cross</span>
                   </div>
                   <div className="relative h-1 bg-[#1a1a1a] rounded-full">
                      <input 
                        type="range" 
                        min="1" 
                        max="125" 
                        value={leverage}
                        onChange={(e) => setLeverage(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-full bg-[#ffd700] rounded-full relative" style={{ width: `${(leverage / 125) * 100}%` }}>
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#ffd700] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)] border-2 border-black" />
                      </div>
                   </div>
                   <div className="flex justify-between text-[8px] font-bold text-gray-700">
                      <span>1x</span>
                      <span>25x</span>
                      <span>50x</span>
                      <span>75x</span>
                      <span>100x</span>
                      <span>125x</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="space-y-1 text-[8px] font-bold text-gray-600 uppercase">
                      <div>Cost: <span className="text-white">0.00 USDT</span></div>
                      <div>Max: <span className="text-white">12.42 BTC</span></div>
                   </div>
                </div>

                <div className="flex gap-4 pt-2">
                   <button className="flex-1 py-4 bg-[#00ff66] text-black font-black uppercase tracking-tighter text-xs rounded hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,255,102,0.2)]">
                      Buy / Long
                   </button>
                   <button className="flex-1 py-4 bg-red-500 text-white font-black uppercase tracking-tighter text-xs rounded hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.2)]">
                      Sell / Short
                   </button>
                </div>
                
                <p className="text-[8px] text-gray-700 text-center uppercase font-bold tracking-widest pt-2">
                   Asset availability: {formatCurrency(profile?.balance || 0)} USDT
                </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
