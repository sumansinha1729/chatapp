const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    }).populate('participants', '-password')
      .populate('lastMessage');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, participantId]
      });
      await conversation.save();
      await conversation.populate('participants', '-password');
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get/Create conversation error:', error);
    res.status(500).json({ error: 'Server error with conversation' });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender', '-password')
      .populate('receiver', '-password');

    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(),
      total,
      hasMore: skip + messages.length < total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error fetching conversations' });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversationMessages,
  getUserConversations
};
