/**
 * Channel icons — Apple/iOS-style SVG icons for each communication channel.
 * These replace generic Lucide icons for a premium, authentic look.
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * WhatsApp — Official speech-bubble + phone silhouette
 * Based on the official WhatsApp brand mark (simplified path).
 */
export function WhatsAppIcon({ size = 20, color = '#25D366', className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Mail — Apple Mail style envelope
 * Clean, minimal envelope with subtle detail.
 */
export function MailIcon({ size = 20, color = '#007AFF', className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l8.913 5.615a2 2 0 002.174 0L22 7" />
    </svg>
  );
}

/**
 * SMS / Messages — Apple Messages-style speech bubble
 */
export function SmsIcon({ size = 20, color = '#34C759', className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 5.813 2 10.5c0 2.34 1.06 4.463 2.776 6.012L3.5 21l4.34-2.078A11.28 11.28 0 0012 19.5c5.523 0 10-3.813 10-8.5S17.523 2 12 2z" />
      <circle cx="8" cy="10.5" r="1.25" fill="white" />
      <circle cx="12" cy="10.5" r="1.25" fill="white" />
      <circle cx="16" cy="10.5" r="1.25" fill="white" />
    </svg>
  );
}

/**
 * Courrier — Sealed envelope with raised flap, evoking La Poste mail.
 */
export function CourrierIcon({ size = 20, color = '#003DA5', className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 8.5l8.4 5.6a1 1 0 001.2 0L21 8.5" />
      <path d="M3 6l5.5 4.5" />
      <path d="M21 6l-5.5 4.5" />
    </svg>
  );
}

/**
 * Appel / Phone — Apple Phone app style
 */
export function PhoneIcon({ size = 20, color = '#5856D6', className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

/**
 * Map of channel type → icon component for easy lookup
 */
export const CHANNEL_ICON_MAP = {
  email: MailIcon,
  whatsapp: WhatsAppIcon,
  sms: SmsIcon,
  courrier: CourrierIcon,
  appel: PhoneIcon,
} as const;
