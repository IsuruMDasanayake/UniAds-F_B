import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import { Bookmark, Check, Sparkles, Send, X, User, Bot, Trash2, Save, CheckCircle2, Loader2 } from 'lucide-react';
import ProgrammeInfoModal from './Modals/ProgrammeInfoModal';
import ApplyNowModal from './Modals/ApplyNowModal';
import MoreInfoModal from './Modals/MoreInfoModal';
import { isPremiumActive } from '../utils/premium';
import './FloatingAiAdvisor.css';

const FloatingAiAdvisor = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hello! 👋 I'm EMY, the UniAds Career Advisor. To give you the best guidance, what is your current education level?",
      suggested_replies: ['O/L Completed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate', 'Check Last Search']
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    education_level: null,
    stream: null,
    main_field: null,
    interest: null,
    career_goal: null,
    study_preference: null
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Modal States
  const [selectedPost, setSelectedPost] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    privacyConsent: false
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Only render for regular Users
  if (!user || user.role !== 'User') {
    return null;
  }

  const handleSendMessage = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const text = (overrideText ?? inputValue).trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/api/ai-advisor/recommend', {
        messages: newMessages,
        profile: profile
      });

      if (response.data.success) {
        const payload = response.data.data;
        setMessages(prev => [...prev, {
          role: 'bot',
          content: payload.recommendation,
          real_posts: payload.real_posts,
          suggested_replies: payload.suggested_replies
        }]);
        setProfile(payload.profile);
      }
    } catch (err) {
      console.error('Error in AI Chat:', err);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    // Track view
    axiosClient.post(`/api/posts/${post.id}/track-view`).catch(() => { });
  };

  const closeModals = () => {
    setSelectedPost(null);
    setShowApplyModal(false);
    setShowInfoModal(false);
    setSubmissionStatus({ type: '', message: '' });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    setApplying(true);
    setSubmissionStatus({ type: '', message: '' });

    try {
      await axiosClient.post(`/api/course/apply/${selectedPost.institute_id}`, {
        ...applyForm,
        course_title: selectedPost.title,
        post_id: selectedPost.id,
        privacy_consent: applyForm.privacyConsent
      });

      setSubmissionStatus({ type: 'success', message: 'Application submitted successfully!' });
      setApplyForm({ name: '', email: '', phone: '', message: '', privacyConsent: false });

      setTimeout(() => {
        setShowApplyModal(false);
        setSubmissionStatus({ type: '', message: '' });
      }, 3000);

    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMsg = error.response?.data?.message || "Failed to submit application.";
      setSubmissionStatus({ type: 'error', message: errorMsg });
    } finally {
      setApplying(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'bot',
        content: "Hello! 👋 I'm EMY, the UniAds Career Advisor. To give you the best guidance, what is your current education level?",
        suggested_replies: ['O/L Completed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate', 'Check Last Search']
      }
    ]);
    setProfile({
      education_level: null,
      stream: null,
      main_field: null,
      interest: null,
      career_goal: null,
      study_preference: null
    });
    setError(null);
  };

  const handleSaveRoadmap = async (msg) => {
    if (loading) return;

    // Optimistically set saving status if we had one, but let's just use local loading
    try {
      const response = await axiosClient.post('/api/ai-advisor/save-roadmap', {
        career_goal: profile.interest || profile.career_goal || 'Career Recommendation',
        interest: profile.interest,
        recommendation_text: msg.content,
        real_posts: msg.real_posts
      });

      if (response.data.success) {
        // Mark this specific message as saved in state
        setMessages(prev => prev.map(m =>
          m.content === msg.content ? { ...m, is_saved: true } : m
        ));
      }
    } catch (err) {
      console.error('Error saving roadmap:', err);
    }
  };

  return (
    <div className="ai-advisor-container">
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          className="ai-advisor-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Career Advisor"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="ai-advisor-img-wrapper">
            <motion.img
              src="/images/emy/emy_character.png"
              alt="EMY"
              className="ai-advisor-img"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <span className="ai-advisor-badge">EMY</span>
        </motion.button>
      )}

      {/* Chat Window */}
      {isOpen && createPortal(
        <>
          <div className="ai-advisor-overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-advisor-window">
            <div className="ai-advisor-header">
              <div className="ai-advisor-header-title">
                <div className="bot-avatar-img-wrapper">
                  <img src="/images/emy/emy_character.png" alt="EMY" className="bot-avatar-img" />
                </div>
                <div>
                  <h3>EMY</h3>
                  <p>UniAds Career Advisor</p>
                </div>
              </div>
              <div className="ai-advisor-header-actions">
                <button
                  className="ai-advisor-reset"
                  onClick={resetChat}
                  title="Start a new conversation"
                  aria-label="Reset conversation"
                >
                  ↺
                </button>
                <button className="ai-advisor-close" onClick={() => setIsOpen(false)} aria-label="Close">
                  &times;
                </button>
              </div>
            </div>

            <div className="ai-advisor-body">
              {messages.map((msg, idx) => (
                <div key={idx} className="message-group">
                  <div className={`message ${msg.role === 'bot' ? 'bot-message' : 'user-message'} ${msg.role === 'bot' ? 'markdown-body' : ''}`}>
                    {msg.role === 'bot' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}

                    {msg.role === 'bot' && idx > 0 && (msg.content.includes('## ') || msg.content.includes('### ')) && !msg.is_saved && (
                      <button
                        className="save-roadmap-btn"
                        onClick={() => handleSaveRoadmap(msg)}
                        title="Save this roadmap to your profile"
                      >
                        <Bookmark size={14} /> Save to Profile
                      </button>
                    )}
                    {msg.role === 'bot' && (msg.content.includes('## ') || msg.content.includes('### ')) && msg.is_saved && (
                      <div className="saved-badge">
                        <Check size={12} /> Saved to Profile
                      </div>
                    )}
                    {/* Disclaimer — only on actual career roadmap responses */}
                    {msg.role === 'bot' && idx > 0 && (msg.content.includes('## ') || msg.content.includes('### ')) && (
                      <p className="emy-disclaimer">⚠️ EMY can make mistakes. Always verify important career information.</p>
                    )}
                  </div>

                  {/* Quick Replies / Tags */}
                  {msg.role === 'bot' && msg.suggested_replies && msg.suggested_replies.length > 0 && idx === messages.length - 1 && (
                    <div className="suggested-replies-container">
                      {msg.suggested_replies.map((reply, i) => {
                        const isSpecialButton = ['Check Last Search', 'Another Field', 'Explore All Fields', 'Help me decide'].includes(reply);
                        return (
                          <button
                            key={i}
                            className={`suggested-reply-btn ${isSpecialButton ? 'special-action-btn' : ''}`}
                            onClick={() => handleSendMessage(null, reply)}
                          >
                            {reply}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {msg.role === 'bot' && msg.real_posts && msg.real_posts.length > 0 && (
                    <div className="real-recommendations">
                      <p className="rec-title">Recommended for you:</p>
                      <div className="posts-mini-grid">
                        {msg.real_posts.map((post) => (
                          <div key={post.id} className="post-mini-card" onClick={() => openPostModal(post)}>
                            <div className="post-mini-img">
                              <img src={post.image ? getStorageUrl(post.image) : '/images/logo.png'} alt={post.title} />
                            </div>
                            <div className="post-mini-info">
                              <h4>{post.title}</h4>
                              <p>{post.institute_name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="message bot-message emy-thinking">
                  <div className="bot-avatar-mini">
                    <img src="/images/emy/emy_character.png" alt="EMY" />
                  </div>
                  <div className="thinking-text">
                    EMY is thinking<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="message bot-message error">
                  {error}
                  <button onClick={resetChat} className="reset-btn">Restart</button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="ai-advisor-footer" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading || !inputValue.trim()}>
                {loading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </>,
        document.body
      )}

      {/* Modals Bridge */}
      {selectedPost && (
        <>
          <ProgrammeInfoModal
            course={selectedPost}
            isOpen={!!selectedPost && !showApplyModal && !showInfoModal}
            onClose={closeModals}
            onApply={() => setShowApplyModal(true)}
            onMoreInfo={() => setShowInfoModal(true)}
            userRole={user?.role}
            isPremium={isPremiumActive(selectedPost)}
          />
          <ApplyNowModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            courseTitle={selectedPost?.title}
            form={{ ...applyForm, privacy_consent: applyForm.privacyConsent }}
            onChange={(e) => {
              const { name, value, checked, type } = e.target;
              if (name === 'privacy_consent') {
                setApplyForm({ ...applyForm, privacyConsent: checked });
              } else {
                setApplyForm({ ...applyForm, [name]: type === 'checkbox' ? checked : value });
              }
            }}
            onSubmit={handleApplySubmit}
            isSubmitting={applying}
            status={submissionStatus}
          />
          <MoreInfoModal
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
            course={selectedPost}
          />
        </>
      )}
    </div>
  );
};

export default FloatingAiAdvisor;
