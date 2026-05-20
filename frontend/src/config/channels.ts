import type React from 'react';
import {
  MailIcon,
  WhatsAppIcon,
  SmsIcon,
  CourrierIcon,
  PhoneIcon,
} from '../components/icons/ChannelIcons';
import type { ChannelType } from '../types/workflow';

export type ChannelIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}>;

export interface ChannelConfigField {
  key: 'subject' | 'body' | 'notes';
  label: string;
  type: 'text' | 'textarea';
}

export interface ChannelConfig {
  label: string;
  color: string;
  light: string;
  hover: string;
  icon: ChannelIconComponent;
  iconName: string;
  bgColor: string;
  maxReminders: number;
  trackingStatuses: readonly string[];
  configFields: readonly ChannelConfigField[];
}

export const CHANNEL_CONFIG: Record<ChannelType, ChannelConfig> = {
  email: {
    label: 'Email',
    color: '#007AFF',
    light: '#007AFF1A',
    hover: '#0066D6',
    icon: MailIcon,
    iconName: 'Mail',
    bgColor: 'rgba(0, 122, 255, 0.1)',
    maxReminders: 3,
    trackingStatuses: ['sent', 'opened', 'bounced', 'not_opened'],
    configFields: [
      { key: 'subject', label: 'Objet', type: 'text' },
      { key: 'body', label: 'Corps du message', type: 'textarea' },
    ],
  },
  whatsapp: {
    label: 'WhatsApp',
    color: '#25D366',
    light: '#25D3661A',
    hover: '#1DA851',
    icon: WhatsAppIcon,
    iconName: 'WhatsApp',
    bgColor: 'rgba(37, 211, 102, 0.1)',
    maxReminders: 2,
    trackingStatuses: ['sent', 'read', 'not_read'],
    configFields: [{ key: 'body', label: 'Message', type: 'textarea' }],
  },
  sms: {
    label: 'SMS',
    color: '#34C759',
    light: '#34C7591A',
    hover: '#2AA84A',
    icon: SmsIcon,
    iconName: 'Sms',
    bgColor: 'rgba(52, 199, 89, 0.1)',
    maxReminders: 2,
    trackingStatuses: ['sent', 'delivered', 'not_delivered'],
    configFields: [{ key: 'body', label: 'Message', type: 'textarea' }],
  },
  courrier: {
    label: 'Courrier',
    color: '#003DA5',
    light: '#003DA51A',
    hover: '#002D7A',
    icon: CourrierIcon,
    iconName: 'Courrier',
    bgColor: 'rgba(0, 61, 165, 0.1)',
    maxReminders: 1,
    trackingStatuses: ['sent'],
    configFields: [{ key: 'body', label: 'Contenu', type: 'textarea' }],
  },
  appel: {
    label: 'Appel',
    color: '#5856D6',
    light: '#5856D61A',
    hover: '#4A48B5',
    icon: PhoneIcon,
    iconName: 'Phone',
    bgColor: 'rgba(88, 86, 214, 0.1)',
    maxReminders: 2,
    trackingStatuses: ['called', 'answered', 'no_answer'],
    configFields: [
      { key: 'notes', label: "Notes d'appel", type: 'textarea' },
    ],
  },
};

export const CHANNEL_ORDER: readonly ChannelType[] = [
  'email',
  'whatsapp',
  'sms',
  'courrier',
  'appel',
];

export const isChannelType = (type: string): type is ChannelType =>
  type in CHANNEL_CONFIG;
