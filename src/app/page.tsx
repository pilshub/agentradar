"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Player, Mencion } from "@/types";
import { PLAYERS } from "@/data/players";
import noticiasData from "@/data/noticias.json";
import { getExtendedPlayerData, formatFollowers, getContractDaysRemaining, getContractStatus, ExtendedPlayerData } from "@/data/player-extended";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, BarChart, Bar,
} from "recharts";
import {
  Activity, TrendingUp, TrendingDown, Newspaper, BarChart3, Clock, ExternalLink,
  ChevronRight, Radio, Zap, Target, Hash, Sparkles, Search, Command,
  ArrowUpRight, ArrowDownRight, Filter, RefreshCw, User, FileText, Calendar,
  DollarSign, Heart, AlertTriangle, Bell, Instagram, Twitter, Star, Shield,
  Briefcase, Award, Timer, Download, Eye, MessageCircle, Users, Globe,
  Flame, TrendingUp as Trending, CheckCircle, XCircle, AlertCircle, Info,
} from "lucide-react";

interface PlayerMetrics {
  totalMenciones: number;
  positivas: number;
  negativas: number;
  neutrales: number;
  ratio: number;
  fuentesPrincipales: { fuente: string; count: number }[];
  keywords: { word: string; count: number }[];
}

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(PLAYERS[0]);
  const [noticias, setNoticias] = useState<Mencion[]>([]);
  const [metrics, setMetrics] = useState<PlayerMetrics | null>(null);
  const [extendedData, setExtendedData] = useState<ExtendedPlayerData | null>(null);
  const [selectedNews, setSelectedNews] = useState<Mencion | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandOpen, setCommandOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (e.key >= "1" && e.key <= "9" && !e.metaKey && !e.ctrlKey && !commandOpen) {
        const idx = parseInt(e.key) - 1;
        if (PLAYERS[idx]) {
          setSelectedPlayer(PLAYERS[idx]);
          toast.success(`Seleccionado: ${PLAYERS[idx].name}`);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen]);

  useEffect(() => {
    const playerNews = (noticiasData.byPlayer as Record<string, Mencion[]>)[selectedPlayer.name] || [];
    const playerMetrics = (noticiasData as { metrics?: Record<string, PlayerMetrics> }).metrics?.[selectedPlayer.name] || null;
    setNoticias(playerNews);
    setMetrics(playerMetrics);
    const extended = getExtendedPlayerData(selectedPlayer.id);
    setExtendedData(extended);
    setUnreadAlerts(extended.alerts.filter(a => !a.read).length);
  }, [selectedPlayer]);

  const allPlayersMetrics = useMemo(() => {
    return PLAYERS.map(player => {
      const m = (noticiasData as { metrics?: Record<string, PlayerMetrics> }).metrics?.[player.name];
      return {
        player,
        metrics: m,
        sentimentScore: m ? (m.positivas - m.negativas) : 0,
        totalMentions: m?.totalMenciones || 0
      };
    }).sort((a, b) => b.totalMentions - a.totalMentions);
  }, []);

  const sentimentData = useMemo(() => {
    const pos = noticias.filter(n => n.sentimiento?.tipo === "positivo").length;
    const neg = noticias.filter(n => n.sentimiento?.tipo === "negativo").length;
    const neu = noticias.filter(n => !n.sentimiento?.tipo || n.sentimiento?.tipo === "neutral").length;
    return { pos, neg, neu, total: noticias.length };
  }, [noticias]);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch { return ""; }
  };

  const fetchAiAnalysis = useCallback(async (noticia: Mencion) => {
    setLoadingAi(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: noticia.titulo,
          descripcion: noticia.descripcion,
          jugador: selectedPlayer.name,
          fuente: noticia.fuente,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || data.error || "No analysis available");
    } catch {
      setAiAnalysis("Error connecting to AI service");
    } finally {
      setLoadingAi(false);
    }
  }, [selectedPlayer]);

  useEffect(() => {
    if (selectedNews) fetchAiAnalysis(selectedNews);
  }, [selectedNews, fetchAiAnalysis]);

  const playerRank = allPlayersMetrics.findIndex(p => p.player.id === selectedPlayer.id) + 1;
  const sentimentIndex = sentimentData.pos - sentimentData.neg;
  const isBetis = selectedPlayer.team === "Real Betis";
  const contractStatus = extendedData ? getContractStatus(extendedData.contract.endDate) : null;
  const contractDays = extendedData ? getContractDaysRemaining(extendedData.contract.endDate) : 0;

  const exportToPDF = async () => {
    toast.promise(
      (async () => {
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;

        if (!reportRef.current) return;

        const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#0a0a0a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${selectedPlayer.name}_report.pdf`);
      })(),
      {
        loading: 'Generando PDF...',
        success: 'PDF descargado',
        error: 'Error al generar PDF',
      }
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Command Palette */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Buscar jugador..." />
          <CommandList>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup heading="Jugadores">
              {PLAYERS.map((player) => (
                <CommandItem
                  key={player.id}
                  onSelect={() => {
                    setSelectedPlayer(player);
                    setCommandOpen(false);
                    toast.success(`Seleccionado: ${player.name}`);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{player.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {player.team === "Real Betis" ? "BET" : "SEV"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Radar Logo */}
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20">
                  <div className="w-5 h-5 rounded-full border border-white/30" />
                  <div className="absolute w-2.5 h-2.5 rounded-full border border-white/20" />
                  <div className="absolute w-0.5 h-3 bg-white/70 origin-bottom animate-spin" style={{ animationDuration: '2s', bottom: '50%', left: 'calc(50% - 1px)' }} />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight gradient-text-brand">AgentRadar</span>
                  <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Monitor Pro</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setCommandOpen(true)}>
                <Command className="w-3 h-3 mr-2" />
                <span className="hidden sm:inline">Buscar</span>
                <kbd className="ml-2 hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={() => setActiveTab("alerts")}>
                    <Bell className="w-4 h-4" />
                    {unreadAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {unreadAlerts}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alertas</TooltipContent>
              </Tooltip>
              <span className="font-mono text-xs text-green-500">
                {currentTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Left Sidebar - Player List */}
          <aside className="w-56 border-r border-border bg-card/30 hidden lg:block">
            <div className="p-3 border-b border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jugadores</h3>
            </div>
            <ScrollArea className="h-[calc(100vh-100px)]">
              {PLAYERS.map((player, idx) => {
                const pm = allPlayersMetrics.find(p => p.player.id === player.id);
                const isSelected = selectedPlayer.id === player.id;
                const ext = getExtendedPlayerData(player.id);
                const alerts = ext.alerts.filter(a => !a.read).length;
                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all border-l-2 ${
                      isSelected
                        ? `bg-primary/10 ${player.team === "Real Betis" ? "border-l-green-500" : "border-l-red-500"}`
                        : "border-l-transparent hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.photo} alt={player.name} />
                      <AvatarFallback className="text-[10px]">{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className={`text-sm truncate ${isSelected ? "text-primary font-medium" : ""}`}>
                          {player.name}
                        </p>
                        {alerts > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-muted-foreground">
                          {player.team === "Real Betis" ? "BET" : "SEV"}
                        </p>
                        <span className={`text-[10px] font-mono ${
                          (pm?.sentimentScore || 0) > 0 ? "text-green-500" :
                          (pm?.sentimentScore || 0) < 0 ? "text-red-500" : "text-muted-foreground"
                        }`}>
                          {(pm?.sentimentScore || 0) > 0 ? "+" : ""}{pm?.sentimentScore || 0}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-auto" ref={reportRef}>
            {/* Player Header Card */}
            <Card className={`mb-4 overflow-hidden ${
              isBetis ? "bg-gradient-to-r from-green-950/50 to-card" : "bg-gradient-to-r from-red-950/50 to-card"
            }`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Photo */}
                  <div className="relative">
                    <Avatar className={`w-24 h-24 ring-2 ${isBetis ? "ring-green-500/50" : "ring-red-500/50"}`}>
                      <AvatarImage src={selectedPlayer.photo} alt={selectedPlayer.name} className="object-cover" />
                      <AvatarFallback className="text-3xl font-bold">#{selectedPlayer.number}</AvatarFallback>
                    </Avatar>
                    <Badge className={`absolute -bottom-1 -right-1 ${isBetis ? "bg-green-500" : "bg-red-500"}`}>
                      #{playerRank}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{selectedPlayer.name}</h1>
                      {extendedData && contractStatus?.status === "critical" && (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Contrato expira
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{selectedPlayer.fullName}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={isBetis ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"}>
                        {selectedPlayer.team}
                      </Badge>
                      <Badge variant="outline">{selectedPlayer.position}</Badge>
                      <Badge variant="outline">{selectedPlayer.nationality}</Badge>
                      <Badge variant="outline" className="font-mono">#{selectedPlayer.number}</Badge>
                      <Badge variant="outline">{selectedPlayer.age} años</Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-3">
                    <div className="text-center px-4 py-2 bg-black/20 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase">Valor</p>
                      <p className="text-xl font-bold text-green-500 font-mono">{selectedPlayer.marketValue}</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-black/20 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase">Menciones</p>
                      <p className="text-xl font-bold font-mono">{sentimentData.total}</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-black/20 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase">Índice</p>
                      <p className={`text-xl font-bold font-mono ${sentimentIndex > 0 ? "text-green-500" : sentimentIndex < 0 ? "text-red-500" : ""}`}>
                        {sentimentIndex > 0 ? "+" : ""}{sentimentIndex}
                      </p>
                    </div>
                    {extendedData && (
                      <div className="text-center px-4 py-2 bg-black/20 rounded-lg">
                        <p className="text-[10px] text-muted-foreground uppercase">Contrato</p>
                        <p className={`text-xl font-bold font-mono ${contractStatus?.status === "critical" ? "text-red-500" : contractStatus?.status === "warning" ? "text-yellow-500" : "text-green-500"}`}>
                          {contractDays}d
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Export Button */}
                  <Button variant="outline" size="sm" onClick={exportToPDF} className="shrink-0">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-6 w-full max-w-2xl">
                <TabsTrigger value="overview" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="contract" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Contrato
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="transfers" className="text-xs">
                  <Trending className="w-3 h-3 mr-1" />
                  Rumores
                </TabsTrigger>
                <TabsTrigger value="alerts" className="text-xs relative">
                  <Bell className="w-3 h-3 mr-1" />
                  Alertas
                  {unreadAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadAlerts}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Sentiment & News */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Sentiment Bar */}
                    {sentimentData.total > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Análisis de Sentimiento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex h-3 rounded-full overflow-hidden bg-muted mb-2">
                            <div className="bg-green-500 transition-all" style={{ width: `${(sentimentData.pos / sentimentData.total) * 100}%` }} />
                            <div className="bg-gray-500 transition-all" style={{ width: `${(sentimentData.neu / sentimentData.total) * 100}%` }} />
                            <div className="bg-red-500 transition-all" style={{ width: `${(sentimentData.neg / sentimentData.total) * 100}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="text-green-500">{sentimentData.pos} Positivas ({Math.round((sentimentData.pos / sentimentData.total) * 100)}%)</span>
                            <span>{sentimentData.neu} Neutrales</span>
                            <span className="text-red-500">{sentimentData.neg} Negativas ({Math.round((sentimentData.neg / sentimentData.total) * 100)}%)</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent News */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Últimas Noticias
                          </CardTitle>
                          <Badge variant="secondary">{noticias.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[300px]">
                          {noticias.slice(0, 10).map((noticia, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedNews(noticia)}
                              className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-1 h-10 rounded-full ${
                                  noticia.sentimiento?.tipo === "positivo" ? "bg-green-500" :
                                  noticia.sentimiento?.tipo === "negativo" ? "bg-red-500" : "bg-gray-500"
                                }`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] text-muted-foreground">{noticia.fuente}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">{formatTimeAgo(noticia.fecha)}</span>
                                  </div>
                                  <p className="text-sm line-clamp-2">{noticia.titulo}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Side Info */}
                  <div className="space-y-4">
                    {/* Contract Quick View */}
                    {extendedData && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Contrato
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Expira</span>
                            <span className="font-mono text-sm">{new Date(extendedData.contract.endDate).toLocaleDateString("es-ES")}</span>
                          </div>
                          <Progress value={(contractDays / 365) * 100} className={`h-2 ${contractStatus?.status === "critical" ? "[&>div]:bg-red-500" : contractStatus?.status === "warning" ? "[&>div]:bg-yellow-500" : ""}`} />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Salario</span>
                            <span className="font-mono text-sm text-green-500">{extendedData.contract.salary}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Cláusula</span>
                            <span className="font-mono text-sm">{extendedData.contract.releaseClause || "N/A"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Current Season Stats */}
                    {extendedData && extendedData.currentStats.appearances > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Temporada {extendedData.currentStats.season}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-muted/30 rounded-lg p-2">
                              <p className="text-xl font-bold">{extendedData.currentStats.goals}</p>
                              <p className="text-[10px] text-muted-foreground">Goles</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2">
                              <p className="text-xl font-bold">{extendedData.currentStats.assists}</p>
                              <p className="text-[10px] text-muted-foreground">Asist.</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2">
                              <p className="text-xl font-bold">{extendedData.currentStats.appearances}</p>
                              <p className="text-[10px] text-muted-foreground">Partidos</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold">{extendedData.currentStats.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Injury Risk */}
                    {extendedData && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Estado Físico
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Riesgo de lesión</span>
                            <Badge variant={extendedData.injuryRisk === "low" ? "default" : extendedData.injuryRisk === "medium" ? "secondary" : "destructive"}>
                              {extendedData.injuryRisk === "low" ? "Bajo" : extendedData.injuryRisk === "medium" ? "Medio" : "Alto"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Días lesionado (temp.)</span>
                            <span className="font-mono">{extendedData.totalDaysInjured}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* CONTRACT TAB */}
              <TabsContent value="contract" className="space-y-4">
                {extendedData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Detalles del Contrato
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha de Firma</p>
                            <p className="font-medium">{extendedData.contract.signedDate !== "N/D" ? new Date(extendedData.contract.signedDate).toLocaleDateString("es-ES") : "N/D"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                            <p className="font-medium">{new Date(extendedData.contract.endDate).toLocaleDateString("es-ES")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Salario Anual</p>
                            <p className="font-medium text-green-500">{extendedData.contract.salary}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cláusula de Rescisión</p>
                            <p className="font-medium">{extendedData.contract.releaseClause || "Sin cláusula"}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Agente</p>
                          <p className="font-medium">{extendedData.contract.agent}</p>
                          <p className="text-sm text-muted-foreground">{extendedData.contract.agentContact}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Tiempo restante</span>
                            <Badge variant={contractStatus?.status === "critical" ? "destructive" : contractStatus?.status === "warning" ? "secondary" : "default"}>
                              {contractStatus?.text}
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold font-mono mb-2">{contractDays} días</div>
                          <Progress value={Math.min((contractDays / (365 * 3)) * 100, 100)} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Evolución del Valor de Mercado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {extendedData.marketValueHistory.length > 0 ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={extendedData.marketValueHistory}>
                                <defs>
                                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}M`} />
                                <RechartsTooltip
                                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                  formatter={(value: number) => [`${value}M €`, 'Valor']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#valueGradient)" strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            Sin datos históricos
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* STATS TAB */}
              <TabsContent value="stats" className="space-y-4">
                {extendedData && (
                  <>
                    {/* Current Season */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Estadísticas Temporada {extendedData.currentStats.season}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: "Partidos", value: extendedData.currentStats.appearances, icon: Calendar },
                            { label: "Goles", value: extendedData.currentStats.goals, icon: Target },
                            { label: "Asistencias", value: extendedData.currentStats.assists, icon: Users },
                            { label: "Minutos", value: extendedData.currentStats.minutes, icon: Timer },
                            { label: "Rating", value: extendedData.currentStats.rating.toFixed(1), icon: Star },
                          ].map((stat, i) => (
                            <div key={i} className="bg-muted/30 rounded-lg p-4 text-center">
                              <stat.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-2xl font-bold">{stat.value}</p>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Season History */}
                    {extendedData.seasonHistory.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Historial por Temporada</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Temporada</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead className="text-center">PJ</TableHead>
                                <TableHead className="text-center">G</TableHead>
                                <TableHead className="text-center">A</TableHead>
                                <TableHead className="text-center">Min</TableHead>
                                <TableHead className="text-center">Rating</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {extendedData.seasonHistory.map((season, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{season.season}</TableCell>
                                  <TableCell>{season.team}</TableCell>
                                  <TableCell className="text-center">{season.appearances}</TableCell>
                                  <TableCell className="text-center font-mono">{season.goals}</TableCell>
                                  <TableCell className="text-center font-mono">{season.assists}</TableCell>
                                  <TableCell className="text-center font-mono">{season.minutes}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant={season.rating >= 7 ? "default" : "secondary"}>
                                      {season.rating.toFixed(1)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {/* Injuries */}
                    {extendedData.injuries.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Historial de Lesiones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Lesión</TableHead>
                                <TableHead className="text-center">Días</TableHead>
                                <TableHead className="text-center">Partidos</TableHead>
                                <TableHead>Severidad</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {extendedData.injuries.map((injury, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{new Date(injury.date).toLocaleDateString("es-ES")}</TableCell>
                                  <TableCell>{injury.injury}</TableCell>
                                  <TableCell className="text-center font-mono">{injury.daysOut}</TableCell>
                                  <TableCell className="text-center font-mono">{injury.matches}</TableCell>
                                  <TableCell>
                                    <Badge variant={injury.severity === "low" ? "secondary" : injury.severity === "medium" ? "default" : "destructive"}>
                                      {injury.severity === "low" ? "Leve" : injury.severity === "medium" ? "Media" : "Grave"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* SOCIAL TAB */}
              <TabsContent value="social" className="space-y-4">
                {extendedData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Social Media Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Redes Sociales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Instagram */}
                        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Instagram className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{extendedData.socialMedia.instagram.handle || "Instagram"}</p>
                            <p className="text-xl font-bold">{formatFollowers(extendedData.socialMedia.instagram.followers)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Engagement</p>
                            <p className="font-mono text-green-500">{extendedData.socialMedia.instagram.engagement}%</p>
                          </div>
                        </div>

                        {/* Twitter */}
                        <div className="flex items-center gap-4 p-3 bg-blue-500/10 rounded-lg">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Twitter className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{extendedData.socialMedia.twitter.handle || "Twitter/X"}</p>
                            <p className="text-xl font-bold">{formatFollowers(extendedData.socialMedia.twitter.followers)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Engagement</p>
                            <p className="font-mono text-green-500">{extendedData.socialMedia.twitter.engagement}%</p>
                          </div>
                        </div>

                        {/* TikTok */}
                        {extendedData.socialMedia.tiktok && (
                          <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/20">
                              <span className="text-white font-bold text-sm">TT</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{extendedData.socialMedia.tiktok.handle || "TikTok"}</p>
                              <p className="text-xl font-bold">{formatFollowers(extendedData.socialMedia.tiktok.followers)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Engagement</p>
                              <p className="font-mono text-green-500">{extendedData.socialMedia.tiktok.engagement}%</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Brand Value */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Valor de Marca
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-2">Valor Estimado</p>
                          <p className="text-4xl font-bold text-green-500">{extendedData.socialMedia.brandValue}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-3">Patrocinadores</p>
                          {extendedData.socialMedia.sponsors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {extendedData.socialMedia.sponsors.map((sponsor, idx) => (
                                <Badge key={idx} variant="outline" className="px-3 py-1">
                                  {sponsor}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin patrocinadores conocidos</p>
                          )}
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-2">Alcance Total</p>
                          <p className="text-2xl font-bold">
                            {formatFollowers(
                              extendedData.socialMedia.instagram.followers +
                              extendedData.socialMedia.twitter.followers +
                              (extendedData.socialMedia.tiktok?.followers || 0)
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">seguidores combinados</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* TRANSFERS TAB */}
              <TabsContent value="transfers" className="space-y-4">
                {extendedData && (
                  <>
                    {extendedData.transferRumors.length > 0 ? (
                      <div className="space-y-3">
                        {extendedData.transferRumors.map((rumor, idx) => (
                          <Card key={idx}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="text-3xl">{rumor.clubLogo}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold">{rumor.club}</h4>
                                    <Badge variant={
                                      rumor.type === "offer" ? "default" :
                                      rumor.type === "negotiation" ? "secondary" :
                                      rumor.type === "rejected" ? "destructive" : "outline"
                                    }>
                                      {rumor.type === "interest" ? "Interés" :
                                       rumor.type === "negotiation" ? "Negociación" :
                                       rumor.type === "offer" ? "Oferta" : "Rechazado"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {rumor.amount ? `Cantidad: ${rumor.amount}` : "Sin cantidad especificada"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < rumor.reliability ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{rumor.source}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(rumor.date).toLocaleDateString("es-ES")}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No hay rumores de fichaje activos</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Competitor Comparison */}
                    {extendedData.competitorComparison.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Comparación con Competidores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Jugador</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Edad</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Salario</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="bg-primary/5">
                                <TableCell className="font-bold">{selectedPlayer.name}</TableCell>
                                <TableCell>{selectedPlayer.team}</TableCell>
                                <TableCell>{selectedPlayer.age}</TableCell>
                                <TableCell className="text-green-500">{selectedPlayer.marketValue}</TableCell>
                                <TableCell>{extendedData.contract.salary}</TableCell>
                              </TableRow>
                              {extendedData.competitorComparison.map((comp, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{comp.name}</TableCell>
                                  <TableCell>{comp.team}</TableCell>
                                  <TableCell>{comp.age}</TableCell>
                                  <TableCell>{comp.value}</TableCell>
                                  <TableCell>{comp.salary}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ALERTS TAB */}
              <TabsContent value="alerts" className="space-y-4">
                {extendedData && (
                  <>
                    {extendedData.alerts.length > 0 ? (
                      <div className="space-y-3">
                        {extendedData.alerts.map((alert) => (
                          <Card key={alert.id} className={`border-l-4 ${
                            alert.severity === "critical" ? "border-l-red-500 bg-red-500/5" :
                            alert.severity === "warning" ? "border-l-yellow-500 bg-yellow-500/5" :
                            "border-l-blue-500 bg-blue-500/5"
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {alert.severity === "critical" ? (
                                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                ) : alert.severity === "warning" ? (
                                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                                ) : (
                                  <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold">{alert.title}</h4>
                                    {!alert.read && (
                                      <Badge variant="secondary" className="text-[10px]">NUEVO</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                                  <p className="text-xs text-muted-foreground mt-2">{new Date(alert.date).toLocaleDateString("es-ES")}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0">
                                  {alert.type === "contract" ? "Contrato" :
                                   alert.type === "injury" ? "Lesión" :
                                   alert.type === "negative_press" ? "Prensa" :
                                   alert.type === "transfer" ? "Fichaje" : "Rendimiento"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <p className="font-medium">Sin alertas pendientes</p>
                          <p className="text-sm">Todo está en orden para este jugador</p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>

        {/* News Detail Modal */}
        <Dialog open={!!selectedNews} onOpenChange={(open) => { if (!open) { setSelectedNews(null); setAiAnalysis(null); } }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Análisis de Noticia
              </DialogTitle>
            </DialogHeader>
            {selectedNews && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedNews.titulo}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{selectedNews.fuente}</Badge>
                    <span>{formatTimeAgo(selectedNews.fecha)}</span>
                  </div>
                </div>
                <Separator />
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-medium uppercase">Análisis IA</span>
                  </div>
                  {loadingAi ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Analizando...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{aiAnalysis}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <a href={selectedNews.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Leer Artículo
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedNews(null); setAiAnalysis(null); }}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
