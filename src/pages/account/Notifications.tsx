import { useState } from 'react';
import { AccountLayout } from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, CircleDot, PackageSearch } from 'lucide-react';
import { useNotificationsQuery } from '@/store/hooks';
import { notificationsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Link } from 'wouter';

const formatTimestamp = (value?: string) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function Notifications() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, refetch } = useNotificationsQuery({ unreadOnly });
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      toast.success('Notification marked as read');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark as read');
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('All notifications marked as read');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark all as read');
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              Stay up to date with your orders and account activity
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={unreadOnly ? 'outline' : 'secondary'}
              className="rounded-full"
              onClick={() => setUnreadOnly(false)}
            >
              All
            </Button>
            <Button
              variant={unreadOnly ? 'secondary' : 'outline'}
              className="rounded-full"
              onClick={() => setUnreadOnly(true)}
            >
              Unread {unreadCount > 0 && <span className="ml-1 text-xs font-semibold">({unreadCount})</span>}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={unreadCount === 0}
              onClick={handleMarkAll}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                We'll let you know when there is an update about your orders or account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: any) => {
                const isUnread = !notification.read;
                const iconBg = isUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
                const Icon = notification.type === 'order_shipped' ? PackageSearch : notification.type === 'order_updated' ? CircleDot : Bell;

                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-4 transition-colors ${
                      isUnread ? 'border-primary/30 bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{notification.title || 'Notification'}</p>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                        </div>
                        {notification.data?.orderId && (
                          <Link href={`/account/orders/${notification.data.orderId}`}>
                            <a className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1">
                              View order updates
                              <CheckCircle2 className="w-4 h-4" />
                            </a>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{notification.type?.replace('_', ' ')}</span>
                      {isUnread ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary px-2"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
