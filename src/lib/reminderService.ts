interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  doctorName: string;
  visitType: string;
  status: string;
}

interface ReminderConfig {
  channels: ('sms' | 'whatsapp' | 'email')[];
  timing: {
    confirmation: number; // minutes after booking
    preVisit: number; // hours before appointment
    dayOf: number; // hours before appointment
    followUp: number; // hours after appointment
  };
  messages: {
    confirmation: string;
    preVisit: string;
    dayOf: string;
    followUp: string;
  };
}

class ReminderService {
  private defaultConfig: ReminderConfig = {
    channels: ['sms', 'whatsapp'],
    timing: {
      confirmation: 5, // 5 minutes after booking
      preVisit: 24, // 24 hours before
      dayOf: 2, // 2 hours before
      followUp: 1 // 1 hour after
    },
    messages: {
      confirmation: `🏥 Appointment Confirmed!\n\nHi {patientName},\nYour appointment is scheduled for {date} at {time} with {doctor}.\n\n📋 Token: {token}\n📍 Location: Swasth AI Clinic\n\nWe'll send reminders closer to your appointment.`,
      preVisit: `🏥 Appointment Tomorrow\n\nHi {patientName},\nYour appointment is tomorrow at {time} with {doctor}.\n\n📋 Token: {token}\n📍 Location: Swasth AI Clinic\n\nPlease arrive 15 minutes early.`,
      dayOf: `⏰ Appointment Today\n\nHi {patientName},\nYour appointment is in {hours} hours at {time}.\n\n📋 Token: {token}\n📍 Location: Swasth AI Clinic\n\nPlease bring your ID and insurance card.`,
      followUp: `📝 Follow-up Reminder\n\nHi {patientName},\nHow was your appointment today?\n\nPlease complete any requested lab work or follow-up tasks.\n\nCall us if you have questions.`
    }
  };

  scheduleReminders(appointment: Appointment, config: Partial<ReminderConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();

    // Schedule confirmation reminder (5 minutes after booking)
    const confirmationDelay = finalConfig.timing.confirmation * 60 * 1000;
    setTimeout(() => {
      this.sendReminder(appointment, 'confirmation', finalConfig);
    }, confirmationDelay);

    // Schedule pre-visit reminder (24 hours before)
    const preVisitDelay = appointmentDateTime.getTime() - (finalConfig.timing.preVisit * 60 * 60 * 1000) - now.getTime();
    if (preVisitDelay > 0) {
      setTimeout(() => {
        this.sendReminder(appointment, 'preVisit', finalConfig);
      }, preVisitDelay);
    }

    // Schedule day-of reminder (2 hours before)
    const dayOfDelay = appointmentDateTime.getTime() - (finalConfig.timing.dayOf * 60 * 60 * 1000) - now.getTime();
    if (dayOfDelay > 0) {
      setTimeout(() => {
        this.sendReminder(appointment, 'dayOf', finalConfig);
      }, dayOfDelay);
    }

    // Schedule follow-up reminder (1 hour after)
    const followUpDelay = appointmentDateTime.getTime() + (finalConfig.timing.followUp * 60 * 60 * 1000) - now.getTime();
    if (followUpDelay > 0) {
      setTimeout(() => {
        this.sendReminder(appointment, 'followUp', finalConfig);
      }, followUpDelay);
    }

    console.log(`📅 Reminders scheduled for appointment ${appointment.id}`);
  }

  private sendReminder(appointment: Appointment, type: keyof ReminderConfig['messages'], config: ReminderConfig) {
    const message = this.formatMessage(config.messages[type], appointment);
    const channels = config.channels;

    channels.forEach(channel => {
      switch (channel) {
        case 'sms':
          this.sendSMS(appointment.phone, message);
          break;
        case 'whatsapp':
          this.sendWhatsApp(appointment.phone, message);
          break;
        case 'email':
          this.sendEmail(appointment, message);
          break;
      }
    });

    // Log reminder
    this.logReminder(appointment.id, type, channels);
  }

  private formatMessage(template: string, appointment: Appointment): string {
    return template
      .replace('{patientName}', appointment.patientName)
      .replace('{date}', new Date(appointment.date).toLocaleDateString())
      .replace('{time}', appointment.time)
      .replace('{doctor}', appointment.doctorName)
      .replace('{token}', appointment.id.slice(-6).toUpperCase())
      .replace('{hours}', '2'); // For day-of reminder
  }

  private sendSMS(phone: string, message: string) {
    console.log(`📱 SMS to ${phone}: ${message}`);
    // In production, integrate with SMS service like Twilio
  }

  private sendWhatsApp(phone: string, message: string) {
    console.log(`💬 WhatsApp to ${phone}: ${message}`);
    // Use existing WhatsApp service for reminders
    // this.whatsappService.sendAppointmentReminder(phone, message);
  }

  private sendEmail(appointment: Appointment, message: string) {
    console.log(`📧 Email to patient: ${message}`);
    // In production, integrate with email service
  }

  private logReminder(appointmentId: string, type: string, channels: string[]) {
    const logEntry = {
      appointmentId,
      type,
      channels,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    const logs = JSON.parse(localStorage.getItem('reminderLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('reminderLogs', JSON.stringify(logs));
  }

  getReminderAnalytics() {
    const logs = JSON.parse(localStorage.getItem('reminderLogs') || '[]');
    const analytics = {
      totalSent: logs.length,
      byType: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
      successRate: 95 // Mock success rate
    };

    logs.forEach((log: any) => {
      analytics.byType[log.type] = (analytics.byType[log.type] || 0) + 1;
      log.channels.forEach((channel: string) => {
        analytics.byChannel[channel] = (analytics.byChannel[channel] || 0) + 1;
      });
    });

    return analytics;
  }

  // Proactive reminders for due appointments
  scheduleProactiveReminders() {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const now = new Date();

    appointments.forEach((apt: Appointment) => {
      if (apt.status === 'SCHEDULED') {
        const aptDateTime = new Date(`${apt.date}T${apt.time}`);
        const daysUntilAppointment = Math.ceil((aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Send proactive reminder if appointment is due soon and no recent reminder
        if (daysUntilAppointment <= 7 && daysUntilAppointment > 0) {
          const lastReminder = this.getLastReminderForAppointment(apt.id);
          const daysSinceLastReminder = lastReminder ?
            Math.ceil((now.getTime() - new Date(lastReminder.timestamp).getTime()) / (1000 * 60 * 60 * 24)) : 999;

          if (daysSinceLastReminder >= 3) { // Send reminder every 3 days for upcoming appointments
            this.sendProactiveReminder(apt, daysUntilAppointment);
          }
        }
      }
    });
  }

  private getLastReminderForAppointment(appointmentId: string) {
    const logs = JSON.parse(localStorage.getItem('reminderLogs') || '[]');
    const appointmentLogs = logs.filter((log: any) => log.appointmentId === appointmentId);
    return appointmentLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  private sendProactiveReminder(appointment: Appointment, daysUntil: number) {
    const message = `🏥 Upcoming Appointment\n\nHi ${appointment.patientName},\n\nYou have an appointment in ${daysUntil} day${daysUntil > 1 ? 's' : ''}:\n📅 ${new Date(appointment.date).toLocaleDateString()}\n🕐 ${appointment.time}\n👨‍⚕️ ${appointment.doctorName}\n\nNeed to reschedule? Visit our portal or call us.`;

    this.sendSMS(appointment.phone, message);
    this.sendWhatsApp(appointment.phone, message);

    this.logReminder(appointment.id, 'proactive', ['sms', 'whatsapp']);
  }
}

export const reminderService = new ReminderService();
