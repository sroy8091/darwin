import React from 'react';
import { ElementType } from './types';
import { DatabaseIcon, ServerIcon, NetworkIcon, BoxIcon, WebIcon, MobileIcon, UserIcon, ApiGatewayIcon, MessageQueueIcon, CacheIcon, TextIcon } from './components/Icons';

export const ELEMENT_DIMENSIONS = {
  width: 160,
  height: 60,
};

export interface ElementConfig {
  icon: React.ReactNode;
  color: string;
  textColor: string;
  defaultName: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const ELEMENT_CONFIG: Record<ElementType, ElementConfig> = {
  [ElementType.User]: {
    icon: <UserIcon />,
    color: 'bg-gray-100 border-gray-300',
    textColor: 'text-gray-800',
    defaultName: 'User',
  },
  [ElementType.WebClient]: {
    icon: <WebIcon />,
    color: 'bg-pink-100 border-pink-300',
    textColor: 'text-pink-800',
    defaultName: 'Web Client',
  },
  [ElementType.MobileClient]: {
    icon: <MobileIcon />,
    color: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-800',
    defaultName: 'Mobile Client',
  },
  [ElementType.ApiGateway]: {
    icon: <ApiGatewayIcon />,
    color: 'bg-teal-100 border-teal-300',
    textColor: 'text-teal-800',
    defaultName: 'API Gateway',
  },
  [ElementType.LoadBalancer]: {
    icon: <NetworkIcon />,
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-800',
    defaultName: 'Load Balancer',
  },
  [ElementType.Microservice]: {
    icon: <ServerIcon />,
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-800',
    defaultName: 'Microservice',
  },
  [ElementType.MessageQueue]: {
    icon: <MessageQueueIcon />,
    color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-800',
    defaultName: 'Message Queue',
  },
  [ElementType.Cache]: {
    icon: <CacheIcon />,
    color: 'bg-indigo-100 border-indigo-300',
    textColor: 'text-indigo-800',
    defaultName: 'Cache',
  },
  [ElementType.Database]: {
    icon: <DatabaseIcon />,
    color: 'bg-purple-100 border-purple-300',
    textColor: 'text-purple-800',
    defaultName: 'Database',
  },
  [ElementType.TextBox]: {
    icon: <TextIcon />,
    color: 'bg-transparent border-gray-500',
    textColor: 'text-gray-800',
    defaultName: 'Your text here...',
    defaultWidth: 160,
    defaultHeight: 80,
  },
  [ElementType.Custom]: {
    icon: <BoxIcon />,
    color: 'bg-gray-200 border-gray-400',
    textColor: 'text-gray-800',
    defaultName: 'Custom Element',
  },
};
