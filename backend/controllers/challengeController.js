import Challenge from '../models/Challenge.js';
import Workout from '../models/Workout.js';
import { createNotification } from './notificationController.js';
import { updateLeaderboardPoints } from './gamificationController.js';

// Get all challenges
export const getChallenges = async (req, res) => {
  try {
    const { status = 'active', type } = req.query;
    
    const query = {};
    
    if (status === 'active') {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: new Date() };
    } else if (status === 'completed') {
      query.endDate = { $lt: new Date() };
    }

    if (type) query.type = type;

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: { challenges }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching challenges',
      error: error.message
    });
  }
};

// Create challenge
export const createChallenge = async (req, res) => {
  try {
    const challengeData = {
      ...req.body,
      createdBy: req.user._id
    };

    const challenge = await Challenge.create(challengeData);

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: { challenge }
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating challenge',
      error: error.message
    });
  }
};

// Join challenge
export const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if already joined
    const alreadyJoined = challenge.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this challenge'
      });
    }

    // Check max participants
    if (challenge.maxParticipants && 
        challenge.participants.length >= challenge.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Challenge is full'
      });
    }

    challenge.participants.push({
      user: req.user._id,
      progress: 0
    });

    await challenge.save();

    await createNotification(
      req.user._id,
      'announcement',
      '🎯 Challenge Joined!',
      `You've joined "${challenge.name}". Good luck!`
    );

    res.status(200).json({
      success: true,
      message: 'Joined challenge successfully',
      data: { challenge }
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining challenge',
      error: error.message
    });
  }
};

// Update challenge progress
export const updateProgress = async (challengeId, userId, progress) => {
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return;

    const participant = challenge.participants.find(
      p => p.user.toString() === userId.toString()
    );

    if (!participant) return;

    participant.progress = progress;

    // Sort participants by progress to update ranks
    challenge.participants.sort((a, b) => b.progress - a.progress);
    challenge.participants.forEach((p, index) => {
      p.rank = index + 1;
    });

    await challenge.save();

    // Check if goal reached
    if (progress >= challenge.goal.target) {
      await createNotification(
        userId,
        'achievement',
        '🎉 Challenge Complete!',
        `Congratulations! You've completed "${challenge.name}"!`
      );

      // Award points
      if (challenge.rewards.points) {
        await updateLeaderboardPoints(userId, challenge.rewards.points);
      }
    }
  } catch (error) {
    console.error('Update challenge progress error:', error);
  }
};

// Get user challenges
export const getUserChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user': req.user._id
    }).populate('createdBy', 'name avatar');

    const userChallenges = challenges.map(challenge => {
      const participant = challenge.participants.find(
        p => p.user.toString() === req.user._id.toString()
      );

      return {
        ...challenge.toObject(),
        userProgress: participant.progress,
        userRank: participant.rank
      };
    });

    res.status(200).json({
      success: true,
      count: userChallenges.length,
      data: { challenges: userChallenges }
    });
  } catch (error) {
    console.error('Get user challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user challenges',
      error: error.message
    });
  }
};

// Get challenge leaderboard
export const getChallengeLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findById(id)
      .populate('participants.user', 'name email avatar');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Sort participants by progress
    const leaderboard = challenge.participants
      .sort((a, b) => b.progress - a.progress)
      .map((p, index) => ({
        rank: index + 1,
        user: p.user,
        progress: p.progress,
        percentage: (p.progress / challenge.goal.target) * 100
      }));

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          name: challenge.name,
          goal: challenge.goal
        },
        leaderboard
      }
    });
  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};
