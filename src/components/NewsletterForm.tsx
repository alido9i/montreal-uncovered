"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsletterFormProps {
  dark?: boolean;
}

export default function NewsletterForm({ dark = false }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 py-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </motion.div>
            <span className={`text-sm font-bold ${dark ? "text-green-400" : "text-green-600"}`}>
              Merci ! Vous êtes inscrit.
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className={`flex-1 px-4 py-3 text-sm rounded-sm focus:outline-none transition-all duration-200 ${
                dark
                  ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:border-[#FF0033] focus:bg-white/15"
                  : "border-2 border-black text-black focus:border-[#FF0033]"
              }`}
            />
            <motion.button
              type="submit"
              className="px-6 py-3 text-white font-bold text-sm uppercase tracking-widest shrink-0 bg-[#FF0033] rounded-sm"
              whileHover={{ scale: 1.02, backgroundColor: "#e6002e" }}
              whileTap={{ scale: 0.98 }}
            >
              S'abonner
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
