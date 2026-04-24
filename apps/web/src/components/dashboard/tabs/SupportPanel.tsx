import { MessageSquare, BookOpen, Mail, ExternalLink, Github, FileText, Zap, ChevronRight } from 'lucide-react';

const CARD = { background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' };

const FAQ = [
  {
    q: 'How does the AI resume analysis work?',
    a: 'HiredLens uses Google Gemini AI to semantically compare your resume against the job description, identifying keyword gaps, weak phrasing, and areas for improvement.'
  },
  {
    q: 'Why is my match score low?',
    a: 'Match scores reflect how closely your resume aligns with the specific job description. Try the AI Rewrite feature to automatically enhance your bullet points and inject missing keywords.'
  },
  {
    q: 'How do I use the Mock Interview feature?',
    a: 'Navigate to "Mock Interview" in the sidebar. Select an interview mode, choose a coding language, and click "Start Interview". The AI interviewer will ask role-specific questions in real time.'
  },
  {
    q: 'Can I export my optimized resume?',
    a: 'Yes! Go to the "Rewrites" tab after generating an AI rewrite. Use the template switcher to choose between Standard and LaTeX formats, then click "Download PDF" or "Download .tex".'
  },
  {
    q: 'What is the Skill Roadmap?',
    a: 'The Skill Roadmap generates a personalized 90-day learning plan based on the skill gaps identified between your resume and the target job description.'
  },
  {
    q: 'How do I reset my password?',
    a: 'Click "Forgot Password" on the login screen. An email will be sent with a reset link (requires SMTP to be configured for self-hosted instances).'
  },
];

const RESOURCES = [
  { icon: BookOpen, label: 'Documentation', href: '#', description: 'Full guide to all HiredLens features' },
  { icon: Github, label: 'GitHub Repository', href: 'https://github.com/JayanthC6/ai-resume-optimizer', description: 'View source code and contribute' },
  { icon: FileText, label: 'Resume Writing Tips', href: '#', description: 'Best practices for ATS-optimised resumes' },
  { icon: Zap, label: 'API Reference', href: '#', description: 'Backend API documentation for developers' },
];

export function SupportPanel() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Help & Support</h1>
        <p className="text-sm text-slate-500 mt-1">Find answers to common questions and get in touch with us.</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 flex items-start gap-4" style={CARD}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(37,99,235,0.15)' }}>
            <Mail className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Email Support</p>
            <p className="text-xs text-slate-400 mt-0.5">Get help from our team directly.</p>
            <a href="mailto:support@hiredlens.ai"
              className="mt-2 inline-block text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
              support@hiredlens.ai →
            </a>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex items-start gap-4" style={CARD}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <MessageSquare className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Community Forum</p>
            <p className="text-xs text-slate-400 mt-0.5">Connect with other HiredLens users.</p>
            <a href="https://github.com/JayanthC6/ai-resume-optimizer/issues" target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
              <Github className="h-3 w-3" /> GitHub Issues →
            </a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em]">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-white/5">
          {FAQ.map((item, idx) => (
            <div key={idx} className="px-6 py-4 group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition">{item.q}</p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.a}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Resources</h3>
        <div className="grid grid-cols-2 gap-3">
          {RESOURCES.map((r, idx) => (
            <a key={idx} href={r.href} target="_blank" rel="noopener noreferrer"
              className="rounded-xl p-4 flex items-center gap-3 transition hover:bg-white/5 group"
              style={CARD}>
              <r.icon className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.label}</p>
                <p className="text-[11px] text-slate-500 truncate">{r.description}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Version info */}
      <div className="text-center py-2">
        <p className="text-xs text-slate-600">HiredLens v1.0.0 · Built with ❤️ using React, NestJS & Google Gemini</p>
      </div>
    </div>
  );
}
