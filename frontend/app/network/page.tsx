"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { ArrowLeft, UserPlus, Users, Check, X, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaryonLoader } from "@/components/ui/baryon-loader";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  name: string;
  stats: {
    percent: number;
    role: string;
  };
}

interface FriendRequests {
  received: { id: string; name: string }[];
  sent: string[];
}

export default function NetworkPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequests>({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/friends`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/friends/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        if (friendsRes.status === 401 || requestsRes.status === 401) {
            router.push("/login");
            return;
        }

        const friendsData = await friendsRes.json();
        const requestsData = await requestsRes.json();

        setFriends(friendsData);
        setRequests(requestsData);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleAccept = async (requesterId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
        await fetch(`${API_BASE_URL}/friends/accept/${requesterId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh
        fetchData(token);
    } catch (e) {
        console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);

    try {
        const res = await fetch(`${API_BASE_URL}/public/profile/${searchId}`);
        if (!res.ok) throw new Error("Operator not found");
        const data = await res.json();
        setSearchResult(data);
    } catch (e) {
        setSearchError("Signal Lost: Operator ID invalid or offline.");
    } finally {
        setSearchLoading(false);
    }
  };

  const handleConnectToSearch = async () => {
      if (!searchId) return;
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
          const res = await fetch(`${API_BASE_URL}/friends/request/${searchId}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              alert("Transmission Sent.");
              setSearchId("");
              setSearchResult(null);
              fetchData(token);
          } else {
              const err = await res.json();
              alert(err.detail || "Failed to send request");
          }
      } catch (e) {
          console.error(e);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <BaryonLoader className="scale-150 text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-amber-500/30 selection:text-amber-50">
       <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
       
       <header className="p-8 flex justify-between items-center z-50 relative">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> PATH_OS
          </Button>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-16">
         
         {/* Search Section */}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-white/10 bg-zinc-900/20 backdrop-blur-sm rounded-lg"
         >
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-zinc-500" />
                Find Operator
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Input 
                        placeholder="Enter Operator ID..." 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="bg-black/50 border-zinc-800 text-white font-mono h-12"
                    />
                </div>
                <Button 
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-widest uppercase"
                >
                    {searchLoading ? <BaryonLoader className="w-4 h-4 text-black" /> : "Scan"}
                </Button>
            </div>

            {searchError && (
                <div className="mt-4 p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-sm font-mono flex items-center gap-2">
                    <X className="w-4 h-4" /> {searchError}
                </div>
            )}

            {searchResult && (
                <div className="mt-6 p-6 border border-amber-500/30 bg-amber-500/5 rounded flex items-center justify-between">
                    <div>
                        <div className="text-xs text-amber-500 uppercase tracking-widest mb-1">Target Identified</div>
                        <h3 className="text-xl font-bold">{searchResult.name}</h3>
                        <p className="text-zinc-500 text-sm">{searchResult.role}</p>
                    </div>
                    <Button 
                        onClick={handleConnectToSearch}
                        className="bg-amber-500 text-black hover:bg-amber-400"
                    >
                        <UserPlus className="w-4 h-4 mr-2" /> Connect
                    </Button>
                </div>
            )}
         </motion.div>

         {/* Requests Section */}
         {requests.received.length > 0 && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
             >
                 <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-500" />
                    Incoming Transmissions
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {requests.received.map((req) => (
                         <div key={req.id} className="p-4 border border-amber-500/30 bg-amber-500/5 flex items-center justify-between rounded">
                             <span className="font-bold">{req.name}</span>
                             <div className="flex gap-2">
                                 <Button size="sm" onClick={() => handleAccept(req.id)} className="bg-amber-500 text-black hover:bg-amber-400">
                                     <Check className="w-4 h-4 mr-1" /> Accept
                                 </Button>
                             </div>
                         </div>
                     ))}
                 </div>
             </motion.div>
         )}

         {/* Friends Grid */}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
         >
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Network Nodes
                </h2>
                <span className="text-zinc-500 text-sm uppercase tracking-widest">
                    {friends.length} Active Connections
                </span>
            </div>

            {friends.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-zinc-800 rounded-lg">
                    <p className="text-zinc-500 mb-4">No connections established.</p>
                    <Link href="/u/demo">
                        <Button variant="outline" className="border-white/10">Find Operators</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {friends.map((friend) => (
                        <div key={friend.id} className="group relative p-6 border border-white/10 bg-zinc-900/20 hover:border-amber-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{friend.name}</h3>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                                        {friend.stats.role}
                                    </p>
                                </div>
                                <Link href={`/u/${friend.id}`}>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>PROTOCOL COMPLETION</span>
                                    <span>{friend.stats.percent}%</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-800 overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500" 
                                        style={{ width: `${friend.stats.percent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </motion.div>

      </main>
    </div>
  );
}
