import { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaTrophy, FaDumbbell } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SocialFeed.css';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `/api/social/feed?filter=${filter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(data.data.posts);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/social/posts',
        {
          type: 'status',
          content: { text: newPost },
          visibility: 'public'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost('');
      toast.success('Post created!');
      fetchFeed();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `/api/social/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: Array(data.data.likes).fill({}), userLiked: data.data.liked }
          : post
      ));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `/api/social/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, comments: data.data.comments } : post
      ));
      
      setCommentText({ ...commentText, [postId]: '' });
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const getPostIcon = (type) => {
    switch(type) {
      case 'workout': return <FaDumbbell className="post-icon workout" />;
      case 'achievement': return <FaTrophy className="post-icon achievement" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="loading-container">Loading feed...</div>;
  }

  return (
    <div className="social-feed">
      <div className="feed-header">
        <h1>🌟 Community Feed</h1>
        <div className="feed-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Posts
          </button>
          <button 
            className={filter === 'following' ? 'active' : ''} 
            onClick={() => setFilter('following')}
          >
            Following
          </button>
          <button 
            className={filter === 'my-posts' ? 'active' : ''} 
            onClick={() => setFilter('my-posts')}
          >
            My Posts
          </button>
        </div>
      </div>

      <div className="create-post">
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="Share your fitness journey... 💪"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows="3"
          />
          <button type="submit" className="btn-primary">Post</button>
        </form>
      </div>

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Share your first workout!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <div className="user-info">
                  <div className="avatar">{post.user?.name?.[0]}</div>
                  <div>
                    <h4>{post.user?.name}</h4>
                    <span className="post-time">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {getPostIcon(post.type)}
              </div>

              <div className="post-content">
                {post.content?.text && <p>{post.content.text}</p>}
                
                {post.content?.workout && (
                  <div className="workout-preview">
                    <FaDumbbell />
                    <div>
                      <h5>{post.content.workout.title}</h5>
                      <span>{post.content.workout.caloriesBurned} calories • {post.content.workout.duration} min</span>
                    </div>
                  </div>
                )}

                {post.content?.achievement && (
                  <div className="achievement-preview">
                    <FaTrophy />
                    <span>Unlocked: {post.content.achievement.name}</span>
                  </div>
                )}
              </div>

              <div className="post-stats">
                <span>{post.likes?.length || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
              </div>

              <div className="post-actions">
                <button 
                  onClick={() => handleLike(post._id)}
                  className={post.userLiked ? 'liked' : ''}
                >
                  <FaHeart /> Like
                </button>
                <button>
                  <FaComment /> Comment
                </button>
                <button>
                  <FaShare /> Share
                </button>
              </div>

              {post.comments?.length > 0 && (
                <div className="comments-section">
                  {post.comments.slice(0, 3).map((comment, idx) => (
                    <div key={idx} className="comment">
                      <div className="avatar-small">{comment.user?.name?.[0]}</div>
                      <div>
                        <strong>{comment.user?.name}</strong>
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText({...commentText, [post._id]: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                />
                <button onClick={() => handleComment(post._id)}>Post</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
