'use client'

import { Linkedin, Github, Mail, Twitter, Send, Heart } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <footer className="bg-zinc-950 text-white pt-24 pb-12 border-t border-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content - Factory.ai Style */}
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            {/* Column 1: PulsarTeam */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  <div className="w-1.5 h-8 bg-orange-500"></div>
                  <div className="w-1.5 h-8 bg-white/60"></div>
                </div>
                <h4 className="text-xl font-black">
                  <span className="text-white">Pulsar</span>
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Team</span>
                </h4>
              </div>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">
                Transform your learning journey with AI-powered knowledge systematization.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="group w-12 h-12 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl flex items-center justify-center transition-all duration-300">
                  <Linkedin className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                </a>
                <a href="#" className="group w-12 h-12 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl flex items-center justify-center transition-all duration-300">
                  <Github className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                </a>
                <a href="#" className="group w-12 h-12 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl flex items-center justify-center transition-all duration-300">
                  <Twitter className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                </a>
              </div>
            </div>

            {/* Column 2: Resources */}
            <div>
              <h4 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-orange-500">
                Resources
              </h4>
              <ul className="space-y-4">
                {['News', 'Docs', 'Contact Sales'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-400 hover:text-white transition-colors text-base font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-orange-500">
                Company
              </h4>
              <ul className="space-y-4">
                {['Careers', 'Enterprise', 'Security'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-400 hover:text-white transition-colors text-base font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-orange-500">
                Legal
              </h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'SLA', 'DPA', 'BAA'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-400 hover:text-white transition-colors text-base font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-900 mb-10" />

          {/* Bottom Bar - Factory Style */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-600 text-sm font-medium">
              @<span className="text-white">Pulsar</span><span className="text-orange-500">Team</span> 2025. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/minhe51805" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-orange-500 transition-colors text-sm">
                GitHub
              </a>
              <span className="text-zinc-800">•</span>
              <a href="https://www.facebook.com/m.minb1805" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-orange-500 transition-colors text-sm">
                Facebook
              </a>
            </div>
          </div>

          {/* Made with Love - Subtle */}
          <div className="text-center mt-10 pt-10 border-t border-zinc-900">
            <p className="text-xs text-zinc-700 flex items-center justify-center gap-2">
              Made with <Heart className="w-3 h-3 fill-orange-500 text-orange-500 opacity-50" /> by the Pulsar Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
