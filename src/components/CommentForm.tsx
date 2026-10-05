'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, Lock } from 'lucide-react'
import Link from 'next/link'

interface CommentFormProps {
  articleId: string
  onCommentAdded?: () => void
}

export function CommentForm({ articleId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showLoginMessage, setShowLoginMessage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setShowLoginMessage(true)
        setIsSubmitting(false)
        return
      }
      
      const commentData = {
        article_id: articleId,
        content: content.trim(),
        user_id: user.id,
        status: 'pending' // Comments need approval
      }
      
      const { error } = await supabase.from('comments').insert(commentData)
      
      if (error) throw error
      
      setContent('')
      setSubmitSuccess(true)
      
      setTimeout(() => setSubmitSuccess(false), 3000)
      
      if (onCommentAdded) onCommentAdded()
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Erreur lors de l\'envoi du commentaire')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] mb-4">
        <MessageSquare size={16} />
        Laisser un commentaire
      </h3>
      
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-700 dark:text-green-300">
          Votre commentaire a été envoyé et sera modéré avant publication.
        </div>
      )}
      
      {showLoginMessage && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-2">
            <Lock size={16} />
            <span>Connectez-vous pour publier votre commentaire</span>
          </div>
          <Link
            href="/auth/login"
            className="inline-block text-sm font-medium text-[var(--accent)] hover:opacity-90"
          >
            Se connecter
          </Link>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setShowLoginMessage(false)
          }}
          placeholder="Votre commentaire..."
          className="w-full min-h-[100px] p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-strong)] resize-none"
          required
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed dark:text-black"
        >
          {isSubmitting ? (
            'Envoi...'
          ) : (
            <>
              <Send size={14} />
              Envoyer
            </>
          )}
        </button>
      </form>
    </div>
  )
}
