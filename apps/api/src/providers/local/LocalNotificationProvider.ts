import { NotificationProvider } from '@ecotransit/shared';

export class LocalNotificationProvider implements NotificationProvider {
  async sendNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    console.log(`LocalNotificationProvider: Routing notification to database. USER: ${userId}`);
    console.log(`TITLE: [${title}]`);
    console.log(`BODY: [${body}]`);
    if (data) {
      console.log(`DATA:`, data);
    }
    // In later batches, this will insert rows into a Notification database table.
  }
}
