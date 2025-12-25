"""
FraudShield AI - Notification Service
Manages user notifications and alerts

Provides:
- Real-time notifications
- Alert prioritization
- Notification channels (in-app, email, SMS)
- Notification history
"""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid


class NotificationChannel(Enum):
    """Notification delivery channels."""
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"


class NotificationPriority(Enum):
    """Notification priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class Notification:
    """
    Notification data structure.
    """
    notification_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = ""
    title: str = ""
    message: str = ""
    priority: NotificationPriority = NotificationPriority.NORMAL
    channels: List[NotificationChannel] = field(default_factory=lambda: [NotificationChannel.IN_APP])
    data: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    read: bool = False
    read_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "notification_id": self.notification_id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "priority": self.priority.value,
            "channels": [c.value for c in self.channels],
            "data": self.data,
            "created_at": self.created_at.isoformat(),
            "read": self.read,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }


class NotificationService:
    """
    Notification Service for FraudShield.

    Manages notifications to users about fraud detection events.
    """

    def __init__(self):
        """Initialize notification service."""
        self.notifications: Dict[str, List[Notification]] = {}  # user_id -> notifications
        self.handlers: Dict[NotificationChannel, Callable] = {}

    def register_handler(
        self,
        channel: NotificationChannel,
        handler: Callable[[Notification], bool]
    ):
        """
        Register notification handler for a channel.

        Args:
            channel: Notification channel
            handler: Handler function
        """
        self.handlers[channel] = handler

    async def send(self, notification: Notification) -> Dict[str, Any]:
        """
        Send notification through configured channels.

        Args:
            notification: Notification to send

        Returns:
            Delivery status for each channel
        """
        results = {}

        for channel in notification.channels:
            handler = self.handlers.get(channel)
            if handler:
                try:
                    success = await handler(notification)
                    results[channel.value] = {"success": success}
                except Exception as e:
                    results[channel.value] = {"success": False, "error": str(e)}
            else:
                # Default in-app storage
                if channel == NotificationChannel.IN_APP:
                    self._store_notification(notification)
                    results[channel.value] = {"success": True}
                else:
                    results[channel.value] = {"success": False, "error": "No handler registered"}

        return {
            "notification_id": notification.notification_id,
            "channels": results,
            "sent_at": datetime.now().isoformat(),
        }

    def _store_notification(self, notification: Notification):
        """Store notification for in-app retrieval."""
        user_id = notification.user_id
        if user_id not in self.notifications:
            self.notifications[user_id] = []
        self.notifications[user_id].insert(0, notification)

        # Limit stored notifications
        self.notifications[user_id] = self.notifications[user_id][:100]

    def get_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """
        Get notifications for a user.

        Args:
            user_id: User ID
            unread_only: Only return unread notifications
            limit: Maximum notifications to return

        Returns:
            List of notifications
        """
        notifications = self.notifications.get(user_id, [])

        if unread_only:
            notifications = [n for n in notifications if not n.read]

        return notifications[:limit]

    def mark_read(
        self,
        user_id: str,
        notification_id: str
    ) -> bool:
        """
        Mark notification as read.

        Args:
            user_id: User ID
            notification_id: Notification to mark

        Returns:
            True if notification was found and marked
        """
        notifications = self.notifications.get(user_id, [])

        for notification in notifications:
            if notification.notification_id == notification_id:
                notification.read = True
                notification.read_at = datetime.now()
                return True

        return False

    def mark_all_read(self, user_id: str) -> int:
        """
        Mark all notifications as read.

        Args:
            user_id: User ID

        Returns:
            Number of notifications marked
        """
        notifications = self.notifications.get(user_id, [])
        count = 0

        for notification in notifications:
            if not notification.read:
                notification.read = True
                notification.read_at = datetime.now()
                count += 1

        return count

    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications."""
        notifications = self.notifications.get(user_id, [])
        return sum(1 for n in notifications if not n.read)

    # Convenience methods for common fraud notifications

    def notify_fraud_detected(
        self,
        user_id: str,
        case_id: str,
        risk_level: str,
        transaction_id: str,
        amount: float
    ) -> Notification:
        """
        Create fraud detection notification.

        Args:
            user_id: User to notify
            case_id: Case ID
            risk_level: Risk level
            transaction_id: Transaction ID
            amount: Transaction amount

        Returns:
            Created notification
        """
        priority_map = {
            "low": NotificationPriority.LOW,
            "medium": NotificationPriority.NORMAL,
            "high": NotificationPriority.HIGH,
            "critical": NotificationPriority.URGENT,
        }

        channels = [NotificationChannel.IN_APP]
        if risk_level in ["high", "critical"]:
            channels.append(NotificationChannel.EMAIL)
        if risk_level == "critical":
            channels.append(NotificationChannel.SMS)

        return Notification(
            user_id=user_id,
            title=f"Fraude Potentielle Détectée - {risk_level.upper()}",
            message=f"Transaction {transaction_id} ({amount:.2f}€) signalée. Dossier: {case_id}",
            priority=priority_map.get(risk_level, NotificationPriority.NORMAL),
            channels=channels,
            data={
                "type": "fraud_detected",
                "case_id": case_id,
                "transaction_id": transaction_id,
                "risk_level": risk_level,
                "amount": amount,
            }
        )

    def notify_investigation_required(
        self,
        user_id: str,
        case_id: str,
        reason: str
    ) -> Notification:
        """Create investigation required notification."""
        return Notification(
            user_id=user_id,
            title="Investigation Requise",
            message=f"Le dossier {case_id} nécessite une investigation. Raison: {reason}",
            priority=NotificationPriority.HIGH,
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
            data={
                "type": "investigation_required",
                "case_id": case_id,
                "reason": reason,
            }
        )

    def notify_case_resolved(
        self,
        user_id: str,
        case_id: str,
        resolution: str
    ) -> Notification:
        """Create case resolved notification."""
        return Notification(
            user_id=user_id,
            title="Dossier Résolu",
            message=f"Le dossier {case_id} a été résolu. Résolution: {resolution}",
            priority=NotificationPriority.NORMAL,
            channels=[NotificationChannel.IN_APP],
            data={
                "type": "case_resolved",
                "case_id": case_id,
                "resolution": resolution,
            }
        )

    def notify_batch_complete(
        self,
        user_id: str,
        batch_id: str,
        total: int,
        flagged: int
    ) -> Notification:
        """Create batch processing complete notification."""
        return Notification(
            user_id=user_id,
            title="Traitement Batch Terminé",
            message=f"Batch {batch_id}: {total} transactions traitées, {flagged} signalées",
            priority=NotificationPriority.NORMAL,
            channels=[NotificationChannel.IN_APP],
            data={
                "type": "batch_complete",
                "batch_id": batch_id,
                "total": total,
                "flagged": flagged,
            }
        )


# Global notification service instance
_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    """Get global notification service instance."""
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
