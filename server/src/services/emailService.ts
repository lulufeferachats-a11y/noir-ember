import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

interface ReservationEmailData {
  customerName: string;
  customerEmail: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
  phone: string;
  notes?: string | null;
  reservationId: number;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
}

/**
 * Sends a confirmation email to the customer.
 */
export async function sendCustomerConfirmationEmail(data: ReservationEmailData): Promise<void> {
  if (!data.customerEmail) return;

  const displayDate = formatDate(data.reservationDate);
  const displayTime = formatTime(data.reservationTime);

  await resend.emails.send({
    from: 'reservations@resend.dev',
    to: data.customerEmail,
    subject: `Reservation confirmed — ${data.restaurantName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0A0A0A; padding: 2rem; text-align: center;">
          <h1 style="color: #C9A96E; font-weight: 300; letter-spacing: 0.1em; margin: 0;">${data.restaurantName}</h1>
        </div>
        <div style="padding: 2rem; border: 1px solid #eee;">
          <h2 style="font-weight: 400; color: #0A0A0A;">Your reservation is confirmed</h2>
          <p style="color: #555;">Dear ${data.customerName},</p>
          <p style="color: #555;">We look forward to welcoming you. Here are your reservation details:</p>
          <div style="background: #f9f9f9; padding: 1.5rem; margin: 1.5rem 0; border-left: 3px solid #C9A96E;">
            <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${displayDate}</p>
            <p style="margin: 0.5rem 0;"><strong>Time:</strong> ${displayTime}</p>
            <p style="margin: 0.5rem 0;"><strong>Guests:</strong> ${data.guests}</p>
            <p style="margin: 0.5rem 0;"><strong>Reservation #:</strong> ${data.reservationId}</p>
            ${data.notes ? `<p style="margin: 0.5rem 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          <p style="color: #555;">Need to modify or cancel? Contact us:</p>
          <p style="color: #555;">📞 ${data.restaurantPhone}<br>📍 ${data.restaurantAddress}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 2rem;">We look forward to seeing you soon.</p>
        </div>
        <div style="background: #0A0A0A; padding: 1rem; text-align: center;">
          <p style="color: #666; font-size: 0.75rem; margin: 0;">${data.restaurantName} · ${data.restaurantAddress}</p>
        </div>
      </div>
    `,
  });
}

/**
 * Sends a notification email to the restaurant when a new reservation is made.
 */
export async function sendRestaurantNotificationEmail(data: ReservationEmailData): Promise<void> {
  const restaurantEmail = process.env.RESTAURANT_EMAIL;
  if (!restaurantEmail) return;

  const displayDate = formatDate(data.reservationDate);
  const displayTime = formatTime(data.reservationTime);

  await resend.emails.send({
    from: 'reservations@resend.dev',
    to: restaurantEmail,
    subject: `New reservation — ${data.customerName} · ${displayDate} at ${displayTime}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0A0A0A; padding: 2rem; text-align: center;">
          <h1 style="color: #C9A96E; font-weight: 300; letter-spacing: 0.1em; margin: 0;">${data.restaurantName}</h1>
          <p style="color: #999; margin: 0.5rem 0 0;">New Reservation</p>
        </div>
        <div style="padding: 2rem; border: 1px solid #eee;">
          <h2 style="font-weight: 400;">New reservation received</h2>
          <div style="background: #f9f9f9; padding: 1.5rem; margin: 1.5rem 0; border-left: 3px solid #C9A96E;">
            <p style="margin: 0.5rem 0;"><strong>Name:</strong> ${data.customerName}</p>
            <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${displayDate}</p>
            <p style="margin: 0.5rem 0;"><strong>Time:</strong> ${displayTime}</p>
            <p style="margin: 0.5rem 0;"><strong>Guests:</strong> ${data.guests}</p>
            <p style="margin: 0.5rem 0;"><strong>Phone:</strong> ${data.phone}</p>
            ${data.customerEmail ? `<p style="margin: 0.5rem 0;"><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
            ${data.notes ? `<p style="margin: 0.5rem 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
            <p style="margin: 0.5rem 0;"><strong>Reservation #:</strong> ${data.reservationId}</p>
          </div>
          <p style="color: #555;">Log in to your dashboard to confirm or manage this reservation.</p>
        </div>
      </div>
    `,
  });
}