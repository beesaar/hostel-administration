const Notification = require('../models/Notification');

// @desc    Get all notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate({
        path: 'complaint',
        select: 'title status hostel room',
        populate: [
          { path: 'hostel', select: 'name' },
          { path: 'room', select: 'roomNumber' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get unread notifications and count for authenticated user
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id, isRead: false })
      .sort({ createdAt: -1 });

    res.status(200).json({
      unreadCount: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark a specific notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Security Check: Verify notification belongs to authenticated user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark all notifications for authenticated user as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
