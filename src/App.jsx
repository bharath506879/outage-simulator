import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { 
  Activity, Server, ShieldCheck, Play, Square, Zap, 
  Info, Brain, GitBranch, Database, Cpu, Network, AlertTriangle, ChevronDown, ChevronUp, LayoutDashboard, Terminal, X
} from 'lucide-react';

// --- Configuration ---
const API_URL = "http://localhost:8000";
const POLL_INTERVAL = 500; // Faster polling for better responsiveness

// --- Mock Engine for Preview Mode (No Backend) ---
const generateMockState = (prev, failureConfig) => {
  const now = Date.now();
  let cpu = 15 + Math.random() * 5;
  let mem = 20 + Math.random() * 2;
  let lat = 25 + Math.random() * 10;
  let serviceStatus = "healthy";

  if (failureConfig) {
    const elapsed = (now - failureConfig.startTime) / 1000;
    const mult = failureConfig.intensity === 'high' ? 3 : failureConfig.intensity === 'medium' ? 2 : 1;

    // Slower, progressive metric degradation to ensure a smooth line down to 0
    if (failureConfig.type === 'cpu') {
      cpu += Math.min(85, elapsed * 4 * mult); // Gradual ramp up
    } else if (failureConfig.type === 'memory') {
      mem += Math.min(80, elapsed * 3 * mult); // Gradual leak
    } else if (failureConfig.type === 'network') {
      lat += Math.min(800, elapsed * 30 * mult); // Gradual latency accumulation
    } else if (failureConfig.type === 'crash_loop') {
      if (Math.floor(elapsed) % 6 < 3) serviceStatus = "down"; // Flapping status
    }
  }

  // Calculate Health (Smoothed out to drop slowly to 0)
  let health = 100;
  if (serviceStatus === 'down') {
    health = 0;
  } else {
    // Lowered thresholds so degradation starts earlier, but with balanced
    // multipliers to pull health exactly to 0 over 15-30 seconds.
    if (cpu > 30) health -= (cpu - 30) * 1.5;
    if (mem > 40) health -= (mem - 40) * 1.7;
    if (lat > 100) health -= (lat - 100) * 0.15;
  }
  
  // Clamp health
  health = Math.max(0, Math.min(100, health));
  
  // Determine status label based on health
  if (health < 50) serviceStatus = serviceStatus === 'down' ? 'down' : 'critical';
  else if (health < 80) serviceStatus = 'degraded';
  else serviceStatus = 'healthy';
  
  return {
    timestamp: now,
    cpu_usage: Math.min(100, Math.max(0, cpu)),
    memory_usage: Math.min(100, Math.max(0, mem)),
    network_latency_ms: lat,
    service_status: serviceStatus,
    health_score: Math.round(health),
    active_failure: failureConfig ? failureConfig.type : null
  };
};

