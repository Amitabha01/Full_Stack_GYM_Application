import SocialPost from '../models/SocialPost.js';
import Follow from '../models/Follow.js';
import { createNotification } from './notificationController.js';

// Get social feed
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, filter = 'all' } = req.query;
    
    let query = {};

    if (filter === 'following') {
      // Get users that current user follows
      const following = await Follow.find({ follower: req.user._id }).select('following');
      const followingIds = following.map(f => f.following);
      query.user = { $in: [...followingIds, req.user._id] };
    } else if (filter === 'my-posts') {
      query.user = req.user._id;
    }

    query.visibility = { $in: ['public', 'friends'] };

    const posts = await SocialPost.find(query)
      .populate('user', 'name email avatar')
      .populate('content.workout')
      .populate('content.achievement')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await SocialPost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feed',
      error: error.message
    });
  }
};

// Create post
export const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      user: req.user._id
    };

    const post = await SocialPost.create(postData);
    await post.populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// Like post
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const alreadyLiked = post.likes.some(
      like => like.user.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({ user: req.user._id });
      
      // Notify post owner
      if (post.user.toString() !== req.user._id.toString()) {
        await createNotification(
          post.user,
          'social',
          '❤️ New Like',
          `${req.user.name} liked your post`
        );
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: { likes: post.likes.length, liked: !alreadyLiked }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message
    });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.user._id,
      text
    });

    await post.save();
    await post.populate('comments.user', 'name avatar');

    // Notify post owner
    if (post.user.toString() !== req.user._id.toString()) {
      await createNotification(
        post.user,
        'social',
        '💬 New Comment',
        `${req.user.name} commented on your post`
      );
    }

    res.status(200).json({
      success: true,
      data: { comments: post.comments }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userId
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Unfollowed successfully',
        following: false
      });
    }

    // Follow
    await Follow.create({
      follower: req.user._id,
      following: userId
    });

    // Notify user
    await createNotification(
      userId,
      'social',
      '👥 New Follower',
      `${req.user.name} started following you`
    );

    res.status(200).json({
      success: true,
      message: 'Followed successfully',
      following: true
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message
    });
  }
};

// Get followers/following
export const getConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'followers' } = req.query;

    let connections;
    if (type === 'followers') {
      connections = await Follow.find({ following: userId })
        .populate('follower', 'name email avatar')
        .sort({ createdAt: -1 });
    } else {
      connections = await Follow.find({ follower: userId })
        .populate('following', 'name email avatar')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: connections.length,
      data: { connections }
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching connections',
      error: error.message
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};
