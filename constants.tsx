import React from 'react';
import { ElementType } from './types';
import { DatabaseIcon, ServerIcon, NetworkIcon, BoxIcon, WebIcon, MobileIcon, UserIcon, ApiGatewayIcon, MessageQueueIcon, CacheIcon, TextIcon, CdnIcon, AuthIcon, SearchIcon, ObjectStorageIcon } from './components/Icons';

export const ELEMENT_DIMENSIONS = {
  width: 160,
  height: 60,
};

export interface ElementConfig {
  icon: React.ReactNode;
  color: string;
  textColor: string;
  defaultName: string;
  description: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const ELEMENT_CONFIG: Record<ElementType, ElementConfig> = {
  [ElementType.User]: {
    icon: <UserIcon />,
    color: 'bg-gray-100 border-gray-300',
    textColor: 'text-gray-800',
    defaultName: 'User',
    description: 'Represents an end-user of the system, like a customer or administrator.',
  },
  [ElementType.WebClient]: {
    icon: <WebIcon />,
    color: 'bg-pink-100 border-pink-300',
    textColor: 'text-pink-800',
    defaultName: 'Web Client',
    description: 'A client application running in a web browser, like a React or Angular SPA.',
  },
  [ElementType.MobileClient]: {
    icon: <MobileIcon />,
    color: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-800',
    defaultName: 'Mobile Client',
    description: 'A native client application running on a mobile device like iOS or Android.',
  },
  [ElementType.ApiGateway]: {
    icon: <ApiGatewayIcon />,
    color: 'bg-teal-100 border-teal-300',
    textColor: 'text-teal-800',
    defaultName: 'API Gateway',
    description: 'A single entry point for all client requests, routing them to the appropriate microservice.',
  },
  [ElementType.LoadBalancer]: {
    icon: <NetworkIcon />,
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-800',
    defaultName: 'Load Balancer',
    description: 'Distributes incoming network traffic across multiple backend servers.',
  },
  [ElementType.CDN]: {
    icon: <CdnIcon />,
    color: 'bg-sky-100 border-sky-300',
    textColor: 'text-sky-800',
    defaultName: 'CDN',
    description: 'A Content Delivery Network for caching static assets close to users.',
  },
  [ElementType.Microservice]: {
    icon: <ServerIcon />,
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-800',
    defaultName: 'Microservice',
    description: 'A small, independent service that handles a specific business capability.',
  },
  [ElementType.AuthService]: {
    icon: <AuthIcon />,
    color: 'bg-slate-100 border-slate-300',
    textColor: 'text-slate-800',
    defaultName: 'Auth Service',
    description: 'Handles user authentication, authorization, and session management.',
  },
  [ElementType.MessageQueue]: {
    icon: <MessageQueueIcon />,
    color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-800',
    defaultName: 'Message Queue',
    description: 'An asynchronous communication buffer between different services (e.g., RabbitMQ, Kafka).',
  },
  [ElementType.Cache]: {
    icon: <CacheIcon />,
    color: 'bg-indigo-100 border-indigo-300',
    textColor: 'text-indigo-800',
    defaultName: 'Cache',
    description: 'An in-memory data store for fast data retrieval (e.g., Redis, Memcached).',
  },
  [ElementType.Database]: {
    icon: <DatabaseIcon />,
    color: 'bg-purple-100 border-purple-300',
    textColor: 'text-purple-800',
    defaultName: 'Database',
    description: 'A persistent data store, either SQL or NoSQL (e.g., PostgreSQL, MongoDB).',
  },
  [ElementType.Search]: {
    icon: <SearchIcon />,
    color: 'bg-amber-100 border-amber-300',
    textColor: 'text-amber-800',
    defaultName: 'Search Service',
    description: 'A dedicated service for providing fast, full-text search (e.g., Elasticsearch).',
  },
  [ElementType.ObjectStorage]: {
    icon: <ObjectStorageIcon />,
    color: 'bg-zinc-100 border-zinc-300',
    textColor: 'text-zinc-800',
    defaultName: 'Object Storage',
    description: 'A storage for large, unstructured data like images, videos, and backups (e.g., AWS S3).',
  },
  [ElementType.TextBox]: {
    icon: <TextIcon />,
    color: 'bg-transparent border-gray-500',
    textColor: 'text-gray-800',
    defaultName: 'Your text here...',
    description: 'A free-form text box for annotations, labels, and notes on your diagram.',
    defaultWidth: 160,
    defaultHeight: 80,
  },
  [ElementType.Custom]: {
    icon: <BoxIcon />,
    color: 'bg-gray-200 border-gray-400',
    textColor: 'text-gray-800',
    defaultName: 'Custom Element',
    description: 'A generic, customizable block for representing any other component in your system.',
  },
};
