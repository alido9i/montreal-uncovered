"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const interests = [
  { id: "politique", label: "Politique", icon: "🏛️" },
  { id: "gastro", label: "Gastronomie", icon: "🍽️" },
  { id: "culture", label: "Culture", icon: "🎨" },
  { id: "lifestyle", label: "Style de vie", icon: "☀️" },
  { id: "local", label: "Local", icon: "📍" },
];

export default function NewsletterSegmented() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggleInterest(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <svg width="32" height="32" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </motion.div>
            <p className="text-white font-black text-xl mb-1">Bienvenue dans le club!</p>
            <p className="text-gray-400 text-sm">
              {selected.size > 0
                ? `Vous recevrez du contenu sur : ${Array.from(selected).map((s) => interests.find((i) => i.id === s)?.label).join(", ")}`
                : "Vous recevrez tous nos articles."}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Interest pills */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3 text-center">
                Choisissez vos intérêts
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {interests.map((interest) => {
                  const isActive = selected.has(interest.id);
                  return (
                    <motion.button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                        isActive
                          ? "bg-[#FF0033] border-[#FF0033] text-white"
                          : "bg-transparent border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="mr-1">{interest.icon}</span>
                      {interest.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Email input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 px-4 py-3 text-sm rounded-sm bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF0033] transition-colors"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 text-white font-bold text-sm uppercase tracking-widest bg-[#FF0033] rounded-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                S'abonner
              </motion.button>
            </div>
            <p className="text-[11px] text-gray-600 text-center">
              Gratuit. Pas de spam. Désinscription en un clic.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
