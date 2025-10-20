'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Send, ThumbsUp, Reply, Loader2 } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  likes: any[]
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  initialCount?: number
  onUserClick?: (userId: string) => void
}

export default function CommentSection({ postId, initialCount = 0, onUserClick }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(initialCount)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments, postId])

  // Sync commentCount with initialCount when it changes
  useEffect(() => {
    setCommentCount(initialCount)
  }, [initialCount])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`)
      const data = await response.json()
      if (response.ok) {
        const fetchedComments = data.comments || []
        setComments(fetchedComments)
        setCommentCount(fetchedComments.length)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (parentId: string | null = null) => {
    if (!newComment.trim() || !session) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId
        })
      })

      if (response.ok) {
        setNewComment('')
        fetchComments() // Refresh comments
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Toggle Comments Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">
          {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
        </span>
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-3 border-t border-zinc-800">
          {/* New Comment Input */}
          {session && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                  placeholder="Write a comment..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                <button
                  onClick={() => handleSubmitComment()}
                  disabled={!newComment.trim() || submitting}
                  className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  postId={postId}
                  onUserClick={onUserClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-8 text-sm">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Individual Comment Component
function CommentItem({ 
  comment, 
  postId, 
  onUserClick 
}: { 
  comment: Comment
  postId: string
  onUserClick?: (userId: string) => void
}) {
  const { data: session } = useSession()
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim() || !session) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText,
          parentId: comment.id
        })
      })

      if (response.ok) {
        setReplyText('')
        setShowReplyInput(false)
        window.location.reload() // Simple refresh for now
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-2">
      {/* Comment */}
      <div className="flex gap-2">
        <button
          onClick={() => onUserClick?.(comment.user.id)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 hover:ring-2 hover:ring-orange-500/50 transition-all cursor-pointer"
        >
          {comment.user.name?.charAt(0).toUpperCase() || 'U'}
        </button>
        <div className="flex-1 space-y-1">
          <div className="bg-zinc-900 rounded-2xl px-4 py-2 border border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onUserClick?.(comment.user.id)}
                className="font-semibold text-sm text-white hover:text-orange-500 transition-colors cursor-pointer"
              >
                {comment.user.name || 'Anonymous'}
              </button>
              <span className="text-xs text-zinc-500">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-zinc-300">{comment.content}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 px-2">
            <button className="text-xs font-semibold text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              Like
            </button>
            {session && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs font-semibold text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyInput && session && (
        <div className="ml-10 flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleReply()
                }
              }}
              placeholder="Write a reply..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || submitting}
              className="p-1.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              onUserClick={onUserClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

