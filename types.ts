
export enum ElementType {
  User = 'USER',
  WebClient = 'WEB_CLIENT',
  MobileClient = 'MOBILE_CLIENT',
  ApiGateway = 'API_GATEWAY',
  LoadBalancer = 'LOAD_BALANCER',
  Microservice = 'MICROSERVICE',
  MessageQueue = 'MESSAGE_QUEUE',
  Cache = 'CACHE',
  Database = 'DATABASE',
  TextBox = 'TEXT_BOX',
  Custom = 'CUSTOM',
  CDN = 'CDN',
  AuthService = 'AUTH_SERVICE',
  Search = 'SEARCH',
  ObjectStorage = 'OBJECT_STORAGE',
}

export interface ElementData {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ConnectorData {
  id:string;
  from: string;
  to: string;
}

export interface Point {
    x: number;
    y: number;
}

/**
 * The standard format for a diagram's data, used for
 * importing, exporting, and loading examples.
 */
export interface DiagramData {
  elements: ElementData[];
  connectors: ConnectorData[];
}

/**
 * Holds metadata for an example diagram displayed in the modal.
 */
export interface ExampleMeta {
  name: string;
  description: string;
  path: string; // The path to the example's JSON file
}
