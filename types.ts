
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