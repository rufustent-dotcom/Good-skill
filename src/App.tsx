/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Brain, 
  Video, 
  MessageSquare, 
  DollarSign, 
  ArrowRight, 
  Loader2,
  Sparkles,
  Zap,
  Globe,
  Lightbulb,
  Bookmark
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  generateQuickIdeas, 
  deepDiveTrends, 
  complexAnalysis, 
  analyzeVideoMonetization, 
  MonetizationIdea,
  sendChatMessage
} from './lib/gemini';

export default function App() {
  const [industry, setIndustry] = useState('');
  const [quickIdeas, setQuickIdeas] = useState<MonetizationIdea[]>([]);
  const [loadingQuick, setLoadingQuick] = useState(false);

  const [trendQuery, setTrendQuery] = useState('');
  const [trendResult, setTrendResult] = useState('');
  const [loadingTrend, setLoadingTrend] = useState(false);

  const [businessModel, setBusinessModel] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoResult, setVideoResult] = useState('');
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [savedIdeas, setSavedIdeas] = useState<MonetizationIdea[]>(() => {
    const saved = localStorage.getItem('savedMonetizationIdeas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('savedMonetizationIdeas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleQuickIdeas = async () => {
    if (!industry) return toast.error("Please enter an industry");
    setLoadingQuick(true);
    try {
      const ideas = await generateQuickIdeas(industry);
      setQuickIdeas(ideas);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate ideas");
    } finally {
      setLoadingQuick(false);
    }
  };

  const handleDeepDive = async () => {
    if (!trendQuery) return toast.error("Please enter a topic");
    setLoadingTrend(true);
    try {
      const result = await deepDiveTrends(trendQuery);
      setTrendResult(result || '');
    } catch (error) {
      console.error(error);
      toast.error("Failed to research trends");
    } finally {
      setLoadingTrend(false);
    }
  };

  const handleComplexAnalysis = async () => {
    if (!businessModel) return toast.error("Please enter a business model");
    setLoadingAnalysis(true);
    try {
      const result = await complexAnalysis(businessModel);
      setAnalysisResult(result || '');
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze model");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleVideoAnalysis = async () => {
    if (!videoUrl) return toast.error("Please enter a video URL or description");
    setLoadingVideo(true);
    try {
      const result = await analyzeVideoMonetization(videoUrl);
      setVideoResult(result || '');
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze video");
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoadingChat(true);

    try {
      const result = await sendChatMessage(userMsg, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model', text: result }]);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Chat failed");
    } finally {
      setLoadingChat(false);
    }
  };

  const toggleSaveIdea = (idea: MonetizationIdea) => {
    setSavedIdeas(prev => {
      const exists = prev.some(saved => saved.title === idea.title && saved.description === idea.description);
      if (exists) {
        toast.success("Idea removed from Vault");
        return prev.filter(saved => !(saved.title === idea.title && saved.description === idea.description));
      } else {
        toast.success("Idea saved to Vault");
        return [...prev, idea];
      }
    });
  };

  const updateIdeaNote = (ideaToUpdate: MonetizationIdea, newNote: string) => {
    setSavedIdeas(prev => prev.map(idea => 
      (idea.title === ideaToUpdate.title && idea.description === ideaToUpdate.description)
        ? { ...idea, notes: newNote }
        : idea
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <DollarSign className="text-primary-foreground w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-serif">Capital Explorer</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">AI Monetization Strategist</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex gap-1 py-1 px-2 border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="discover" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-2 lg:grid-cols-6 h-auto p-1 bg-muted/50 rounded-2xl border">
              <TabsTrigger value="discover" className="rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-semibold">Discover</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="deepdive" className="rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-semibold">Trends</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="thinking" className="rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span className="text-xs font-semibold">Analysis</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="video" className="rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <Video className="w-4 h-4" />
                  <span className="text-xs font-semibold">Video</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-semibold">Chat</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="vault" className="rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-xs font-semibold">Vault</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold font-serif">Quick Monetization Ideas</h2>
              <p className="text-muted-foreground">Enter an industry to get 5 actionable ways to generate revenue, powered by low-latency AI.</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Sustainable Fashion, AI SaaS, Local Coffee Shop" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickIdeas()}
                  className="h-12 rounded-xl text-lg px-4"
                />
                <Button onClick={handleQuickIdeas} disabled={loadingQuick} className="h-12 px-6 rounded-xl gap-2">
                  {loadingQuick ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingQuick ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="rounded-2xl border-muted/50">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : quickIdeas.length > 0 ? (
                quickIdeas.map((idea, i) => (
                  <Card key={i} className="rounded-2xl border-muted/50 hover:border-primary/30 transition-all hover:shadow-lg group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">{idea.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={idea.potential === 'High' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-none">
                            {idea.potential} Potential
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${savedIdeas.some(s => s.title === idea.title && s.description === idea.description) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                            onClick={() => toggleSaveIdea(idea)}
                          >
                            <Bookmark className={`w-4 h-4 ${savedIdeas.some(s => s.title === idea.title && s.description === idea.description) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">{idea.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          Implementation Steps
                        </div>
                        <ul className="space-y-2">
                          {idea.steps.map((step, si) => (
                            <li key={si} className="flex gap-2 text-sm">
                              <span className="text-primary font-bold">{si + 1}.</span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">Difficulty: {idea.difficulty}</Badge>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-muted/30">
                  <div className="inline-flex w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">No ideas generated yet. Try entering an industry above.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="deepdive" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="rounded-2xl border-muted/50 shadow-sm overflow-hidden">
                  <div className="h-2 bg-primary" />
                  <CardHeader>
                    <CardTitle className="font-serif">Trend Research</CardTitle>
                    <CardDescription>Use Google Search data to find the latest monetization trends and market shifts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search Query</label>
                      <Input 
                        placeholder="e.g. AI agents in fintech, creator economy 2026" 
                        value={trendQuery}
                        onChange={(e) => setTrendQuery(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <Button onClick={handleDeepDive} disabled={loadingTrend} className="w-full rounded-xl gap-2">
                      {loadingTrend ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Research Trends
                    </Button>
                  </CardContent>
                </Card>
                
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Globe className="w-4 h-4" />
                    <span className="font-bold text-sm">Search Grounding</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This tool uses real-time Google Search results to ensure the monetization strategies provided are current and relevant to today's market conditions.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card className="rounded-2xl border-muted/50 shadow-sm h-full min-h-[400px] flex flex-col">
                  <CardHeader className="border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-serif">Research Report</CardTitle>
                      {loadingTrend && <Badge variant="secondary" className="animate-pulse">Searching...</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6">
                    {loadingTrend ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : trendResult ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-primary">
                        <ReactMarkdown>{trendResult}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p>Enter a query to start your research.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Thinking Tab */}
          <TabsContent value="thinking" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold font-serif">Deep Strategic Analysis</h2>
                <p className="text-muted-foreground">Leverage "High Thinking" mode for complex business models and long-term sustainability analysis.</p>
              </div>

              <Card className="rounded-3xl border-muted/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-8 h-8" />
                    <CardTitle className="text-2xl font-serif">Business Model Analyzer</CardTitle>
                  </div>
                  <CardDescription className="text-primary-foreground/80 text-base">
                    Describe your business idea or monetization model in detail for a comprehensive strategic breakdown.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <textarea 
                    className="w-full min-h-[150px] p-4 rounded-2xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-lg"
                    placeholder="Describe your model: e.g. A subscription-based platform for independent musicians that uses AI to match them with local venues..."
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                  />
                  <Button 
                    onClick={handleComplexAnalysis} 
                    disabled={loadingAnalysis} 
                    className="w-full h-14 rounded-2xl text-lg font-bold gap-3 shadow-lg shadow-primary/20"
                  >
                    {loadingAnalysis ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
                    Perform Deep Analysis
                  </Button>
                </CardContent>
              </Card>

              {analysisResult && (
                <Card className="rounded-3xl border-primary/20 bg-primary/5 animate-in zoom-in-95 duration-500">
                  <CardHeader className="border-b border-primary/10">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="w-5 h-5" />
                      <CardTitle className="text-xl font-serif">Strategic Insights</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-relaxed">
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold font-serif">Video Monetization Insights</h2>
                <p className="text-muted-foreground">Analyze video content to extract monetization tips and revenue strategies.</p>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Paste a YouTube URL or describe the video content..." 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="h-14 pl-12 rounded-2xl text-lg shadow-sm"
                  />
                </div>
                <Button onClick={handleVideoAnalysis} disabled={loadingVideo} className="h-14 px-8 rounded-2xl font-bold">
                  {loadingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
                </Button>
              </div>

              {loadingVideo ? (
                <div className="space-y-6">
                  <Skeleton className="h-[300px] w-full rounded-3xl" />
                </div>
              ) : videoResult ? (
                <Card className="rounded-3xl border-muted/50 overflow-hidden shadow-lg">
                  <div className="aspect-video bg-muted flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Video className="w-20 h-20 text-muted-foreground/30" />
                    <div className="absolute bottom-6 left-6 text-white font-serif text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      Content Analysis Complete
                    </div>
                  </div>
                  <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-serif">Monetization Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{videoResult}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-[40px] border-muted/30">
                  <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground">Analyze a video to see how it can be monetized.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="h-full rounded-3xl border-muted/50 shadow-2xl flex flex-col overflow-hidden">
              <CardHeader className="border-b bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-serif">Strategist Chat</CardTitle>
                    <CardDescription className="text-xs">Deep dive into specific monetization questions.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-6" ref={chatScrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-medium">Hello! I'm your monetization strategist. How can I help you make money today?</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["How to monetize a newsletter?", "SaaS pricing strategies?", "Passive income ideas for devs?"].map(q => (
                          <Button key={q} variant="outline" size="sm" className="rounded-full text-xs" onClick={() => { setChatInput(q); }}>{q}</Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted rounded-tl-none border border-muted-foreground/10'
                      }`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-4 rounded-2xl rounded-tl-none border border-muted-foreground/10 flex gap-2 items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Strategist is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-6 border-t bg-card">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <Input 
                    placeholder="Ask anything about monetization..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    className="h-12 rounded-xl shadow-sm"
                  />
                  <Button onClick={handleChat} disabled={loadingChat} className="h-12 w-12 rounded-xl p-0">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Vault Tab */}
          <TabsContent value="vault" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold font-serif">Idea Vault</h2>
              <p className="text-muted-foreground">Your saved monetization strategies and business models.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedIdeas.length > 0 ? (
                savedIdeas.map((idea, i) => (
                  <Card key={i} className="rounded-2xl border-muted/50 hover:border-primary/30 transition-all hover:shadow-lg group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">{idea.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={idea.potential === 'High' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-none">
                            {idea.potential} Potential
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => toggleSaveIdea(idea)}
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">{idea.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          Implementation Steps
                        </div>
                        <ul className="space-y-2">
                          {idea.steps.map((step, si) => (
                            <li key={si} className="flex gap-2 text-sm">
                              <span className="text-primary font-bold">{si + 1}.</span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex flex-col items-start gap-4">
                      <div className="w-full space-y-2 flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Personal Notes
                        </label>
                        <textarea 
                          className="w-full text-sm border border-muted/50 rounded-lg p-3 bg-muted/10 focus:ring-1 focus:ring-primary outline-none transition-all resize-none min-h-[80px]"
                          placeholder="Add your thoughts or next steps..."
                          defaultValue={idea.notes || ""}
                          onBlur={(e) => updateIdeaNote(idea, e.target.value)}
                        />
                      </div>
                      <div className="w-full flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">Difficulty: {idea.difficulty}</Badge>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-muted/30">
                  <div className="inline-flex w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                    <Bookmark className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">No saved ideas yet. Head to the Discover tab to find strategies worth saving.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-serif font-bold text-muted-foreground">Capital Explorer &copy; 2026</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Built for high-performance monetization strategy</p>
        </div>
      </footer>
      
      <Toaster position="top-center" />
    </div>
  );
}

