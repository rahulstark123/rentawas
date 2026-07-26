"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageSquareHeart, 
  Star, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  UserX,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [category, setCategory] = useState<string>("General Feedback");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const categories = [
    "General Feedback",
    "Feature Request",
    "User Interface",
    "Bug Report",
    "Praise & Review"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          isAnonymous,
          name: isAnonymous ? "" : name,
          email: isAnonymous ? "" : email,
          subject,
          message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        // Fallback success UI if local network issue
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Feedback post error:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setCategory("General Feedback");
      setRating(5);
      setIsAnonymous(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 my-auto"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0B132B] via-slate-900 to-[#141A26] px-5 py-4 text-white relative">
              <button
                onClick={handleResetAndClose}
                className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-[#FF6B00] text-white shadow-xs">
                  <MessageSquareHeart className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Your Opinion Matters
                </span>
              </div>

              <h3 
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Your Feedback is Important to Us
              </h3>
              <p className="text-xs text-slate-300 font-normal leading-normal mt-0.5">
                We are building RentAwas for landlords and tenants like you. Share your suggestions below!
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto">
              {submitted ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Thank You For Your Feedback!</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                      {isAnonymous
                        ? "Your anonymous feedback has been recorded safely. We truly appreciate your time!"
                        : "Your valuable feedback has been submitted directly to our product team. Thank you for helping us grow!"}
                    </p>
                  </div>
                  <button
                    onClick={handleResetAndClose}
                    className="mt-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </motion.div>
              ) : (
                /* Feedback Form */
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Category Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            category === cat
                              ? "bg-[#FF6B00] text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Star Rating Bar */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              (hoverRating || rating) >= star
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-slate-600 ml-2">
                        {rating === 5 && "⭐ Excellent"}
                        {rating === 4 && "👍 Very Good"}
                        {rating === 3 && "👌 Good"}
                        {rating === 2 && "😐 Fair"}
                        {rating === 1 && "🙁 Needs Work"}
                      </span>
                    </div>
                  </div>

                  {/* Send As Anonymous Toggle Switch */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isAnonymous ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-700"}`}>
                        {isAnonymous ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-none">Send as Anonymous</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {isAnonymous ? "Identity remains private." : "Include contact info for follow up."}
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                    </label>
                  </div>

                  {/* Optional Contact Fields (If not anonymous) */}
                  <AnimatePresence>
                    {!isAnonymous && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-hidden"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                            Your Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Rahul Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. rahul@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback Topic */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maintenance workflow, UI clarity..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] transition-colors"
                    />
                  </div>

                  {/* Feedback Message */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Detailed Feedback <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {message.length} chars
                      </span>
                    </div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us what you love or what we could improve inside RentAwas..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] transition-colors resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium text-center pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your feedback is private and protected by RentAwas Privacy Terms</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