// --- System Intelligence Component ---
const SystemIntelligence = () => {
  const [openSection, setOpenSection] = useState('overview');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in duration-500 transition-colors">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center gap-6 transition-colors">
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl w-fit">
          <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">System Intelligence & Simulation Engine</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            This platform uses a deterministic chaos engine to simulate infrastructure failure scenarios. 
            Below is a comprehensive breakdown of the architecture, mathematical models, and metric aggregation logic used to train SREs.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">

        {/* 0. Platform Overview & Purpose */}
        <div className="bg-white dark:bg-slate-900 transition-colors">
          <button 
            onClick={() => toggleSection('overview')}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                 <Info className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Platform Overview & Purpose</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Why this simulator exists and its core theme</span>
              </div>
            </div>
            {openSection === 'overview' ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
          </button>
          
          {openSection === 'overview' && (
            <div className="px-8 pb-8 pt-2">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">The Theme: Chaos Engineering</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    The central theme of this platform is <strong className="dark:text-slate-300">Chaos Engineering</strong> and <strong className="dark:text-slate-300">Resilience Testing</strong>. In modern cloud environments, failures are inevitable. Instead of waiting for a random outage, this platform allows teams to intentionally inject controlled failures to observe system behavior and response strategies.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Why It Is Useful</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    It provides a safe, sandboxed environment for DevOps engineers, SREs, and students to build "muscle memory" for incident response. Users can visualize how a single localized issue (like a memory leak) propagates into a critical system-wide outage over time.
                  </p>
                </div>
                <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg p-5 mt-2">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Value to the User
                  </h4>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200/80 leading-relaxed">
                    By actively interacting with the simulator, users learn to correlate raw infrastructure metrics (CPU load, memory growth, latency spikes) with high-level business metrics like MTTR (Mean Time To Recovery) and overall Health Scores. It trains professionals to understand degradation curves, threshold triggers, and stabilization delays without the stress and financial impact of a real 3:00 AM production crash.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 1. Architecture & Data Flow */}
        <div className="bg-white dark:bg-slate-900 transition-colors">
          <button 
            onClick={() => toggleSection('architecture')}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                 <GitBranch className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Platform Architecture</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Data flow from Python/Mock engine to React UI</span>
              </div>
            </div>
            {openSection === 'architecture' ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
          </button>
          
          {openSection === 'architecture' && (
            <div className="px-8 pb-8 pt-2">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-mono">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center w-full md:w-48">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">React Frontend</div>
                    <div className="text-slate-400 dark:text-slate-500 text-xs">Visualization Layer</div>
                  </div>
                  <div className="hidden md:flex flex-col items-center text-slate-400 dark:text-slate-500 flex-1">
                    <span className="text-xs mb-1">REST / Polling (500ms)</span>
                    <div className="h-px w-full bg-slate-300 dark:bg-slate-700 relative">
                        <div className="absolute inset-0 bg-slate-300 dark:bg-slate-600 animate-pulse"></div>
                    </div>
                    <span className="text-xs mt-1">JSON State</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center w-full md:w-48">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Simulation Engine</div>
                    <div className="text-slate-400 dark:text-slate-500 text-xs">Python / Mock JS</div>
                  </div>
                  <div className="hidden md:flex flex-col items-center text-slate-400 dark:text-slate-500 flex-1">
                    <span className="text-xs mb-1">Physics Loop</span>
                    <div className="h-px w-full bg-slate-300 dark:bg-slate-700"></div>
                    <span className="text-xs mt-1">10Hz Tick</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center w-full md:w-48">
                    <div className="font-bold text-rose-600 dark:text-rose-400 mb-1">Chaos Injector</div>
                    <div className="text-slate-400 dark:text-slate-500 text-xs">Failure Models</div>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Frontend-Backend Decoupling</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        The platform operates on a strictly decoupled architecture. The frontend is a "dumb" visualization layer that polls the engine state every 500ms. This ensures that heavy simulation logic does not block the UI thread.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">State Management</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        The backend maintains a "World State" object that persists across polls. When a failure is injected, it modifies the parameters of the physics loop, which then degrade the system metrics over time rather than instantly.
                    </p>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Simulation Logic & Models */}
        <div className="bg-white dark:bg-slate-900 transition-colors">
          <button 
            onClick={() => toggleSection('models')}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                 <Cpu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Failure Models</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Mathematical functions governing chaos</span>
              </div>
            </div>
            {openSection === 'models' ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
          </button>
          
          {openSection === 'models' && (
            <div className="px-8 pb-8 pt-2 grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-md">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> CPU Saturation
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Simulates a runaway thread or process locking resources.</p>
                <div className="bg-slate-900 dark:bg-black/50 rounded-lg p-3 mb-3 border border-slate-800">
                    <code className="text-[10px] text-green-400 dark:text-green-500 font-mono">
                    Stress(t) = Limit / (1 + e^(-k(t - t0)))
                    </code>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    We use a <strong className="dark:text-slate-300">Sigmoid function</strong> to create a realistic "ramp-up" curve. Unlike a boolean switch, real CPU saturation often grows exponentially before hitting a ceiling.
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-md">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Memory Leak
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Simulates ungarbage-collected objects accumulating over time.</p>
                <div className="bg-slate-900 dark:bg-black/50 rounded-lg p-3 mb-3 border border-slate-800">
                    <code className="text-[10px] text-green-400 dark:text-green-500 font-mono">
                    Mem(t) = Base_Mem + (Leak_Rate * Δt)
                    </code>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    Modeled as a <strong className="dark:text-slate-300">Linear Accumulation</strong>. The system adds a fixed amount of megabytes per second based on the intensity level, eventually triggering an OOM (Out of Memory) crash if not resolved.
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-md">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Network Latency
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Simulates packet loss, jitter, or congested routes.</p>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    Injects <strong className="dark:text-slate-300">Gaussian Noise (Jitter)</strong> on top of a fixed latency penalty. This ensures the latency graph looks "noisy" and realistic, rather than a flat line, mimicking real internet instability.
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors hover:shadow-md">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Crash Loop
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Simulates a pod/service failing health checks and restarting.</p>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    Modeled as a <strong className="dark:text-slate-300">Square Wave</strong> function. The service status toggles between binary states (0/1) based on a modulus time factor, creating a "flapping" state that ruins stability scores.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Metrics Explained */}
        <div className="bg-white dark:bg-slate-900 transition-colors">
          <button 
            onClick={() => toggleSection('metrics')}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                 <Info className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Metric Definitions</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">How we calculate reliability</span>
              </div>
            </div>
            {openSection === 'metrics' ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
          </button>
          
          {openSection === 'metrics' && (
            <div className="px-8 pb-8 pt-2">
               <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-2 tracking-wider">KPI Metric</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">MTTR</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">Mean Time To Recovery</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      The average time elapsed between the start of an incident (Health &lt; 50) and system stabilization (Health &gt; 90). Lower is better.
                    </p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-2 tracking-wider">Composite Score</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Health Score</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">0 - 100 Index</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Calculated as <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-600 text-xs">100 - Σ(Weighted Penalties)</code>. Service Status is weighted heaviest (0.5), followed by Memory (0.3) and CPU (0.2).
                    </p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-2 tracking-wider">Trigger</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Incident</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">Critical Event</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      An incident is formally opened when the Health Score drops below the 50% threshold. It is only closed when the score sustains &gt;90% for a cooldown period.
                    </p>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* 4. Future AI/ML Roadmap */}
        <div className="bg-white dark:bg-slate-900 transition-colors">
          <button 
            onClick={() => toggleSection('ml')}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                 <Brain className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">AI & Machine Learning Roadmap</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Extending the platform with predictive capabilities</span>
              </div>
            </div>
            {openSection === 'ml' ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
          </button>
          
          {openSection === 'ml' && (
            <div className="px-8 pb-8 pt-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-3xl">
                While the current engine uses deterministic rules for educational clarity, the architecture is designed to support plug-and-play ML models for advanced SRE scenarios:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                  <div className="mt-1 w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full shrink-0"></div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">Anomaly Detection (Isolation Forests)</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Could be trained on "Healthy" baseline data to detect subtle deviations in latency or disk I/O that don't trigger hard thresholds but indicate impending failure.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-100 dark:hover:border-purple-900/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all">
                  <div className="mt-1 w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full shrink-0"></div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">Predictive Forecasting (LSTM / Prophet)</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Time-series forecasting to predict <i>exactly when</i> memory will be exhausted based on the current linear leak rate, alerting SREs minutes before the actual crash.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all">
                  <div className="mt-1 w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0"></div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">Auto-Remediation (Reinforcement Learning)</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      An RL agent could be trained to interact with the "Stop Simulation" API to minimize MTTR, learning the optimal moment to intervene vs. waiting for self-healing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWarning, setShowWarning] = useState(true);

  // Simulation State
  const [useBackend, setUseBackend] = useState(false);
  const [sysState, setSysState] = useState({
    cpu_usage: 15, memory_usage: 20, network_latency_ms: 25, health_score: 100, service_status: 'healthy'
  });
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({ incident_count: 0, mttr_seconds: 0 });
  const [config, setConfig] = useState({ type: 'cpu', intensity: 'medium' });
  const [isRunning, setIsRunning] = useState(false);
  
  // Logging State
  const [eventLog, setEventLog] = useState([{id: 1, time: new Date().toLocaleTimeString([], {hour12: false}), message: "System Initialized. Log Stream Active.", type: 'info'}]);
  const prevStatusRef = useRef('healthy');
  
  // For Mock Mode
  const [mockFailure, setMockFailure] = useState(null);
  const incidentStartRef = useRef(null);
  const incidentHistoryRef = useRef([]);

  // --- Helpers ---
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    // Add new logs to the top
    setEventLog(prev => [{
      id: Date.now() + Math.random(), 
      time, 
      message, 
      type 
    }, ...prev].slice(0, 50)); // Keep last 50 events
  };

  // --- Effects ---

  // Polling Loop
  useEffect(() => {
    // Function to run a single tick of the simulation
    const tick = async () => {
      if (useBackend) {
        try {
          const res = await fetch(`${API_URL}/state`);
          const data = await res.json();
          updateState(data);
          
          const metRes = await fetch(`${API_URL}/metrics`);
          const metData = await metRes.json();
          setMetrics(metData);
        } catch (e) {
          console.warn("Backend not found, switching to local simulation");
          setUseBackend(false);
        }
      } else {
        // Run Mock
        const nextState = generateMockState(sysState, mockFailure);
        
        // --- Metric Calculation Logic ---
        const health = nextState.health_score;
        const now = Date.now();

        // 1. Detect Incident Start
        if (health < 50 && incidentStartRef.current === null) {
          incidentStartRef.current = now;
        }

        // 2. Detect Recovery & Calculate Metrics
        if (health >= 90 && incidentStartRef.current !== null) {
          const durationSeconds = (now - incidentStartRef.current) / 1000;
          incidentHistoryRef.current.push(durationSeconds);
          incidentStartRef.current = null;

          const totalTime = incidentHistoryRef.current.reduce((a, b) => a + b, 0);
          const count = incidentHistoryRef.current.length;
          
          setMetrics({
            incident_count: count,
            mttr_seconds: totalTime / count
          });
        }
        updateState(nextState);
      }
    };

    // Run immediately on mount/update so we don't wait for the interval
    // This fixes the "delay" feeling when clicking stop
    const initialTimer = setTimeout(() => tick(), 0);

    // Start Interval
    const interval = setInterval(tick, POLL_INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [useBackend, mockFailure]); // Dependency array ensures tick logic updates when config changes

  const updateState = (newData) => {
    // --- Logging Logic for Status Changes ---
    if (newData.service_status !== prevStatusRef.current) {
        const oldS = prevStatusRef.current;
        const newS = newData.service_status;
        
        if (newS === 'healthy' && oldS !== 'healthy') {
            addLog(`Recovery: System stability restored (Health > 80%).`, 'success');
        } else if (newS === 'degraded' && oldS === 'healthy') {
            addLog(`Warning: Performance degradation detected.`, 'warning');
        } else if ((newS === 'critical' || newS === 'down') && (oldS !== 'critical' && oldS !== 'down')) {
            addLog(`CRITICAL: Health dropped below 50%. Incident declared.`, 'error');
        }

        prevStatusRef.current = newS;
    }

    setSysState(newData);
    setHistory(prev => {
      const newHist = [...prev, { ...newData, time: new Date(newData.timestamp * 1000 || Date.now()).toLocaleTimeString() }];
      if (newHist.length > 60) newHist.shift(); // Keep last 60 seconds
      return newHist;
    });
  };

  // --- Handlers ---

  const handleStart = async () => {
    setIsRunning(true);
    addLog(`Injecting ${config.intensity.toUpperCase()} intensity ${config.type.toUpperCase()} failure...`, 'warning');
    
    if (useBackend) {
      await fetch(`${API_URL}/simulation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failure_type: config.type, intensity: config.intensity, duration: 0 })
      });
    } else {
      setMockFailure({ ...config, startTime: Date.now() });
    }
  };

  const handleStop = async () => {
    setIsRunning(false);
    addLog('Manual Intervention: Stabilization sequence initiated.', 'info');
    
    if (useBackend) {
      await fetch(`${API_URL}/simulation/stop`, { method: 'POST' });
    } else {
      setMockFailure(null);
    }
  };

  // --- UI Helpers ---
  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'bg-emerald-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'down': return 'bg-gray-800 dark:bg-gray-600';
      default: return 'bg-emerald-500';
    }
  };

  const getHealthColor = (score) => {
    if (score > 80) return '#10b981'; // Emerald
    if (score > 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getLogStyle = (type) => {
    switch(type) {
        case 'error': return 'text-rose-600 dark:text-rose-400 font-bold';
        case 'warning': return 'text-amber-600 dark:text-amber-400 font-semibold';
        case 'success': return 'text-emerald-600 dark:text-emerald-400 font-bold';
        default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  // The wrapper div no longer applies the dark class - always light theme.
  return (
    <div>
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-100 pb-6 transition-colors duration-300">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">System Outage <span className="text-indigo-600 dark:text-indigo-400">Simulator</span></h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Infrastructure Resilience Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2 transition-colors">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Monitor
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'docs' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Brain className="w-3.5 h-3.5" /> Intelligence
              </button>
            </div>

            <div className="flex flex-col items-end border-l border-slate-200 dark:border-slate-800 pl-4">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">System Health</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(sysState.service_status)}`}></span>
                <span className="text-lg font-mono font-bold">{sysState.health_score.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          
          {/* Warning Banner */}
          {showWarning && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Safety Warning: Simulation Only</h3>
                  <p className="text-amber-700 dark:text-amber-200/80 text-xs mt-1 leading-relaxed max-w-2xl">
                    This tool is intended solely for simulation and educational purposes. 
                    <span className="font-bold"> If connected to real systems, the chaos injection logic will cause actual crashes and service outages. </span> 
                    Do not use in production environments.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWarning(false)}
                className="text-amber-400 dark:text-amber-600 hover:text-amber-600 dark:hover:text-amber-400 p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Render Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
              
              {/* Left Column: Controls & Metrics */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Controls */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 transition-colors">
                  <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Chaos Injection
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Failure Type</label>
                      <select 
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        value={config.type}
                        onChange={(e) => setConfig({...config, type: e.target.value})}
                        disabled={isRunning}
                      >
                        <option value="cpu">CPU Saturation</option>
                        <option value="memory">Memory Leak</option>
                        <option value="network">Network Latency</option>
                        <option value="crash_loop">Service Crash Loop</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Intensity</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['low', 'medium', 'high'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setConfig({...config, intensity: level})}
                            disabled={isRunning}
                            className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                              config.intensity === level 
                                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 shadow-md transform scale-105' 
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      {!isRunning ? (
                        <button 
                          onClick={handleStart}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
                        >
                          <Play className="w-4 h-4 fill-current" /> Inject Failure
                        </button>
                      ) : (
                        <button 
                          onClick={handleStop}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
                        >
                          <Square className="w-4 h-4 fill-current" /> Stabilize System
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Key Metrics */}
                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="text-slate-400 dark:text-slate-500 mb-1 text-xs font-bold uppercase">MTTR (Avg)</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {typeof metrics.mttr_seconds === 'number' ? metrics.mttr_seconds.toFixed(1) : '0.0'}<span className="text-sm text-slate-400 dark:text-slate-500 font-normal ml-1">s</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="text-slate-400 dark:text-slate-500 mb-1 text-xs font-bold uppercase">Incidents</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.incident_count || 0}</div>
                  </div>
                </section>

                {/* Component Status Grid */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 transition-colors">
                  <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Component Health
                  </h2>
                  <div className="space-y-4">
                    <MetricRow label="CPU Load" value={sysState.cpu_usage} unit="%" threshold={70} />
                    <MetricRow label="Memory" value={sysState.memory_usage} unit="%" threshold={80} />
                    <MetricRow label="Latency" value={sysState.network_latency_ms} unit="ms" threshold={100} />
                    
                    {/* Service Status Row */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Service Status</span>
                        <span className={`font-bold uppercase ${
                          sysState.service_status === 'down' ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 
                          sysState.service_status === 'critical' ? 'text-rose-500 dark:text-rose-400' : 
                          sysState.service_status === 'degraded' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
                        }`}>
                          {sysState.service_status === 'down' ? 'CRASHING' : 'OPERATIONAL'}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            sysState.service_status === 'down' ? 'bg-rose-600 dark:bg-rose-500 w-full' : 
                            sysState.service_status === 'critical' ? 'bg-rose-500 dark:bg-rose-400 w-full' : 
                            sysState.service_status === 'degraded' ? 'bg-amber-500 dark:bg-amber-400 w-full' : 'bg-emerald-500 dark:bg-emerald-400 w-full'
                          }`} 
                        ></div>
                      </div>
                    </div>

                  </div>
                </section>
              </div>

              {/* Right Column: Visualization */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Main Chart */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1 flex-1 min-h-[400px] flex flex-col transition-colors">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Real-time System Health
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full mt-4">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                        <XAxis dataKey="time" hide={true} />
                        <YAxis domain={[0, 100]} hide={false} tick={{fontSize: 12, fill: isDarkMode ? '#64748b' : '#94a3b8'}} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#f8fafc' : '#0f172a',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                          }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        
                        {/* Visual Guide Zones */}
                        <ReferenceArea y1={0} y2={50} fill="#fecaca" fillOpacity={isDarkMode ? 0.05 : 0.1} />
                        <ReferenceArea y1={50} y2={80} fill="#fde68a" fillOpacity={isDarkMode ? 0.05 : 0.1} />
                        
                        <Line 
                          type="monotone" 
                          dataKey="health_score" 
                          stroke="url(#colorHealth)" 
                          strokeWidth={3} 
                          dot={false}
                          animationDuration={300}
                        />
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={getHealthColor(history[history.length-1]?.health_score)} />
                            <stop offset="100%" stopColor={getHealthColor(history[history.length-1]?.health_score)} />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Event Log (Updated to List View) */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-[250px] transition-colors">
                  <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Live Incident Stream
                  </h2>
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg border border-slate-800 dark:border-black p-4 flex-1 overflow-y-auto font-mono text-xs shadow-inner">
                    <div className="space-y-2">
                      {eventLog.map((log) => (
                        <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                          <span className="text-slate-500 shrink-0">[{log.time}]</span>
                          <span className={`${getLogStyle(log.type)}`}>
                              {log.type === 'info' && <span className="text-blue-500 mr-2">ℹ</span>}
                              {log.type === 'success' && <span className="text-emerald-500 mr-2">✔</span>}
                              {log.type === 'warning' && <span className="text-amber-500 mr-2">⚠</span>}
                              {log.type === 'error' && <span className="text-rose-500 mr-2">✖</span>}
                              {log.message}
                          </span>
                        </div>
                      ))}
                      <div className="text-slate-700 dark:text-slate-800 pt-2 border-t border-slate-800 dark:border-slate-900 mt-4 text-[10px] uppercase tracking-widest text-center">
                          End of Stream
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Render Intelligence View */}
          {activeTab === 'docs' && (
            <SystemIntelligence />
          )}
          
        </main>
      </div>
    </div>
  );
}

// Sub-component for progress bars
const MetricRow = ({ label, value, unit, threshold }) => {
  const isHigh = value > threshold;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <span className={`font-bold ${isHigh ? 'text-rose-600 dark:text-rose-500' : 'text-slate-500 dark:text-slate-300'}`}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${isHigh ? 'bg-rose-500' : 'bg-indigo-500 dark:bg-indigo-400'}`} 
          style={{ width: `${Math.min(100, (value / (unit === 'ms' ? 200 : 100)) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
};
